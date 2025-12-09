import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserState, AppView, InterventionTone } from '../types';
import {
  Zap, Wind, Settings, Brain, ChevronRight, Clock, Shield, Smartphone,
  Coffee, HeartPulse, Lightbulb, Flame, Calendar, Sparkles,
  X, Target, MessageCircle, BarChart3, HelpCircle, BookOpen, Users, Play,
  ArrowUp, ArrowDown, SlidersHorizontal, Check
} from 'lucide-react';
import AppGuide from './AppGuide';
import { useSimulation } from '../context/SimulationContext';

interface DashboardProps {
  user: UserState;
  onNavigate: (view: AppView) => void;
  onTriggerIntervention?: (type?: 'manual' | 'auto') => void;
  onUpdateGoal?: (goal: string, target: number) => void;
  onUpdateTone?: (tone: InterventionTone) => void;
  notificationPermission?: NotificationPermission;
  onRequestNotifications?: () => void;
  onAskAI?: (type: 'kickstart' | 'motivation' | 'analysis') => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  onNavigate,
  onTriggerIntervention
}) => {
  const [showAllTools, setShowAllTools] = useState(false);
  const [showAppGuide, setShowAppGuide] = useState(false);
  const [layoutOrder, setLayoutOrder] = useState<string[]>(['wallet', 'actions', 'ai']);
  const [isEditingLayout, setIsEditingLayout] = useState(false);

  const { isSimulationActive, toggleSimulation } = useSimulation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const firstName = user.name?.split(' ')[0] || 'Estudiante';
  const level = Math.floor(user.points / 500) + 1;
  const pointsInLevel = user.points % 500;
  const levelProgress = (pointsInLevel / 500) * 100;

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...layoutOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setLayoutOrder(newOrder);
    }
  };

  const renderSection = (sectionId: string, index: number) => {
    const isFirst = index === 0;
    const isLast = index === layoutOrder.length - 1;

    let content;
    switch (sectionId) {
      case 'wallet':
        content = (
          /* ===== PERFORMANCE CARD ===== */
          <motion.div
            className="mb-5 relative overflow-hidden rounded-[1.5rem] p-4 shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px]" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Tu Rendimiento</h2>
                  <button
                    onClick={() => alert("📊 Variables de Rendimiento:\n\n• Puntos: Tu puntaje de gamificación general.\n• Vida Recuperada: Tiempo total desconectado.\n• Días Laborales: Jornadas de 7 horas ganadas para tu vida.")}
                    className="text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    <HelpCircle size={12} />
                  </button>
                </div>
                <div className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-100 font-medium">Nivel {level}</span>
                </div>
              </div>

              {/* MAIN POINTS DISPLAY - COMPACT */}
              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white leading-none">{user.points}</span>
                  <span className="text-amber-400 font-bold text-sm">Puntos</span>
                </div>
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-2 gap-2 bg-black/20 rounded-xl p-2.5 border border-white/5">
                <div className="flex flex-col items-center border-r border-white/10">
                  <div className="text-lg font-bold text-white mb-0.5">{isSimulationActive ? 0 : user.focusMinutes} <span className="text-xs font-medium text-slate-400">min</span></div>
                  <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wide">Vida Recuperada</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-lg font-bold text-amber-400 mb-0.5">{isSimulationActive ? 0 : (user.focusMinutes / 420).toFixed(1)}</div>
                  <div className="text-[8px] text-amber-500/80 uppercase font-bold tracking-wide">Días Laborales</div>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] mb-1.5 opacity-80">
                  <span className="text-slate-400">Próximo Nivel</span>
                  <span className="text-white font-bold">{pointsInLevel} / 500</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
        break;
      case 'actions':
        content = (
          /* ===== QUICK ACTIONS ===== */
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">Acciones Rápidas</h3>
            <div className="grid grid-cols-4 gap-3">
              <button onClick={() => onNavigate(AppView.FOCUS_SESSION)} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 active:scale-95 transition-transform group">
                <div className="p-2.5 bg-violet-500 rounded-xl text-white shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform"><Play size={18} /></div>
                <span className="text-[10px] font-medium">Enfoque</span>
              </button>
              <button onClick={() => onNavigate(AppView.FLIP_PHONE_MODE)} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 active:scale-95 transition-transform group">
                <div className="p-2.5 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform"><Smartphone size={18} /></div>
                <span className="text-[10px] font-medium">Flip Phone</span>
              </button>
              <button onClick={() => onNavigate(AppView.BREATHING)} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 active:scale-95 transition-transform group">
                <div className="p-2.5 bg-teal-500 rounded-xl text-white shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform"><Wind size={18} /></div>
                <span className="text-[10px] font-medium">Respirar</span>
              </button>
              <button onClick={() => onNavigate(AppView.COMMUNITY)} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 active:scale-95 transition-transform group">
                <div className="p-2.5 bg-pink-500 rounded-xl text-white shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform"><Users size={18} /></div>
                <span className="text-[10px] font-medium">Tribus</span>
              </button>
            </div>
          </div>
        );
        break;
      case 'ai':
        content = (
          /* ===== AI ASSISTANT CARD ===== */
          <div className="mb-6">
            <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500" />
              <div className="relative m-[1.5px] rounded-3xl overflow-hidden transition-colors bg-white dark:bg-[#12121a]">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-100/50 dark:from-purple-500/10 to-transparent pointer-events-none" />
                <div className="relative p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="relative p-3 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-2xl shadow-lg shadow-purple-500/30">
                          <Brain size={24} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Asistente IA</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tu guía cognitiva personal</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <button onClick={() => onNavigate(AppView.AI_GUIDE)} className="p-3 rounded-xl border text-center transition-colors bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      <div className="mx-auto w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white mb-2"><Target size={16} /></div>
                      <span className="text-[10px] font-medium block">Planificación</span>
                    </button>
                    <button onClick={() => onNavigate(AppView.AI_GUIDE)} className="p-3 rounded-xl border text-center transition-colors bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-500/20">
                      <div className="mx-auto w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white mb-2"><Lightbulb size={16} /></div>
                      <span className="text-[10px] font-medium block">Consejos</span>
                    </button>
                    <button onClick={() => onNavigate(AppView.ANALYTICS)} className="p-3 rounded-xl border text-center transition-colors bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-500/20">
                      <div className="mx-auto w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white mb-2"><BarChart3 size={16} /></div>
                      <span className="text-[10px] font-medium block">Mi Progreso</span>
                    </button>
                  </div>
                  {/* ARCHETYPE PATTERNS BUTTON */}
                  <button
                    onClick={() => onNavigate(AppView.PATTERN_DASHBOARD)}
                    className="w-full mb-4 p-3 rounded-xl border text-left transition-colors bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 dark:from-purple-500/10 dark:to-indigo-500/10 dark:border-purple-500/30 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-500/20 dark:hover:to-indigo-500/20 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                      <Brain size={20} />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-bold text-purple-700 dark:text-purple-200 block">Mis Patrones</span>
                      <span className="text-[10px] text-purple-600/70 dark:text-purple-300/70">Analiza tu arquetipo de procrastinación</span>
                    </div>
                    <ChevronRight size={18} className="text-purple-400" />
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigate(AppView.AI_GUIDE)}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={20} />
                    ¡Comencemos ahora!
                  </motion.button>
                  {/* ARCHETYPE INTERVENTION BUTTON */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigate(AppView.ARCHETYPE_INTERVENTION)}
                    className="w-full mt-3 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Brain size={18} />
                    ¿Procrastinando? Intervención Inteligente
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        );
        break;
      default: return null;
    }

    return (
      <motion.div key={sectionId} layoutId={sectionId}>
        {isEditingLayout && (
          <div className="flex justify-end gap-2 mb-2">
            <button
              onClick={() => moveSection(index, 'up')}
              disabled={isFirst}
              className={`p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border ${isFirst ? 'opacity-30' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={() => moveSection(index, 'down')}
              disabled={isLast}
              className={`p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border ${isLast ? 'opacity-30' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <ArrowDown size={14} />
            </button>
          </div>
        )}
        {content}
      </motion.div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative text-slate-900 dark:text-white transition-colors duration-300">

      {/* Animated Background Orbs (Visible only in Dark Mode via CSS) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden dark:block">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -right-32 w-[450px] h-[450px] bg-gradient-to-br from-purple-600/30 via-fuchsia-500/20 to-pink-500/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-0 -left-32 w-[350px] h-[350px] bg-gradient-to-tr from-cyan-500/25 via-blue-500/15 to-indigo-500/10 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-[50px]"
        />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
        <motion.div
          className="max-w-md mx-auto px-5 pb-32 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >

          {/* ===== HEADER ===== */}
          <motion.header
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {getGreeting()}, <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">{firstName}</span> 👋
                </h1>
                <p className="text-sm mt-0.5 text-slate-400 dark:text-slate-500">
                  {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingLayout(!isEditingLayout)}
                  className={`p-2.5 rounded-xl border transition-colors ${isEditingLayout ? 'bg-purple-500 text-white border-purple-600' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10'}`}
                >
                  {isEditingLayout ? <Check size={18} /> : <SlidersHorizontal size={18} className="text-slate-600 dark:text-slate-400" />}
                </button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onNavigate(AppView.SETTINGS)}
                  className="p-2.5 rounded-xl border transition-colors bg-slate-100 hover:bg-slate-200 border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10"
                >
                  <Settings size={18} className="text-slate-600 dark:text-slate-400" />
                </motion.button>
              </div>
            </div>
          </motion.header>

          <div className="mt-6">
            {layoutOrder.map((sectionId, index) => renderSection(sectionId, index))}
          </div>

          {/* ===== MORE TOOLS ===== */}
          <motion.section>
            <button
              onClick={() => setShowAllTools(!showAllTools)}
              className="w-full mb-4 flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Más Herramientas</span>
              <ChevronRight size={16} className={`text-slate-500 transition-transform ${showAllTools ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {showAllTools && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-2 gap-3 overflow-hidden"
                >
                  <button onClick={() => onNavigate(AppView.CRISIS)} className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left hover:bg-slate-200 dark:hover:bg-white/10 transition-colors group">
                    <HeartPulse size={24} className="mb-3 text-rose-500" />
                    <h4 className="font-bold text-sm mb-1">Crisis Mode</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Botón de pánico para ansiedad.</p>
                  </button>

                  <button onClick={() => toggleSimulation()} className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left hover:bg-slate-200 dark:hover:bg-white/10 transition-colors group">
                    {isSimulationActive ? <X size={24} className="mb-3 text-red-500" /> : <Play size={24} className="mb-3 text-blue-500" />}
                    <h4 className="font-bold text-sm mb-1">{isSimulationActive ? 'Stop Demo' : 'Start Demo'}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Simula actividad para probar la app.</p>
                  </button>

                  <button onClick={() => setShowAppGuide(true)} className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left hover:bg-slate-200 dark:hover:bg-white/10 transition-colors col-span-2">
                    <HelpCircle size={24} className="mb-3 text-purple-500" />
                    <h4 className="font-bold text-sm mb-1">Guía de la App</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Aprende a usar todas las funciones.</p>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

        </motion.div>
      </div>

      <AnimatePresence>
        {showAppGuide && <AppGuide onClose={() => setShowAppGuide(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
