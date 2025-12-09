/**
 * INTERVENTIONS INDEX
 * Exporta todas las intervenciones del sistema de arquetipos
 */

// Intervenciones existentes
export { default as GentleQuestion } from './GentleQuestion';
export { default as InterventionMultimodal } from './InterventionMultimodal';
export { default as PhysicalExercise } from './PhysicalExercise';
export { default as CognitiveReframing } from './CognitiveReframing';
export { default as AITherapyBrief } from './AITherapyBrief';

// NUEVAS Intervenciones de Arquetipos
export { CrappyVersionIntervention } from './CrappyVersion';
export { BreakdownIntervention } from './BreakdownSteps';
export { GestureAnchorIntervention } from './GestureAnchor';
export { BrainDumpIntervention } from './BrainDump';
export { PersonalContractIntervention } from './PersonalContract';
export { PatternInterruptIntervention } from './PatternInterrupt';

// Types
export type InterventionId =
    | 'gentle_question'
    | 'breathing_4_7_8'
    | 'cognitive_reframing'
    | 'physical_exercise'
    | 'ai_therapy_brief'
    // Nuevas de arquetipos
    | 'magic_question'
    | 'crappy_version'
    | 'gesture_anchor'
    | 'breakdown_3steps'
    | 'brain_dump'
    | 'personal_contract'
    | 'pattern_interrupt'
    | 'movement_activation'
    | 'quick_5min'
    | 'dopamine_spike'
    | 'cold_water'
    | 'ritual_change';

export interface InterventionResult {
    points: number;
    success: boolean;
    intervention: string;
    steps?: string[];
    contract?: string;
    charCount?: number;
    action?: string;
}
