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

// ═══════════════════════════════════════════════════════════
// DASHBOARD CONTEXTUAL AI (v4.0)
// Observes context → Suggests ONE action → No questions
// ═══════════════════════════════════════════════════════════

export interface DashboardContext {
    userId: string;
    currentTime: Date;
    lightToday: number;
    schedule: any[];
    urgentDeadline?: any;
    nextEvent?: any;
}

export interface AIContextualAction {
    emoji: string;
    title: string;
    intro: string;
    cta: string;
    actionType: 'crisis' | 'pomodoro' | 'breathing' | 'flip-phone' | 'offline';
    duration: number;
    nextStep?: { type: string; duration: number };
}

export async function generateDashboardAction(
    context: DashboardContext
): Promise<AIContextualAction> {
    try {
        const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error("No API Key");

        const ai = new GoogleGenAI({ apiKey });
        const hour = context.currentTime.getHours();

        // Calculate hours left for urgent deadline
        const urgentHoursLeft = context.urgentDeadline
            ? Math.floor((new Date(context.urgentDeadline.start_time).getTime() - context.currentTime.getTime()) / (1000 * 60 * 60))
            : null;

        const prompt = `CONTEXTO ACTUAL:
- Hora: ${hour}:${context.currentTime.getMinutes().toString().padStart(2, '0')}
- Luz acumulada hoy: ${context.lightToday} minutos
- Entrega urgente: ${context.urgentDeadline ? `"${context.urgentDeadline.event_title}" en ${urgentHoursLeft} horas` : 'ninguna'}
- Próximo evento: ${context.nextEvent ? `"${context.nextEvent.event_title}"` : 'ninguno'}
- Estado: ${context.lightToday < 30 ? 'poco enfoque hoy' : context.lightToday < 60 ? 'enfoque moderado' : 'buen día de enfoque'}

INSTRUCCIONES:
Eres AlterFocus, un sistema inteligente anti-procrastinación para estudiantes universitarios.

Tu objetivo: **Observar el contexto y dar UN empujón directo para que el estudiante actúe YA.**

REGLAS CRÍTICAS:
1. NO preguntes "¿cómo te sientes?", "¿qué quieres hacer?", ni hagas terapia
2. SÍ observa y di lo que VES: "Tienes X en Y horas", "Es tu mejor momento", "Llevas poco enfoque hoy"
3. Introdúcete como un amigo que sabe qué necesita: natural, directo, sin presión
4. Sugiere UNA acción específica (no opciones)
5. Duración realista: 5-15 min si está bloqueado, 25-120 min si hay urgencia
6. Tono: casual, de apoyo, sin juzgar, como un amigo que te conoce
7. NUNCA uses la palabra "Pomodoro" - usa "Sesión" o "Enfoque"

TIPOS DE ACCIÓN (elige 1):
- crisis: Flip Phone largo (60-120 min) para entregas <8h
- pomodoro: 25 min focus clásico (pero NO digas "Pomodoro", di "Sesión 25 min")
- breathing: 3-5 min respiración + opcional pomodoro después
- flip-phone: 15-30 min sin distracciones
- offline: 10-20 min desconectado total

EJEMPLOS DE BUENOS MENSAJES:

Contexto: Entrega en 6h, sin empezar
✅ BUENO: {"intro": "Tienes una entrega cerca. Vamos a trabajar juntos en esto.", "cta": "Trabajar 120 min"}
❌ MALO: {"intro": "¿Cómo te sientes respecto a tu entrega?", "cta": "Iniciar sesión"}

Contexto: 3pm, slump circadiano
✅ BUENO: {"intro": "Es normal sentirse así a esta hora. Un pequeño reset te va a ayudar.", "cta": "Respirar 3 min + Sesión 15 min"}
❌ MALO: {"intro": "¿Quieres tomar un descanso?", "cta": "Ver opciones"}

Contexto: 10am, poca luz, sin presiones
✅ BUENO: {"intro": "Es tu mejor momento del día. Aprovechémoslo.", "cta": "Sesión 25 min"}
❌ MALO: {"intro": "¿Qué te gustaría hacer?", "cta": "Elegir actividad"}

FORMATO DE RESPUESTA (solo JSON válido, sin markdown):
{
  "emoji": "emoji aquí",
  "title": "título corto o vacío",
  "intro": "mensaje natural de 10-20 palabras máximo, como amigo",
  "cta": "texto del botón (sin 'Pomodoro')",
  "actionType": "tipo",
  "duration": número
}`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt
        });

        const responseText = result.text || '';
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;

        return JSON.parse(jsonStr.trim());

    } catch (error) {
        console.error('Dashboard AI generation failed:', error);

        // Smart fallback based on context
        const hour = context.currentTime.getHours();

        if (context.urgentDeadline) {
            const hoursLeft = Math.floor((new Date(context.urgentDeadline.start_time).getTime() - context.currentTime.getTime()) / (1000 * 60 * 60));
            return {
                emoji: '🚨',
                title: `${context.urgentDeadline.event_title} en ${hoursLeft}h`,
                intro: 'Tienes una entrega cerca. Vamos a trabajar juntos en esto.',
                cta: `Trabajar ${Math.min(hoursLeft * 60, 120)} min`,
                actionType: 'crisis',
                duration: Math.min(hoursLeft * 60, 120)
            };
        } else if (hour >= 14 && hour <= 16 && context.lightToday < 30) {
            return {
                emoji: '😴',
                title: 'Slump de las 3pm',
                intro: 'Es normal sentirse así a esta hora. Un pequeño reset te ayudará.',
                cta: 'Respirar 3 min',
                actionType: 'breathing',
                duration: 3,
                nextStep: { type: 'pomodoro', duration: 15 }
            };
        } else if (hour >= 9 && hour <= 11 && context.lightToday < 30) {
            return {
                emoji: '🌅',
                title: 'Momento productivo',
                intro: 'Es tu mejor momento del día. Aprovechémoslo.',
                cta: 'Pomodoro 25 min',
                actionType: 'pomodoro',
                duration: 25
            };
        } else {
            return {
                emoji: '⚡',
                title: 'Momento de enfoque',
                intro: 'Un pequeño paso ahora hace la diferencia.',
                cta: 'Iniciar 25 min',
                actionType: 'pomodoro',
                duration: 25
            };
        }
    }
}
