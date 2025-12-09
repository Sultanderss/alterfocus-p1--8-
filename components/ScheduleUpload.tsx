import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileImage, FileSpreadsheet, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { parseScheduleFile, ParsedEvent } from '../lib/fileParser';
import { addScheduleEvent, getLocalUserId } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";
import { Brain, Sparkles } from 'lucide-react';

interface ScheduleUploadProps {
    onUploadComplete: (count: number) => void;
    onClose?: () => void;
}

export default function ScheduleUpload({ onUploadComplete, onClose }: ScheduleUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<ParsedEvent[] | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<{ message: string, tone: 'warning' | 'encouraging' | 'neutral' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleFile = async (file: File) => {
        setUploading(true);
        setProgress('Procesando archivo...');
        setError('');
        setPreview(null);

        try {
            const events = await parseScheduleFile(file, (status, prog) => {
                setProgress(status);
            });

            if (!events || events.length === 0) {
                throw new Error('No se detectaron eventos en el archivo.');
            }

            setPreview(events);
            setProgress(`${events.length} eventos detectados`);
            setUploading(false);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Error procesando archivo');
            setProgress('');
            setUploading(false);
        }
    };

    const confirmUpload = async () => {
        if (!preview) return;

        setUploading(true);
        setProgress('Guardando eventos...');

        try {
            const userId = getLocalUserId();
            let savedCount = 0;

            // 1. Save Events
            for (const event of preview) {
                try {
                    await addScheduleEvent(userId, {
                        eventTitle: event.titulo,
                        description: event.descripcion,
                        startTime: new Date(event.fecha_inicio),
                        endTime: new Date(event.fecha_fin),
                        type: event.tipo,
                        priority: event.priority,
                        source: 'upload',
                    });
                    savedCount++;
                } catch (saveError) {
                    console.error('Error saving event:', event, saveError);
                }
            }

            // 2. Generate AI Analysis
            setProgress('Analizando impacto en tu rutina...');
            try {
                const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
                const prompt = `Analiza estos eventos académicos recién importados y dame un mensaje MUY BREVE (max 2 frases) dirigido al estudiante.
                Eventos: ${JSON.stringify(preview.slice(0, 10).map(e => ({ t: e.titulo, p: e.priority, d: e.fecha_inicio })))}
                
                Si hay exámenes o entregas rojas, sé estricto y sugiere activar modo Flip Phone.
                Si es suave, sé motivador.
                Responde en JSON: { "message": "Texto aquí", "tone": "warning" | "encouraging" | "neutral" }`;

                const response = await ai.models.generateContent({
                    model: 'gemini-1.5-flash',
                    contents: prompt
                });

                const text = response.text?.replace(/```json\n?|```/g, '').trim() || '{}';
                const analysis = JSON.parse(text);
                setAiAnalysis(analysis);
            } catch (e) {
                console.error("AI Analysis failed", e);
                // Fallback analysis
                setAiAnalysis({ message: "Calendario importado. Prepárate para una semana productiva.", tone: "neutral" });
            }

            setProgress('');
            setUploading(false);
            // Don't close yet, show analysis
        } catch (err: any) {
            setError(err.message || 'Error guardando eventos');
            setUploading(false);
        }
    };

    const handleFinalClose = () => {
        if (preview) onUploadComplete(preview.length);
        if (onClose) onClose();
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'rojo': return 'text-red-400 bg-red-500/20';
            case 'amarillo': return 'text-amber-400 bg-amber-500/20';
            case 'verde': return 'text-emerald-400 bg-emerald-500/20';
            default: return 'text-slate-400 bg-slate-500/20';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'clase': return '📚';
            case 'entrega': return '📝';
            case 'examen': return '📋';
            case 'estudio': return '💡';
            default: return '📅';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-b from-slate-800 to-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-white/10 overflow-hidden max-h-[85vh] flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white">Subir Calendario</h2>
                        <p className="text-xs text-slate-400">Screenshot, foto o Excel</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {/* Success / Analysis State */}
                    {aiAnalysis ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-6 py-6">
                            <div className={`p-4 rounded-full ${aiAnalysis.tone === 'warning' ? 'bg-amber-500/20 text-amber-500' : 'bg-purple-500/20 text-purple-500'}`}>
                                <Brain size={48} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">¡Entendido!</h3>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 max-w-sm mx-auto">
                                    <p className="text-slate-300 italic">"{aiAnalysis.message}"</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Sparkles size={12} className="text-purple-400" />
                                <span>AlterFocus ajustará tus intervenciones automáticamente.</span>
                            </div>
                            <button
                                onClick={handleFinalClose}
                                className="w-full max-w-xs bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                            >
                                Continuar
                            </button>
                        </div>
                    ) : preview && !uploading ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-400 mb-4">
                                <Check size={20} />
                                <span className="font-medium">{preview.length} eventos detectados</span>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {preview.map((event, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-3"
                                    >
                                        <span className="text-xl">{getTypeIcon(event.tipo)}</span>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-medium text-sm truncate">{event.titulo}</h4>
                                            <p className="text-slate-500 text-xs">
                                                {new Date(event.fecha_inicio).toLocaleDateString('es-CO', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getPriorityColor(event.priority)}`}>
                                            {event.priority.toUpperCase()}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setPreview(null)}
                                    className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmUpload}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Upload Zone */}
                            <input
                                type="file"
                                accept="image/*,.xlsx,.xls"
                                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                className="hidden"
                                ref={fileInputRef}
                                disabled={uploading}
                            />

                            <motion.div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                whileHover={!uploading ? { scale: 1.01 } : {}}
                                whileTap={!uploading ? { scale: 0.99 } : {}}
                                className={`relative p-8 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${uploading
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : isDragging
                                        ? 'border-emerald-500 bg-emerald-500/10'
                                        : 'border-slate-600 hover:border-slate-500 hover:bg-white/5'
                                    }`}
                            >
                                {uploading ? (
                                    <div className="flex flex-col items-center">
                                        <Loader2 size={48} className="text-blue-400 animate-spin mb-4" />
                                        <p className="text-white font-medium">{progress}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mb-4">
                                            <Upload size={32} className="text-emerald-400" />
                                        </div>
                                        <p className="text-white font-medium mb-1">Click o arrastra tu archivo</p>
                                        <p className="text-slate-500 text-sm">JPG, PNG, Excel (.xlsx)</p>
                                    </div>
                                )}
                            </motion.div>

                            {/* File type hints */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <FileImage size={20} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">Screenshot</p>
                                        <p className="text-slate-500 text-xs">Calendario Outlook, Brightspace</p>
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                        <FileSpreadsheet size={20} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">Excel</p>
                                        <p className="text-slate-500 text-xs">Lista de entregas</p>
                                    </div>
                                </div>
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
                                    >
                                        <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-red-400 font-medium text-sm">Error</p>
                                            <p className="text-red-300/70 text-xs">{error}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
