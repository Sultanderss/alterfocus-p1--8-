/**
 * MICROSOFT GRAPH API INTEGRATION
 * Sincroniza calendario de Outlook con AlterFocus
 */

import * as msal from '@azure/msal-browser';
import { supabase } from './supabase';

// Configuración MSAL
const msalConfig: msal.Configuration = {
    auth: {
        clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
        redirectUri: import.meta.env.VITE_APP_URL || window.location.origin,
        postLogoutRedirectUri: import.meta.env.VITE_APP_URL || window.location.origin
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
    }
};

let msalInstance: msal.PublicClientApplication | null = null;

/**
 * Verifica si Microsoft está configurado
 */
export function isMicrosoftConfigured(): boolean {
    return !!import.meta.env.VITE_MICROSOFT_CLIENT_ID;
}

/**
 * Inicializa instancia MSAL
 */
export async function initMSAL(): Promise<msal.PublicClientApplication> {
    if (msalInstance) return msalInstance;

    if (!isMicrosoftConfigured()) {
        throw new Error('Microsoft Client ID no configurado');
    }

    msalInstance = new msal.PublicClientApplication(msalConfig);
    await msalInstance.initialize();
    return msalInstance;
}

/**
 * Login con Microsoft (popup)
 */
export async function loginWithMicrosoft(): Promise<string> {
    const instance = await initMSAL();

    try {
        const response = await instance.loginPopup({
            scopes: ['Calendars.Read', 'User.Read'],
        });
        return response.accessToken;
    } catch (error) {
        console.error('Microsoft login error:', error);
        throw new Error('Error al iniciar sesión con Microsoft');
    }
}

/**
 * Obtiene token de acceso (silencioso o popup)
 */
export async function getMicrosoftAccessToken(): Promise<string> {
    const instance = await initMSAL();
    const accounts = instance.getAllAccounts();

    if (accounts.length === 0) {
        return await loginWithMicrosoft();
    }

    try {
        const response = await instance.acquireTokenSilent({
            scopes: ['Calendars.Read'],
            account: accounts[0],
        });
        return response.accessToken;
    } catch (error) {
        // Token expirado, pedir nuevo
        const response = await instance.loginPopup({
            scopes: ['Calendars.Read'],
        });
        return response.accessToken;
    }
}

/**
 * Cerrar sesión de Microsoft
 */
export async function logoutMicrosoft(): Promise<void> {
    if (!msalInstance) return;

    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
        await msalInstance.logoutPopup({
            account: accounts[0]
        });
    }
}

/**
 * Interface para eventos de calendario
 */
export interface OutlookEvent {
    id: string;
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    tipo: 'clase' | 'entrega' | 'examen' | 'estudio' | 'descanso';
    source: 'outlook';
    priority: 'rojo' | 'amarillo' | 'verde';
    location?: string;
}

/**
 * Obtiene eventos del calendario de Outlook
 */
export async function fetchOutlookCalendar(
    accessToken: string,
    daysAhead: number = 7
): Promise<OutlookEvent[]> {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    futureDate.setHours(23, 59, 59, 999);

    const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${now.toISOString()}&endDateTime=${futureDate.toISOString()}`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error de Microsoft Graph: ${errorData?.error?.message || response.status}`);
    }

    const data = await response.json();

    return (data.value || []).map((event: any) => ({
        id: event.id,
        titulo: event.subject || 'Sin título',
        descripcion: event.bodyPreview || '',
        fecha_inicio: event.start?.dateTime || new Date().toISOString(),
        fecha_fin: event.end?.dateTime || new Date().toISOString(),
        tipo: classifyOutlookEvent(event.subject || ''),
        source: 'outlook' as const,
        priority: calculateEventPriority(new Date(event.start?.dateTime)),
        location: event.location?.displayName || ''
    }));
}

/**
 * Clasifica tipo de evento basado en título
 */
function classifyOutlookEvent(title: string): 'clase' | 'entrega' | 'examen' | 'estudio' | 'descanso' {
    const lower = title.toLowerCase();

    if (/entrega|trabajo|tarea|assignment|homework|deadline|due/i.test(lower)) return 'entrega';
    if (/examen|parcial|quiz|test|final|evaluación|exam/i.test(lower)) return 'examen';
    if (/clase|lecture|session|sesión|class|cátedra|curso/i.test(lower)) return 'clase';
    if (/estudio|study|práctica|practice|lab|laboratorio|grupo/i.test(lower)) return 'estudio';

    return 'clase'; // Default para eventos de Outlook
}

/**
 * Calcula prioridad basada en fecha
 */
function calculateEventPriority(date: Date): 'rojo' | 'amarillo' | 'verde' {
    const hoursLeft = (date.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursLeft < 24) return 'rojo';
    if (hoursLeft < 72) return 'amarillo';
    return 'verde';
}

/**
 * Sincroniza calendario de Outlook con Supabase
 */
export async function syncOutlookToSchedule(
    userId: string,
    accessToken: string
): Promise<number> {
    const events = await fetchOutlookCalendar(accessToken, 14); // 2 semanas

    let savedCount = 0;

    // Importar dinámicamente para evitar dependencia circular
    const { addScheduleEvent } = await import('./supabase');

    for (const event of events) {
        try {
            await addScheduleEvent(userId, {
                eventTitle: event.titulo,
                description: event.descripcion,
                location: event.location,
                startTime: new Date(event.fecha_inicio),
                endTime: new Date(event.fecha_fin),
                type: event.tipo,
                priority: event.priority,
                source: 'outlook'
            });
            savedCount++;
        } catch (error) {
            console.error('Error guardando evento de Outlook:', error);
        }
    }

    return savedCount;
}

/**
 * Guarda token de Microsoft en preferencias
 */
export async function saveMicrosoftToken(userId: string, token: string): Promise<void> {
    if (supabase) {
        const { error } = await supabase
            .from('user_preferences')
            .update({ outlook_token: token })
            .eq('user_id', userId);

        if (error) throw error;
    } else {
        // Fallback localStorage
        const prefs = JSON.parse(localStorage.getItem('alterfocus_preferences') || '{}');
        prefs.outlook_token = token;
        localStorage.setItem('alterfocus_preferences', JSON.stringify(prefs));
    }
}

/**
 * Obtiene información del usuario de Microsoft
 */
export async function getMicrosoftUser(accessToken: string): Promise<{ name: string; email: string }> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
    });

    if (!response.ok) {
        throw new Error('Error obteniendo información del usuario');
    }

    const data = await response.json();
    return {
        name: data.displayName || data.givenName || 'Usuario',
        email: data.mail || data.userPrincipalName || ''
    };
}

export default {
    isMicrosoftConfigured,
    initMSAL,
    loginWithMicrosoft,
    getMicrosoftAccessToken,
    logoutMicrosoft,
    fetchOutlookCalendar,
    syncOutlookToSchedule,
    saveMicrosoftToken,
    getMicrosoftUser
};
