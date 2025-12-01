import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Pause, Play, CheckCircle, Sparkles, Smartphone, BookOpen, PenTool, Plus, Trash2, WifiOff, Box, Layers, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { FocusConfig } from '../types';

interface OfflineStudyProps {
  onBack: () => void;
  onComplete: () => void;
  config: FocusConfig;
}

interface OfflinePlan {
  source: 'ai' | 'local';
  distractionApp: string;
  materials: { id: string; name: string; checked: boolean }[];
  steps: string[];
}

const OfflineStudy: React.FC<OfflineStudyProps> = ({ onBack, onComplete, config }) => {
  const [phase, setPhase] = useState<'loading' | 'checklist' | 'running' | 'finished'>('loading');
  const [timeLeft, setTimeLeft] = useState(config.durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [plan, setPlan] = useState<OfflinePlan | null>(null);
  const [newMaterial, setNewMaterial] = useState("");

  // --- MÓDULO DE LÓGICA LOCAL (OFFLINE FALLBACK) ---
  const generateLocalPlan = (taskName: string): OfflinePlan => {
    const lowerTask = taskName.toLowerCase();
    let materials = ["Agua", "Cuaderno de notas"];
    let steps = ["Despeja tu mesa", "Abre el material en la página actual"];

    if (lowerTask.match(/mat|cálc|fís|num|álg/)) {
      materials = ["Calculadora", "Hojas para ejercicios", "Lápiz y Borrador", "Libro de texto"];
      steps = ["Revisa las fórmulas básicas", "Selecciona 3 problemas clave", "Resuelve sin mirar la solución"];
    } else if (lowerTask.match(/lee|lit|hist|fil|biol/)) {
      materials = ["Resaltadores", "Fichas de lectura", "Libro/Kindle"];
      steps = ["Lee los títulos y subtítulos primero", "Haz una lectura rápida de 5 min", "Resalta solo ideas clave"];
    } else if (lowerTask.match(/prog|cod|dev/)) {
      materials = ["Papel para diagramar", "Laptops (Solo IDE abierto)"];
      steps = ["Dibuja la lógica en papel", "Define entradas y salidas", "Escribe pseudocódigo"];
    }

    return {
      source: 'local',
      distractionApp: "Redes Sociales",
      materials: materials.map((m, i) => ({ id: i.toString(), name: m, checked: false })),
      steps: ["Cierra todas las apps de fondo", ...steps]
    };
  };

  // --- GENERACIÓN DEL PLAN ---
  useEffect(() => {
    const generatePlan = async () => {
      // 1. Intentar Módulo Local si no hay conexión
      if (!navigator.onLine) {
        console.log("Modo Offline detectado: Usando módulo local");
        setPlan(generateLocalPlan(config.taskName));
        setPhase('checklist');
        return;
      }

      // 2. Intentar Gemini (Online)
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
          User wants to study "${config.taskName}" offline.
          Generate a JSON plan.
          1. "materials": List 3-5 physical items needed.
          2. "steps": 3 concrete steps for deep work.
          3. "distractionApp": Name one app to close (e.g. Instagram, TikTok).
          JSON Schema: { "distractionApp": string, "materials": string[], "steps": string[] }
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const json = JSON.parse(response.text);
        setPlan({
          source: 'ai',
          distractionApp: json.distractionApp || "Celular",
          materials: json.materials.map((m: string, i: number) => ({ id: i.toString(), name: m, checked: false })),
          steps: json.steps || ["Prepárate", "Enfócate"]
        });
        setPhase('checklist');

      } catch (error) {
        console.error("Error IA, usando fallback local", error);
        setPlan(generateLocalPlan(config.taskName));
        setPhase('checklist');
      }
    };

    generatePlan();
  }, [config.taskName]);

  // --- LOGICA DEL CRONÓMETRO ---
  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && phase === 'running') {
      setIsActive(false);
      setPhase('finished');
      if (Notification.permission === 'granted') {
        new Notification("Sesión Finalizada", { body: "¡Buen trabajo offline!" });
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, phase]);

  const toggleMaterial = (id: string) => {
    if (!plan) return;
    const updatedMaterials = plan.materials.map(m => 
      m.id === id ? { ...m, checked: !m.checked } : m
    );
    setPlan({ ...plan, materials: updatedMaterials });
  };

  const addMaterial = () => {
    if (!newMaterial.trim() || !plan) return;
    const newItem = { id: Date.now().toString(), name: newMaterial, checked: true };
    setPlan({ ...plan, materials: [...plan.materials, newItem] });
    setNewMaterial("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress for check circle
  const checklistProgress = plan ? (plan.materials.filter(m => m.checked).length / plan.materials.length) * 100 : 0;

  return (
    <motion.div 
      className="absolute inset-0 bg-slate-50 z-50 flex flex-col overflow-hidden"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
    >
      {/* Header - Fixed */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b border-slate-200 shadow-sm shrink-0 z-20">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
            <h1 className="font-bold text-lg text-slate-800 leading-none">Modo Sin Pantalla</h1>
            <p className="text-xs text-brand-teal font-bold mt-1 uppercase tracking-wide truncate max-w-[200px]">{config.taskName}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 relative bg-slate-50">
        
        {/* FASE 1: CARGANDO */}
        {phase === 'loading' && (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400 animate-pulse">
                <Sparkles size={64} className="mb-6 text-brand-teal" />
                <p className="text-lg font-medium text-slate-600">Configurando entorno...</p>
                <p className="text-sm mt-2 text-slate-400">Consultando materiales óptimos</p>
            </div>
        )}

        {/* FASE 2: CHECKLIST DE MATERIALES */}
        {phase === 'checklist' && plan && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Layers size={100} className="text-brand-teal"/>
                    </div>
                    <h2 className="font-bold text-slate-800 text-xl mb-2 relative z-10">Preparación</h2>
                    <p className="text-sm text-slate-500 relative z-10 leading-relaxed">
                        Reúne estos materiales antes de guardar el dispositivo.
                    </p>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4 px-1">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Lista de Vuelo</span>
                        {plan.source === 'ai' && (
                             <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1 font-bold">
                                <Sparkles size={10}/> IA
                             </span>
                        )}
                    </div>

                    <div className="grid gap-3">
                        {plan.materials.map((mat) => (
                            <motion.button 
                                key={mat.id} 
                                whileTap={{ scale: 0.98 }}
                                onClick={() => toggleMaterial(mat.id)}
                                className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all shadow-sm ${
                                    mat.checked 
                                    ? 'bg-emerald-50 border-emerald-500/20 shadow-none' 
                                    : 'bg-white border-slate-100 hover:border-brand-teal/50'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors shrink-0 ${
                                    mat.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                                }`}>
                                    {mat.checked && <CheckCircle size={18} strokeWidth={3} />}
                                </div>
                                <span className={`text-base font-medium ${mat.checked ? 'text-emerald-800 line-through opacity-60' : 'text-slate-700'}`}>
                                    {mat.name}
                                </span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Add Custom Material */}
                    <div className="flex gap-2 mt-4">
                        <input 
                            value={newMaterial}
                            onChange={(e) => setNewMaterial(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addMaterial()}
                            placeholder="+ Agregar otro item..."
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm outline-none focus:border-brand-teal shadow-sm"
                        />
                        <button 
                            onClick={addMaterial}
                            disabled={!newMaterial.trim()}
                            className="bg-slate-800 text-white w-14 rounded-xl disabled:opacity-50 flex items-center justify-center shadow-sm hover:bg-slate-700 active:scale-95 transition-all"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>
            </motion.div>
        )}

        {/* FASE 3: SESIÓN ACTIVA (RUNNING) */}
        {(phase === 'running' || phase === 'finished') && plan && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 h-full">
                 {/* Context Awareness Card */}
                 <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-3xl flex items-center gap-5">
                    <div className="bg-rose-200/50 p-3 rounded-2xl text-rose-600 shrink-0">
                        <Smartphone size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-rose-800 text-sm uppercase tracking-wide mb-1">Acción Requerida</h3>
                        <p className="text-base font-medium text-rose-900 leading-snug">
                            Cierra <strong>{plan.distractionApp}</strong>. Deja el móvil lejos.
                        </p>
                    </div>
                </div>

                 {/* Timer Box */}
                 <div className="bg-slate-900 rounded-[2.5rem] p-8 text-center shadow-2xl shadow-slate-900/20 relative overflow-hidden border border-slate-800">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
                        <div 
                            className="h-full bg-brand-teal transition-all duration-1000"
                            style={{ width: `${(timeLeft / (config.durationMinutes * 60)) * 100}%` }} 
                        />
                    </div>
                    {isActive && (
                         <div className="absolute top-6 right-6 flex gap-1.5 items-center bg-slate-800/50 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">En foco</span>
                        </div>
                    )}
                    
                    <div className="mt-8 mb-2">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">Tiempo Restante</div>
                        <div className="text-7xl font-mono font-bold text-white tracking-tighter tabular-nums">
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                    
                    <p className="text-sm font-medium text-slate-400 mt-4 opacity-80">
                        {isActive ? "No toques la pantalla" : "⏸️ Sesión Pausada"}
                    </p>
                </div>

                {/* Steps List */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-6 flex items-center gap-2">
                        <Layers size={14}/> Instrucciones de Vuelo
                    </h3>
                    <div className="space-y-6">
                        {plan.steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-teal border border-brand-100 flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                                    {i + 1}
                                </div>
                                <p className="text-base text-slate-700 font-medium leading-snug mt-1">
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        )}
      </div>

      {/* Fixed Footer Actions - ALWAYS VISIBLE */}
      <div className="absolute bottom-0 left-0 right-0 bg-white p-5 border-t border-slate-100 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {phase === 'checklist' && (
             <button 
                onClick={() => { setPhase('running'); setIsActive(true); }}
                disabled={checklistProgress < 50} // Require at least some checked
                className="w-full bg-brand-teal text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-teal/20 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 disabled:shadow-none"
            >
                {checklistProgress < 100 ? "Confirmar Materiales" : "¡Todo Listo! Iniciar 🚀"}
            </button>
        )}

        {(phase === 'running' || phase === 'finished') && (
            phase === 'finished' ? (
                 <button 
                    onClick={onComplete}
                    className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors animate-pulse text-lg"
                >
                    <CheckCircle size={24} /> Guardar Progreso
                </button>
            ) : (
                <div className="flex gap-4">
                    <button 
                        onClick={() => setIsActive(!isActive)}
                        className={`flex-1 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-98 transition-all ${
                            isActive 
                            ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                            : 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20'
                        }`}
                    >
                        {isActive ? <><Pause size={24} fill="currentColor" /> Pausar</> : <><Play size={24} fill="currentColor" /> Reanudar</>}
                    </button>
                    <button 
                        onClick={onComplete} 
                        className="px-6 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 hover:border-slate-200 transition-colors text-sm"
                    >
                        Finalizar
                    </button>
                </div>
            )
        )}
      </div>
    </motion.div>
  );
};

export default OfflineStudy;