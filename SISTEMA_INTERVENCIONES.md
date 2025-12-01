# 🧠 SISTEMA DE INTERVENCIONES - AlterFocus

## 📊 NIVELES DE INTERVENCIÓN

El sistema tiene **4 niveles** de intervención escalonados según la severidad del patrón detectado:

### **NIVEL 1: GENTLE TOAST** 🟢 (Suave)
**Tipo:** Notificación no intrusiva (esquina superior derecha)  
**Duración:** 5 segundos  
**Objetivo:** Recordatorio amigable

**Condiciones para activarse:**
```
attemptCount <= 2 
AND 
pattern !== 'social_emergency'
```

**Métricas necesarias:**
- `attemptCount`: Número de intentos de distracción hoy
- `pattern`: Patrón detectado por el sistema

**UI Mostrada:**
- Toast pequeño en esquina
- Mensaje: "¿Desvío detectado?"
- Recuerda la meta del usuario
- Botón: "Ignorar"

---

### **NIVEL 2: CONTEXTUAL MODAL** 🟡 (Moderado)
**Tipo:** Modal completo con sugerencias  
**Duración:** Hasta que usuario elija  
**Objetivo:** Intervención inteligente con herramientas

**Condiciones para activarse:**
```
attemptCount > 2 
AND 
attemptCount <= 5
OR
fromExtension === true (forzado)
```

**Métricas necesarias:**
- `attemptCount`: 3-5 intentos
- `sessionDurationMinutes`: Tiempo en sesión actual
- `domain`: Sitio que intenta visitar
- `hour`: Hora actual del día

**UI Mostrada:**
- Modal completo centrado
- Análisis de patrón detectado
- Objetivo del usuario destacado
- 2 botones de herramientas:
  - **IA RECOMENDADA** (según contexto)
  - **Hablar con IA**
- Indicador de intentos (3 puntos)
- Botón secundario: "Ignorar y continuar (afecta autonomía)"

---

### **NIVEL 3: FIRM INTERVENTION** 🟠 (Firme)
**Tipo:** Modal con herramienta obligatoria  
**Duración:** Hasta completar herramienta  
**Objetivo:** Romper patrón compulsivo

**Condiciones para activarse:**
```
attemptCount > 5
OR
(pattern === 'late_fatigue' AND attemptCount > 3)
```

**Métricas necesarias:**
- `attemptCount`: Más de 5 intentos
- `sessionDurationMinutes`: Más de 120 minutos
- `pattern`: Patrón de comportamiento

**UI Mostrada:**
- Modal sin opción de ignorar fácilmente
- Mensaje más firme
- Botón principal: Completar herramienta sugerida
- No hay botón "Ignorar" visible

---

### **NIVEL 4: CRISIS SOS** 🔴 (Emergencia)
**Tipo:** Pantalla completa de emergencia  
**Duración:** Hasta que usuario tome acción  
**Objetivo:** Conectar con recursos profesionales

**Condiciones para activarse:**
```
attemptCount > 7
OR
(pattern === 'late_fatigue' AND attemptCount > 5)
OR
consecutiveIgnores > 3
```

**Métricas necesarias:**
- `attemptCount`: Más de 7 intentos
- Patrón de crisis detectado
- Ignoradas consecutivas

**UI Mostrada:**
- Pantalla completa roja
- ⚠️ Icono de alerta grande
- Mensaje: "Detectamos un patrón de crisis"
- Botones:
  - **Llamar Línea PAS** (tel:3196543210)
  - **Chat Psicología SEMM**
- Texto secundario: "Estoy bien, solo quiero distraerme"

---

## 🎯 PATRONES DETECTADOS

El sistema analiza 8 patrones diferentes:

### 1. **compulsive_click** (Click Compulsivo)
**Condición:** `attemptCount >= 5`  
**Herramienta sugerida:** `reframing` (Reencuadre Cognitivo)  
**Mensaje:** "Estás clickeando compulsivamente. Paremos 1 minuto."

### 2. **early_quit** (Abandono Temprano)
**Condición:** `sessionDurationMinutes < 15`  
**Herramienta sugerida:** `timeboxing` (Solo 10 min más)  
**Mensaje:** "Apenas empezaste. Prueba trabajar solo 10 minutos más."

### 3. **late_fatigue** (Fatiga por Sesión Larga)
**Condición:** `sessionDurationMinutes > 120`  
**Herramienta sugerida:** `breathing` (Descanso)  
**Mensaje:** "Has trabajado más de 2 horas. Tu cerebro necesita un break."

### 4. **social_emergency** (Redes Sociales)
**Condición:** `domain.includes(['whatsapp', 'telegram', 'discord', 'messenger'])`  
**Herramienta sugerida:** `reframing`  
**Mensaje:** "Las redes sociales están diseñadas para atraparte ahora."

### 5. **circadian_slump** (Bajón de las 2pm)
**Condición:** `hour >= 14 AND hour < 16`  
**Herramienta sugerida:** `movement` (Pausa Activa)  
**Mensaje:** "Es el bajón de las 2pm. Tu cuerpo pide energía, no Instagram."

### 6. **circadian_pressure** (Presión Nocturna)
**Condición:** `hour >= 23 OR hour < 1`  
**Herramienta sugerida:** `breathing`  
**Mensaje:** "Es tarde. La presión del deadline te está bloqueando."

