/**
 * IDENTITY ECONOMY - Types & Interfaces
 * AlterFocus Gamification System v2.0
 */

// Identity Levels based on totalMomentos
export enum IdentityLevel {
    INICIANTE = 'Iniciante Curioso',
    CONSTRUCTOR = 'Constructor de Hábitos',
    EXPLORADOR = 'Explorador Consistente',
    ARQUITECTO = 'Arquitecto de la Atención',
    GUIA = 'Guía del Foco',
}

// Level thresholds
export const LEVEL_THRESHOLDS: Record<IdentityLevel, { min: number; max: number; message: string }> = {
    [IdentityLevel.INICIANTE]: {
        min: 0,
        max: 50,
        message: 'El viaje hacia mi propia mente ha comenzado.',
    },
    [IdentityLevel.CONSTRUCTOR]: {
        min: 51,
        max: 200,
        message: 'La repetición es mi nueva herramienta.',
    },
    [IdentityLevel.EXPLORADOR]: {
        min: 201,
        max: 500,
        message: 'Encuentro claridad incluso en días difíciles.',
    },
    [IdentityLevel.ARQUITECTO]: {
        min: 501,
        max: 1000,
        message: 'Yo decido dónde fluye mi energía.',
    },
    [IdentityLevel.GUIA]: {
        min: 1001,
        max: Infinity,
        message: 'La procrastinación ya no es rival para mi voluntad.',
    },
};

// User Identity Profile
export interface UserIdentity {
    userId: string;
    totalMomentos: number;      // Lifetime score - NEVER decreases
    currentStreak: number;      // Consecutive days
    longestStreak: number;      // Personal record
    level: IdentityLevel;       // Computed from totalMomentos
    unlockedMilestones: string[];
    lastMomentoDate: string | null;  // ISO date for streak calculation
    createdAt: string;
    updatedAt: string;
}

// Momento claim source
export type MomentoSource =
    | 'focus_session'      // Completed 25min session
    | 'rayo_intervention'  // Recovered from distraction via Rayo
    | 'breathing'          // Completed breathing exercise
    | 'offline_study'      // Offline study session
    | 'flip_phone';        // Flip phone mode session

// Momento record
export interface MomentoRecord {
    id: string;
    userId: string;
    source: MomentoSource;
    value: number;          // Usually 1, can be 1.5 for Rayo recoveries
    claimedAt: string;      // ISO timestamp
    sessionDuration?: number; // Minutes
}

// Calculate identity level from total momentos
export function calculateIdentityLevel(totalMomentos: number): IdentityLevel {
    if (totalMomentos >= 1001) return IdentityLevel.GUIA;
    if (totalMomentos >= 501) return IdentityLevel.ARQUITECTO;
    if (totalMomentos >= 201) return IdentityLevel.EXPLORADOR;
    if (totalMomentos >= 51) return IdentityLevel.CONSTRUCTOR;
    return IdentityLevel.INICIANTE;
}

// Get level message
export function getLevelMessage(level: IdentityLevel): string {
    return LEVEL_THRESHOLDS[level].message;
}

// Get progress to next level
export function getLevelProgress(totalMomentos: number): {
    current: IdentityLevel;
    next: IdentityLevel | null;
    progressPercent: number;
    momentosToNext: number;
} {
    const current = calculateIdentityLevel(totalMomentos);
    const currentThreshold = LEVEL_THRESHOLDS[current];

    // Already at max level
    if (current === IdentityLevel.GUIA) {
        return {
            current,
            next: null,
            progressPercent: 100,
            momentosToNext: 0,
        };
    }

    // Find next level
    const levels = Object.values(IdentityLevel);
    const currentIndex = levels.indexOf(current);
    const next = levels[currentIndex + 1] as IdentityLevel;
    const nextThreshold = LEVEL_THRESHOLDS[next];

    const progressInLevel = totalMomentos - currentThreshold.min;
    const levelRange = currentThreshold.max - currentThreshold.min + 1;
    const progressPercent = Math.min(100, (progressInLevel / levelRange) * 100);
    const momentosToNext = nextThreshold.min - totalMomentos;

    return {
        current,
        next,
        progressPercent,
        momentosToNext,
    };
}

// Check if today is a new streak day
export function isNewStreakDay(lastMomentoDate: string | null): boolean {
    if (!lastMomentoDate) return true;

    const last = new Date(lastMomentoDate);
    const today = new Date();

    // Reset to start of day
    last.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return today.getTime() > last.getTime();
}

// Check if streak is broken (more than 1 day gap)
export function isStreakBroken(lastMomentoDate: string | null): boolean {
    if (!lastMomentoDate) return false;

    const last = new Date(lastMomentoDate);
    const today = new Date();

    // Reset to start of day
    last.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 1;
}
