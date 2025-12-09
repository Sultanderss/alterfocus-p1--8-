/**
 * GEMINI AI MESSAGE GENERATOR
 * Generates personalized intervention messages using Google Gemini API
 * Falls back to contextual static messages if API is unavailable
 */

import { EmotionalState, InterventionType } from '../types';
import { CircadianPattern } from './circadianContext';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GeminiMessageContext {
    userGoal: string;
    emotionalState: EmotionalState;
    interventionType: InterventionType;
    attemptCount: number;
    circadianPattern: CircadianPattern;
    userName?: string;
    blockedSite?: string;
    sessionDurationMinutes?: number;
}

export interface GeneratedMessage {
    mainMessage: string;
    supportingMessage: string;
    actionLabel: string;
    source: 'gemini' | 'fallback';
}

/**
 * Generate a personalized intervention message using Gemini AI
 */
export async function generateInterventionMessage(
    context: GeminiMessageContext
): Promise<GeneratedMessage> {
    // If no API key, use fallback
    if (!GEMINI_API_KEY) {
        return getFallbackMessage(context);
    }

    try {
        const prompt = buildPrompt(context);

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                    topP: 0.9,
                }
            })
        });

        if (!response.ok) {
            console.warn('Gemini API error, using fallback');
            return getFallbackMessage(context);
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            return getFallbackMessage(context);
        }

        // Parse the JSON response
        try {
            const parsed = JSON.parse(generatedText);
            return {
                mainMessage: parsed.mainMessage || getFallbackMessage(context).mainMessage,
                supportingMessage: parsed.supportingMessage || '',
                actionLabel: parsed.actionLabel || 'Volver al trabajo',
                source: 'gemini'
            };
        } catch {
            // If parsing fails, use the text directly
            return {
                mainMessage: generatedText.trim(),
                supportingMessage: '',
                actionLabel: 'Volver al trabajo',
                source: 'gemini'
            };
        }
    } catch (error) {
        console.warn('Failed to generate AI message:', error);
        return getFallbackMessage(context);
    }
}

/**
 * Build the prompt for Gemini
 */
function buildPrompt(context: GeminiMessageContext): string {
    return `Eres un coach de productividad empático para AlterFocus, una app que ayuda estudiantes universitarios a evitar distracciones.

CONTEXTO:
- Meta del usuario: "${context.userGoal}"
- Estado emocional: ${context.emotionalState}
- Intento de distracción #${context.attemptCount}
- Hora del día: ${getTimeDescription(context.circadianPattern)}
- Sitio bloqueado: ${context.blockedSite || 'una distracción'}
${context.sessionDurationMinutes ? `- Tiempo en sesión: ${context.sessionDurationMinutes} minutos` : ''}

INSTRUCCIONES:
1. Genera un mensaje corto (máx 15 palabras) que sea empático pero firme
2. NO seas condescendiente ni moralista
3. Conecta con la emoción detectada (${context.emotionalState})
4. Usa un tono de "amigo que te entiende"
5. Si es ${context.circadianPattern}, menciona algo sobre el momento del día

Responde SOLO en formato JSON:
{
  "mainMessage": "mensaje principal corto",
  "supportingMessage": "frase de apoyo opcional",
  "actionLabel": "texto del botón de acción"
}`;
}

/**
 * Get time description for prompt
 */
function getTimeDescription(pattern: CircadianPattern): string {
    const descriptions: Record<CircadianPattern, string> = {
        morning_flow: 'mañana productiva (9-11am)',
        midday_active: 'mediodía activo (11am-2pm)',
        circadian_slump: 'bajón de las 2pm (2-4pm)',
        afternoon_recovery: 'tarde recuperación (4-6pm)',
        evening_wind_down: 'noche descendiendo (6-9pm)',
        night_pressure: 'noche de deadline (9pm-1am)',
        late_night: 'madrugada (1-6am)',
        early_morning: 'mañana temprana (6-9am)'
    };
    return descriptions[pattern] || 'momento neutro';
}

/**
 * Fallback messages when Gemini is unavailable
 */
function getFallbackMessage(context: GeminiMessageContext): GeneratedMessage {
    const { emotionalState, attemptCount, circadianPattern, blockedSite } = context;

    // Emotional state based messages
    const emotionalMessages: Record<EmotionalState, string[]> = {
        anxiety: [
            'Respirar primero, decidir después.',
            'La ansiedad te está empujando. Pausa.',
            'Cuando el cuerpo pide escape, el cerebro necesita pausa.'
        ],
        confusion: [
            '¿No sabes por dónde empezar? Empecemos por respirar.',
            'La confusión es normal. Vamos paso a paso.',
            'Cuando todo parece mucho, una cosa a la vez.'
        ],
        fatigue: [
            'Tu cuerpo pide descanso, no dopamina rápida.',
            'El cansancio no se cura con scroll infinito.',
            'Más pantallas = más cansancio. Rompe el ciclo.'
        ],
        overwhelm: [
            'Sentirse abrumado es señal de que necesitas parar.',
            'Está bien no poder con todo. Pausa y prioriza.',
            'El overwhelm pide descanso, no distracción.'
        ],
        mild_distraction: [
            '¿Es esto urgente o es una fuga de dopamina?',
            'Un momento de reflexión antes de ceder.',
            'Tu yo del futuro te agradecerá si vuelves al trabajo.'
        ],
        neutral: [
            '¿Esto te acerca o te aleja de tu meta?',
            'Pequeña pausa para decidir conscientemente.',
            'Reflexiona un segundo antes de continuar.'
        ]
    };

    // Circadian-aware additions
    const circadianAdditions: Partial<Record<CircadianPattern, string>> = {
        morning_flow: '☀️ Tu mejor hora está pasando.',
        circadian_slump: '😴 Es el bajón de las 2pm.',
        night_pressure: '🌙 Es tarde. Las decisiones nocturnas cuestan.',
        late_night: '🛏️ Dormir sería más productivo.'
    };

    const messages = emotionalMessages[emotionalState] || emotionalMessages.neutral;
    const messageIndex = Math.min(attemptCount - 1, messages.length - 1);
    let mainMessage = messages[Math.max(0, messageIndex)];

    // Add circadian context
    const circadianAddition = circadianAdditions[circadianPattern];
    if (circadianAddition && attemptCount > 1) {
        mainMessage = `${circadianAddition} ${mainMessage}`;
    }

    // Add blocked site context
    const supportingMessage = blockedSite
        ? `Intentaste abrir ${blockedSite}. ¿Realmente lo necesitas ahora?`
        : '';

    return {
        mainMessage,
        supportingMessage,
        actionLabel: attemptCount > 2 ? 'Elegir herramienta' : 'Volver al trabajo',
        source: 'fallback'
    };
}

/**
 * Quick sync version for immediate display (uses fallback)
 */
export function getQuickMessage(context: GeminiMessageContext): GeneratedMessage {
    return getFallbackMessage(context);
}

/**
 * Cache for AI-generated messages to reduce API calls
 */
const messageCache = new Map<string, { message: GeneratedMessage; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedOrGenerateMessage(
    context: GeminiMessageContext
): Promise<GeneratedMessage> {
    const cacheKey = `${context.emotionalState}-${context.attemptCount}-${context.circadianPattern}`;
    const cached = messageCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.message;
    }

    const message = await generateInterventionMessage(context);
    messageCache.set(cacheKey, { message, timestamp: Date.now() });

    return message;
}

export default {
    generateInterventionMessage,
    getQuickMessage,
    getCachedOrGenerateMessage
};
