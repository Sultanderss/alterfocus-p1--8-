import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';

interface GentleQuestionProps {
    onSelect: (response: 'anxiety' | 'confusion' | 'fatigue' | 'overwhelm') => void;
    onSkip: () => void;
    attemptCount: number;
}

/**
 * INTERVENTION MODALITY #1: Gentle Question (30-60s)
 * Used for first 1-2 distraction attempts
 * Increases self-awareness without imposing
 */
const GentleQuestion: React.FC<GentleQuestionProps> = ({ onSelect, onSkip, attemptCount }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/10">
                {/* Icon */}
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HelpCircle size={32} className="text-amber-400" />
                </div>

                {/* Header */}
                <h2 className="text-2xl font-bold text-white text-center mb-2">
                    ¿Qué te está frenando ahora?
                </h2>
                <p className="text-slate-300 text-center mb-8 text-sm">
                    Llevas {attemptCount} {attemptCount === 1 ? 'intento' : 'intentos'}. Ayúdame a entender qué necesitas.
                </p>

                {/* Options */}
                <div className="space-y-3 mb-6">
                    {[
                        { value: 'anxiety' as const, emoji: '😰', label: 'Ansiedad / Estrés', desc: 'Me siento abrumado' },
                        { value: 'confusion' as const, emoji: '🤔', label: 'Confusión', desc: 'No sé por dónde empezar' },
                        { value: 'fatigue' as const, emoji: '😴', label: 'Cansancio / Apatía', desc: 'Necesito energía' },
                        { value: 'overwhelm' as const, emoji: '😫', label: 'Necesito desconectar', desc: 'Siento presión extrema' },
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onSelect(option.value)}
                            className="w-full p-4 text-left rounded-xl border-2 border-slate-700 hover:border-brand-primary bg-slate-800/50 hover:bg-slate-700/70 transition-all flex items-center gap-4 group"
                        >
                            <span className="text-3xl">{option.emoji}</span>
                            <div className="flex-1">
                                <div className="font-bold text-white group-hover:text-brand-primary transition-colors">
                                    {option.label}
                                </div>
                                <div className="text-xs text-slate-400">{option.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Skip */}
                <button
                    onClick={onSkip}
                    className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    <X size={14} />
                    Saltar (volver al trabajo)
                </button>
            </div>
        </motion.div>
    );
};

export default GentleQuestion;