### 7. **morning_flow** (Flujo Matutino)
**Condición:** `hour >= 9 AND hour < 11`  
**Herramienta sugerida:** `breathing`  
**Mensaje:** "Es tu hora pico. Aprovecha este momento de claridad mental."

### 8. **neutral** (Sin patrón específico)
**Condición:** Ninguna de las anteriores  
**Herramienta sugerida:** `breathing`  
**Mensaje:** "¿Es esto urgente o es una fuga de dopamina?"

---

## 📈 MÉTRICAS DEL SISTEMA

### **Métricas Rastreadas:**

```typescript
interface EmotionalMetrics {
    stressLevel: number;          // 0-1 (no usado actualmente)
    fatigueLevel: number;          // 0-1 (no usado actualmente)
    focusQuality: number;          // 0-1 (no usado actualmente)
    attemptCount: number;          // ✅ USADO - Intentos de distracción hoy
    lastInterventions: string[];   // Historial de intervenciones
}
```

### **Métricas en App.tsx:**
- `user.dailyTikTokAttempts` → Cuenta intentos de distracción
- `user.completedSessions` → Sesiones completadas
- `user.focusMinutes` → Minutos totales enfocados
- `user.postponeCount` → Veces que postponió intervenciones

### **Métricas en interventionLogic.ts:**
- `attemptCount` → Intentos del día
- `sessionDurationMinutes` → Duración sesión actual
- `domain` → Sitio bloqueado
- `hour` → Hora actual (para patrones circadianos)

---

## 🔍 FLUJO DE DECISIÓN

```
1. Usuario intenta visitar sitio bloqueado
   ↓
2. Extension detecta y redirige a app con ?blocked=true&source=youtube.com
   ↓
3. App activa InterventionContextual con fromExtension=true
   ↓
4. analyzeContext() analiza:
   - attemptCount actual
   - sessionDurationMinutes
   - domain bloqueado
   - hora del día
   ↓
5. Determina PATRÓN (compulsive_click, early_quit, etc.)
   ↓
6. Decide NIVEL basado en:
   - Si attemptCount <= 2 → GENTLE_TOAST
   - Si attemptCount > 5 → CRISIS_SOS
   - Si attemptCount 3-5 → CONTEXTUAL_MODAL
   - Si fromExtension=true → FORZAR CONTEXTUAL_MODAL
   ↓
7. Selecciona HERRAMIENTA según patrón
   ↓
8. Muestra UI correspondiente
```

---

## ❌ PROBLEMAS ACTUALES DETECTADOS

### **Problema 1: Métricas No Conectadas**
Las métricas `stressLevel`, `fatigueLevel`, `focusQuality` NO se usan actualmente.
Solo se usa `attemptCount`.

### **Problema 2: attemptCount No Se Incrementa**
Cuando el usuario ignora una intervención, `attemptCount` DEBERÍA incrementarse,
pero esto solo pasa en el handler `onSkip` de App.tsx.

### **Problema 3: sessionDurationMinutes Siempre = 15**
En App.tsx se pasa un valor fijo de `15` a la lógica de intervención:
```tsx
const result = analyzeContext(
    realAttemptCount,
    15, // TODO: Conectar duración real de sesión desde props
    detectedDomain,
    currentHour
);
```

### **Problema 4: No Hay Tracking de Ignoradas Consecutivas**
El nivel CRISIS_SOS debería activarse si el usuario ignora 3+ veces seguidas,
pero esto no se está rastreando.

---

## 🛠️ SOLUCIONES PROPUESTAS

### **Fix 1: Rastrear Sesión Actual**
- Agregar `currentSessionStartTime` al state
- Calcular `sessionDurationMinutes` dinámicamente

### **Fix 2: Contador de Ignoradas Consecutivas**
```typescript
const [consecutiveIgnores, setConsecutiveIgnores] = useState(0);
```

### **Fix 3: Incrementar attemptCount Correctamente**
- Cada vez que se muestra intervención → +1
- Reiniciar al completar herramienta exitosamente

### **Fix 4: Agregar Métricas Reales**
- `stressLevel` basado en velocidad de intentos
- `fatigueLevel` basado en tiempo total de sesión
- `focusQuality` basado en sesiones completadas vs abandonadas

---

## 🧪 CÓMO PROBAR CADA NIVEL

### **Probar NIVEL 1 (Toast):**
```
1. Resetear attemptCount a 0
2. Ir a http://localhost:5175
3. Abrir nueva pestaña → youtube.com
4. Debería mostrar TOAST suave
```

### **Probar NIVEL 2 (Modal):**
```
1. Incrementar attemptCount a 3
   localStorage.setItem('dailyTikTokAttempts', '3')
2. Ir a youtube.com
3. Debería mostrar MODAL completo con herramientas
```

### **Probar NIVEL 3 (Firme):**
```
1. Incrementar attemptCount a 6
2. Ir a youtube.com
3. Debería mostrar modal SIN botón ignorar fácil
```

### **Probar NIVEL 4 (Crisis):**
```
1. Incrementar attemptCount a 8
2. Ir a youtube.com
3. Debería mostrar pantalla ROJA completa con recursos
```

---

¿Quieres que corrija estos problemas ahora y implemente un sistema de métricas REAL?
