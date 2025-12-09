import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronRight, ChevronLeft, Home, Users, Zap, BarChart2, User,
    Target, Clock, Brain, Smartphone, Calendar, Shield, Sparkles,
    CheckCircle, Lightbulb, Heart
} from 'lucide-react';

interface AppGuideProps {
    onClose: () => void;
}

const AppGuide: React.FC<AppGuideProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const guideSteps = [
        {
            title: "¡Bienvenido a AlterFocus! 🎯",
            subtitle: "Tu aliado contra las distracciones",
            icon: <Sparkles size={48} className="text-brand-secondary" />,
            content: "AlterFocus es una aplicación diseñada por estudiantes para estudiantes. Te ayuda a mantener el enfoque, bloquear distracciones y construir hábitos de estudio saludables.",
            features: [
                "Bloqueo inteligente de sitios web",
                "Intervenciones contextuales con IA",
                "Sistema de gamificación para motivarte",
                "Comunidad de estudio colaborativo"
            ],
            gradient: "from-indigo-500/20 to-purple-500/20"
        },
        {
            title: "Panel Principal",
            subtitle: "Tu centro de control",
            icon: <Home size={48} className="text-emerald-400" />,
            content: "El Dashboard muestra tu progreso diario, nivel de autonomía, y acceso rápido a todas las herramientas. El orbe central te da acciones rápidas con un toque.",
            features: [
                "Barra de Autonomía: ve tu progreso como estudiante enfocado",
                "Tarjeta de IA Premium: consejos personalizados",
                "Herramientas de concentración: Pomodoro, modo offline y más",
                "Orbe flotante: menú de acceso rápido"
            ],
            gradient: "from-emerald-500/20 to-teal-500/20"
        },
        {
            title: "Comunidad",
            subtitle: "Estudia acompañado",
            icon: <Users size={48} className="text-blue-400" />,
            content: "Únete a salas de estudio virtuales o encuentra sesiones presenciales cerca de ti. El 'Body Doubling' te ayuda a mantener la motivación estudiando con otros.",
            features: [
                "Salas virtuales: Google Meet integrado",
                "Body Doubling Express: crea una sala silenciosa al instante",
                "Sesiones presenciales: encuentra compañeros en tu universidad",
                "Ubicaciones reales: bibliotecas, cafés y coworking"
            ],
            gradient: "from-blue-500/20 to-cyan-500/20"
        },
        {
            title: "Asistente IA",
            subtitle: "Tu coach personal",
            icon: <Zap size={48} className="text-yellow-400" />,
            content: "El asistente con IA (powered by Gemini) te da sugerencias personalizadas basadas en tu horario, energía y patrones de estudio.",
            features: [
                "Análisis de tu calendario de tareas",
                "Sugerencias según tu ritmo circadiano",
                "Intervenciones empáticas cuando te distraes",
                "Técnicas de respiración para momentos de estrés"
            ],
            gradient: "from-yellow-500/20 to-orange-500/20"
        },
        {
            title: "Progreso y Analíticas",
            subtitle: "Mide tu crecimiento",
            icon: <BarChart2 size={48} className="text-violet-400" />,
            content: "Visualiza tus estadísticas de enfoque, tiempo ahorrado, y tu tendencia a lo largo del tiempo. Descubre patrones y mejora continuamente.",
            features: [
                "Tiempo de enfoque acumulado",
                "Sitios bloqueados y tiempo ahorrado",
                "Racha de días enfocado",
                "Gráficas de tu evolución semanal"
            ],
            gradient: "from-violet-500/20 to-purple-500/20"
        },
        {
            title: "Configuración",
            subtitle: "Personaliza tu experiencia",
            icon: <User size={48} className="text-pink-400" />,
            content: "Controla qué sitios y apps bloquear, configura notificaciones, y conecta tus calendarios para una experiencia integrada.",
            features: [
                "Lista de apps bloqueadas personalizable",
                "Sincronización con extensión del navegador",
                "Conexión con Google Calendar (próximamente)",
                "Modo oscuro siempre activo"
            ],
            gradient: "from-pink-500/20 to-rose-500/20"
        },
        {
            title: "Herramientas Especiales",
            subtitle: "Potencia tu enfoque",
            icon: <Brain size={48} className="text-cyan-400" />,
            content: "Accede a herramientas diseñadas para diferentes necesidades: sesiones Pomodoro, modo offline para desconectarte, y más.",
            features: [
                { icon: <Clock size={16} />, text: "Pomodoro Timer: ciclos de 25/5 minutos" },
                { icon: <Smartphone size={16} />, text: "Flip Phone Mode: simplifica tu pantalla" },
                { icon: <Shield size={16} />, text: "Modo Offline: desconexión total" },
                { icon: <Calendar size={16} />, text: "Calendario: organiza tus entregas" }
            ],
            gradient: "from-cyan-500/20 to-sky-500/20"
        },
        {
            title: "Sistema de Bloqueo",
            subtitle: "Protege tu concentración",
            icon: <Shield size={48} className="text-red-400" />,
            content: "Cuando intentas acceder a un sitio bloqueado, AlterFocus te ofrece intervenciones contextuales en lugar de bloquear agresivamente.",
            features: [
                "Preguntas reflexivas antes de distraerte",
                "Alternativas saludables sugeridas",
                "Exercise Gate: desbloquea con movimiento",
                "Modo progresivo: se adapta a tu comportamiento"
            ],
            gradient: "from-red-500/20 to-orange-500/20"
        },
        {
            title: "¡Listo para empezar!",
            subtitle: "Hecho con ❤️ por estudiantes",
            icon: <Heart size={48} className="text-rose-400" />,
            content: "AlterFocus fue creado en la Universidad del Norte por estudiantes que entienden tus desafíos. ¡Estamos contigo en este camino!",
            features: [
                "Únete a la comunidad de estudiantes enfocados",
                "Comparte tu feedback para mejorar la app",
                "Construye hábitos que durarán toda la vida",
                "¡Tú puedes lograr el enfoque que deseas!"
            ],
            gradient: "from-rose-500/20 to-pink-500/20"
        }
    ];

    const currentGuide = guideSteps[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === guideSteps.length - 1;

    const handleNext = () => {
        if (isLast) {
            onClose();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirst) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl bg-brand-dark border border-white/10 shadow-2xl overflow-hidden"
            >
                {/* Header with gradient */}
                <div className={`relative flex-shrink-0 p-5 pb-10 bg-gradient-to-br ${currentGuide.gradient}`}>
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                    >
                        <X size={20} className="text-white/70" />
                    </button>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-1.5 mb-3">
                        {guideSteps.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentStep(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentStep
                                    ? 'w-6 bg-white'
                                    : idx < currentStep
                                        ? 'bg-white/60'
                                        : 'bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Icon */}
                    <motion.div
                        key={currentStep}
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="flex justify-center mb-3"
                    >
                        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                            {React.cloneElement(currentGuide.icon as React.ReactElement, { size: 40 })}
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.div
                        key={`title-${currentStep}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h2 className="text-xl font-bold text-white mb-1">{currentGuide.title}</h2>
                        <p className="text-white/70 text-sm">{currentGuide.subtitle}</p>
                    </motion.div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-5 -mt-6 rounded-t-3xl bg-brand-dark z-10 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-3"
                        >
                            {/* Description */}
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {currentGuide.content}
                            </p>

                            {/* Features list */}
                            <div className="space-y-2">
                                {currentGuide.features.map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5"
                                    >
                                        {typeof feature === 'object' && feature.icon ? (
                                            <>
                                                <div className="text-brand-secondary">{feature.icon}</div>
                                                <span className="text-sm text-slate-300">{feature.text}</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={16} className="text-brand-secondary flex-shrink-0" />
                                                <span className="text-sm text-slate-300">{feature as string}</span>
                                            </>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation buttons - Fixed at bottom */}
                <div className="flex-shrink-0 p-4 bg-brand-dark flex items-center justify-between gap-3 border-t border-white/5">
                    <button
                        onClick={handlePrev}
                        disabled={isFirst}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${isFirst
                            ? 'text-slate-600 cursor-not-allowed'
                            : 'text-white bg-white/10 hover:bg-white/15'
                            }`}
                    >
                        <ChevronLeft size={18} />
                        <span className="text-sm">Anterior</span>
                    </button>

                    <span className="text-xs text-slate-500">
                        {currentStep + 1} / {guideSteps.length}
                    </span>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        <span className="text-sm">{isLast ? '¡Empezar!' : 'Siguiente'}</span>
                        {isLast ? <Sparkles size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AppGuide;
