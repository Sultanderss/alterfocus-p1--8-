import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MildToastProps {
    show: boolean;
    objective: string;
    attemptCount: number;
    onDismiss: () => void;
}

const MildToast: React.FC<MildToastProps> = ({ show, objective, attemptCount, onDismiss }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onDismiss, 9000); // 9 segundos
            return () => clearTimeout(timer);
        }
    }, [show, onDismiss]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-50 max-w-sm"
                >
                    <div className="glass-card p-4 border-l-4 border-amber-400 shadow-2xl">
                        <div className="flex items-start gap-3">
                            <div className="text-3xl">👀</div>
                            <div className="flex-1">
                                <div className="font-bold text-white text-sm mb-1">
                                    Recuerda tu objetivo
                                </div>
                                <div className="text-sm text-slate-300 mb-2">
                                    "{objective}"
                                </div>
                                <div className="text-xs text-slate-500">
                                    Intento {attemptCount}/2 • Intervención suave
                                </div>
                            </div>
                            <button
                                onClick={onDismiss}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MildToast;
