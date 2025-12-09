import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Clock, Shield, AlertTriangle, Lock, Sparkles, Target, Wind, Brain, Dumbbell, Heart } from 'lucide-react';

interface GentleQuestionProps {
    onSelect: (response: 'anxiety' | 'confusion' | 'fatigue' | 'overwhelm') => void;
    onSkip: () => void;
    attemptCount: number;
    options?: string[];
    blockedSite?: string;
    // Progressive Autonomy System
    ignoreButtonUnlocked?: boolean;
    autonomyLevel?: 'aprendiz' | 'practicante' | 'autonomo' | 'maestro';
    circadianMessage?: string;
    // New AI Content
    aiContent?: {
        message: string;
        tone: 'empathic' | 'motivational' | 'direct';
        actions?: { label: string; duration: number; icon: string }[];
    };
}

/**
 * INTERVENTION MODALITY #1: Gentle Question with Progressive Friction
 * 
 * FRICTION LEVELS:
 * - Attempt 1: Simple question, no friction
 * - Attempt 2: 5 second delay before skip available + reward incentive
 * - Attempt 3: 10 second delay + warning about blocking
 * - Attempt 4+: BLOCKED - Must complete an intervention activity
 */
const GentleQuestion: React.FC<GentleQuestionProps> = ({
    onSelect,
    onSkip,
    attemptCount,
    options,
    blockedSite,
    ignoreButtonUnlocked = false,
    autonomyLevel = 'aprendiz',
    circadianMessage,
    aiContent
}) => {
    const [skipCooldown, setSkipCooldown] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const [showTools, setShowTools] = useState(false);

    // Progressive friction based on attempt count
    useEffect(() => {
        if (attemptCount >= 4) {
            setIsBlocked(true);
            setSkipCooldown(999); // Permanently blocked for this session
        } else if (attemptCount === 3) {
            setSkipCooldown(10);
        } else if (attemptCount === 2) {
            setSkipCooldown(5);
        } else {
            setSkipCooldown(0);
        }
    }, [attemptCount]);

    // Countdown timer
    useEffect(() => {
        if (skipCooldown > 0 && !isBlocked) {
            const timer = setTimeout(() => {
                setSkipCooldown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [skipCooldown, isBlocked]);

    const getHeaderContent = () => {
        if (isBlocked) {
            return {
                icon: Lock,
                iconColor: 'text-red-400',
                iconBg: 'bg-red-500/20',
                title: 'Modo Protección Activado',
                subtitle: 'Has intentado abandonar muchas veces. Es momento de practicar una técnica antes de continuar.'
            };
        }

        // AI Override
        if (aiContent) {
            return {
                icon: Sparkles,
                iconColor: 'text-indigo-400',
                iconBg: 'bg-indigo-500/20',
                title: 'Alternativa Inteligente',
                subtitle: aiContent.message
            };
        }

        if (attemptCount >= 3) {
            return {
                icon: AlertTriangle,
                iconColor: 'text-amber-400',
                iconBg: 'bg-amber-500/20',
                title: '¿Estás seguro?',
                subtitle: `Al siguiente intento, se activará el modo protección. Llevas ${attemptCount} intentos.`
            };
        }
        if (attemptCount === 2) {
            return {
                icon: Shield,
                iconColor: 'text-cyan-400',
                iconBg: 'bg-cyan-500/20',
                title: 'Un momento de reflexión',
                subtitle: blockedSite
                    ? `Intentaste acceder a ${blockedSite}. ¿Qué está pasando realmente?`
                    : 'Antes de decidir, piensa: ¿esto te acerca a tu objetivo?'
            };
        }
        return {
            icon: HelpCircle,
            iconColor: 'text-purple-400',
            iconBg: 'bg-purple-500/20',
            title: '¿Qué necesitas ahora?',
            subtitle: 'Solo tomará un momento ayudarte a elegir mejor'
        };
    };

    const headerContent = getHeaderContent();
    const HeaderIcon = headerContent.icon;

    // Quick tools for blocked state
    const quickTools = [
        {
            id: 'breathing',
            icon: Wind,
            label: 'Respirar 1 min',
            color: 'from-teal-500 to-cyan-600',
            emotion: 'anxiety' as const
        },
        {
            id: 'reframe',
            icon: Brain,
            label: 'Reflexionar',
            color: 'from-purple-500 to-pink-600',
            emotion: 'confusion' as const
        },
        {
            id: 'move',
            icon: Dumbbell,
            label: 'Moverme',
            color: 'from-orange-500 to-red-600',
            emotion: 'fatigue' as const
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center z-50 p-4"
        >
            {/* Background animations based on severity */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.05, 0.1, 0.05]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className={`absolute inset-0 pointer-events-none ${isBlocked
                    ? 'bg-gradient-to-br from-red-500 to-pink-600'
                    : attemptCount >= 3
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                        : 'bg-gradient-to-br from-purple-500 to-blue-600'
                    }`}
            />

            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/10 overflow-hidden"
            >
                {/* Decorative glow */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isBlocked
                    ? 'from-red-500 via-pink-500 to-red-500'
                    : attemptCount >= 3
                        ? 'from-amber-500 via-orange-500 to-amber-500'
                        : 'from-purple-500 via-blue-500 to-purple-500'
                    }`} />

                {/* Header */}
                <div className="text-center mb-6">
                    <motion.div
                        animate={isBlocked ? { rotate: [0, -10, 10, -10, 0] } : {}}
                        transition={{ duration: 0.5, repeat: isBlocked ? Infinity : 0, repeatDelay: 2 }}
                        className={`w-16 h-16 ${headerContent.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                        <HeaderIcon size={32} className={headerContent.iconColor} />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        {headerContent.title}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        {headerContent.subtitle}
                    </p>
                </div>

                {/* Attempt counter badge */}
                {attemptCount > 1 && (
                    <div className="flex justify-center mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isBlocked
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : attemptCount >= 3
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-700 text-slate-300'
                            }`}>
                            {isBlocked ? '🔒 Bloqueado temporalmente' : `Intento ${attemptCount}/3`}
                        </div>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {isBlocked ? (
                        /* BLOCKED STATE - Must choose a tool */
                        <motion.div
                            key="blocked"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <p className="text-center text-sm text-slate-300 mb-4">
                                Elige una actividad breve para desbloquear:
                            </p>

                            <div className="grid grid-cols-3 gap-3">
                                {quickTools.map((tool, i) => (
                                    <motion.button
                                        key={tool.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onSelect(tool.emotion)}
                                        className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                                    >
                                        <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                                            <tool.icon size={24} className="text-white" />
                                        </div>
                                        <span className="text-xs text-white font-medium text-center">
                                            {tool.label}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                                <div className="flex items-center gap-2 text-green-400 text-sm">
                                    <Sparkles size={16} />
                                    <span className="font-bold">+25 puntos</span>
                                    <span className="text-green-300/70">por completar la actividad</span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* NORMAL STATE - Emotion options */
                        <motion.div
                            key="normal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Circadian context message - SHOWN PROMINENTLY */}
                            {circadianMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                                >
                                    <p className="text-sm text-indigo-300 text-center">
                                        🕐 {circadianMessage}
                                    </p>
                                </motion.div>
                            )}

                            {/* Emotion Options */}
                            <div className="space-y-2 mb-6">
                                {[
                                    { value: 'anxiety' as const, emoji: '😰', label: 'Ansiedad / Estrés', desc: 'Me siento abrumado', color: 'hover:border-teal-500' },
                                    { value: 'confusion' as const, emoji: '🤔', label: 'Confusión', desc: 'No sé por dónde empezar', color: 'hover:border-purple-500' },
                                    { value: 'fatigue' as const, emoji: '😴', label: 'Cansancio / Apatía', desc: 'Necesito energía', color: 'hover:border-orange-500' },
                                    { value: 'overwhelm' as const, emoji: '😫', label: 'Necesito ayuda', desc: 'Quiero hablar sobre esto', color: 'hover:border-pink-500' },
                                ].map((option, i) => {
                                    // Intelligent Recommendation Logic
                                    const isRecommended =
                                        (circadianMessage?.toLowerCase().includes('fatiga') && option.value === 'fatigue') ||
                                        (circadianMessage?.toLowerCase().includes('energía') && option.value === 'fatigue') ||
                                        (circadianMessage?.toLowerCase().includes('estrés') && option.value === 'anxiety') ||
                                        (circadianMessage?.toLowerCase().includes('abrumado') && option.value === 'anxiety');

                                    return (
                                        <motion.button
                                            key={option.value}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            onClick={() => onSelect(option.value)}
                                            className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center gap-4 group relative overflow-hidden
                                                ${isRecommended
                                                    ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/20 ring-1 ring-purple-400'
                                                    : `border-slate-700 ${option.color} bg-slate-800/50 hover:bg-slate-700/70`
                                                }`}
                                        >
                                            {isRecommended && (
                                                <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-bl-lg">
                                                    Sugerido por IA
                                                </div>
                                            )}
                                            <span className="text-3xl">{option.emoji}</span>
                                            <div className="flex-1">
                                                <div className={`font-bold transition-colors ${isRecommended ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                                    {option.label}
                                                </div>
                                                <div className={`text-xs ${isRecommended ? 'text-purple-200' : 'text-slate-400'}`}>{option.desc}</div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Reward incentive */}
                            <div className="mb-4 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
                                <div className="flex items-center gap-2 text-amber-400 text-sm">
                                    <Target size={16} />
                                    <span>Volver al trabajo ahora = <strong>+25 puntos</strong></span>
                                </div>
                            </div>

                            {/* Skip button with cooldown - PROGRESSIVE AUTONOMY SYSTEM */}
                            {ignoreButtonUnlocked ? (
                                /* ✅ UNLOCKED: User has earned skip privilege */
                                <motion.button
                                    onClick={skipCooldown === 0 ? onSkip : undefined}
                                    disabled={skipCooldown > 0}
                                    className={`w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${skipCooldown > 0
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                                        }`}
                                >
                                    {skipCooldown > 0 ? (
                                        <>
                                            <Clock size={14} />
                                            Espera {skipCooldown}s para saltar
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={14} />
                                            ✓ Ignorar (Nivel {autonomyLevel})
                                        </>
                                    )}
                                </motion.button>
                            ) : (
                                /* 🔒 LOCKED: User must earn skip privilege */
                                <div className="space-y-2">
                                    <div className="w-full py-3 px-4 rounded-xl text-sm font-medium bg-slate-800/50 border border-slate-700 flex items-center justify-center gap-3">
                                        <Lock size={14} className="text-slate-500" />
                                        <span className="text-slate-500">
                                            Ignorar bloqueado
                                        </span>
                                    </div>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center text-xs text-slate-500"
                                    >
                                        {autonomyLevel === 'aprendiz' && (
                                            <>🌱 <strong>Nivel Aprendiz:</strong> Completa intervenciones para desbloquear "Ignorar"</>
                                        )}
                                        {autonomyLevel === 'practicante' && (
                                            <>⭐ <strong>Nivel Practicante:</strong> Mantén 7 días de racha para desbloquear</>
                                        )}
                                    </motion.p>
                                </div>
                            )}



                            {/* Warning for high attempt count */}
                            {attemptCount >= 3 && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center text-xs text-amber-400/70 mt-3"
                                >
                                    ⚠️ Próximo intento activará el modo protección
                                </motion.p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default GentleQuestion;
