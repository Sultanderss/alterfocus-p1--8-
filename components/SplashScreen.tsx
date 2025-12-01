import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)', transition: { duration: 0.8 } }}
      className="absolute inset-0 flex flex-col items-center justify-center text-white z-50 bg-transparent"
    >
      {/* Breathing Logo Animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.05, 1], opacity: 1 }}
        transition={{ 
           scale: { repeat: Infinity, duration: 4, ease: "easeInOut" },
           opacity: { duration: 1 }
        }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-brand-teal/20 blur-[60px] rounded-full" />
        <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center relative z-10 shadow-2xl">
             <Brain size={40} strokeWidth={1} className="text-white/90" />
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-center"
      >
        <h1 className="text-2xl font-light tracking-[0.3em] uppercase text-white/90">AlterFocus</h1>
        <p className="text-[10px] font-medium text-white/40 mt-3 tracking-widest uppercase">Sin culpa. Solo ciencia.</p>
      </motion.div>
    </motion.div>
  );
}