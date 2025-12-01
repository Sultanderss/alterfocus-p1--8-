import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Zap, Brain, CheckCircle2 } from 'lucide-react';

interface BreathingProps {
  onComplete: () => void;
}

type BreathingMode = 'relax' | 'focus' | 'awake';

const MODES = {
  relax: {
    id: 'relax',
    label: "Calmar Ansiedad",
    desc: "Técnica 4-7-8 para bajar cortisol",
    color: "#818cf8", // Indigo
    bgGradient: "from-slate-900 to-indigo-950",
    phases: [
      { name: "Inhala", duration: 4 },
      { name: "Sostén", duration: 7 },
      { name: "Exhala", duration: 8 }
    ],
    totalDuration: 180 // 3 minutes default
  },
  focus: {
    id: 'focus',
    label: "Recuperar Enfoque",
    desc: "Respiración de caja (Box Breathing)",
    color: "#2dd4bf", // Teal
    bgGradient: "from-slate-900 to-teal-950",
    phases: [
      { name: "Inhala", duration: 4 },
      { name: "Sostén", duration: 4 },
      { name: "Exhala", duration: 4 },
      { name: "Espera", duration: 4 }
    ],
    totalDuration: 180
  },
  awake: {
    id: 'awake',
    label: "Energía Rápida",
    desc: "Hiperventilación controlada",
    color: "#fb923c", // Orange
    bgGradient: "from-slate-900 to-orange-950",
    phases: [
      { name: "Inhala Profundo", duration: 2 },
      { name: "Suelta", duration: 2 }
    ],
    totalDuration: 120 // 2 minutes
  }
};

