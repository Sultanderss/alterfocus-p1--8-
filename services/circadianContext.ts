/**
 * CIRCADIAN CONTEXT ENGINE
 * Analyzes time-of-day patterns to adapt intervention messages
 * 
 * Based on research on circadian rhythms and cognitive performance:
 * - Morning Flow (9-11h): High alertness, good for deep work
 * - Circadian Slump (14-16h): Post-lunch dip, energy drops
 * - Late Fatigue (>120min session): Mental exhaustion
 * - Night Pressure (23-01h): Deadline stress, poor decisions
 */

export type CircadianPattern =
    | 'morning_flow'       // 09:00 - 11:00 - Peak productivity
    | 'midday_active'      // 11:00 - 14:00 - Active but declining
    | 'circadian_slump'    // 14:00 - 16:00 - Post-lunch dip
    | 'afternoon_recovery' // 16:00 - 18:00 - Second wind
    | 'evening_wind_down'  // 18:00 - 21:00 - Declining energy
    | 'night_pressure'     // 21:00 - 01:00 - Deadline stress
    | 'late_night'         // 01:00 - 06:00 - Should be sleeping
    | 'early_morning';     // 06:00 - 09:00 - Warming up

export interface CircadianContext {
    pattern: CircadianPattern;
    message: string;
    suggestedDuration: number; // Minutes for suggested session
    energyLevel: 'high' | 'medium' | 'low' | 'very_low';
    interventionTone: 'encouraging' | 'gentle' | 'firm' | 'supportive';
}

/**
 * Analyzes current time and session duration to determine circadian context
 */
export function analyzeCircadianContext(
    hour: number = new Date().getHours(),
    sessionDurationMinutes: number = 0
): CircadianContext {

    // Late fatigue overrides time-based patterns
    if (sessionDurationMinutes > 120) {
        return {
            pattern: 'circadian_slump', // Using slump as fatigue indicator
            message: `Llevas ${Math.floor(sessionDurationMinutes / 60)}+ horas trabajando. Tu cerebro necesita un descanso real.`,
            suggestedDuration: 10,
            energyLevel: 'very_low',
            interventionTone: 'supportive'
        };
    }

    // Time-based patterns
    if (hour >= 9 && hour < 11) {
        return {
            pattern: 'morning_flow',
            message: 'Es tu hora pico de productividad. ¿Seguro quieres perder este momento?',
            suggestedDuration: 25,
            energyLevel: 'high',
            interventionTone: 'encouraging'
        };
    }

    if (hour >= 11 && hour < 14) {
        return {
            pattern: 'midday_active',
            message: 'Buen momento para avanzar. No dejes que la distracción rompa tu ritmo.',
            suggestedDuration: 25,
            energyLevel: 'medium',
            interventionTone: 'gentle'
        };
    }

    if (hour >= 14 && hour < 16) {
        return {
            pattern: 'circadian_slump',
            message: 'Es el bajón de las 2pm. Tu cuerpo pide energía, no dopamina rápida.',
            suggestedDuration: 15,
            energyLevel: 'low',
            interventionTone: 'firm'
        };
    }

    if (hour >= 16 && hour < 18) {
        return {
            pattern: 'afternoon_recovery',
            message: 'Tu segundo viento está llegando. Aprovecha la energía renovada.',
            suggestedDuration: 25,
            energyLevel: 'medium',
            interventionTone: 'encouraging'
        };
    }

    if (hour >= 18 && hour < 21) {
        return {
            pattern: 'evening_wind_down',
            message: 'La energía baja naturalmente. Sesiones cortas son más efectivas ahora.',
            suggestedDuration: 15,
            energyLevel: 'low',
            interventionTone: 'gentle'
        };
    }

    if (hour >= 21 || hour < 1) {
        return {
            pattern: 'night_pressure',
            message: 'Es tarde. La presión del deadline puede nublar tu juicio.',
            suggestedDuration: 10,
            energyLevel: 'very_low',
            interventionTone: 'supportive'
        };
    }

    if (hour >= 1 && hour < 6) {
        return {
            pattern: 'late_night',
            message: 'Tu cerebro necesita descanso. Dormir es más productivo que seguir.',
            suggestedDuration: 0,
            energyLevel: 'very_low',
            interventionTone: 'supportive'
        };
    }

    // Early morning (6-9)
    return {
        pattern: 'early_morning',
        message: 'Estás calentando motores. Un buen inicio marca el día.',
        suggestedDuration: 15,
        energyLevel: 'medium',
        interventionTone: 'encouraging'
    };
}

/**
 * Get intervention intensity based on circadian context
 */
export function getInterventionIntensity(context: CircadianContext): 'soft' | 'medium' | 'hard' {
    switch (context.energyLevel) {
        case 'high':
            return 'soft'; // High energy = gentle nudge is enough
        case 'medium':
            return 'medium';
        case 'low':
        case 'very_low':
            return 'hard'; // Low energy = need stronger intervention
    }
}

/**
 * Get circadian-aware message for intervention
 */
export function getCircadianMessage(
    pattern: CircadianPattern,
    attemptCount: number
): string {
    const messages: Record<CircadianPattern, string[]> = {
        morning_flow: [
            '🌅 Tu mejor hora está pasando. ¿Seguro quieres desperdiciarla?',
            '☀️ Flow matutino activo. Una distracción ahora cuesta el doble.',
            '🧠 Tu cerebro está en su pico. No lo sabotees.'
        ],
        midday_active: [
            '📈 Buen ritmo hasta ahora. No lo rompas.',
            '⚡ Energía disponible. Úsala para avanzar.',
            '🎯 El impulso está de tu lado.'
        ],
        circadian_slump: [
            '😴 Son las 2pm. Tu cuerpo pide energía, no TikTok.',
            '🍽️ El bajón post-almuerzo te está afectando.',
            '💡 Tu energía está baja. Una distracción la bajará más.'
        ],
        afternoon_recovery: [
            '🔋 Tu segundo viento está llegando. Aprovéchalo.',
            '📊 La tarde puede ser productiva. Depende de ti.',
            '⏰ Aún hay tiempo. Cada minuto cuenta.'
        ],
        evening_wind_down: [
            '🌆 La energía baja naturalmente. Sesiones cortas funcionan mejor.',
            '🏠 Es hora de ir cerrando. ¿Último sprint?',
            '✨ Termina fuerte. Mañana lo agradecerás.'
        ],
        night_pressure: [
            '🌙 Es tarde. Las decisiones nocturnas suelen ser malas.',
            '⏰ Deadline cerca? La presión no te ayuda a pensar.',
            '💤 Descansar podría ser más productivo que seguir.'
        ],
        late_night: [
            '🛏️ Tu cerebro necesita descanso. En serio.',
            '😵 Trasnochar reduce tu productividad mañana en 40%.',
            '🧠 Dormir consolida la memoria. Esto puede esperar.'
        ],
        early_morning: [
            '🌄 Estás calentando. Un buen inicio marca el día.',
            '☕ Primer café? Usa la energía para algo que importe.',
            '📝 Define tu objetivo antes de distraerte.'
        ]
    };

    const patternMessages = messages[pattern];
    const index = Math.min(attemptCount - 1, patternMessages.length - 1);
    return patternMessages[Math.max(0, index)];
}

export default {
    analyzeCircadianContext,
    getInterventionIntensity,
    getCircadianMessage
};
