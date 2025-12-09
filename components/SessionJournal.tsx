import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Calendar, Clock, Zap, TrendingUp, Flame,
    BarChart2, ChevronRight, Sparkles, Target, Award
} from 'lucide-react';
import {
    fetchSessionJournal,
    fetchDailyStats,
    calculateStreak,
    getLocalUserId,
    Session,
    DailyStats
} from '../lib/supabase';

interface SessionJournalProps {
    onBack: () => void;
}

export default function SessionJournal({ onBack }: SessionJournalProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'journal' | 'stats'>('journal');

    const userId = getLocalUserId();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sessionsData, statsData, streakData] = await Promise.all([
                fetchSessionJournal(userId, 30),
                fetchDailyStats(userId, 30),
                calculateStreak(userId),
            ]);
            setSessions(sessionsData);
            setDailyStats(statsData);
            setStreak(streakData);
        } catch (error) {
            console.error('Error loading journal:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const totalLight = dailyStats.reduce((sum, d) => sum + (d.light_earned || 0), 0);
    const totalSessions = dailyStats.reduce((sum, d) => sum + (d.sessions_completed || 0), 0);
    const totalFocusTime = dailyStats.reduce((sum, d) => sum + (d.total_focus_time || 0), 0);
    const avgDailyLight = dailyStats.length > 0 ? Math.round(totalLight / dailyStats.length) : 0;

    // Group sessions by date
    const groupedSessions = sessions.reduce((acc, session) => {
        const date = new Date(session.start_time).toLocaleDateString('es-CO', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
        return acc;
    }, {} as Record<string, Session[]>);

    const getSessionIcon = (type: string) => {
        switch (type) {
            case 'flipphone': return '📱';
            case 'deepfocus': return '🎯';
            case 'breathing': return '🌬️';
            case 'offline': return '📚';
            case 'pomodoro': return '🍅';
            case 'community': return '👥';
            default: return '✨';
        }
    };

    const getSessionLabel = (type: string) => {
        switch (type) {
            case 'flipphone': return 'Flip Phone';
            case 'deepfocus': return 'Deep Focus';
            case 'breathing': return 'Respiración';
            case 'offline': return 'Sin Pantalla';
            case 'pomodoro': return 'Pomodoro';
            case 'community': return 'Comunidad';
            default: return 'Sesión';
        }
    };

    // Generate week heatmap data (last 7 days)
    const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const heatmapData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayStats = dailyStats.find((s) => s.stat_date === dateStr);
        return {
            day: weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1],
            light: dayStats?.light_earned || 0,
            date: dateStr,
        };
    });

    const maxLight = Math.max(...heatmapData.map((d) => d.light), 30);

    return (
        <motion.div
            className="absolute inset-0 z-40 flex flex-col overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 100%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Header */}
            <div className="px-4 py-4 flex items-center gap-4 border-b border-white/5">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onBack}
                    className="p-2 bg-white/5 rounded-xl text-slate-300 hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <div className="flex-1">
                    <h1 className="font-bold text-lg text-white">Journal de Sesiones</h1>
                    <p className="text-xs text-slate-500">Tu historial de enfoque</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 py-3 flex gap-2">
                <button
                    onClick={() => setView('journal')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${view === 'journal'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                >
                    Historial
                </button>
                <button
                    onClick={() => setView('stats')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${view === 'stats'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                >
                    Estadísticas
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-8">
                <AnimatePresence mode="wait">
                    {view === 'stats' ? (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4 py-4"
                        >
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap size={18} className="text-amber-400" />
                                        <span className="text-amber-400 text-xs font-medium">Luz Total</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{totalLight}</p>
                                    <p className="text-slate-500 text-xs">minutos (30 días)</p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Flame size={18} className="text-purple-400" />
                                        <span className="text-purple-400 text-xs font-medium">Racha</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{streak}</p>
                                    <p className="text-slate-500 text-xs">días seguidos</p>
                                </div>

                                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target size={18} className="text-emerald-400" />
                                        <span className="text-emerald-400 text-xs font-medium">Sesiones</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{totalSessions}</p>
                                    <p className="text-slate-500 text-xs">completadas</p>
                                </div>

                                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp size={18} className="text-blue-400" />
                                        <span className="text-blue-400 text-xs font-medium">Promedio</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{avgDailyLight}</p>
                                    <p className="text-slate-500 text-xs">min/día</p>
                                </div>
                            </div>

                            {/* Week Heatmap */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar size={18} className="text-slate-400" />
                                    <span className="text-white font-medium">Esta semana</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    {heatmapData.map((day, i) => {
                                        const intensity = day.light / maxLight;
                                        const bgColor =
                                            intensity > 0.7
                                                ? 'bg-emerald-500'
                                                : intensity > 0.4
                                                    ? 'bg-emerald-500/60'
                                                    : intensity > 0
                                                        ? 'bg-emerald-500/30'
                                                        : 'bg-white/10';

                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                <div
                                                    className={`w-full aspect-square rounded-lg ${bgColor} flex items-center justify-center`}
                                                >
                                                    {day.light > 0 && (
                                                        <span className="text-[10px] text-white font-bold">{day.light}</span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-500">{day.day}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Achievement */}
                            {streak >= 3 && (
                                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-500/30 rounded-xl flex items-center justify-center">
                                        <Award size={24} className="text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-amber-400 font-bold">¡Racha de {streak} días!</p>
                                        <p className="text-slate-400 text-sm">Sigue así para desbloquear logros</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="journal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-4"
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full mb-4"
                                    />
                                    <p className="text-slate-400">Cargando historial...</p>
                                </div>
                            ) : Object.keys(groupedSessions).length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                                        <Sparkles size={32} className="text-slate-500" />
                                    </div>
                                    <h3 className="text-white font-bold mb-2">Sin sesiones aún</h3>
                                    <p className="text-slate-500 text-sm max-w-[200px]">
                                        Completa tu primera sesión de enfoque para ver tu historial aquí
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(groupedSessions).map(([date, daySessions]) => (
                                        <div key={date}>
                                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
                                                {date}
                                            </h3>
                                            <div className="space-y-2">
                                                {daySessions.map((session, i) => (
                                                    <motion.div
                                                        key={session.id || i}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3"
                                                    >
                                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-xl">
                                                            {session.emoji || getSessionIcon(session.session_type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white font-medium text-sm truncate">
                                                                {getSessionLabel(session.session_type)}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                <Clock size={12} />
                                                                <span>{session.duration} min</span>
                                                                {session.context && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="truncate">{session.context}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-amber-400">
                                                            <Zap size={14} />
                                                            <span className="text-sm font-bold">+{session.light_earned}</span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
