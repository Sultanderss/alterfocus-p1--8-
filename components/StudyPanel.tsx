import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Monitor, FileText, Cpu, ArrowLeft, BookOpen, X, ExternalLink, Send, Sparkles, Loader2, Users, Wind, HeartHandshake, CheckSquare, Clock, MoreHorizontal, ChevronRight, Calendar, Video, MessageSquare, Bell } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppView } from '../types';

interface StudyPanelProps {
    selectedDuration: number;
    onBack: () => void;
    onStartOffline: () => void;
    onResourceSelect: (resource: string) => void;
    onNavigate: (view: AppView) => void;
}

// --- HELPER COMPONENTS MOVED TO TOP ---

const DockItem = ({ icon, label, onClick, color }: any) => (
    <button onClick={onClick} className="group flex flex-col items-center gap-1 transition-transform active:scale-90 hover:-translate-y-1 duration-200">
        <div className={`transition-colors ${color} opacity-80 group-hover:opacity-100`}>
            {icon}
        </div>
        <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600">{label}</span>
    </button>
);

const UserIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const AIChatInterface = () => {
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
        { role: 'model', text: 'Hola 👋 Soy tu tutor académico. ¿Qué tema te está costando entender hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const text = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text }]);
        setLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
                config: { systemInstruction: "Eres un tutor socrático breve y amable." }
            });
            const res = await chat.sendMessage({ message: text });
            setMessages(prev => [...prev, { role: 'model', text: res.text || "" }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', text: "Error de conexión." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${m.role === 'model' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {m.role === 'model' ? <Sparkles size={14} /> : <UserIcon />}
                        </div>
                        <div className={`p-3.5 rounded-2xl text-sm max-w-[80%] shadow-sm leading-relaxed ${m.role === 'model' ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' : 'bg-emerald-600 text-white rounded-tr-none'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600"><Sparkles size={14} /></div>
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 size={14} className="animate-spin" /> Pensando...
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center pb-8">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe tu duda..."
                    className="flex-1 bg-slate-100 rounded-full px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button onClick={handleSend} disabled={!input.trim() || loading} className="p-3.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-200">
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

const MockResourceContent = ({ id }: { id: string }) => {
    if (id === 'notion') return (
        <div className="p-6">
            <div className="flex items-center gap-2 mb-6 text-slate-400 text-xs uppercase font-bold tracking-wider">
                <CheckSquare size={14} /> Lista de Tareas
            </div>
            <div className="space-y-4">
                <div className="flex items-start gap-3 group">
                    <div className="mt-0.5 w-5 h-5 border-2 border-slate-300 rounded flex items-center justify-center text-white group-hover:border-slate-400 transition-colors cursor-pointer"></div>
                    <div>
                        <p className="text-slate-700 font-medium text-sm">Introducción a Derivadas</p>
                        <p className="text-slate-400 text-xs">Páginas 40-55</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 group">
                    <div className="mt-0.5 w-5 h-5 border-2 border-slate-300 rounded flex items-center justify-center text-white group-hover:border-slate-400 transition-colors cursor-pointer"></div>
                    <div>
                        <p className="text-slate-700 font-medium text-sm">Resumen Capítulo 4</p>
                        <p className="text-slate-400 text-xs">Esquema visual</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 opacity-50">
                    <div className="mt-0.5 w-5 h-5 bg-slate-300 rounded flex items-center justify-center text-white"><CheckSquare size={12} /></div>
                    <div>
                        <p className="text-slate-700 font-medium text-sm line-through">Revisar Syllabus</p>
                    </div>
                </div>
            </div>

            <button className="mt-8 w-full py-3 border border-dashed border-slate-300 rounded-xl text-slate-400 text-sm font-medium hover:border-slate-400 hover:text-slate-600 transition-colors">
                + Nueva Tarea
            </button>
        </div>
    );

    if (id === 'calendar') return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 pb-24">
                <div className="flex items-center gap-2 mb-6 text-slate-400 text-xs uppercase font-bold tracking-wider">
                    <Calendar size={14} /> Hoy, {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                </div>

                <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
                    <div className="relative">
                        <div className="absolute -left-[29px] top-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-blue-900 text-sm">Entrega Proyecto Final</span>
                                <span className="bg-blue-200 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold">14:00</span>
                            </div>
                            <p className="text-xs text-blue-700/70">Subir a plataforma Moodle</p>
                        </div>
                    </div>

                    <div className="relative opacity-60">
                        <div className="absolute -left-[29px] top-0 w-3 h-3 bg-slate-300 rounded-full border-2 border-white"></div>
                        <div className="bg-white border border-slate-200 p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-slate-700 text-sm">Grupo de Estudio</span>
                                <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold">16:30</span>
                            </div>
                            <p className="text-xs text-slate-500">Biblioteca Sala 2</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (id === 'teams') return (
        <div className="flex flex-col h-full">
            <div className="p-4">
                <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs uppercase font-bold tracking-wider">
                    <MessageSquare size={14} /> Chats Recientes
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">JP</div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <span className="font-bold text-slate-700 text-sm">Prof. Juan Perez</span>
                                <span className="text-[10px] text-slate-400">12:30</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">No olviden el formato APA...</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm opacity-80">
                        <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs">G1</div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <span className="font-bold text-slate-700 text-sm">Grupo 1</span>
                                <span className="text-[10px] text-slate-400">Ayer</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">Ana: ¿Quién trae la compu?</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Monitor size={48} className="mb-4 opacity-20" />
            <p className="text-sm">Cargando recurso...</p>
        </div>
    );
};

const ResourceOverlay = ({ resourceId, onClose }: any) => {
    const configMap: any = {
        'ia': { name: 'Tutor IA', icon: <Sparkles size={18} />, color: 'text-emerald-600' },
        'calendar': { name: 'Google Calendar', icon: <Calendar size={18} />, color: 'text-blue-600' },
        'notion': { name: 'Notion', icon: <FileText size={18} />, color: 'text-slate-600' },
        'teams': { name: 'Microsoft Teams', icon: <Users size={18} />, color: 'text-indigo-600' }
    };
    const config = configMap[resourceId];

    return (
        <motion.div
            initial={{ y: '100%', scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-white z-50 flex flex-col"
        >
            {/* App Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-sm sticky top-0 z-10">
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ChevronRight size={24} className="rotate-90" />
                </button>
                <div className="flex items-center gap-2">
                    <span className={`${config.color}`}>{config.icon}</span>
                    <span className="font-bold text-slate-800">{config.name}</span>
                </div>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-400">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* App Content */}
            <div className="flex-1 overflow-hidden relative bg-slate-50">
                {resourceId === 'ia' ? (
                    <AIChatInterface />
                ) : (
                    <MockResourceContent id={resourceId} />
                )}
            </div>
        </motion.div>
    );
};


const StudyPanel: React.FC<StudyPanelProps> = ({ selectedDuration, onBack, onStartOffline, onNavigate }) => {
    const [activeResource, setActiveResource] = useState<string | null>(null);

    // --- WIDGET CONTENT DEFINITIONS ---

    const renderAIWidget = () => (
        <div className="relative h-full flex flex-col justify-between z-10">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white">
                    <Sparkles size={20} />
                </div>
                <span className="bg-emerald-500/20 text-emerald-100 text-[10px] px-2 py-1 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> EN LÍNEA
                </span>
            </div>
            <div>
                <h3 className="text-white font-bold text-lg leading-tight mb-1">Tutor IA</h3>
                <p className="text-emerald-100 text-xs">"¿Te ayudo a resumir el tema o resolver dudas?"</p>
            </div>
        </div>
    );

    const renderCalendarWidget = () => (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3 text-blue-600">
                <Calendar size={18} />
                <span className="font-bold text-sm">Agenda</span>
            </div>
            <div className="flex-1 space-y-2 relative">
                {/* Timeline line */}
                <div className="absolute left-[5px] top-1 bottom-1 w-0.5 bg-blue-100"></div>

                <div className="relative pl-4 flex flex-col gap-0.5">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white absolute left-0 top-1"></div>
                    <span className="text-[10px] font-bold text-blue-600">14:00 (En 15m)</span>
                    <span className="text-xs font-bold text-slate-700 leading-tight">Entrega Proyecto</span>
                </div>
                <div className="relative pl-4 flex flex-col gap-0.5 opacity-60">
                    <div className="w-2.5 h-2.5 bg-slate-300 rounded-full border-2 border-white absolute left-0 top-1"></div>
                    <span className="text-[10px] font-bold text-slate-400">16:30</span>
                    <span className="text-xs font-medium text-slate-600 leading-tight">Grupo Estudio</span>
                </div>
            </div>
        </div>
    );

    const renderNotionWidget = () => (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3 text-slate-700">
                <FileText size={18} />
                <span className="font-bold text-sm">Notas</span>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2 opacity-50">
                    <div className="w-4 h-4 border-2 border-slate-300 rounded flex items-center justify-center bg-slate-100"><CheckSquare size={10} className="text-slate-400" /></div>
                    <span className="text-xs text-slate-500 line-through decoration-slate-400">Leer Intro</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400 rounded"></div>
                    <span className="text-xs font-bold text-slate-700">Resumir Cap. 4</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400 rounded"></div>
                    <span className="text-xs font-bold text-slate-700">Ejercicios</span>
                </div>
            </div>
        </div>
    );

    const renderTeamsWidget = () => (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 text-indigo-600">
                <div className="flex items-center gap-2">
                    <Users size={18} />
                    <span className="font-bold text-sm">Teams</span>
                </div>
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
            </div>
            <div className="space-y-2">
                <div className="bg-white border border-indigo-100 p-2 rounded-lg shadow-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">JP</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-700 truncate">Prof. Juan</p>
                        <p className="text-[9px] text-slate-500 truncate">Suban el PDF...</p>
                    </div>
                </div>
                <div className="bg-white border border-indigo-100 p-2 rounded-lg shadow-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-[10px] font-bold">G1</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-700 truncate">Grupo 1</p>
                        <p className="text-[9px] text-slate-500 truncate">¿Reunión hoy?</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <motion.div
            className="absolute inset-0 bg-slate-50/50 z-20 flex flex-col overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
        >
            {/* Header Minimalista */}
            <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-100">
                <div>
                    <button onClick={onBack} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft size={18} /> <span className="text-sm font-bold">Salir</span>
                    </button>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                    <Clock size={14} className="text-slate-500" />
                    <span className="text-xs font-mono font-bold text-slate-700">{selectedDuration}:00</span>
                </div>
            </div>

            {/* Workspace Grid (Bento) */}
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32">
                <h1 className="text-2xl font-bold text-slate-800 mb-1">Tu Workspace</h1>
                <p className="text-sm text-slate-500 mb-6">Todo lo que necesitas para enfocarte hoy.</p>

                <div className="grid grid-cols-2 gap-4">

                    {/* Widget 1: AI Tutor (Full Width) */}
                    <motion.button
                        onClick={() => setActiveResource('ia')}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="col-span-2 h-36 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 shadow-lg shadow-emerald-500/20 text-left relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all"></div>
                        {renderAIWidget()}
                    </motion.button>

                    {/* Widget 2: Calendar */}
                    <motion.button
                        onClick={() => setActiveResource('calendar')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="col-span-1 h-40 rounded-3xl bg-blue-50 p-4 text-left border border-blue-100 hover:shadow-md hover:border-blue-200 transition-all"
                    >
                        {renderCalendarWidget()}
                    </motion.button>

                    {/* Widget 3: Teams */}
                    <motion.button
                        onClick={() => setActiveResource('teams')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="col-span-1 h-40 rounded-3xl bg-indigo-50 p-4 text-left border border-indigo-100 hover:shadow-md hover:border-indigo-200 transition-all"
                    >
                        {renderTeamsWidget()}
                    </motion.button>

                    {/* Widget 4: Notion (Full Width or Half) */}
                    <motion.button
                        onClick={() => setActiveResource('notion')}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="col-span-2 h-32 rounded-3xl bg-white p-5 text-left border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                    >
                        {renderNotionWidget()}
                    </motion.button>

                    {/* OFFLINE MODE SWITCH */}
                    <div className="col-span-2 mt-4">
                        <div className="flex items-center gap-3 mb-2 px-1">
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zona de Enfoque Profundo</span>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>
                        <button
                            onClick={onStartOffline}
                            className="w-full bg-slate-800 rounded-3xl p-1 shadow-xl shadow-slate-400/20 group active:scale-99 transition-transform"
                        >
                            <div className="bg-slate-900 rounded-[20px] p-5 border border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 group-hover:bg-white/20 transition-all">
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-base text-white">Modo Offline</div>
                                        <div className="text-xs text-slate-400">Bloqueo digital • Lectura física</div>
                                    </div>
                                </div>
                                <div className="bg-slate-800 p-2 rounded-full border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                                    <ChevronRight size={20} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Dock */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-[280px]">
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 px-6 py-4 rounded-2xl shadow-2xl shadow-slate-500/20 flex items-center justify-between">
                    <DockItem icon={<Users size={22} />} label="Salas" onClick={() => onNavigate(AppView.COMMUNITY)} color="text-indigo-500" />
                    <div className="w-px h-8 bg-slate-200/50"></div>
                    <DockItem icon={<Wind size={22} />} label="Respirar" onClick={() => onNavigate(AppView.BREATHING)} color="text-sky-500" />
                    <div className="w-px h-8 bg-slate-200/50"></div>
                    <DockItem icon={<HeartHandshake size={22} />} label="Ayuda" onClick={() => onNavigate(AppView.CRISIS)} color="text-rose-500" />
                </div>
            </div>

            {/* Resource Overlay (App Opening Effect) */}
            <AnimatePresence>
                {activeResource && (
                    <ResourceOverlay
                        resourceId={activeResource}
                        onClose={() => setActiveResource(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StudyPanel;