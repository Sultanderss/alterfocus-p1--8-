/**
 * WELCOME SCREEN - First-time user experience
 * Premium, engaging intro with beautiful animations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Heart, Zap, Shield, Focus, Clock, Target } from 'lucide-react';

interface WelcomeScreenProps {
    onContinue: () => void;
}

const FEATURES = [
    { icon: Brain, text: 'IA que entiende tu contexto', color: 'from-purple-400 to-fuchsia-500', bgColor: 'bg-purple-500/20' },
    { icon: Heart, text: 'Sin culpa, solo ciencia', color: 'from-pink-400 to-rose-500', bgColor: 'bg-pink-500/20' },
    { icon: Zap, text: 'Intervenciones inteligentes', color: 'from-amber-400 to-orange-500', bgColor: 'bg-amber-500/20' },
    { icon: Shield, text: 'Construye hábitos reales', color: 'from-emerald-400 to-teal-500', bgColor: 'bg-emerald-500/20' },
];

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
    return (
        <div className="h-full bg-[#08080c] flex flex-col relative overflow-y-auto scrollbar-hide">

            {/* Background Orbs - Fixed Position relative to container */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 h-full">
                <motion.div
                    animate={{
                        x: [0, 60, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.4, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/40 via-fuchsia-500/30 to-pink-500/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 60, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                    className="absolute -bottom-20 -right-32 w-[450px] h-[450px] bg-gradient-to-tr from-cyan-500/30 via-blue-500/20 to-indigo-500/15 rounded-full blur-[100px]"
                />
            </div>

            {/* Scrollable Content */}
            <div className="relative z-10 flex flex-col items-center min-h-full px-6 pt-12 pb-8">

                {/* Logo Section */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 1.2, delay: 0.2 }}
                    className="relative mb-8"
                >
                    <div className="relative w-24 h-24 rounded-[2rem] bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 5, repeat: Infinity }}
                        >
                            <Brain size={48} className="text-white" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Text Content */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-4xl font-bold text-white mb-3 text-center leading-tight"
                >
                    Bienvenido a{' '}
                    <span className="block mt-1 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                        AlterFocus
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-slate-400 text-center max-w-xs mb-8 text-base leading-relaxed"
                >
                    Convierte tus mejores decisiones conscientes en buenos hábitos inconscientes.
                </motion.p>

                {/* Features Grid - Show all info at once */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="grid grid-cols-1 gap-3 w-full mb-8"
                >
                    {FEATURES.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 + (i * 0.1) }}
                            className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3"
                        >
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color} shadow-lg shrink-0`}>
                                {React.createElement(feature.icon, {
                                    size: 16,
                                    className: 'text-white',
                                })}
                            </div>
                            <span className="text-slate-200 text-sm font-medium">{feature.text}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                    className="w-full mt-auto"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onContinue}
                        className="w-full py-4 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-purple-500/30 transition-all"
                    >
                        <Sparkles size={20} />
                        Configurar mi cuenta
                        <ArrowRight size={20} />
                    </motion.button>
                    <p className="text-center text-slate-500 text-xs mt-3">
                        Solo toma 60 segundos ⚡
                    </p>
                </motion.div>

            </div>
        </div>
    );
}
