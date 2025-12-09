import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Brain, Zap, Shield, Activity, Users, X, ChevronLeft,
    Play, Pause, Star, Check, Award, TrendingUp, Clock, Target,
    Smartphone, Heart, Sparkles, ChevronRight, Eye, Lock, Timer,
    BarChart2, MessageCircle, Globe, Lightbulb, Coffee
} from 'lucide-react';

interface LandingPageProps {
    onEnterApp: () => void;
}

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const incrementTime = (duration * 1000) / end;

        const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start >= end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count}{suffix}</span>;
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, color, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group"
    >
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={24} className="text-white" />
        </div>
        <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
);

// Testimonial Component
const Testimonial = ({ quote, name, role, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-5"
    >
        <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
            ))}
        </div>
        <p className="text-white text-sm italic mb-4 leading-relaxed">"{quote}"</p>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {name.charAt(0)}
            </div>
            <div>
                <p className="font-bold text-white text-sm">{name}</p>
                <p className="text-slate-500 text-xs">{role}</p>
            </div>
        </div>
    </motion.div>
);

export default function LandingPage({ onEnterApp }: LandingPageProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'tech' | 'pitch' | 'demo'>('info');
    const [demoStep, setDemoStep] = useState(0);

    // Demo simulation steps
    const demoSteps = [
        { title: "Intentas abrir TikTok...", icon: Smartphone, color: "text-red-400" },
        { title: "AlterFocus te intercepta", icon: Shield, color: "text-cyan-400" },
        { title: "Te ofrece alternativas", icon: Lightbulb, color: "text-amber-400" },
        { title: "Eliges enfocarte", icon: Target, color: "text-green-400" },
        { title: "+25 puntos ganados!", icon: Award, color: "text-purple-400" }
    ];

    useEffect(() => {
        if (activeTab === 'demo') {
            const interval = setInterval(() => {
                setDemoStep(prev => (prev + 1) % demoSteps.length);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    return (
        <div className="h-full w-full bg-gradient-to-b from-black via-slate-900 to-black text-white overflow-y-auto">
            {/* Fixed Header */}
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/10 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="w-9 h-9 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                        >
                            <Brain size={20} className="text-white" />
                        </motion.div>
                        <span className="font-bold text-lg tracking-tight">AlterFocus</span>
                        <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                            BETA
                        </span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onEnterApp}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-cyan-500/30"
                    >
                        Entrar →
                    </motion.button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'info', label: '📱 Información', icon: null },
                        { id: 'demo', label: '🎮 Demo', icon: null },
                        { id: 'pitch', label: '🎯 Pitch', icon: null },
                        { id: 'tech', label: '⚙️ Tecnología', icon: null },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-6 pb-24">
                <AnimatePresence mode="wait">
                    {activeTab === 'info' && (
                        <motion.div
                            key="info"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-8"
                        >
                            {/* Hero */}
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 p-6">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

                                <div className="relative z-10 text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", duration: 0.8 }}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/20 mb-4"
                                    >
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-bold text-white">PRÓTESIS COGNITIVA DEL SIGLO XXI</span>
                                    </motion.div>

                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-4xl font-extrabold mb-4 leading-tight"
                                    >
                                        Recupera tu{' '}
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                                            mente
                                        </span>
                                    </motion.h1>

                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-slate-400 mb-6 leading-relaxed"
                                    >
                                        No es falta de voluntad. Es una guerra asimétrica. Las apps están diseñadas por cientos de ingenieros para capturar tu atención.
                                        <br /><br />
                                        <span className="text-white font-bold">AlterFocus es tu escudo.</span>
                                    </motion.p>

                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onEnterApp}
                                        className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-2"
                                    >
                                        <Zap size={20} />
                                        Activar Protocolo
                                    </motion.button>
                                </div>
                            </div>

                            {/* Impact Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 rounded-2xl p-5 text-center"
                                >
                                    <div className="text-4xl font-bold text-red-400 mb-1">
                                        <AnimatedCounter value={8} suffix="s" />
                                    </div>
                                    <p className="text-xs text-slate-400">Atención promedio hoy</p>
                                    <p className="text-[10px] text-red-400/60 mt-1">vs 12s en año 2000</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 rounded-2xl p-5 text-center"
                                >
                                    <div className="text-4xl font-bold text-cyan-400 mb-1">
                                        <AnimatedCounter value={4} suffix="h" />
                                    </div>
                                    <p className="text-xs text-slate-400">En redes sociales/día</p>
                                    <p className="text-[10px] text-cyan-400/60 mt-1">≈ 1,460 horas/año</p>
                                </motion.div>
                            </div>

                            {/* Problem Statement */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
                                    <Activity size={20} className="text-red-400" />
                                    El Problema
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        "Las apps están diseñadas para ser adictivas",
                                        "Tu cerebro no evolucionó para resistir scroll infinito",
                                        "La fuerza de voluntad sola no funciona",
                                        "Bloquear completamente genera ansiedad y rebote"
                                    ].map((item, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-start gap-3 text-sm text-slate-300"
                                        >
                                            <X size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* Solution */}
                            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-6">
                                <h3 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
                                    <Shield size={20} className="text-cyan-400" />
                                    La Solución: AlterFocus
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        "NO bloquea, NEGOCIA contigo",
                                        "IA que detecta el momento exacto del impulso",
                                        "Convierte tus mejores decisiones conscientes en buenos hábitos inconscientes",
                                        "Sistema de recompensas que te motiva",
                                        "Comunidad de apoyo para accountability"
                                    ].map((item, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-start gap-3 text-sm text-slate-300"
                                        >
                                            <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* Features */}
                            <div>
                                <h3 className="font-bold text-xl text-white mb-4">Características Clave</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <FeatureCard
                                        icon={Brain}
                                        title="IA Contextual"
                                        description="Detecta tu estado emocional y adapta la intervención. No es un simple bloqueador."
                                        color="bg-gradient-to-br from-purple-500 to-pink-500"
                                        delay={0}
                                    />
                                    <FeatureCard
                                        icon={Smartphone}
                                        title="Flip Phone Mode"
                                        description="Transforma tu teléfono en un dispositivo minimalista. Escala de grises, apps esenciales."
                                        color="bg-gradient-to-br from-slate-600 to-slate-800"
                                        delay={0.1}
                                    />
                                    <FeatureCard
                                        icon={Users}
                                        title="Salas de Deep Work"
                                        description="Trabaja junto a otros en tiempo real. La presión social positiva multiplica tu enfoque."
                                        color="bg-gradient-to-br from-amber-500 to-orange-600"
                                        delay={0.2}
                                    />
                                    <FeatureCard
                                        icon={Award}
                                        title="Sistema de Progresión"
                                        description="Gana puntos, sube de nivel, desbloquea características. Gamificación para el bien."
                                        color="bg-gradient-to-br from-cyan-500 to-blue-600"
                                        delay={0.3}
                                    />
                                </div>
                            </div>

                            {/* Testimonials */}
                            <div>
                                <h3 className="font-bold text-xl text-white mb-4">Lo que dicen los usuarios</h3>
                                <div className="space-y-3">
                                    <Testimonial
                                        quote="Antes perdía 3 horas diarias en TikTok. Con AlterFocus recuperé mi tiempo y mi paz mental."
                                        name="María García"
                                        role="Estudiante de Medicina"
                                        delay={0}
                                    />
                                    <Testimonial
                                        quote="Lo diferente es que no te hace sentir culpable. Te ayuda a tomar mejores decisiones."
                                        name="Carlos Rodríguez"
                                        role="Desarrollador de Software"
                                        delay={0.1}
                                    />
                                    <Testimonial
                                        quote="El Flip Phone Mode me cambió la vida. Mi ansiedad bajó significativamente."
                                        name="Ana Martínez"
                                        role="Diseñadora UX"
                                        delay={0.2}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'demo' && (
                        <motion.div
                            key="demo"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-bold text-center mb-2">Demo Interactiva</h2>
                            <p className="text-slate-400 text-center text-sm mb-6">
                                Mira cómo AlterFocus te protege en tiempo real
                            </p>

                            {/* Phone Mockup */}
                            <div className="relative mx-auto w-64 h-[500px]">
                                {/* Phone frame */}
                                <div className="absolute inset-0 bg-slate-900 rounded-[40px] border-4 border-slate-700 shadow-2xl overflow-hidden">
                                    {/* Screen content */}
                                    <div className="absolute inset-3 bg-black rounded-[30px] overflow-hidden flex flex-col">
                                        {/* Status bar */}
                                        <div className="flex justify-between items-center px-4 py-2 bg-black/50">
                                            <span className="text-[10px] text-white">9:41</span>
                                            <div className="flex gap-1">
                                                <div className="w-4 h-2 bg-white/40 rounded-sm" />
                                            </div>
                                        </div>

                                        {/* Demo content */}
                                        <div className="flex-1 flex items-center justify-center p-6">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={demoStep}
                                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                                    transition={{ duration: 0.4 }}
                                                    className="text-center"
                                                >
                                                    <motion.div
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ duration: 1, repeat: Infinity }}
                                                        className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${demoStep === 0 ? 'from-red-500 to-pink-600' :
                                                            demoStep === 1 ? 'from-cyan-500 to-blue-600' :
                                                                demoStep === 2 ? 'from-amber-500 to-orange-600' :
                                                                    demoStep === 3 ? 'from-green-500 to-emerald-600' :
                                                                        'from-purple-500 to-pink-600'
                                                            } flex items-center justify-center shadow-lg`}
                                                    >
                                                        {React.createElement(demoSteps[demoStep].icon, {
                                                            size: 28,
                                                            className: "text-white"
                                                        })}
                                                    </motion.div>
                                                    <p className="text-white font-bold text-lg">
                                                        {demoSteps[demoStep].title}
                                                    </p>
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>

                                        {/* Progress dots */}
                                        <div className="flex justify-center gap-2 pb-6">
                                            {demoSteps.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full transition-all ${i === demoStep ? 'bg-cyan-400 w-6' : 'bg-slate-700'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Notch */}
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full" />
                            </div>

                            {/* Demo explanation */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-6">
                                <h3 className="font-bold text-white mb-3">¿Cómo funciona?</h3>
                                <ol className="space-y-3">
                                    {demoSteps.map((step, i) => (
                                        <li
                                            key={i}
                                            className={`flex items-center gap-3 text-sm transition-all ${i === demoStep ? 'text-white' : 'text-slate-500'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === demoStep
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-slate-800 text-slate-500'
                                                }`}>
                                                {i + 1}
                                            </div>
                                            {step.title}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onEnterApp}
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold shadow-lg"
                            >
                                Probar Ahora
                            </motion.button>
                        </motion.div>
                    )}

                    {activeTab === 'pitch' && (
                        <motion.div
                            key="pitch"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-bold mb-2">Pitch Deck</h2>
                            <p className="text-slate-400 text-sm mb-4">Presentación ejecutiva de 3 minutos</p>

                            {/* Pitch Section 1 */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="relative bg-gradient-to-br from-red-500/10 to-red-500/5 border-l-4 border-red-500 rounded-2xl p-5 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock size={16} className="text-red-400" />
                                        <span className="text-red-400 text-xs font-bold">0:00 - 0:45 | EL PROBLEMA</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">La Crisis Invisible</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                        "En el año 2000, la capacidad de atención promedio era de 12 segundos. Hoy es de 8. Menos que un pez dorado."
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-black/30 rounded-lg p-3 text-center">
                                            <div className="text-2xl font-bold text-red-400">-33%</div>
                                            <div className="text-[10px] text-slate-500">Atención</div>
                                        </div>
                                        <div className="bg-black/30 rounded-lg p-3 text-center">
                                            <div className="text-2xl font-bold text-red-400">4h/día</div>
                                            <div className="text-[10px] text-slate-500">En RRSS</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Pitch Section 2 */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="relative bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-l-4 border-cyan-500 rounded-2xl p-5 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock size={16} className="text-cyan-400" />
                                        <span className="text-cyan-400 text-xs font-bold">0:45 - 1:30 | LA SOLUCIÓN</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">AlterFocus: No bloquea, negocia</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                        IA contextual que interviene en el momento exacto del impulso. No prohíbe, pregunta: "¿Es esto lo que quieres hacer ahora?"
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center gap-1 bg-cyan-500/20 px-3 py-1.5 rounded-full text-[10px] text-cyan-400 font-bold">
                                            <Brain size={12} /> IA Contextual
                                        </div>
                                        <div className="flex items-center gap-1 bg-cyan-500/20 px-3 py-1.5 rounded-full text-[10px] text-cyan-400 font-bold">
                                            <Heart size={12} /> Empático
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Pitch Section 3 */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="relative bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-l-4 border-purple-500 rounded-2xl p-5 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock size={16} className="text-purple-400" />
                                        <span className="text-purple-400 text-xs font-bold">1:30 - 2:15 | LA MAGIA</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">Multimodalidad + Comunidad</h3>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="bg-black/30 rounded-xl p-3 text-center">
                                            <div className="text-2xl mb-1">💻</div>
                                            <div className="text-[10px] font-bold text-white">Digital</div>
                                            <div className="text-[8px] text-slate-500">Pomodoro</div>
                                        </div>
                                        <div className="bg-black/30 rounded-xl p-3 text-center">
                                            <div className="text-2xl mb-1">📵</div>
                                            <div className="text-[10px] font-bold text-white">Offline</div>
                                            <div className="text-[8px] text-slate-500">Desconexión</div>
                                        </div>
                                        <div className="bg-black/30 rounded-xl p-3 text-center">
                                            <div className="text-2xl mb-1">👥</div>
                                            <div className="text-[10px] font-bold text-white">Comunidad</div>
                                            <div className="text-[8px] text-slate-500">Deep Work</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Pitch Section 4 */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="relative bg-gradient-to-br from-green-500/10 to-green-500/5 border-l-4 border-green-500 rounded-2xl p-5 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock size={16} className="text-green-400" />
                                        <span className="text-green-400 text-xs font-bold">2:15 - 3:00 | VISIÓN</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">Decisiones → Hábitos</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                        "Convierte tus <strong className="text-green-400">mejores decisiones conscientes</strong> en <strong className="text-green-400">buenos hábitos inconscientes</strong>."
                                    </p>
                                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 text-center">
                                        <div className="text-4xl font-bold text-green-400 mb-1">∞</div>
                                        <div className="text-sm text-white font-bold">Prótesis Cognitiva</div>
                                        <div className="text-xs text-slate-400">para el Siglo XXI</div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* CTA Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onEnterApp}
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
                            >
                                <Sparkles size={20} />
                                Probar AlterFocus
                            </motion.button>
                        </motion.div>
                    )}

                    {activeTab === 'tech' && (
                        <motion.div
                            key="tech"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-4"
                        >
                            <h2 className="text-2xl font-bold mb-4">Stack Tecnológico</h2>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                    <span className="text-cyan-400">⚛️</span> Frontend
                                </h3>
                                <ul className="space-y-2 text-sm text-slate-300">
                                    {['React 18 + TypeScript', 'Framer Motion (Animaciones)', 'Recharts (Visualización)', 'Tailwind CSS', 'Vite (Build tool)'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                    <span className="text-purple-400">🤖</span> IA & Backend
                                </h3>
                                <ul className="space-y-2 text-sm text-slate-300">
                                    {['Google Gemini AI', 'Web Speech API', 'LocalStorage (Offline-first)', 'Chrome Extension API', 'WebNavigation API'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-5">
                                <h3 className="text-lg font-bold mb-4">Arquitectura del Sistema</h3>
                                <div className="space-y-3 text-sm text-slate-300">
                                    {[
                                        { num: 1, color: 'blue', title: 'Extensión de Navegador', desc: 'Monitorea en tiempo real' },
                                        { num: 2, color: 'purple', title: 'WebApp Principal', desc: 'Hub central de productividad' },
                                        { num: 3, color: 'cyan', title: 'Motor de IA', desc: 'Decisiones contextuales' },
                                        { num: 4, color: 'amber', title: 'Sistema de Comunidad', desc: 'Salas sincronizadas' }
                                    ].map(item => (
                                        <div key={item.num} className="flex items-start gap-3">
                                            <div className={`w-6 h-6 bg-${item.color}-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-${item.color}-400`}>
                                                {item.num}
                                            </div>
                                            <div>
                                                <strong className="text-white">{item.title}:</strong> {item.desc}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Open Source Badge */}
                            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
                                <Globe size={24} className="text-green-400 mx-auto mb-2" />
                                <p className="text-white font-bold">Privacy First</p>
                                <p className="text-xs text-slate-400">Todos los datos se procesan localmente</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black to-transparent p-4 pt-8">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onEnterApp}
                    className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold shadow-[0_0_40px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
                >
                    <Sparkles size={20} />
                    ¿Listo para recuperar el control?
                    <ArrowRight size={20} />
                </motion.button>
                <div className="flex items-center justify-center gap-4 text-slate-500 text-xs mt-3">
                    <span className="flex items-center gap-1">
                        <Lock size={12} />
                        Privacy First
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <Star size={12} />
                        Open Beta
                    </span>
                    <span>•</span>
                    <span>100% Gratis</span>
                </div>
            </div>
        </div>
    );
}
