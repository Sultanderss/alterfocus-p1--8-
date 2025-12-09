import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, ArrowLeft, Sparkles, Clock, Target, Smartphone,
    Instagram, Twitter, Youtube, MessageCircle, Gamepad2, Music,
    BookOpen, Coffee, Moon, Sun, Zap, CheckCircle, Brain, Info
} from 'lucide-react';
import { completeOnboarding, getLocalUserId } from '../lib/supabase';
import { detectArchetype, type DetectionSignals } from '../lib/archetypeEngine';
import { requestNotificationPermission, scheduleSmartNotifications } from '../services/pushNotifications';
import { useArchetypeSupabase } from '../hooks/useArchetypeSupabase';

interface OnboardingData {
    top_distractions: string[];
    peak_procrastination_hour?: number;
    preferred_session_type?: string;
    weekly_goal: string;
}

interface OnboardingFlowProps {
    onComplete: (data: OnboardingData) => void;
}

const DISTRACTION_OPTIONS = [
    { id: 'instagram', icon: Instagram, label: 'Instagram', color: 'from-pink-500 to-purple-500' },
    { id: 'twitter', icon: Twitter, label: 'X/Twitter', color: 'from-slate-500 to-slate-700' },
    { id: 'youtube', icon: Youtube, label: 'YouTube', color: 'from-red-500 to-red-600' },
    { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', color: 'from-green-500 to-emerald-600' },
    { id: 'tiktok', icon: Music, label: 'TikTok', color: 'from-fuchsia-500 to-pink-600' },
    { id: 'games', icon: Gamepad2, label: 'Juegos', color: 'from-purple-500 to-indigo-600' },
];

const PEAK_HOURS = [
    { id: 9, label: 'Mañana (9am - 12pm)', description: 'Pico de cortisol natural', icon: Sun, color: 'from-amber-400 to-orange-500' },
    { id: 14, label: 'Tarde (2pm - 5pm)', description: 'Valle post-almuerzo', icon: Coffee, color: 'from-amber-600 to-orange-600' },
    { id: 20, label: 'Noche (8pm - 11pm)', description: 'Fatiga de decisión', icon: Moon, color: 'from-indigo-500 to-purple-600' },
];

const SESSION_TYPES = [
    { id: 'pomodoro', label: 'Pomodoro Cíclico', description: '25/5 para mantener agilidad', icon: Clock, color: 'from-violet-500 to-purple-600' },
    { id: 'flipphone', label: 'Modo Flip Phone', description: 'Bloqueo duro de dopamina', icon: Smartphone, color: 'from-slate-500 to-gray-600' },
    { id: 'offline', label: 'Deep Work Analógico', description: 'Solo papel y lápiz', icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
];

// Smooth fade transition
const fadeTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.4 }
};

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const [step, setStep] = useState(0);
    const [selectedDistractions, setSelectedDistractions] = useState<string[]>([]);
    const [peakHour, setPeakHour] = useState<number | null>(null);
    const [preferredSession, setPreferredSession] = useState<string | null>(null);
    const [weeklyGoal, setWeeklyGoal] = useState('');
    const [saving, setSaving] = useState(false);

    const steps = [
        { title: 'Entiende tu Cerebro', subtitle: 'La ciencia detrás de AlterFocus' },
        { title: 'Drenaje de Dopamina', subtitle: '¿Qué apps secuestran tu sistema de recompensa?' },
        { title: 'Cronotipo Energético', subtitle: '¿Cuándo sufres mayor caída cognitiva?' },
        { title: 'Protocolo de Intervención', subtitle: 'Elige tu herramienta de enfoque' },
        { title: 'Misión Estratégica', subtitle: 'Define un vector de dirección claro' },
    ];

    const toggleDistraction = (id: string) => {
        setSelectedDistractions((prev) =>
            prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
        );
    };

    const canProceed = () => {
        switch (step) {
            case 0: return true; // Intro always proceeds
            case 1: return selectedDistractions.length > 0;
            case 2: return peakHour !== null;
            case 3: return preferredSession !== null;
            case 4: return weeklyGoal.trim().length > 0;
            default: return false;
        }
    };

    const handleNext = async () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            setSaving(true);
            const data = {
                top_distractions: selectedDistractions,
                peak_procrastination_hour: peakHour || undefined,
                preferred_session_type: preferredSession || undefined,
                weekly_goal: weeklyGoal,
            };

            try {
                const userId = getLocalUserId();
                await completeOnboarding(userId, data);

                // === DETECT INITIAL ARCHETYPE ===
                // Infer signals from onboarding choices
                const archetypeSignals = {
                    // If user selected many distractions, might be Chronic
                    procrastination_history: selectedDistractions.length >= 4 ? 'often' as const : 'sometimes' as const,
                    // Peak hour affects energy/anxiety
                    energy_level: peakHour === 20 ? 3 : 5, // Night = low energy
                    anxiety_level: preferredSession === 'pomodoro' ? 6 : 4, // Pomodoro = might be anxious
                    clarity: weeklyGoal.length > 50 ? 'clear' as const : 'unclear' as const
                };

                const archetypeDetection = detectArchetype(archetypeSignals);
                console.log('[ONBOARDING] Detected archetype:', archetypeDetection.primary);

                // === REQUEST PUSH NOTIFICATION PERMISSION ===
                const permission = await requestNotificationPermission();
                if (permission === 'granted') {
                    // Schedule smart notifications based on archetype
                    scheduleSmartNotifications({
                        userId,
                        archetype: archetypeDetection.primary,
                        peakProcrastinationHour: peakHour || undefined
                    });
                }

                onComplete(data);
            } catch (error) {
                console.error('Error saving onboarding:', error);
                // Fallback: Proceed locally even if save fails
                onComplete(data);
            }
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const progress = ((step + 1) / steps.length) * 100;

    return (
        <motion.div
            className="absolute inset-0 z-50 flex flex-col bg-[#08080c] h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.3, 1] }} transition={{ duration: 20, repeat: Infinity }} className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-gradient-to-br from-purple-600/30 via-fuchsia-500/20 to-pink-500/10 rounded-full blur-[100px]" />
                <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 25, repeat: Infinity, delay: 3 }} className="absolute bottom-20 -left-32 w-[350px] h-[350px] bg-gradient-to-tr from-cyan-500/25 via-blue-500/15 to-transparent rounded-full blur-[80px]" />
            </div>

            {/* Header Section (Progress + Title) */}
            <div className="flex-shrink-0 relative z-10">
                {/* Progress Bar */}
                <div className="p-5 pb-2">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl">
                                <Brain size={18} className="text-white" />
                            </div>
                            <span className="text-white font-semibold">AlterFocus</span>
                        </div>
                        <span className="text-slate-500 text-sm">Fase {step + 1} de {steps.length}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <motion.div className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
                    </div>
                </div>

                {/* Title */}
                <div className="px-6 py-2 text-center">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                            <h1 className="text-2xl font-bold text-white mb-1">{steps[step].title}</h1>
                            <p className="text-slate-400 text-sm">{steps[step].subtitle}</p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 relative z-10 w-full">
                <AnimatePresence mode="wait">

                    {/* Step 0: INTRO / CONTEXT */}
                    {step === 0 && (
                        <motion.div key="step-0" {...fadeTransition} className="space-y-4 max-w-2xl mx-auto pb-4">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-500/20 rounded-xl shrink-0">
                                            <Info size={20} className="text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white">No soy otro bloqueador.</h3>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        La mayoría de apps te tratan como un niño y te castigan. Yo uso <span className="text-purple-400 font-bold">protocolos de neurociencia</span> para renegociar con tus impulsos de dopamina.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                                    <div className="text-2xl shrink-0">⚡</div>
                                    <div className="text-left">
                                        <div className="text-white font-bold text-sm">Detecto Fatiga</div>
                                        <div className="text-slate-500 text-xs">No bloqueo, intervengo.</div>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                                    <div className="text-2xl shrink-0">🧠</div>
                                    <div className="text-left">
                                        <div className="text-white font-bold text-sm">Contexto IA</div>
                                        <div className="text-slate-500 text-xs">Entiendo por qué lo haces.</div>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                                    <div className="text-2xl shrink-0">💎</div>
                                    <div className="text-left">
                                        <div className="text-white font-bold text-sm">Identidad</div>
                                        <div className="text-slate-500 text-xs">Ganas luz (puntos), no castigos.</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1: Distractions */}
                    {step === 1 && (
                        <motion.div key="step-1" {...fadeTransition} className="grid grid-cols-3 gap-2 pb-4">
                            {DISTRACTION_OPTIONS.map((option, i) => {
                                const isSelected = selectedDistractions.includes(option.id);
                                return (
                                    <motion.button key={option.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                        onClick={() => toggleDistraction(option.id)}
                                        className={`p-2 rounded-xl border transition-all relative overflow-hidden flex flex-col items-center justify-center aspect-square ${isSelected ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                                    >
                                        {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1"><CheckCircle size={14} className="text-purple-400" /></motion.div>}
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center mb-1.5 shadow-lg`}>
                                            <option.icon size={16} className="text-white" />
                                        </div>
                                        <p className={`text-[10px] font-semibold text-center leading-tight ${isSelected ? 'text-purple-300' : 'text-white'}`}>{option.label}</p>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Step 2: Peak Hour */}
                    {step === 2 && (
                        <motion.div key="step-2" {...fadeTransition} className="space-y-3 pb-4">
                            {PEAK_HOURS.map((hour, i) => {
                                const isSelected = peakHour === hour.id;
                                return (
                                    <motion.button key={hour.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                        onClick={() => setPeakHour(hour.id)}
                                        className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-all ${isSelected ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${hour.color} flex items-center justify-center shadow-lg shrink-0`}>
                                            <hour.icon size={20} className="text-white" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className={`font-bold text-sm ${isSelected ? 'text-purple-300' : 'text-white'}`}>{hour.label}</p>
                                            <p className="text-slate-400 text-xs">{hour.description}</p>
                                        </div>
                                        {isSelected && <CheckCircle size={20} className="text-purple-400" />}
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Step 3: Session Type */}
                    {step === 3 && (
                        <motion.div key="step-3" {...fadeTransition} className="space-y-3 pb-4">
                            {SESSION_TYPES.map((type, i) => {
                                const isSelected = preferredSession === type.id;
                                return (
                                    <motion.button key={type.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                        onClick={() => setPreferredSession(type.id)}
                                        className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-all ${isSelected ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg shrink-0`}>
                                            <type.icon size={20} className="text-white" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className={`font-bold text-sm ${isSelected ? 'text-purple-300' : 'text-white'}`}>{type.label}</p>
                                            <p className="text-slate-400 text-xs">{type.description}</p>
                                        </div>
                                        {isSelected && <CheckCircle size={20} className="text-purple-400" />}
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Step 4: Weekly Goal */}
                    {step === 4 && (
                        <motion.div key="step-4" {...fadeTransition} className="space-y-4 pb-4">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl">
                                        <Target size={18} className="text-white" />
                                    </div>
                                    <span className="text-white font-semibold text-sm">Mi Misión Principal</span>
                                </div>
                                <input type="text" value={weeklyGoal} onChange={(e) => setWeeklyGoal(e.target.value)} placeholder="Ej: Terminar proyecto de física..." className="w-full bg-transparent text-white text-base placeholder-slate-500 focus:outline-none border-b border-white/20 pb-2 focus:border-purple-500 transition-colors" autoFocus />
                            </div>

                            <div className="space-y-2">
                                <p className="text-slate-500 text-xs font-medium">💡 Vectores sugeridos</p>
                                {['Estudiar para parcial de cálculo', 'Terminar ensayo de historia', 'Completar laboratorio de química'].map((suggestion, i) => (
                                    <motion.button key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                        onClick={() => setWeeklyGoal(suggestion)}
                                        className="w-full text-left p-3 bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 rounded-xl text-slate-300 text-sm transition-all"
                                    >
                                        {suggestion}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Fixed Footer Navigation */}
            <div className="flex-shrink-0 p-5 bg-[#08080c] relative z-20 border-t border-white/5">
                <div className="flex gap-3 w-full">
                    {step > 0 && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleBack} className="px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all">
                            <ArrowLeft size={20} />
                        </motion.button>
                    )}
                    <motion.button whileHover={{ scale: canProceed() ? 1.02 : 1 }} whileTap={{ scale: canProceed() ? 0.98 : 1 }} onClick={handleNext} disabled={!canProceed() || saving}
                        className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canProceed() ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' : 'bg-white/10 text-slate-500 cursor-not-allowed'}`}
                    >
                        {saving ? (<><Zap size={18} className="animate-pulse" /> Guardando...</>) : step === steps.length - 1 ? (<><Sparkles size={18} /> ¡Comenzar!</>) : (<>{step === 0 ? 'Entendido' : 'Siguiente'} <ArrowRight size={18} /></>)}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
