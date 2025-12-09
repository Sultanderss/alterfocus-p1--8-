import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Clock, Calendar, Users, MessageCircle, Plus,
    Sparkles, ChevronRight, Bell, Upload, Timer, Wind,
    Heart, BookOpen, Target, Zap, CheckCircle, AlertCircle
} from 'lucide-react';
import { AppView } from '../types';
import {
    fetchSchedule,
    fetchPendingDeadlines,
    getTodayLight,
    getLocalUserId,
    ScheduleEvent
} from '../lib/supabase';
import {
    generateSmartSuggestion,
    estimateDistractionLevel,
    getTimeBasedGreeting,
    formatRelativeTime,
    AISuggestion
} from '../lib/contextualAI';

interface WorkspaceProps {
    onBack: () => void;
    onNavigate: (view: AppView) => void;
    onShowUpload: () => void;
}

export default function Workspace({ onBack, onNavigate, onShowUpload }: WorkspaceProps) {
    const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
    const [deadlines, setDeadlines] = useState<ScheduleEvent[]>([]);
    const [lightToday, setLightToday] = useState(0);
    const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min default
    const [timerActive, setTimerActive] = useState(false);

    const userId = getLocalUserId();
    const { greeting, emoji } = getTimeBasedGreeting();

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    // Timer countdown
    useEffect(() => {
        let interval: any;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [scheduleData, deadlinesData, lightData] = await Promise.all([
                fetchSchedule(userId, 7),
                fetchPendingDeadlines(userId),
                getTodayLight(userId),
            ]);

            setSchedule(scheduleData);
            setDeadlines(deadlinesData);
            setLightToday(lightData);

            // Generate AI suggestion
            const distractionLevel = estimateDistractionLevel(lightData, new Date().getHours());
            const suggestion = generateSmartSuggestion({
                userId,
                currentTime: new Date(),
                schedule: scheduleData,
                lightToday: lightData,
                distractionLevel,
                userPreferences: {},
            });
            setAiSuggestion(suggestion);
        } catch (error) {
            console.error('Error loading workspace data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSuggestionAction = (action: string) => {
        switch (action) {
            case 'deepFocus':
            case 'pomodoro':
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
            case 'community':
                onNavigate(AppView.COMMUNITY);
                break;
            case 'alternatives':
                onNavigate(AppView.ALTERNATIVES);
                break;
            default:
                break;
        }
    };

    // Get next 3 events for agenda
    const upcomingEvents = schedule.slice(0, 3);

    // Get urgent deadlines
    const urgentDeadlines = deadlines.filter((d) => d.priority === 'rojo').slice(0, 2);

    return (
        <motion.div
            className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-medium">Salir</span>
                </button>

                {/* Timer Display */}
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                    <Clock size={16} className="text-slate-500" />
                    <span className="font-mono font-bold text-slate-700">{formatTime(timeLeft)}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Title */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tu Workspace</h1>
                    <p className="text-slate-500 text-sm">Todo lo que necesitas para enfocarte hoy.</p>
                </div>

                {/* AI Tutor Card */}
                {aiSuggestion ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-gradient-to-r ${aiSuggestion.color} rounded-2xl p-4 shadow-lg`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <span className="text-[10px] bg-white/20 text-white px-2 py-1 rounded-full font-bold">
                                EN LÍNEA
                            </span>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">Tutor IA</h3>
                        <p className="text-white/90 text-sm mb-3">{aiSuggestion.message}</p>
                        <button
                            onClick={() => handleSuggestionAction(aiSuggestion.suggestedAction)}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            {aiSuggestion.icon} Empezar
                            <ChevronRight size={16} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-lg"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <span className="text-[10px] bg-white/20 text-white px-2 py-1 rounded-full font-bold">
                                EN LÍNEA
                            </span>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">Tutor IA</h3>
                        <p className="text-white/90 text-sm">
                            "¿Te ayudo a resumir el tema o resolver dudas?"
                        </p>
                    </motion.div>
                )}

                {/* Agenda & Teams Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Agenda Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={16} className="text-slate-600" />
                            <h3 className="font-bold text-slate-900">Agenda</h3>
                        </div>

                        {upcomingEvents.length > 0 ? (
                            <div className="space-y-2">
                                {upcomingEvents.map((event, i) => (
                                    <div key={event.id || i} className="flex items-start gap-2">
                                        <div
                                            className={`w-2 h-2 rounded-full mt-1.5 ${event.priority === 'rojo'
                                                    ? 'bg-red-500'
                                                    : event.priority === 'amarillo'
                                                        ? 'bg-amber-500'
                                                        : 'bg-emerald-500'
                                                }`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-400 text-[10px]">
                                                {formatRelativeTime(event.start_time)}
                                            </p>
                                            <p className="text-slate-900 text-xs font-medium truncate">
                                                {event.event_title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-xs">Sin eventos próximos</p>
                        )}

                        <button
                            onClick={onShowUpload}
                            className="w-full mt-3 text-emerald-600 text-xs font-medium flex items-center justify-center gap-1 hover:text-emerald-700 transition-colors"
                        >
                            <Plus size={14} />
                            Agregar
                        </button>
                    </motion.div>

                    {/* Teams/Notifications Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-slate-600" />
                                <h3 className="font-bold text-slate-900">Teams</h3>
                            </div>
                            {urgentDeadlines.length > 0 && (
                                <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {urgentDeadlines.length}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            {urgentDeadlines.length > 0 ? (
                                urgentDeadlines.map((deadline, i) => (
                                    <div key={deadline.id || i} className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                                            {deadline.event_title.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-900 text-xs font-medium truncate">
                                                {deadline.professor_name || 'Entrega'}
                                            </p>
                                            <p className="text-slate-400 text-[10px] truncate">
                                                {deadline.event_title}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                                        <CheckCircle size={16} className="text-white" />
                                    </div>
                                    <p className="text-slate-400 text-xs">Todo al día 🎉</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Quick Notes Section (placeholder) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen size={16} className="text-slate-600" />
                        <h3 className="font-bold text-slate-900">Notas</h3>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <div className="w-4 h-4 border-2 border-slate-300 rounded" />
                            <span>Leer intro</span>
                        </div>
                        <button className="text-emerald-600 text-xs font-medium flex items-center gap-1 hover:text-emerald-700 transition-colors">
                            <Plus size={14} />
                            Agregar nota
                        </button>
                    </div>
                </motion.div>

                {/* Light Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Zap size={18} className="text-white" />
                            <span className="text-white font-bold">{lightToday} min de luz</span>
                        </div>
                        <span className="text-white/70 text-xs">Meta: 120 min</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-2">
                        <div
                            className="bg-white h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((lightToday / 120) * 100, 100)}%` }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white border-t border-slate-200 px-6 py-3">
                <div className="flex items-center justify-around">
                    <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors">
                        <BookOpen size={20} />
                        <span className="text-[10px] font-medium">Notas</span>
                    </button>
                    <button
                        onClick={() => onNavigate(AppView.COMMUNITY)}
                        className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                        <Users size={20} />
                        <span className="text-[10px] font-medium">Salas</span>
                    </button>
                    <button
                        onClick={() => onNavigate(AppView.BREATHING)}
                        className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                        <Wind size={20} />
                        <span className="text-[10px] font-medium">Respirar</span>
                    </button>
                    <button
                        onClick={() => onNavigate(AppView.CRISIS)}
                        className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                        <Heart size={20} />
                        <span className="text-[10px] font-medium">Ayuda</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
