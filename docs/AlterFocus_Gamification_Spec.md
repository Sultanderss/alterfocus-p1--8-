# 🧠 ALTERFOCUS SYSTEM CONTEXT: GAMIFICATION & PROGRESSION
# VERSION: 2.0 (The Identity Economy)

## 1. CORE PHILOSOPHY
**Principio Fundamental:** AlterFocus no usa una "Economía de Mercado" (ganar monedas para gastar). Usa una **"Economía de Identidad"**.
- **Objetivo:** El usuario no acumula riqueza virtual, acumula *evidencia* de su autodominio.
- **Regla de Oro:** Los "Momentos" (puntos) NUNCA se gastan. Son un historial inmutable de victorias.
- **Emoción:** Victoria, Claridad, Identidad.

---

## 2. DEFINITIONS & UNITS

### A. La Unidad: "MOMENTO"
- **Definición:** Bloque de tiempo de enfoque exitoso (Default: 25 min) o una intervención de Rayo completada.
- **Valor:** Intangible. Representa "Tiempo de Vida Recuperado".
- **Visual:** Orbes de Luz / Partículas brillantes que se suman al perfil.

### B. El Mecanismo: "CLAIM" (Reclamar)
- Al finalizar un timer, el usuario debe pulsar manualmente `[RECLAMAR MOMENTO]`.
- **Feedback:** Haptic suave (latido) + Sonido de "aire/respiración" (no moneda/arcade).

---

## 3. DATA MODEL

```typescript
interface UserIdentity {
  totalMomentos: number;      // Acumulado histórico (NUNCA disminuye)
  currentStreak: number;      // Días consecutivos
  longestStreak: number;      // Récord personal
  level: IdentityLevel;       // Calculado via totalMomentos
  unlockedMilestones: string[];
}

enum IdentityLevel {
  INICIANTE = "Iniciante Curioso",         // 0-50 Momentos
  CONSTRUCTOR = "Constructor de Hábitos",  // 51-200 Momentos
  EXPLORADOR = "Explorador Consistente",   // 201-500 Momentos
  ARQUITECTO = "Arquitecto de la Atención",// 501-1000 Momentos
  GUIA = "Guía del Foco"                   // 1000+ Momentos
}
```

---

## 4. PROGRESSION THRESHOLDS

| Momentos | Nivel | Mensaje |
|----------|-------|---------|
| 0-50 | Iniciante Curioso | "El viaje hacia mi propia mente ha comenzado." |
| 51-200 | Constructor de Hábitos | "La repetición es mi nueva herramienta." |
| 201-500 | Explorador Consistente | "Encuentro claridad incluso en días difíciles." |
| 501-1000 | Arquitecto de la Atención | "Yo decido dónde fluye mi energía." |
| 1000+ | Guía del Foco | "La procrastinación ya no es rival para mi voluntad." |

---

## 5. COPYWRITING RULES

### NEVER Use
- "Ganaste", "Compraste", "Puntos", "Tienda", "Monedas"

### ALWAYS Use
- "Reclamaste", "Recuperaste", "Momentos", "Historial"

### Examples
- **Success:** "Has tallado otro Momento de claridad en tu día."
- **Streak Break:** "Tu racha terminó, pero tu historial permanece. Empecemos de nuevo."
