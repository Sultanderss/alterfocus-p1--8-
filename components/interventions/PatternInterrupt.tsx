/**
 * INTERVENCIÓN: PATTERN INTERRUPT (Interrupción de Patrón)
 * 
 * Para arquetipos: CHRONIC
 * Objetivo: Romper el contexto que activa el patrón automático
 * Duración: ~2 minutos
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check, X, Sparkles, MapPin, Music, Accessibility } from 'lucide-react';

interface PatternInterruptProps {
    onComplete: (result: { points: number; success: boolean; intervention: string; action?: string }) => void;
    onCancel: () => void;
    archetype?: string;
}

interface InterruptOption {
    id: string;
    icon: React.ReactNode;
    label: string;
    description: string;
    color: string;
    action: string;
}

export const PatternInterruptIntervention: React.FC<PatternInterruptProps> = ({
    onComplete,
    onCancel,
    archetype = 'Chronic'
}) => {
    const [phase, setPhase] = useState<'intro' | 'select' | 'doing' | 'complete'>('intro');
    const [selectedOption, setSelectedOption] = useState<InterruptOption | null>(null);
    const [countdown, setCountdown] = useState(30);

    const options: InterruptOption[] = [
        {
            id: 'location',
            icon: <MapPin size={24} />,
            label: 'Cambia de lugar',
            description: 'Ve a otra habitación o levántate y siéntate en otro lado',
            color: 'from-blue-500 to-cyan-500',
            action: 'location_change'
        },
        {
            id: 'music',
            icon: <Music size={24} />,
            label: 'Pon música diferente',
            description: 'Cambia completamente el ambiente sonoro',
            color: 'from-pink-500 to-rose-500',
            action: 'music_change'
        },
        {
            id: 'posture',
            icon: <Accessibility size={24} />,
            label: 'Cambia tu postura',
            description: 'Ponte de pie, estira, o adopta una pose de poder',
            color: 'from-emerald-500 to-teal-500',
            action: 'posture_change'
        }
    ];

    React.useEffect(() => {
        if (phase !== 'doing' || countdown <= 0) return;
        const timer = setInterval(() => setCountdown(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [phase, countdown]);

    React.useEffect(() => {
        if (countdown <= 0 && phase === 'doing') {
            setPhase('complete');
        }
    }, [countdown, phase]);

    const handleSelectOption = (option: InterruptOption) => {
        setSelectedOption(option);
        setPhase('doing');
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
                                animate={{ rotate: [0, 180, 360] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/30"
                            >
                                <RefreshCw size={48} className="text-white" />
                            </motion.div>

                            {/* Title */}
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2">
                                    Interrupción de Patrón 🔄
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Rompe el loop automático
                                </p>
                            </div>

                            {/* Explanation */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
                                <p className="text-white/90 leading-relaxed">
                                    <span className="font-bold text-cyan-400">Tu cerebro repite patrones por el CONTEXTO.</span>
                                </p>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    Si cambias el contexto (lugar, música, postura), el patrón se rompe y tu cerebro puede elegir diferente.
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
                                    onClick={() => setPhase('select')}
                                    className="flex-1 py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
                                >
                                    Elegir acción
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* SELECT OPTION */}
                    {phase === 'select' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            {/* Header */}
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    ¿Cómo quieres romper el patrón?
                                </h3>
                                <p className="text-slate-400 text-sm">
                                    Elige una acción para cambiar tu contexto
                                </p>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                {options.map((option, index) => (
                                    <motion.button
                                        key={option.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => handleSelectOption(option)}
                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all text-left flex items-center gap-4"
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center text-white`}>
                                            {option.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-bold">{option.label}</p>
                                            <p className="text-slate-400 text-sm">{option.description}</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* DOING */}
                    {phase === 'doing' && selectedOption && (
                        <motion.div
                            key="doing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="text-center space-y-8"
                        >
                            {/* Big Icon */}
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className={`w-32 h-32 mx-auto bg-gradient-to-br ${selectedOption.color} rounded-3xl flex items-center justify-center shadow-2xl`}
                            >
                                {React.cloneElement(selectedOption.icon as React.ReactElement, { size: 64 })}
                            </motion.div>

                            {/* Timer */}
                            <div>
                                <motion.div
                                    animate={{ scale: [1, 1.02, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="text-6xl font-black text-white"
                                >
                                    {countdown}s
                                </motion.div>
                                <p className="text-slate-400 text-lg mt-2">
                                    {selectedOption.label}
                                </p>
                            </div>

                            {/* Instruction */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <p className="text-white/90 leading-relaxed">
                                    {selectedOption.description}
                                </p>
                            </div>

                            {/* Skip */}
                            <button
                                onClick={() => setPhase('complete')}
                                className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
                            >
                                Ya lo hice →
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
                                    ¡Patrón interrumpido! 🎉
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Tu cerebro ahora puede elegir diferente
                                </p>
                            </div>

                            {/* Insight */}
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                <p className="text-emerald-300 leading-relaxed">
                                    <Sparkles size={16} className="inline mr-2" />
                                    Cambiaste el contexto. Eso resetea los circuitos automáticos de tu cerebro. Ahora tienes una oportunidad de actuar conscientemente.
                                </p>
                            </div>

                            {/* Points */}
                            <div className="bg-white/5 rounded-xl py-3 px-6 inline-flex items-center gap-2">
                                <span className="text-2xl">✨</span>
                                <span className="text-white font-bold text-xl">+20 puntos</span>
                            </div>

                            {/* Continue */}
                            <button
                                onClick={() => onComplete({
                                    points: 20,
                                    success: true,
                                    intervention: 'pattern_interrupt',
                                    action: selectedOption?.action
                                })}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-emerald-500/30"
                            >
                                Empezar con mente fresca →
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default PatternInterruptIntervention;
