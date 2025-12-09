/**
 * ARCHETYPE INTERVENTION SELECTOR
 * 
 * Componente que detecta el arquetipo del usuario y muestra
 * las intervenciones específicas para ese arquetipo.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, ArrowRight, X, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';
import {
    detectArchetype,
    getInterventionsForArchetype,
    getCurrentArchetype,
    saveInterventionFeedback,
    type DetectionSignals,
    type ArchetypeDetection,
    type InterventionOption,
    type AnyArchetype
} from '../../lib/archetypeEngine';

import { CrappyVersionIntervention } from './CrappyVersion';
import { BreakdownIntervention } from './BreakdownSteps';
import { GestureAnchorIntervention } from './GestureAnchor';
import { BrainDumpIntervention } from './BrainDump';
import { PersonalContractIntervention } from './PersonalContract';
import { PatternInterruptIntervention } from './PatternInterrupt';

interface ArchetypeInterventionSelectorProps {
    onComplete: (result: { points: number; success: boolean }) => void;
    onCancel: () => void;
    signals?: DetectionSignals;
    skipDetection?: boolean;
}

export const ArchetypeInterventionSelector: React.FC<ArchetypeInterventionSelectorProps> = ({
    onComplete,
    onCancel,
    signals,
    skipDetection = false
}) => {
    const [phase, setPhase] = useState<'detect' | 'select' | 'intervention' | 'feedback'>('detect');
    const [detection, setDetection] = useState<ArchetypeDetection | null>(null);
    const [interventions, setInterventions] = useState<InterventionOption[]>([]);
    const [selectedIntervention, setSelectedIntervention] = useState<InterventionOption | null>(null);
    const [interventionResult, setInterventionResult] = useState<any>(null);

    useEffect(() => {
        if (skipDetection) {
            const existing = getCurrentArchetype();
            if (existing) {
                setDetection(existing);
                setInterventions(getInterventionsForArchetype(existing.primary));
                setPhase('select');
            }
        } else if (signals) {
            const result = detectArchetype(signals);
            setDetection(result);
            setInterventions(getInterventionsForArchetype(result.primary));
            setPhase('select');
        }
    }, [signals, skipDetection]);

    const handleQuickDetection = (feeling: 'anxious' | 'tired' | 'confused' | 'stuck') => {
        const signalMap: Record<string, DetectionSignals> = {
            anxious: { feeling: 'anxious', anxiety_level: 8, energy_level: 5 },
            tired: { feeling: 'tired', energy_level: 2, anxiety_level: 3 },
            confused: { clarity: 'overwhelmed', energy_level: 5, anxiety_level: 5 },
            stuck: { procrastination_history: 'always', clarity: 'unclear' }
        };

        const result = detectArchetype(signalMap[feeling]);
        setDetection(result);
        setInterventions(getInterventionsForArchetype(result.primary));
        setPhase('select');
    };

    const handleSelectIntervention = (intervention: InterventionOption) => {
        setSelectedIntervention(intervention);
        setPhase('intervention');
    };

    const handleInterventionComplete = (result: any) => {
        setInterventionResult(result);
        setPhase('feedback');
    };

    const handleFeedback = (helpful: boolean, returnedToFocus: boolean) => {
        if (selectedIntervention) {
            saveInterventionFeedback(selectedIntervention.id, {
                helpful,
                returned_to_focus: returnedToFocus,
                emotional_rating: helpful ? 4 : 2
            });
        }

        onComplete({
            points: interventionResult?.points || 0,
            success: helpful && returnedToFocus
        });
    };

    const renderIntervention = () => {
        if (!selectedIntervention) return null;

        const commonProps = {
            onComplete: handleInterventionComplete,
            onCancel: () => setPhase('select'),
            archetype: detection?.primary
        };

        switch (selectedIntervention.id) {
            case 'crappy_version':
                return <CrappyVersionIntervention {...commonProps} />;
            case 'breakdown_3steps':
                return <BreakdownIntervention {...commonProps} />;
            case 'gesture_anchor':
                return <GestureAnchorIntervention {...commonProps} />;
            case 'brain_dump':
                return <BrainDumpIntervention {...commonProps} />;
            case 'personal_contract':
                return <PersonalContractIntervention {...commonProps} />;
            case 'pattern_interrupt':
                return <PatternInterruptIntervention {...commonProps} />;
            default:
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
                    >
                        <div className="text-center space-y-6 max-w-md">
                            <div className="text-6xl">{selectedIntervention.emoji}</div>
                            <h2 className="text-2xl font-bold text-white">{selectedIntervention.label}</h2>
                            <p className="text-slate-400">{selectedIntervention.description}</p>
                            <p className="text-white/50 text-sm">Duración: {Math.round(selectedIntervention.duration / 60)} min</p>
                            <button
                                onClick={() => handleInterventionComplete({ points: 15, success: true })}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold"
                            >
                                Completar ✓
                            </button>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <AnimatePresence mode="wait">
            {phase === 'detect' && (
                <motion.div
                    key="detect"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
                >
                    <div className="w-full max-w-md space-y-6">
                        <div className="text-center">
                            <motion.div
                                animate={{
                                    boxShadow: [
                                        '0 0 20px rgba(139, 92, 246, 0.3)',
                                        '0 0 60px rgba(139, 92, 246, 0.5)',
                                        '0 0 20px rgba(139, 92, 246, 0.3)'
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-4"
                            >
                                <Brain size={40} className="text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-black text-white mb-2">
                                ¿Qué sientes ahora?
                            </h2>
                            <p className="text-slate-400">
                                Detectamos la mejor intervención para ti
                            </p>
                        </div>

                        <div className="space-y-3">
                            {[
                                { id: 'anxious', emoji: '😰', label: 'Ansiedad / Miedo', desc: 'Tengo miedo de fallar' },
                                { id: 'tired', emoji: '😴', label: 'Cansancio / Sin energía', desc: 'No tengo ganas de nada' },
                                { id: 'confused', emoji: '🤔', label: 'Confusión / Abrumado', desc: 'No sé por dónde empezar' },
                                { id: 'stuck', emoji: '⚙️', label: 'Patrón Repetido', desc: 'Siempre me pasa esto' }
                            ].map((option, i) => (
                                <motion.button
                                    key={option.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => handleQuickDetection(option.id as any)}
                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-purple-500/50 transition-all flex items-center gap-4"
                                >
                                    <div className="text-3xl">{option.emoji}</div>
                                    <div className="text-left flex-1">
                                        <p className="text-white font-bold">{option.label}</p>
                                        <p className="text-slate-500 text-sm">{option.desc}</p>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-500" />
                                </motion.button>
                            ))}
                        </div>

                        <button
                            onClick={onCancel}
                            className="w-full py-3 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            <X size={18} className="inline mr-2" />
                            Cancelar
                        </button>
                    </div>
                </motion.div>
            )}

            {phase === 'select' && detection && (
                <motion.div
                    key="select"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 overflow-y-auto"
                >
                    <div className="w-full max-w-md space-y-6 my-auto py-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                        >
                            <div className="text-5xl mb-3">{detection.emoji}</div>
                            <h2 className="text-2xl font-black text-white mb-2">
                                {detection.primary}
                                {detection.secondary && ` + ${detection.secondary}`}
                            </h2>
                            <p className="text-slate-400 text-sm">{detection.message}</p>
                            <div className="flex justify-center gap-2 mt-2">
                                <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                                    {Math.round(detection.confidence_primary * 100)}% confianza
                                </span>
                            </div>
                        </motion.div>

                        <div className="space-y-3">
                            <p className="text-slate-500 text-sm font-medium">
                                Intervenciones recomendadas:
                            </p>
                            {interventions.map((intervention, i) => (
                                <motion.button
                                    key={intervention.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => handleSelectIntervention(intervention)}
                                    className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 ${intervention.priority === 'critical' || intervention.priority === 'high'
                                            ? 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="text-2xl">{intervention.emoji}</div>
                                    <div className="text-left flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-bold">{intervention.label}</p>
                                            {(intervention.priority === 'critical' || intervention.priority === 'high') && (
                                                <Zap size={14} className="text-purple-400" />
                                            )}
                                        </div>
                                        <p className="text-slate-500 text-sm">{intervention.description}</p>
                                        <p className="text-slate-600 text-xs mt-1">
                                            {Math.round(intervention.duration / 60)} min
                                            {intervention.embodied && ' • Corporal'}
                                        </p>
                                    </div>
                                    <ArrowRight size={20} className="text-slate-500" />
                                </motion.button>
                            ))}
                        </div>

                        <button
                            onClick={() => setPhase('detect')}
                            className="w-full py-3 text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Detectar de nuevo
                        </button>
                    </div>
                </motion.div>
            )}

            {phase === 'intervention' && renderIntervention()}

            {phase === 'feedback' && (
                <motion.div
                    key="feedback"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
                >
                    <div className="w-full max-w-md space-y-6 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center"
                        >
                            <Sparkles size={40} className="text-white" />
                        </motion.div>

                        <div>
                            <h2 className="text-2xl font-black text-white mb-2">
                                ¡Completado! +{interventionResult?.points || 0} pts
                            </h2>
                            <p className="text-slate-400">¿Cómo te fue?</p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleFeedback(true, true)}
                                className="w-full py-4 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-300 font-bold hover:bg-emerald-500/30 transition-all"
                            >
                                ✅ Me ayudó, volví al foco
                            </button>
                            <button
                                onClick={() => handleFeedback(true, false)}
                                className="w-full py-4 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-300 font-bold hover:bg-amber-500/30 transition-all"
                            >
                                🤔 Me ayudó, pero aún no vuelvo
                            </button>
                            <button
                                onClick={() => handleFeedback(false, false)}
                                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-medium hover:bg-white/10 transition-all"
                            >
                                👎 No me ayudó
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ArchetypeInterventionSelector;
