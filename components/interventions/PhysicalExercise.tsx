import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check } from 'lucide-react';

interface PhysicalExerciseProps {
    onComplete: (completed: boolean) => void;
}

/**
 * INTERVENTION MODALITY #3: Physical Exercise (120s)
 * Used when user shows fatigue/low energy
 * Activates dopamine and resets mental state
 */
const PhysicalExercise: React.FC<PhysicalExerciseProps> = ({ onComplete }) => {
    const [exerciseCount, setExerciseCount] = useState(0);
    const [selectedExercise, setSelectedExercise] = useState<'pushups' | 'squats' | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    const TARGET = 10;

    useEffect(() => {
        if (exerciseCount >= TARGET && !isComplete) {
            setIsComplete(true);
            setTimeout(() => onComplete(true), 2000);
        }
    }, [exerciseCount, isComplete, onComplete]);

    if (!selectedExercise) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center z-50 p-4"
            >
                <div className="text-center text-white max-w-lg">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8"
                    >
                        <Zap size={48} className="text-yellow-300" fill="currentColor" />
                    </motion.div>

                    <h2 className="text-4xl font-bold mb-4">¡Actívate! 💪</h2>
                    <p className="text-xl mb-10 text-pink-200">
                        Detecté cansancio. Vamos a generar dopamina y claridad mental con movimiento.
                    </p>

                    <p className="text-lg mb-8 text-white/90">Elige tu ejercicio (harás 10):</p>

                    <div className="grid grid-cols-2 gap-6">
                        <button
                            onClick={() => setSelectedExercise('pushups')}
                            className="py-8 px-6 bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white/60 rounded-2xl transition-all hover:scale-105 backdrop-blur"
                        >
                            <div className="text-5xl mb-3">💪</div>
                            <div className="font-bold text-xl">Flexiones</div>
                            <div className="text-sm text-pink-200 mt-2">Brazos + pecho</div>
                        </button>

                        <button
                            onClick={() => setSelectedExercise('squats')}
                            className="py-8 px-6 bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white/60 rounded-2xl transition-all hover:scale-105 backdrop-blur"
                        >
                            <div className="text-5xl mb-3">🦵</div>
                            <div className="font-bold text-xl">Sentadillas</div>
                            <div className="text-sm text-pink-200 mt-2">Piernas + glúteos</div>
                        </button>
                    </div>

                    <p className="text-xs text-pink-300 mt-8 italic">
                        Esto activa tu sistema nervioso simpático y mejora tu enfoque inmediatamente.
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center z-50 p-4"
        >
            <div className="text-center text-white max-w-md">
                <h2 className="text-3xl font-bold mb-8">
                    {selectedExercise === 'pushups' ? '💪 Flexiones' : '🦵 Sentadillas'}
                </h2>

                {/* Counter Display */}
                <div className="relative mb-10">
                    <motion.div
                        animate={{ scale: isComplete ? 1.2 : 1 }}
                        className={`text-9xl font-black ${isComplete ? 'text-green-400' : 'text-white'} drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]`}
                    >
                        {exerciseCount}
                    </motion.div>
                    <div className="text-2xl text-pink-200 mt-2">/ {TARGET}</div>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: TARGET }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full transition-all ${i < exerciseCount ? 'bg-green-400 scale-110' : 'bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!isComplete ? (
                        <motion.div
                            key="button"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <button
                                onClick={() => setExerciseCount(prev => Math.min(prev + 1, TARGET))}
                                disabled={exerciseCount >= TARGET}
                                className="w-full py-6 bg-white text-purple-900 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                            >
                                {exerciseCount < TARGET ? '✓ Hecha una' : '¡Completado!'}
                            </button>

                            <button
                                onClick={() => onComplete(false)}
                                className="text-sm text-pink-300 hover:text-white transition-colors"
                            >
                                No puedo ahora (volver)
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-500/20 border-2 border-green-400 rounded-2xl p-8"
                        >
                            <Check size={48} className="text-green-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-green-400 mb-2">¡Excelente!</h3>
                            <p className="text-green-200">
                                Dopamina activada. Tu mente está más clara. Volviendo al trabajo...
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default PhysicalExercise;
