/**
 * ARCHETYPE ENGINE - Sistema de Detección de Arquetipos de Procrastinación
 * 
 * 4 Arquetipos Base + 2 Híbridos:
 * 1. FEAR (Miedo/Perfeccionismo)
 * 2. LOW_ENERGY (Baja Dopamina/Apatía)
 * 3. CONFUSION (Incertidumbre/Sobrecarga)
 * 4. CHRONIC (Patrón de Identidad/Hábito)
 * 5. FEAR+LOW_ENERGY (Híbrido)
 * 6. FEAR+CONFUSION (Híbrido)
 */

export type Archetype = 'Fear' | 'LowEnergy' | 'Confusion' | 'Chronic';
export type HybridArchetype = 'Fear-LowEnergy' | 'Fear-Confusion' | 'Confusion-LowEnergy';
export type AnyArchetype = Archetype | HybridArchetype;

export interface DetectionSignals {
    feeling?: 'energetic' | 'normal' | 'tired' | 'anxious' | 'paralyzed';
    clarity?: 'clear' | 'unclear' | 'confused' | 'overwhelmed';
    energy_level?: number; // 1-10
    anxiety_level?: number; // 1-10
    recent_failures?: boolean;
    task_importance?: number; // 1-10
    procrastination_history?: 'never' | 'sometimes' | 'often' | 'always' | 'habit';
}

export interface ArchetypeDetection {
    primary: AnyArchetype;
    secondary: AnyArchetype | null;
    confidence_primary: number;
    confidence_secondary: number;
    signals: DetectionSignals;
    detected_at: string;
    message: string;
    emoji: string;
}

export interface InterventionOption {
    id: string;
    label: string;
    description: string;
    duration: number;
    embodied: boolean;
    priority: 'critical' | 'high' | 'medium' | 'low';
    emoji: string;
    effectiveness?: number;
}

// Storage Keys
const STORAGE_KEY = 'alterfocus_archetype_current';
const HISTORY_KEY = 'alterfocus_archetype_history';
const EFFECTIVENESS_KEY = 'alterfocus_intervention_effectiveness';

/**
 * DETECCIÓN MULTI-SEÑAL DE ARQUETIPOS
 */
export function detectArchetype(signals: DetectionSignals): ArchetypeDetection {
    let primary: AnyArchetype = 'Fear';
    let secondary: AnyArchetype | null = null;
    let confidence_primary = 0.5;
    let confidence_secondary = 0.0;

    const anxiety = signals.anxiety_level || 5;
    const energy = signals.energy_level || 5;
    const clarity = signals.clarity || 'clear';
    const history = signals.procrastination_history || 'sometimes';
    const feeling = signals.feeling || 'normal';

    // SEÑAL 1: FEAR (Ansiedad + Perfeccionismo)
    if (anxiety >= 7 || feeling === 'anxious' || signals.recent_failures) {
        primary = 'Fear';
        confidence_primary = Math.min(0.95, 0.6 + (anxiety / 10) * 0.35);
    }

    // SEÑAL 2: LOW_ENERGY (Baja dopamina)
    if (energy <= 3 || feeling === 'tired') {
        primary = 'LowEnergy';
        confidence_primary = 0.9 - (energy / 10);
    }

    // SEÑAL 3: CONFUSION (Incertidumbre + Sobrecarga)
    if (clarity === 'overwhelmed' || clarity === 'confused' || feeling === 'paralyzed') {
        primary = 'Confusion';
        confidence_primary = clarity === 'overwhelmed' ? 0.9 : 0.75;
    }

    // SEÑAL 4: CHRONIC (Patrón de identidad)
    if (history === 'always' || history === 'habit') {
        primary = 'Chronic';
        confidence_primary = 0.8;
    }

    // HÍBRIDOS (Múltiples señales fuertes)
    if (anxiety >= 7 && energy <= 3) {
        primary = 'Fear';
        secondary = 'LowEnergy';
        confidence_primary = 0.75;
        confidence_secondary = 0.7;
    }

    if (anxiety >= 7 && (clarity === 'confused' || clarity === 'overwhelmed')) {
        primary = 'Fear';
        secondary = 'Confusion';
        confidence_primary = 0.8;
        confidence_secondary = 0.75;
    }

    if ((clarity === 'overwhelmed' || clarity === 'confused') && energy <= 3) {
        primary = 'Confusion';
        secondary = 'LowEnergy';
        confidence_primary = 0.85;
        confidence_secondary = 0.7;
    }

    const detection: ArchetypeDetection = {
        primary,
        secondary,
        confidence_primary,
        confidence_secondary,
        signals,
        detected_at: new Date().toISOString(),
        message: getArchetypeMessage(primary),
        emoji: getArchetypeEmoji(primary)
    };

    // Guardar
    saveCurrent(detection);
    addToHistory(detection);

    console.log(`[ARCHETYPE] Detected: ${primary} (${Math.round(confidence_primary * 100)}%)${secondary ? ` + ${secondary}` : ''}`);

    return detection;
}

