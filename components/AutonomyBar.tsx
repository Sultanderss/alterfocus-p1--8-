import React from 'react';
import { motion } from 'framer-motion';
import { calculateAutonomyLevel, AUTONOMY_MESSAGES, AutonomyProgress } from '../services/autonomySystem';
import { Trophy, Sparkles, TrendingUp } from 'lucide-react';

interface Props {
    progress: AutonomyProgress;
}

export default function AutonomyBar({ progress }: Props) {
    const level = calculateAutonomyLevel(progress);
    const message = AUTONOMY_MESSAGES[level];

    // Color gradients for each level
    const levelColors = {
        aprendiz: 'from-blue-500 to-indigo-600',
        practicante: 'from-purple-500 to-pink-600',
        autonomo: 'from-emerald-500 to-teal-600',
        maestro: 'from-amber-500 to-orange-600'
    };

    const levelEmojis = {
        aprendiz: '🌱',
        practicante: '⚡',
        autonomo: '🔥',
        maestro: '👑'
    };

    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative"
        >
            {/* Main Bar */}
            <div className="bg-gradient-to-r from-brand-dark via-brand-surface to-brand-dark backdrop-blur-md border-b border-white/10 overflow-hidden">
                {/* Animated Background Glow */}
                <motion.div
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    className={`absolute inset-0 bg-gradient-to-r ${levelColors[level]} opacity-20 blur-2xl`}
                />

                {/* Content */}
                <div className="relative z-10 flex items-center justify-between px-4 py-3">
                    {/* Left: Level Info */}
                    <div className="flex items-center gap-3">
                        {/* Animated Trophy Icon */}
                        <motion.div
                            animate={{
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                        >
                            <Trophy size={24} className={`text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]`} />
                        </motion.div>

                        {/* Level Badge */}
                        <div className="flex items-center gap-2">
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="text-2xl"
                            >
                                {levelEmojis[level]}
                            </motion.span>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Nivel</span>
                                    <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Sparkles size={12} className="text-brand-primary" />
                                    </motion.div>
                                </div>
                                <span className="text-sm font-bold text-slate-100 font-display">
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Progress Stats */}
                    <div className="flex items-center gap-4">
                        {/* Success Count */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20"
                        >
                            <TrendingUp size={14} className="text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-300">
                                {progress.successfulInterventions}
                            </span>
                        </motion.div>

                        {/* Days Streak */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20"
                        >
                            <span className="text-xs">🔥</span>
                            <span className="text-xs font-semibold text-amber-300">
                                {progress.daysStreak}d
                            </span>
                        </motion.div>
                    </div>
                </div>

                {/* Progress Bar at Bottom */}
                <div className="relative h-1 bg-black/30">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((progress.successfulInterventions / 20) * 100, 100)}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                        className={`h-full bg-gradient-to-r ${levelColors[level]} shadow-[0_0_10px_rgba(99,102,241,0.5)]`}
                    />
                </div>
            </div>

            {/* Welcome Message Tooltip (appears on hover) */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 px-4 py-2 bg-brand-surface/95 backdrop-blur-md rounded-lg border border-white/10 shadow-xl pointer-events-none z-50 max-w-xs"
            >
                <p className="text-xs text-slate-300 text-center">{message.welcome}</p>
            </motion.div>
        </motion.div>
    );
}
