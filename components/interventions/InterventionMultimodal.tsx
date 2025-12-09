import React, { useState, useEffect } from 'react';
import { EmotionalMetrics, InterventionType } from '../../types';
import { detectEmotionalState, decideIntervention, saveInterventionRecord } from '../../services/interventionEngine';

// Import all 5 modality components
import GentleQuestion from './GentleQuestion';
import CognitiveReframing from './CognitiveReframing';
import PhysicalExercise from './PhysicalExercise';
import AITherapyBrief from './AITherapyBrief';
import Breathing from '../Breathing';
import { UserState } from '../../types';
import { generateContextualIntervention, buildUserContext, AIInterventionResponse } from '../../services/aiContextService';

interface InterventionMultimodalProps {
    user: UserState;
    metrics: EmotionalMetrics;
    userGoal: string;
    onComplete: (success: boolean) => void;
    onSkip: () => void;
    // Progressive Autonomy System
    ignoreButtonUnlocked?: boolean;
    autonomyLevel?: 'aprendiz' | 'practicante' | 'autonomo' | 'maestro';
    circadianContext?: {
        pattern: 'morning_flow' | 'circadian_slump' | 'late_fatigue' | 'neutral';
        message: string;
    };
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
    user,
    metrics,
    userGoal,
    onComplete,
    onSkip,
    ignoreButtonUnlocked = false,
    autonomyLevel = 'aprendiz',
    circadianContext
}) => {
    const [activeIntervention, setActiveIntervention] = useState<InterventionType | null>(null);
    const [emotionalState, setEmotionalState] = useState<string>('');
    const [decisionData, setDecisionData] = useState<any>(null);
    const [userSelectedEmotion, setUserSelectedEmotion] = useState<string | null>(null);
    const [aiContent, setAiContent] = useState<AIInterventionResponse | undefined>(undefined);

    // AI Context Generation
    useEffect(() => {
        const fetchAIContext = async () => {
            if (metrics.attemptCount <= 2) {
                // Only generate expensive AI content for early interventions (Gentle Question)
                // or crisis.
                try {
                    const ctx = buildUserContext(user, 'blocked-site.com'); // TODO: Pass real blocked site from App
                    // Note: App passes blockedSiteContext handling via other means, but we want it in user context
                    // For now, we use a placeholder or check localStorage manually if needed
                    const aiResult = await generateContextualIntervention(ctx);
                    if (aiResult) setAiContent(aiResult);
                } catch (e) {
                    console.error("AI Context Error:", e);
                }
            }
        };
        fetchAIContext();
    }, [metrics, user]);

    useEffect(() => {
        // AI Decision: What intervention to offer?
        // We need history for the new logic
        const history = JSON.parse(localStorage.getItem('alterfocus_interventions') || '[]');
        const helpCount = history.filter((i: any) => i.type === 'ai_therapy_brief').length;

        const decision = decideIntervention(metrics, userGoal, { userClickedHelpCount: helpCount });

        setEmotionalState(decision.emotionalState);
        setActiveIntervention(decision.type);
        setDecisionData(decision);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metrics.attemptCount, userGoal]);

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

    // NEW: Handle emotional selection from GentleQuestion
    const handleEmotionalSelection = (emotion: 'anxiety' | 'confusion' | 'fatigue' | 'overwhelm') => {
        setUserSelectedEmotion(emotion);

        // Map emotion to intervention type
        let nextIntervention: InterventionType;
        switch (emotion) {
            case 'anxiety':
                nextIntervention = 'breathing_4_7_8';
                break;
            case 'confusion':
                nextIntervention = 'cognitive_reframing';
                break;
            case 'fatigue':
                nextIntervention = 'physical_exercise';
                break;
            case 'overwhelm':
                nextIntervention = 'ai_therapy_brief';
                break;
        }

        // Transition to the specific intervention
        setActiveIntervention(nextIntervention);
        setEmotionalState(emotion);
    };

    // Route to correct modality component
    switch (activeIntervention) {
        case 'gentle_question':
            return (
                <GentleQuestion
                    attemptCount={metrics.attemptCount}
                    onSelect={handleEmotionalSelection}  // Changed: now transitions to next modality
                    onSkip={handleSkip}
                    // Pass dynamic options if available
                    options={decisionData?.options}
                    // Progressive Autonomy System
                    ignoreButtonUnlocked={ignoreButtonUnlocked}
                    autonomyLevel={autonomyLevel}
                    circadianMessage={circadianContext?.message}
                    aiContent={aiContent && {
                        message: aiContent.message,
                        tone: activeIntervention === 'ai_therapy_brief' ? 'empathic' : aiContent.tone,
                        actions: aiContent.actions
                    }}
                />
            );

        case 'breathing_4_7_8':
            return (
                <Breathing
                    onComplete={(result) => {
                        const success = result === 'yes';
                        if (result !== 'cancelled') {
                            handleInterventionComplete(success, 'breathing_4_7_8');
                        }
                        // If cancelled, stay on intervention (will re-render with gentle_question)
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
                    onSelect={handleEmotionalSelection}  // Changed
                    onSkip={handleSkip}
                    ignoreButtonUnlocked={ignoreButtonUnlocked}
                    autonomyLevel={autonomyLevel}
                    circadianMessage={circadianContext?.message}
                    aiContent={aiContent && {
                        message: aiContent.message,
                        tone: aiContent.tone,
                        actions: aiContent.actions
                    }}
                />
            );
    }
};

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
