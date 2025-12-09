/**
 * LOGIN PAGE - AlterFocus
 * Premium design with animated background and proper branding
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, AlertCircle, Loader2, Eye, EyeOff, Sparkles, Brain, Zap, Shield, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
    onAuthSuccess: () => void;
}

export default function LoginPage({ onAuthSuccess }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);

        if (err) {
            setError(err.message);
        } else {
            setMessage('¡Sesión iniciada!');
            setTimeout(() => onAuthSuccess(), 500);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        const { error: err } = await supabase.auth.signUp({ email, password });
        setLoading(false);

        if (err) {
            setError(err.message);
        } else {
            setMessage('Registro exitoso. Revisa tu email para confirmar.');
        }
    };

    return (
        <div className="fixed inset-0 overflow-y-auto bg-[#08080c] z-50">

            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/40 via-fuchsia-500/30 to-pink-500/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                    className="absolute bottom-20 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-500/30 via-blue-500/20 to-indigo-500/10 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px]"
                />
            </div>

            <div className="relative z-10 min-h-full flex flex-col justify-center p-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-md mx-auto"
                >
                    {/* Logo & Branding */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', duration: 1.2, delay: 0.2 }}
                            className="relative inline-block mb-6"
                        >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 rounded-3xl blur-2xl opacity-50" />

                            {/* Logo container */}
                            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/40">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <Brain size={48} className="text-white" />
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl font-bold mb-3"
                        >
                            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                                AlterFocus
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed"
                        >
                            Convierte tus mejores decisiones conscientes en buenos hábitos inconscientes
                        </motion.p>
                    </div>

                    {/* Features Pills */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex justify-center gap-3 mb-8"
                    >
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full">
                            <Zap size={12} className="text-purple-400" />
                            <span className="text-[11px] text-purple-300">IA Contextual</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                            <Shield size={12} className="text-cyan-400" />
                            <span className="text-[11px] text-cyan-300">Sin Culpa</span>
                        </div>
                    </motion.div>

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="relative"
                    >
                        {/* Card border gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 via-fuchsia-500/50 to-pink-500/50 rounded-3xl blur-sm" />

                        <div className="relative bg-[#0f0f15] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">

                            {/* Mode Tabs */}
                            <div className="flex gap-2 mb-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setIsSignUp(false); setError(null); setMessage(null); }}
                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${!isSignUp
                                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    <LogIn size={18} />
                                    Entrar
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setIsSignUp(true); setError(null); setMessage(null); }}
                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isSignUp
                                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    <UserPlus size={18} />
                                    Registrarse
                                </motion.button>
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3"
                                    >
                                        <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                                        <p className="text-red-300 text-sm">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Success */}
                            <AnimatePresence>
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
                                    >
                                        <p className="text-emerald-300 text-sm flex items-center gap-2">
                                            <Sparkles size={16} />
                                            {message}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form */}
                            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="tu@email.com"
                                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isSignUp && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar Contraseña</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Repite tu contraseña"
                                                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                                required
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 px-4 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <p className="text-center text-slate-500 text-xs mt-6">
                                Sin culpa. Solo ciencia y empatía.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
