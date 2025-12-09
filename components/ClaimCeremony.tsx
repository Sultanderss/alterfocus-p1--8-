/**
 * CLAIM CEREMONY - The ritual of reclaiming your time
 * 
 * Philosophy: "Has tallado otro Momento de claridad en tu día."
 * Visual: Orbes de Luz, no monedas. Latido + respiración, no arcade.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUp, Flame } from 'lucide-react';
import { claimMomento, getUserIdentity } from '../services/momentoService';
import { MomentoSource, getLevelMessage, getLevelProgress, IdentityLevel } from '../types/identity';

interface ClaimCeremonyProps {
    source: MomentoSource;
    sessionDuration?: number;
    onComplete: () => void;
    onClose: () => void;
}

// Messages aligned with Identity Economy philosophy
const CLAIM_MESSAGES = [
    'Has tallado otro Momento de claridad en tu día.',
    'Tiempo recuperado. Esto es tuyo.',
    'Un paso más hacia quien quieres ser.',
    'La constancia construye identidad.',
    'Este Momento permanece en tu historial.',
];

const SOURCE_LABELS: Record<MomentoSource, string> = {
    focus_session: 'Sesión de enfoque',
    rayo_intervention: 'Momento Salvado',
    breathing: 'Respiración consciente',
    offline_study: 'Estudio sin pantalla',
    flip_phone: 'Modo Flip Phone',
};

export default function ClaimCeremony({ source, sessionDuration, onComplete, onClose }: ClaimCeremonyProps) {
    const [phase, setPhase] = useState<'ready' | 'claiming' | 'complete'>('ready');
    const [result, setResult] = useState<{
        newTotal: number;
        levelUp: boolean;
        newLevel?: IdentityLevel;
        newStreak: number;
    } | null>(null);

    const message = CLAIM_MESSAGES[Math.floor(Math.random() * CLAIM_MESSAGES.length)];

    const handleClaim = async () => {
        setPhase('claiming');

        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50]); // Soft pulse like a heartbeat
        }

        const claimResult = await claimMomento(source, sessionDuration);

        setTimeout(() => {
            setResult(claimResult);
            setPhase('complete');
        }, 1500);
    };

    const handleFinish = () => {
        onComplete();
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm mx-4"
            >
                <AnimatePresence mode="wait">
                    {/* READY PHASE - Show the claim button */}
                    {phase === 'ready' && (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            {/* Orb of Light */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.8, 1, 0.8],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-400/30 via-blue-400/30 to-emerald-400/30 flex items-center justify-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                            </motion.div>

                            {/* Source label */}
                            <p className="text-white/50 text-sm mb-2">{SOURCE_LABELS[source]}</p>

                            {sessionDuration && (
                                <p className="text-white/70 text-lg mb-6">{sessionDuration} minutos de claridad</p>
                            )}

                            {/* Claim button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClaim}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-purple-500/30"
                            >
                                Reclamar Momento
                            </motion.button>

                            <p className="text-white/30 text-xs mt-4">
                                Este momento permanecerá en tu historial
                            </p>
                        </motion.div>
                    )}

                    {/* CLAIMING PHASE - Animation */}
                    {phase === 'claiming' && (
                        <motion.div
                            key="claiming"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                }}
                                transition={{ duration: 1.5, ease: 'easeInOut' }}
                                className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 flex items-center justify-center"
                            >
                                <Sparkles className="w-16 h-16 text-white" />
                            </motion.div>
                        </motion.div>
                    )}

                    {/* COMPLETE PHASE - Show result */}
                    {phase === 'complete' && result && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                        >
                            {/* Success orb */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50"
                            >
                                <Sparkles className="w-12 h-12 text-white" />
                            </motion.div>

                            {/* Message */}
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Momento Reclamado
                            </h2>
                            <p className="text-white/70 mb-6 max-w-xs mx-auto">
                                {message}
                            </p>

                            {/* Stats */}
                            <div className="flex justify-center gap-6 mb-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white">{result.newTotal}</div>
                                    <div className="text-xs text-white/50">Momentos totales</div>
                                </div>
                                {result.newStreak > 0 && (
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-orange-400 flex items-center justify-center gap-1">
                                            <Flame size={24} />
                                            {result.newStreak}
                                        </div>
                                        <div className="text-xs text-white/50">Racha de días</div>
                                    </div>
                                )}
                            </div>

                            {/* Level up notification */}
                            {result.levelUp && result.newLevel && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30"
                                >
                                    <div className="flex items-center justify-center gap-2 text-purple-400 mb-1">
                                        <ArrowUp size={18} />
                                        <span className="font-bold">Nuevo Nivel</span>
                                    </div>
                                    <div className="text-white font-bold">{result.newLevel}</div>
                                    <p className="text-white/60 text-sm mt-1">
                                        {getLevelMessage(result.newLevel)}
                                    </p>
                                </motion.div>
                            )}

                            {/* Continue button */}
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                onClick={handleFinish}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
                            >
                                Continuar
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
