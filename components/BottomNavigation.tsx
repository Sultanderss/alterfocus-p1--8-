import React, { useState, useEffect } from 'react';
import { Home, Zap, Users, BarChart2, User } from 'lucide-react';
import { AppView } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomNavigationProps {
    currentView: AppView;
    onNavigate: (view: AppView) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onNavigate }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Views where the navigation should be hidden (immersive screens)
    const immersiveViews = [
        AppView.SPLASH,
        AppView.ONBOARDING,
        AppView.FOCUS_SESSION,
        AppView.OFFLINE_STUDY,
        AppView.INTERVENTION,
        AppView.INTERVENTION_CONTEXTUAL,
        AppView.BREATHING,
        AppView.ALTERNATIVES,
        AppView.CRISIS,
        AppView.STUDY_PANEL,
    ];

    // Auto‑hide on scroll down, show on scroll up or touch
    // IMPORTANT: useEffect must run on every render (before early returns)
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };
        const handleTouch = () => setIsVisible(true);
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('touchstart', handleTouch, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('touchstart', handleTouch);
        };
    }, [lastScrollY]);

    // Early return AFTER all hooks
    if (immersiveViews.includes(currentView)) {
        return null;
    }

    const navItems = [
        { view: AppView.DASHBOARD, icon: <Home size={24} />, label: 'Inicio' },
        { view: AppView.COMMUNITY, icon: <Users size={24} />, label: 'Comunidad' },
        { view: AppView.AI_GUIDE, icon: <Zap size={24} />, label: 'Enfoque', isPrimary: true },
        { view: AppView.ANALYTICS, icon: <BarChart2 size={24} />, label: 'Progreso' },
        { view: AppView.SETTINGS, icon: <User size={24} />, label: 'Perfil' },
    ];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-0 left-0 right-0 p-4 z-40 pointer-events-none"
                >
                    <div className="glass-panel rounded-2xl p-2 flex items-center justify-between pointer-events-auto shadow-2xl border border-white/10 bg-brand-dark/80 backdrop-blur-xl">
                        {navItems.map((item) => {
                            const isActive = currentView === item.view;
                            if (item.isPrimary) {
                                return (
                                    <button key={item.view} onClick={() => onNavigate(item.view)} className="relative -top-6">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] border-4 border-brand-dark transform transition-transform active:scale-95 hover:scale-105">
                                            {item.icon}
                                        </div>
                                    </button>
                                );
                            }
                            return (
                                <button
                                    key={item.view}
                                    onClick={() => onNavigate(item.view)}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${isActive ? 'text-white bg-white/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                        }`}
                                >
                                    <div className={isActive ? 'text-brand-secondary' : ''}>{item.icon}</div>
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BottomNavigation;
