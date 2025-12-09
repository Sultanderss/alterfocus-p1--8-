// ════════════════════════════════════════════
// FILE PARSER - Gemini Vision + Excel + OCR
// ════════════════════════════════════════════

import Tesseract from 'tesseract.js';
import * as XLSX from 'xlsx';

export interface ParsedEvent {
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    tipo: 'clase' | 'entrega' | 'estudio' | 'descanso' | 'examen';
    priority: 'rojo' | 'amarillo' | 'verde';
    source: 'upload';
}

// ════════════════════════════════════════════
// UTILITY: Convert File to Base64
// ════════════════════════════════════════════

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ════════════════════════════════════════════
// GEMINI VISION - Parse Screenshot/Image
// ════════════════════════════════════════════

export async function parseWithGeminiVision(base64Data: string, mimeType: string): Promise<ParsedEvent[]> {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key no configurada. Agrega VITE_GEMINI_API_KEY a tu .env');
    }

    // Extraer datos base64 sin prefijo data:image/...;base64,
    const base64Only = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            text: `Eres un experto en leer calendarios académicos universitarios.

Extrae TODOS los eventos visibles en esta imagen. Para cada evento devuelve un objeto JSON con:
{
  "titulo": "nombre de la materia o evento",
  "fecha_inicio": "2025-12-09T09:00:00",
  "fecha_fin": "2025-12-09T11:00:00",
  "tipo": "clase|entrega|examen|estudio|descanso",
  "descripcion": "detalles adicionales si los hay",
  "priority": "rojo|amarillo|verde"
}

Reglas:
- Si es un examen o entrega próxima (menos de 3 días): priority = "rojo"
- Si es una tarea o entrega con más tiempo: priority = "amarillo"
- Clases regulares: priority = "verde"
- Para tipo: usa "clase" para clases, "entrega" para tareas/assignments, "examen" para quizzes/parciales/finals

Responde SOLO con un array JSON, sin markdown ni explicaciones.
Si no hay eventos visibles: []`
                        },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Only
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 4096
                }
            })
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || response.status}`);
    }

    const result = await response.json();

    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('No content in Gemini response');
    }

    const textResponse = result.candidates[0].content.parts[0].text;

    // Limpiar respuesta de markdown
    const cleanedText = textResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

    try {
        const parsed = JSON.parse(cleanedText);

        if (!Array.isArray(parsed)) {
            return Array.isArray(parsed.events) ? parsed.events : [parsed];
        }

        return parsed.filter((e: any) => e && e.titulo).map((e: any) => ({
            ...e,
            source: 'upload' as const
        }));
    } catch (parseError) {
        console.error('JSON parse error:', cleanedText);
        throw new Error('La IA no pudo procesar el calendario. Intenta con mayor calidad de imagen o usa Excel.');
    }
}

// ════════════════════════════════════════════
// EXCEL PARSER - SheetJS
// ════════════════════════════════════════════

export async function parseExcelFile(file: File): Promise<ParsedEvent[]> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer));
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) throw new Error('El archivo Excel está vacío');

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) throw new Error('No se encontraron datos en el Excel');

    const events = rows.map((row: any) => {
        // Detectar columnas de título
        const titulo = row['Materia'] || row['Título'] || row['Evento'] || row['Nombre'] || row['Subject'] || row['Title'] || Object.values(row)[0];

        // Detectar columnas de fecha
        const fechaInicio = row['Fecha Inicio'] || row['Fecha'] || row['Inicio'] || row['Start'] || row['Start Date'] || row['Date'];
        const fechaFin = row['Fecha Fin'] || row['Fin'] || row['End'] || row['End Date'];

        if (!titulo || !fechaInicio) return null;

        const startDate = parseFlexibleDate(fechaInicio);
        const endDate = fechaFin ? parseFlexibleDate(fechaFin) : new Date(startDate.getTime() + 60 * 60 * 1000);

        if (isNaN(startDate.getTime())) {
            console.warn('Fecha inválida:', fechaInicio);
            return null;
        }

        return {
            titulo: String(titulo).trim(),
            fecha_inicio: startDate.toISOString(),
            fecha_fin: endDate.toISOString(),
            tipo: classifyEventType(String(titulo)),
            descripcion: String(row['Descripción'] || row['Notas'] || row['Description'] || row['Notes'] || '').trim(),
            priority: calculatePriority(startDate),
            source: 'upload' as const
        };
    }).filter(Boolean) as ParsedEvent[];

    if (events.length === 0) {
        throw new Error('No se encontraron eventos válidos en el Excel. Verifica que tenga columnas como "Materia", "Fecha", etc.');
    }

    return events;
}

// ════════════════════════════════════════════
// OCR FALLBACK - Tesseract.js
// ════════════════════════════════════════════

export async function parseImageWithOCR(
    file: File,
    onProgress?: (progress: number) => void
): Promise<string> {
    const { data: { text } } = await Tesseract.recognize(file, 'spa', {
        logger: (m) => {
            if (m.progress && onProgress) {
                onProgress(Math.round(m.progress * 100));
            }
        }
    });

    if (!text || text.trim().length < 10) {
        throw new Error('No se pudo leer texto en la imagen. Intenta con mejor calidad.');
    }

    return text;
}

// ════════════════════════════════════════════
// HELPER: Parse flexible date formats
// ════════════════════════════════════════════

function parseFlexibleDate(dateInput: any): Date {
    // Si ya es Date
    if (dateInput instanceof Date) return dateInput;

    // Si es número (Excel serial date)
    if (typeof dateInput === 'number') {
        // Excel serial date: días desde 1900-01-01
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + dateInput * 24 * 60 * 60 * 1000);
    }

    // Si es string
    if (typeof dateInput === 'string') {
        // Intentar parsear directamente
        const directParse = new Date(dateInput);
        if (!isNaN(directParse.getTime())) return directParse;

        // Intentar formato DD/MM/YYYY o DD-MM-YYYY
        const ddmmyyyy = dateInput.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (ddmmyyyy) {
            return new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
        }

        // Intentar formato YYYY-MM-DD
        const yyyymmdd = dateInput.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
        if (yyyymmdd) {
            return new Date(parseInt(yyyymmdd[1]), parseInt(yyyymmdd[2]) - 1, parseInt(yyyymmdd[3]));
        }
    }

    // Fallback: retornar fecha inválida
    return new Date('invalid');
}

// ════════════════════════════════════════════
// HELPER: Classify event type from title
// ════════════════════════════════════════════

function classifyEventType(title: string): 'clase' | 'entrega' | 'examen' | 'estudio' | 'descanso' {
    const lower = title.toLowerCase();

    // Entregas
    if (/entrega|trabajo|tarea|assignment|homework|proyecto|project|actividad/i.test(lower)) {
        return 'entrega';
    }

    // Exámenes
    if (/examen|parcial|quiz|test|final|evaluación|eval/i.test(lower)) {
        return 'examen';
    }

    // Clases
    if (/clase|lecture|sesión|session|class|cátedra|teoría|práctica|lab|laboratorio|taller/i.test(lower)) {
        return 'clase';
    }

    // Estudio
    if (/estudio|study|repaso|review|preparar|prep/i.test(lower)) {
        return 'estudio';
    }

    // Por defecto: clase
    return 'clase';
}

// ════════════════════════════════════════════
// HELPER: Calculate priority based on deadline
// ════════════════════════════════════════════

function calculatePriority(date: Date): 'rojo' | 'amarillo' | 'verde' {
    const hoursLeft = (date.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursLeft < 24) return 'rojo';      // Menos de 24h
    if (hoursLeft < 72) return 'amarillo';  // Menos de 3 días
    return 'verde';                          // Más de 3 días
}

// ════════════════════════════════════════════
// MAIN: Smart file parser with fallback
// ════════════════════════════════════════════

export async function parseScheduleFile(
    file: File,
    onProgress?: (status: string, progress?: number) => void
): Promise<ParsedEvent[]> {
    const isImage = file.type.startsWith('image/');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isImage && !isExcel) {
        throw new Error('Formato no soportado. Usa JPG, PNG o Excel (.xlsx)');
    }

    try {
        if (isExcel) {
            onProgress?.('Leyendo Excel...');
            return await parseExcelFile(file);
        }

        // Imagen: intentar Gemini Vision primero
        onProgress?.('Analizando imagen con IA...');
        const base64 = await fileToBase64(file);

        try {
            return await parseWithGeminiVision(base64, file.type);
        } catch (geminiError) {
            console.warn('Gemini Vision falló, intentando OCR...', geminiError);

            // Fallback a OCR
            onProgress?.('Usando OCR como respaldo...', 0);
            const text = await parseImageWithOCR(file, (progress) => {
                onProgress?.(`OCR: ${progress}%`, progress);
            });

            // Aquí podrías enviar el texto a Gemini de nuevo
            console.log('OCR text extracted:', text.substring(0, 200));
            throw new Error('OCR completado pero parsing manual no implementado. Sube un Excel o imagen más clara.');
        }
    } catch (error: any) {
        throw new Error(error.message || 'Error procesando archivo');
    }
}
