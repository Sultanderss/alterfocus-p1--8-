import React, { useState, useEffect, useRef } from 'react';
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
    const [isDormant, setIsDormant] = useState(false);
    const [isTemporarilyActive, setIsTemporarilyActive] = useState(false);
    const lastTapRef = useRef<number>(0);
    const dormantTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Views where the navigation should be COMPLETELY hidden
    // NOTE: Do NOT add COMMUNITY, SETTINGS, ANALYTICS, AI_GUIDE here - they need the nav bar!
    const hiddenViews = [
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
        AppView.FLIP_PHONE_MODE,
        AppView.EXERCISE_GATE,
        AppView.SCHEDULE_UPLOAD,
    ];

    // Auto‑hide on scroll down, show on scroll up
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

    // Handle navigation click
    const handleNavClick = (view: AppView) => {
        onNavigate(view);
    };

    // Early return for hidden views
    if (hiddenViews.includes(currentView)) {
        return null;
    }

    const navItems = [
        { view: AppView.DASHBOARD, icon: <Home size={24} />, label: 'Inicio' },
        { view: AppView.COMMUNITY, icon: <Users size={24} />, label: 'Comunidad' },
        { view: AppView.AI_GUIDE, icon: <Zap size={24} />, label: 'Rayo', isPrimary: true },
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
                    className="absolute bottom-4 left-0 right-0 z-50 pointer-events-none flex justify-center px-4 overflow-visible"
                >
                    <div className="glass-panel w-full max-w-md rounded-[2.5rem] py-2 px-5 flex items-center justify-between pointer-events-auto shadow-2xl border border-slate-200/50 dark:border-white/10 backdrop-blur-xl bg-white/80 dark:bg-black/60 transition-all duration-300 overflow-visible">
                        {navItems.map((item) => {
                            const isActive = currentView === item.view;
                            if (item.isPrimary) {
                                return (
                                    <button
                                        key={item.view}
                                        onClick={() => handleNavClick(item.view)}
                                        className="relative -top-6 transition-transform hover:scale-105 active:scale-95 group"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-[0_4px_20px_rgba(168,85,247,0.4)] border-[4px] border-white dark:border-[#09090b] group-hover:border-purple-50 dark:group-hover:border-[#121217] transition-colors">
                                            {item.icon}
                                        </div>
                                    </button>
                                );
                            }
                            return (
                                <button
                                    key={item.view}
                                    onClick={() => handleNavClick(item.view)}
                                    className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all border ${isActive
                                        ? 'text-purple-600 dark:text-white bg-purple-50 dark:bg-white/10 border-purple-100 dark:border-white/20 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-transparent hover:bg-slate-100 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <div className={isActive ? 'drop-shadow-sm scale-100' : 'scale-90'}>{item.icon}</div>
                                    <span className="text-[10px] font-bold mt-0.5 leading-none opacity-90">{item.label}</span>
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

