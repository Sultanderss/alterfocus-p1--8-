import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserState, AppView, InterventionTone } from '../types';
import {
  Zap, Wind, Users, BarChart2, Settings, Brain, Target,
  Edit2, ChevronRight, Sparkles, Clock, TrendingUp, Shield
} from 'lucide-react';

// --- Types ---
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

// --- Premium ToolCard Component ---
const ToolCard = ({ title, icon: Icon, gradient, onClick, delay }: any) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ scale: 1.03, y: -4 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="relative group overflow-hidden rounded-2xl p-4 text-left bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
  >
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}>
      <Icon size={20} className="text-white" />
    </div>
    <h3 className="text-sm font-bold text-white">{title}</h3>

    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <ChevronRight size={14} className="text-slate-400" />
    </div>
  </motion.button>
);

// --- Main Dashboard Component ---
const Dashboard: React.FC<DashboardProps> = ({
  user,
  onNavigate,
  onUpdateGoal
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(user.dailyGoal || '');

  const handleSaveGoal = () => {
    if (onUpdateGoal) {
      onUpdateGoal(tempGoal, user.dailyGoalTarget || 120);
    }
    setIsEditingGoal(false);
  };

  const progressPercent = Math.min((user.focusMinutes / (user.dailyGoalTarget || 120)) * 100, 100);

  return (
    <div className="h-full w-full flex flex-col bg-brand-dark text-slate-200 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="max-w-md mx-auto p-5 pb-28 space-y-5">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-slate-500 text-xs font-medium mb-0.5">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 className="text-2xl font-bold text-white">
                Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-400">{user.name}</span> 👋
              </h1>
            </div>
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate(AppView.SETTINGS)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <Settings size={18} className="text-slate-300" />
            </motion.button>
          </motion.div>

          {/* AI Assistant - HERO SECTION */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            onClick={() => onNavigate(AppView.AI_GUIDE)}
            className="relative overflow-hidden rounded-3xl cursor-pointer group"
          >
            {/* Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-purple-500 to-pink-500 rounded-3xl" />

            {/* Inner Content */}
            <div className="relative m-[1px] bg-gradient-to-br from-brand-dark via-brand-surface to-brand-dark rounded-3xl p-6 overflow-hidden">

              {/* Animated Orbs */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-brand-primary to-purple-500 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.2, 0.4, 0.2],
                  rotate: [360, 180, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl"
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="p-3 bg-gradient-to-br from-brand-primary to-purple-500 rounded-2xl"
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(99, 102, 241, 0.5)",
                          "0 0 40px rgba(99, 102, 241, 0.8)",
                          "0 0 20px rgba(99, 102, 241, 0.5)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Brain size={28} className="text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold text-white mb-0.5">Asistente IA</h2>
                      <p className="text-sm text-slate-400">Tu guía cognitiva personal</p>
                    </div>
                  </div>

                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ChevronRight className="text-slate-400 group-hover:text-white transition-colors" size={24} />
                  </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div className="text-2xl mb-1">🎯</div>
                    <p className="text-[10px] text-slate-400 leading-tight">Planificación inteligente</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div className="text-2xl mb-1">💡</div>
                    <p className="text-[10px] text-slate-400 leading-tight">Consejos personalizados</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div className="text-2xl mb-1">📊</div>
                    <p className="text-[10px] text-slate-400 leading-tight">Análisis profundo</p>
                  </div>
                </div>

                {/* CTA */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-brand-primary to-purple-500 text-white text-center py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/30"
                >
                  Iniciar Conversación
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Daily Goal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-brand-primary" />
                <span className="font-bold text-xs uppercase tracking-wider text-brand-primary">Objetivo de Hoy</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Edit2 size={14} />
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {isEditingGoal ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    placeholder="Define tu enfoque principal..."
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary/50"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveGoal}
                    className="w-full bg-gradient-to-r from-brand-primary to-purple-500 text-white py-2.5 rounded-xl font-bold text-sm"
                  >
                    Guardar
                  </button>
                </motion.div>
              ) : (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-lg font-bold text-white mb-3">
                    {user.dailyGoal || "Define tu objetivo principal..."}
                  </h2>
                  {user.dailyGoal && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Progreso: {user.focusMinutes} / {user.dailyGoalTarget} min</span>
                        <span className="text-brand-primary font-bold">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          className="h-full bg-gradient-to-r from-brand-primary to-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-amber-400" />
                <span className="text-xs text-slate-400">Sesiones</span>
              </div>
              <p className="text-xl font-bold text-white">{user.completedSessions}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-emerald-400" />
                <span className="text-xs text-slate-400">Minutos</span>
              </div>
              <p className="text-xl font-bold text-white">{user.focusMinutes}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-red-400" />
                <span className="text-xs text-slate-400">Bloqueado</span>
              </div>
              <p className="text-xl font-bold text-white">{user.dailyTikTokAttempts || 0}</p>
            </div>
          </motion.div>

          {/* Tools Grid */}
          <div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3"
            >
              Herramientas
            </motion.h2>

            <div className="grid grid-cols-2 gap-3">
              <ToolCard
                title="Sesión Focus"
                icon={Zap}
                gradient="from-amber-500 to-orange-600"
                onClick={() => onNavigate(AppView.FOCUS_SESSION)}
                delay={0.35}
              />
              <ToolCard
                title="Respiración"
                icon={Wind}
                gradient="from-teal-400 to-cyan-600"
                onClick={() => onNavigate(AppView.BREATHING)}
                delay={0.4}
              />
              <ToolCard
                title="Comunidad"
                icon={Users}
                gradient="from-purple-500 to-pink-600"
                onClick={() => onNavigate(AppView.COMMUNITY)}
                delay={0.45}
              />
              <ToolCard
                title="Analytics"
                icon={BarChart2}
                gradient="from-blue-500 to-indigo-600"
                onClick={() => onNavigate(AppView.ANALYTICS)}
                delay={0.5}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
