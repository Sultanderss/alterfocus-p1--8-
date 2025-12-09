# AlterFocus V2.0 - Roadmap Post-Deploy

## Fase 1: Validación Clínica (Semanas 1-2)
- [ ] Contactar 3 psicólogos para revisar los 8 arquetipos (actualmente 4 en P0).
- [ ] Verificar red flags correctos (Depresión, Ansiedad severa).
- [ ] Ajustar disclaimers legales por arquetipo.

## Fase 2: Instrumentación Real (Semanas 3-4)
- [ ] Integrar FocusSession timer (FIX_6): Validar éxito por tiempo real, no por botón.
- [ ] Auto-calcular effectiveness = `min(100, (duration_min/30)*100)`.
- [ ] Implementar re-detection cada 7 días (FIX_8) usando `archetype_redetection_schedule`.

## Fase 3: A/B Testing (Semanas 5-6)
- [ ] Configurar cohortes en Supabase (`abtest_cohort`):
    - Grupo CONTROL (solo tracking).
    - Grupo TREATMENT (intervenciones P0 + V2).
- [ ] Medir métricas de éxito vs Hawthorne effect.

## Fase 4: Validación Local (Ongoing)
- [ ] Reclutar 20 usuarios piloto (UniDelNorte preferiblemente).
- [ ] Diversidad: 30% mujeres, 30% primer semestre.
- [ ] Medir: Tasa de abandono (dropout), Engagement diario, Efectividad percibida vs real.

## Estado Técnico V2
Tablas de soporte SQL ya diseñadas (ver `v2_roadmap_critique.sql`):
1. `system_critique_log`
2. `archetype_clinical_definitions`
3. `onboarding_clinical_screening`
4. `focus_session` (instrumented)
5. `intervention_effectiveness_measured`
6. `archetype_redetection_schedule`
7. `productivity_streak`
8. `abtest_cohort`
9. `audit_log`
10. `gdpr_data_deletion_request`
