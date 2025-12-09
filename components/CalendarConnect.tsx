/**
 * CALENDAR CONNECT COMPONENT
 * Permite conectar Microsoft 365 Outlook y Brightspace
 * para sincronización automática de eventos y entregas
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Link2,
    Check,
    AlertCircle,
    Loader2,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import {
    isMicrosoftConfigured,
    loginWithMicrosoft,
    syncOutlookToSchedule,
    getMicrosoftUser
} from '../lib/microsoftGraph';
import {
    isBrightspaceConfigured,
    getDemoBrightspaceData
} from '../lib/brightspaceAPI';
import { getLocalUserId, addScheduleEvent } from '../lib/supabase';

interface CalendarConnectProps {
    userId?: string;
    onSyncComplete?: (source: string, count: number) => void;
    onClose?: () => void;
}

interface ConnectionStatus {
    outlook: 'idle' | 'connecting' | 'connected' | 'error';
    brightspace: 'idle' | 'connecting' | 'connected' | 'error';
}

export default function CalendarConnect({ userId, onSyncComplete, onClose }: CalendarConnectProps) {
    const [status, setStatus] = useState<ConnectionStatus>({
        outlook: 'idle',
        brightspace: 'idle'
    });
    const [outlookUser, setOutlookUser] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [syncedCounts, setSyncedCounts] = useState({ outlook: 0, brightspace: 0 });

    const effectiveUserId = userId || getLocalUserId();

    const handleConnectOutlook = async () => {
        if (!isMicrosoftConfigured()) {
            setError('Microsoft no está configurado. Agrega VITE_MICROSOFT_CLIENT_ID a tu .env');
            return;
        }

        setStatus(s => ({ ...s, outlook: 'connecting' }));
        setError(null);

        try {
            const token = await loginWithMicrosoft();
            const user = await getMicrosoftUser(token);
            setOutlookUser(user.name);

            // Sincronizar calendario
            const count = await syncOutlookToSchedule(effectiveUserId, token);
            setSyncedCounts(s => ({ ...s, outlook: count }));

            setStatus(s => ({ ...s, outlook: 'connected' }));
            onSyncComplete?.('outlook', count);
        } catch (err: any) {
            console.error('Outlook connection error:', err);
            setError(err.message || 'Error conectando con Microsoft');
            setStatus(s => ({ ...s, outlook: 'error' }));
        }
    };

    const handleConnectBrightspace = async () => {
        setStatus(s => ({ ...s, brightspace: 'connecting' }));
        setError(null);

        try {
            // En desarrollo, usar datos de demo
            if (!isBrightspaceConfigured()) {
                // Simular carga
                await new Promise(resolve => setTimeout(resolve, 1500));

                const demoData = getDemoBrightspaceData();
                let saved = 0;

                for (const assignment of demoData) {
                    try {
                        await addScheduleEvent(effectiveUserId, {
                            eventTitle: assignment.titulo,
                            description: assignment.descripcion,
                            startTime: new Date(assignment.fecha_inicio),
                            endTime: new Date(assignment.fecha_fin),
                            type: assignment.tipo,
                            priority: assignment.priority,
                            source: 'brightspace',
                            courseCode: assignment.courseId,
                            courseName: assignment.courseName
                        });
                        saved++;
                    } catch (e) {
                        console.error('Error saving demo assignment:', e);
                    }
                }

                setSyncedCounts(s => ({ ...s, brightspace: saved }));
                setStatus(s => ({ ...s, brightspace: 'connected' }));
                onSyncComplete?.('brightspace', saved);
                return;
            }

            // TODO: Implementar OAuth real de Brightspace
            setError('Brightspace OAuth no implementado. Usando datos de demo.');
            setStatus(s => ({ ...s, brightspace: 'error' }));
        } catch (err: any) {
            console.error('Brightspace connection error:', err);
            setError(err.message || 'Error conectando con Brightspace');
            setStatus(s => ({ ...s, brightspace: 'error' }));
        }
    };

    const getStatusIcon = (s: ConnectionStatus['outlook']) => {
        switch (s) {
            case 'connecting':
                return <Loader2 size={18} className="animate-spin text-blue-400" />;
            case 'connected':
                return <Check size={18} className="text-emerald-400" />;
            case 'error':
                return <AlertCircle size={18} className="text-red-400" />;
            default:
                return <ChevronRight size={18} className="text-slate-400" />;
        }
    };

    const getStatusText = (source: 'outlook' | 'brightspace') => {
        const s = status[source];
        const count = syncedCounts[source];

        switch (s) {
            case 'connecting':
                return 'Conectando...';
            case 'connected':
                return `${count} evento(s) sincronizado(s)`;
            case 'error':
                return 'Error';
            default:
                return 'Click para conectar';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Link2 size={20} className="text-blue-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Conectar Calendarios</h3>
                    <p className="text-xs text-slate-400">Sincroniza automáticamente</p>
                </div>
            </div>

            {/* Connection Options */}
            <div className="space-y-3">
                {/* Microsoft 365 */}
                <button
                    onClick={handleConnectOutlook}
                    disabled={status.outlook === 'connecting' || status.outlook === 'connected'}
                    className={`
                        w-full p-4 rounded-xl border transition-all flex items-center gap-4
                        ${status.outlook === 'connected'
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : status.outlook === 'error'
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-slate-900/50 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50'
                        }
                        ${status.outlook === 'connecting' ? 'cursor-wait' : ''}
                    `}
                >
                    {/* Microsoft Logo */}
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <svg viewBox="0 0 23 23" className="w-6 h-6">
                            <rect x="0" y="0" width="11" height="11" fill="#f25022" />
                            <rect x="12" y="0" width="11" height="11" fill="#7fba00" />
                            <rect x="0" y="12" width="11" height="11" fill="#00a4ef" />
                            <rect x="12" y="12" width="11" height="11" fill="#ffb900" />
                        </svg>
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-white">
                            Microsoft 365
                            {outlookUser && <span className="text-slate-400 font-normal ml-2">({outlookUser})</span>}
                        </p>
                        <p className="text-xs text-slate-400">
                            {getStatusText('outlook')}
                        </p>
                    </div>
                    {getStatusIcon(status.outlook)}
                </button>

                {/* Brightspace */}
                <button
                    onClick={handleConnectBrightspace}
                    disabled={status.brightspace === 'connecting' || status.brightspace === 'connected'}
                    className={`
                        w-full p-4 rounded-xl border transition-all flex items-center gap-4
                        ${status.brightspace === 'connected'
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : status.brightspace === 'error'
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-slate-900/50 border-slate-700 hover:border-orange-500/50 hover:bg-slate-800/50'
                        }
                        ${status.brightspace === 'connecting' ? 'cursor-wait' : ''}
                    `}
                >
                    {/* Brightspace Logo */}
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Calendar size={20} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-white">Brightspace Uninorte</p>
                        <p className="text-xs text-slate-400">
                            {getStatusText('brightspace')}
                        </p>
                    </div>
                    {getStatusIcon(status.brightspace)}
                </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-xl"
                    >
                        <p className="text-sm text-red-300 flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Summary */}
            {(status.outlook === 'connected' || status.brightspace === 'connected') && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-emerald-900/30 border border-emerald-700/50 rounded-xl"
                >
                    <p className="text-sm text-emerald-300 flex items-center gap-2">
                        <Check size={16} />
                        {syncedCounts.outlook + syncedCounts.brightspace} evento(s) sincronizado(s) en total
                    </p>
                </motion.div>
            )}

            {/* Note */}
            <p className="mt-4 text-xs text-slate-500">
                💡 Tus calendarios se sincronizarán automáticamente cada 24 horas
            </p>
        </motion.div>
    );
}
