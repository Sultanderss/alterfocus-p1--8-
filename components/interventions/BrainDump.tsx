/**
 * INTERVENCIÓN: BRAIN DUMP (Vaciado Mental)
 * 
 * Para arquetipos: CONFUSION, CONFUSION+LOW_ENERGY
 * Objetivo: Vaciar la mente para conseguir claridad
 * Duración: 5 minutos
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Timer, Check, X, Sparkles, FileText } from 'lucide-react';

interface BrainDumpProps {
    onComplete: (result: { points: number; success: boolean; intervention: string; charCount?: number }) => void;
    onCancel: () => void;
    archetype?: string;
}

export const BrainDumpIntervention: React.FC<BrainDumpProps> = ({
    onComplete,
    onCancel,
    archetype = 'Confusion'
}) => {
    const [phase, setPhase] = useState<'intro' | 'writing' | 'complete'>('intro');
    const [text, setText] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (phase !== 'writing' || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [phase, timeLeft]);

    useEffect(() => {
        if (timeLeft <= 0 && phase === 'writing') {
            setPhase('complete');
        }
    }, [timeLeft, phase]);

    useEffect(() => {
        if (phase === 'writing' && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [phase]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const wordCount = text.trim().split(/\s+/).filter(w => w).length;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
        >
            <div className="w-full max-w-lg h-full max-h-[90vh] flex flex-col">
                <AnimatePresence mode="wait">
                    {/* INTRO */}
                    {phase === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center space-y-6 my-auto"
                        >
                            {/* Icon */}
                            <motion.div
                                animate={{
                                    boxShadow: [
                                        '0 0 20px rgba(168, 85, 247, 0.3)',
                                        '0 0 60px rgba(168, 85, 247, 0.5)',
                                        '0 0 20px rgba(168, 85, 247, 0.3)'
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-24 h-24 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center"
                            >
                                <Brain size={48} className="text-white" />
                            </motion.div>

                            {/* Title */}
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2">
                                    Dump Mental 📝
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Vacía tu cabeza, encuentra claridad
                                </p>
                            </div>

                            {/* Explanation */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
                                <p className="text-white/90 leading-relaxed">
                                    <span className="font-bold text-violet-400">5 minutos sin parar.</span>
                                </p>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    Escribe TODO lo que está en tu cabeza. Sin orden, sin gramática, sin sentido. Solo sácalo.
                                </p>
                                <p className="text-white/50 text-xs italic">
                                    La confusión es ruido mental acumulado. Vaciarlo es el primer paso.
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
                                    onClick={() => setPhase('writing')}
                                    className="flex-1 py-4 px-6 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl text-white font-bold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
                                >
                                    <Timer size={18} className="inline mr-2" />
                                    Empezar (5 min)
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* WRITING */}
                    {phase === 'writing' && (
                        <motion.div
                            key="writing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col h-full"
                        >
                            {/* Header with Timer */}
                            <div className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center"
                                    >
                                        <Brain size={20} className="text-violet-400" />
                                    </motion.div>
                                    <div>
                                        <p className="text-white font-bold">Dump Mental</p>
                                        <p className="text-slate-500 text-xs">{wordCount} palabras</p>
                                    </div>
                                </div>

                                {/* Timer */}
                                <motion.div
                                    animate={timeLeft <= 30 ? { scale: [1, 1.05, 1] } : {}}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                    className={`text-3xl font-black ${timeLeft <= 30 ? 'text-orange-400' : 'text-white'}`}
                                >
                                    {formatTime(timeLeft)}
                                </motion.div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${((300 - timeLeft) / 300) * 100}%` }}
                                />
                            </div>

                            {/* Textarea */}
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Escribe sin parar... lo que sea que esté en tu cabeza... no te detengas a pensar ni a corregir... solo escribe..."
                                className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-lg placeholder-slate-600 focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed"
                            />

                            {/* Encouragement */}
                            <div className="py-4 text-center">
                                <p className="text-slate-400 text-sm">
                                    {text.length < 50 ? '¡Sigue escribiendo! No te detengas.' :
                                        text.length < 200 ? 'Bien, sigue vaciando tu mente...' :
                                            text.length < 500 ? '¡Excelente ritmo! Continúa...' :
                                                '¡Increíble! Tu mente se aclara.'}
                                </p>
                            </div>

                            {/* Skip Button */}
                            <button
                                onClick={() => setPhase('complete')}
                                className="text-slate-500 text-sm hover:text-slate-300 transition-colors py-2"
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
                            className="text-center space-y-6 my-auto"
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
                                    ¡Mente vaciada! 🧘
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Ahora hay espacio para claridad
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="flex justify-center gap-4">
                                <div className="bg-white/5 rounded-xl py-3 px-5 text-center">
                                    <div className="text-2xl font-bold text-white">{text.length}</div>
                                    <div className="text-xs text-slate-500">caracteres</div>
                                </div>
                                <div className="bg-white/5 rounded-xl py-3 px-5 text-center">
                                    <div className="text-2xl font-bold text-white">{wordCount}</div>
                                    <div className="text-xs text-slate-500">palabras</div>
                                </div>
                            </div>

                            {/* Insight */}
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                <p className="text-emerald-300 leading-relaxed">
                                    <Sparkles size={16} className="inline mr-2" />
                                    Todo ese ruido mental ya no está en tu cabeza. Ahora tu mente tiene espacio para pensar con claridad.
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
                                    intervention: 'brain_dump',
                                    charCount: text.length
                                })}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-emerald-500/30"
                            >
                                Continuar con claridad →
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default BrainDumpIntervention;
