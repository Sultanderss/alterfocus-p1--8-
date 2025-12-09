import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Bot, Mic, MicOff, Calendar, Mail, Database, CheckCircle2, Cpu, Sparkles, Layout, BookOpen, Users, Wind, Maximize2, X, WifiOff, HeartHandshake, Activity, Video, RotateCcw } from 'lucide-react';
import { AppView, UserState, FocusConfig } from '../types';
import { GoogleGenAI } from "@google/genai";
import { useVoiceAI } from '../hooks/useVoiceAI';

interface AIGuideProps {
    user: UserState;
    initialContext?: { type: 'kickstart' | 'motivation' | 'analysis' | null, goal: string } | null;
    onBack: () => void;
    onStartSession: (config: FocusConfig) => void;
    onNavigate: (view: AppView) => void;
    onUpdateUser: (updates: Partial<UserState>) => void;
}

interface Message {
    id: string;
    sender: 'bot' | 'user';
    text: string;
    options?: { label: string; action: () => void; primary?: boolean }[];
    contentType?: 'text' | 'setup_distractions' | 'setup_hours' | 'setup_integrations' | 'tour_digital' | 'tour_offline' | 'tour_community' | 'tour_wellness';
    mode?: 'fast' | 'thinking';
}

type SetupPhase = 'idle' | 'distractions' | 'hours' | 'integrations' | 'open_expression' | 'tour' | 'goal_setting' | 'completed';

// --- MOCK AI SERVICE ---
const mockGenerateContent = async (prompt: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    const lower = prompt.toLowerCase();

    if (lower.includes('welcome') || lower.includes('bienvenido')) return "¡Hola! Soy tu copiloto de enfoque. ¿Listo para dominar tu tiempo?";
    if (lower.includes('plan') || lower.includes('obstáculo')) return "Divide y vencerás. Empieza por la tarea más pequeña durante 5 minutos.";
    if (lower.includes('start') || lower.includes('empezar')) return "La regla de los 2 minutos: si te lleva menos de 2 minutos, hazlo ya. Si no, planifícalo.";
    if (lower.includes('motivation') || lower.includes('ánimo')) return "El dolor de la disciplina pesa onzas, el del arrepentimiento pesa toneladas. ¡Tú puedes!";

    return "Entendido. Te sugiero usar una sesión de enfoque de 25 minutos para avanzar.";
};

// --- SUBCOMPONENTS ---

const TourDigitalDemo = () => {
    const [step, setStep] = useState(0);
    useEffect(() => {
        const t1 = setTimeout(() => setStep(1), 1000); // Highlight
        const t2 = setTimeout(() => setStep(2), 2000); // Expand
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    return (
        <div className="mt-3 bg-white/5 p-3 rounded-xl border border-white/10 relative overflow-hidden min-h-[140px] flex flex-col gap-2">
            {/* Mock Bento Grid */}
            <div className="grid grid-cols-2 gap-2 flex-1">
                <div className={`bg-white/10 rounded-lg p-2 transition-all duration-500 ${step >= 1 ? 'ring-2 ring-brand-secondary scale-105' : ''} ${step === 2 ? 'col-span-2 row-span-2 h-full z-10' : ''}`}>
                    <div className="flex items-center gap-1 mb-1">
                        <Database size={10} className="text-indigo-400" />
                        <div className="h-1 w-10 bg-white/20 rounded"></div>
                    </div>
                    <div className="space-y-1">
                        <div className="h-1 w-full bg-white/10 rounded"></div>
                        <div className="h-1 w-2/3 bg-white/10 rounded"></div>
                    </div>
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 p-2 bg-indigo-500/20 rounded text-[9px] text-indigo-200">
                            Resumen Cap. 4 <br /> <span className="font-bold">Cargado desde Notion</span>
                        </motion.div>
                    )}
                </div>
                {step !== 2 && (
                    <>
                        <div className="bg-white/10 rounded-lg p-2 opacity-50"><Cpu size={10} className="text-emerald-400" /></div>
                        <div className="bg-white/10 rounded-lg p-2 opacity-50"><Calendar size={10} className="text-blue-400" /></div>
                        <div className="bg-white/10 rounded-lg p-2 opacity-50"><Video size={10} className="text-purple-400" /></div>
                    </>
                )}
            </div>
        </div>
    );
};

