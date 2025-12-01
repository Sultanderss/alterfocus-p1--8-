import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Shield, AlertTriangle, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { InterventionState, LEVEL_CONFIGS, PROFILE_CONFIGS } from '../services/interventionLevelSystem';

interface InterventionHistoryProps {
    state: InterventionState;
    onClose: () => void;
}

export default function InterventionHistory({ state, onClose }: InterventionHistoryProps) {
    const currentConfig = LEVEL_CONFIGS[state.currentLevel];
    const profileConfig = PROFILE_CONFIGS[state.userProfile];

    // Calculate stats
    const recentHistory = state.interventionHistory.slice(-20);
    const successRate = recentHistory.length > 0
        ? (recentHistory.filter(r => r.success).length / recentHistory.length) * 100
        : 0;

    const levelColors = {
        0: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
        1: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
        2: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
        3: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
        4: 'from-red-500/20 to-rose-500/20 border-red-500/30',
        5: 'from-purple-500/20 to-fuchsia-500/20 border-purple-500/30'
    };

    const profileEmojis = {
        evitador: '🐌',
        impulsivo: '⚡',
        perfeccionista: '💎',
        neutro: '🎯'
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] flex items-center justify-center p-6 overflow-y-auto"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-panel rounded-3xl w-full max-w-2xl shadow-2xl border border-white/10 relative my-auto max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-brand-dark/95 backdrop-blur-sm border-b border-white/10 p-6 rounded-t-3xl z-10">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                        <XCircle size={24} className="text-slate-400" />
                    </button>

                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Activity className="text-brand-primary" />
                        Sistema de Intervención
                    </h2>
                    <p className="text-sm text-slate-400">Historial y nivel actual de protección</p>
                </div>

                <div className="p-6 space-y-6">

                    {/* Current Level Card */}
                    <div className={`bg-gradient-to-br ${levelColors[state.currentLevel]} border rounded-2xl p-6`}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nivel Actual</div>
                                <h3 className="text-2xl font-bold text-white mb-1">{currentConfig.name}</h3>
                                <p className="text-sm text-slate-300">{currentConfig.description}</p>
                            </div>
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl font-bold">
                                {state.currentLevel}
                            </div>
                        </div>

                        {/* Intensity Badge */}
                        <div className="flex items-center gap-2 mb-4">
                            <Shield size={16} className="text-white" />
                            <span className="text-xs font-bold text-white uppercase tracking-wide">
                                Intensidad: {currentConfig.blockingIntensity}
                            </span>
                        </div>

                        {/* Progress Bars */}
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-300">Racha de Éxito</span>
                                    <span className="text-white font-bold">{state.successStreak}/{currentConfig.deescalationThreshold}</span>
                                </div>
                                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (state.successStreak / currentConfig.deescalationThreshold) * 100)}%` }}
                                        className="h-full bg-green-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-300">Racha de Fracaso</span>
                                    <span className="text-white font-bold">{state.failureStreak}/{currentConfig.escalationThreshold}</span>
                                </div>
                                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (state.failureStreak / currentConfig.escalationThreshold) * 100)}%` }}
                                        className="h-full bg-red-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tu Perfil</div>
                                <h3 className="text-xl font-bold text-white capitalize flex items-center gap-2">
                                    <span className="text-2xl">{profileEmojis[state.userProfile]}</span>
                                    {state.userProfile}
                                </h3>
                            </div>
                            {state.successStreak >= 3 && <TrendingUp className="text-green-400" size={24} />}
                            {state.failureStreak >= 2 && <TrendingDown className="text-red-400" size={24} />}
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{profileConfig.description}</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-full text-xs font-bold">
                                {profileConfig.escalationSpeed} escalation
                            </span>
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold">
                                {profileConfig.preferredMessages} messages
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="glass-card p-4 text-center">
                            <div className="text-2xl font-bold text-brand-primary mb-1">{state.dailyProgressIndex}%</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide">Progreso Hoy</div>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <div className="text-2xl font-bold text-green-400 mb-1">{successRate.toFixed(0)}%</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide">Tasa Éxito</div>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <div className="text-2xl font-bold text-cyan-400 mb-1">{state.interventionHistory.length}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide">Total</div>
                        </div>
                    </div>

                    {/* Recent History */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Activity size={14} />
                            Últimas 10 Intervenciones
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {recentHistory.slice().reverse().slice(0, 10).map((record, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`glass-card p-4 flex items-center justify-between ${record.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {record.success ? (
                                            <CheckCircle2 size={20} className="text-green-400" />
                                        ) : (
                                            <XCircle size={20} className="text-red-400" />
                                        )}
                                        <div>
                                            <div className="text-sm font-bold text-white capitalize">
                                                {record.action.replace('_', ' ')}
                                            </div>
                                            <div className="text-xs text-slate-500 capitalize">
                                                Nivel {record.level} • {record.emotionalState || 'Normal'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono text-slate-400">
                                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Warning */}
                    {state.failureStreak >= 2 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <div className="text-sm font-bold text-red-300 mb-1">Alerta de Escalamiento</div>
                                <div className="text-xs text-red-200">
                                    {state.failureStreak} fracaso(s) consecutivo(s).
                                    {currentConfig.escalationThreshold - state.failureStreak > 0
                                        ? ` ${currentConfig.escalationThreshold - state.failureStreak} más subirán al Nivel ${state.currentLevel + 1}.`
                                        : ' Próxima falla subirá de nivel.'}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </motion.div>
        </motion.div>
    );
}
