// ════════════════════════════════════════════
// CONTEXTUAL AI ENGINE - 10 SMART RULES
// ════════════════════════════════════════════

import { ScheduleEvent } from './supabase';

export interface UserContext {
    userId: string;
    currentTime: Date;
    schedule: ScheduleEvent[];
    lightToday: number;
    distractionLevel: number;
    userPreferences: {
        peakProcrastinationHour?: number;
        topDistractions?: string[];
        weeklyGoal?: string;
    };
}

export interface AISuggestion {
    priority: 'urgent' | 'warning' | 'opportunity' | 'planning' | 'encouragement';
    icon: string;
    message: string;
    suggestedAction: 'deepFocus' | 'flipPhone' | 'pomodoro' | 'breathing' | 'offline' | 'alternatives' | 'weeklyPlanner' | 'community';
    duration?: number;
    linkedEventId?: string;
    color: string;
}

const PRIORITY_COLORS = {
    urgent: 'from-red-500 to-rose-600',
    warning: 'from-amber-500 to-orange-600',
    opportunity: 'from-emerald-500 to-teal-600',
    planning: 'from-blue-500 to-indigo-600',
    encouragement: 'from-purple-500 to-pink-600',
};

export function generateSmartSuggestion(context: UserContext): AISuggestion | null {
    const { schedule, lightToday, distractionLevel, userPreferences, currentTime } = context;
    const now = currentTime.getTime();
    const hour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay();

    const classes = schedule.filter((e) => e.type === 'clase');
    const deadlines = schedule.filter((e) => ['entrega', 'examen'].includes(e.type));

    // ══════════════════════════════════════
    // REGLA 1: Entrega <24h + sin iniciar + alta distracción
    // ══════════════════════════════════════
    const urgentDeadlines = deadlines.filter((d) => {
        const hoursLeft = (new Date(d.start_time).getTime() - now) / (1000 * 60 * 60);
        return hoursLeft > 0 && hoursLeft < 24 && !d.started;
    });

    if (urgentDeadlines.length > 0 && distractionLevel > 5) {
        const deadline = urgentDeadlines[0];
        const hoursLeft = Math.floor((new Date(deadline.start_time).getTime() - now) / (1000 * 60 * 60));

        return {
            priority: 'urgent',
            icon: '🚨',
            message: `"${deadline.event_title}" en ${hoursLeft}h. ¿Activar Modo Crisis?`,
            suggestedAction: 'deepFocus',
            duration: Math.min(hoursLeft * 60, 120),
            linkedEventId: deadline.id,
            color: PRIORITY_COLORS.urgent,
        };
    }

    // ══════════════════════════════════════
    // REGLA 2: Clase próxima <30 min
    // ══════════════════════════════════════
    const upcomingClass = classes.find((e) => {
        const minutesUntil = (new Date(e.start_time).getTime() - now) / (1000 * 60);
        return minutesUntil > 0 && minutesUntil < 30;
    });

    if (upcomingClass && distractionLevel > 3) {
        const minutesUntil = Math.floor((new Date(upcomingClass.start_time).getTime() - now) / (1000 * 60));

        return {
            priority: 'warning',
            icon: '📚',
            message: `${upcomingClass.event_title} en ${minutesUntil} min. ¿Flip Phone para prepararte?`,
            suggestedAction: 'flipPhone',
            duration: Math.max(minutesUntil - 5, 10),
            linkedEventId: upcomingClass.id,
            color: PRIORITY_COLORS.warning,
        };
    }

    // ══════════════════════════════════════
    // REGLA 3: Gap libre >1.5h - Oportunidad de enfoque
    // ══════════════════════════════════════
    const nextClass = classes.find((e) => new Date(e.start_time).getTime() > now);
    const nextDeadline = deadlines[0];

    if (nextClass) {
        const minutesUntil = (new Date(nextClass.start_time).getTime() - now) / (1000 * 60);

        if (minutesUntil > 90 && lightToday < 60) {
            const hoursUntil = Math.floor(minutesUntil / 60);

            return {
                priority: 'opportunity',
                icon: '🎯',
                message: `${hoursUntil}h libres hasta ${nextClass.event_title}. ¿Pomodoro ${nextDeadline ? 'en ' + nextDeadline.event_title : '25 min'}?`,
                suggestedAction: 'pomodoro',
                duration: 25,
                linkedEventId: nextDeadline?.id,
                color: PRIORITY_COLORS.opportunity,
            };
        }
    }

    // ══════════════════════════════════════
    // REGLA 4: Fin de semana + entregas pendientes
    // ══════════════════════════════════════
    if ([5, 6, 0].includes(dayOfWeek)) {
        const thisWeekDeadlines = deadlines.filter((d) => {
            const daysUntil = (new Date(d.start_time).getTime() - now) / (1000 * 60 * 60 * 24);
            return daysUntil > 0 && daysUntil <= 7 && !d.started;
        });

        if (thisWeekDeadlines.length > 0) {
            return {
                priority: 'planning',
                icon: '📋',
                message: `${thisWeekDeadlines.length} entrega(s) esta semana. ¿Planificamos?`,
                suggestedAction: 'weeklyPlanner',
                linkedEventId: thisWeekDeadlines[0].id,
                color: PRIORITY_COLORS.planning,
            };
        }
    }

    // ══════════════════════════════════════
    // REGLA 5: Entrega vencida
    // ══════════════════════════════════════
    const overdue = deadlines.find((d) => {
        const isPast = new Date(d.start_time).getTime() < now;
        return isPast && d.progress_percentage < 100 && !d.completed;
    });

    if (overdue) {
        return {
            priority: 'warning',
            icon: '⏰',
            message: `"${overdue.event_title}" vencida. ¿Actualizar estado?`,
            suggestedAction: 'alternatives',
            linkedEventId: overdue.id,
            color: PRIORITY_COLORS.warning,
        };
    }

    // ══════════════════════════════════════
    // REGLA 6: Hora pico de procrastinación del usuario
    // ══════════════════════════════════════
    if (userPreferences.peakProcrastinationHour && hour === userPreferences.peakProcrastinationHour) {
        return {
            priority: 'opportunity',
            icon: '🌙',
            message: `Hora pico de distracción (${hour}:00). ¿Pomodoro preventivo?`,
            suggestedAction: 'pomodoro',
            duration: 15,
            color: PRIORITY_COLORS.opportunity,
        };
    }

    // ══════════════════════════════════════
    // REGLA 7: Luz muy baja + hora productiva
    // ══════════════════════════════════════
    if (lightToday < 30 && hour >= 9 && hour <= 18) {
        return {
            priority: 'warning',
            icon: '💡',
            message: `${lightToday} min de luz hoy. ¿Sesión Offline 30 min?`,
            suggestedAction: 'offline',
            duration: 30,
            color: PRIORITY_COLORS.warning,
        };
    }

    // ══════════════════════════════════════
    // REGLA 8: Noche + poca luz
    // ══════════════════════════════════════
    if (hour >= 20 && hour <= 23 && lightToday < 60 && distractionLevel > 5) {
        return {
            priority: 'warning',
            icon: '🌃',
            message: 'Fin del día con poco enfoque. ¿Respirar 5 min para cerrar?',
            suggestedAction: 'breathing',
            duration: 5,
            color: PRIORITY_COLORS.warning,
        };
    }

    // ══════════════════════════════════════
    // REGLA 9: Fin de semana sin luz
    // ══════════════════════════════════════
    if ([6, 0].includes(dayOfWeek) && lightToday === 0 && hour > 10) {
        return {
            priority: 'encouragement',
            icon: '☀️',
            message: '15 min de enfoque hoy suma a tu racha. ¿Empezamos?',
            suggestedAction: 'pomodoro',
            duration: 15,
            color: PRIORITY_COLORS.encouragement,
        };
    }

    // ══════════════════════════════════════
    // REGLA 10: Alta luz hoy - Celebrar
    // ══════════════════════════════════════
    if (lightToday >= 120) {
        return {
            priority: 'encouragement',
            icon: '🎉',
            message: `¡${lightToday} min de luz! Vas excelente. Toma un respiro.`,
            suggestedAction: 'breathing',
            duration: 3,
            color: PRIORITY_COLORS.encouragement,
        };
    }

    // ══════════════════════════════════════
    // REGLA DEFAULT: Sugerencia genérica si hay entregas
    // ══════════════════════════════════════
    if (deadlines.length > 0 && lightToday < 60) {
        const nextDeadline = deadlines[0];
        return {
            priority: 'opportunity',
            icon: '✨',
            message: `¿Avanzar en "${nextDeadline.event_title}"? Cada minuto cuenta.`,
            suggestedAction: 'pomodoro',
            duration: 25,
            linkedEventId: nextDeadline.id,
            color: PRIORITY_COLORS.opportunity,
        };
    }

    return null;
}

