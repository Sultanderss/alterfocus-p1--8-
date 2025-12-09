import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Bot, Mic, MicOff, Activity, Sparkles, ChevronRight, Brain } from 'lucide-react';
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

interface ConversationStep {
    id: string;
    botMessage: string;
    userResponse?: string;
    options?: { label: string; action: () => void; primary?: boolean }[];
    requiresInput?: boolean;
}

const AIGuideOrb: React.FC<AIGuideProps> = ({ user, initialContext, onBack, onNavigate, onUpdateUser }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [conversationSteps, setConversationSteps] = useState<ConversationStep[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isVoiceMode, setIsVoiceMode] = useState(false);

    // Voice AI
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const voiceAI = useVoiceAI({
        apiKey,
        onTranscript: (text) => {
            handleUserResponse(text);
        },
        onAIResponse: (text) => {
            addBotStep(text);
        }
    });

    // Initialize conversation
    useEffect(() => {
        startConversation();
    }, []);

    const startConversation = () => {
        const initialStep: ConversationStep = {
            id: '1',
            botMessage: `Hola ${user.name.split(' ')[0]}. Soy tu asistente de enfoque. 🧠`,
            options: [
                { label: '👋 Empecemos', action: () => nextStep(), primary: true }
            ]
        };
        setConversationSteps([initialStep]);
    };

    const nextStep = () => {
        // Example progression - you would build this dynamically based on flow
        const step: ConversationStep = {
            id: Date.now().toString(),
            botMessage: '¿Cuál es tu principal reto hoy?',
            requiresInput: true
        };
        setConversationSteps(prev => [...prev, step]);
        setCurrentStepIndex(prev => prev + 1);
    };

    const addBotStep = (message: string, options?: ConversationStep['options']) => {
        const step: ConversationStep = {
            id: Date.now().toString(),
            botMessage: message,
            options
        };
        setConversationSteps(prev => [...prev, step]);
        setCurrentStepIndex(prev => prev + 1);
    };

    const handleUserResponse = (response: string) => {
        // Update current step with user response
        setConversationSteps(prev => {
            const updated = [...prev];
            if (updated[currentStepIndex]) {
                updated[currentStepIndex].userResponse = response;
            }
            return updated;
        });
        setUserInput('');

        // Generate AI response
        setTimeout(() => {
            addBotStep('Entendido. Te ayudaré con eso.', [
                { label: '📚 Ver herramientas', action: () => nextStep(), primary: true }
            ]);
        }, 1000);
    };

    const currentStep = conversationSteps[currentStepIndex];

    return (
        <motion.div
            className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black flex flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.1, 0.2, 0.1],
                        x: [0, 100, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1.3, 1, 1.3],
                        opacity: [0.15, 0.25, 0.15],
                        x: [0, -80, 0],
                        y: [0, 60, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/3 right-1/3 w-[280px] h-[280px] bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-[100px]"
                />
            </div>

            {/* Header - Minimal */}
            <div className="relative z-10 p-4 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="p-2 text-slate-400 hover:bg-white/10 rounded-full transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <button
                    onClick={() => setIsVoiceMode(!isVoiceMode)}
                    className={`p-2 rounded-full transition-all ${isVoiceMode
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                >
                    {isVoiceMode ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
            </div>

            {/* Main Content - Centered Orb */}
            <div className="relative flex-1 flex flex-col items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {currentStep && (
                        <motion.div
                            key={currentStep.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-sm flex flex-col items-center"
                        >
                            {/* Central Breathing Orb */}
                            <div className="relative mb-8">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.05, 1],
                                        rotate: [0, 5, 0, -5, 0]
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="relative w-32 h-32"
                                >
                                    {/* Outer glow rings */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.3],
                                            opacity: [0.4, 0]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeOut"
                                        }}
                                        className="absolute inset-0 rounded-full border-2 border-cyan-400/50"
                                    />
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.5],
                                            opacity: [0.3, 0]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: 0.5,
                                            ease: "easeOut"
                                        }}
                                        className="absolute inset-0 rounded-full border-2 border-purple-400/30"
                                    />

                                    {/* Main orb */}
                                    <motion.div
                                        animate={{
                                            boxShadow: [
                                                '0 0 40px rgba(6, 182, 212, 0.4)',
                                                '0 0 80px rgba(139, 92, 246, 0.6)',
                                                '0 0 40px rgba(6, 182, 212, 0.4)'
                                            ]
                                        }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center relative overflow-hidden"
                                    >
                                        {/* Inner animated gradient */}
                                        <motion.div
                                            animate={{
                                                rotate: 360
                                            }}
                                            transition={{
                                                duration: 8,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        />

                                        {/* Icon */}
                                        {isTyping ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Sparkles size={40} className="text-white relative z-10" />
                                            </motion.div>
                                        ) : (
                                            <Brain size={40} className="text-white relative z-10" />
                                        )}
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Bot Message */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-center mb-6"
                            >
                                <p className="text-lg text-white font-medium leading-relaxed">
                                    {currentStep.botMessage}
                                </p>
                            </motion.div>

                            {/* User's Previous Response (if any) */}
                            {currentStep.userResponse && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mb-4 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-sm text-cyan-200"
                                >
                                    "{currentStep.userResponse}"
                                </motion.div>
                            )}

                            {/* Input or Options */}
                            {currentStep.requiresInput ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="w-full flex gap-2"
                                >
                                    <input
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && userInput.trim()) {
                                                handleUserResponse(userInput);
                                            }
                                        }}
                                        placeholder="Escribe tu respuesta..."
                                        className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            if (userInput.trim()) {
                                                handleUserResponse(userInput);
                                            }
                                        }}
                                        disabled={!userInput.trim()}
                                        className="p-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-50 shadow-lg"
                                    >
                                        <Send size={18} />
                                    </motion.button>
                                </motion.div>
                            ) : currentStep.options ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="w-full flex flex-col gap-3"
                                >
                                    {currentStep.options.map((option, idx) => (
                                        <motion.button
                                            key={idx}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={option.action}
                                            className={`w-full px-6 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${option.primary
                                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.3)]'
                                                    : 'bg-white/10 text-slate-200 border border-white/20 hover:bg-white/20'
                                                }`}
                                        >
                                            {option.label}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            ) : null}

                            {/* Step Indicator */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="mt-8 flex items-center gap-1.5"
                            >
                                {conversationSteps.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1.5 rounded-full transition-all ${idx === currentStepIndex
                                                ? 'w-8 bg-cyan-500'
                                                : idx < currentStepIndex
                                                    ? 'w-1.5 bg-cyan-500/50'
                                                    : 'w-1.5 bg-white/20'
                                            }`}
                                    />
                                ))}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute bottom-20 flex items-center gap-2"
                    >
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
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default AIGuideOrb;
