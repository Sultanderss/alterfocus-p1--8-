import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, Zap, ArrowRight, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: <Activity size={48} strokeWidth={1} />,
    title: "Ciencia,\nNo Culpa",
    desc: "La procrastinación es emocional, no pereza. Intervenimos con empatía en el momento exacto."
  },
  {
    icon: <Brain size={48} strokeWidth={1} />,
    title: "Tu Cerebro,\nHackeado",
    desc: "Usamos dopamina positiva y retos cognitivos para romper el bucle de distracción."
  },
  {
    icon: <Zap size={48} strokeWidth={1} />,
    title: "Enfoque\nInmersivo",
    desc: "Desde modos sin conexión hasta salas de estudio. Tú eliges cómo proteger tu atención."
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div 
      className="absolute inset-0 z-40 flex flex-col justify-between p-8 bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
    >
      {/* Progress Bar */}
      <div className="flex gap-2 pt-4">
        {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-white' : 'bg-white/10'}`} />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-teal backdrop-blur-md">
              {steps[step].icon}
            </div>
            
            <h2 className="text-4xl font-light text-white leading-tight tracking-tight whitespace-pre-line">
                {steps[step].title}
            </h2>
            
            <p className="text-lg text-slate-400 font-light leading-relaxed max-w-xs">
                {steps[step].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Area */}
      <div className="pb-8">
        <button 
          onClick={handleNext}
          className="w-full group flex items-center justify-between bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white py-5 px-6 rounded-3xl transition-all active:scale-98"
        >
          <span className="text-lg font-medium tracking-wide">
            {step === steps.length - 1 ? 'Empezar' : 'Continuar'}
          </span>
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowRight size={20} />
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export default Onboarding;