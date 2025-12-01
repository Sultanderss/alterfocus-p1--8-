/**
 * AI CONTEXT SERVICE
 * Uses Google Gemini to generate personalized, contextual interventions
 */

import { GoogleGenAI } from '@google/genai';
import { UserState, FocusConfig } from '../types';

export interface UserContext {
    blockedSite?: string;
    sessionActive: boolean;
    sessionTimeRemaining?: number;
    attemptCount: number;
    timeOfDay: string;
    isProductiveHour: boolean;
    recentCompletions: number;
    goal: string;
    professionalGoal?: string;
    currentMaterial?: string;
    emotionalState?: string;
}

export interface AIInterventionResponse {
    message: string;
    tone: 'empathic' | 'motivational' | 'direct';
    actions: {
        label: string;
        duration: number;
        icon: string;
    }[];
}

/**
 * Builds complete user context from app state
 */
export function buildUserContext(
    user: UserState,
    blockedSite?: string,
    sessionConfig?: FocusConfig
): UserContext {
    const now = new Date();
    const hour = now.getHours();

    const timeOfDay =
        hour < 12 ? 'mañana' :
            hour < 18 ? 'tarde' : 'noche';

    // Check if current hour matches user's peak productivity time
    const isProductiveHour =
        (user.peakTime === 'Mañana' && hour >= 8 && hour < 12) ||
        (user.peakTime === 'Tarde' && hour >= 14 && hour < 18) ||
        (user.peakTime === 'Noche' && hour >= 20);

    const history = JSON.parse(localStorage.getItem('alterfocus_history') || '[]');
    const today = new Date().toDateString();
    const recentCompletions = history.filter((r: any) =>
        new Date(r.date).toDateString() === today && r.completed
    ).length;

    return {
        blockedSite,
        sessionActive: !!sessionConfig,
        sessionTimeRemaining: sessionConfig?.durationMinutes,
        attemptCount: user.dailyTikTokAttempts,
        timeOfDay,
        isProductiveHour,
        recentCompletions,
        goal: user.dailyGoal || 'Estudiar',
        professionalGoal: user.name.includes('Desarrollador') ? 'Desarrollador de Software' : undefined,
        currentMaterial: undefined, // TODO: Add to UserState
    };
}

/**
 * Generates contextual intervention message using Gemini AI
 */
export async function generateContextualIntervention(
    context: UserContext
): Promise<AIInterventionResponse> {
    try {
        const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error("No API Key");

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Eres un coach empático de productividad que ayuda a estudiantes a mantenerse enfocados. Un estudiante está intentando distraerse y necesitas intervenir con empatía pero también firmeza.

**CONTEXTO DEL ESTUDIANTE:**
${context.blockedSite ? `- Acaba de intentar abrir: **${context.blockedSite}**` : ''}
${context.sessionActive ? `- Tiene una sesión de enfoque activa (${context.sessionTimeRemaining} min restantes)` : '- No tiene sesión activa en este momento'}
- Intentos de distracción hoy: ${context.attemptCount}
- Momento del día: ${context.timeOfDay} ${context.isProductiveHour ? '(ES su hora pico de productividad ⭐)' : '(no es su mejor hora)'}
- Sesiones completadas hoy: ${context.recentCompletions}
- Su objetivo principal: "${context.goal}"
${context.professionalGoal ? `- Su meta a largo plazo: ${context.professionalGoal}` : ''}

**TU MISIÓN:**
1. Genera un mensaje en **PRIMERA PERSONA** (desde la perspectiva de la app) que:
   - Sea empático pero cuestionador ("¿Qué está pasando realmente?", "¿Esto te acerca a tu meta?")
   - Reconozca su esfuerzo si ha completado sesiones
   - Mencione específicamente el sitio que intenta abrir y su contexto actual
   - Haga REFLEXIONAR sobre las consecuencias ("cada minuto cuenta", "llevas X intentos")
   - NO sea condescendiente ni regañón, sino un amigo que te hace pensar
   
2. Sugiere 3 opciones de acción ESPECÍFICAS con tiempo estimado (3-15 min):
   - Primera opción: Rápida y fácil (5 min o menos) - "respirar", "descanso mental"
   - Segunda opción: Productiva moderada (7-10 min) - relacionada con su objetivo
   - Tercera opción: Sesión completa (10-15 min) - comprometerse al enfoque
   - Usa verbos de acción y sé específico con su objetivo

**FORMATO JSON (OBLIGATORIO):**
{
  "message": "Mensaje empático y cuestionador aquí (máx 40 palabras)",
  "tone": "empathic",
  "actions": [
    {"label": "5 min — Respirar y volver", "duration": 5, "icon": "🫁"},
    {"label": "7 min — [acción específica relacionada con su objetivo]", "duration": 7, "icon": "⚡"},
    {"label": "15 min — Sesión completa", "duration": 15, "icon": "🎯"}
  ]
}`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt
        });

        const responseText = result.text || '';

        // Extract JSON from markdown code blocks if present
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;

        const aiResponse = JSON.parse(jsonStr.trim());

        return aiResponse;
    } catch (error) {
        console.error('AI generation failed:', error);

        // Fallback response
        return {
            message: context.sessionActive
                ? `Llevas ${context.sessionTimeRemaining} minutos enfocado. ¿Seguro que quieres romper el ritmo?`
                : `Ya llevas ${context.attemptCount} intentos de distracción hoy. ¿Qué está pasando?`,
            tone: 'empathic',
            actions: [
                { label: '5 min — Respirar y volver', duration: 5, icon: '🫁' },
                { label: '10 min — Trabajar en objetivo', duration: 10, icon: '🎯' },
                { label: '15 min — Sesión completa', duration: 15, icon: '⏱️' }
            ]
        };
    }
}
