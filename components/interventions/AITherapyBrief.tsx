import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Sparkles, CheckCircle, X } from 'lucide-react';

interface AITherapyBriefProps {
    onComplete: (success: boolean) => void;
    userGoal?: string;
}

const AITherapyBrief: React.FC<AITherapyBriefProps> = ({ onComplete, userGoal }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<string[]>(['', '', '']);
    const [showPlan, setShowPlan] = useState(false);

    const questions = [
        {
            icon: '😰',
            text: '¿Qué sentiste justo antes de intentar distraerte?',
            placeholder: 'Ej: Ansiedad, confusión, cansancio...',
            context: 'Identificar el trigger emocional'
        },
        {
            icon: '🎯',
            text: '¿Qué necesitas ahora para volver a tu tarea?',
            placeholder: 'Ej: Claridad, descanso, ayuda externa...',
            context: 'Definir la necesidad real'
        },
        {
            icon: '✅',
            text: '¿En qué te comprometes los próximos 10 minutos?',
            placeholder: 'Ej: Escribir 3 párrafos, revisar 2 páginas...',
            context: 'Crear compromiso específico'
        }
    ];

    const handleAnswer = (value: string) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = value;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < 2) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowPlan(true);
        }
    };

    const generatePlan = () => {
        return `
📋 **Tu Plan de Acción:**

1. **Reconociste:** ${answers[0] || 'Tu estado emocional'}
2. **Necesitas:** ${answers[1] || 'Apoyo específico'}
3. **Te comprometes a:** ${answers[2] || 'Acción concreta'}

**Próximo paso:** Usa los próximos 10 minutos para cumplir tu compromiso. Puedes hacerlo. 💪
    `.trim();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-lg glass-panel p-8 relative"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center">
                            <Brain size={24} className="text-brand-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Terapia Breve</h2>
                            <p className="text-sm text-slate-400">Desbloquémonos juntos</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onComplete(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Progress */}
                <div className="flex gap-2 mb-8">
                    {questions.map((_, index) => (
                        <div
                            key={index}
                            className={`flex-1 h-1 rounded-full ${index <= currentQuestion ? 'bg-brand-primary' : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {!showPlan ? (
                        <motion.div
                            key={currentQuestion}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Question */}
                            <div>
                                <div className="text-4xl mb-3">{questions[currentQuestion].icon}</div>
                                <h3 className="text-lg font-bold text-white mb-2">
                                    Pregunta {currentQuestion + 1}/3
                                </h3>
                                <p className="text-white text-base mb-1">
                                    {questions[currentQuestion].text}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {questions[currentQuestion].context}
                                </p>
                            </div>

                            {/* Input */}
                            <textarea
                                value={answers[currentQuestion]}
                                onChange={(e) => handleAnswer(e.target.value)}
                                placeholder={questions[currentQuestion].placeholder}
                                className="w-full p-4 rounded-xl border border-white/10 bg-black/20 text-white placeholder:text-slate-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-none"
                                rows={4}
                                autoFocus
                            />

                            {/* Buttons */}
                            <div className="flex gap-3">
                                {currentQuestion > 0 && (
                                    <button
                                        onClick={() => setCurrentQuestion(currentQuestion - 1)}
                                        className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                                    >
                                        Atrás
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    disabled={!answers[currentQuestion].trim()}
                                    className="flex-1 px-6 py-3 rounded-xl bg-brand-primary text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-secondary transition-colors flex items-center justify-center gap-2"
                                >
                                    {currentQuestion < 2 ? (
                                        <>Siguiente <Send size={16} /></>
                                    ) : (
                                        <>Ver Plan <Sparkles size={16} /></>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            {/* Success Icon */}
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle size={40} className="text-emerald-400" />
                                </div>
                            </div>

                            {/* Plan */}
                            <div className="glass-card p-6 bg-white/5">
                                <div className="whitespace-pre-line text-sm text-slate-300 leading-relaxed">
                                    {generatePlan()}
                                </div>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => onComplete(true)}
                                className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                ✅ Entendido, vuelvo al trabajo
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default AITherapyBrief;
