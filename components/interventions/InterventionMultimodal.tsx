import React, { useState, useEffect } from 'react';
import { EmotionalMetrics, InterventionType } from '../../types';
import { detectEmotionalState, decideIntervention, saveInterventionRecord } from '../../services/interventionEngine';

// Import all 5 modality components
import GentleQuestion from './GentleQuestion';
import CognitiveReframing from './CognitiveReframing';
import PhysicalExercise from './PhysicalExercise';
import AITherapyBrief from './AITherapyBrief';
import Breathing from '../Breathing';

interface InterventionMultimodalProps {
    metrics: EmotionalMetrics;
    userGoal: string;
    onComplete: (success: boolean) => void;
    onSkip: () => void;
}

/**
 * INTERVENTION ORCHESTRATOR - The Intelligence Layer
 * 
 * This component is what makes AlterFocus SUPERIOR to Opal.
 * It doesn't just block - it UNDERSTANDS and ACTS with precision.
 * 
 * Flow:
 * 1. Receives emotional metrics from FocusSession
 * 2. Detects emotional state (anxiety, confusion, fatigue, etc.)
 * 3. Decides which intervention modality to show
 * 4. Routes to appropriate component
 * 5. Saves outcome for learning and autonomy calculation
 */
const InterventionMultimodal: React.FC<InterventionMultimodalProps> = ({
    metrics,
    userGoal,
    onComplete,
    onSkip
}) => {
    const [activeIntervention, setActiveIntervention] = useState<InterventionType | null>(null);
    const [emotionalState, setEmotionalState] = useState<string>('');
    const [decisionData, setDecisionData] = useState<any>(null);

    useEffect(() => {
        // AI Decision: What intervention to offer?
        // We need history for the new logic
        const history = JSON.parse(localStorage.getItem('alterfocus_interventions') || '[]');
        const helpCount = history.filter((i: any) => i.type === 'ai_therapy_brief').length;

        const decision = decideIntervention(metrics, userGoal, { userClickedHelpCount: helpCount });

        setEmotionalState(decision.emotionalState);
        setActiveIntervention(decision.type);
        setDecisionData(decision);
    }, [metrics, userGoal]);

    const handleInterventionComplete = (success: boolean, interventionType: InterventionType) => {
        // Save record for analytics and autonomy calculation
        saveInterventionRecord({
            type: interventionType,
            emotionalState: emotionalState as any,
            successful: success,
            durationSeconds: getDurationForType(interventionType)
        });

        onComplete(success);
    };

    const handleSkip = () => {
        if (activeIntervention) {
            // Save as unsuccessful skip
            saveInterventionRecord({
                type: activeIntervention,
                emotionalState: emotionalState as any,
                successful: false,
                durationSeconds: 0
            });
        }
        onSkip();
    };

    // Route to correct modality component
    switch (activeIntervention) {
        case 'gentle_question':
            return (
                <GentleQuestion
                    attemptCount={metrics.attemptCount}
                    onSelect={(response) => {
                        // User selected an emotional state
                        handleInterventionComplete(true, 'gentle_question');
                    }}
                    onSkip={handleSkip}
                    // Pass dynamic options if available
                    options={decisionData?.options}
                />
            );

        case 'breathing_4_7_8':
            return (
                <Breathing
                    onComplete={(result) => {
                        const success = result === 'yes';
                        handleInterventionComplete(success, 'breathing_4_7_8');
                    }}
                />
            );

        case 'cognitive_reframing':
            return (
                <CognitiveReframing
                    userGoal={userGoal}
                    onComplete={(result) => {
                        const success = result === 'away'; // Honest answer = success
                        handleInterventionComplete(success, 'cognitive_reframing');
                    }}
                    // Pass dynamic prompt
                    prompt={decisionData?.prompt}
                />
            );

        case 'physical_exercise':
            return (
                <PhysicalExercise
                    onComplete={(completed) => {
                        handleInterventionComplete(completed, 'physical_exercise');
                    }}
                    // Pass dynamic exercises
                    exercises={decisionData?.exercises}
                />
            );

        case 'ai_therapy_brief':
            return (
                <AITherapyBrief
                    onComplete={(success) => {
                        handleInterventionComplete(success, 'ai_therapy_brief');
                    }}
                    // Pass dynamic questions
                    questions={decisionData?.questions}
                />
            );

        default:
            // Fallback: gentle question
            return (
                <GentleQuestion
                    attemptCount={metrics.attemptCount}
                    onSelect={() => handleInterventionComplete(true, 'gentle_question')}
                    onSkip={handleSkip}
                />
            );
    }
};

// Helper to get standard duration for each type
function getDurationForType(type: InterventionType): number {
    const durations: Record<InterventionType, number> = {
        gentle_question: 30,
        breathing_4_7_8: 75,
        cognitive_reframing: 60,
        physical_exercise: 120,
        ai_therapy_brief: 180
    };
    return durations[type] || 60;
}

export default InterventionMultimodal;
