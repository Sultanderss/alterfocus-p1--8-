/**
 * BRIGHTSPACE VALENCE API INTEGRATION
 * Sincroniza entregas y cursos de Uninorte con AlterFocus
 */

import { supabase } from './supabase';

const BRIGHTSPACE_INSTANCE = import.meta.env.VITE_BRIGHTSPACE_INSTANCE_URL || 'https://uninorte.brightspace.com';
const BRIGHTSPACE_API_BASE = `${BRIGHTSPACE_INSTANCE}/d2l/api`;

/**
 * Verifica si Brightspace está configurado
 */
export function isBrightspaceConfigured(): boolean {
    return !!(import.meta.env.VITE_BRIGHTSPACE_CLIENT_ID && import.meta.env.VITE_BRIGHTSPACE_CLIENT_SECRET);
}

/**
 * Interface para entregas de Brightspace
 */
export interface BrightspaceAssignment {
    id: string;
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    tipo: 'entrega' | 'examen';
    source: 'brightspace';
    priority: 'rojo' | 'amarillo' | 'verde';
    courseId?: string;
    courseName?: string;
    started: boolean;
    progress_percentage: number;
}

export interface BrightspaceCourse {
    id: string;
    name: string;
    code: string;
    startDate?: string;
    endDate?: string;
}

/**
 * Autenticación con Brightspace (OAuth2 Password Grant)
 * NOTA: En producción usar Authorization Code Flow
 */
export async function fetchBrightspaceToken(
    username: string,
    password: string
): Promise<string> {
    const clientId = import.meta.env.VITE_BRIGHTSPACE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_BRIGHTSPACE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Credenciales de Brightspace no configuradas');
    }

    const response = await fetch(`${BRIGHTSPACE_API_BASE}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'password',
            username,
            password,
            client_id: clientId,
            client_secret: clientSecret,
            scope: 'content:read dropbox:read grades:read',
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Error de autenticación Brightspace: ${error.error_description || response.status}`);
    }

    const data = await response.json();

    if (!data.access_token) {
        throw new Error('No se recibió token de acceso de Brightspace');
    }

    return data.access_token;
}

/**
 * Obtiene cursos matriculados del estudiante
 */
export async function fetchCourses(accessToken: string): Promise<BrightspaceCourse[]> {
    const response = await fetch(
        `${BRIGHTSPACE_API_BASE}/lp/1.43/enrollments/myenrollments/`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error obteniendo cursos: ${response.status}`);
    }

    const data = await response.json();

    return (data.Items || []).map((enrollment: any) => ({
        id: enrollment.OrgUnit?.Id?.toString() || '',
        name: enrollment.OrgUnit?.Name || 'Sin nombre',
        code: enrollment.OrgUnit?.Code || '',
        startDate: enrollment.Access?.StartDate,
        endDate: enrollment.Access?.EndDate
    }));
}

/**
 * Obtiene entregas pendientes de todos los cursos
 */
export async function fetchPendingAssignments(accessToken: string): Promise<BrightspaceAssignment[]> {
    const response = await fetch(
        `${BRIGHTSPACE_API_BASE}/le/1.67/content/myItems/`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error obteniendo entregas: ${response.status}`);
    }

    const data = await response.json();

    // Filtrar solo items de entrega
    const assignments = (data.Items || []).filter((item: any) =>
        ['DiscussionTopic', 'Dropbox', 'Quiz', 'Assignment'].includes(item.Type)
    );

    return assignments.map((assignment: any) => {
        const dueDate = assignment.DueDate
            ? new Date(assignment.DueDate)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return {
            id: assignment.ItemId?.toString() || crypto.randomUUID(),
            titulo: assignment.Title || 'Sin título',
            descripcion: assignment.Description || '',
            fecha_inicio: new Date().toISOString(),
            fecha_fin: dueDate.toISOString(),
            tipo: assignment.Type === 'Quiz' ? 'examen' : 'entrega',
            source: 'brightspace' as const,
            priority: calculateDeadlinePriority(dueDate),
            courseId: assignment.OrgUnitId?.toString(),
            courseName: assignment.OrgUnitName || '',
            started: false,
            progress_percentage: 0,
        };
    });
}

/**
 * Calcula prioridad basada en fecha límite
 */
