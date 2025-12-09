/**
 * DASHBOARD v5.0 - Minimal & Fluid
 * - No "Pomodoro" - natural language
 * - Subtle, not overwhelming
 * - Proper scrolling
 * - Transition-focused UX
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight, Wind, Smartphone, Users, BarChart2, Calendar, RefreshCw, HeartPulse } from 'lucide-react';
import { generateDashboardAction, AIContextualAction, DashboardContext } from '../services/aiContextService';
import { fetchSchedule, getUserProfile, calculateStreak, getTodayLight } from '../lib/supabase';
import { AppView } from '../types';

interface Props {
    userId: string;
    onNavigate: (view: AppView) => void;
    onStartSession: (type: string, config: any) => void;
}

export default function DashboardContextual({ userId, onNavigate, onStartSession }: Props) {
    const [aiAction, setAiAction] = useState<AIContextualAction | null>(null);
    const [loading, setLoading] = useState(true);
    const [lightToday, setLightToday] = useState(0);
    const [streak, setStreak] = useState(0);
    const [nextEvent, setNextEvent] = useState<any>(null);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const now = new Date();
                const [profile, schedule, light, stk] = await Promise.all([
                    getUserProfile(userId),
                    fetchSchedule(userId, 7),
                    getTodayLight(userId),
                    calculateStreak(userId)
                ]);

                setLightToday(light);
                setStreak(stk);

                const upcoming = schedule
                    .filter((e: any) => new Date(e.start_time).getTime() > now.getTime())
                    .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];
                setNextEvent(upcoming);

                const urgent = schedule.find((e: any) => {
                    const hrs = (new Date(e.start_time).getTime() - now.getTime()) / 3600000;
                    return e.type === 'entrega' && hrs > 0 && hrs < 8 && !e.started;
                });

                const action = await generateDashboardAction({
                    userId, currentTime: now, lightToday: light, schedule, urgentDeadline: urgent, nextEvent: upcoming
                });

                // Clean up Pomodoro terminology
                setAiAction({
                    ...action,
                    cta: action.cta.replace(/Pomodoro/gi, '').replace('Iniciar 25 min', 'Empezar').trim(),
                    title: action.title.replace(/Pomodoro/gi, '').trim()
                });
                setLoading(false);
            } catch (e) {
                setAiAction({
                    emoji: '✨', title: '', intro: 'Un pequeño paso ahora.', cta: 'Empezar', actionType: 'pomodoro', duration: 25
                });
                setLoading(false);
            }
        }
        load();
        const i = setInterval(load, 300000);
        return () => clearInterval(i);
    }, [userId]);

    const act = () => {
        if (!aiAction) return;
        const nav: Record<string, AppView> = {
            'crisis': AppView.FLIP_PHONE_MODE,
            'breathing': AppView.BREATHING,
            'flip-phone': AppView.FLIP_PHONE_MODE,
            'offline': AppView.OFFLINE_STUDY,
        };
        if (nav[aiAction.actionType]) {
            onNavigate(nav[aiAction.actionType]);
        } else {
            onStartSession('focus', { duration: aiAction.duration });
            onNavigate(AppView.FOCUS_SESSION);
        }
    };

    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-3xl">✨</motion.span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-y-auto pb-28">
            <div className="p-6 max-w-md mx-auto">

                {/* Greeting */}
                <p className="text-white/40 text-sm mb-10">{greet}</p>

                {/* Main suggestion - subtle */}
                {aiAction && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                        <p className="text-white/60 text-sm leading-relaxed mb-4">
                            {aiAction.intro}
                        </p>
                        <motion.button
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={act}
                            className="group flex items-center gap-2"
                        >
                            <span className="text-white font-medium">{aiAction.cta}</span>
                            <ArrowRight size={16} className="text-white/40 group-hover:text-white/80 transition-colors" />
                        </motion.button>
                        {aiAction.duration > 0 && (
                            <p className="text-white/20 text-xs mt-1">{aiAction.duration} min</p>
                        )}
                    </motion.div>
                )}

                {/* Stats row */}
                <div className="flex gap-6 text-xs text-white/50 mb-10">
                    <span><b className="text-white/80">{lightToday}</b> min hoy</span>
                    {streak > 0 && <span><b className="text-white/80">{streak}</b> días</span>}
                    {nextEvent && <span className="truncate max-w-[100px]">→ {nextEvent.event_title.split(' ')[0]}</span>}
                </div>

                {/* Quick actions */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <Pill onClick={() => onNavigate(AppView.BREATHING)}>Respirar</Pill>
                    <Pill onClick={() => onNavigate(AppView.FLIP_PHONE_MODE)}>Flip Phone</Pill>
                    <Pill onClick={() => onNavigate(AppView.ALTERNATIVES)}>Alternativas</Pill>
                </div>

                {/* More */}
                <button onClick={() => setShowMore(!showMore)} className="flex items-center gap-1 text-white/30 text-xs hover:text-white/50 transition-colors mb-4">
                    Más <ChevronDown size={10} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {showMore && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-2 pb-4">
                                <Pill onClick={() => onNavigate(AppView.COMMUNITY)}>Comunidad</Pill>
                                <Pill onClick={() => onNavigate(AppView.ANALYTICS)}>Estadísticas</Pill>
                                <Pill onClick={() => onNavigate(AppView.SESSION_JOURNAL)}>Historial</Pill>
                                <Pill onClick={() => onNavigate(AppView.CRISIS)}>Crisis</Pill>
                                <Pill onClick={() => onNavigate(AppView.OFFLINE_STUDY)}>Offline</Pill>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}

function Pill({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs text-white/50 hover:text-white/80 transition-all"
        >
            {children}
        </button>
    );
}
