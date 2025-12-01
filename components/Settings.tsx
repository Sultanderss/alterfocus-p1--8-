import React, { useState } from 'react';
import { Bell, Moon, Volume2, LogOut, ArrowLeft, Edit2, Save, Calendar, Mail, Database, Users, HelpCircle, Shield, Zap, Heart, ChevronRight, Check } from 'lucide-react';
import { UserState, InterventionTone } from '../types';
import { motion } from 'framer-motion';

interface SettingsProps {
    user: UserState;
    onUpdateUser: (user: Partial<UserState>) => void;
    onRequestNotifications: () => void;
    onConnectIntegration: (id: string) => void;
    onBack: () => void;
    onLogout: () => void;
}

// --- HELPER COMPONENTS ---

const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors duration-300 relative ${active ? 'bg-brand-primary' : 'bg-white/10'}`}
    >
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-transform duration-300 ${active ? 'left-6' : 'left-1'}`} />
    </button>
);

const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-3 ml-1 mt-6">{title}</h3>
);

interface ItemProps {
    icon: any;
    label: string;
    right: React.ReactNode;
    onClick?: () => void;
    destructive?: boolean;
}

const Item: React.FC<ItemProps> = ({ icon: Icon, label, right, onClick, destructive }) => (
    <div
        onClick={onClick}
        className={`flex items-center justify-between p-4 border-b border-white/5 last:border-0 ${onClick ? 'cursor-pointer hover:bg-white/5 active:bg-white/10' : ''} transition-colors`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${destructive ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-slate-300'}`}>
                <Icon size={18} />
            </div>
            <span className={`font-medium text-sm ${destructive ? 'text-rose-400' : 'text-slate-200'}`}>{label}</span>
        </div>
        {right}
    </div>
);

interface ToneCardProps {
    tone: InterventionTone;
    current: InterventionTone;
    onClick: () => void;
}

const ToneCard: React.FC<ToneCardProps> = ({ tone, current, onClick }) => {
    const config = {
        empathic: { label: 'Empático', desc: 'Amable y comprensivo.', example: '"Entiendo que estés cansado, pero intenta 5 minutos más."', color: 'text-blue-400' },
        direct: { label: 'Directo', desc: 'Sin rodeos, al grano.', example: '"Deja TikTok. Tu meta es estudiar."', color: 'text-emerald-400' },
        motivational: { label: 'Coach', desc: 'Energético y positivo.', example: '"¡Tú puedes con esto! ¡Vamos a romperla!"', color: 'text-amber-400' }
    };
    const info = config[tone];
    const isSelected = current === tone;

    return (
        <button
            onClick={onClick}
            className={`relative p-4 rounded-2xl border text-left transition-all w-full group ${isSelected ? `border-brand-primary/50 bg-brand-primary/10` : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
        >
            <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/5 ${info.color}`}>{info.label}</span>
                {isSelected && <div className="w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></div>}
            </div>
            <p className="text-xs text-slate-400 mb-2 group-hover:text-slate-300 transition-colors">{info.desc}</p>
            <p className="text-[10px] text-slate-500 italic bg-black/20 p-2 rounded-lg border border-white/5">
                {info.example}
            </p>
        </button>
    );
};

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onRequestNotifications, onConnectIntegration, onBack, onLogout }) => {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempName, setTempName] = useState(user.name);
    const [tempPeak, setTempPeak] = useState(user.peakTime);

    return (
        <motion.div
            className="absolute inset-0 bg-brand-dark z-30 overflow-y-auto transition-colors duration-300 pb-24"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
        >
            <div className="max-w-md mx-auto min-h-screen flex flex-col">

                {/* Header */}
                <div className="px-6 pt-6 pb-2 flex items-center gap-3 sticky top-0 bg-brand-dark/90 backdrop-blur-md z-20 border-b border-white/5">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={22} className="text-slate-200" />
                    </button>
                    <h1 className="text-lg font-bold text-white">Configuración</h1>
                </div>

                <div className="p-6 space-y-6">

                    {/* Profile Card */}
                    <div className="glass-card p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Edit2 size={80} className="text-white" />
                        </div>

                        <div className="relative z-10 flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-primary/20">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    {isEditingProfile ? (
                                        <input
                                            value={tempName}
                                            onChange={e => setTempName(e.target.value)}
                                            className="font-bold text-lg bg-white/10 border-b border-brand-primary outline-none text-white w-32 rounded px-1"
                                            autoFocus
                                        />
                                    ) : (
                                        <h2 className="font-bold text-lg text-white">{user.name}</h2>
                                    )}
                                    <p className="text-xs text-slate-400 mt-1">Nivel {Math.floor(user.points / 100) + 1} • Aprendiz</p>

                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-brand-secondary border border-white/5">
                                            {user.peakTime}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (isEditingProfile) {
                                        onUpdateUser({ name: tempName, peakTime: tempPeak });
                                        setIsEditingProfile(false);
                                    } else {
                                        setIsEditingProfile(true);
                                    }
                                }}
                                className={`p-2 rounded-full transition-all ${isEditingProfile ? 'bg-brand-primary text-white shadow-lg' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
                            >
                                {isEditingProfile ? <Save size={18} /> : <Edit2 size={18} />}
                            </button>
                        </div>

                        {/* Peak Time Selector (Only visible when editing) */}
                        {isEditingProfile && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-4 pt-4 border-t border-white/10"
                            >
                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Hora de Mayor Energía</label>
                                <div className="flex gap-2">
                                    {['Mañana', 'Tarde', 'Noche'].map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setTempPeak(time)}
                                            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${tempPeak === time
                                                    ? 'bg-brand-primary/20 border-brand-primary text-brand-primary'
                                                    : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* AI Personality Section */}
                    <div>
                        <SectionHeader title="Personalidad de la IA" />
                        <div className="grid gap-3">
                            {(['empathic', 'direct', 'motivational'] as InterventionTone[]).map(tone => (
                                <ToneCard
                                    key={tone}
                                    tone={tone}
                                    current={user.interventionTone}
                                    onClick={() => onUpdateUser({ interventionTone: tone })}
                                />
                            ))}
                        </div>
                    </div>

                    {/* System Preferences */}
                    <div>
                        <SectionHeader title="Sistema" />
                        <div className="glass-panel overflow-hidden">
                            <Item
                                icon={Bell}
                                label="Notificaciones"
                                right={<Toggle active={user.notificationsEnabled} onToggle={() => user.notificationsEnabled ? onUpdateUser({ notificationsEnabled: false }) : onRequestNotifications()} />}
                            />
                            <Item
                                icon={Volume2}
                                label="Sonidos"
                                right={<Toggle active={user.soundEnabled} onToggle={() => onUpdateUser({ soundEnabled: !user.soundEnabled })} />}
                            />
                            <Item
                                icon={Moon}
                                label="Modo Oscuro"
                                right={<Toggle active={user.darkMode} onToggle={() => onUpdateUser({ darkMode: !user.darkMode })} />}
                            />
                        </div>
                    </div>

                    {/* Integrations */}
                    <div>
                        <SectionHeader title="Integraciones" />
                        <div className="glass-panel overflow-hidden">
                            {['Google Calendar', 'Notion', 'Microsoft Teams'].map(app => (
                                <div key={app} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${app.includes('Calendar') ? 'bg-blue-500/20 text-blue-400' : app.includes('Notion') ? 'bg-slate-500/20 text-slate-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                            {app.includes('Calendar') ? <Calendar size={18} /> : app.includes('Notion') ? <Database size={18} /> : <Users size={18} />}
                                        </div>
                                        <span className="text-sm font-medium text-slate-200">{app}</span>
                                    </div>
                                    <button
                                        onClick={() => onConnectIntegration(app)}
                                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all ${user.connectedIntegrations.includes(app)
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-white/5 text-slate-500 hover:bg-white/10 border border-white/5'
                                            }`}
                                    >
                                        {user.connectedIntegrations.includes(app) ? 'Conectado' : 'Conectar'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* About & Support */}
                    <div>
                        <SectionHeader title="Información" />
                        <div className="glass-panel overflow-hidden">
                            <Item icon={HelpCircle} label="Ayuda y Soporte" right={<ChevronRight size={16} className="text-slate-600" />} onClick={() => alert("Contacta a soporte@alterfocus.app")} />
                            <Item icon={Shield} label="Privacidad" right={<ChevronRight size={16} className="text-slate-600" />} onClick={() => alert("Tus datos viven en tu dispositivo (Local Storage).")} />
                            <div className="p-4 bg-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Zap size={12} /> <span>Versión 2.0.0</span>
                                </div>
                                <span className="text-[10px] text-slate-600 font-medium">Premium Build</span>
                            </div>
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className="space-y-3 pt-4">
                        <button
                            onClick={() => {
                                if (confirm("¿Borrar todo el progreso? Esta acción no se puede deshacer.")) {
                                    onUpdateUser({ points: 0, focusMinutes: 0, completedSessions: 0 });
                                }
                            }}
                            className="w-full py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                        >
                            Reiniciar Progreso
                        </button>
                        <button
                            onClick={onLogout}
                            className="w-full py-3 rounded-xl bg-rose-500/10 text-rose-400 text-sm font-bold hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2 border border-rose-500/20"
                        >
                            <LogOut size={16} /> Cerrar Sesión
                        </button>
                    </div>

                    <div className="flex justify-center pt-4 pb-8">
                        <div className="flex items-center gap-1.5 text-slate-600 text-[10px] font-medium">
                            <span>Hecho con</span>
                            <Heart size={10} fill="currentColor" className="text-rose-500" />
                            <span>para estudiantes</span>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default Settings;