/**
 * INTERVENCIONES ESPECÍFICAS POR ARQUETIPO
 */
export function getInterventionsForArchetype(archetype: AnyArchetype): InterventionOption[] {
    const interventions: Record<string, InterventionOption[]> = {
        Fear: [
            {
                id: 'magic_question',
                label: 'Pregunta Mágica',
                description: '¿Esta tarea te acerca o aleja de lo que importa?',
                duration: 30,
                embodied: false,
                priority: 'high',
                emoji: '⚡'
            },
            {
                id: 'crappy_version',
                label: 'Versión Crappy',
                description: 'Hazlo feo, sin calidad. 2 minutos.',
                duration: 120,
                embodied: false,
                priority: 'high',
                emoji: '🎨'
            },
            {
                id: 'gesture_anchor',
                label: 'Gesto de Liberación',
                description: 'Puño cerrado → abre. Di: "Elijo actuar"',
                duration: 20,
                embodied: true,
                priority: 'medium',
                emoji: '🤝'
            },
            {
                id: 'breathing_4_7_8',
                label: 'Respiración 4-7-8',
                description: 'Inhala 4, sostén 7, exhala 8',
                duration: 60,
                embodied: true,
                priority: 'medium',
                emoji: '🫁'
            }
        ],
        LowEnergy: [
            {
                id: 'movement_activation',
                label: 'Movimiento Intenso',
                description: '10 Jumping Jacks o 30 seg corriendo',
                duration: 30,
                embodied: true,
                priority: 'high',
                emoji: '🚶'
            },
            {
                id: 'quick_5min',
                label: 'Solo 5 Minutos',
                description: 'Micro-compromiso: después decides',
                duration: 300,
                embodied: false,
                priority: 'high',
                emoji: '⏱️'
            },
            {
                id: 'dopamine_spike',
                label: 'Estímulo Rápido',
                description: 'Música motivacional, 60 segundos',
                duration: 60,
                embodied: true,
                priority: 'medium',
                emoji: '🎵'
            },
            {
                id: 'cold_water',
                label: 'Choque Sensorial',
                description: 'Agua fría en cara/muñecas',
                duration: 20,
                embodied: true,
                priority: 'medium',
                emoji: '❄️'
            }
        ],
        Confusion: [
            {
                id: 'breakdown_3steps',
                label: 'Breakdown 3 Pasos',
                description: '¿Cuál es EL PRIMERO?',
                duration: 180,
                embodied: false,
                priority: 'high',
                emoji: '📋'
            },
            {
                id: 'brain_dump',
                label: 'Dump Mental',
                description: 'Escribe TODO sin orden',
                duration: 300,
                embodied: true,
                priority: 'high',
                emoji: '📝'
            },
            {
                id: 'magic_question',
                label: 'Pregunta Mágica',
                description: 'Reflexión clarificadora',
                duration: 30,
                embodied: false,
                priority: 'medium',
                emoji: '⚡'
            }
        ],
        Chronic: [
            {
                id: 'personal_contract',
                label: 'Contrato Personal',
                description: 'Si siento X, entonces haré Y',
                duration: 60,
                embodied: false,
                priority: 'high',
                emoji: '📜'
            },
            {
                id: 'pattern_interrupt',
                label: 'Interrupción de Patrón',
                description: 'Cambia lugar, música, postura',
                duration: 120,
                embodied: true,
                priority: 'high',
                emoji: '🔄'
            },
            {
                id: 'ritual_change',
                label: 'Ritual Diferente',
                description: 'Movimiento que rompa tu rutina',
                duration: 60,
                embodied: true,
                priority: 'medium',
                emoji: '🎭'
            }
        ],
        'Fear-LowEnergy': [
            {
                id: 'movement_activation',
                label: 'Muévete PRIMERO',
                description: 'Libera ansiedad vía cuerpo',
                duration: 30,
                embodied: true,
                priority: 'critical',
                emoji: '🚶'
            },
            {
                id: 'crappy_version',
                label: 'Después: Versión Crappy',
                description: 'Movimiento + acción imperfecta',
                duration: 120,
                embodied: false,
                priority: 'high',
                emoji: '🎨'
            }
        ],
        'Fear-Confusion': [
            {
                id: 'gesture_anchor',
                label: 'Gesto Primero',
                description: 'Libera el miedo',
                duration: 20,
                embodied: true,
                priority: 'critical',
                emoji: '🤝'
            },
            {
                id: 'breakdown_3steps',
                label: 'Después: Breakdown',
                description: 'Estructura disuelve confusión',
                duration: 180,
                embodied: false,
                priority: 'high',
                emoji: '📋'
            }
        ],
        'Confusion-LowEnergy': [
            {
                id: 'movement_activation',
                label: 'Activa tu cuerpo',
                description: 'Despierta el sistema',
                duration: 30,
                embodied: true,
                priority: 'critical',
                emoji: '🚶'
            },
            {
                id: 'breakdown_3steps',
                label: 'Clarifica después',
                description: 'Con energía viene claridad',
                duration: 180,
                embodied: false,
                priority: 'high',
                emoji: '📋'
            }
        ]
    };

    let options = interventions[archetype] || interventions.Fear;

    // Reordena por efectividad del usuario
    const effectiveness = getEffectiveness();
    options = options.map(opt => ({
        ...opt,
        effectiveness: effectiveness[opt.id] || 0.5
    })).sort((a, b) => (b.effectiveness || 0.5) - (a.effectiveness || 0.5));

    return options;
}

