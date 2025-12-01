import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EmotionalMetrics } from '../../types';
import { Brain, AlertTriangle, X } from 'lucide-react';
import { analyzeContext } from '../../services/interventionLogic';
import Breathing from '../Breathing';
import PhysicalExercise from './PhysicalExercise';
import CognitiveReframing from './CognitiveReframing';
import AITherapyBrief from './AITherapyBrief';
import GentleQuestion from './GentleQuestion';

interface InterventionSmartProps {
    metrics: EmotionalMetrics;
    userGoal: string;
    onComplete: (success: boolean) => void;
    onSkip: () => void;
}

const InterventionSmart: React.FC<InterventionSmartProps> = ({
    metrics,
    userGoal,
    onComplete,
    onSkip,
}) => {
    const [decision, setDecision] = useState<any>(null);
    const [showTool, setShowTool] = useState(false);

    useEffect(() => {
        const currentHour = new Date().getHours();
        const result = analyzeContext(
            metrics.attemptCount,
            metrics.sessionDurationMinutes,
            'facebook.com',
            currentHour
        );
        console.log('🔍 DECISIÓN:', {
            level: result.level,
            tool: result.suggestedTool,
            attemptCount: metrics.attemptCount,
            pattern: result.pattern
        });
        setDecision(result);
    }, [metrics]);

    if (!decision) return null;

    // ============================================
    // NIVEL 3: CRISIS SOS (5+ intentos)
    // ============================================
    if (decision.level === 'crisis_sos' && !showTool) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/90 backdrop-blur-lg p-6">
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-slate-900 border border-rose-500/30 p-8 rounded-3xl max-w-md w-full text-center"
                >
                    <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Patrón de crisis</h2>
                    <p className="text-slate-300 mb-6">
                        {metrics.attemptCount} intentos. ¿Necesitas ayuda?
                    </p>
                    <div className="space-y-3">
                        <a href="tel:3196543210" className="block w-full bg-rose-600 text-white py-3 rounded-xl font-bold">
                            📞 Línea PAS
                        </a>
                        <button onClick={() => setShowTool(true)} className="w-full bg-indigo-600 text-white py-3 rounded-xl">
                            Usar herramienta
                        </button>
                        <button onClick={onSkip} className="text-slate-500 text-sm">Volver</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ============================================
    // NIVEL 1: TOAST SUAVE (1-2 intentos)
    // ============================================
    if (decision.level === 'gentle_toast' && !showTool) {
        return (
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-4 right-4 left-4 z-50 max-w-md mx-auto"
            >
                <div className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/30 text-white p-4 rounded-2xl shadow-2xl">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-full">
                            <Brain size={24} className="text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm mb-1">¿Desvío detectado?</h4>
                            <p className="text-xs text-slate-300 mb-3">{decision.reason}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowTool(true)}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 px-3 rounded-lg"
                                >
                                    Usar herramienta (2 min)
                                </button>
                                <button
                                    onClick={onSkip}
                                    className="px-3 text-xs text-slate-400 hover:text-white underline"
                                >
                                    Ignorar
                                </button>
                            </div>
                        </div>
                        <button onClick={onSkip} className="text-slate-400 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ============================================
    // NIVEL 2: HERRAMIENTAS COMPLETAS
    // (3+ intentos o cuando usuario hace clic en "Usar herramienta")
    // ============================================
    const toolType = decision.suggestedTool;

    switch (toolType) {
        case 'breathing_4_7_8':
            return (
                <div className="fixed inset-0 z-50 bg-black">
                    <Breathing onComplete={(result) => onComplete(result === 'yes')} />
                </div>
            );

        case 'physical_exercise':
            return (
                <div className="fixed inset-0 z-50 bg-black">
                    <PhysicalExercise onComplete={onComplete} />
                </div>
            );

        case 'cognitive_reframing':
            return (
                <div className="fixed inset-0 z-50 bg-black">
                    <CognitiveReframing userGoal={userGoal} onComplete={(r) => onComplete(r === 'away')} />
                </div>
            );

        case 'ai_therapy_brief':
            return (
                <div className="fixed inset-0 z-50 bg-black">
                    <AITherapyBrief onComplete={onComplete} />
                </div>
            );

        default:
            return (
                <div className="fixed inset-0 z-50 bg-black">
                    <GentleQuestion
                        attemptCount={metrics.attemptCount}
                        onSelect={() => onComplete(true)}
                        onSkip={onSkip}
                    />
                </div>
            );
    }
};

export default InterventionSmart;
