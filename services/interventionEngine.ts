/**
 * INTERVENTION ENGINE - The Brain of AlterFocus
 * 
 * This is what makes AlterFocus SUPERIOR to Opal.
 * Instead of blindly blocking, we UNDERSTAND why the user procrastinates
 * and offer the EXACT tool they need at that moment.
 */

import { EmotionalMetrics, EmotionalState, InterventionType, InterventionDecision } from '../types';

/**
 * Detects the user's emotional state based on behavioral metrics
 */
export function detectEmotionalState(metrics: EmotionalMetrics): EmotionalState {
    const { clickSpeed, responseTime, attemptCount, lastInterventions } = metrics;

    // First 1-2 attempts: gentle approach
    if (attemptCount <= 2) {
        return 'mild_distraction';
    }

    // High click speed (> 2) = anxiety/stress
    if (clickSpeed > 2) {
        return 'anxiety';
    }

    // Long response time (> 10s) = fatigue
    if (responseTime > 10) {
        return 'fatigue';
    }

    // Moderate response time (> 5s) = confusion/stuck
    if (responseTime > 5) {
        return 'confusion';
    }

    // If user has failed multiple interventions = severe overwhelm
    const recentFailures = lastInterventions ? lastInterventions.slice(-3) : [];
    if (recentFailures.length >= 3 && attemptCount >= 5) {
        return 'overwhelm';
    }

    return 'neutral';
}

/**
 * Decides which intervention to offer based on emotional state
 * This is the "AI decision" core logic based on the provided pseudocode
 * 
 * javascript
 * function decideIntervention(attemptCount, metrics, history) {
 *   const { clickSpeed, responseTime, emotionalPattern } = metrics;
 *   if (attemptCount <= 2) return { type: 'gentlequestion', message: '¿Qué te está frenando?', options: ['Respiración', 'Reencuadre', 'Reflexión'] };
 *   if (clickSpeed > 2 && emotionalPattern === 'anxiety') return { type: 'breathing478', duration: 75 };
 *   if (responseTime > 5 && emotionalPattern === 'confusion') return { type: 'reframing', prompt: '¿Esto te acerca o te aleja?' };
 *   if (responseTime > 10 && emotionalPattern === 'fatigue') return { type: 'physicalexercise', exercises: 'push-ups/squats' };
 *   if (history.userClickedHelpCount >= 3) return { type: 'aitherapybrief', questions: ['¿Qué sentiste?', '¿Qué necesitas?', 'Compromiso para próximos 10 min?'] };
 *   return { type: 'none' };
 * }
 */
export function decideIntervention(
    metrics: EmotionalMetrics,
    userGoal: string,
    history: { userClickedHelpCount: number } = { userClickedHelpCount: 0 }
): InterventionDecision {
    const { clickSpeed, responseTime, attemptCount } = metrics;

    // We detect the pattern first to use in logic
    const emotionalPattern = detectEmotionalState(metrics);

    // Logic Level 1: Gentle Question (Attempts 1-2)
    if (attemptCount <= 2) {
        return {
            type: 'gentle_question',
            emotionalState: 'mild_distraction',
            duration: 30,
            message: '¿Qué te está frenando?',
            options: ['Respiración', 'Reencuadre', 'Reflexión']
        };
    }

    // Logic Level 2: Specific Interventions based on Metrics & Pattern

    // Anxiety -> Breathing
    if (clickSpeed > 2 && emotionalPattern === 'anxiety') {
        return {
            type: 'breathing_4_7_8',
            emotionalState: 'anxiety',
            duration: 75,
            message: 'Detecto ansiedad. Vamos a respirar.'
        };
    }

    // Confusion -> Reframing
    if (responseTime > 5 && emotionalPattern === 'confusion') {
        return {
            type: 'cognitive_reframing',
            emotionalState: 'confusion',
            duration: 60,
            message: 'Parece confusión.',
            prompt: '¿Esto te acerca o te aleja?'
        };
    }

    // Fatigue -> Exercise
    if (responseTime > 10 && emotionalPattern === 'fatigue') {
        return {
            type: 'physical_exercise',
            emotionalState: 'fatigue',
            duration: 120,
            message: 'Detecto fatiga.',
            exercises: 'push-ups/squats'
        };
    }

    // Logic Level 3: Crisis / Help Needed
    if (history.userClickedHelpCount >= 3 || emotionalPattern === 'overwhelm') {
        return {
            type: 'ai_therapy_brief',
            emotionalState: 'overwhelm',
            duration: 180,
            message: 'Hablemos un momento.',
            questions: ['¿Qué sentiste?', '¿Qué necesitas?', 'Compromiso para próximos 10 min?']
        };
    }

    // Default fallback
    return {
        type: 'gentle_question',
        emotionalState: 'neutral',
        duration: 30,
        message: '¿Qué necesitas?',
        options: ['Volver', 'Respirar']
    };
}

/**
 * Calculates if the user has earned autonomy (unlock "Ignore" button)
 */
export function calculateAutonomyLevel(interventionHistory: any[]): {
    level: 'beginner' | 'intermediate' | 'autonomous';
    successfulThisWeek: number;
    ignoreButtonUnlocked: boolean;
    progressPercent: number;
} {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const successfulThisWeek = interventionHistory.filter(i =>
        i.successful &&
        new Date(i.timestamp) > sevenDaysAgo
    ).length;

    const ignoreButtonUnlocked = successfulThisWeek >= 5;
    const progressPercent = Math.min(100, (successfulThisWeek / 5) * 100);

    let level: 'beginner' | 'intermediate' | 'autonomous';
    if (successfulThisWeek >= 15) level = 'autonomous';
    else if (successfulThisWeek >= 5) level = 'intermediate';
    else level = 'beginner';

    return {
        level,
        successfulThisWeek,
        ignoreButtonUnlocked,
        progressPercent
    };
}

/**
 * Saves intervention outcome to localStorage for learning
 */
export function saveInterventionRecord(record: {
    type: InterventionType;
    emotionalState: EmotionalState;
    successful: boolean;
    durationSeconds: number;
}): void {
    try {
        const existing = JSON.parse(localStorage.getItem('alterfocus_interventions') || '[]');
        existing.push({
            timestamp: new Date().toISOString(),
            ...record
        });
        localStorage.setItem('alterfocus_interventions', JSON.stringify(existing));
    } catch (e) {
        console.error('Failed to save intervention record:', e);
    }
}

/**
 * Gets intervention history from localStorage
 */
export function getInterventionHistory(): any[] {
    try {
        return JSON.parse(localStorage.getItem('alterfocus_interventions') || '[]');
    } catch {
        return [];
    }
}
