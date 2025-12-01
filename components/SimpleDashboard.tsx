import React from 'react';

import { UserState, AppView } from '../types';

interface SimpleDashboardProps {
    user: UserState;
    onNavigate: (view: AppView) => void;
}

const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ user, onNavigate }) => {
    return (
        <div
            className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-dark via-brand-surface to-brand-dark text-white p-8"
        >
            <div className="glass-panel p-8 rounded-3xl max-w-md w-full">
                <h1 className="text-4xl font-bold mb-4">✅ Dashboard Cargado Exitosamente</h1>
                <p className="text-slate-300 mb-6">
                    Hola <span className="text-brand-primary font-bold">{user.name}</span>!
                    El Dashboard está funcionando correctamente (Sin Animaciones).
                </p>
                <div className="bg-black/30 p-4 rounded-xl mb-4">
                    <p className="text-sm text-slate-400">Objetivo del día:</p>
                    <p className="text-lg font-bold">{user.dailyGoal || 'No definido'}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-xl mb-4">
                    <p className="text-sm text-slate-400">Puntos:</p>
                    <p className="text-lg font-bold">{user.points} pts</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold hover:bg-brand-primary/80 transition-colors"
                >
                    Recargar Aplicación
                </button>
            </div>
        </div>
    );
};

export default SimpleDashboard;