/**
 * GUARDAR FEEDBACK DE INTERVENCIÓN
 */
export function saveInterventionFeedback(
    interventionId: string,
    feedback: {
        helpful: boolean;
        returned_to_focus: boolean;
        emotional_rating: number;
    }
): void {
    const effectiveness = getEffectiveness();

    if (!effectiveness[interventionId]) {
        effectiveness[interventionId] = 0.5;
    }

    // Ajusta score
    if (feedback.helpful && feedback.returned_to_focus) {
        effectiveness[interventionId] = Math.min(1, effectiveness[interventionId] + 0.1);
    } else if (!feedback.helpful) {
        effectiveness[interventionId] = Math.max(0, effectiveness[interventionId] - 0.05);
    }

    localStorage.setItem(EFFECTIVENESS_KEY, JSON.stringify(effectiveness));
    console.log(`[ARCHETYPE] Feedback: ${interventionId} → ${effectiveness[interventionId].toFixed(2)}`);
}

/**
 * OBTENER DETECCIÓN ACTUAL
 */
export function getCurrentArchetype(): ArchetypeDetection | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

/**
 * OBTENER HISTORIAL
 */
export function getArchetypeHistory(): ArchetypeDetection[] {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// ===== HELPERS PRIVADOS =====

function saveCurrent(detection: ArchetypeDetection): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(detection));
}

function addToHistory(detection: ArchetypeDetection): void {
    const history = getArchetypeHistory();
    history.push(detection);
    if (history.length > 50) history.shift();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function getEffectiveness(): Record<string, number> {
    try {
        const stored = localStorage.getItem(EFFECTIVENESS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function getArchetypeMessage(archetype: AnyArchetype): string {
    const messages: Record<AnyArchetype, string> = {
        Fear: 'Detectamos MIEDO. Vamos a romper la parálisis del perfeccionismo.',
        LowEnergy: 'Tu energía está baja. Muévete primero, después todo fluye.',
        Confusion: 'Te abruma la incertidumbre. Vamos a clarificar en 3 pasos.',
        Chronic: 'Este es tu patrón habitual. Hoy lo interrumpimos.',
        'Fear-LowEnergy': 'Miedo + Cansancio. Primero activa el cuerpo, luego actúa.',
        'Fear-Confusion': 'Ansioso y sin claridad. Respira y luego estructura.',
        'Confusion-LowEnergy': 'Confundido y agotado. Muévete, luego organiza.'
    };
    return messages[archetype];
}

function getArchetypeEmoji(archetype: AnyArchetype): string {
    const emojis: Record<AnyArchetype, string> = {
        Fear: '😰',
        LowEnergy: '😴',
        Confusion: '🤔',
        Chronic: '⚙️',
        'Fear-LowEnergy': '😰😴',
        'Fear-Confusion': '😰🤔',
        'Confusion-LowEnergy': '🤔😴'
    };
    return emojis[archetype];
}

export default {
    detectArchetype,
    getInterventionsForArchetype,
    saveInterventionFeedback,
    getCurrentArchetype,
    getArchetypeHistory
};
