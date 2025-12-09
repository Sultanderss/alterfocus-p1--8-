import { InterventionType } from '../types';

/**
 * Tipos de patrones detectados en el comportamiento del usuario.
 */
export type DetectionPattern =
    | 'compulsive_click'    // >5 intentos en 10 min
    | 'early_quit'          // <15 min de sesión
    | 'late_fatigue'        // >120 min de sesión
    | 'social_emergency'    // WhatsApp, Telegram, etc.
    | 'circadian_slump'     // 14:00 - 16:00
    | 'circadian_pressure'  // 23:00 - 01:00
    | 'morning_flow'        // 09:00 - 11:00
    | 'urgent_task'         // tarea urgente detectada
    | 'neutral';

/**
 * Niveles de intervención que la aplicación puede mostrar.
 */
export type InterventionLevel =
    | 'gentle_toast'        // Nivel 1: Notificación sutil
    | 'contextual_modal'    // Nivel 2: Modal con opciones
    | 'firm_intervention'   // Nivel 3: Modal sin opción de ignorar
    | 'mandatory_task'      // Nivel 4: Tarea urgente obligatoria
    | 'crisis_sos';         // Nivel 5: Emergencia

export interface InterventionDecision {
    level: InterventionLevel;
    suggestedTool: InterventionType;
    reason: string;
    pattern: DetectionPattern;
}

/**
 * Motor de lógica que analiza el contexto y devuelve la decisión de intervención.
 */
export const analyzeContext = (
    attemptCount: number,
    sessionDurationMinutes: number,
    domain: string,
    hour: number = new Date().getHours()
): InterventionDecision => {
    // -----------------------------------------------------------------
    // 1️⃣ Detectar patrón
    // -----------------------------------------------------------------
    let pattern: DetectionPattern = 'neutral';
    const isSocial = ['whatsapp', 'telegram', 'discord', 'messenger'].some(d => domain.includes(d));

    if (isSocial) {
        pattern = 'social_emergency';
    } else if (attemptCount >= 5) {
        pattern = 'compulsive_click';
    } else if (sessionDurationMinutes < 15) {
        pattern = 'early_quit';
    } else if (sessionDurationMinutes > 120) {
        pattern = 'late_fatigue';
    } else if (hour >= 14 && hour < 16) {
        pattern = 'circadian_slump';
    } else if (hour >= 23 || hour < 1) {
        pattern = 'circadian_pressure';
    } else if (hour >= 9 && hour < 11) {
        pattern = 'morning_flow';
    }

    // Detección de tarea urgente (ejemplo: ventana de deadline)
    if (attemptCount >= 3 && hour >= 14 && hour <= 16) {
        pattern = 'urgent_task';
    }

    // -----------------------------------------------------------------
    // 2️⃣ Decidir nivel de intervención - MUCHO MENOS AGRESIVO
    // -----------------------------------------------------------------
    let level: InterventionLevel = 'gentle_toast'; // ⭐ SIEMPRE EMPEZAR SUAVE

    // ESCALAMIENTO GRADUAL - NO CRISIS por intentos de distracción
    if (pattern === 'urgent_task') {
        level = 'mandatory_task';
    } else if (attemptCount >= 8 && attemptCount < 15) {
        // Muchos intentos = modal firme pero NO crisis
        level = 'firm_intervention';
    } else if (attemptCount >= 4) {
        // 4-7 intentos = modal contextual con herramientas
        level = 'contextual_modal';
    }
    // 1-3 intentos = gentle_toast (default)

    // ⚠️ CRISIS_SOS SOLO para casos EXTREMOS:
    // - 20+ intentos en una sesión (comportamiento muy inusual)
    // - O combinación de fatiga extrema + muchos intentos
    // Esto NUNCA debería dispararse por procrastinación normal
    if (attemptCount >= 20 || (pattern === 'late_fatigue' && attemptCount >= 15)) {
        level = 'crisis_sos';
    }
    // NOTA: La pantalla de crisis también es accesible manualmente desde el botón "Crisis" del dashboard

    // -----------------------------------------------------------------
    // 3️⃣ Seleccionar herramienta y mensaje
    // -----------------------------------------------------------------
    let tool: InterventionType = 'breathing_4_7_8';
    let reason = 'Detectamos una interrupción.';

    switch (pattern) {
        case 'circadian_slump':
            tool = 'physical_exercise';
            reason = 'Es el bajón de las 2pm. Tu cuerpo pide energía, no Instagram.';
            break;
        case 'circadian_pressure':
            tool = 'breathing_4_7_8';
            reason = 'Es tarde. La presión del deadline te está bloqueando.';
            break;
        case 'compulsive_click':
            tool = 'cognitive_reframing';
            reason = 'Estás clickeando compulsivamente. Paremos 1 minuto.';
            break;
        case 'early_quit':
            tool = 'breathing_4_7_8';
            reason = 'Apenas empezaste. Prueba respirar 4‑7‑8 durante 2 minutos.';
            break;
        case 'social_emergency':
            tool = 'cognitive_reframing';
            reason = 'Las redes sociales están diseñadas para atraparte ahora.';
            break;
        case 'urgent_task':
            tool = 'breathing_4_7_8';
            reason = 'Tienes una tarea urgente que necesita tu atención inmediata.';
            break;
        default:
            tool = 'breathing_4_7_8';
            reason = '¿Es esto urgente o es una fuga de dopamina?';
    }

    return { level, suggestedTool: tool, reason, pattern };
};
