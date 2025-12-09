/**
 * INTERVENCIÓN: BREAKDOWN 3 PASOS
 * 
 * Para arquetipos: CONFUSION, FEAR+CONFUSION
 * Objetivo: Clarificar y estructurar cuando hay parálisis por análisis
 * Duración: ~3 minutos
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChecks, ChevronRight, Check, X, Sparkles } from 'lucide-react';

interface BreakdownProps {
    onComplete: (result: { points: number; success: boolean; intervention: string; steps?: string[] }) => void;
    onCancel: () => void;
    archetype?: string;
}

export const BreakdownIntervention: React.FC<BreakdownProps> = ({
    onComplete,
    onCancel,
    archetype = 'Confusion'
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [steps, setSteps] = useState(['', '', '']);
    const [phase, setPhase] = useState<'intro' | 'input' | 'complete'>('intro');

    const placeholders = [
        '¿Cuál es el PRIMER paso? (< 5 min)',
        '¿Y después? El segundo paso...',
        '¿Tercer paso para terminar?'
    ];

    const handleNext = () => {
        if (steps[currentStep].trim()) {
            if (currentStep < 2) {
                setCurrentStep(currentStep + 1);
            } else {
                setPhase('complete');
            }
        }
    };

    const updateStep = (value: string) => {
        const newSteps = [...steps];
        newSteps[currentStep] = value;
        setSteps(newSteps);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && steps[currentStep].trim()) {
            handleNext();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
        >
            <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                    {/* INTRO */}
                    {phase === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center space-y-6"
                        >
                            {/* Icon */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30"
                            >
                                <ListChecks size={48} className="text-white" />
                            </motion.div>

                            {/* Title */}
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2">
                                    Breakdown 📋
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    3 mini-pasos para claridad total
                                </p>
                            </div>

                            {/* Explanation */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
                                <p className="text-white/90 leading-relaxed">
                                    <span className="font-bold text-blue-400">La confusión se disuelve con estructura.</span>
                                </p>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    Vamos a dividir tu tarea en 3 pasos pequeños. Cada uno debe tomar menos de 5 minutos.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-medium hover:bg-white/10 transition-all"
                                >
                                    <X size={18} className="inline mr-2" />
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => setPhase('input')}
                                    className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                                >
                                    <ChevronRight size={18} className="inline mr-2" />
                                    Empezar
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* INPUT STEPS */}
                    {phase === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            {/* Progress Dots */}
                            <div className="flex justify-center gap-3">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        className={`w-3 h-3 rounded-full transition-all ${i < currentStep ? 'bg-blue-500' :
                                                i === currentStep ? 'bg-blue-500 ring-4 ring-blue-500/30' :
                                                    'bg-white/20'
                                            }`}
                                        animate={i === currentStep ? { scale: [1, 1.2, 1] } : {}}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                ))}
                            </div>

                            {/* Step Number */}
                            <div className="text-center">
                                <div className="text-6xl font-black text-white mb-2">
                                    {currentStep + 1}
                                </div>
                                <p className="text-blue-400 font-medium">
                                    de 3 pasos
                                </p>
                            </div>

                            {/* Input */}
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder={placeholders[currentStep]}
                                    value={steps[currentStep]}
                                    onChange={(e) => updateStep(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    autoFocus
                                    className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 text-white text-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />

                                {/* Previous Steps (if any) */}
                                {currentStep > 0 && (
                                    <div className="space-y-2">
                                        {steps.slice(0, currentStep).map((step, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                                                <Check size={16} className="text-blue-500" />
                                                <span>{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={handleNext}
                                disabled={!steps[currentStep].trim()}
                                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${steps[currentStep].trim()
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-white/10 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                {currentStep < 2 ? (
                                    <>Siguiente <ChevronRight size={20} className="inline" /></>
                                ) : (
                                    <>¡Listo! Empezar con paso 1 ✓</>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {/* COMPLETE */}
                    {phase === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6"
                        >
                            {/* Success Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 10 }}
                                className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                            >
                                <Check size={48} className="text-white" />
                            </motion.div>

                            {/* Message */}
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2">
                                    ¡Claridad total! 🎯
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Ahora tienes un plan de 3 pasos
                                </p>
                            </div>

                            {/* Steps Summary */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 text-left">
                                {steps.filter(s => s.trim()).map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-blue-400 text-sm font-bold">{i + 1}</span>
                                        </div>
                                        <span className="text-white/90">{step}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Insight */}
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                                <p className="text-emerald-300 text-sm leading-relaxed">
                                    <Sparkles size={14} className="inline mr-2" />
                                    La confusión era solo falta de estructura. Ahora tienes el camino claro.
                                </p>
                            </div>

                            {/* Points */}
                            <div className="bg-white/5 rounded-xl py-3 px-6 inline-flex items-center gap-2">
                                <span className="text-2xl">✨</span>
                                <span className="text-white font-bold text-xl">+25 puntos</span>
                            </div>

                            {/* Continue */}
                            <button
                                onClick={() => onComplete({
                                    points: 25,
                                    success: true,
                                    intervention: 'breakdown_3steps',
                                    steps: steps.filter(s => s.trim())
                                })}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-emerald-500/30"
                            >
                                Empezar con Paso 1 →
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default BreakdownIntervention;
