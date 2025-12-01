import React from 'react';
import { UserState, AppView } from '../types';

interface InlineDashboardProps {
    user: UserState;
    onNavigate: (view: AppView) => void;
}

const InlineDashboard: React.FC<InlineDashboardProps> = ({ user, onNavigate }) => {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-brand-dark text-white p-8 overflow-y-auto">
            <div className="glass-panel p-8 rounded-3xl max-w-md w-full border border-white/10">
                <h1 className="text-3xl font-bold mb-2">Hola, {user.name} 👋</h1>
                <p className="text-slate-400 mb-6">¿Qué te gustaría hacer hoy?</p>

                <div className="bg-white/5 p-4 rounded-xl mb-6 border border-white/5">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Objetivo Diario</p>
                    <p className="text-lg font-medium text-brand-primary">{user.dailyGoal || 'Definir objetivo...'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => onNavigate(AppView.FOCUS_SESSION)}
                        className="bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/30 p-4 rounded-xl flex flex-col items-center transition-all group"
                    >
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">⏱️</span>
                        <span className="font-semibold text-sm">Sesión Focus</span>
                    </button>

                    <button
                        onClick={() => onNavigate(AppView.BREATHING)}
                        className="bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 p-4 rounded-xl flex flex-col items-center transition-all group"
                    >
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🌬️</span>
                        <span className="font-semibold text-sm">Respiración</span>
                    </button>

                    <button
                        onClick={() => onNavigate(AppView.COMMUNITY)}
                        className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 p-4 rounded-xl flex flex-col items-center transition-all group"
                    >
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</span>
                        <span className="font-semibold text-sm">Comunidad</span>
                    </button>

                    <button
                        onClick={() => onNavigate(AppView.ANALYTICS)}
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 p-4 rounded-xl flex flex-col items-center transition-all group"
                    >
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</span>
                        <span className="font-semibold text-sm">Estadísticas</span>
                    </button>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="w-full text-xs text-slate-500 hover:text-slate-300 py-2 transition-colors"
                >
                    Recargar Aplicación
                </button>
            </div>
        </div>
    );
};

export default InlineDashboard;
