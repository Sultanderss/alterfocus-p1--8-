import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis, PieChart, Pie } from 'recharts';
import { SessionRecord, StatData, InterventionRecord } from '../types';
import { Trophy, TrendingUp, Calendar, ArrowLeft, Sparkles, Loader2, Clock, History, Brain, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { getInterventionHistory } from '../services/interventionEngine';

interface AnalyticsProps {
    onBack: () => void;
}

interface EmotionalAnalytics {
    emotionalTriggers: {
        anxiety: number;
        confusion: number;
        fatigue: number;
        overwhelm: number;
        mild_distraction: number;
    };
    interventionEffectiveness: {
        breathing: { attempts: number, success: number, rate: number },
        gentle_question: { attempts: number, success: number, rate: number },
        reframing: { attempts: number, success: number, rate: number },
        physical: { attempts: number, success: number, rate: number },
        ai_therapy: { attempts: number, success: number, rate: number }
    };
    mostProductiveHour: string;
    weeklyImprovement: number;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onBack }) => {
    const [chartData, setChartData] = useState<StatData[]>([]);
    const [lifetimeMinutes, setLifetimeMinutes] = useState(0);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [aiInsight, setAiInsight] = useState<string>('Analizando tus patrones de estudio...');
    const [isLoadingInsight, setIsLoadingInsight] = useState(false);
    const [emotionalAnalytics, setEmotionalAnalytics] = useState<EmotionalAnalytics | null>(null);
    const [personalizedInsights, setPersonalizedInsights] = useState<string[]>([]);

    useEffect(() => {
        // 1. Load session data
        let history: SessionRecord[] = [];
        try {
            const historyRaw = localStorage.getItem('alterfocus_history');
            history = historyRaw ? JSON.parse(historyRaw) : [];
        } catch (e) {
            console.error("Failed to parse history", e);
            history = [];
        }

        // 2. Load intervention history
        const interventions = getInterventionHistory();

        // 3. Calculate emotional analytics
        const analytics = calculateEmotionalAnalytics(interventions);
        setEmotionalAnalytics(analytics);

        // 4. Generate personalized insights
        const insights = generatePersonalizedInsights(analytics, interventions.length);
        setPersonalizedInsights(insights);

        // 5. Calculate LIFETIME Stats
        let totalMinsAllTime = 0;
        let totalSessionsAllTime = 0;
        const recentSessionsForAI: any[] = [];

        history.forEach(session => {
            if (session.completed) {
                totalMinsAllTime += session.durationMinutes;
                totalSessionsAllTime++;

                if (recentSessionsForAI.length < 20) {
                    recentSessionsForAI.push({
                        date: session.date,
                        duration: session.durationMinutes,
                        mode: session.mode
                    });
                }
            }
        });

        setLifetimeMinutes(totalMinsAllTime);
        setCompletedSessions(totalSessionsAllTime);

        // 6. Calculate WEEKLY Data for Chart
        const daysMap = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const today = new Date();
        const last7Days: StatData[] = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dayName = daysMap[d.getDay()];
            last7Days.push({ day: dayName, hours: 0, sessions: 0 });
        }

        history.forEach(session => {
            if (!session.completed) return;

            const sessionDate = new Date(session.date);
            const diffTime = Math.abs(today.getTime() - sessionDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 7) {
                const dayIndex = 6 - (Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)));

                if (last7Days[dayIndex]) {
                    last7Days[dayIndex].hours += (session.durationMinutes / 60);
                    last7Days[dayIndex].sessions += 1;
                }
            }
        });

        setChartData(last7Days.map(d => ({ ...d, hours: parseFloat(d.hours.toFixed(1)) })));

        // 7. Generate AI Insight
        generateAIInsight(recentSessionsForAI, totalMinsAllTime, totalSessionsAllTime);

    }, []);

    const calculateEmotionalAnalytics = (interventions: InterventionRecord[]): EmotionalAnalytics => {
        const triggers = {
            anxiety: 0,
            confusion: 0,
            fatigue: 0,
            overwhelm: 0,
            mild_distraction: 0
        };

        const effectiveness = {
            breathing: { attempts: 0, success: 0, rate: 0 },
            gentle_question: { attempts: 0, success: 0, rate: 0 },
            reframing: { attempts: 0, success: 0, rate: 0 },
            physical: { attempts: 0, success: 0, rate: 0 },
            ai_therapy: { attempts: 0, success: 0, rate: 0 }
        };

        interventions.forEach(intervention => {
            // Count emotional triggers
            if (intervention.emotionalState) {
                triggers[intervention.emotionalState as keyof typeof triggers]++;
            }

            // Count intervention effectiveness
            const type = intervention.type as keyof typeof effectiveness;
            if (effectiveness[type]) {
                effectiveness[type].attempts++;
                if (intervention.successful) {
                    effectiveness[type].success++;
                }
            }
        });

        // Calculate success rates
        Object.keys(effectiveness).forEach(key => {
            const k = key as keyof typeof effectiveness;
            if (effectiveness[k].attempts > 0) {
                effectiveness[k].rate = Math.round((effectiveness[k].success / effectiveness[k].attempts) * 100);
            }
        });

        return {
            emotionalTriggers: triggers,
            interventionEffectiveness: effectiveness,
            mostProductiveHour: '10:00-12:00', // TODO: Calculate from actual data
            weeklyImprovement: 15 // TODO: Calculate from week-over-week comparison
        };
    };

    const generatePersonalizedInsights = (analytics: EmotionalAnalytics, totalInterventions: number): string[] => {
        const insights: string[] = [];

        // Insight 1: Main emotional trigger
        const triggers = Object.entries(analytics.emotionalTriggers)
            .filter(([key]) => key !== 'mild_distraction')
            .sort((a, b) => b[1] - a[1]);

        if (triggers[0] && triggers[0][1] > 0) {
            const [trigger, count] = triggers[0];
            const percentage = totalInterventions > 0 ? Math.round((count / totalInterventions) * 100) : 0;
            const triggerNames = {
                anxiety: 'Ansiedad',
                confusion: 'Confusión',
                fatigue: 'Cansancio',
                overwhelm: 'Abrumamiento'
            };
            insights.push(
                `😰 ${triggerNames[trigger as keyof typeof triggerNames]} es tu principal trigger (${percentage}%). ${trigger === 'anxiety' ? 'La respiración puede ayudarte.' :
                    trigger === 'confusion' ? 'El reencuadre cognitivo es efectivo para ti.' :
                        trigger === 'fatigue' ? 'Considera ejercicios físicos breves.' :
                            'El chat IA puede desbloquear tu mente.'
                }`
            );
        }

        // Insight 2: Best intervention
        const bestIntervention = Object.entries(analytics.interventionEffectiveness)
            .filter(([_, data]) => data.attempts > 0)
            .sort((a, b) => b[1].rate - a[1].rate)[0];

        if (bestIntervention) {
            const [type, data] = bestIntervention;
            const interventionNames = {
                breathing: 'Respiración',
                gentle_question: 'Pregunta Suave',
                reframing: 'Reencuadre',
                physical: 'Ejercicio Físico',
                ai_therapy: 'Chat IA'
            };
            insights.push(
                `⭐ ${interventionNames[type as keyof typeof interventionNames]} funciona ${data.rate}% de las veces para ti.`
            );
        }

        // Insight 3: Progress
        if (analytics.weeklyImprovement > 0) {
            insights.push(
                `📈 Eres ${analytics.weeklyImprovement}% más efectivo que la semana pasada. ¡Sigue así!`
            );
        }

        return insights;
    };

    const generateAIInsight = async (history: any[], totalMins: number, totalSessions: number) => {
        if (history.length === 0) {
            setAiInsight("Aún no tengo suficientes datos. Completa tu primera sesión para recibir un análisis personalizado.");
            return;
        }

        setIsLoadingInsight(true);
        try {
            let insightText = "";
            try {
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (!apiKey) throw new Error("No API Key");

                const ai = new GoogleGenAI({ apiKey });
                const prompt = `
                Act as a productivity analyst for a student app.
                Data: ${JSON.stringify(history)}.
                Total Mins: ${totalMins}. Sessions: ${totalSessions}.
                
                Provide a short (max 20 words) encouraging insight in Spanish directly to the user ("Tú").
                Focus on consistency or effort.
                `;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                insightText = response.text || "";
            } catch (e) {
                // Fallback to mock
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mocks = [
                    "¡Gran consistencia! Estás construyendo un hábito sólido.",
                    "Tu esfuerzo es notable. Sigue así para alcanzar tus metas.",
                    "Cada minuto cuenta. Estás invirtiendo en tu futuro.",
                    "La disciplina es el puente entre metas y logros. ¡Vas bien!"
                ];
                insightText = mocks[Math.floor(Math.random() * mocks.length)];
            }

            setAiInsight(insightText || "Sigue constante. La consistencia es la clave del éxito.");
        } catch (error) {
            setAiInsight("Sigue constante. La consistencia es la clave del éxito.");
        } finally {
            setIsLoadingInsight(false);
        }
    };

    const formatLifetime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    const getMainTrigger = (): [string, number] | null => {
        if (!emotionalAnalytics) return null;
        const triggers = Object.entries(emotionalAnalytics.emotionalTriggers)
            .filter(([key]) => key !== 'mild_distraction')
            .sort((a, b) => (b[1] as number) - (a[1] as number))[0] as [string, number];
        return triggers;
    };

    return (
        <motion.div
            className="absolute inset-0 bg-brand-dark overflow-y-auto z-30 transition-colors duration-300 pb-24"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
        >
            <div className="p-6">
                <header className="mb-6 flex items-start gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-200" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white leading-tight">Dashboard de Comprensión</h1>
                        <p className="text-sm text-slate-400">Entendiendo el POR QUÉ de tu procrastinación</p>

                        <div className="inline-flex items-center gap-1.5 mt-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                            <History size={12} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-300">
                                Tiempo Total: {formatLifetime(lifetimeMinutes)}
                            </span>
                        </div>
                    </div>
                </header>

                {/* EMOTIONAL INTELLIGENCE DASHBOARD (NEW) */}
                {emotionalAnalytics && getMainTrigger() && (
                    <div className="mb-6 glass-card p-5 border-purple-500/30">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain size={20} className="text-purple-400" />
                            <h3 className="font-bold text-white">Tu Patrón Emocional</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-lg p-3">
                                <div className="text-xs text-slate-500 mb-1">Trigger Principal</div>
                                <div className="text-lg font-bold text-purple-300">
                                    {getMainTrigger()[0] === 'anxiety' ? '😰 Ansiedad' :
                                        getMainTrigger()[0] === 'confusion' ? '🤔 Confusión' :
                                            getMainTrigger()[0] === 'fatigue' ? '😴 Cansancio' : '😫 Abrumamiento'}
                                </div>
                                <div className="text-xs text-slate-400">
                                    {getMainTrigger()[1]} veces detectado
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                                <div className="text-xs text-slate-500 mb-1">Tu Mejor Herramienta</div>
                                <div className="text-lg font-bold text-emerald-300">
                                    {(() => {
                                        const bestIntervention = Object.entries(emotionalAnalytics.interventionEffectiveness)
                                            .filter(([_, d]: any) => d.attempts > 0)
                                            .sort((a: any, b: any) => b[1].rate - a[1].rate)[0];
                                        return (bestIntervention?.[1] as any)?.rate || 0;
                                    })()}%
                                </div>
                                <div className="text-xs text-slate-400">de éxito</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PERSONALIZED INSIGHTS */}
                {personalizedInsights.length > 0 && (
                    <div className="mb-6 space-y-2">
                        <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                            <Target size={14} /> Insights Personalizados
                        </h3>
                        {personalizedInsights.map((insight, idx) => (
                            <div key={idx} className="glass-card p-4 flex items-start gap-3">
                                <Zap size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-200">{insight}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* AI Dynamic Insight Card */}
                <div className="mb-8 p-5 glass-card border-brand-primary/30 flex gap-4 transition-colors relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none" />
                    <div className="min-w-[3rem] h-12 w-12 bg-brand-primary/20 rounded-full flex items-center justify-center shadow-sm text-brand-primary z-10">
                        {isLoadingInsight ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                    </div>
                    <div className="z-10 flex-1">
                        <h4 className="font-bold text-brand-primary text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                            AlterFocus Insights
                        </h4>
                        <p className="text-slate-200 text-sm font-medium leading-relaxed">
                            "{aiInsight}"
                        </p>
                    </div>
                </div>

                {/* Chart Card */}
                <div className="glass-card p-6 mb-6 transition-colors">
                    <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                        <Calendar size={18} className="text-brand-secondary" />
                        Actividad Semanal (Horas)
                    </h3>

                    {lifetimeMinutes > 0 ? (
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                        formatter={(value: number) => [`${value} hrs`, '']}
                                        labelStyle={{ fontWeight: 'bold', color: '#cbd5e1' }}
                                    />
                                    <Bar dataKey="hours" radius={[6, 6, 6, 6]} barSize={32}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.hours >= 1 ? '#6366f1' : 'rgba(99, 102, 241, 0.2)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-56 w-full flex flex-col items-center justify-center bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
                            <Trophy className="text-slate-600 mb-2" size={32} />
                            <p className="text-slate-500 text-sm font-medium">Completa una sesión para ver datos</p>
                        </div>
                    )}
                </div>

                {/* Secondary Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-5 relative overflow-hidden transition-colors">
                        <div className="relative z-10">
                            <div className="text-slate-500 text-[10px] font-bold mb-1 uppercase tracking-wider">Sesiones Totales</div>
                            <div className="text-3xl font-bold text-white">{completedSessions}</div>
                            <div className="text-xs text-slate-400 mt-1">Completadas</div>
                        </div>
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-white">
                            <Trophy size={70} />
                        </div>
                    </div>

                    <div className="glass-card p-5 relative overflow-hidden transition-colors border-emerald-500/20 bg-emerald-900/10">
                        <div className="relative z-10">
                            <div className="text-emerald-400 text-[10px] font-bold mb-1 uppercase tracking-wider">Tiempo Total</div>
                            <div className="text-3xl font-bold text-emerald-300">
                                {Math.floor(lifetimeMinutes / 60)}<span className="text-lg font-medium opacity-60">h</span>
                            </div>
                            <div className="text-xs text-emerald-400/60 mt-1">Enfoque acumulado</div>
                        </div>
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-emerald-400">
                            <Clock size={70} />
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default Analytics;