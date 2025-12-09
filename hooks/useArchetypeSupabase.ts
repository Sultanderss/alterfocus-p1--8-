/**
 * useArchetypeSupabase Hook
 * Conecta el motor de arquetipos con Supabase para persistencia
 */

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    detectArchetype,
    type ArchetypeDetection,
    type DetectionSignals
} from '../lib/archetypeEngine';

export const useArchetypeSupabase = (userId: string | null) => {
    const [loading, setLoading] = useState(false);
    const [detection, setDetection] = useState<ArchetypeDetection | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Detecta arquetipo y guarda en Supabase + localStorage
     */
    const detectAndSave = async (signals: DetectionSignals): Promise<ArchetypeDetection | null> => {
        // Detectar localmente primero (siempre funciona)
        const detected = detectArchetype(signals);
        setDetection(detected);

        // Si no hay userId, solo guardamos en localStorage (ya lo hace detectArchetype)
        if (!userId) {
            console.log('[ARCHETYPE] Guardado solo en localStorage (sin userId)');
            return detected;
        }

        // Intentar guardar en Supabase
        try {
            setLoading(true);
            setError(null);

            // Upsert en user_archetype_current
            const { error: upsertError } = await supabase
                .from('user_archetype_current')
                .upsert({
                    user_id: userId,
                    primary_archetype: detected.primary,
                    secondary_archetype: detected.secondary || null,
                    confidence_primary: detected.confidence_primary,
                    confidence_secondary: detected.confidence_secondary,
                    detection_method: 'session_inference',
                    detected_at: detected.detected_at,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (upsertError) {
                console.warn('[SUPABASE] Error en upsert:', upsertError.message);
                // No falla - localStorage ya tiene el dato
            }

            // Insert en historial
            const { error: historyError } = await supabase
                .from('archetype_detection_history')
                .insert({
                    user_id: userId,
                    detected_primary: detected.primary,
                    detected_secondary: detected.secondary || null,
                    confidence_primary: detected.confidence_primary,
                    confidence_secondary: detected.confidence_secondary,
                    signals: detected.signals,
                    detected_at: detected.detected_at
                });

            if (historyError) {
                console.warn('[SUPABASE] Error en historial:', historyError.message);
            }

            console.log('[SUPABASE] Detección guardada correctamente');
            return detected;

        } catch (err: any) {
            console.error('[SUPABASE] Error:', err);
            setError(err.message || 'Error guardando en Supabase');
            return detected; // Retorna detección local aunque falle Supabase
        } finally {
            setLoading(false);
        }
    };

    /**
     * Guarda feedback de intervención en Supabase
     */
    const saveFeedback = async (data: {
        intervention_type: string;
        points: number;
        success: boolean;
        duration_actual?: number;
        user_feedback?: 'helpful' | 'not_helpful' | 'partially';
    }) => {
        if (!userId) {
            console.log('[ARCHETYPE] Feedback solo local (sin userId)');
            return;
        }

        try {
            setLoading(true);

            const { error: insertError } = await supabase
                .from('executed_interventions_v2')
                .insert({
                    user_id: userId,
                    intervention_type: data.intervention_type,
                    archetype_at_time: detection?.primary || null,
                    triggered_at: new Date().toISOString(),
                    duration_actual: data.duration_actual || null,
                    user_completed: data.success,
                    user_feedback: data.user_feedback || null,
                    points_awarded: data.points,
                    success_indicator: data.success,
                    effectiveness_rating: data.success ? 0.8 : 0.3
                });

            if (insertError) {
                console.warn('[SUPABASE] Error guardando feedback:', insertError.message);
            } else {
                console.log('[SUPABASE] Feedback guardado');
            }

        } catch (err: any) {
            console.error('[SUPABASE] Error en feedback:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Carga detección actual desde Supabase
     */
    const loadCurrent = async () => {
        if (!userId) return null;

        try {
            const { data, error } = await supabase
                .from('user_archetype_current')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error || !data) {
                console.log('[SUPABASE] No hay detección previa');
                return null;
            }

            // Reconstruir ArchetypeDetection desde Supabase
            const emojiMap: Record<string, string> = {
                Fear: '😰',
                LowEnergy: '😴',
                Confusion: '🤔',
                Chronic: '⚙️'
            };
            const reconstructed: ArchetypeDetection = {
                primary: data.primary_archetype,
                secondary: data.secondary_archetype,
                confidence_primary: data.confidence_primary,
                confidence_secondary: data.confidence_secondary || 0,
                signals: {},
                detected_at: data.detected_at,
                message: `Arquetipo: ${data.primary_archetype}`,
                emoji: emojiMap[data.primary_archetype] || '🧠'
            };

            setDetection(reconstructed);
            return reconstructed;

        } catch (err) {
            console.error('[SUPABASE] Error cargando:', err);
            return null;
        }
    };

    /**
     * Guarda contrato personal
     */
    const saveContract = async (contractText: string, signature: string) => {
        if (!userId) {
            // Guardar solo en localStorage
            localStorage.setItem('alterfocus_personal_contract', JSON.stringify({
                text: contractText,
                signature,
                created_at: new Date().toISOString()
            }));
            return;
        }

        try {
            await supabase.from('personal_contracts').insert({
                user_id: userId,
                contract_text: contractText,
                signature,
                is_active: true
            });
            console.log('[SUPABASE] Contrato guardado');
        } catch (err) {
            console.error('[SUPABASE] Error guardando contrato:', err);
        }
    };

    return {
        detection,
        loading,
        error,
        detectAndSave,
        saveFeedback,
        loadCurrent,
        saveContract
    };
};

export default useArchetypeSupabase;
