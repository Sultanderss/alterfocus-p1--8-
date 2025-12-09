/**
 * INTERVENCIÓN: GESTO ANCHOR (Liberación del Miedo)
 * 
 * Para arquetipos: FEAR, FEAR+CONFUSION
 * Objetivo: Usar el cuerpo para liberar ansiedad
 * Duración: ~20-30 segundos
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Check, X, Sparkles } from 'lucide-react';

interface GestureAnchorProps {
    onComplete: (result: { points: number; success: boolean; intervention: string }) => void;
    onCancel: () => void;
    archetype?: string;
}

export const GestureAnchorIntervention: React.FC<GestureAnchorProps> = ({
    onComplete,
    onCancel,
    archetype = 'Fear'
}) => {
    const [phase, setPhase] = useState<'intro' | 'closed' | 'open' | 'complete'>('intro');

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
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30"
                            >
                                <Hand size={48} className="text-white" />
                            </motion.div>

                            {/* Title */}
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2">
                                    Gesto de Liberación 🤝
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Tu cuerpo libera lo que tu mente no puede
                                </p>
                            </div>

                            {/* Explanation */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
                                <p className="text-white/90 leading-relaxed">
                                    <span className="font-bold text-purple-400">Técnica de anclaje somático.</span>
                                </p>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    El miedo vive en tu cuerpo. Vamos a liberarlo con un gesto físico simple pero poderoso.
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
                                    onClick={() => setPhase('closed')}
                                    className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
                                >
                                    Empezar
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* CLOSED FIST */}
                    {phase === 'closed' && (
                        <motion.div
                            key="closed"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="text-center space-y-8"
                        >
                            {/* Big Emoji */}
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-[120px] leading-none"
                            >
                                ✊
                            </motion.div>

                            {/* Instructions */}
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-white">
                                    Cierra la mano en puño
                                </h3>
                                <p className="text-slate-400 text-lg">
                                    Siente la tensión. Ahí está tu miedo.
                                </p>

                                {/* Speech Prompt */}
                                <div className="bg-purple-500/20 border border-purple-500/30 rounded-2xl p-4 mt-6">
                                    <p className="text-purple-300 font-medium">
                                        Di en voz alta:
                                    </p>
                                    <p className="text-white text-xl font-bold mt-2">
                                        "Tengo miedo, pero ELIJO..."
                                    </p>
                                </div>
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => setPhase('open')}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-purple-500/30"
                            >
                                Listo, lo dije ✓
                            </button>
                        </motion.div>
                    )}

                    {/* OPEN HAND */}
                    {phase === 'open' && (
                        <motion.div
                            key="open"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="text-center space-y-8"
                        >
                            {/* Big Emoji - Opening Animation */}
                            <motion.div
                                initial={{ scale: 0.8, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 8 }}
                                className="text-[120px] leading-none"
                            >
                                ✋
                            </motion.div>

                            {/* Instructions */}
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-white">
                                    Abre la mano lentamente
                                </h3>
                                <p className="text-slate-400 text-lg">
                                    Suelta la tensión. Libera el miedo.
                                </p>

                                {/* Speech Prompt */}
                                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 mt-6">
                                    <p className="text-emerald-300 font-medium">
                                        Di en voz alta:
                                    </p>
                                    <p className="text-white text-xl font-bold mt-2">
                                        "Elijo ACTUAR a pesar del miedo"
                                    </p>
                                </div>
                            </div>

                            {/* Complete Button */}
                            <button
                                onClick={() => {
                                    // Vibrate if available
                                    if (navigator.vibrate) {
                                        navigator.vibrate([100, 50, 100]);
                                    }
                                    setPhase('complete');
                                }}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-emerald-500/30"
                            >
                                ✅ Elegí actuar
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
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 10 }}
                                className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                            >
                                <Check size={48} className="text-white" />
                            </motion.div>

                            {/* Message */}
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2">
                                    ¡Liberado! 🎉
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    El miedo ya no te controla
                                </p>
                            </div>

                            {/* Insight */}
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                <p className="text-emerald-300 leading-relaxed">
                                    <Sparkles size={16} className="inline mr-2" />
                                    Usaste tu cuerpo para cambiar tu mente. Esto crea nuevas vías neurológicas. Entre más lo hagas, más fuerte serás.
                                </p>
                            </div>

                            {/* Points */}
                            <div className="bg-white/5 rounded-xl py-3 px-6 inline-flex items-center gap-2">
                                <span className="text-2xl">✨</span>
                                <span className="text-white font-bold text-xl">+15 puntos</span>
                            </div>

                            {/* Continue */}
                            <button
                                onClick={() => onComplete({ points: 15, success: true, intervention: 'gesture_anchor' })}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-emerald-500/30"
                            >
                                Ahora sí, a trabajar →
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default GestureAnchorIntervention;
