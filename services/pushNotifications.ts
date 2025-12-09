/**
 * SMART PUSH NOTIFICATIONS SERVICE
 * 
 * Servicio de notificaciones push inteligentes para AlterFocus.
 * Detecta patrones y envía recordatorios preventivos.
 */

// Check browser support
export const isPushSupported = (): boolean => {
    return 'Notification' in window && 'serviceWorker' in navigator;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!isPushSupported()) {
        console.warn('[PUSH] Notifications not supported');
        return 'denied';
    }

    try {
        const permission = await Notification.requestPermission();
        console.log('[PUSH] Permission:', permission);
        return permission;
    } catch (error) {
        console.error('[PUSH] Permission error:', error);
        return 'denied';
    }
};

// Get current permission status
export const getNotificationPermission = (): NotificationPermission => {
    if (!isPushSupported()) return 'denied';
    return Notification.permission;
};

// Send a notification
export const sendNotification = (
    title: string,
    options?: NotificationOptions
): Notification | null => {
    if (Notification.permission !== 'granted') {
        console.warn('[PUSH] Permission not granted');
        return null;
    }

    try {
        const notification = new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            ...options
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return notification;
    } catch (error) {
        console.error('[PUSH] Send error:', error);
        return null;
    }
};

// ============================================
// SMART NOTIFICATION TRIGGERS
// ============================================

interface SmartNotificationConfig {
    userId: string;
    archetype?: string;
    peakProcrastinationHour?: number;
}

// Schedule smart notifications based on user patterns
export const scheduleSmartNotifications = (config: SmartNotificationConfig): void => {
    const { archetype, peakProcrastinationHour } = config;

    // Check permission
    if (Notification.permission !== 'granted') {
        console.log('[PUSH] Not scheduling - no permission');
        return;
    }

    // Get current hour
    const now = new Date();
    const currentHour = now.getHours();

    // Peak hour warning (30 min before)
    if (peakProcrastinationHour) {
        const warningHour = peakProcrastinationHour - 0.5;

        if (Math.abs(currentHour - warningHour) < 0.5) {
            sendNotification('⚠️ Alerta de Vulnerabilidad', {
                body: `Tu hora de mayor procrastinación se acerca. ¿Listo para enfocarte?`,
                tag: 'peak-hour-warning',
                renotify: false
            });
        }
    }

    // Archetype-specific motivation
    if (archetype) {
        const messages: Record<string, { title: string; body: string }> = {
            Fear: {
                title: '💪 Recuerda: Imperfecto es perfecto',
                body: 'No necesitas hacerlo perfecto. Solo empieza con la versión crappy.'
            },
            LowEnergy: {
                title: '⚡ ¡Actívate!',
                body: '10 segundos de movimiento pueden cambiar tu día. ¿Listo?'
            },
            Confusion: {
                title: '📋 Claridad en 3 pasos',
                body: '¿Cuál es EL PRIMER paso? Solo uno. Pequeño.'
            },
            Chronic: {
                title: '🔄 Rompe el patrón hoy',
                body: 'Recuerda tu contrato personal. Hoy es diferente.'
            }
        };

        const msg = messages[archetype];
        if (msg) {
            // Random chance to show (not spam user)
            if (Math.random() < 0.3) { // 30% chance
                setTimeout(() => {
                    sendNotification(msg.title, {
                        body: msg.body,
                        tag: 'archetype-motivation',
                        renotify: false
                    });
                }, 60000); // 1 min delay
            }
        }
    }
};

// Focus session reminders
export const sendFocusReminder = (): void => {
    sendNotification('🎯 ¿Sigues enfocado?', {
        body: 'Han pasado algunos minutos. ¿Todo bien con tu sesión?',
        tag: 'focus-check',
        requireInteraction: true
    });
};

// Break reminder
export const sendBreakReminder = (): void => {
    sendNotification('☕ Momento de descanso', {
        body: 'Has trabajado duro. Toma 5 minutos para tu bienestar.',
        tag: 'break-reminder'
    });
};

// Intervention nudge
export const sendInterventionNudge = (interventionType: string): void => {
    const messages: Record<string, { title: string; body: string }> = {
        crappy_version: {
            title: '🎨 ¿Atascado por perfeccionismo?',
            body: 'Hazlo feo. 2 minutos. Sin excusas.'
        },
        breakdown_3steps: {
            title: '📋 ¿Abrumado?',
            body: 'Divide en 3 pasos. Solo el primero importa ahora.'
        },
        breathing: {
            title: '🌬️ Respira',
            body: '4-7-8. Un minuto de calma puede cambiarlo todo.'
        },
        movement: {
            title: '🚶 ¡Muévete!',
            body: '10 jumping jacks. Tu cerebro te lo agradecerá.'
        }
    };

    const msg = messages[interventionType] || messages.breathing;
    sendNotification(msg.title, { body: msg.body, tag: 'intervention-nudge' });
};

// Success celebration
export const sendSuccessNotification = (points: number): void => {
    sendNotification('🎉 ¡Logro desbloqueado!', {
        body: `+${points} puntos. ¡Sigue así, campeón!`,
        tag: 'success'
    });
};

// Export all
export default {
    isPushSupported,
    requestNotificationPermission,
    getNotificationPermission,
    sendNotification,
    scheduleSmartNotifications,
    sendFocusReminder,
    sendBreakReminder,
    sendInterventionNudge,
    sendSuccessNotification
};