function calculateDeadlinePriority(dueDate: Date): 'rojo' | 'amarillo' | 'verde' {
    const hoursLeft = (dueDate.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursLeft < 24) return 'rojo';
    if (hoursLeft < 72) return 'amarillo';
    return 'verde';
}

/**
 * Obtiene notas del estudiante
 */
export async function fetchGrades(accessToken: string, courseId: string): Promise<any[]> {
    const response = await fetch(
        `${BRIGHTSPACE_API_BASE}/le/1.67/${courseId}/grades/values/myGradeValues/`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
        }
    );

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    return data.Objects || [];
}

/**
 * Sincroniza entregas de Brightspace con el calendario
 */
export async function syncBrightspaceAssignments(
    userId: string,
    accessToken: string
): Promise<number> {
    try {
        const assignments = await fetchPendingAssignments(accessToken);
        let savedCount = 0;

        const { addScheduleEvent } = await import('./supabase');

        for (const assignment of assignments) {
            try {
                await addScheduleEvent(userId, {
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
                savedCount++;
            } catch (error) {
                console.error('Error guardando entrega:', error);
            }
        }

        return savedCount;
    } catch (error) {
        console.error('Error sincronizando Brightspace:', error);
        throw error;
    }
}

/**
 * Guarda token de Brightspace en preferencias
 */
export async function saveBrightspaceToken(userId: string, token: string): Promise<void> {
    if (supabase) {
        const { error } = await supabase
            .from('user_preferences')
            .update({ brightspace_token: token })
            .eq('user_id', userId);

        if (error) throw error;
    } else {
        const prefs = JSON.parse(localStorage.getItem('alterfocus_preferences') || '{}');
        prefs.brightspace_token = token;
        localStorage.setItem('alterfocus_preferences', JSON.stringify(prefs));
    }
}

/**
 * Obtiene token guardado
 */
export async function getSavedBrightspaceToken(userId: string): Promise<string | null> {
    if (supabase) {
        const { data } = await supabase
            .from('user_preferences')
            .select('brightspace_token')
            .eq('user_id', userId)
            .single();

        return data?.brightspace_token || null;
    } else {
        const prefs = JSON.parse(localStorage.getItem('alterfocus_preferences') || '{}');
        return prefs.brightspace_token || null;
    }
}

/**
 * Datos de demo para desarrollo sin API real
 */
export function getDemoBrightspaceData(): BrightspaceAssignment[] {
    const now = Date.now();

    return [
        {
            id: 'demo-1',
            titulo: 'Taller 3 - Programación Avanzada',
            descripcion: 'Implementar sistema de gestión de inventario',
            fecha_inicio: new Date().toISOString(),
            fecha_fin: new Date(now + 48 * 60 * 60 * 1000).toISOString(), // 2 días
            tipo: 'entrega',
            source: 'brightspace',
            priority: 'amarillo',
            courseId: 'IST2089',
            courseName: 'Programación Avanzada',
            started: true,
            progress_percentage: 60
        },
        {
            id: 'demo-2',
            titulo: 'Parcial 2 - Cálculo III',
            descripcion: 'Temas: Integrales múltiples y series',
            fecha_inicio: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
            fecha_fin: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
            tipo: 'examen',
            source: 'brightspace',
            priority: 'amarillo',
            courseId: 'MAT1203',
            courseName: 'Cálculo III',
            started: false,
            progress_percentage: 0
        },
        {
            id: 'demo-3',
            titulo: 'Entrega Final - Base de Datos',
            descripcion: 'Proyecto completo con documentación',
            fecha_inicio: new Date().toISOString(),
            fecha_fin: new Date(now + 12 * 60 * 60 * 1000).toISOString(), // 12 horas
            tipo: 'entrega',
            source: 'brightspace',
            priority: 'rojo',
            courseId: 'IST2090',
            courseName: 'Base de Datos II',
            started: true,
            progress_percentage: 85
        }
    ];
}

export default {
    isBrightspaceConfigured,
    fetchBrightspaceToken,
    fetchCourses,
    fetchPendingAssignments,
    fetchGrades,
    syncBrightspaceAssignments,
    saveBrightspaceToken,
    getSavedBrightspaceToken,
    getDemoBrightspaceData
};
