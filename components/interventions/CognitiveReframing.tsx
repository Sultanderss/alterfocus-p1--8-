import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ThumbsDown, ThumbsUp, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

interface CognitiveReframingProps {
    userGoal: string;
    onComplete: (result: 'closer' | 'away') => void;
    prompt?: string;
}

/**
 * INTERVENTION MODALITY #2: Cognitive Reframing v2
 * Adds friction to "Me acerca" (Justification) and Reward to "Me aleja"
 */
const CognitiveReframing: React.FC<CognitiveReframingProps> = ({ userGoal, onComplete, prompt }) => {
    const [phase, setPhase] = useState<'question' | 'justify' | 'reward'>('question');
    const [justification, setJustification] = useState('');

    const handleCloser = () => {
        setPhase('justify');
    };

    const handleAway = () => {
        setPhase('reward');
        // Auto-complete after animation
        setTimeout(() => onComplete('away'), 2500);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
            <div className="bg-[#0f1014] rounded-3xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden relative">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-16 -mb-16 pointer-events-none" />

                <AnimatePresence mode="wait">
                    {/* PHASE 1: THE QUESTION */}
                    {phase === 'question' && (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="p-8"
                        >
                            <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-400/20">
                                <Lightbulb size={32} className="text-yellow-400" />
                            </div>

                            <h2 className="text-2xl font-bold text-white text-center mb-4 leading-tight">
                                Pregunta Mágica
                            </h2>
                            <p className="text-slate-300 text-center mb-8 text-lg font-light leading-relaxed">
                                {prompt || (
                                    <>
                                        ¿Esta acción te <span className="text-green-400 font-bold">acerca</span> o te <span className="text-red-400 font-bold">aleja</span> de tu objetivo?
                                    </>
                                )}
                            </p>

                            <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/10">
                                <div className="text-[10px] text-purple-400 mb-1 uppercase tracking-widest font-bold">Tu Objetivo Actual</div>
                                <div className="text-white font-medium text-lg">"{userGoal}"</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleAway}
                                    className="py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl font-bold flex flex-col items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group"
                                >
                                    <ThumbsDown size={24} className="group-hover:text-red-400 transition-colors" />
                                    <span>Me aleja</span>
                                    <span className="text-[10px] font-normal opacity-60">Volver a intentar</span>
                                </button>
                                <button
                                    onClick={handleCloser}
                                    className="py-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-200 rounded-xl font-bold flex flex-col items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group"
                                >
                                    <ThumbsUp size={24} className="group-hover:text-green-400 transition-colors" />
                                    <span>Me acerca</span>
                                    <span className="text-[10px] font-normal opacity-60">Justificar acceso</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE 2: JUSTIFICATION (Friction) */}
                    {phase === 'justify' && (
                        <motion.div
                            key="justify"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-8"
                        >
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={32} className="text-blue-400" />
                            </div>

                            <h3 className="text-2xl font-bold text-white text-center mb-2">Momento de Verdad</h3>
                            <p className="text-slate-400 text-center mb-6 text-sm">
                                Si realmente te acerca a tu objetivo, describe brevemente cómo. Tu cerebro distinguirá entre una razón y una excusa.
                            </p>

                            <textarea
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                placeholder="Me ayuda porque..."
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 min-h-[100px] mb-6 resize-none"
                                autoFocus
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPhase('question')}
                                    className="px-6 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={() => onComplete('closer')}
                                    disabled={justification.length < 5}
                                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-bold transition-all ${justification.length >= 5 ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                                >
                                    <span>Acceder</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE 3: REWARD (Success) */}
                    {phase === 'reward' && (
                        <motion.div
                            key="reward"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-12 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/40"
                            >
                                <CheckCircle size={48} className="text-white" />
                            </motion.div>

                            <h2 className="text-3xl font-black text-white mb-4">¡Excelente!</h2>
                            <p className="text-green-200 text-lg mb-8">
                                Has ganado +10 minutos de claridad mental.
                            </p>

                            <div className="text-xs text-white/40 uppercase tracking-widest">Cerrando distracción...</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default CognitiveReframing;
