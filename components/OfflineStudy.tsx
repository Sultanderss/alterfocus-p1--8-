import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, Sparkles, WifiOff, Package, Coffee,
  Plus, Check, ChevronRight, Smartphone, Timer, Zap, BookOpen
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { FocusConfig, AppView } from '../types';

interface OfflineStudyProps {
  onBack: () => void;
  onComplete: () => void;
  config: FocusConfig;
  onNavigate?: (view: AppView) => void;
}

interface OfflinePlan {
  source: 'ai' | 'local';
  materials: { id: string; name: string; checked: boolean; icon?: string }[];
  environment: string[];
}

/**
 * OFFLINE STUDY - Modo Sin Pantalla (SIMPLIFICADO)
 * 
 * Propósito: SOLO preparación para estudiar sin dispositivos.
 * - Lista de materiales físicos
 * - Tips de ambiente
 * - Al completar → elige ir a Focus Session o Flip Phone
 * 
 * SIN timer propio (eso está en Focus Session y Flip Phone)
 */
const OfflineStudy: React.FC<OfflineStudyProps> = ({ onBack, onComplete, config, onNavigate }) => {
  const [phase, setPhase] = useState<'loading' | 'checklist' | 'ready'>('loading');
  const [plan, setPlan] = useState<OfflinePlan | null>(null);
  const [newMaterial, setNewMaterial] = useState("");

  // --- MÓDULO DE LÓGICA LOCAL ---
  const generateLocalPlan = (taskName: string): OfflinePlan => {
    const lowerTask = taskName.toLowerCase();
    let materials: OfflinePlan['materials'] = [];
    let environment: string[] = [];

    if (lowerTask.match(/mat|cálc|fís|num|álg/)) {
      materials = [
        { id: '1', name: 'Calculadora científica', checked: false, icon: '🧮' },
        { id: '2', name: 'Hojas cuadriculadas', checked: false, icon: '📄' },
        { id: '3', name: 'Lápiz y borrador', checked: false, icon: '✏️' },
        { id: '4', name: 'Libro de texto', checked: false, icon: '📚' }
      ];
      environment = ["Escritorio despejado", "Buena iluminación", "Agua a la mano"];
    } else if (lowerTask.match(/lee|lit|hist|fil|biol/)) {
      materials = [
        { id: '1', name: 'Resaltadores', checked: false, icon: '🖍️' },
        { id: '2', name: 'Fichas de notas', checked: false, icon: '🗂️' },
        { id: '3', name: 'Libro/Material impreso', checked: false, icon: '📖' }
      ];
      environment = ["Lugar silencioso", "Posición cómoda", "Sin distracciones visuales"];
    } else if (lowerTask.match(/prog|cod|dev/)) {
      materials = [
        { id: '1', name: 'Papel para diagramas', checked: false, icon: '📝' },
        { id: '2', name: 'Marcadores de colores', checked: false, icon: '🖊️' }
      ];
      environment = ["Pizarra o espacio grande", "Música instrumental (opcional)"];
    } else {
      materials = [
        { id: '1', name: 'Cuaderno de notas', checked: false, icon: '📓' },
        { id: '2', name: 'Bolígrafo', checked: false, icon: '🖊️' },
        { id: '3', name: 'Material de estudio', checked: false, icon: '📚' }
      ];
      environment = ["Espacio ordenado", "Agua o té", "Silencio o música suave"];
    }

    return { source: 'local', materials, environment };
  };

  // --- GENERACIÓN DEL PLAN ---
  useEffect(() => {
    const generatePlan = async () => {
      if (!navigator.onLine) {
        setPlan(generateLocalPlan(config.taskName));
        setPhase('checklist');
        return;
      }

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
                    User wants to study "${config.taskName}" offline (without screens).
                    Generate a JSON plan with:
                    1. "materials": List of 3-5 physical items needed (each with "name" and "icon" emoji)
                    2. "environment": 2-3 tips to optimize the study space
                    JSON Schema: { "materials": [{"name": string, "icon": string}], "environment": string[] }
                `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const json = JSON.parse(response.text);
        setPlan({
          source: 'ai',
          materials: json.materials.map((m: any, i: number) => ({
            id: i.toString(),
            name: m.name || m,
            checked: false,
            icon: m.icon || '📦'
          })),
          environment: json.environment || ["Espacio limpio"]
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

  const toggleMaterial = (id: string) => {
    if (!plan) return;
    const updatedMaterials = plan.materials.map(m =>
      m.id === id ? { ...m, checked: !m.checked } : m
    );
    setPlan({ ...plan, materials: updatedMaterials });
  };

  const addMaterial = () => {
    if (!newMaterial.trim() || !plan) return;
    const newItem = { id: Date.now().toString(), name: newMaterial, checked: true, icon: '➕' };
    setPlan({ ...plan, materials: [...plan.materials, newItem] });
    setNewMaterial("");
  };

  const checklistProgress = plan ? (plan.materials.filter(m => m.checked).length / plan.materials.length) * 100 : 0;
  const allChecked = checklistProgress === 100;

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-teal-500/20 rounded-full blur-[120px]"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 py-4 flex items-center gap-4 border-b border-white/5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-2 bg-white/5 rounded-xl text-slate-300 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <WifiOff size={16} className="text-teal-400" />
            <h1 className="font-bold text-lg text-white">Preparación Offline</h1>
          </div>
          <p className="text-xs text-slate-400">Prepara todo antes de desconectar</p>
        </div>
        {plan?.source === 'ai' && (
          <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full flex items-center gap-1 font-bold">
            <Sparkles size={10} /> IA
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-32">

        {/* LOADING */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center justify-center py-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full mb-6"
            />
            <p className="text-white font-medium">Preparando tu lista...</p>
          </div>
        )}

        {/* CHECKLIST */}
        {(phase === 'checklist' || phase === 'ready') && plan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6 space-y-6"
          >
            {/* Intro */}
            <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-teal-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-sm mb-1">¿Qué necesitas?</h2>
                  <p className="text-slate-400 text-xs">
                    Reúne estos materiales físicos antes de guardar tu dispositivo.
                  </p>
                </div>
              </div>
            </div>

            {/* Task name display */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <BookOpen size={18} className="text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tu tarea</p>
                <p className="text-white font-medium text-sm">{config.taskName || "Estudio general"}</p>
              </div>
            </div>

            {/* Materials List */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Materiales ({plan.materials.filter(m => m.checked).length}/{plan.materials.length})
              </h3>
              {plan.materials.map((mat, index) => (
                <motion.button
                  key={mat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleMaterial(mat.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${mat.checked
                    ? 'bg-teal-500/10 border-teal-500/30'
                    : 'bg-white/5 border-white/10 hover:border-teal-500/30'
                    }`}
                >
                  <span className="text-xl">{mat.icon || '📦'}</span>
                  <span className={`flex-1 text-left text-sm font-medium ${mat.checked ? 'text-teal-400 line-through opacity-70' : 'text-white'
                    }`}>
                    {mat.name}
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${mat.checked
                    ? 'bg-teal-500 border-teal-500 text-white'
                    : 'border-slate-600'
                    }`}>
                    {mat.checked && <Check size={12} strokeWidth={3} />}
                  </div>
                </motion.button>
              ))}

              {/* Add Custom */}
              <div className="flex gap-2 mt-3">
                <input
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMaterial()}
                  placeholder="Agregar otro..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50 placeholder:text-slate-600"
                />
                <button
                  onClick={addMaterial}
                  disabled={!newMaterial.trim()}
                  className="bg-teal-500 text-white w-10 rounded-xl disabled:opacity-50 flex items-center justify-center"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Environment Tips */}
            {plan.environment && plan.environment.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Coffee size={14} /> Prepara tu espacio
                </h3>
                <div className="space-y-2">
                  {plan.environment.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-teal-400">•</span>
                      <span className="text-slate-300">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f] to-transparent pt-8 pb-6 px-4 z-30">
        {!allChecked ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-sm mb-1">Marca todos los materiales que tienes listos</p>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-center text-teal-400 text-sm font-medium mb-2">
              ✓ ¡Todo listo! ¿Cómo quieres estudiar?
            </p>

            {/* Option 1: Focus Session */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate?.(AppView.FOCUS_SESSION)}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <Timer size={20} />
              Iniciar Sesión de Enfoque
            </motion.button>

            {/* Option 2: Flip Phone Mode */}
            <button
              onClick={() => onNavigate?.(AppView.FLIP_PHONE_MODE)}
              className="w-full bg-white/5 border border-white/10 text-slate-300 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Smartphone size={16} />
              Usar Modo Flip Phone
              <ChevronRight size={16} />
            </button>

            {/* Option 3: Just close */}
            <button
              onClick={onComplete}
              className="w-full text-slate-500 py-2 text-sm hover:text-slate-300 transition-colors"
            >
              Solo guardar y salir
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OfflineStudy;