import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Star, Zap } from 'lucide-react';

interface PostSessionFeedback {
    helpfulnessScore: 1 | 2 | 3 | 4 | 5;
    timeWastedAfter: number;
    didCompleteTask: boolean;
    userComment?: string;
}

interface PostSessionModalProps {
    sessionData: {
        objective: string;
        elapsedMinutes: number;
        distractionsCount: number;
        toolsUsed: string[];
    };
    onSubmit: (feedback: PostSessionFeedback) => void;
    onClose: () => void;
}

export const PostSessionModal: React.FC<PostSessionModalProps> = ({
    sessionData,
    onSubmit,
    onClose,
}) => {
    const [step, setStep] = useState<'questions' | 'celebration'>('questions');
    const [form, setForm] = useState<PostSessionFeedback>({
        helpfulnessScore: 3,
        timeWastedAfter: 0,
        didCompleteTask: false,
    });

    const handleSubmit = () => {
        onSubmit(form);
        if (form.didCompleteTask && form.helpfulnessScore >= 4) {
            setStep('celebration');
        } else {
            onClose();
        }
    };

    // Celebration Screen
    if (step === 'celebration') {
        const improvementPercent = Math.max(0, 100 - (sessionData.distractionsCount * 10));

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.8, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gradient-to-br from-brand-primary/20 via-brand-dark to-brand-surface rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 text-center border border-brand-primary/30"
                >
                    {/* Animated Trophy */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                        className="inline-block"
                    >
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50">
                            <Trophy size={48} className="text-white" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white">
                            ¡Lo lograste! 💪
                        </h2>
                        <p className="text-lg text-slate-300">
                            Completaste "{sessionData.objective}"
                        </p>
                    </div>

                    {/* Stats Card */}
                    <div className="glass-card p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-left">
                                <p className="text-sm font-semibold text-slate-400">Mejora vs promedio</p>
                                <p className="text-3xl font-bold text-brand-primary">
                                    +{improvementPercent}%
                                </p>
                            </div>
                            <TrendingUp size={32} className="text-emerald-400" />
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
                            <div className="text-center">
                                <p className="text-2xl mb-1">⏱️</p>
                                <p className="text-xs font-bold text-white">{sessionData.elapsedMinutes} min</p>
                                <p className="text-[10px] text-slate-400">Enfocado</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl mb-1">🎯</p>
                                <p className="text-xs font-bold text-white">{sessionData.distractionsCount}</p>
                                <p className="text-[10px] text-slate-400">Distracciones</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl mb-1">🛠️</p>
                                <p className="text-xs font-bold text-white">{sessionData.toolsUsed.length}</p>
                                <p className="text-[10px] text-slate-400">Herramientas</p>
                            </div>
                        </div>
                    </div>

                    {/* Rewards */}
                    <div className="glass-card p-4 space-y-3">
                        <p className="text-sm font-semibold text-slate-300">Recompensas ganadas:</p>
                        <div className="flex justify-around">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-center"
                            >
                                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mb-1">
                                    <Zap size={24} className="text-amber-400" fill="currentColor" />
                                </div>
                                <p className="text-xs font-bold text-white">+50 XP</p>
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-center"
                            >
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-1">
                                    <Star size={24} className="text-emerald-400" fill="currentColor" />
                                </div>
                                <p className="text-xs font-bold text-white">Streak +1</p>
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-center"
                            >
                                <div className="w-12 h-12 bg-brand-primary/20 rounded-full flex items-center justify-center mb-1">
                                    <Trophy size={24} className="text-brand-primary" />
                                </div>
                                <p className="text-xs font-bold text-white">Badge</p>
                            </motion.div>
                        </div>
                    </div>

                    {/* CTA */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="w-full px-6 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                    >
                        Volver al Dashboard
                    </motion.button>
                </motion.div>
            </motion.div>
        );
    }

    // Questions Screen
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-panel rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-white/10"
                >
                    {/* Header */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            ¿Qué tal fue la sesión?
                        </h2>
                        <p className="text-sm text-slate-400">
                            Tu feedback nos ayuda a mejorar las intervenciones
                        </p>
                    </div>

                    {/* Question 1: Helpfulness Score */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-200">
                            🎯 ¿Qué tan útil fue AlterFocus hoy?
                        </label>
                        <div className="flex gap-2 justify-between">
                            {[1, 2, 3, 4, 5].map((score) => (
                                <motion.button
                                    key={score}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setForm({ ...form, helpfulnessScore: score as any })}
                                    className={`w-12 h-12 rounded-xl font-bold transition-all ${form.helpfulnessScore === score
                                            ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/30'
                                            : 'glass-button text-slate-300 hover:bg-white/10'
                                        }`}
                                >
                                    {score}
                                </motion.button>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Nada útil</span>
                            <span>Muy útil</span>
                        </div>
                    </div>

                    {/* Question 2: Time Wasted */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-200">
                            ⏱️ ¿Cuánto tiempo perdiste en distracciones?
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min="0"
                                max="180"
                                value={form.timeWastedAfter}
                                onChange={(e) =>
                                    setForm({ ...form, timeWastedAfter: parseInt(e.target.value) || 0 })
                                }
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                placeholder="0"
                            />
                            <span className="text-sm font-semibold text-slate-400">minutos</span>
                        </div>
                    </div>

                    {/* Question 3: Task Completion */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-200">
                            ✅ ¿Completaste tu objetivo?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Sí, completé', value: true, emoji: '✓', color: 'emerald' },
                                { label: 'No, parcial', value: false, emoji: '○', color: 'slate' },
                            ].map((opt) => (
                                <motion.button
                                    key={opt.label}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setForm({ ...form, didCompleteTask: opt.value })}
                                    className={`p-4 rounded-xl font-semibold transition-all ${form.didCompleteTask === opt.value
                                            ? opt.value
                                                ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300'
                                                : 'bg-slate-500/20 border-2 border-slate-500 text-slate-300'
                                            : 'glass-button text-slate-400 border-2 border-transparent'
                                        }`}
                                >
                                    <span className="text-xl mb-1 block">{opt.emoji}</span>
                                    <span className="text-sm">{opt.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Question 4: Optional Comment */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-200">
                            💭 Comentario (opcional)
                        </label>
                        <textarea
                            value={form.userComment || ''}
                            onChange={(e) => setForm({ ...form, userComment: e.target.value })}
                            placeholder="¿Qué podríamos mejorar?"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="flex-1 px-4 py-3 glass-button text-slate-300 font-bold rounded-xl hover:bg-white/10"
                        >
                            Omitir
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl"
                        >
                            Enviar
                        </motion.button>
                    </div>

                    <p className="text-xs text-slate-500 text-center">
                        Tu feedback es anónimo y nos ayuda a mejorar AlterFocus
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PostSessionModal;