// ════════════════════════════════════════════
// ESTIMATE DISTRACTION LEVEL (0-10)
// ════════════════════════════════════════════

export function estimateDistractionLevel(lightToday: number, hour: number): number {
    // Afternoon slump (14-16h) = higher distraction
    if (hour >= 14 && hour <= 16) {
        return lightToday < 60 ? 6 : 3;
    }

    // Morning but no focus yet = high distraction
    if (hour >= 9 && hour <= 12 && lightToday < 30) {
        return 7;
    }

    // Evening with low light = moderate distraction
    if (hour >= 20 && hour <= 23 && lightToday < 90) {
        return 6;
    }

    // Early morning = low distraction
    if (hour >= 6 && hour <= 9) {
        return 2;
    }

    // Default
    return 3;
}

// ════════════════════════════════════════════
// GENERATE GREETING BASED ON TIME
// ════════════════════════════════════════════

export function getTimeBasedGreeting(): { greeting: string; emoji: string } {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return { greeting: 'Buenos días', emoji: '🌅' };
    } else if (hour >= 12 && hour < 18) {
        return { greeting: 'Buenas tardes', emoji: '☀️' };
    } else if (hour >= 18 && hour < 22) {
        return { greeting: 'Buenas noches', emoji: '🌙' };
    } else {
        return { greeting: 'Hola', emoji: '🌃' };
    }
}

