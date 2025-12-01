import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wind, Users, Calendar, Bell, X as XIcon, Camera, Twitter, Lock, CheckCircle2, Clock, ChevronRight, ScanLine } from 'lucide-react';
import { AppView, POINTS } from '../types';

interface AlternativesProps {
  onBack: () => void;
  onNavigate: (view: AppView) => void;
  attempts: number;
  onUpdateAttempts: (attempts: number) => void;
  onReward: (points: number) => void;
  onScheduleNotification: (title: string, body: string, delayMs: number) => void;
}

const Alternatives: React.FC<AlternativesProps> = ({ onBack, onNavigate, attempts, onUpdateAttempts, onReward, onScheduleNotification }) => {
  const [pressure, setPressure] = useState(0);
  const [showTikTokModal, setShowTikTokModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showXModal, setShowXModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPressure(prev => Math.min(prev + 1, 100));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTikTokClick = () => {
    if (attempts >= 2) {
      setShowBlockModal(true);
    } else {
      setShowTikTokModal(true);
    }
  };

  const handleStartChallenge = () => {
    setShowTikTokModal(false);
    setShowCameraModal(true);
  };

  const handleVerify = () => {
    setShowCameraModal(false);
    setShowXModal(true);
    onUpdateAttempts(attempts + 1);
  };

  const handlePostToX = () => {
    setShowXModal(false);
    // In a real app, this would call the Twitter API
    setTimeout(() => {
      alert("¡Publicado en X! Gracias por inspirar a otros.");
      onReward(POINTS.SHARE_X);
    }, 500);
  };

  const handleSetReminder = (timeStr: string) => {
    setShowReminderModal(false);
    onScheduleNotification("Recordatorio de Enfoque", `Es hora de retomar tu sesión de estudio (${timeStr}).`, 5000); // Demo 5s delay
    alert(`✅ Recordatorio establecido para: ${timeStr}.\nTe enviaremos una notificación.`);
    onBack(); // Go back to dashboard
  };

  return (
    <motion.div
      className="absolute inset-0 bg-slate-50 z-30 flex flex-col overflow-hidden"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
    >
      <div className="bg-white p-4 flex items-center gap-4 border-b border-slate-100 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg text-slate-800">Modo 3: Procrastinación Activa</h1>
      </div>

      <div className="p-6 flex-1 overflow-y-auto flex flex-col pb-24">
        {/* Mode 3: Rescue Message */}
        <div className="bg-blue-50 border-l-4 border-brand-teal p-4 rounded-r-lg mb-6 text-sm leading-relaxed text-slate-700">
          <strong>🤖 IA Rescate:</strong> Llevas más de 10 minutos fuera de foco. Sé que es difícil, pero cada minuto te aleja de tu meta. ¿Aceptas un reto para salir de este bucle?
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-8 text-xs text-amber-900">
          <div className="font-bold mb-1">⏰ Presión visible: {pressure}%</div>
          La fuerza de voluntad está fallando. Necesitamos activar el cuerpo.
        </div>

        <div className="grid grid-cols-2 gap-4 mb-auto">
          <ToolBtn icon={<Wind />} label="Respirar" color="border-amber-400 text-amber-600" onClick={() => onNavigate(AppView.BREATHING)} />
          <ToolBtn icon={<Users />} label="Sala Enfoque" color="border-green-500 text-green-600" onClick={() => onNavigate(AppView.COMMUNITY)} />
          <ToolBtn icon={<Calendar />} label="Plan IA" color="border-blue-400 text-blue-600" onClick={() => setShowPlanModal(true)} />
          <ToolBtn icon={<Bell />} label="Recordar" color="border-rose-400 text-rose-600" onClick={() => setShowReminderModal(true)} />
        </div>

        <button
          onClick={handleTikTokClick}
          className="w-full bg-amber-100 text-amber-800 py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-6 active:bg-amber-200 transition-colors shadow-lg shadow-amber-100"
        >
          <XIcon size={20} /> Insistir en Distracción
        </button>
        <p className="text-center text-xs text-slate-400 mt-2">Esto activará el reto físico o bloqueo</p>

      </div>

      {/* TikTok Challenge Modal (The "Cost" of distraction) */}
      <AnimatePresence>
        {showTikTokModal && (
          <Modal onClose={() => setShowTikTokModal(false)}>
            <div className="text-center">
              <div className="text-4xl mb-4">💪</div>
              <h2 className="text-xl font-bold text-amber-600 mb-2">El Coste Real</h2>
              <p className="text-sm text-slate-600 mb-4">
                Para seguir procrastinando, debes pagar un precio físico.<br />
                Completa <strong>10 flexiones</strong> ahora.
              </p>
              <div className="text-xs text-slate-400 mb-6">Oportunidades hoy: {2 - attempts}/2</div>
              <div className="space-y-3">
                <button onClick={handleStartChallenge} className="w-full bg-brand-teal text-white py-3 rounded-lg font-bold shadow-lg">💪 Acepto el Reto</button>
                <button onClick={() => { setShowTikTokModal(false); onReward(POINTS.RETURN_FROM_INTERVENTION); }} className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-medium">📚 Mejor vuelvo a estudiar (+{POINTS.RETURN_FROM_INTERVENTION}pts)</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Camera Verification Modal */}
      <AnimatePresence>
        {showCameraModal && (
          <Modal onClose={() => setShowCameraModal(false)}>
            <div className="text-center">
              <div className="text-4xl mb-4 text-brand-teal animate-pulse">📷</div>
              <h2 className="text-xl font-bold text-brand-teal mb-2">Verificación Activa</h2>
              <p className="text-sm text-slate-600 mb-4">Realiza las flexiones frente a la cámara.</p>

              <div className="w-full h-48 bg-slate-900 rounded-xl mb-4 flex items-center justify-center text-slate-500 flex-col gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/20 to-transparent h-full w-full animate-scan" style={{ animationDuration: '2s', animationIterationCount: 'infinite', animationName: 'scan' }} />
                <ScanLine size={32} className="text-green-400" />
                <span className="text-xs font-mono text-green-400">DETECTANDO MOVIMIENTO...</span>
              </div>

              <div className="space-y-3">
                <button onClick={handleVerify} className="w-full bg-green-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-green-500/30">✅ Completado (Simular)</button>
                <button onClick={() => setShowCameraModal(false)} className="w-full text-slate-400 py-2 text-sm">Cancelar</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* X Post Modal */}
      <AnimatePresence>
        {showXModal && (
          <Modal onClose={() => setShowXModal(false)}>
            <div className="text-center">
              <div className="text-4xl mb-4 text-sky-500">🐦</div>
              <h2 className="text-xl font-bold text-sky-600 mb-2">Comparte tu logro</h2>
              <p className="text-sm text-slate-600 mb-4">Comparte en X que estás superando la procrastinación.</p>

              <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-sky-500 text-left text-sm text-slate-700 italic mb-6">
                "Acabo de completar el desafío anti-procrastinación de @AlterFocus 💪 #Enfoque"
              </div>

              <div className="space-y-3">
                <button onClick={handlePostToX} className="w-full bg-sky-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"><Twitter size={18} fill="currentColor" /> Publicar en X</button>
                <button onClick={() => setShowXModal(false)} className="w-full text-slate-400 py-2 text-sm">Saltar</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Block Modal */}
      <AnimatePresence>
        {showBlockModal && (
          <Modal onClose={() => setShowBlockModal(false)}>
            <div className="text-center">
              <div className="text-4xl mb-4 text-rose-500">🚫</div>
              <h2 className="text-xl font-bold text-rose-600 mb-2">Aplicación Bloqueada</h2>
              <p className="text-sm text-slate-600 mb-4">Has agotado tus oportunidades por hoy (Bloqueo suave 4h).</p>
              <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 mb-6">🤖 IA: Veo que te cuesta. Usa una herramienta de reenfoque.</div>
              <button onClick={() => { setShowBlockModal(false); onReward(POINTS.REDIRECT_FROM_BLOCK); onNavigate(AppView.STUDY_PANEL); }} className="w-full bg-brand-teal text-white py-3 rounded-lg font-bold">📚 Ir al Panel</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Plan IA Modal */}
      <AnimatePresence>
        {showPlanModal && (
          <Modal onClose={() => setShowPlanModal(false)}>
            <div className="text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Calendar size={18} /></div>
                <h2 className="text-xl font-bold text-slate-800">Plan IA: Cálculo</h2>
              </div>

              <div className="space-y-3 mb-6">
                <PlanStep status="completed" title="Derivadas Básicas" desc="Completado ayer" />
                <PlanStep status="current" title="Integrales Indefinidas" desc="Meta de hoy: 8/12 ejercicios" />
                <PlanStep status="locked" title="Método de Sustitución" desc="Bloqueado hasta completar anterior" />
                <PlanStep status="locked" title="Aplicaciones" desc="Semana próxima" />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 mb-4 flex gap-2">
                <Users size={14} className="flex-shrink-0 mt-0.5" />
                <span>IA: Te recomiendo unirte a la sala de "Cálculo Integral" para este tema.</span>
              </div>

              <button onClick={() => setShowPlanModal(false)} className="w-full bg-brand-teal text-white py-3 rounded-lg font-bold">Entendido</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Reminder Modal */}
      <AnimatePresence>
        {showReminderModal && (
          <Modal onClose={() => setShowReminderModal(false)}>
            <div className="text-center">
              <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Agendar Re-enfoque</h2>
              <p className="text-sm text-slate-500 mb-6">¿Cuándo quieres intentar estudiar de nuevo?</p>

              <div className="space-y-3">
                <button onClick={() => handleSetReminder("30 minutos")} className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium flex justify-between px-4 items-center">
                  <span>En 30 minutos</span>
                  <span className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded">Recomendado</span>
                </button>
                <button onClick={() => handleSetReminder("1 hora")} className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium flex justify-between px-4 items-center">
                  <span>En 1 hora</span>
                </button>
                <button onClick={() => handleSetReminder("Mañana a las 9:00 AM")} className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium flex justify-between px-4 items-center">
                  <span>Mañana 9:00 AM</span>
                </button>
              </div>

              <button onClick={() => setShowReminderModal(false)} className="mt-4 text-slate-400 text-sm">Cancelar</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PlanStep = ({ status, title, desc }: any) => {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';

  return (
    <div className={`flex gap-3 p-3 rounded-xl border ${isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'} ${status === 'locked' ? 'opacity-60' : ''}`}>
      <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center border ${isCompleted ? 'bg-green-500 border-green-500 text-white' : isCurrent ? 'border-blue-500 text-blue-500' : 'border-slate-300 text-slate-300'}`}>
        {isCompleted ? <CheckCircle2 size={12} /> : isCurrent ? <div className="w-2 h-2 bg-blue-500 rounded-full" /> : <Lock size={12} />}
      </div>
      <div>
        <h4 className={`text-sm font-bold ${isCurrent ? 'text-blue-700' : 'text-slate-700'}`}>{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
};

const ToolBtn = ({ icon, label, color, onClick }: any) => (
  <button onClick={onClick} className={`bg-white p-4 rounded-xl border-2 ${color} flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:shadow-md`}>
    {icon}
    <span className="font-bold text-xs uppercase">{label}</span>
  </button>
);

const Modal = ({ children, onClose }: any) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
      className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
        <XIcon size={20} />
      </button>
      {children}
    </motion.div>
  </motion.div>
);

export default Alternatives;