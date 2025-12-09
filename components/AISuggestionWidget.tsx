/**
 * AI SUGGESTION WIDGET
 * Muestra sugerencias contextuales basadas en el horario y estado del usuario
 * Diseño premium con animaciones glassmorphism
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ChevronRight, Clock, Zap, AlertTriangle,
    BookOpen, Coffee, Target, Flame, RefreshCw, CheckCircle,
    ArrowRight, Timer
} from 'lucide-react';
import {
    generateSmartSuggestion,
    estimateDistractionLevel,
    AISuggestion,
    UserContext
} from '../lib/contextualAI';
import { fetchSchedule, fetchPendingDeadlines, getTodayLight, getLocalUserId, ScheduleEvent } from '../lib/supabase';
import { AppView } from '../types';

interface AISuggestionWidgetProps {
    onNavigate: (view: AppView) => void;
    onStartSession?: (duration: number, task?: string) => void;
}

const PRIORITY_GRADIENTS = {
    urgent: 'from-red-500 to-rose-600',
    warning: 'from-amber-500 to-orange-600',
    opportunity: 'from-emerald-500 to-teal-600',
    planning: 'from-blue-500 to-indigo-600',
    encouragement: 'from-purple-500 to-pink-600',
};

const PRIORITY_BG = {
    urgent: 'bg-red-500/10 border-red-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30',
    opportunity: 'bg-emerald-500/10 border-emerald-500/30',
    planning: 'bg-blue-500/10 border-blue-500/30',
    encouragement: 'bg-purple-500/10 border-purple-500/30',
};

export default function AISuggestionWidget({ onNavigate, onStartSession }: AISuggestionWidgetProps) {
    const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [nextEvents, setNextEvents] = useState<ScheduleEvent[]>([]);
    const [lightToday, setLightToday] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        loadContextAndSuggestion();
    }, []);

    const loadContextAndSuggestion = async () => {
        setLoading(true);
        setDismissed(false);

        try {
            const userId = getLocalUserId();
            const now = new Date();
            const hour = now.getHours();

            // Cargar datos en paralelo
            const [schedule, light] = await Promise.all([
                fetchSchedule(userId, 7),
                getTodayLight(userId)
            ]);

            setNextEvents(schedule.slice(0, 3));
            setLightToday(light);

            const distractionLevel = estimateDistractionLevel(light, hour);

            const context: UserContext = {
                userId,
                currentTime: now,
                schedule,
                lightToday: light,
                distractionLevel,
                userPreferences: {}
            };

            const newSuggestion = generateSmartSuggestion(context);
            setSuggestion(newSuggestion);
        } catch (error) {
            console.error('Error loading AI context:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = () => {
        if (!suggestion) return;

        switch (suggestion.suggestedAction) {
            case 'deepFocus':
            case 'pomodoro':
                onStartSession?.(suggestion.duration || 25, suggestion.message);
                onNavigate(AppView.FOCUS_SESSION);
                break;
            case 'flipPhone':
                onNavigate(AppView.FLIP_PHONE_MODE);
                break;
            case 'breathing':
                onNavigate(AppView.BREATHING);
                break;
            case 'offline':
                onNavigate(AppView.OFFLINE_STUDY);
                break;
            case 'alternatives':
                onNavigate(AppView.ALTERNATIVES);
                break;
            case 'weeklyPlanner':
                onNavigate(AppView.AI_GUIDE);
                break;
            case 'community':
                onNavigate(AppView.COMMUNITY);
                break;
        }
    };

    const formatEventTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 0) return 'Ahora';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        return 'Mañana';
    };

    const getPriorityIcon = (priority: 'rojo' | 'amarillo' | 'verde') => {
        switch (priority) {
            case 'rojo': return <AlertTriangle size={12} className="text-red-400" />;
            case 'amarillo': return <Clock size={12} className="text-amber-400" />;
            case 'verde': return <CheckCircle size={12} className="text-emerald-400" />;
        }
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5"
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-purple-500 flex items-center justify-center"
                    >
                        <Sparkles size={20} className="text-white" />
                    </motion.div>
                    <div>
                        <p className="font-medium text-white">Analizando tu contexto...</p>
                        <p className="text-xs text-slate-500">Cargando horario y sugerencias</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-3">
            {/* AI Suggestion Card - MEJORADO */}
            <AnimatePresence>
                {suggestion && !dismissed && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="suggestion-card"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🔦</span>
                                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                                    Sugerencia IA
                                </span>
                            </div>
                            <button
                                onClick={() => setDismissed(true)}
                                className="text-slate-500 hover:text-white transition-colors text-xs p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Mensaje principal */}
                        <div className="mb-3">
                            <p className="text-white font-medium mb-1">
                                Hoy: "{suggestion.message}"
                            </p>
                            <p className="text-sm text-slate-400">
                                <span className="text-emerald-400">Beneficio:</span> {suggestion.duration
                                    ? `Ganarás ${suggestion.duration} min de enfoque profundo`
                                    : 'Recuperarás claridad mental'
                                }
                            </p>
                        </div>

                        {/* Botones pequeños */}
                        <div className="suggestion-buttons">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleAction}
                                className="suggestion-btn"
                            >
                                Aceptar
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setDismissed(true)}
                                className="suggestion-btn"
                                style={{ background: 'transparent' }}
                            >
                                No ahora
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upcoming Events */}
            {nextEvents.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-blue-400" />
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                Próximas Actividades
                            </span>
                        </div>
                        <button
                            onClick={() => onNavigate(AppView.SCHEDULE_UPLOAD)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                        >
                            Ver todo <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {nextEvents.map((event, i) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="flex items-center gap-3 p-3 bg-black/20 rounded-xl"
                            >
                                {getPriorityIcon(event.priority)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {event.event_title}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {event.type === 'clase' ? '📚' : event.type === 'entrega' ? '📝' : '📖'}
                                        {' '}{event.type}
                                    </p>
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-xs font-bold ${event.priority === 'rojo'
                                    ? 'bg-red-500/20 text-red-400'
                                    : event.priority === 'amarillo'
                                        ? 'bg-amber-500/20 text-amber-400'
                                        : 'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                    {formatEventTime(event.start_time)}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {nextEvents.length === 0 && (
                        <p className="text-center text-slate-500 py-4">
                            No hay eventos próximos. ¡Sube tu horario!
                        </p>
                    )}
                </motion.div>
            )}

            {/* Refresh Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadContextAndSuggestion}
                className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
                <RefreshCw size={14} />
                Actualizar sugerencias
            </motion.button>
        </div>
    );
}
