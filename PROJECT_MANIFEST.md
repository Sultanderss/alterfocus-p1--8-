# 🏗️ AlterFocus Project Manifest (v1.0 - P0 Complete)

**Fecha:** 09/12/2025
**Branch:** `main` (Production Ready)
**Estado:** 🟢 LIVE

---

## 1. Arquitectura del Sistema (P0)

### 🧠 Motor Psicológico (`src/lib/archetypeEngine.ts`)
- **Estado:** ✅ Completado
- **Capacidades:**
  - Detecta 4 arquetipos base: `Fear`, `LowEnergy`, `Confusion`, `Chronic`.
  - Soporta detección híbrida (ej. Fear + LowEnergy).
  - Cálculo de confianza basado en señales múltiples.

### 🛡️ Intervenciones (`src/components/interventions/`)
Todas implementadas con UI premium (Tailwind + Framer Motion):
1.  **Crappy Version** (Anti-Perfeccionismo)
2.  **Breakdown 3 Steps** (Anti-Confusión)
3.  **Personal Contract** (Anti-Hábito)
4.  Gesture Anchor, Brain Dump, Pattern Interrupt.

### 🔌 Integraciones
- **Onboarding:** Detecta arquetipo inicial y guarda en DB.
- **FocusSession:** Detecta distracción en tiempo real y lanza intervención.
- **Auth:** Fallback robusto (funciona con o sin conexión activa).

---

## 2. Base de Datos (Supabase)

### Esquema Actual (Implementado)
| Tabla | Propósito | Estado |
|-------|-----------|--------|
| `archetype_definitions` | Reglas de los 4 arquetipos | ✅ |
| `user_archetype_current` | Perfil actual del usuario | ✅ |
| `archetype_detection_history` | Historial de cambios | ✅ |
| `executed_interventions_v2` | Registro de uso de herramientas | ✅ |
| `personal_contracts` | Contratos firmados digitalmente | ✅ |

### Esquema V2 (Preparado en SQL)
| Tabla | Propósito | Estado |
|-------|-----------|--------|
| `system_critique_log` | Auditoría clínica (10 hallazgos) | ⏳ SQL Ready |
| `focus_session` | Telemetría precisa | ⏳ SQL Ready |
| `abtest_cohort` | Validación científica | ⏳ SQL Ready |

---

## 3. Calidad y Tests

- **Unitarios (`tests/archetype-detection.test.ts`):** Cubren la lógica del motor.
- **E2E (`cypress/e2e/archetype-flow.cy.ts`):** Valida el flujo crítico de usuario.
- **Linting:** Código limpio y tipado (TypeScript estricto).

---

## 4. Roadmap Inmediato (V2)

> Ver `V2_ROADMAP.md` para detalles de ejecución.

1.  **Validación Clínica:** Revisión por expertos de los 8 arquetipos expandidos.
2.  **Instrumentación:** Medición real de efectividad (no self-report).
3.  **A/B Testing:** Despliegue de cohortes control/tratamiento.

---

## 🔧 Comandos Útiles

- **Iniciar Dev:** `npm run dev`
- **Correr Tests:** `npm test`
- **Deploy:** `git push origin main` (Automático a Vercel)
