import { describe, it, expect, beforeEach } from 'vitest';
import * as ArchetypeEngine from '../lib/archetypeEngine';

describe('ArchetypeEngine - Detección Multi-Señal', () => {
    beforeEach(() => {
        // Mock localStorage required for internal storage
        const localStorageMock = (function () {
            let store: Record<string, string> = {};
            return {
                getItem: function (key: string) {
                    return store[key] || null;
                },
                setItem: function (key: string, value: string) {
                    store[key] = value.toString();
                },
                clear: function () {
                    store = {};
                },
                removeItem: function (key: string) {
                    delete store[key];
                }
            };
        })();

        Object.defineProperty(global, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        localStorage.clear();
    });

    it('debería detectar Fear desde anxiety + recent_failures', () => {
        const result = ArchetypeEngine.detectArchetype({
            anxiety_level: 8,
            recent_failures: true
        });
        expect(result.primary).toBe('Fear');
        expect(result.confidence_primary).toBeGreaterThan(0.7);
    });

    it('debería detectar LowEnergy desde baja energía', () => {
        const result = ArchetypeEngine.detectArchetype({
            energy_level: 2
        });
        expect(result.primary).toBe('LowEnergy');
    });

    it('debería detectar Confusion desde overwhelm', () => {
        const result = ArchetypeEngine.detectArchetype({
            clarity: 'overwhelmed'
        });
        expect(result.primary).toBe('Confusion');
    });

    it('debería detectar Chronic desde patrón', () => {
        const result = ArchetypeEngine.detectArchetype({
            procrastination_history: 'often' // Updated to match type 'often' | 'sometimes' | 'rarely'
        });
        expect(result.primary).toBe('Chronic');
    });

    it('debería detectar Fear-LowEnergy híbrido', () => {
        const result = ArchetypeEngine.detectArchetype({
            anxiety_level: 7,
            energy_level: 2
        });
        expect(result.primary).toBe('Fear');
        expect(result.secondary).toBe('LowEnergy');
    });

    it('debería retornar intervenciones para Fear', () => {
        const interventions = ArchetypeEngine.getInterventionsForArchetype('Fear');
        expect(interventions.length).toBeGreaterThan(0);
        expect(interventions[0].priority).toBe('critical'); // Fear usually has critical interventions
    });

    it('debería guardar detección en localStorage', () => {
        const detection = ArchetypeEngine.detectArchetype({ anxiety_level: 8 });
        const current = ArchetypeEngine.getCurrentArchetype();
        expect(current?.primary).toBe(detection.primary);
    });
});
