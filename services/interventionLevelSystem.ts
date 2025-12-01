// AlterFocus - Intervention Level System Types
// Based on the 6-level progressive intervention model

export type InterventionLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type UserProfile =
    | 'evitador'      // Procrastinator who avoids starting
    | 'impulsivo'     // Impulsive, reacts quickly to distractions
    | 'perfeccionista'// Perfectionist, paralysis by analysis
    | 'neutro';       // Default/neutral profile

export interface InterventionState {
    currentLevel: InterventionLevel;
    userProfile: UserProfile;
    successStreak: number;      // Consecutive successful interventions
    failureStreak: number;      // Consecutive failures
    lastLevelChange: string;    // ISO timestamp
    dailyProgressIndex: number; // 0-100 score
    interventionHistory: InterventionRecord[];
}

export interface InterventionRecord {
    timestamp: string;
    level: InterventionLevel;
    action: string;
    success: boolean;
    emotionalState?: string;
    timeToComplete?: number; // seconds
}

export interface LevelConfig {
    level: InterventionLevel;
    name: string;
    description: string;
    escalationThreshold: number;  // failures needed to escalate
    deescalationThreshold: number; // successes needed to de-escalate
    allowedActions: string[];
    blockingIntensity: 'none' | 'soft' | 'medium' | 'hard' | 'emergency';
}

export const LEVEL_CONFIGS: Record<InterventionLevel, LevelConfig> = {
    0: {
        level: 0,
        name: 'Recordatorio Inteligente',
        description: 'Monitoreo proactivo con notificaciones empáticas',
        escalationThreshold: 3,
        deescalationThreshold: 0,
        allowedActions: ['reagendar', 'retomar', 'pedir_ayuda'],
        blockingIntensity: 'none'
    },
    1: {
        level: 1,
        name: 'Onboarding Preventivo',
        description: 'Configuración inicial o recalibración post-crisis',
        escalationThreshold: 1,
        deescalationThreshold: 1,
        allowedActions: ['configurar', 'demo', 'validar'],
        blockingIntensity: 'soft'
    },
    2: {
        level: 2,
        name: 'Guardianía Contextual',
        description: 'Desbloqueo suave con mensaje reflexivo',
        escalationThreshold: 2,
        deescalationThreshold: 1,
        allowedActions: ['reflexionar', 'microbreak', 'respiracion'],
        blockingIntensity: 'soft'
    },
    3: {
        level: 3,
        name: 'Intervención Activa',
        description: 'Microacción habilitante requerida',
        escalationThreshold: 2,
        deescalationThreshold: 3,
        allowedActions: ['ejercicio', 'respiracion', 'justificacion'],
        blockingIntensity: 'medium'
    },
    4: {
        level: 4,
        name: 'Bloqueo Condicionado',
        description: 'Bloqueo total con ventana de gracia',
        escalationThreshold: 2,
        deescalationThreshold: 3,
        allowedActions: ['reto_fisico', 'contactar_mentor', 'explicacion'],
        blockingIntensity: 'hard'
    },
    5: {
        level: 5,
        name: 'Emergencia',
        description: 'Escalamiento externo, recursos de salud mental',
        escalationThreshold: 999, // doesn't escalate further
        deescalationThreshold: 5,
        allowedActions: ['ayuda_profesional', 'red_apoyo', 'plan_recuperacion'],
        blockingIntensity: 'emergency'
    }
};

export interface ProfileConfig {
    profile: UserProfile;
    description: string;
    escalationSpeed: 'slow' | 'normal' | 'fast';
    preferredMessages: 'empathetic' | 'direct' | 'encouraging';
    riskFactors: string[];
}

export const PROFILE_CONFIGS: Record<UserProfile, ProfileConfig> = {
    evitador: {
        profile: 'evitador',
        description: 'Usuario que evita comenzar tareas',
        escalationSpeed: 'slow',
        preferredMessages: 'empathetic',
        riskFactors: ['inactividad_prolongada', 'metas_sin_definir']
    },
    impulsivo: {
        profile: 'impulsivo',
        description: 'Usuario impulsivo que reacciona rápido a distracciones',
        escalationSpeed: 'fast',
        preferredMessages: 'direct',
        riskFactors: ['reincidencia_rapida', 'multiples_bloqueos']
    },
    perfeccionista: {
        profile: 'perfeccionista',
        description: 'Perfeccionista con parálisis por análisis',
        escalationSpeed: 'normal',
        preferredMessages: 'encouraging',
        riskFactors: ['paralisis', 'metas_inalcanzables', 'auto_critica']
    },
    neutro: {
        profile: 'neutro',
        description: 'Perfil neutral/desconocido',
        escalationSpeed: 'normal',
        preferredMessages: 'empathetic',
        riskFactors: []
    }
};
