import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Wind, Users, Clock, X, Heart, Sparkles,
  Timer, ListTodo, Brain, Coffee, Footprints, MessageCircle,
  Target, Lightbulb, Leaf, ChevronRight, Check, Smartphone,
  Droplets, Music, Eye, Shuffle, Zap, WifiOff, Dumbbell,
  Sun, Moon, Volume2, AlertCircle
} from 'lucide-react';
import { AppView, POINTS } from '../types';

interface AlternativesProps {
  onBack: () => void;
  onNavigate: (view: AppView) => void;
  attempts: number;
  onUpdateAttempts: (attempts: number) => void;
  onReward: (points: number) => void;
  onScheduleNotification: (title: string, body: string, delayMs: number) => void;
}

/**
 * ALTERNATIVES - Intervención Compasiva (Nivel 3)
 * 
 * Propósito: Cuando el usuario ha intentado acceder a distracciones varias veces,
 * esta pantalla ofrece alternativas ÚTILES y COMPASIVAS, no castigos.
 * 
 * Filosofía: "Entiendo que estás luchando. Aquí hay herramientas que pueden ayudar."
 * 
 * Herramientas NO duplicadas de otros componentes:
 * - Regla de 2 minutos (empezar solo 2 min)
 * - Cambio de ambiente (sugerencias físicas)
 * - Cuerpo en movimiento (estiramientos, no castigo)
 * - Recompensa pendiente (define qué te darás después)
 * - Mind dump (vaciar pensamientos)
 * - Micro-tareas (dividir en pasos pequeños)
 */
