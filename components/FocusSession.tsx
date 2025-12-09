
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FocusConfig, EmotionalMetrics, InterventionType } from '../types';
import { Pause, Play, Square, CheckCircle, Users, WifiOff, Laptop, Brain, AlertTriangle, Sparkles, Clock, ChevronDown, TestTube, Target, Zap, FileText } from 'lucide-react';
import MildToast from './MildToast';
import PostSessionModal from './PostSessionModal';
import InterventionContextual from './InterventionContextual';
import { useAppStore } from '../store/appStore';
import { getCurrentArchetype, getInterventionsForArchetype, detectArchetype } from '../lib/archetypeEngine';
import { sendInterventionNudge, sendBreakReminder } from '../services/pushNotifications';
import { useArchetypeSupabase } from '../hooks/useArchetypeSupabase';

interface FocusSessionProps {
  config: FocusConfig;
  onComplete: () => void;
  onAbort: () => void;
  onTriggerIntervention: (type: 'manual' | 'auto') => void;
}

const FocusSession: React.FC<FocusSessionProps> = ({ config, onComplete, onAbort, onTriggerIntervention }) => {
  const [timeLeft, setTimeLeft] = useState(config.durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [iaMessage, setIaMessage] = useState<string | null>(null);
  const [communityNotification, setCommunityNotification] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Enfoque Profundo");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Store integration
  const { currentSession, startSession, endSession, addIntervention, addFeedback } = useAppStore();

  // Start session on mount
  useEffect(() => {
    if (!currentSession) {
      startSession(config.taskName);
    }
  }, []);

  // --- ADVANCED INTERVENTION STATE ---
  const [showIntervention, setShowIntervention] = useState(false);
  const [showMildToast, setShowMildToast] = useState(false);
  const [metrics, setMetrics] = useState<EmotionalMetrics>({
    clickSpeed: 1,
    responseTime: 5,
    attemptCount: 0,
    timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'night',
    lastInterventions: []
  });

  // Refs for metric calculation
  const lastClickTime = useRef<number>(Date.now());
  const clickTimes = useRef<number[]>([]);

  // --- METRIC TRACKING ---
  const trackClick = () => {
    const now = Date.now();
    clickTimes.current = [...clickTimes.current, now].filter(t => now - t < 5000); // Keep last 5s

    // Calculate clicks per second
    const speed = clickTimes.current.length / 5;

    setMetrics(prev => ({
      ...prev,
      clickSpeed: speed,
      responseTime: 0 // Reset response time on activity
    }));
    lastClickTime.current = now; // Update last click time
  };

  // Track inactivity (Response Time)
  useEffect(() => {
    const interval = setInterval(() => {
      const inactiveSecs = (Date.now() - lastClickTime.current) / 1000;
      setMetrics(prev => ({ ...prev, responseTime: inactiveSecs }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- REAL INTERVENTION DETECTION (BROWSER TAB SWITCH) ---
  useEffect(() => {
    if (config.mode === 'offline') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isPaused && !showIntervention) {
        console.log("Distracción Real: Usuario cambió de pestaña");
        triggerDistractionAttempt();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', trackClick);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', trackClick);
    };
  }, [config.mode, isPaused, showIntervention]);

  // Supabase Archetype Integration
  // Fallback to local user ID if auth context is missing (simpler integration)
  const { saveDetection, saveFeedback } = useArchetypeSupabase(null);

  const triggerDistractionAttempt = async () => {
    setIsPaused(true);
    const newAttemptCount = metrics.attemptCount + 1;

    setMetrics(prev => ({
      ...prev,
      attemptCount: newAttemptCount
    }));

    // === DETECCIÓN EN TIEMPO REAL (REQ. 2) ===
    const signals = {
      // Si la velocidad de click es alta -> Ansiedad/Miedo
      anxiety_level: metrics.clickSpeed > 3 ? 8 : 4,
      // Si el tiempo de respuesta es lento -> LowEnergy
      energy_level: metrics.responseTime > 10 ? 3 : 6,
      clarity: 'unclear' as const, // Asumimos confusión al distraerse
      recent_failures: newAttemptCount > 2
    };

    // Detectar y guardar en Supabase
    let archetypeType = 'Fear';
    try {
      const detection = detectArchetype(signals);
      await saveDetection(detection);
      archetypeType = detection.primary;
      console.log('[FOCUS] Distraction Archetype:', archetypeType);
    } catch (e) {
      console.warn('[FOCUS] Detection failed, using default', e);
    }

    // Log to store
    addIntervention({
      type: newAttemptCount <= 2 ? 'mild_toast' : 'full_intervention',
      domain: 'unknown',
      pattern: newAttemptCount > 5 ? 'compulsive' : newAttemptCount < 3 ? 'early_attempt' : 'moderate',
      userChoice: 'pending',
      successful: false
    });

    // First 2 attempts: Show gentle toast + send push nudge
    if (newAttemptCount <= 2) {
      setShowMildToast(true);

      // Send archetype-based push notification
      const interventions = getInterventionsForArchetype(archetypeType);
      if (interventions.length > 0) {
        sendInterventionNudge(interventions[0].id);
      }

      // Resume after 3 seconds
      setTimeout(() => {
        setIsPaused(false);
      }, 3000);
    } else {
      // 3+ attempts: Full intervention
      setShowIntervention(true);
    }
  };

  // --- SIMULATION TOOLS (FOR TESTING) ---
  const simulateState = (type: 'anxiety' | 'fatigue' | 'confusion') => {
    let newMetrics = { ...metrics, attemptCount: metrics.attemptCount + 1 };

    switch (type) {
      case 'anxiety':
        newMetrics.clickSpeed = 5; // High speed
        newMetrics.attemptCount = Math.max(3, newMetrics.attemptCount);
        break;
      case 'fatigue':
        newMetrics.responseTime = 15; // Slow response
        newMetrics.attemptCount = Math.max(3, newMetrics.attemptCount);
        break;
      case 'confusion':
        newMetrics.responseTime = 8;
        newMetrics.attemptCount = Math.max(4, newMetrics.attemptCount);
        break;
    }

    setMetrics(newMetrics);
    setIsPaused(true);
    setShowIntervention(true);
  };

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (isPaused) return;

    // Dynamic Status Updates
    const totalTime = config.durationMinutes * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    if (progress > 90) setStatusText("¡Casi terminas! 🚀");
    else if (progress > 50) setStatusText("Manteniendo el ritmo ⚡");
    else setStatusText("Enfoque Profundo 🧠");

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // End session and show feedback
          endSession();
          setShowFeedbackModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, config.durationMinutes]);

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((config.durationMinutes * 60 - timeLeft) / (config.durationMinutes * 60)) * 100;
  const strokeColor = config.mode === 'community' ? '#6366f1' : config.mode === 'offline' ? '#10b981' : '#0ea5e9';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">

      {/* MILD TOAST (First 2 attempts) */}
      <MildToast
        show={showMildToast}
        objective={config.taskName}
        attemptCount={metrics.attemptCount}
        onDismiss={() => setShowMildToast(false)}
      />

      {/* INTERVENTION OVERLAY */}
      <AnimatePresence>
        {showIntervention && (
          <InterventionContextual
            metrics={metrics}
            userGoal={config.taskName}
            onComplete={(success) => {
              setShowIntervention(false);
              setIsPaused(false);
              if (success) {
                setMetrics(prev => ({
                  ...prev,
                  lastInterventions: [...prev.lastInterventions, 'gentle_question']
                }));
              }
            }}
            onSkip={() => {
              setShowIntervention(false);
              setIsPaused(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Background Gradient */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${config.mode === 'offline' ? 'bg-slate-900' :
        config.mode === 'community' ? 'bg-indigo-950' : 'bg-brand-dark'
        }`} />

      {/* Ambient Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-secondary/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 w-full max-w-md glass-panel p-8 flex flex-col items-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          {config.mode === 'offline' && <WifiOff size={14} className="text-rose-400" />}
          {config.mode === 'community' && <Users size={14} className="text-indigo-400" />}
          {config.mode === 'digital' && <Laptop size={14} className="text-brand-primary" />}
          {config.mode === 'deep-work' && <Target size={14} className="text-purple-400" />}
          {config.mode === 'quick-review' && <Zap size={14} className="text-amber-400" />}
          {config.mode === 'assignment-flow' && <FileText size={14} className="text-emerald-400" />}
          <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
            {config.mode === 'deep-work' ? 'Trabajo Profundo' :
              config.mode === 'quick-review' ? 'Revisión Rápida' :
                config.mode === 'assignment-flow' ? 'Flujo de Entrega' :
                  config.mode === 'offline' ? 'Modo Desconexión' :
                    config.mode === 'community' ? 'Sala de Estudio' : 'Sesión Digital'}
          </span>
        </div>

        <h2 className="text-xl font-bold text-white text-center mb-1">{config.taskName}</h2>
        <p className="text-brand-primary text-sm font-medium mb-8 animate-pulse">{statusText}</p>

        {/* Timer Ring */}
        <div className="relative w-80 h-80 flex items-center justify-center mb-8">
          {/* Outer Glow Ring (Static) */}
          <div className="absolute inset-0 rounded-full border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]" />

          <svg className="w-full h-full -rotate-90 transform drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            {/* Track */}
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Progress */}
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke={strokeColor}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 140}
              strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
              style={{ filter: `drop-shadow(0 0 10px ${strokeColor})` }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={timeLeft}
              initial={{ scale: 0.98, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-8xl font-bold font-sans tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400"
            >
              {formatTime(timeLeft)}
            </motion.span>
            {config.mode === 'community' && (
              <div className="flex items-center gap-1 mt-4 text-xs text-indigo-200 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                {config.communityRoomName || "Sala de Estudio"}
              </div>
            )}
          </div>
        </div>

        {config.mode === 'offline' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-emerald-900/20 p-6 rounded-2xl border border-emerald-500/20 max-w-xs text-center backdrop-blur-sm"
          >
            <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wide mb-3">Modo Offline Activo</h3>
            <p className="text-sm text-emerald-100/80">
              Tu progreso se guardará al finalizar. Mantén el teléfono lejos.
            </p>
          </motion.div>
        )}

        {/* Controls */}
        <div className="w-full flex flex-col gap-4">
          {/* Panic Button */}
          <button
            onClick={() => onTriggerIntervention('manual')}
            className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-300 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            <AlertTriangle size={14} />
            <span>¡Siento que voy a fallar! (Botón de Pánico)</span>
          </button>

          {/* Binaural Beats Toggle */}
          <button
            onClick={() => {
              // Toggle logic would go here (e.g. play audio)
              // For MVP, we just toggle visual state or show a toast
              const audio = document.getElementById('binaural-audio') as HTMLAudioElement;
              if (audio) {
                if (audio.paused) audio.play();
                else audio.pause();
              }
            }}
            className="w-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-indigo-500/20 transition-colors cursor-pointer"
          >
            <span className="text-lg">🎧</span>
            <span>Activar Sonidos Binaurales (Alpha 10Hz)</span>
          </button>

          {/* Hidden Audio Element for Binaural Beats (Placeholder source) */}
          <audio id="binaural-audio" loop>
            <source src="https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg" type="audio/ogg" />
            {/* Using a generic ambient sound as placeholder since we don't have binaural assets hosted */}
          </audio>

          <div className="flex items-center justify-around w-full">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-5 rounded-full glass-button text-white hover:bg-white/10 transition-all active:scale-95"
            >
              {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
            </button>

            <button
              onClick={onComplete}
              className={`p-7 rounded-full text-white shadow-2xl transition-all hover:scale-105 active:scale-95 border-4 border-brand-dark ${config.mode === 'community' ? 'bg-brand-primary shadow-brand-primary/40' : config.mode === 'offline' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-brand-secondary shadow-brand-secondary/40'
                }`}
            >
              <CheckCircle size={36} />
            </button>

            <button
              onClick={onAbort}
              className="p-5 rounded-full glass-button text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95"
            >
              <Square size={20} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* TESTING TOOLS (Dev Only) */}
        <div className="mt-8 pt-6 border-t border-white/10 w-full">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <TestTube size={12} /> Panel de Pruebas (Simulación)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => simulateState('anxiety')} className="p-2 text-xs bg-amber-500/10 text-amber-400 rounded hover:bg-amber-500/20 border border-amber-500/20">
              😰 Ansiedad
            </button>
            <button onClick={() => simulateState('confusion')} className="p-2 text-xs bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20 border border-purple-500/20">
              🤔 Confusión
            </button>
            <button onClick={() => simulateState('fatigue')} className="p-2 text-xs bg-pink-500/10 text-pink-400 rounded hover:bg-pink-500/20 border border-pink-500/20">
              😴 Fatiga
            </button>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-600 font-mono">
            <span>Clicks/s: {metrics.clickSpeed.toFixed(1)}</span>
            <span>Resp: {metrics.responseTime.toFixed(1)}s</span>
            <span>Intentos: {metrics.attemptCount}</span>
          </div>
        </div>

      </motion.div>

      {/* POST SESSION FEEDBACK MODAL */}
      {showFeedbackModal && currentSession && (
        <PostSessionModal
          sessionData={{
            objective: currentSession.objective,
            elapsedMinutes: currentSession.elapsedMinutes,
            distractionsCount: currentSession.distractionsThisSession,
            toolsUsed: currentSession.interventions.map(i => i.type),
          }}
          onSubmit={(feedback) => {
            // Update last intervention with feedback
            const lastIntervention = currentSession.interventions[currentSession.interventions.length - 1];
            if (lastIntervention) {
              addFeedback(lastIntervention.id, {
                helpfulnessScore: feedback.helpfulnessScore,
                successful: feedback.didCompleteTask,
                timeWastedAfter: feedback.timeWastedAfter,
              });
            }
            setShowFeedbackModal(false);
            onComplete();
          }}
          onClose={() => {
            setShowFeedbackModal(false);
            onComplete();
          }}
        />
      )}
    </div>
  );
};

export default FocusSession;