const Breathing: React.FC<BreathingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'intro' | 'preparing' | 'active' | 'finished'>('intro');
  const [selectedMode, setSelectedMode] = useState<BreathingMode>('relax');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  // --- LOGIC ---
  
  const startSession = (mode: BreathingMode) => {
    setSelectedMode(mode);
    setStep('preparing');
    setTimeout(() => {
      setStep('active');
      setPhaseIndex(0);
      setPhaseTimeLeft(MODES[mode].phases[0].duration);
    }, 3000); // 3s prep time
  };

  useEffect(() => {
    if (step !== 'active') return;

    const currentModeConfig = MODES[selectedMode];
    
    const timer = setInterval(() => {
      // Update Phase Timer
      setPhaseTimeLeft((prev) => {
        if (prev <= 0.1) {
          const nextPhaseIndex = (phaseIndex + 1) % currentModeConfig.phases.length;
          setPhaseIndex(nextPhaseIndex);
          if (nextPhaseIndex === 0) setCycleCount(c => c + 1);
          return currentModeConfig.phases[nextPhaseIndex].duration;
        }
        return prev - 0.1;
      });

      // Update Total Progress
      setTotalElapsed(prev => {
          if (prev >= currentModeConfig.totalDuration) {
              // Auto finish if we want strict limits, or just let it loop. 
              // Let's keep looping but show full bar.
              return prev;
          }
          return prev + 0.1;
      });

    }, 100);

    return () => clearInterval(timer);
  }, [step, phaseIndex, selectedMode]);

  const handleFinish = () => {
    setStep('finished');
  };

  const currentPhase = MODES[selectedMode].phases[phaseIndex];
  const isExpanding = currentPhase.name.includes("Inhala");
  const isHolding = currentPhase.name.includes("Sostén") || currentPhase.name.includes("Espera");

  // Calculate Total Progress Percentage
  const totalProgress = Math.min(100, (totalElapsed / MODES[selectedMode].totalDuration) * 100);

  return (
    <motion.div 
      className={`absolute inset-0 z-50 flex flex-col overflow-hidden bg-gradient-to-br ${MODES[selectedMode].bgGradient} text-white transition-colors duration-1000`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* --- BACKGROUND AMBIENCE (Endel Style) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <motion.div 
            animate={{ 
              x: [0, 50, -50, 0], 
              y: [0, -50, 50, 0],
              scale: [1, 1.2, 1] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px]"
         />
         <motion.div 
            animate={{ 
              x: [0, -30, 30, 0], 
              y: [0, 30, -30, 0],
              scale: [1, 1.3, 1] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-[80px]"
         />
      </div>

      {/* --- STEP 1: INTRO / SELECTION --- */}
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-8 relative z-10"
          >
            <h2 className="text-3xl font-light mb-2 text-center tracking-tight">Sintoniza tu mente</h2>
            <p className="text-white/50 text-center mb-12 text-sm">Selecciona el ritmo que necesitas ahora</p>

            <div className="grid gap-4 w-full max-w-xs">
              <ModeButton 
                mode={MODES.relax} 
                icon={<Wind />} 
                onClick={() => startSession('relax')} 
              />
              <ModeButton 
                mode={MODES.focus} 
                icon={<Brain />} 
                onClick={() => startSession('focus')} 
              />
              <ModeButton 
                mode={MODES.awake} 
                icon={<Zap />} 
                onClick={() => startSession('awake')} 
              />
            </div>
            
            <button onClick={onComplete} className="mt-12 text-white/40 text-sm hover:text-white transition-colors">
                Cancelar
            </button>
          </motion.div>
        )}

        {/* --- STEP 2: PREPARING --- */}
        {step === 'preparing' && (
          <motion.div 
            key="preparing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center relative z-10"
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3 }}
              className="text-xl font-light tracking-widest text-white/80"
            >
              Encuentra una postura cómoda...
            </motion.div>
          </motion.div>
        )}

        {/* --- STEP 3: ACTIVE SESSION --- */}
        {step === 'active' && (
          <motion.div 
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center relative z-10 w-full"
          >
            {/* Organic Blob Animation - CENTERED */}
            <div className="relative flex-1 w-full flex items-center justify-center">
               {/* Outer Glow Layer */}
               <motion.div
                  className="absolute rounded-[40%_60%_70%_30%/40%_50%_60%_50%] opacity-20 blur-xl"
                  style={{ 
                      backgroundColor: MODES[selectedMode].color,
                      width: '300px',
                      height: '300px'
                  }}
                  animate={{
                    scale: isExpanding ? 1.4 : isHolding ? 1.3 : 0.8,
                    rotate: 180
                  }}
                  transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
               />
               
               {/* Core Shape Layer */}
               <motion.div
                  className="rounded-[50%_50%_50%_50%/50%_50%_50%_50%] backdrop-blur-sm shadow-2xl flex items-center justify-center"
                  style={{ 
                    backgroundColor: `${MODES[selectedMode].color}40`, // 40% opacity
                    border: `1px solid ${MODES[selectedMode].color}80`,
                    width: '200px',
                    height: '200px'
                  }}
                  animate={{
                    scale: isExpanding ? 1.5 : isHolding ? 1.5 : 1,
                    borderRadius: isExpanding 
                      ? ["50% 50% 50% 50%", "60% 40% 30% 70%"] 
                      : ["60% 40% 30% 70%", "50% 50% 50% 50%"]
                  }}
                  transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
               >
               </motion.div>

               {/* Instruction Text - OVERLAYED ON CENTER */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.h3 
                    key={currentPhase.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-3xl font-bold tracking-widest uppercase text-white/90 drop-shadow-lg"
                  >
                    {currentPhase.name}
                  </motion.h3>
               </div>
            </div>

            {/* Bottom Controls Area */}
            <div className="w-full pb-12 px-8 flex flex-col items-center gap-6">
                 {/* Subtle Progress Bar */}
                <div className="w-full max-w-xs h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-white/50"
                        animate={{ width: `${totalProgress}%` }}
                        transition={{ ease: "linear", duration: 0.1 }}
                    />
                </div>

                <button 
                    onClick={handleFinish}
                    className="px-8 py-3 rounded-full border border-white/20 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/40 transition-all text-sm font-medium tracking-wide"
                >
                    Terminar Sesión
                </button>
            </div>
          </motion.div>
        )}

        {/* --- STEP 4: FINISHED --- */}
        {step === 'finished' && (
           <motion.div 
            key="finished"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8 relative z-10"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 text-white"
            >
               <CheckCircle2 size={40} />
            </motion.div>
            
            <h2 className="text-3xl font-light mb-2">Sesión Completada</h2>
            <p className="text-white/60 mb-12 text-center max-w-xs">
              Has dedicado un momento para ti. Tu sistema nervioso te lo agradece.
            </p>

            <div className="flex items-center gap-4 text-sm text-white/50 mb-12 bg-white/5 px-6 py-3 rounded-full">
               <span>{cycleCount} Ciclos</span>
               <span className="w-1 h-1 bg-white/30 rounded-full"></span>
               <span>{Math.floor(totalElapsed / 60)} min</span>
            </div>

            <button 
              onClick={onComplete}
              className="w-full max-w-xs bg-white text-slate-900 py-4 rounded-xl font-bold text-lg shadow-lg shadow-white/10 hover:bg-slate-100 transition-colors"
            >
              Volver al Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ModeButton = ({ mode, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className="group flex items-center gap-4 p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all active:scale-95 text-left"
  >
    <div 
      className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
      style={{ backgroundColor: `${mode.color}20`, color: mode.color }}
    >
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-base text-white/90 group-hover:text-white transition-colors">{mode.label}</h3>
      <p className="text-xs text-white/50 font-light">{mode.desc}</p>
    </div>
  </button>
);

export default Breathing;