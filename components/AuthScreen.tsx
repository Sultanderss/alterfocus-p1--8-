import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AuthScreenProps {
    onAuthComplete: (userData: { name: string; email: string }) => void;
    onViewLanding: () => void;
}

type AuthMode = 'welcome' | 'login' | 'register';

export default function AuthScreen({ onAuthComplete, onViewLanding }: AuthScreenProps) {
    const [mode, setMode] = useState<AuthMode>('welcome');
    const [showPassword, setShowPassword] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = () => {
        setError('');

        // Validación básica
        if (!name.trim()) {
            setError('Por favor ingresa tu nombre');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            setError('Por favor ingresa un email válido');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        // Guardar usuario en localStorage
        const userData = {
            name: name.trim(),
            email: email.trim(),
            password, // En producción, NUNCA guardar contraseña en texto plano
            registeredAt: new Date().toISOString()
        };

        localStorage.setItem('alterfocus_user_auth', JSON.stringify(userData));
        localStorage.setItem('alterfocus_is_logged_in', 'true');

        onAuthComplete({ name: userData.name, email: userData.email });
    };

    const handleLogin = () => {
        setError('');

        // Validación básica
        if (!email.trim() || !email.includes('@')) {
            setError('Por favor ingresa un email válido');
            return;
        }
        if (!password) {
            setError('Por favor ingresa tu contraseña');
            return;
        }

        // Verificar credenciales
        const storedUser = localStorage.getItem('alterfocus_user_auth');
        if (!storedUser) {
            setError('No existe una cuenta con este email. Por favor regístrate.');
            return;
        }

        const userData = JSON.parse(storedUser);
        if (userData.email !== email.trim() || userData.password !== password) {
            setError('Email o contraseña incorrectos');
            return;
        }

        localStorage.setItem('alterfocus_is_logged_in', 'true');
        onAuthComplete({ name: userData.name, email: userData.email });
    };

    return (
        <div className="h-full w-full bg-gradient-to-b from-black via-slate-900 to-black text-white overflow-y-auto">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        opacity: [0.3, 0.5, 0.3],
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-cyan-500/20 blur-[120px]"
                />
                <motion.div
                    animate={{
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, 50, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-purple-500/10 blur-[120px]"
                />
            </div>

            <div className="relative z-10 min-h-full flex flex-col items-center justify-center px-6 py-12">
                <AnimatePresence mode="wait">
                    {mode === 'welcome' && (
                        <motion.div
                            key="welcome"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-md w-full text-center"
                        >
                            {/* Logo */}
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.6)]"
                            >
                                <Brain size={40} className="text-white" />
                            </motion.div>

                            <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
                                Bienvenido a <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                                    AlterFocus
                                </span>
                            </h1>

                            <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                                Tu prótesis cognitiva para recuperar el control de tu atención en la era digital.
                            </p>

                            {/* Buttons */}
                            <div className="space-y-4 mb-8">
                                <button
                                    onClick={() => setMode('register')}
                                    className="w-full px-8 py-4 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-all hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    Crear Cuenta
                                    <ArrowRight size={20} />
                                </button>

                                <button
                                    onClick={() => setMode('login')}
                                    className="w-full px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-medium text-lg transition-all"
                                >
                                    Ya tengo cuenta
                                </button>
                            </div>

                            {/* Link to Landing */}
                            <button
                                onClick={onViewLanding}
                                className="text-cyan-400 hover:text-cyan-300 text-sm underline transition-colors"
                            >
                                ¿Qué es AlterFocus? Ver más información →
                            </button>
                        </motion.div>
                    )}

                    {mode === 'register' && (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-md w-full"
                        >
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                                    <Brain size={32} className="text-white" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2">Crear Cuenta</h2>
                                <p className="text-slate-400">Comienza tu viaje hacia el enfoque profundo</p>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                {/* Name Input */}
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Nombre completo"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                                    />
                                </div>

                                {/* Email Input */}
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                                    />
                                </div>

                                {/* Password Input */}
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Contraseña (mín. 6 caracteres)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Register Button */}
                                <button
                                    onClick={handleRegister}
                                    className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold text-lg shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all hover:scale-105 mt-6"
                                >
                                    Crear mi cuenta
                                </button>

                                {/* Back to Welcome */}
                                <button
                                    onClick={() => {
                                        setMode('welcome');
                                        setError('');
                                    }}
                                    className="w-full px-8 py-3 text-slate-400 hover:text-white transition-colors text-sm"
                                >
                                    ← Volver
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'login' && (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-md w-full"
                        >
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-tr from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.5)]">
                                    <Brain size={32} className="text-white" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2">Iniciar Sesión</h2>
                                <p className="text-slate-400">Bienvenido de vuelta</p>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                {/* Email Input */}
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                    />
                                </div>

                                {/* Password Input */}
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                        className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Login Button */}
                                <button
                                    onClick={handleLogin}
                                    className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full font-bold text-lg shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all hover:scale-105 mt-6"
                                >
                                    Iniciar Sesión
                                </button>

                                {/* Back to Welcome */}
                                <button
                                    onClick={() => {
                                        setMode('welcome');
                                        setError('');
                                    }}
                                    className="w-full px-8 py-3 text-slate-400 hover:text-white transition-colors text-sm"
                                >
                                    ← Volver
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
