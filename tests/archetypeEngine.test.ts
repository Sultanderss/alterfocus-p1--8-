/**
 * ARCHETYPE ENGINE TESTS
 * Tests básicos para el motor de arquetipos
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    detectArchetype,
    getInterventionsForArchetype,
    getCurrentArchetype,
    type DetectionSignals
} from '../lib/archetypeEngine';

describe('ArchetypeEngine', () => {
    beforeEach(() => {
        // Mock localStorage
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
            value: localStorageMock
        });

        localStorage.clear();
    });

    describe('detectArchetype', () => {
        it('should detect Fear archetype when anxiety is high', () => {
            const signals: DetectionSignals = {
                feeling: 'anxious',
                anxiety_level: 8,
                energy_level: 5
            };

            const result = detectArchetype(signals);

            expect(result.primary).toBe('Fear');
            expect(result.confidence_primary).toBeGreaterThan(0.7);
            expect(result.emoji).toBe('😰');
        });

        it('should detect LowEnergy archetype when energy is low', () => {
            const signals: DetectionSignals = {
                feeling: 'tired',
                energy_level: 2,
                anxiety_level: 2
            };

            const result = detectArchetype(signals);

            expect(result.primary).toBe('LowEnergy');
            expect(result.emoji).toBe('😴');
        });

        it('should detect Confusion archetype when clarity is overwhelmed', () => {
            const signals: DetectionSignals = {
                clarity: 'overwhelmed',
                energy_level: 5,
                anxiety_level: 5
            };

            const result = detectArchetype(signals);

            expect(result.primary).toBe('Confusion');
            expect(result.emoji).toBe('🤔');
        });

        it('should detect Chronic archetype for habitual procrastinators', () => {
            const signals: DetectionSignals = {
                procrastination_history: 'always',
                clarity: 'clear'
            };

            const result = detectArchetype(signals);

            expect(result.primary).toBe('Chronic');
            expect(result.emoji).toBe('⚙️');
        });

        it('should detect hybrid archetype Fear+Confusion', () => {
            const signals: DetectionSignals = {
                feeling: 'anxious',
                anxiety_level: 8,
                clarity: 'overwhelmed'
            };

            const result = detectArchetype(signals);

            expect(result.primary).toBe('Fear');
            expect(result.secondary).toBe('Confusion');
        });

        it('should save detection to localStorage', () => {
            const signals: DetectionSignals = {
                feeling: 'anxious',
                anxiety_level: 7
            };

            detectArchetype(signals);
            const current = getCurrentArchetype();

            expect(current).not.toBeNull();
            expect(current?.primary).toBe('Fear');
        });
    });

    describe('getInterventionsForArchetype', () => {
        it('should return interventions for Fear archetype', () => {
            const interventions = getInterventionsForArchetype('Fear');

            expect(interventions.length).toBeGreaterThan(0);
            expect(interventions.some(i => i.id === 'crappy_version')).toBe(true);
        });

        it('should return interventions for LowEnergy archetype', () => {
            const interventions = getInterventionsForArchetype('LowEnergy');

            expect(interventions.length).toBeGreaterThan(0);
            expect(interventions.some(i => i.embodied === true)).toBe(true);
        });

        it('should return interventions for Confusion archetype', () => {
            const interventions = getInterventionsForArchetype('Confusion');

            expect(interventions.length).toBeGreaterThan(0);
            expect(interventions.some(i => i.id === 'breakdown_3steps')).toBe(true);
        });

        it('should return interventions for Chronic archetype', () => {
            const interventions = getInterventionsForArchetype('Chronic');

            expect(interventions.length).toBeGreaterThan(0);
            expect(interventions.some(i => i.id === 'personal_contract')).toBe(true);
        });

        it('should prioritize interventions correctly', () => {
            const interventions = getInterventionsForArchetype('Fear');

            // First intervention should be high or critical priority
            expect(['high', 'critical']).toContain(interventions[0].priority);
        });
    });

    describe('Archetype Messages', () => {
        it('should generate appropriate message for Fear', () => {
            const result = detectArchetype({ feeling: 'anxious', anxiety_level: 8 });
            expect(result.message).toContain('miedo');
        });

        it('should generate message for each archetype', () => {
            const archetypes = ['Fear', 'LowEnergy', 'Confusion', 'Chronic'] as const;

            archetypes.forEach(archetype => {
                const interventions = getInterventionsForArchetype(archetype);
                expect(interventions.length).toBeGreaterThan(0);
            });
        });
    });
});
