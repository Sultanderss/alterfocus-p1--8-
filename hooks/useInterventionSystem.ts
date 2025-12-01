// Hook for managing intervention level state across the app
import { useState, useEffect } from 'react';
import {
    InterventionState,
    InterventionLevel,
    UserProfile,
    loadInterventionState,
    saveInterventionState,
    recordIntervention,
    detectUserProfile,
    calculateProgressIndex,
    shouldEscalate,
    shouldDeescalate,
    getContextualMessage
} from '../services/interventionLevelManager';

export function useInterventionSystem() {
    const [state, setState] = useState<InterventionState>(() => loadInterventionState());

    // Save to localStorage whenever state changes
    useEffect(() => {
        saveInterventionState(state);
    }, [state]);

    // Auto-detect user profile based on history
    useEffect(() => {
        if (state.interventionHistory.length >= 5) {
            const detectedProfile = detectUserProfile(state.interventionHistory);
            if (detectedProfile !== state.userProfile) {
                setState(prev => ({ ...prev, userProfile: detectedProfile }));
            }
        }
    }, [state.interventionHistory.length]);

    // Record a new intervention
    const recordNewIntervention = (action: string, success: boolean, emotionalState?: string) => {
        setState(prev => recordIntervention(prev, action, success, emotionalState));
    };

    // Manually escalate level
    const manualEscalate = () => {
        if (state.currentLevel < 5) {
            setState(prev => ({
                ...prev,
                currentLevel: (prev.currentLevel + 1) as InterventionLevel,
                lastLevelChange: new Date().toISOString()
            }));
        }
    };

    // Manually de-escalate level
    const manualDeescalate = () => {
        if (state.currentLevel > 0) {
            setState(prev => ({
                ...prev,
                currentLevel: (prev.currentLevel - 1) as InterventionLevel,
                lastLevelChange: new Date().toISOString()
            }));
        }
    };

    // Reset profile
    const updateProfile = (profile: UserProfile) => {
        setState(prev => ({ ...prev, userProfile: profile }));
    };

    // Get current level message
    const getCurrentMessage = (siteName: string, userGoal: string) => {
        return getContextualMessage(state.currentLevel, state.userProfile, siteName, userGoal);
    };

    return {
        state,
        recordIntervention: recordNewIntervention,
        manualEscalate,
        manualDeescalate,
        updateProfile,
        getCurrentMessage,
        shouldEscalate: shouldEscalate(state),
        shouldDeescalate: shouldDeescalate(state),
        progressIndex: calculateProgressIndex(state)
    };
}
