/**
 * SISTEMA DE AUTONOMÍA PROGRESIVA
 * Sistema de niveles que adapta las intervenciones según el progreso del usuario
 */

export type AutonomyLevel = 'aprendiz' | 'practicante' | 'autonomo' | 'maestro';

export interface AutonomyProgress {
    currentLevel: AutonomyLevel;
    successfulInterventions: number; // Intervenciones completadas exitosamente
    ignoredInterventions: number; // Veces que ignoró (postpone)
    physicalChallengesCompleted: number;
    daysStreak: number; // Días consecutivos de uso
    ignoreButtonUnlocked: boolean; // Si puede ignorar libremente
}

export interface InterventionLevel {
    level: number;
    name: string;
    description: string;
    triggerCondition: string;
    interventionTypes: string[];
    requiredSuccesses: number; // Éxitos para desbloquear siguiente nivel
}

/**
 * Niveles de intervención progresivos
 */
export const INTERVENTION_LEVELS: InterventionLevel[] = [
    {
        level: 1,
        name: 'Pregunta Amable',
        description: 'Primera línea de defensa. Cuestionamiento suave.',
        triggerCondition: 'Primeros 1-2 intentos de distracción',
        interventionTypes: ['gentle_question', 'remind_goal'],
        requiredSuccesses: 5
    },
    {
        level: 2,
        name: 'Herramientas Activas',
        description: 'Técnicas para reenfoque rápido.',
        triggerCondition: '3-5 intentos o ansiedad detectada',
        interventionTypes: ['breathing_4_7_8', 'cognitive_reframing', 'focus_room'],
        requiredSuccesses: 10
    },
    {
        level: 3,
        name: 'Reto Físico',
        description: 'Activación corporal para romper el patrón.',
        triggerCondition: 'Después de 2 insistencias en ignorar',
        interventionTypes: ['physical_exercise', 'physical_challenge'],
        requiredSuccesses: 15
    },
    {
        level: 4,
        name: 'Intervención Profunda',
        description: 'Conversación estructurada con IA.',
        triggerCondition: 'Overwhelm o crisis emocional',
        interventionTypes: ['ai_therapy_brief', 'emotional_check_in'],
        requiredSuccesses: 20
    }
];

/**
 * Calcula el nivel de autonomía según el progreso
 */
export function calculateAutonomyLevel(progress: AutonomyProgress): AutonomyLevel {
    const { successfulInterventions, ignoredInterventions, daysStreak } = progress;

    // Maestro: 20+ intervenciones exitosas, menos de 5 ignoradas, 14+ días de racha
    if (successfulInterventions >= 20 && ignoredInterventions < 5 && daysStreak >= 14) {
        return 'maestro';
    }

    // Autónomo: 15+ intervenciones exitosas, menos de 10 ignoradas, 7+ días
    if (successfulInterventions >= 15 && ignoredInterventions < 10 && daysStreak >= 7) {
        return 'autonomo';
    }

    // Practicante: 5+ intervenciones exitosas, 3+ días
    if (successfulInterventions >= 5 && daysStreak >= 3) {
        return 'practicante';
    }

    // Aprendiz: Default para nuevos usuarios
    return 'aprendiz';
}

/**
 * Determina si el botón "Ignorar" debe estar desbloqueado
 */
export function shouldUnlockIgnoreButton(progress: AutonomyProgress): boolean {
    // Desbloquear después de 7 días consecutivos y 10 intervenciones exitosas
    return progress.daysStreak >= 7 && progress.successfulInterventions >= 10;
}

/**
 * Obtiene el nivel de intervención apropiado
 */
export function getInterventionLevel(attemptCount: number, insistCount: number): InterventionLevel {
    if (insistCount >= 2) {
        return INTERVENTION_LEVELS[2]; // Reto Físico
    }

    if (attemptCount >= 5) {
        return INTERVENTION_LEVELS[3]; // Intervención Profunda
    }

    if (attemptCount >= 3) {
        return INTERVENTION_LEVELS[1]; // Herramientas Activas
    }

    return INTERVENTION_LEVELS[0]; // Pregunta Amable
}

/**
 * Mensajes de feedback según nivel de autonomía
 */
export const AUTONOMY_MESSAGES = {
    aprendiz: {
        welcome: '¡Bienvenido! Estás en modo Aprendiz. Te guiaré paso a paso.',
        progress: 'Vas bien. Completa 5 intervenciones exitosas para avanzar.',
        unlock: 'El botón "Ignorar" se desbloqueará cuando demuestres autonomía.'
    },
    practicante: {
        welcome: '¡Ascendiste a Practicante! Ya conoces las herramientas.',
        progress: 'Sigue así. 10 intervenciones más para ser Autónomo.',
        unlock: 'Mantén tu racha de 7 días para desbloquear "Ignorar".'
    },
    autonomo: {
        welcome: '¡Nivel Autónomo alcanzado! Tienes más control.',
        progress: 'Casi eres Maestro. 5 intervenciones exitosas más.',
        unlock: '✓ Botón "Ignorar" desbloqueado. Úsalo con sabiduría.'
    },
    maestro: {
        welcome: '🏆 ¡Maestro del Enfoque! Eres un ejemplo.',
        progress: 'Mantén tu excelencia. Tú controlas tu destino.',
        unlock: '✓ Control total. Tu disciplina es tu guía.'
    }
};
