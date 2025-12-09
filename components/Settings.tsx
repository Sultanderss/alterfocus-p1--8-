import React, { useState } from 'react';
import { Bell, Moon, Volume2, LogOut, ArrowLeft, Edit2, Save, Calendar, Database, Users, Check, Flame, Clock, Star, Lock, Plus, X } from 'lucide-react';
import { UserState, InterventionTone, AppView } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
    user: UserState;
    onUpdateUser: (user: Partial<UserState>) => void;
    onRequestNotifications: () => void;
    onConnectIntegration: (id: string) => void;
    onNavigate?: (view: AppView) => void;
    onBack: () => void;
    onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onRequestNotifications, onConnectIntegration, onNavigate, onBack, onLogout }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(user.name);
    const [showAddApp, setShowAddApp] = useState(false);
    const [newAppName, setNewAppName] = useState('');

    const level = Math.floor(user.points / 100) + 1;
    const streak = parseInt(localStorage.getItem('currentStreak') || '3');
    const blockedApps = user.distractionApps || ['TikTok', 'Instagram', 'YouTube'];

    const handleAddApp = (appName: string) => {
        if (appName.trim() && !blockedApps.includes(appName.trim())) {
            onUpdateUser({ distractionApps: [...blockedApps, appName.trim()] });
            setNewAppName('');
            setShowAddApp(false);
        }
    };

    const tones = [
        { id: 'empathic', emoji: '💙', name: 'Empático', desc: 'Amable y comprensivo', gradient: 'from-blue-500 to-cyan-500' },
        { id: 'direct', emoji: '⚡', name: 'Directo', desc: 'Sin rodeos', gradient: 'from-emerald-500 to-green-500' },
        { id: 'motivational', emoji: '🔥', name: 'Coach', desc: 'Energético', gradient: 'from-orange-500 to-red-500' }
    ];

    return (
        <motion.div
            className="absolute inset-0 z-30 overflow-hidden text-slate-900 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* FONDO DINÁMICO */}
            <div className="absolute inset-0 transition-colors duration-500 bg-slate-50 dark:bg-[#0a0a0f]" />

            {/* GRADIENTES (Menos visibles en modo claro) */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-violet-600/25 via-fuchsia-500/15 to-transparent rounded-full blur-3xl opacity-30 dark:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-500/15 to-transparent rounded-full blur-3xl opacity-30 dark:opacity-100 transition-opacity" />

            <div className="relative z-10 h-full overflow-y-auto pb-32 custom-scrollbar">
                {/* HEADER */}
                <div className="px-6 pt-8 pb-4">
                    <div className="flex items-center gap-4 mb-6">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onBack}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors bg-white border-slate-200 shadow-sm dark:bg-white/10 dark:border-white/20"
                        >
                            <ArrowLeft size={22} className="text-slate-700 dark:text-white" />
                        </motion.button>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Configuración</h1>
                    </div>

                    {/* PROFILE HERO CARD */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-3xl p-6 mb-6 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #f97316 100%)' }}
                    >
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-black text-white shadow-xl border border-white/30">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        {isEditing ? (
                                            <input
                                                value={tempName}
                                                onChange={e => setTempName(e.target.value)}
                                                className="bg-white/20 rounded-lg px-3 py-1 text-white font-bold text-lg outline-none border border-white/30 placeholder-white/50"
                                                autoFocus
                                            />
                                        ) : (
                                            <h2 className="text-xl font-black text-white">{user.name}</h2>
                                        )}
                                        <p className="text-white/80 text-sm font-medium">Nivel {level} • {level < 5 ? 'Aprendiz' : 'Maestro'}</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                        if (isEditing) onUpdateUser({ name: tempName });
                                        setIsEditing(!isEditing);
                                    }}
                                    className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors border border-white/20"
                                >
                                    {isEditing ? <Save size={18} className="text-white" /> : <Edit2 size={18} className="text-white" />}
                                </motion.button>
                            </div>

                            {/* Mini Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: Star, value: `${user.points}`, label: 'Puntos' },
                                    { icon: Flame, value: `${streak}d`, label: 'Racha' },
                                    { icon: Clock, value: `${user.focusMinutes || 0}m`, label: 'Foco' }
                                ].map(stat => (
                                    <div key={stat.label} className="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/10">
                                        <stat.icon size={16} className="text-white/90 mx-auto mb-1" />
                                        <div className="text-white font-bold">{stat.value}</div>
                                        <div className="text-white/60 text-[10px] uppercase font-bold tracking-wider">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* TONO DE IA */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <h3 className="text-slate-900 dark:text-white font-bold mb-3 flex items-center gap-2">
                            <span className="text-lg">🤖</span> Personalidad IA
                        </h3>
                        <div className="flex gap-2 mb-6">
                            {tones.map(tone => (
                                <motion.button
                                    key={tone.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onUpdateUser({ interventionTone: tone.id as InterventionTone })}
                                    className={`flex-1 relative overflow-hidden rounded-2xl p-4 border-2 transition-all ${user.interventionTone === tone.id
                                        ? 'border-violet-500 shadow-lg'
                                        : 'border-slate-200 bg-white dark:border-transparent dark:bg-white/5'
                                        }`}
                                >
                                    {user.interventionTone === tone.id && (
                                        <motion.div
                                            layoutId="toneActive"
                                            className={`absolute inset-0 bg-gradient-to-br ${tone.gradient} ${user.darkMode ? 'opacity-30' : 'opacity-10'}`}
                                        />
                                    )}
                                    <div className="relative z-10 text-center">
                                        <div className="text-2xl mb-1">{tone.emoji}</div>
                                        <div className="font-bold text-sm text-slate-900 dark:text-white">{tone.name}</div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{tone.desc}</div>
                                    </div>
                                    {user.interventionTone === tone.id && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* APPS BLOQUEADAS */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <h3 className="text-slate-900 dark:text-white font-bold mb-3 flex items-center gap-2">
                            <Lock size={16} className="text-red-400" /> Apps Bloqueadas
                            <span className="text-[10px] font-normal text-slate-500 ml-auto">Sincronizado con extensión</span>
                        </h3>
                        <div className="backdrop-blur rounded-2xl p-4 border mb-6 bg-white border-slate-200 shadow-sm dark:bg-white/5 dark:border-white/10 transition-colors">
                            <div className="flex flex-wrap gap-2">
                                {blockedApps.map(app => (
                                    <motion.span
                                        key={app}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20"
                                    >
                                        <span className="text-red-500 text-sm font-medium">{app}</span>
                                        <button
                                            onClick={() => onUpdateUser({ distractionApps: blockedApps.filter(a => a !== app) })}
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </motion.span>
                                ))}
                                <button
                                    onClick={() => setShowAddApp(true)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border transition-colors bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10"
                                >
                                    <Plus size={14} />
                                    <span className="text-sm">Añadir</span>
                                </button>
                            </div>

                            {/* Add App Input */}
                            <AnimatePresence>
                                {showAddApp && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 border-t pt-4 border-slate-200 dark:border-white/10 transition-colors"
                                    >
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                value={newAppName}
                                                onChange={(e) => setNewAppName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddApp(newAppName)}
                                                placeholder="Nombre de la app..."
                                                className="flex-1 px-4 py-2 rounded-xl text-sm outline-none border focus:border-red-500/50 bg-slate-50 border-slate-200 text-slate-800 dark:bg-white/5 dark:border-white/20 dark:text-white dark:placeholder:text-white/30 transition-colors"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleAddApp(newAppName)}
                                                disabled={!newAppName.trim()}
                                                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-red-600 transition-colors"
                                            >
                                                Bloquear
                                            </button>
                                            <button
                                                onClick={() => { setShowAddApp(false); setNewAppName(''); }}
                                                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* PREFERENCIAS */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <h3 className="text-slate-900 dark:text-white font-bold mb-3 flex items-center gap-2">
                            <SettingsIcon className="text-slate-400" size={18} /> Preferencias
                        </h3>
                        <div className="backdrop-blur rounded-2xl border mb-6 overflow-hidden bg-white border-slate-200 shadow-sm dark:bg-white/5 dark:border-white/10 transition-colors">
                            {/* Notificaciones */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Bell size={20} className="text-slate-500 dark:text-white/40" />
                                    <span className="font-medium text-slate-900 dark:text-white">Notificaciones</span>
                                </div>
                                <Switch
                                    checked={user.notificationsEnabled}
                                    onChange={() => user.notificationsEnabled ? onUpdateUser({ notificationsEnabled: false }) : onRequestNotifications()}
                                />
                            </div>

                            {/* Modo Oscuro */}
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <Moon size={20} className="text-slate-500 dark:text-white/40" />
                                    <span className="font-medium text-slate-900 dark:text-white">Modo Oscuro</span>
                                </div>
                                <Switch
                                    checked={user.darkMode}
                                    onChange={() => onUpdateUser({ darkMode: !user.darkMode })}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* HORARIO E IMPORTACIÓN */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                        <h3 className="text-slate-900 dark:text-white font-bold mb-3 flex items-center gap-2">
                            <Calendar size={18} className="text-slate-400" /> Gestionar Horario
                        </h3>
                        <motion.button
                            onClick={() => onNavigate && onNavigate(AppView.SCHEDULE_UPLOAD)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-between p-4 rounded-2xl mb-6 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-500">
                                    <Database size={20} />
                                </div>
                                <div className="text-left">
                                    <span className="font-bold text-slate-900 dark:text-white block">Importar o Editar</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Usa IA para leer PDF/Excel</span>
                                </div>
                            </div>
                            <div className="bg-violet-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                NUEVO
                            </div>
                        </motion.button>
                    </motion.div>

                    {/* INTEGRACIONES */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-slate-900 dark:text-white font-bold">🔗 Conexiones</h3>
                            <span className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded-full font-bold">Activo</span>
                        </div>
                        <p className="text-xs mb-3 -mt-1 text-slate-500 dark:text-white/40">Sincroniza tus herramientas para mejorar el contexto.</p>
                        <div className="space-y-2 mb-6">
                            {[
                                { id: 'Google Calendar', icon: Calendar, color: 'bg-blue-500', emoji: '📅' },
                                { id: 'Notion', icon: Database, color: 'bg-slate-500', emoji: '📝' },
                                { id: 'Microsoft Teams', icon: Users, color: 'bg-indigo-500', emoji: '👥' }
                            ].map(app => (
                                <motion.div
                                    key={app.id}
                                    whileHover={{ x: 5 }}
                                    className="flex items-center justify-between p-4 rounded-2xl border transition-colors bg-white border-slate-200 shadow-sm dark:bg-white/5 dark:border-white/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{app.emoji}</span>
                                        <span className="font-medium text-sm text-slate-900 dark:text-white">{app.id}</span>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onConnectIntegration(app.id)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${user.connectedIntegrations.includes(app.id)
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : 'bg-slate-100 text-slate-500 hover:text-slate-800 dark:bg-white/10 dark:text-white/60 dark:hover:text-white'
                                            }`}
                                    >
                                        {user.connectedIntegrations.includes(app.id) ? '✓ Conectado' : 'Conectar'}
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* LOGOUT */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        onClick={onLogout}
                        className="w-full py-4 text-red-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-red-500/5 rounded-2xl transition-colors border border-transparent hover:border-red-500/10"
                    >
                        <LogOut size={16} />
                        Cerrar Sesión
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

// Helper Components
const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <motion.button
        layout
        onClick={onChange}
        className={`w-12 h-7 rounded-full px-1 flex items-center transition-colors ${checked ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
        <motion.div
            layout
            className="w-5 h-5 bg-white rounded-full shadow-md"
            animate={{ x: checked ? 20 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
    </motion.button>
);

const SettingsIcon = ({ className, size }: { className?: string; size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

export default Settings;