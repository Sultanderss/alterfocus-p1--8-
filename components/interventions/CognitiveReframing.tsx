import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ThumbsDown, ThumbsUp } from 'lucide-react';

interface CognitiveReframingProps {
    userGoal: string;
    onComplete: (result: 'closer' | 'away') => void;
    prompt?: string;
}

/**
 * INTERVENTION MODALITY #2: Cognitive Reframing (60s)
 * Used when user shows confusion/mental block
 * Forces conscious decision and perspective shift
 */
const CognitiveReframing: React.FC<CognitiveReframingProps> = ({ userGoal, onComplete, prompt }) => {
    const [showExplanation, setShowExplanation] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-purple-500/30">
                {/* Icon */}
                <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lightbulb size={40} className="text-yellow-400" />
                </div>

                {/* Header */}
                <h2 className="text-3xl font-bold text-white text-center mb-2">
                    Pregunta Mágica
                </h2>
                <p className="text-purple-200 text-center mb-8 text-lg leading-relaxed">
                    "{prompt || (
                        <>¿Abrir esta distracción te <span className="font-bold text-green-300">acerca</span> o te <span className="font-bold text-red-300">aleja</span> de tu objetivo?</>
                    )}"
                </p>

                {/* User Goal Reminder */}
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-8 border border-white/20">
                    <div className="text-xs text-purple-300 mb-1 uppercase tracking-wide">Tu objetivo:</div>
                    <div className="text-white font-bold text-lg">"{userGoal}"</div>
                </div>

                {/* Decision Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => {
                            setShowExplanation(true);
                            setTimeout(() => onComplete('away'), 1500);
                        }}
                        className="py-6 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 text-white rounded-xl font-bold text-lg flex flex-col items-center gap-2 transition-all hover:scale-105"
                    >
                        <ThumbsDown size={28} />
                        Me aleja
                    </button>
                    <button
                        onClick={() => onComplete('closer')}
                        className="py-6 bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500 text-white rounded-xl font-bold text-lg flex flex-col items-center gap-2 transition-all hover:scale-105"
                    >
                        <ThumbsUp size={28} />
                        Me acerca
                    </button>
                </div>

                {/* Explanation (appears after choosing "Me aleja") */}
                {showExplanation && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center"
                    >
                        <p className="text-green-200 text-sm font-medium">
                            ✅ Excelente. Tu mente fue honesta. Respira 2 veces profundas y vuelve a tu objetivo.
                        </p>
                    </motion.div>
                )}

                {!showExplanation && (
                    <p className="text-xs text-purple-300 text-center italic">
                        Responderse honestamente cambia la química cerebral y reduce la impulsividad.
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default CognitiveReframing;
