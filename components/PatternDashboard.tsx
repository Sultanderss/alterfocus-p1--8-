/**
 * PATTERN ANALYSIS DASHBOARD
 * 
 * Dashboard para visualizar patrones de procrastinación detectados,
 * efectividad de intervenciones y arquetipos del usuario.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, TrendingUp, Clock, Target, RefreshCw, FileSignature, Award } from 'lucide-react';
import {
    getCurrentArchetype,
    getArchetypeHistory,
    type ArchetypeDetection
} from '../lib/archetypeEngine';

interface PatternDashboardProps {
    onBack: () => void;
}

interface StoredEffectiveness {
    [key: string]: number;
}

interface Pattern {
    name: string;
    archetype: string;
    frequency: number;
    lastSeen: string;
    isChronic: boolean;
}

export const PatternDashboard: React.FC<PatternDashboardProps> = ({ onBack }) => {
    const [currentArchetype, setCurrentArchetype] = useState<ArchetypeDetection | null>(null);
    const [history, setHistory] = useState<ArchetypeDetection[]>([]);
    const [effectiveness, setEffectiveness] = useState<StoredEffectiveness>({});
    const [patterns, setPatterns] = useState<Pattern[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const current = getCurrentArchetype();
        setCurrentArchetype(current);

        const hist = getArchetypeHistory();
        setHistory(hist);

        try {
            const effData = localStorage.getItem('alterfocus_intervention_effectiveness');
            if (effData) {
                setEffectiveness(JSON.parse(effData));
            }
        } catch { }

        analyzePatterns(hist);
    };

    const analyzePatterns = (hist: ArchetypeDetection[]) => {
        const patternMap: Record<string, Pattern> = {};

        hist.forEach(detection => {
            const key = detection.primary;
            if (patternMap[key]) {
                patternMap[key].frequency++;
                patternMap[key].lastSeen = detection.detected_at;
            } else {
                patternMap[key] = {
                    name: `Patrón de ${detection.primary}`,
                    archetype: detection.primary,
                    frequency: 1,
                    lastSeen: detection.detected_at,
                    isChronic: false
                };
            }
        });

        Object.values(patternMap).forEach(p => {
            if (p.frequency >= 5) p.isChronic = true;
        });

        setPatterns(Object.values(patternMap).sort((a, b) => b.frequency - a.frequency));
    };

    const getArchetypeColor = (archetype: string) => {
        const colors: Record<string, string> = {
            Fear: 'from-red-500 to-orange-500',
            LowEnergy: 'from-blue-500 to-cyan-500',
            Confusion: 'from-purple-500 to-pink-500',
            Chronic: 'from-slate-500 to-zinc-500'
        };
        return colors[archetype] || colors.Fear;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return 'Hace menos de 1 hora';
        if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
        const days = Math.floor(hours / 24);
        return `Hace ${days} día${days > 1 ? 's' : ''}`;
    };

    const topInterventions = Object.entries(effectiveness)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#050508] overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 h-full overflow-y-auto pb-32">
                <div className="sticky top-0 bg-[#050508]/80 backdrop-blur-xl z-20 border-b border-white/5">
                    <div className="px-6 py-4 flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onBack}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
                        >
                            <ArrowLeft size={20} className="text-white" />
                        </motion.button>
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <Brain size={20} className="text-purple-400" />
                                Análisis de Patrones
                            </h1>
                            <p className="text-slate-500 text-xs">Tu perfil de procrastinación</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 space-y-6">
                    {currentArchetype && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`bg-gradient-to-br ${getArchetypeColor(currentArchetype.primary)} p-[1px] rounded-3xl`}
                        >
                            <div className="bg-[#0a0a0f]/95 backdrop-blur-xl rounded-3xl p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Tu arquetipo actual</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-4xl">{currentArchetype.emoji}</span>
                                            <div>
                                                <h2 className="text-2xl font-black text-white">{currentArchetype.primary}</h2>
                                                {currentArchetype.secondary && (
                                                    <p className="text-slate-400 text-sm">+ {currentArchetype.secondary}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">
                                            {Math.round(currentArchetype.confidence_primary * 100)}%
                                        </div>
                                        <p className="text-slate-500 text-xs">confianza</p>
                                    </div>
                                </div>
                                <p className="mt-4 text-slate-400 text-sm">{currentArchetype.message}</p>
                                <p className="mt-2 text-slate-600 text-xs">
                                    Detectado {formatDate(currentArchetype.detected_at)}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4"
                        >
                            <div className="flex items-center gap-2 text-purple-400 mb-2">
                                <Clock size={18} />
                                <span className="text-xs font-medium">Detecciones</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{history.length}</div>
                            <p className="text-slate-500 text-xs">total histórico</p>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4"
                        >
                            <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                <Target size={18} />
                                <span className="text-xs font-medium">Intervenciones</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{Object.keys(effectiveness).length}</div>
                            <p className="text-slate-500 text-xs">probadas</p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <RefreshCw size={16} className="text-purple-400" />
                            Patrones Detectados
                        </h3>
                        {patterns.length > 0 ? (
                            <div className="space-y-3">
                                {patterns.map((pattern, i) => (
                                    <div
                                        key={i}
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getArchetypeColor(pattern.archetype)} flex items-center justify-center`}>
                                            <span className="text-xl">
                                                {pattern.archetype === 'Fear' ? '😰' :
                                                    pattern.archetype === 'LowEnergy' ? '😴' :
                                                        pattern.archetype === 'Confusion' ? '🤔' : '⚙️'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-medium">{pattern.name}</p>
                                                {pattern.isChronic && (
                                                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                                                        Crónico
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-500 text-xs">{pattern.frequency} veces • {formatDate(pattern.lastSeen)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>Aún no hay suficientes datos</p>
                                <p className="text-xs mt-1">Usa más intervenciones para ver patrones</p>
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                    >
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Award size={16} className="text-amber-400" />
                            Intervenciones Más Efectivas
                        </h3>
                        {topInterventions.length > 0 ? (
                            <div className="space-y-2">
                                {topInterventions.map(([intervention, score], i) => (
                                    <div
                                        key={intervention}
                                        className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm">{intervention.replace(/_/g, ' ')}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-emerald-400 font-bold text-sm">
                                                {Math.round((score as number) * 100)}%
                                            </div>
                                            <p className="text-slate-600 text-[10px]">efectividad</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-500 text-sm">
                                <p>Completa intervenciones para ver tu ranking</p>
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <FileSignature size={16} className="text-orange-400" />
                            Contrato Personal
                        </h3>
                        {(() => {
                            try {
                                const contract = localStorage.getItem('alterfocus_personal_contract');
                                if (contract) {
                                    const parsed = JSON.parse(contract);
                                    return (
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                                            <p className="text-white/80 text-sm whitespace-pre-line line-clamp-3">
                                                {parsed.text}
                                            </p>
                                            <div className="mt-3 flex items-center gap-2 text-orange-400 text-xs">
                                                <FileSignature size={12} />
                                                Firmado: {parsed.signature}
                                            </div>
                                        </div>
                                    );
                                }
                            } catch { }
                            return (
                                <div className="text-center py-6 text-slate-500 text-sm">
                                    <p>No tienes un contrato activo</p>
                                    <p className="text-xs mt-1">Crea uno en una intervención Crónica</p>
                                </div>
                            );
                        })()}
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.35 }}
                    >
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <TrendingUp size={16} className="text-cyan-400" />
                            Historial Reciente
                        </h3>
                        <div className="space-y-2">
                            {history.slice(-5).reverse().map((detection, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <span className="text-xl">{detection.emoji}</span>
                                    <span className="text-white">{detection.primary}</span>
                                    <span className="text-slate-600 text-xs flex-1">
                                        {Math.round(detection.confidence_primary * 100)}%
                                    </span>
                                    <span className="text-slate-500 text-xs">
                                        {formatDate(detection.detected_at)}
                                    </span>
                                </div>
                            ))}
                            {history.length === 0 && (
                                <p className="text-center text-slate-500 text-sm py-4">
                                    Sin detecciones aún
                                </p>
                            )}
                        </div>
                    </motion.div>

                    <div className="h-8" />
                </div>
            </div>
        </motion.div>
    );
};

export default PatternDashboard;