const TourOfflineDemo = () => {
    const [checks, setChecks] = useState([false, false, false]);

    useEffect(() => {
        const timeouts = [
            setTimeout(() => setChecks([true, false, false]), 500),
            setTimeout(() => setChecks([true, true, false]), 1500),
            setTimeout(() => setChecks([true, true, true]), 2500),
        ];
        return () => timeouts.forEach(clearTimeout);
    }, []);

    const allChecked = checks[2];

    return (
        <div className="mt-3 bg-white/5 p-3 rounded-xl border border-white/10 min-h-[120px] relative">
            <div className="space-y-2 opacity-80">
                {['Libro', 'Cuaderno', 'Agua'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/10 p-1.5 rounded border border-white/5">
                        <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${checks[i] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}`}>
                            {checks[i] && <CheckCircle2 size={8} className="text-white" />}
                        </div>
                        <div className={`h-1 w-16 rounded ${checks[i] ? 'bg-emerald-500/50' : 'bg-white/10'}`}></div>
                    </div>
                ))}
            </div>
            <AnimatePresence>
                {allChecked && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm flex flex-col items-center justify-center text-white rounded-xl"
                    >
                        <WifiOff size={32} />
                        <span className="text-xs font-bold mt-1">OFFLINE</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TourCommunityDemo = () => {
    const [avatars, setAvatars] = useState<number[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setAvatars(prev => {
                if (prev.length >= 5) return prev;
                return [...prev, prev.length];
            });
        }, 600);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-3 bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 min-h-[120px] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold text-indigo-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> EN VIVO
            </div>
            <div className="flex -space-x-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-indigo-900 flex items-center justify-center text-indigo-300 z-0 text-xs">Tú</div>
                {avatars.map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0, x: -20 }}
                        animate={{ scale: 1, x: 0 }}
                        className={`w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] z-${i + 1}`}
                        style={{ backgroundColor: `hsl(${200 + i * 40}, 70%, 60%)` }}
                    >
                        {i + 1}
                    </motion.div>
                ))}
            </div>
            <div className="text-xs font-bold text-indigo-300">{avatars.length + 1} Personas Enfocadas</div>
            <div className="text-[9px] text-indigo-400/70 mt-1">"Sala de Silencio"</div>
        </div>
    );
};

const TourWellnessDemo = () => {
    return (
        <div className="mt-3 bg-slate-900 p-4 rounded-xl border border-slate-800 min-h-[100px] flex items-center justify-around relative overflow-hidden">
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-purple-500/20 blur-xl"
            />

            <div className="z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center border border-sky-500/30">
                    <Wind size={18} />
                </div>
                <span className="text-[9px] text-sky-200">Respirar</span>
            </div>

            <div className="h-8 w-px bg-white/10 z-10"></div>

            <div className="z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center border border-rose-500/30">
                    <HeartHandshake size={18} />
                </div>
                <span className="text-[9px] text-rose-200">Crisis</span>
            </div>
        </div>
    );
};

const MultiSelectApps = ({ options, selected, onChange, onConfirm }: any) => {
    const toggle = (opt: string) => selected.includes(opt) ? onChange(selected.filter((s: string) => s !== opt)) : onChange([...selected, opt]);
    return (
        <div className="space-y-3 w-full min-w-[260px]">
            <div className="grid grid-cols-2 gap-2">
                {options.map((opt: string) => (
                    <button key={opt} onClick={() => toggle(opt)} className={`p-2 text-xs font-bold rounded-xl border text-left transition-all ${selected.includes(opt) ? 'bg-brand-secondary text-white border-brand-secondary' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>{selected.includes(opt) ? '✓ ' : ''}{opt}</button>
                ))}
            </div>
            <button onClick={onConfirm} className="w-full py-3 bg-brand-primary text-white rounded-xl text-xs font-bold mt-2 shadow-lg hover:bg-brand-primary/80 transition-colors">Confirmar</button>
        </div>
    );
};