const Alternatives: React.FC<AlternativesProps> = ({
  onBack,
  onNavigate,
  attempts,
  onUpdateAttempts,
  onReward,
  onScheduleNotification
}) => {
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showMicroTaskModal, setShowMicroTaskModal] = useState(false);
  const [showMindDumpModal, setShowMindDumpModal] = useState(false);
  const [showTwoMinuteModal, setShowTwoMinuteModal] = useState(false);
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  // Micro-task state
  const [microTask, setMicroTask] = useState('');
  const [microTasks, setMicroTasks] = useState<string[]>([]);

  // Mind dump state
  const [mindDump, setMindDump] = useState('');
  const [dumpSaved, setDumpSaved] = useState(false);

  // 2-minute rule state
  const [twoMinuteTimer, setTwoMinuteTimer] = useState(120);
  const [twoMinuteActive, setTwoMinuteActive] = useState(false);

  // Reward state
  const [pendingReward, setPendingReward] = useState('');
  const [rewardSaved, setRewardSaved] = useState(false);

  // Movement completed state
  const [movementDone, setMovementDone] = useState(false);

  // 2-minute timer effect
  useEffect(() => {
    let interval: any;
    if (twoMinuteActive && twoMinuteTimer > 0) {
      interval = setInterval(() => {
        setTwoMinuteTimer(prev => prev - 1);
      }, 1000);
    } else if (twoMinuteTimer === 0) {
      setTwoMinuteActive(false);
      onReward(15);
      // Show success message
    }
    return () => clearInterval(interval);
  }, [twoMinuteActive, twoMinuteTimer]);

  // Handle reminder
  const handleSetReminder = (minutes: number) => {
    setShowReminderModal(false);
    onScheduleNotification(
      "Momento de reenfoque",
      `Es hora de intentarlo de nuevo. Tú puedes. 💪`,
      minutes * 60 * 1000
    );
    onReward(5);
    onBack();
  };

  // Handle micro-task addition
  const addMicroTask = () => {
    if (microTask.trim()) {
      setMicroTasks([...microTasks, microTask.trim()]);
      setMicroTask('');
    }
  };

  const startMicroTasks = () => {
    if (microTasks.length > 0) {
      // Save micro-tasks for later reference
      localStorage.setItem('currentMicroTasks', JSON.stringify(microTasks));
      setShowMicroTaskModal(false);
      onReward(10);
      onNavigate(AppView.FOCUS_SESSION);
    }
  };

  // Handle mind dump save
  const saveMindDump = () => {
    if (mindDump.trim()) {
      const dumps = JSON.parse(localStorage.getItem('mindDumps') || '[]');
      dumps.unshift({
        text: mindDump,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('mindDumps', JSON.stringify(dumps.slice(0, 20)));
      setDumpSaved(true);
      onReward(10);
      setTimeout(() => {
        setShowMindDumpModal(false);
        setMindDump('');
        setDumpSaved(false);
      }, 1500);
    }
  };

  // Handle reward save
  const saveReward = () => {
    if (pendingReward.trim()) {
      localStorage.setItem('pendingReward', JSON.stringify({
        reward: pendingReward,
        createdAt: new Date().toISOString()
      }));
      setRewardSaved(true);
      onReward(5);
      setTimeout(() => {
        setShowRewardModal(false);
        setPendingReward('');
        setRewardSaved(false);
      }, 1500);
    }
  };

  // Handle movement completed
  const completeMovement = () => {
    setMovementDone(true);
    onReward(10);
    setTimeout(() => {
      setShowMovementModal(false);
      setMovementDone(false);
    }, 1500);
  };

  // Primary tools (most effective for procrastination)
  const primaryTools = [
    {
      id: 'twominute',
      icon: Timer,
      label: 'Regla de 2 minutos',
      description: 'Solo empieza por 2 minutos',
      color: 'from-violet-500 to-purple-600',
      action: () => setShowTwoMinuteModal(true),
      isNew: true
    },
    {
      id: 'microtask',
      icon: ListTodo,
      label: 'Micro-tareas',
      description: 'Divide en pasos pequeños',
      color: 'from-purple-500 to-indigo-500',
      action: () => setShowMicroTaskModal(true)
    },
    {
      id: 'movement',
      icon: Footprints,
      label: 'Mover el cuerpo',
      description: 'Activa tu energía (sin castigos)',
      color: 'from-green-500 to-emerald-500',
      action: () => setShowMovementModal(true),
      isNew: true
    },
    {
      id: 'environment',
      icon: Sun,
      label: 'Cambiar ambiente',
      description: 'Tu espacio afecta tu enfoque',
      color: 'from-amber-500 to-orange-500',
      action: () => setShowEnvironmentModal(true),
      isNew: true
    }
  ];

  // Secondary tools
  const secondaryTools = [
    {
      id: 'breathe',
      icon: Wind,
      label: 'Respirar',
      action: () => onNavigate(AppView.BREATHING)
    },
    {
      id: 'minddump',
      icon: Brain,
      label: 'Vaciar mente',
      action: () => setShowMindDumpModal(true)
    },
    {
      id: 'reward',
      icon: Sparkles,
      label: 'Mi recompensa',
      action: () => setShowRewardModal(true)
    },
    {
      id: 'reminder',
      icon: Clock,
      label: 'Recordar después',
      action: () => setShowReminderModal(true)
    }
  ];

  // Navigate tools
  const navigateTools = [
    {
      id: 'community',
      icon: Users,
      label: 'Estudiar acompañado',
      description: 'Únete a una sala de enfoque',
      action: () => onNavigate(AppView.COMMUNITY)
    },
    {
      id: 'flipphone',
      icon: Smartphone,
      label: 'Modo Flip Phone',
      description: 'Compromiso de desconexión digital',
      action: () => onNavigate(AppView.FLIP_PHONE_MODE)
    },
    {
      id: 'offline',
      icon: WifiOff,
      label: 'Modo Sin Pantalla',
      description: 'Prepárate para estudiar físicamente',
      action: () => onNavigate(AppView.OFFLINE_STUDY)
    }
  ];

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 100%)' }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 bg-white/5 rounded-xl text-slate-300 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="font-bold text-lg text-white">Momento de Pausa</h1>
            <p className="text-xs text-slate-400">Respira. Tienes opciones.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-8">
        {/* Compassionate Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-4 mb-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Heart size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-1">
                Está bien sentir la urgencia de distraerte.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Tu cerebro busca dopamina rápida. Eso no te hace débil—te hace humano.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Primary Tools */}
        <div className="mb-5">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
            Lo más efectivo
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {primaryTools.map((tool, index) => (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={tool.action}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-left hover:bg-white/10 hover:border-white/20 transition-all group relative"
              >
                {tool.isNew && (
                  <span className="absolute top-2 right-2 text-[9px] bg-violet-500/30 text-violet-300 px-1.5 py-0.5 rounded font-bold">
                    NUEVO
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <tool.icon size={20} className="text-white" />
                </div>
                <h3 className="text-white text-sm font-bold mb-0.5">{tool.label}</h3>
                <p className="text-slate-500 text-[11px]">{tool.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Secondary Tools Row */}
        <div className="mb-5">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
            Más herramientas
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {secondaryTools.map((tool, index) => (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={tool.action}
                className="flex-shrink-0 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <tool.icon size={16} className="text-slate-400" />
                <span className="text-white text-sm font-medium">{tool.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Navigate to other views */}
        <div className="mb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
            Ir a herramienta
          </h2>
          <div className="space-y-2">
            {navigateTools.map((tool, index) => (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={tool.action}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <tool.icon size={20} className="text-slate-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white text-sm font-medium">{tool.label}</h3>
                  <p className="text-slate-500 text-xs">{tool.description}</p>
                </div>
                <ChevronRight size={18} className="text-slate-600" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-xl p-3"
        >
          <div className="flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-400" />
            <p className="text-slate-400 text-xs">
              <span className="text-white font-medium">Tip:</span> Si nada funciona, levántate y toma agua. A veces es todo lo que necesitas.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ============ MODALS ============ */}

      {/* 2-Minute Rule Modal */}
      <AnimatePresence>
        {showTwoMinuteModal && (
          <Modal onClose={() => { setShowTwoMinuteModal(false); setTwoMinuteActive(false); setTwoMinuteTimer(120); }}>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Timer size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Regla de 2 Minutos</h2>
              <p className="text-slate-400 text-sm mb-6">
                Solo comprométete a trabajar por 2 minutos. Después puedes parar si quieres.
                <br /><span className="text-violet-400">Spoiler: casi nunca querrás parar.</span>
              </p>

              {!twoMinuteActive ? (
                <button
                  onClick={() => setTwoMinuteActive(true)}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Zap size={20} />
                  Empezar 2 minutos
                </button>
              ) : (
                <div>
                  <div className="text-5xl font-mono font-bold text-white mb-4">
                    {Math.floor(twoMinuteTimer / 60)}:{(twoMinuteTimer % 60).toString().padStart(2, '0')}
                  </div>
                  {twoMinuteTimer === 0 ? (
                    <div className="bg-green-500/20 border border-green-500/30 text-green-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                      <Check size={20} />
                      ¡Lo lograste! +15 puntos
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">Enfócate solo estos 2 minutos...</p>
                  )}
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Environment Modal */}
      <AnimatePresence>
        {showEnvironmentModal && (
          <Modal onClose={() => setShowEnvironmentModal(false)}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Sun size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Cambia tu ambiente</h2>
                  <p className="text-slate-400 text-xs">Un pequeño cambio puede romper el bucle</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { icon: '💡', text: 'Enciende/apaga una luz' },
                  { icon: '🪟', text: 'Abre una ventana' },
                  { icon: '🎧', text: 'Pon música instrumental o silencio total' },
                  { icon: '📍', text: 'Muévete a otro lugar (otra silla, otra mesa)' },
                  { icon: '🧹', text: 'Despeja tu escritorio (30 segundos)' },
                  { icon: '🌡️', text: 'Ajusta la temperatura' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-white text-sm">{item.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setShowEnvironmentModal(false); onReward(5); }}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold"
              >
                Hice un cambio ✓
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Movement Modal */}
      <AnimatePresence>
        {showMovementModal && (
          <Modal onClose={() => { setShowMovementModal(false); setMovementDone(false); }}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Footprints size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Activa tu cuerpo</h2>
                  <p className="text-slate-400 text-xs">Sin castigos. Solo movimiento.</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                Elige UNA de estas opciones. No es un castigo, es para activar tu cerebro:
              </p>

              <div className="space-y-2 mb-6">
                {[
                  { icon: '🚶', text: 'Camina 30 segundos (a cualquier lado)' },
                  { icon: '🙆', text: 'Estira brazos arriba por 10 segundos' },
                  { icon: '💧', text: 'Ve a buscar un vaso de agua' },
                  { icon: '🪟', text: 'Mira por la ventana 20 segundos' },
                  { icon: '🧘', text: '5 respiraciones profundas de pie' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-white text-sm">{item.text}</span>
                  </div>
                ))}
              </div>

              {movementDone ? (
                <div className="w-full bg-green-500/20 border border-green-500/30 text-green-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Check size={20} />
                  ¡Bien! +10 puntos
                </div>
              ) : (
                <button
                  onClick={completeMovement}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold"
                >
                  Lo hice ✓
                </button>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Reward Modal */}
      <AnimatePresence>
        {showRewardModal && (
          <Modal onClose={() => setShowRewardModal(false)}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Tu recompensa</h2>
                  <p className="text-slate-400 text-xs">Define qué te darás después de enfocarte</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                ¿Qué te gustaría hacer/comer/ver después de terminar? Escríbelo como motivación:
              </p>

              <input
                value={pendingReward}
                onChange={(e) => setPendingReward(e.target.value)}
                placeholder="Ej: Ver un episodio de mi serie, un café, salir a caminar..."
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500/50 placeholder:text-slate-600 mb-4"
              />

              {rewardSaved ? (
                <div className="w-full bg-green-500/20 border border-green-500/30 text-green-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Check size={20} />
                  Guardado. ¡A trabajar por esa recompensa!
                </div>
              ) : (
                <button
                  onClick={saveReward}
                  disabled={!pendingReward.trim()}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-bold disabled:opacity-50"
                >
                  Guardar mi recompensa
                </button>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Reminder Modal */}
      <AnimatePresence>
        {showReminderModal && (
          <Modal onClose={() => setShowReminderModal(false)}>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">¿Cuándo volvemos?</h2>
              <p className="text-slate-400 text-sm mb-6">
                Te enviaré un recordatorio gentil.
              </p>

              <div className="space-y-3">
                {[
                  { min: 15, label: '15 minutos', tag: 'Pausa corta' },
                  { min: 30, label: '30 minutos', tag: 'Recomendado' },
                  { min: 60, label: '1 hora', tag: null }
                ].map((option) => (
                  <button
                    key={option.min}
                    onClick={() => handleSetReminder(option.min)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-xl font-medium flex items-center justify-between px-4 transition-colors"
                  >
                    <span>{option.label}</span>
                    {option.tag && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-1 rounded-full font-bold">
                        {option.tag}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Micro-Task Modal */}
      <AnimatePresence>
        {showMicroTaskModal && (
          <Modal onClose={() => setShowMicroTaskModal(false)}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <ListTodo size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Micro-tareas</h2>
                  <p className="text-slate-400 text-xs">Lo grande se vuelve manejable</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                Divide tu tarea en pasos de 5 minutos o menos:
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  value={microTask}
                  onChange={(e) => setMicroTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMicroTask()}
                  placeholder="Ej: Leer solo 1 página..."
                  className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 placeholder:text-slate-600"
                />
                <button
                  onClick={addMicroTask}
                  disabled={!microTask.trim()}
                  className="bg-purple-500 text-white px-4 rounded-xl disabled:opacity-50 hover:bg-purple-600 transition-colors"
                >
                  +
                </button>
              </div>

              {microTasks.length > 0 && (
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {microTasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                      <div className="w-5 h-5 rounded-full border-2 border-purple-500/50 flex items-center justify-center text-purple-400 text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-white text-sm">{task}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={startMicroTasks}
                disabled={microTasks.length === 0}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Target size={18} />
                Empezar con el primero
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Mind Dump Modal */}
      <AnimatePresence>
        {showMindDumpModal && (
          <Modal onClose={() => setShowMindDumpModal(false)}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Brain size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Vaciar la mente</h2>
                  <p className="text-slate-400 text-xs">Saca todo lo que te pesa</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                Escribe todo lo que está en tu cabeza—sin filtro, sin orden:
              </p>

              <textarea
                value={mindDump}
                onChange={(e) => setMindDump(e.target.value)}
                placeholder="Tengo que hacer... me preocupa que... no puedo dejar de pensar en..."
                className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-amber-500/50 min-h-[120px] placeholder:text-slate-600 resize-none mb-4"
              />

              {dumpSaved ? (
                <div className="w-full bg-green-500/20 border border-green-500/30 text-green-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Check size={18} />
                  Guardado. Tu mente está más ligera.
                </div>
              ) : (
                <button
                  onClick={saveMindDump}
                  disabled={!mindDump.trim()}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Leaf size={18} />
                  Soltar y continuar
                </button>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Modal Component
const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="bg-gradient-to-b from-slate-800 to-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10 relative max-h-[85vh] overflow-y-auto"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
      >
        <X size={18} />
      </button>
      {children}
    </motion.div>
  </motion.div>
);

export default Alternatives;