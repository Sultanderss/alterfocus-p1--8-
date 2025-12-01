import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Award, BarChart3, Calendar } from 'lucide-react';

interface InterventionData {
    domain: string;
    count: number;
    successRate: number;
    avgTimeWasted: number;
}

interface AnalyticsData {
    totalSessions: number;
    completedSessions: number;
    avgDistractions: number;
    improvementPercent: number;
    topInterventions: InterventionData[];
    weeklyProgress: number[];
    currentStreak: number;
}

interface AnalyticsModuleProps {
    data: AnalyticsData;
}

export const AnalyticsModule: React.FC<AnalyticsModuleProps> = ({ data }) => {
    const completionRate = data.totalSessions > 0
        ? Math.round((data.completedSessions / data.totalSessions) * 100)
        : 0;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <BarChart3 className="text-brand-primary" />
                    Analytics
                </h2>
                <p className="text-slate-400">
                    Tu progreso y estadísticas de productividad
                </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Sessions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 space-y-2"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center">
                            <Calendar size={20} className="text-brand-primary" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Sesiones
                        </p>
                    </div>
                    <p className="text-3xl font-bold text-white">{data.totalSessions}</p>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <TrendingUp size={12} />
                        Esta semana
                    </p>
                </motion.div>

                {/* Completion Rate */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-4 space-y-2"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Target size={20} className="text-emerald-400" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Completadas
                        </p>
                    </div>
                    <p className="text-3xl font-bold text-white">{completionRate}%</p>
                    <p className="text-xs text-slate-400">
                        {data.completedSessions}/{data.totalSessions} finalizadas
                    </p>
                </motion.div>

                {/* Streak */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-4 space-y-2"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                            <Zap size={20} className="text-amber-400" fill="currentColor" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Racha
                        </p>
                    </div>
                    <p className="text-3xl font-bold text-white">{data.currentStreak}</p>
                    <p className="text-xs text-amber-400">
                        🔥 Días consecutivos
                    </p>
                </motion.div>

                {/* Improvement */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-4 space-y-2"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-brand-secondary/20 rounded-lg flex items-center justify-center">
                            <TrendingUp size={20} className="text-brand-secondary" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Mejora
                        </p>
                    </div>
                    <p className="text-3xl font-bold text-white">+{data.improvementPercent}%</p>
                    <p className="text-xs text-brand-secondary">
                        vs semana anterior
                    </p>
                </motion.div>
            </div>

            {/* Weekly Progress Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 space-y-4"
            >
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 size={20} className="text-brand-primary" />
                    Progreso Semanal
                </h3>

                <div className="flex items-end justify-between gap-2 h-40">
                    {data.weeklyProgress.map((value, index) => {
                        const maxValue = Math.max(...data.weeklyProgress);
                        const height = (value / maxValue) * 100;
                        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                    className={`w-full rounded-t-lg ${index === 6
                                            ? 'bg-gradient-to-t from-brand-primary to-brand-secondary'
                                            : 'bg-gradient-to-t from-brand-primary/50 to-brand-primary/30'
                                        }`}
                                />
                                <p className="text-xs font-semibold text-slate-400">{days[index]}</p>
                                <p className="text-xs text-white">{value}</p>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Top Distractions with Effectiveness */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card p-6 space-y-4"
            >
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award size={20} className="text-amber-400" />
                    Efectividad por Distracción
                </h3>

                <div className="space-y-3">
                    {data.topInterventions.slice(0, 5).map((item, index) => (
                        <div key={item.domain} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {item.domain.includes('youtube') ? '🎥' :
                                            item.domain.includes('facebook') ? '📘' :
                                                item.domain.includes('instagram') ? '📷' :
                                                    item.domain.includes('tiktok') ? '🎵' : '🌐'}
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-white capitalize">
                                            {item.domain.replace('.com', '')}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {item.count} intervenciones · {item.avgTimeWasted} min promedio
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${item.successRate >= 70 ? 'text-emerald-400' :
                                            item.successRate >= 40 ? 'text-amber-400' :
                                                'text-rose-400'
                                        }`}>
                                        {item.successRate}%
                                    </p>
                                    <p className="text-xs text-slate-500">éxito</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.successRate}%` }}
                                    transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                                    className={`h-full rounded-full ${item.successRate >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                                            item.successRate >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                                                'bg-gradient-to-r from-rose-500 to-rose-400'
                                        }`}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {data.topInterventions.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-slate-400">
                            Aún no hay datos suficientes
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Completa algunas sesiones para ver tus estadísticas
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="glass-card p-6 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/30"
            >
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                    💡 Insight de la Semana
                </h3>
                <p className="text-slate-300 leading-relaxed">
                    {data.improvementPercent > 0
                        ? `¡Excelente! Has mejorado un ${data.improvementPercent}% vs la semana pasada. ${data.avgDistractions < 3
                            ? 'Tu enfoque está en un nivel óptimo. 🎯'
                            : 'Intenta reducir distracciones en las primeras 15 minutos de cada sesión.'
                        }`
                        : 'No te desanimes. Cada sesión es una oportunidad para mejorar. Prueba establecer objetivos más específicos.'}
                </p>
            </motion.div>
        </div>
    );
};

export default AnalyticsModule;