// ════════════════════════════════════════════
// FORMAT TIME RELATIVE TO NOW
// ════════════════════════════════════════════

export function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const target = typeof date === 'string' ? new Date(date) : date;
    const diffMs = target.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 0) {
        return 'Vencido';
    } else if (diffMins < 60) {
        return `En ${diffMins}m`;
    } else if (diffHours < 24) {
        return `En ${diffHours}h`;
    } else if (diffDays === 1) {
        return 'Mañana';
    } else if (diffDays < 7) {
        return `En ${diffDays} días`;
    } else {
        return target.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    }
}

// ════════════════════════════════════════════
// PRIORITY COLOR MAPPING
// ════════════════════════════════════════════

export function getPriorityColor(priority: 'rojo' | 'amarillo' | 'verde'): string {
    switch (priority) {
        case 'rojo':
            return 'bg-red-500';
        case 'amarillo':
            return 'bg-amber-500';
        case 'verde':
            return 'bg-emerald-500';
        default:
            return 'bg-slate-500';
    }
}

export function getPriorityLabel(priority: 'rojo' | 'amarillo' | 'verde'): string {
    switch (priority) {
        case 'rojo':
            return 'Urgente';
        case 'amarillo':
            return 'Importante';
        case 'verde':
            return 'Normal';
        default:
            return '';
    }
}