const MultiSelectIntegrations = ({ selected, onChange, onConfirm }: any) => {
    const integrations = [
        { id: 'Google Calendar', icon: <Calendar size={14} /> },
        { id: 'Outlook', icon: <Mail size={14} /> },
        { id: 'Notion', icon: <Database size={14} /> },
        { id: 'Microsoft Teams', icon: <Users size={14} /> }
    ];
    const toggle = (id: string) => selected.includes(id) ? onChange(selected.filter((s: string) => s !== id)) : onChange([...selected, id]);
    return (
        <div className="space-y-3 w-full min-w-[260px]">
            {integrations.map((item: any) => (
                <button key={item.id} onClick={() => toggle(item.id)} className={`w-full p-3 rounded-xl border flex items-center justify-between ${selected.includes(item.id) ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                    <div className="flex items-center gap-2 text-xs font-bold">{item.icon} {item.id}</div>
                    {selected.includes(item.id) && <CheckCircle2 size={14} className="text-emerald-400" />}
                </button>
            ))}
            <button onClick={onConfirm} className="w-full py-3 bg-brand-primary text-white rounded-xl text-xs font-bold mt-2 shadow-lg hover:bg-brand-primary/80 transition-colors">Finalizar</button>
        </div>
    );
};

const AIGuide: React.FC<AIGuideProps> = ({ user, initialContext, onBack, onStartSession, onNavigate, onUpdateUser }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [inputText, setInputText] = useState("");
    const [setupPhase, setSetupPhase] = useState<SetupPhase>('idle');
    const [isRefiningGoal, setIsRefiningGoal] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isInterruptedRef = useRef(false);
    const hasInitialized = useRef(false);

    // Temporary Setup State
    const [tempDistractions, setTempDistractions] = useState<string[]>([]);
    const [tempHours, setTempHours] = useState<string[]>([]);
    const [tempIntegrations, setTempIntegrations] = useState<string[]>([]);

    // Voice AI Integration
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const voiceAI = useVoiceAI({
        apiKey,
        onTranscript: (text) => {
            console.log('User said:', text);
            addUserMessage(text);
        },
        onAIResponse: (text) => {
            console.log('AI responded:', text);
            addBotMessage(text, 0);
        }
    });

    // --- INITIALIZATION & FLOW CONTROL ---
    useEffect(() => {
        isInterruptedRef.current = false;

        if (hasInitialized.current) return;
        hasInitialized.current = true;

        // CRITICAL CHECK: Returning vs New User
        if (user.hasCompletedAISetup) {
            // RETURNING USER FLOW
            setSetupPhase('completed'); // Ensure input is enabled
            if (initialContext?.type) {
                handleContextTrigger(initialContext.type, initialContext.goal);
            } else {
                startReturningUserFlow(false); // Normal start
            }
        } else {
            // NEW USER FLOW
            startSetupFlow();
        }

        return () => { isInterruptedRef.current = true; };
    }, [initialContext, user.hasCompletedAISetup]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // --- FLOW: NEW USER SETUP ---

    const startSetupFlow = () => {
        // IMPROVED FLOW: Check if we already have data from Onboarding
        if (user.hasOnboarded && (user.distractionApps.length > 0 || user.dailyGoal)) {
            setSetupPhase('completed');
            onUpdateUser({ hasCompletedAISetup: true });

            addBotMessage(`¡Hola ${user.name.split(' ')[0]}! Ya he analizado tu perfil inicial. 🧠`, 500);

            setTimeout(() => {
                const distractions = user.distractionApps.length > 0 ? user.distractionApps.join(', ') : 'Ninguna';
                const goal = user.dailyGoal || 'No definida';

                addBotMessage(`Ya tengo estos datos de ti:
                • Distracciones: ${distractions}
                • Meta actual: "${goal}"
                
                ¿Quieres que usemos esto para empezar?`, 1000, [
                    { label: "✅ Sí, empezar", action: () => runAppTour(), primary: true },
                    {
                        label: "🔄 No, cambiar datos", action: () => {
                            setSetupPhase('distractions');
                            addBotMessage("Entendido. Reconfiguremos tu perfil desde cero. ¿Qué aplicaciones te distraen más?", 500);
                            setTimeout(() => {
                                setMessages(prev => [...prev, {
                                    id: Date.now().toString(),
                                    sender: 'bot',
                                    text: "Selección Múltiple:",
                                    contentType: 'setup_distractions'
                                }]);
                            }, 1000);
                        }
                    }
                ]);
            }, 1000);
            return;
        }

        // DEFAULT FLOW: Fresh Start
        setSetupPhase('distractions');
        addBotMessage(`Bienvenido a AlterFocus. Soy tu asistente personal. 🧠`, 500);
        setTimeout(() => {
            addBotMessage(`Para empezar, necesito calibrar tu perfil. Selecciona las aplicaciones que más te distraen:`, 1500);
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'bot',
                    text: "Selección Múltiple:",
                    contentType: 'setup_distractions'
                }]);
            }, 2000);
        }, 1000);
    };

    const handleDistractionsConfirm = () => {
        // Fix: Prevent double execution or execution during wrong phase
        if (setupPhase !== 'distractions') return;

        console.log("Confirming distractions...", tempDistractions);
        onUpdateUser({ distractionApps: tempDistractions });
        addUserMessage(`Seleccionadas: ${tempDistractions.join(', ') || 'Ninguna'}`);

        // Fix: Use timeout to allow UI updates to settle before unmounting the component
        setTimeout(() => setSetupPhase('hours'), 100);

        addBotMessage("Entendido.", 600);
        setTimeout(() => {
            addBotMessage("¿En qué momento del día sientes que tu fuerza de voluntad es más baja?", 500);
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'bot',
                    text: "Horas críticas:",
                    contentType: 'setup_hours'
                }]);
            }, 1000);
        }, 1600);
    };

    const handleHoursConfirm = () => {
        onUpdateUser({ procrastinationHours: tempHours });
        addUserMessage(`Horario: ${tempHours.join(', ') || 'Sin horario específico'}`);
        setSetupPhase('integrations');

        addBotMessage("Anotado.", 500);
        setTimeout(() => {
            addBotMessage("¿Qué herramientas utilizas? Me conectaré a ellas (vía API) para organizar tu agenda.", 500);
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'bot',
                    text: "Integraciones:",
                    contentType: 'setup_integrations'
                }]);
            }, 1000);
        }, 1500);
    };

    const handleIntegrationsConfirm = () => {
        onUpdateUser({ connectedIntegrations: tempIntegrations });
        addUserMessage(`Conectado con: ${tempIntegrations.join(', ') || 'Ninguna'}`);
        setSetupPhase('open_expression');

        setTimeout(() => {
            addBotMessage("Una última cosa para completar tu perfil...", 500);
            setTimeout(() => {
                addBotMessage("Escribe brevemente: ¿Cuál es tu mayor reto hoy? O si prefieres, dime simplemente cuál es tu meta principal.", 1000);
            }, 1500);
        }, 1000);
    };

    const handleOpenExpressionResponse = async (userText: string) => {
        setSetupPhase('tour'); // Enter Tour Phase
        setIsTyping(true);
        onUpdateUser({ hasCompletedAISetup: true }); // Mark setup as done

        try {
            // TRY REAL AI FIRST
            let responseText = "";
            try {
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (!apiKey) throw new Error("No API Key");

                const ai = new GoogleGenAI({ apiKey });
                const prompt = `
                Context: User just finished onboarding for a focus app called AlterFocus.
                User Name: ${user.name}.
                User Input: "${userText}".
                Task: Write a warm, short (max 20 words) welcome.
            `;
                const result = await ai.models.generateContent({ model: 'gemini-1.5-flash', contents: prompt });
                responseText = result.text || "¡Perfil configurado!";
            } catch (e) {
                // FALLBACK TO MOCK
                responseText = await mockGenerateContent("Welcome");
            }

            setIsTyping(false);
            await addBotMessageAsync(responseText, 0);

            // Start Tour
            runAppTour();

        } catch (error) {
            setIsTyping(false);
            await addBotMessageAsync("¡Perfil guardado!", 0);
            runAppTour();
        }
    };

    // --- FLOW: TOUR (Interactive Demos with Explanations) ---

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const runAppTour = async () => {
        // Intro
        await addBotMessageAsync("Déjame enseñarte rápidamente tus herramientas de trabajo. 🛠️", 1000);

        // 1. Digital Panel
        await addBotMessageAsync("1. Panel Digital 💻", 500);
        await addBotMessageAsync("Tu centro de comando. Aquí verás todas las tareas pendientes sincronizadas desde Google Calendar, Notion y Teams. Todo en un solo lugar para que nunca pierdas el foco.", 0, undefined, 'tour_digital');
        await wait(5000); // Watch demo animation

        // 2. Offline Mode
        await addBotMessageAsync("2. Modo Offline 📵", 500);
        await addBotMessageAsync("Cuando necesites cero distracciones y trabajo profundo real. Apaga tu teléfono, cierra todo, y concéntrate únicamente en lo que tienes delante. Ideal para estudiar de forma tradicional.", 0, undefined, 'tour_offline');
        await wait(4500);

        // 3. Community
        await addBotMessageAsync("3. Comunidad 👥", 500);
        await addBotMessageAsync("Nunca estudies solo. Únete a salas virtuales en vivo para estudiar junto a otras personas. La presión social positiva te mantiene enfocado. Puedes crear salas presenciales también si estudias con amigos.", 0, undefined, 'tour_community');
        await wait(4500);

        // 4. Wellness Mention
        await addBotMessageAsync("4. Bienestar 🧘", 500);
        await addBotMessageAsync("Herramientas para cuando te sientas abrumado: respiración guiada para calmar la ansiedad y soporte en crisis si necesitas ayuda inmediata. Tu salud mental es primero.", 0, undefined, 'tour_wellness');
        await wait(4000);

        // Final Call to Action
        setSetupPhase('completed');
        await addBotMessageAsync("¡Todo listo! Tienes el control. ¿Por dónde quieres empezar?", 500, [
            { label: "🚀 Entendido, Iniciar", action: () => startReturningUserFlow(true), primary: true }
        ]);
    };

    // --- FLOW: RETURNING USER (Work Session) ---

    const startReturningUserFlow = async (skipGreeting = false) => {
        // If we just came from the tour (skipGreeting=true), we skip the strategic goal check and just show tools
        if (skipGreeting) {
            showStudyModes();
            return;
        }

        // 0. Check Goal Validity
        if (!user.dailyGoal || user.dailyGoal.length < 3) {
            addBotMessage(`Hola, ${user.name.split(' ')[0]}. No veo una misión clara para hoy.`, 500);
            setTimeout(() => {
                addBotMessage("¿Qué es lo más importante que quieres lograr?", 500);
                setSetupPhase('goal_setting');
            }, 1000);
            return;
        }

        // STRATEGIC GOAL CONTEXTUALIZATION
        setIsRefiningGoal(true);
        const firstName = user.name.split(' ')[0];

        addBotMessage(`Hola de nuevo, ${firstName}. 🎯`, 500);
        addBotMessage(`Tu meta hoy es: "${user.dailyGoal}".`, 1000);

        setTimeout(() => {
            const questions = [
                "¿Qué pasos concretos planeas seguir ahora mismo?",
                "¿Cuál es el mayor obstáculo que podría frenarte hoy?"
            ];

            const question = user.helpStyle === 'Práctico' ? questions[0] : questions[1];

            addBotMessage(question, 500, [
                { label: "Tengo un plan claro", action: () => handleRefiningGoalResponse("Tengo un plan claro y energía alta") },
                { label: "Necesito ayuda para empezar", action: () => handleContextTrigger('kickstart', user.dailyGoal) }
            ]);
        }, 2000);
    };

    const handleRefiningGoalResponse = async (userResponse: string) => {
        // High energy / Clear plan shortcut
        if (userResponse.includes("plan claro")) {
            setIsRefiningGoal(false);
            addBotMessage("¡Excelente! Vamos directo a la acción.", 500);
            setTimeout(() => showStudyModes(), 1000);
            return;
        }

        // AI Analysis of Plan/Obstacle
        setIsTyping(true);
        try {
            let responseText = "";
            try {
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (!apiKey) throw new Error("No API Key");

                const ai = new GoogleGenAI({ apiKey });
                const prompt = `
                Role: Productivity Coach.
                User Goal: "${user.dailyGoal}".
                User Profile: [${user.helpStyle}, Peak: ${user.peakTime}, Distractions: ${user.distractionApps.join(', ')}].
                User Input: "${userResponse}".
                Task: Give 1 short tactical tip (max 30 words) to overcome the obstacle or execute the plan.
            `;
                const result = await ai.models.generateContent({ model: 'gemini-1.5-flash', contents: prompt });
                responseText = result.text || "¡Vamos a ello!";
            } catch (e) {
                responseText = await mockGenerateContent(userResponse);
            }

            setIsRefiningGoal(false);
            setIsTyping(false);

            addBotMessage(responseText, 0);
            setTimeout(() => showStudyModes(), 1500);

        } catch (e) {
            setIsRefiningGoal(false);
            setIsTyping(false);
            showStudyModes();
        }
    };

    const showStudyModes = () => {
        addBotMessage("Elige tu modo de trabajo:", 500, [
            { label: "💻 Panel Digital", action: () => startDigital(), primary: true },
            { label: "📚 Modo Offline", action: () => startOffline() },
            { label: "👥 Comunidad", action: () => startCommunity() },
            { label: "🐢 Kickstart", action: () => handleContextTrigger('kickstart', user.dailyGoal) },
        ]);
    };

    // --- ASYNC UTILS ---

    const addBotMessageAsync = (text: string, delay: number, options?: Message['options'], contentType?: Message['contentType']) => {
        return new Promise<void>((resolve) => {
            if (isInterruptedRef.current) { resolve(); return; }
            setIsTyping(true);
            setTimeout(() => {
                if (isInterruptedRef.current) { resolve(); return; }
                setIsTyping(false);
                setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text, options, contentType }]);
                resolve();
            }, delay);
        });
    };

    const addBotMessage = (text: string, delay = 0, options?: Message['options'], mode: 'fast' | 'thinking' = 'fast') => {
        if (isInterruptedRef.current) return;
        setIsTyping(true);
        setTimeout(() => {
            if (isInterruptedRef.current) return;
            setIsTyping(false);
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text, options, mode }]);
        }, delay);
    };

    const addUserMessage = (text: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text }]);
    };

    // --- ACTIONS & NAVIGATION ---

    const startDigital = () => setTimeout(() => onNavigate(AppView.STUDY_PANEL), 500);
    const startOffline = () => setTimeout(() => onStartSession({ durationMinutes: 25, taskName: user.dailyGoal || 'Estudio Offline', mode: 'offline' }), 500);
    const startCommunity = () => setTimeout(() => onNavigate(AppView.COMMUNITY), 500);

    const handleContextTrigger = async (type: 'kickstart' | 'motivation' | 'analysis', goal: string) => {
        const userMessageText = type === 'kickstart'
            ? `Ayúdame a empezar con: "${goal}"`
            : `Necesito motivación para: "${goal}"`;

        addUserMessage(userMessageText);
        generateGenericAIResponse(userMessageText);
    };

    const handleSendMessage = async (textOverride?: string) => {
        const text = textOverride || inputText;
        if (!text.trim()) return;

        addUserMessage(text);
        setInputText("");

        if (setupPhase === 'open_expression') {
            handleOpenExpressionResponse(text);
            return;
        }

        if (setupPhase === 'goal_setting') {
            onUpdateUser({ dailyGoal: text });
            setSetupPhase('completed');
            setTimeout(() => startReturningUserFlow(false), 500);
            return;
        }

        if (isRefiningGoal) {
            handleRefiningGoalResponse(text);
            return;
        }

        generateGenericAIResponse(text);
    };

    const generateGenericAIResponse = async (userPrompt: string) => {
        setIsTyping(true);
        try {
            let responseText = "";
            try {
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (!apiKey) throw new Error("No API Key");

                const ai = new GoogleGenAI({ apiKey });
                const finalPrompt = `
                Role: AlterFocus Productivity Assistant.
                User Goal: "${user.dailyGoal}"
                User Input: "${userPrompt}"
                Instructions: Provide helpful, short guidance. Suggest using App Tools (Digital, Offline, Community) where appropriate.
            `;
                const result = await ai.models.generateContent({ model: 'gemini-1.5-flash', contents: finalPrompt });
                responseText = result.text || "Entendido.";
            } catch (e) {
                responseText = await mockGenerateContent(userPrompt);
            }

            if (isInterruptedRef.current) return;

            setIsTyping(false);

            // Contextual Buttons
            const dynamicOptions = [];
            const lowerRes = responseText.toLowerCase();
            if (lowerRes.includes('offline')) dynamicOptions.push({ label: "📚 Modo Offline", action: startOffline });
            if (lowerRes.includes('digital')) dynamicOptions.push({ label: "💻 Panel Digital", action: startDigital });
            if (lowerRes.includes('comunidad')) dynamicOptions.push({ label: "👥 Comunidad", action: startCommunity });

            if (dynamicOptions.length === 0) {
                dynamicOptions.push({ label: "Ver Herramientas", action: () => showStudyModes() });
            }

            addBotMessage(responseText, 0, dynamicOptions);

        } catch (e) {
            if (isInterruptedRef.current) return;
            setIsTyping(false);
            addBotMessage("Error de conexión.", 0);
        }
    };

    return (
        <motion.div className="absolute inset-0 bg-gradient-to-b from-black via-slate-900 to-black z-20 flex flex-col overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.15, 0.25, 0.15],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.1, 0.2, 0.1],
                        rotate: [360, 180, 0]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-[120px]"
                />
            </div>

            {/* Header */}
            <div className="relative z-10 bg-black/40 backdrop-blur-xl px-4 py-3 flex items-center justify-between shadow-lg border-b border-white/10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        {/* Animated Avatar */}
                        <motion.div
                            animate={{
                                boxShadow: [
                                    '0 0 20px rgba(99, 102, 241, 0.3)',
                                    '0 0 40px rgba(99, 102, 241, 0.6)',
                                    '0 0 20px rgba(99, 102, 241, 0.3)'
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="relative w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center"
                        >
                            <Bot size={20} className="text-white" />
                            {isTyping && (
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-cyan-400"
                                    animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            )}
                        </motion.div>
                        <div>
                            <h1 className="font-bold text-sm text-white">AlterFocus AI</h1>
                            <div className="flex items-center gap-1">
                                <motion.span
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className={`w-1.5 h-1.5 rounded-full ${isVoiceMode ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                />
                                <span className="text-[10px] font-medium text-slate-400">
                                    {isVoiceMode ? 'Voz Activa' : 'En línea'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setMessages([]);
                            setIsTyping(false);
                            setTimeout(() => {
                                if (user.hasCompletedAISetup) {
                                    startReturningUserFlow(false);
                                } else {
                                    startSetupFlow();
                                }
                            }, 100);
                        }}
                        className="p-2.5 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                        title="Reiniciar chat"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        onClick={() => {
                            const newMode = !isVoiceMode;
                            setIsVoiceMode(newMode);
                            if (newMode) {
                                voiceAI.startListening();
                            } else {
                                voiceAI.stopListening();
                                voiceAI.stopSpeaking();
                            }
                        }}
                        className={`p-2.5 rounded-full transition-all ${isVoiceMode
                            ? 'bg-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        {isVoiceMode ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="relative flex-1 overflow-y-auto p-4 space-y-5 pb-24">
                {/* Voice Mode Indicator - Sticky at top of chat */}
                {isVoiceMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="sticky top-0 z-20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-3 border border-cyan-500/20 mb-4"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <motion.div
                                    animate={{
                                        scale: voiceAI.isListening ? [1, 1.15, 1] : 1,
                                    }}
                                    transition={{ duration: 0.8, repeat: voiceAI.isListening ? Infinity : 0 }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${voiceAI.isListening
                                        ? 'bg-cyan-500 shadow-lg shadow-cyan-500/40'
                                        : 'bg-slate-700'
                                        }`}
                                >
                                    <Mic size={14} className="text-white" />
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-cyan-300 truncate">
                                        {voiceAI.isListening ? '🎙️ Escuchando...' : 'Modo Voz'}
                                    </p>
                                    {voiceAI.transcript && (
                                        <p className="text-[10px] text-slate-400 truncate">"{voiceAI.transcript}"</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => voiceAI.toggleListening()}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${voiceAI.isListening
                                        ? 'bg-rose-500 text-white'
                                        : 'bg-cyan-500 text-white'
                                        }`}
                                >
                                    {voiceAI.isListening ? '⏸ Pausar' : '▶ Iniciar'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsVoiceMode(false);
                                        voiceAI.stopListening();
                                        voiceAI.stopSpeaking();
                                    }}
                                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={12} className="text-slate-400" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Messages */}
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div
                            className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-lg backdrop-blur-sm relative ${msg.sender === 'user'
                                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tr-md'
                                : 'bg-white/10 text-slate-100 rounded-tl-md border border-white/20'
                                }`}
                        >
                            {msg.sender === 'bot' && (
                                <div className="flex items-center gap-1.5 mb-2 opacity-70">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Sparkles size={12} className="text-cyan-400" />
                                    </motion.div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                                        Asistente
                                    </span>
                                </div>
                            )}

                            <div className={msg.sender === 'user' ? 'font-medium' : ''}>
                                {msg.text}
                            </div>

                            {/* SETUP COMPONENTS */}
                            {msg.contentType === 'setup_distractions' && setupPhase === 'distractions' && (
                                <div className="mt-4">
                                    <MultiSelectApps
                                        options={["TikTok", "Instagram", "WhatsApp", "Twitter", "YouTube"]}
                                        selected={tempDistractions}
                                        onChange={setTempDistractions}
                                        onConfirm={handleDistractionsConfirm}
                                    />
                                </div>
                            )}
                            {msg.contentType === 'setup_hours' && setupPhase === 'hours' && (
                                <div className="mt-4">
                                    <MultiSelectApps
                                        options={["Mañana (8-12)", "Tarde (13-18)", "Noche (19-23)"]}
                                        selected={tempHours}
                                        onChange={setTempHours}
                                        onConfirm={handleHoursConfirm}
                                    />
                                </div>
                            )}
                            {msg.contentType === 'setup_integrations' && setupPhase === 'integrations' && (
                                <div className="mt-4">
                                    <MultiSelectIntegrations
                                        selected={tempIntegrations}
                                        onChange={setTempIntegrations}
                                        onConfirm={handleIntegrationsConfirm}
                                    />
                                </div>
                            )}

                            {/* TOUR DEMOS */}
                            {msg.contentType === 'tour_digital' && <TourDigitalDemo />}
                            {msg.contentType === 'tour_offline' && <TourOfflineDemo />}
                            {msg.contentType === 'tour_community' && <TourCommunityDemo />}
                            {msg.contentType === 'tour_wellness' && <TourWellnessDemo />}
                        </div>

                        {msg.options && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {msg.options.map((opt, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={opt.action}
                                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-lg backdrop-blur-sm ${opt.primary
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                                            : 'bg-white/10 text-cyan-400 border border-cyan-400/30 hover:bg-white/20'
                                            }`}
                                    >
                                        {opt.label}
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}

                {/* Typing Indicator with Breathing Bubble */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-start gap-3"
                    >
                        {/* Breathing Mini Bubble */}
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.6, 1, 0.6]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="relative w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 backdrop-blur-xl border border-white/20 flex items-center justify-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur-xl"
                            />
                            <Cpu size={18} className="text-cyan-400 relative z-10" />
                        </motion.div>

                        <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl rounded-tl-md p-4">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                    className="w-2 h-2 rounded-full bg-cyan-400"
                                />
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                    className="w-2 h-2 rounded-full bg-cyan-400"
                                />
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                    className="w-2 h-2 rounded-full bg-cyan-400"
                                />
                                <span className="text-xs text-slate-400 ml-2">Procesando...</span>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {!isVoiceMode && (
                <div className="relative z-10 p-3 bg-black/40 backdrop-blur-xl border-t border-white/10 flex gap-2">
                    <input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={
                            isRefiningGoal
                                ? "Describe tu plan u obstáculo..."
                                : setupPhase === 'open_expression'
                                    ? "Cuéntame..."
                                    : setupPhase === 'goal_setting'
                                        ? "Tu meta..."
                                        : "Mensaje..."
                        }
                        disabled={['distractions', 'hours', 'integrations', 'tour'].includes(setupPhase)}
                        className="flex-1 bg-white/10 backdrop-blur-sm rounded-full px-5 py-3 outline-none text-sm text-white placeholder:text-slate-500 disabled:opacity-50 border border-white/20 focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSendMessage()}
                        disabled={!inputText.trim()}
                        className="p-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-50 disabled:from-slate-700 disabled:to-slate-700 shadow-lg transition-all"
                    >
                        <Send size={18} />
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
};

export default AIGuide;