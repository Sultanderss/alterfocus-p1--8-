/**
 * INTERVENTION FEEDBACK SCREEN
 * 
 * Pantalla de retroalimentación post-intervención
 * Recopila datos para mejorar las recomendaciones futuras
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ThumbsUp, ThumbsDown, Target, Heart, ArrowRight } from 'lucide-react';
import { saveInterventionFeedback } from '../../lib/archetypeEngine';

interface InterventionFeedbackProps {
    interventionId: string;
    interventionName: string;
    pointsEarned: number;
    onComplete: (feedback: FeedbackResult) => void;
    onSkip: () => void;
}

interface FeedbackResult {
    helpful: boolean;
    returnedToFocus: boolean;
    emotionalRating: number;
    wouldUseAgain: boolean;
}

export const InterventionFeedback: React.FC<InterventionFeedbackProps> = ({
    interventionId,
    interventionName,
    pointsEarned,
    onComplete,
    onSkip
}) => {
    const [step, setStep] = useState(0);
    const [feedback, setFeedback] = useState<Partial<FeedbackResult>>({});

    const questions = [
        {
            question: '¿Te ayudó esta intervención?',
            key: 'helpful',
            options: [
                { value: true, label: 'Sí, me ayudó', icon: <ThumbsUp size={24} />, color: 'emerald' },
                { value: false, label: 'No mucho', icon: <ThumbsDown size={24} />, color: 'slate' }
            ]
        },
        {
            question: '¿Volviste al foco?',
            key: 'returnedToFocus',
            options: [
                { value: true, label: 'Sí, volví al trabajo', icon: <Target size={24} />, color: 'emerald' },
                { value: false, label: 'Aún no', icon: <ArrowRight size={24} />, color: 'amber' }
            ]
        },
        {
            question: '¿Cómo te sientes ahora?',
            key: 'emotionalRating',
            type: 'rating'
        },
        {
            question: '¿Usarías esta intervención de nuevo?',
            key: 'wouldUseAgain',
            options: [
                { value: true, label: 'Sí, definitivamente', icon: <Heart size={24} />, color: 'rose' },
                { value: false, label: 'Prefiero otras', icon: <MessageCircle size={24} />, color: 'slate' }
            ]
        }
    ];

    const handleAnswer = (key: string, value: any) => {
        const newFeedback = { ...feedback, [key]: value };
        setFeedback(newFeedback);

        if (step < questions.length - 1) {
            setTimeout(() => setStep(step + 1), 300);
        } else {
            // Save and complete
            saveInterventionFeedback(interventionId, {
                helpful: newFeedback.helpful || false,
                returned_to_focus: newFeedback.returnedToFocus || false,
                emotional_rating: newFeedback.emotionalRating || 3
            });

            onComplete(newFeedback as FeedbackResult);
        }
    };

    const currentQuestion = questions[step];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
        >
            <div className="w-full max-w-md">
                {/* Progress */}
                <div className="flex gap-2 mb-8">
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-all ${i < step ? 'bg-purple-500' :
                                    i === step ? 'bg-purple-500/50' :
                                        'bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                {/* Points Earned Banner */}
                {step === 0 && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center mb-6"
                    >
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold">
                            ✨ +{pointsEarned} puntos por {interventionName}
                        </div>
                    </motion.div>
                )}

                {/* Question */}
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <h2 className="text-2xl font-bold text-white text-center">
                        {currentQuestion.question}
                    </h2>

                    {/* Rating Type */}
                    {currentQuestion.type === 'rating' ? (
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map(rating => (
                                <motion.button
                                    key={rating}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAnswer('emotionalRating', rating)}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${feedback.emotionalRating === rating
                                            ? 'bg-purple-500 shadow-lg shadow-purple-500/30'
                                            : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    {rating <= 2 ? '😔' : rating === 3 ? '😐' : rating === 4 ? '🙂' : '😊'}
                                </motion.button>
                            ))}
                        </div>
                    ) : (
                        /* Options Type */
                        <div className="space-y-3">
                            {currentQuestion.options?.map((option, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => handleAnswer(currentQuestion.key, option.value)}
                                    className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 ${option.color === 'emerald'
                                            ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20' :
                                            option.color === 'amber'
                                                ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20' :
                                                option.color === 'rose'
                                                    ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20' :
                                                    'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${option.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                                            option.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                                                option.color === 'rose' ? 'bg-rose-500/20 text-rose-400' :
                                                    'bg-white/10 text-slate-400'
                                        }`}>
                                        {option.icon}
                                    </div>
                                    <span className="text-white font-medium">{option.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Skip */}
                <button
                    onClick={onSkip}
                    className="w-full mt-8 py-3 text-slate-500 text-sm hover:text-slate-300 transition-colors"
                >
                    Saltar feedback
                </button>
            </div>
        </motion.div>
    );
};

export default InterventionFeedback;
