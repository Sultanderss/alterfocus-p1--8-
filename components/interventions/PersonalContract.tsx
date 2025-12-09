/**
 * INTERVENCIÓN: CONTRATO PERSONAL
 * 
 * Para arquetipos: CHRONIC
 * Objetivo: Crear compromiso escrito para romper patrones habituales
 * Duración: ~1 minuto
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSignature, Check, X, Sparkles, PenTool } from 'lucide-react';

interface PersonalContractProps {
    onComplete: (result: { points: number; success: boolean; intervention: string; contract?: string }) => void;
    onCancel: () => void;
    archetype?: string;
    trigger?: string;
}

export const PersonalContractIntervention: React.FC<PersonalContractProps> = ({
    onComplete,
    onCancel,
    archetype = 'Chronic',
    trigger = 'procrastinar'
}) => {
    const [phase, setPhase] = useState<'intro' | 'write' | 'sign' | 'complete'>('intro');
    const [contractText, setContractText] = useState('');
    const [signature, setSignature] = useState('');
    const [agreed, setAgreed] = useState(false);

    // Load existing contract if any
    useEffect(() => {
        try {
            const saved = localStorage.getItem('alterfocus_personal_contract');
            if (saved) {
                const parsed = JSON.parse(saved);
                setContractText(parsed.text || '');
            }
        } catch (e) {
            // No existing contract
        }
    }, []);

    const saveContract = () => {
        const contract = {
            text: contractText,
            signature,
            created_at: new Date().toISOString(),
            activation_count: 0
        };
        localStorage.setItem('alterfocus_personal_contract', JSON.stringify(contract));
    };

    const template = `Si siento ganas de ${trigger}, entonces haré:
1. Respirar 3 veces profundo
2. Preguntarme: "¿Me acerca o aleja?"
3. Hacer una versión crappy de mi tarea`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
        >
            <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                    {/* INTRO */}
                    {phase === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center space-y-6"
                        >
                            {/* Icon */}
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/30"
                            >
                                <FileSignature size={48} className="text-white" />
                            </motion.div>

                            {/* Title */}
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2">
                                    Contrato Personal 📜
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Un compromiso contigo mismo
                                </p>
                            </div>

                            {/* Explanation */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
                                <p className="text-white/90 leading-relaxed">
                                    <span className="font-bold text-amber-400">Los patrones crónicos necesitan compromiso explícito.</span>
                                </p>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    Vamos a escribir un contrato que active cada vez que sientas el impulso de procrastinar.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-medium hover:bg-white/10 transition-all"
                                >
                                    <X size={18} className="inline mr-2" />
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => setPhase('write')}
                                    className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
                                >
                                    <PenTool size={18} className="inline mr-2" />
                                    Escribir
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* WRITE CONTRACT */}
                    {phase === 'write' && (
                        <motion.div
                            key="write"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            {/* Header */}
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Escribe tu contrato
                                </h3>
                                <p className="text-slate-400 text-sm">
                                    Define qué harás cuando sientas ganas de procrastinar
                                </p>
                            </div>

                            {/* Textarea */}
                            <div className="space-y-3">
                                <textarea
                                    value={contractText}
                                    onChange={(e) => setContractText(e.target.value)}
                                    placeholder={template}
                                    rows={6}
                                    className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                                />

                                {/* Use Template */}
                                {!contractText && (
                                    <button
                                        onClick={() => setContractText(template)}
                                        className="text-amber-400 text-sm hover:text-amber-300 transition-colors"
                                    >
                                        Usar plantilla sugerida →
                                    </button>
                                )}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => setPhase('sign')}
                                disabled={!contractText.trim()}
                                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${contractText.trim()
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                                        : 'bg-white/10 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                Siguiente: Firmar →
                            </button>
                        </motion.div>
                    )}

                    {/* SIGN CONTRACT */}
                    {phase === 'sign' && (
                        <motion.div
                            key="sign"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            {/* Contract Preview */}
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                                <p className="text-amber-300 text-sm font-medium mb-2">Tu contrato:</p>
                                <p className="text-white/90 text-sm whitespace-pre-line">{contractText}</p>
                            </div>

                            {/* Agreement */}
                            <div className="flex items-start gap-3">
                                <button
                                    onClick={() => setAgreed(!agreed)}
                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${agreed
                                            ? 'bg-amber-500 border-amber-500'
                                            : 'border-white/30 hover:border-white/50'
                                        }`}
                                >
                                    {agreed && <Check size={14} className="text-white" />}
                                </button>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    Me comprometo a seguir este contrato hoy. Entiendo que este es un acuerdo conmigo mismo para romper mi patrón de procrastinación.
                                </p>
                            </div>

                            {/* Signature */}
                            <div>
                                <label className="text-slate-400 text-sm block mb-2">
                                    Firma con tu nombre:
                                </label>
                                <input
                                    type="text"
                                    value={signature}
                                    onChange={(e) => setSignature(e.target.value)}
                                    placeholder="Tu nombre aquí"
                                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
                                />
                            </div>

                            {/* Sign Button */}
                            <button
                                onClick={() => {
                                    saveContract();
                                    setPhase('complete');
                                }}
                                disabled={!agreed || !signature.trim()}
                                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${agreed && signature.trim()
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                                        : 'bg-white/10 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                <FileSignature size={20} className="inline mr-2" />
                                Firmar Contrato
                            </button>
                        </motion.div>
                    )}

                    {/* COMPLETE */}
                    {phase === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6"
                        >
                            {/* Success Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 10 }}
                                className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                            >
                                <Check size={48} className="text-white" />
                            </motion.div>

                            {/* Message */}
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2">
                                    ¡Contrato firmado! ✍️
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Ahora tienes un compromiso claro
                                </p>
                            </div>

                            {/* Contract Summary */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileSignature size={16} className="text-amber-400" />
                                    <span className="text-amber-400 font-medium text-sm">Firmado por: {signature}</span>
                                </div>
                                <p className="text-white/70 text-sm line-clamp-3">{contractText}</p>
                            </div>

                            {/* Insight */}
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                <p className="text-emerald-300 leading-relaxed">
                                    <Sparkles size={16} className="inline mr-2" />
                                    Los contratos escritos crean compromiso real. La próxima vez que sientas el impulso, recuerda tu promesa.
                                </p>
                            </div>

                            {/* Points */}
                            <div className="bg-white/5 rounded-xl py-3 px-6 inline-flex items-center gap-2">
                                <span className="text-2xl">✨</span>
                                <span className="text-white font-bold text-xl">+30 puntos</span>
                            </div>

                            {/* Continue */}
                            <button
                                onClick={() => onComplete({
                                    points: 30,
                                    success: true,
                                    intervention: 'personal_contract',
                                    contract: contractText
                                })}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-emerald-500/30"
                            >
                                Volver al trabajo →
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default PersonalContractIntervention;
