import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Zap, Shield, Activity, Users, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Datos simulados para el gráfico de atención
const attentionData = [
    { year: '2000', seconds: 12 },
    { year: '2005', seconds: 10 },
    { year: '2010', seconds: 9 },
    { year: '2015', seconds: 8.25 },
    { year: '2020', seconds: 8 },
    { year: '2025', seconds: 7.5 },
];

const productivityData = [
    { time: '09:00', focus: 30 },
    { time: '10:00', focus: 45 },
    { time: '11:00', focus: 85 }, // Pico con AlterFocus
    { time: '12:00', focus: 70 },
    { time: '13:00', focus: 40 },
];

interface LandingPageProps {
    onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-cyan-500/30">

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        <Brain size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">AlterFocus</span>
                </div>
                <button
                    onClick={onEnterApp}
                    className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all hover:scale-105"
                >
                    Acceso Beta
                </button>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20">
                {/* Background Gradients */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center z-10 max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">Tecnología de Soberanía Cognitiva</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
                        Recupera tu mente en la <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                            Era de la Distracción
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        No es falta de voluntad, es una guerra asimétrica. AlterFocus es tu prótesis cognitiva para navegar un mundo diseñado para robar tu atención.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onEnterApp}
                            className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all hover:scale-105"
                        >
                            Iniciar Protocolo
                            <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </button>
                        <button className="px-8 py-4 bg-transparent border border-white/20 hover:bg-white/5 rounded-full font-medium text-lg transition-all">
                            Ver el Pitch (3 min)
                        </button>
                    </div>
                </motion.div>

                {/* Floating UI Elements (Decorativos) */}
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-32 right-[10%] hidden lg:block p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl w-64"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400"><Shield size={16} /></div>
                        <div>
                            <div className="text-xs text-slate-400">Amenaza Detectada</div>
                            <div className="text-sm font-bold">Patrón de Scroll Infinito</div>
                        </div>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[80%] bg-red-500"></div>
                    </div>
                </motion.div>
            </section>

            {/* --- DATA SECTION --- */}
            <section className="py-24 px-6 bg-black/50 relative">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">La Crisis Invisible</h2>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                            En el año 2000, nuestra capacidad de atención era de 12 segundos. Hoy es de 8.
                            Estamos perdiendo la capacidad de profundizar.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-4xl font-bold text-red-400 mb-1">-33%</div>
                                <div className="text-sm text-slate-400">Capacidad de Atención</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-4xl font-bold text-cyan-400 mb-1">4h+</div>
                                <div className="text-sm text-slate-400">Promedio en RRSS/día</div>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full bg-white/5 rounded-3xl border border-white/10 p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none"></div>
                        <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Declive de Atención (Segundos)</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attentionData}>
                                <defs>
                                    <linearGradient id="colorSeconds" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="year" stroke="#666" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="seconds" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSeconds)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* --- SOLUTION CARDS --- */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Un Sistema Operativo para tu Enfoque</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            AlterFocus no bloquea; negocia. Utiliza un enfoque multimodal para restaurar tu autonomía.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 mb-6">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Intervención Contextual</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                IA que detecta patrones de distracción y te ofrece alternativas saludables en tiempo real, antes de que caigas en el "scroll hole".
                            </p>
                        </motion.div>

                        {/* Card 2 */}
                        <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6">
                                <Activity size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Modo Offline Real</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Sincronización con tu entorno físico. La app te guía para desconectar dispositivos y trabajar con papel y lápiz cuando es necesario.
                            </p>
                        </motion.div>

                        {/* Card 3 */}
                        <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 mb-6">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Comunidad Sincronizada</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Salas de "Deep Work" donde la presencia de otros usuarios enfocados crea una presión social positiva para mantenerte en la zona.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER CTA --- */}
            <section className="py-20 px-6 border-t border-white/10 bg-gradient-to-b from-black to-slate-900">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-8">¿Listo para recuperar el control?</h2>
                    <button
                        onClick={onEnterApp}
                        className="px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full text-lg shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105"
                    >
                        Entrar a AlterFocus
                    </button>
                    <div className="mt-8 flex items-center justify-center gap-6 text-slate-500 text-sm">
                        <span className="flex items-center gap-2"><Globe size={14} /> Global Access</span>
                        <span className="flex items-center gap-2"><Shield size={14} /> Privacy First</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
