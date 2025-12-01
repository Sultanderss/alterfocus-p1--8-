import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Trophy, Lock, Unlock, Dumbbell, Brain, Wind, Target } from 'lucide-react';

interface Props {
    onComplete: () => void;
    onSkip: () => void;
}

type TutorialStep = 1 | 2 | 3 | 4 | 5;

export default function OnboardingTutorial({ onComplete, onSkip }: Props) {
    const [currentStep, setCurrentStep] = useState<TutorialStep>(1);

    const nextStep = () => {
        if (currentStep < 5) {
            setCurrentStep((currentStep + 1) as TutorialStep);
        } else {
            onComplete();
        }
    };

    const steps = [
        {
            id: 1,
            title: 'Bienvenido a AlterFocus',
            description: 'Un sistema inteligente que te ayuda a mantener el enfoque, adaptándose a tu progreso.',
            icon: <Trophy size={64} className="text-brand-primary" />,
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        AlterFocus no solo bloquea distracciones. <span className="text-brand-primary font-semibold">Te entrena</span> para desarrollar autodisciplina real.
                    </p>
                    <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-2">💡 Filosofía</p>
                        <p className="text-sm text-slate-200">
                            Cuanto más éxito tengas, más control ganarás. El sistema se adapta a ti.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 2,
            title: 'Sistema de Autonomía Progresiva',
            description: 'Hay 4 niveles que desbloqueas con tu progreso',
            icon: <Target size={64} className="text-green-400" />,
            content: (
                <div className="space-y-3">
                    {[
                        { level: 'Aprendiz', emoji: '🌱', desc: 'Inicio. Te guío paso a paso.', unlocks: '0 intervenciones' },
                        { level: 'Practicante', emoji: '⚡', desc: 'Ya conoces las herramientas.', unlocks: '5 intervenciones exitosas' },
                        { level: 'Autónomo', emoji: '🎯', desc: 'Tienes más control.', unlocks: '15 intervenciones + 7 días' },
                        { level: 'Maestro', emoji: '🏆', desc: 'Autodisciplina total.', unlocks: '20 intervenciones + 14 días' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-2xl">{item.emoji}</span>
                                <span className="font-bold text-slate-100">{item.level}</span>
                            </div>
                            <p className="text-xs text-slate-400 ml-11">{item.desc}</p>
                            <p className="text-[10px] text-brand-primary ml-11 mt-1">Desbloquea: {item.unlocks}</p>
                        </div>
                    ))}
                </div>
            )
        },
        {
            id: 3,
            title: 'Niveles de Intervención',
            description: 'Según tus intentos, activo diferentes técnicas',
            icon: <Brain size={64} className="text-indigo-400" />,
            content: (
                <div className="space-y-3">
                    {[
                        { level: '1', name: 'Pregunta Amable', trigger: 'Primeros 1-2 intentos', icon: '💬', color: 'bg-blue-500/20 border-blue-500/30' },
                        { level: '2', name: 'Herramientas', trigger: '3-5 intentos', icon: '🛠️', color: 'bg-green-500/20 border-green-500/30' },
                        { level: '3', name: 'Reto Físico', trigger: 'Insistes 2+ veces', icon: '🏋️', color: 'bg-orange-500/20 border-orange-500/30' },
                        { level: '4', name: 'IA Profunda', trigger: 'Crisis/Overwhelm', icon: '🧠', color: 'bg-purple-500/20 border-purple-500/30' }
                    ].map((item, idx) => (
                        <div key={idx} className={`${item.color} border rounded-lg p-3`}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-semibold text-slate-100 text-sm">Nivel {item.level}: {item.name}</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">Se activa: {item.trigger}</p>
                        </div>
                    ))}
                </div>
            )
        },
        {
            id: 4,
            title: 'Botón "Ignorar" Bloqueado',
            description: 'Se desbloquea cuando demuestres autonomía',
            icon: <Lock size={64} className="text-rose-400" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Lock size={24} className="text-rose-400" />
                            <h4 className="font-bold text-slate-100">Estado Inicial: Bloqueado</h4>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            No puedes ignorar libremente al principio. Esto te ayuda a <span className="text-brand-primary font-semibold">construir el hábito</span>.
                        </p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Unlock size={24} className="text-green-400" />
                            <h4 className="font-bold text-slate-100">Cómo Desbloquearlo</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li className="flex items-start gap-2">
                                <span className="text-green-400">✓</span>
                                <span>7 días consecutivos de uso</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400">✓</span>
                                <span>10 intervenciones completadas exitosamente</span>
                            </li>
                        </ul>
                    </div>

                    <p className="text-xs text-slate-400 text-center italic">
                        "La disciplina temporal crea libertad permanente"
                    </p>
                </div>
            )
        },
        {
            id: 5,
            title: '¡Listo para Empezar!',
            description: 'Tu viaje hacia el enfoque consciente comienza ahora',
            icon: <Trophy size={64} className="text-amber-400" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-2xl p-6 text-center">
                        <p className="text-lg font-bold text-slate-100 mb-2">
                            Recuerda: Cada elección cuenta
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            El sistema se adapta a ti. Cuanto más éxito tengas, más autonomía ganarás.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-700/30 rounded-lg p-3 text-center border border-slate-600">
                            <div className="text-2xl mb-1">🎯</div>
                            <p className="text-xs text-slate-300 font-semibold">Enfoca</p>
                            <p className="text-[10px] text-slate-400">25 min cada vez</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3 text-center border border-slate-600">
                            <div className="text-2xl mb-1">⚡</div>
                            <p className="text-xs text-slate-300 font-semibold">Racha</p>
                            <p className="text-[10px] text-slate-400">Día tras día</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3 text-center border border-slate-600">
                            <div className="text-2xl mb-1">🏆</div>
                            <p className="text-xs text-slate-300 font-semibold">Progresa</p>
                            <p className="text-[10px] text-slate-400">Desbloquea niveles</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3 text-center border border-slate-600">
                            <div className="text-2xl mb-1">🎓</div>
                            <p className="text-xs text-slate-300 font-semibold">Maestría</p>
                            <p className="text-[10px] text-slate-400">Control total</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const current = steps[currentStep - 1];

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-b from-brand-dark to-brand-surface rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-brand-surface/95 backdrop-blur-sm px-6 py-4 border-b border-slate-700 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">{current.title}</h2>
                        <p className="text-xs text-slate-400 mt-1">{current.description}</p>
                    </div>
                    <button
                        onClick={onSkip}
                        className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 py-8"
                    >
                        <div className="flex justify-center mb-6">
                            {current.icon}
                        </div>
                        {current.content}
                    </motion.div>
                </AnimatePresence>

                {/* Footer */}
                <div className="sticky bottom-0 bg-brand-surface/95 backdrop-blur-sm px-6 py-4 border-t border-slate-700">
                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mb-4">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`h-2 rounded-full transition-all ${step.id === currentStep
                                        ? 'w-8 bg-brand-primary'
                                        : step.id < currentStep
                                            ? 'w-2 bg-green-500'
                                            : 'w-2 bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        {currentStep > 1 && (
                            <button
                                onClick={() => setCurrentStep((currentStep - 1) as TutorialStep)}
                                className="flex px-4 py-3 bg-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-600 transition-colors"
                            >
                                Atrás
                            </button>
                        )}
                        <button
                            onClick={nextStep}
                            className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/80 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                        >
                            {currentStep === 5 ? '¡Comenzar!' : 'Siguiente'}
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
