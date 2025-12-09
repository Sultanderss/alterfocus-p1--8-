/**
 * INTERVENCIÓN: VERSIÓN CRAPPY
 * 
 * Para arquetipos: FEAR, FEAR+LOW_ENERGY
 * Objetivo: Romper el perfeccionismo paralizante
 * Duración: 2 minutos
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Timer, Check, X, Sparkles } from 'lucide-react';

interface CrappyVersionProps {
    onComplete: (result: { points: number; success: boolean; intervention: string }) => void;
    onCancel: () => void;
    archetype?: string;
}

export const CrappyVersionIntervention: React.FC<CrappyVersionProps> = ({
    onComplete,
    onCancel,
    archetype = 'Fear'
}) => {
    const [phase, setPhase] = useState<'intro' | 'timer' | 'complete'>('intro');
    const [timeLeft, setTimeLeft] = useState(120);

    useEffect(() => {
        if (phase !== 'timer' || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [phase, timeLeft]);

    useEffect(() => {
        if (timeLeft <= 0 && phase === 'timer') {
            setPhase('complete');
        }
    }, [timeLeft, phase]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
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
                                animate={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/30"
                            >
                                <Palette size={48} className="text-white" />
                            </motion.div>

                            {/* Title */}
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2">
                                    Versión CRAPPY 🎨
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    El antídoto contra el perfeccionismo
                                </p>
                            </div>

                            {/* Explanation */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
                                <p className="text-white/90 leading-relaxed">
                                    <span className="font-bold text-orange-400">Regla:</span> Está PROHIBIDO hacerlo bien.
                                </p>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    Hazlo feo, rápido, sin calidad. El objetivo es EMPEZAR, no impresionar.
                                </p>
                                <p className="text-white/50 text-xs italic">
                                    "Lo perfecto es enemigo de lo hecho" — Voltaire
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
                                    onClick={() => setPhase('timer')}
                                    className="flex-1 py-4 px-6 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
                                >
                                    <Timer size={18} className="inline mr-2" />
                                    Empezar (2 min)
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* TIMER */}
                    {phase === 'timer' && (
                        <motion.div
                            key="timer"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="text-center space-y-8"
                        >
                            {/* Big Timer */}
                            <motion.div
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="relative"
                            >
                                <div className="text-8xl font-black text-white tracking-tighter">
                                    {formatTime(timeLeft)}
                                </div>
                                <div className="absolute inset-0 text-8xl font-black text-orange-500/20 blur-xl">
                                    {formatTime(timeLeft)}
                                </div>
                            </motion.div>

                            {/* Progress Bar */}
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${((120 - timeLeft) / 120) * 100}%` }}
                                />
                            </div>

                            {/* Encouragement */}
                            <div className="space-y-2">
                                <p className="text-2xl font-bold text-white">
                                    {timeLeft > 90 ? '¡Hazlo FEO!' :
                                        timeLeft > 60 ? '¿Horrible? ¡PERFECTO!' :
                                            timeLeft > 30 ? '¡Sigue así, sin pensar!' :
                                                '¡Ya casi terminas!'}
                                </p>
                                <p className="text-slate-400">
                                    No te detengas a corregir. Solo avanza.
                                </p>
                            </div>

                            {/* Skip Button */}
                            <button
                                onClick={() => setPhase('complete')}
                                className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
                            >
                                Terminé antes →
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
                                    ¡Lo hiciste! 🎉
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Ahora es mejor de lo que crees.
                                </p>
                            </div>

                            {/* Insight */}
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                <p className="text-emerald-300 leading-relaxed">
                                    <Sparkles size={16} className="inline mr-2" />
                                    El perfeccionismo te mantenía paralizado. Acabas de demostrar que puedes actuar sin ser perfecto.
                                </p>
                            </div>

                            {/* Points */}
                            <div className="bg-white/5 rounded-xl py-3 px-6 inline-flex items-center gap-2">
                                <span className="text-2xl">✨</span>
                                <span className="text-white font-bold text-xl">+20 puntos</span>
                            </div>

                            {/* Continue */}
                            <button
                                onClick={() => onComplete({ points: 20, success: true, intervention: 'crappy_version' })}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-emerald-500/30"
                            >
                                Continuar con claridad ✓
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default CrappyVersionIntervention;
