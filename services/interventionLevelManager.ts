// AlterFocus - Intervention Level Manager  
// Manages escalation/de-escalation logic and state

import {
    InterventionLevel,
    UserProfile,
    InterventionState,
    InterventionRecord,
    LEVEL_CONFIGS,
    PROFILE_CONFIGS
} from './interventionLevelSystem';

// Re-export types for convenience
export type { InterventionLevel, UserProfile, InterventionState, InterventionRecord };
export { LEVEL_CONFIGS, PROFILE_CONFIGS };

const STORAGE_KEY = 'alterfocus_intervention_state';

// Initialize default state
export function getDefaultState(): InterventionState {
    return {
        currentLevel: 0,
        userProfile: 'neutro',
        successStreak: 0,
        failureStreak: 0,
        lastLevelChange: new Date().toISOString(),
        dailyProgressIndex: 0,
        interventionHistory: []
    };
}

// Load state from storage
export function loadInterventionState(): InterventionState {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading intervention state:', e);
    }
    return getDefaultState();
}

// Save state to storage
export function saveInterventionState(state: InterventionState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Error saving intervention state:', e);
    }
}

// Calculate daily progress index (0-100)
export function calculateProgressIndex(state: InterventionState): number {
    const recentHistory = state.interventionHistory.slice(-10);
    if (recentHistory.length === 0) return 50;

    const successCount = recentHistory.filter(r => r.success).length;
    const successRate = (successCount / recentHistory.length) * 100;
    const levelPenalty = state.currentLevel * 10;

    return Math.max(0, Math.min(100, successRate - levelPenalty));
}

// Determine if escalation is needed
export function shouldEscalate(state: InterventionState): boolean {
    const config = LEVEL_CONFIGS[state.currentLevel];
    const profileConfig = PROFILE_CONFIGS[state.userProfile];

    let threshold = config.escalationThreshold;
    if (profileConfig.escalationSpeed === 'fast') threshold = Math.max(1, threshold - 1);
    if (profileConfig.escalationSpeed === 'slow') threshold += 1;

    return state.failureStreak >= threshold && state.currentLevel < 5;
}

// Determine if de-escalation is possible
export function shouldDeescalate(state: InterventionState): boolean {
    const config = LEVEL_CONFIGS[state.currentLevel];
    return state.successStreak >= config.deescalationThreshold && state.currentLevel > 0;
}

// Escalate to next level
export function escalateLevel(state: InterventionState): InterventionState {
    if (state.currentLevel >= 5) return state;

    return {
        ...state,
        currentLevel: (state.currentLevel + 1) as InterventionLevel,
        failureStreak: 0,
        lastLevelChange: new Date().toISOString()
    };
}

// De-escalate to previous level
export function deescalateLevel(state: InterventionState): InterventionState {
    if (state.currentLevel <= 0) return state;

    return {
        ...state,
        currentLevel: (state.currentLevel - 1) as InterventionLevel,
        successStreak: 0,
        lastLevelChange: new Date().toISOString()
    };
}

// Record intervention outcome
export function recordIntervention(
    state: InterventionState,
    action: string,
    success: boolean,
    emotionalState?: string
): InterventionState {
    const record: InterventionRecord = {
        timestamp: new Date().toISOString(),
        level: state.currentLevel,
        action,
        success,
        emotionalState
    };

    const newState = {
        ...state,
        successStreak: success ? state.successStreak + 1 : 0,
        failureStreak: success ? 0 : state.failureStreak + 1,
        interventionHistory: [...state.interventionHistory, record].slice(-50)
    };

    newState.dailyProgressIndex = calculateProgressIndex(newState);

    if (shouldEscalate(newState)) {
        return escalateLevel(newState);
    } else if (shouldDeescalate(newState)) {
        return deescalateLevel(newState);
    }

    return newState;
}

// Detect user profile
export function detectUserProfile(history: InterventionRecord[]): UserProfile {
    if (history.length < 5) return 'neutro';

    const recent = history.slice(-20);
    const failures = recent.filter(r => !r.success);

    let avoidanceCount = 0;
    let impulsiveCount = 0;
    let perfectionistCount = 0;

    failures.forEach(f => {
        if (f.emotionalState === 'paralisis' || f.emotionalState === 'confusion') perfectionistCount++;
        if (f.emotionalState === 'anxiety' || f.action === 'ignorar') impulsiveCount++;
        if (f.action === 'posponer' || f.action === 'reagendar') avoidanceCount++;
    });

    const max = Math.max(avoidanceCount, impulsiveCount, perfectionistCount);
    if (max === 0) return 'neutro';

    if (avoidanceCount === max) return 'evitador';
    if (impulsiveCount === max) return 'impulsivo';
    if (perfectionistCount === max) return 'perfeccionista';

    return 'neutro';
}

// Get contextual message
export function getContextualMessage(
    level: InterventionLevel,
    profile: UserProfile,
    siteName: string,
    userGoal: string
): { title: string; message: string; tone: string } {
    const messages = {
        0: {
            title: '💡 Recordatorio Amigable',
            message: `Hace un rato que no avanzas en "${userGoal}". ¿Todo bien?`,
            tone: 'empathetic'
        },
        1: {
            title: '🌟 Momento de Recalibrar',
            message: `Parece que necesitas reajustar tu enfoque. Configuremos juntos tu camino.`,
            tone: 'encouraging'
        },
        2: {
            title: `🛡️ ${siteName} Detectado`,
            message: `¿Seguro que necesitas ${siteName} ahora? Tu meta "${userGoal}" te espera.`,
            tone: 'direct'
        },
        3: {
            title: '⚡ Acción Requerida',
            message: `Antes de continuar, hagamos un reset rápido. Te ayudará a reflexionar.`,
            tone: 'direct'
        },
        4: {
            title: '🚨 Bloqueo Activado',
            message: `Necesitas tomar una pausa real. Completa el reto o contacta a tu mentor.`,
            tone: 'direct'
        },
        5: {
            title: '🆘 Necesitas Apoyo',
            message: `Notamos señales de que podrías necesitar ayuda extra. Estamos aquí.`,
            tone: 'empathetic'
        }
    };

    return messages[level];
}

// Reset daily stats
export function resetDailyStats(state: InterventionState): InterventionState {
    return {
        ...state,
        dailyProgressIndex: 0,
        successStreak: 0,
        failureStreak: 0
    };
}
