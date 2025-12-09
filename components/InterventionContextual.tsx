import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EmotionalMetrics } from '../types';
import { Brain, AlertTriangle } from 'lucide-react';
import { analyzeContext } from '../services/interventionLogic';

interface InterventionContextualProps {
    metrics: EmotionalMetrics;
    userGoal: string;
    onComplete: (success: boolean) => void;
    onSkip: () => void;
    fromExtension?: boolean;
    onNavigate?: (view: number) => void;
    onUrgentTask?: () => void;
}

const InterventionContextual: React.FC<InterventionContextualProps> = ({
    metrics,
    userGoal,
    onComplete,
    onSkip,
    fromExtension = false,
    onNavigate,
    onUrgentTask,
}) => {
    const [step, setStep] = useState<'detecting' | 'toast' | 'modal' | 'mandatory_task' | 'sos'>('detecting');
    const [decision, setDecision] = useState<any>(null);

    useEffect(() => {
        const currentHour = new Date().getHours();
        const realAttemptCount = metrics.attemptCount;
        const detectedDomain = 'youtube.com';
        const result = analyzeContext(realAttemptCount, 15, detectedDomain, currentHour);
        setDecision(result);

        if (fromExtension) {
            setStep('modal');
        } else if (result.level === 'gentle_toast') {
            setStep('toast');
        } else if (result.level === 'mandatory_task') {
            setStep('mandatory_task');
        } else if (result.level === 'crisis_sos') {
            setStep('sos');
        } else {
            setStep('modal');
        }
    }, [metrics, fromExtension]);

    if (step === 'toast') {
        return (
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-4 right-4 z-50 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-sm"
            >
                <div className="p-2 bg-indigo-500/20 rounded-full">
                    <Brain size={20} className="text-indigo-400" />
                </div>
                <div>
                    <h4 className="font-bold text-sm">¿Desvío detectado?</h4>
                    <p className="text-xs text-slate-300">
                        Recuerda tu meta: <span className="text-white font-medium">{userGoal}</span>
                    </p>
                </div>
                <button onClick={onSkip} className="text-xs text-slate-400 hover:text-white underline">
                    Ignorar
                </button>
            </motion.div>
        );
    }

    if (step === 'sos') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-lg p-6">
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-slate-800 border border-slate-600 p-8 rounded-3xl max-w-md w-full text-center shadow-xl"
                >
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <AlertTriangle size={32} className="text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">¿Necesitas apoyo?</h2>
                    <p className="text-slate-300 mb-6 text-sm">
                        Notamos que has estado intentando concentrarte durante mucho tiempo. Si sientes que necesitas hablar con alguien, estos recursos están disponibles para ti.
                    </p>
                    <div className="space-y-3">
                        <a href="tel:3196543210" className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-colors">
                            📞 Línea de Apoyo (Colombia)
                        </a>
                        <a href="https://semm.com.co" target="_blank" rel="noreferrer" className="block w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-colors">
                            💬 Chat con Profesional
                        </a>
                        <button onClick={onSkip} className="w-full text-slate-400 hover:text-white py-2 transition-colors text-sm">
                            Estoy bien, continuar trabajando
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (step === 'mandatory_task') {
        const handleAction = () => {
            if (onUrgentTask) {
                onUrgentTask();
            } else if (onNavigate && decision?.suggestedTool) {
                const toolMap: Record<string, number> = {
                    breathing_4_7_8: 3,
                    physical_exercise: 3,
                    cognitive_reframing: 1,
                };
                const target = toolMap[decision.suggestedTool] || 1;
                onNavigate(target);
            }
            onComplete(true);
        };
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-900/90 backdrop-blur-lg p-6">
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-slate-900 border border-amber-500/30 p-8 rounded-3xl max-w-md w-full text-center shadow-[0_0_50px_rgba(255,165,0,0.3)]"
                >
                    <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Tarea urgente</h2>
                    <p className="text-slate-300 mb-6">
                        {decision?.reason || 'Tienes una tarea que debe completarse ahora.'}
                    </p>
                    <button
                        onClick={handleAction}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-bold transition-colors"
                    >
                        Ir a la herramienta recomendada
                    </button>
                </motion.div>
            </div>
        );
    }

    if (step === 'modal') {
        const handleToolAction = () => {
            if (onNavigate && decision?.suggestedTool) {
                const toolMap: Record<string, number> = {
                    breathing_4_7_8: 3,
                    physical_exercise: 3,
                    cognitive_reframing: 1,
                    ai_therapy_brief: 16,
                };
                const target = toolMap[decision.suggestedTool] || 1;
                onNavigate(target);
            }
            onComplete(true);
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-indigo-500/30 p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(99,102,241,0.3)]"
                >
                    <Brain size={48} className="text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2 text-center">Momento de reflexión</h2>
                    <p className="text-slate-300 mb-4 text-center">
                        {decision?.reason || 'Detectamos que estás intentando distraerte.'}
                    </p>
                    <div className="bg-black/30 p-4 rounded-xl mb-6">
                        <p className="text-sm text-slate-400">Patrón detectado:</p>
                        <p className="text-lg font-bold text-white capitalize">{decision?.pattern?.replace('_', ' ')}</p>
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={handleToolAction}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-colors"
                        >
                            Usar herramienta recomendada
                        </button>
                        <button
                            onClick={onSkip}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium transition-colors"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return null;
};

export default InterventionContextual;
