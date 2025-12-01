# 📚 DOCUMENTACIÓN COMPLETA - AlterFocus Intervention System

## 🎯 VISIÓN GENERAL DEL PROYECTO

AlterFocus es un sistema de productividad que **ayuda a las personas a mantener el enfoque** mediante:
1. **Bloqueo inteligente** de sitios distractores (YouTube, Facebook, etc.)
2. **Intervenciones contextualizadas** según el comportamiento del usuario
3. **Herramientas de enfoque** (respiración, ejercicio, reflexión, IA)
4. **Sistema de autonomía** que recompensa el buen comportamiento

---

## 📁 ESTRUCTURA DE ARCHIVOS - QUÉ ES CADA UNO

### 🔷 **EXTENSIÓN DE CHROME** (carpeta `extension/`)

#### 1. `extension/background.js`
**QUÉ ES:** Service worker que se ejecuta en segundo plano en Chrome.

**QUÉ HACE:**
- Intercepta TODAS las navegaciones del usuario
- Compara el hostname contra una lista de sitios bloqueados
- Si detecta un sitio bloqueado, **redirige** a la aplicación web
- Lleva estadísticas de bloqueos diarios

**FLUJO DETALLADO:**
```
Usuario escribe "facebook.com" → Enter
  ↓
background.js detecta la navegación
  ↓
Compara "facebook.com" con BLOCKED_SITES
  ↓
¿Está en la lista? SÍ
  ↓
Redirige a: http://localhost:5175/?from=intervention&source=facebook.com
  ↓
Incrementa contador: blockedToday++
  ↓
Actualiza badge de extensión: muestra "1", "2", etc.
```

**FUNCIONES CLAVE:**
- `chrome.webNavigation.onBeforeNavigate.addListener()`: Escucha navegaciones
- `updateBlockStats(hostname)`: Actualiza estadísticas en localStorage
- `chrome.tabs.update(tabId, {url})`: Redirige la pestaña

#### 2. `extension/manifest.json`
**QUÉ ES:** Archivo de configuración de la extensión.

**QUÉ CONTIENE:**
- **Permisos**: `storage`, `webNavigation`, `tabs`, `declarativeNetRequest`
- **Service Worker**: Registro de `background.js`
- **Host Permissions**: Lista de dominios que puede interceptar
- **Icons**: Iconos de la extensión (16x16, 48x48, 128x128)

#### 3. `extension/rules.json`
**QUÉ ES:** Reglas declarativas de bloqueo (capa adicional de seguridad).

**QUÉ HACE:**
- Define reglas de bloqueo a nivel de red
- Más rápido que JavaScript porque se ejecuta en C++
- Backup si `background.js` falla

---

### 🔷 **APLICACIÓN WEB REACT** (carpeta raíz)

#### 1. `App.tsx` - **CEREBRO PRINCIPAL**
**QUÉ ES:** Componente raíz que controla toda la aplicación.

**ESTADOS PRINCIPALES:**
```typescript
currentView: AppView - Qué pantalla mostrar (DASHBOARD, INTERVENTION, FOCUS_SESSION, etc.)
user: UserState - Datos del usuario (nombre, puntos, objetivos)
consecutiveIgnores: number - Cuántas veces ha ignorado intervenciones
focusConfig: FocusConfig - Configuración de sesiones de enfoque
interventionTrigger: 'manual' | 'auto' - Cómo se activó la intervención
```

**FLUJO DE INICIALIZACIÓN:**
```
App carga
  ↓
useEffect #1: Lee URL params
  ↓
¿Tiene ?from=intervention? SÍ
  ↓
Resetea consecutiveIgnores a 0
  ↓
Cambia currentView a INTERVENTION_CONTEXTUAL
  ↓
Renderiza <InterventionFinal>
```

**HANDLERS IMPORTANTES:**
- `handleUpdateUser()`: Actualiza datos del usuario y guarda en localStorage
- `handleStartSession()`: Inicia una sesión de enfoque
- `handleCompleteSession()`: Termina sesión, otorga puntos
- `handleTriggerIntervention()`: Fuerza una intervención manual

---

### 🔷 **SISTEMA DE INTERVENCIÓN**

#### 1. `components/interventions/InterventionFinal.tsx` - **ORQUESTADOR**
**QUÉ ES:** Componente que decide QUÉ mostrar al usuario según su comportamiento.

**PROPS QUE RECIBE:**
```typescript
metrics: {
  attemptCount: number    // Cuántos intentos lleva (1, 2, 3...)
  sessionDurationMinutes  // Cuánto tiempo lleva trabajando
  stressLevel, fatigueLevel, focusQuality
}
userGoal: string           // "Terminar proyecto", "Estudiar", etc.
onComplete: (success) => void  // Callback cuando termina la herramienta
onSkip: () => void             // Callback cuando ignora
```

**ESTADOS INTERNOS:**
```typescript
view: 'toast' | 'tool' | 'crisis'  // Qué vista mostrar
selectedTool: InterventionType      // Qué herramienta recomendar
contextMessage: string              // Mensaje contextual a mostrar
```

**LÓGICA DE DECISIÓN (useEffect):**
```javascript
1. Lee attemptCount y hora actual
2. Decide qué herramienta recomendar:
   - Si hora 14-16: "physical_exercise" (bajón de tarde)
   - Si hora 23-01: "breathing_4_7_8" (presión deadline nocturna)
   - Si attemptCount >= 5: "ai_therapy_brief" (muchos intentos)
   - Si attemptCount >= 3: "cognitive_reframing" (reflexión)
   - Sino: "breathing_4_7_8" (default)
3. Genera mensaje contextual apropiado
4. Decide vista inicial:
   - attemptCount <= 2: 'toast' (suave)
   - attemptCount >= 6: 'crisis' (emergencia)
   - Sino: 'toast' (empieza suave)
```

**VISTAS QUE RENDERIZA:**

##### **VISTA 1: TOAST (card superior)**
```
┌─────────────────────────────────────────┐
│ 🧠 Desvío detectado (1 intento)         │
│                                         │
│ ¿Es esto urgente o es una fuga de      │
│ dopamina?                               │
│                                         │
│ [⚡ Respirar 2 min]  [Ignorar]          │
└─────────────────────────────────────────┘
```

**ELEMENTOS:**
- **Icono Brain**: Indicador visual de intervención
- **Título**: Muestra número de intentos
- **Mensaje contextual**: Personalizado según hora/patrón
- **Botón "Respirar 2 min"** (o herramienta recomendada):
  - onClick: `setView('tool')` → Cambia a vista completa de herramienta
- **Botón "Ignorar"** (solo si attemptCount <= 2):
  - onClick: `onSkip()` → Ejecuta callback que incrementa contador
- **Botón X** (esquina superior):
  - onClick: `onSkip()` → Mismo que "Ignorar"

**SI attemptCount > 2:**
- NO muestra botón "Ignorar"
- Muestra advertencia: "⚠️ Has ignorado esto X veces. Es momento de actuar."

##### **VISTA 2: TOOL (pantalla completa)**
```
┌─────────────────────────────────────────┐
│                                         │
│         [HERRAMIENTA COMPLETA]          │
│                                         │
│  (Breathing / Exercise / Reframing /    │
│   AI Therapy según selectedTool)        │
│                                         │
└─────────────────────────────────────────┘
```

**QUÉ HACE:**
- Llama a `renderTool(selectedTool, userGoal, onComplete)`
- Renderiza el componente de herramienta apropiado
- Pantalla completa negra de fondo
- z-index 100 (encima de todo)

##### **VISTA 3: CRISIS (pantalla completa de emergencia)**
```
┌─────────────────────────────────────────┐
│              ⚠️ (ícono)                  │
│                                         │
│      Patrón de crisis detectado         │
│                                         │
│  Has intentado distraerte 6 veces       │
│  Tu autonomía necesita refuerzo          │
│                                         │
│  [📞 Llamar Línea PAS (Colombia)]       │
│  [💬 Chat Psicológico (SEMM)]           │
│  [Usar herramienta de enfoque]          │
│  [Volver al trabajo]                    │
└─────────────────────────────────────────┘
```

**BOTONES:**
1. **Llamar Línea PAS**: `<a href="tel:3196543210">` → Abre llamada
2. **Chat SEMM**: `<a href="https://semm.com.co">` → Abre web en nueva pestaña
3. **Usar herramienta**: `setView('tool')` → Va a vista de herramienta
4. **Volver**: `onSkip()` → Vuelve al dashboard (incrementa contador)

**FUNCIÓN AUXILIAR: getToolButtonLabel()**
```typescript
Entrada: 'breathing_4_7_8'
Salida: 'Respirar 2 min'

Mapeo completo:
  breathing_4_7_8    → "Respirar 2 min"
  physical_exercise  → "Activarme físicamente"
  cognitive_reframing → "Reflexionar 1 min"
  ai_therapy_brief   → "Hablar con IA"
  gentle_question    → "Continuar"
```

**FUNCIÓN AUXILIAR: renderTool()**
```typescript
switch (tool) {
  case 'breathing_4_7_8':
    return <Breathing onComplete={(result) => onComplete(result === 'yes')} />
  
  case 'physical_exercise':
    return <PhysicalExercise onComplete={onComplete} />
  
  case 'cognitive_reframing':
    return <CognitiveReframing userGoal={userGoal} onComplete={(r) => onComplete(r === 'away')} />
  
  case 'ai_therapy_brief':
    return <AITherapyBrief onComplete={onComplete} />
}
```

---

### 🔷 **HERRAMIENTAS INDIVIDUALES**

#### 1. `components/Breathing.tsx` - **EJERCICIO 4-7-8**
**QUÉ ES:** Componente interactivo de respiración guiada.

**TÉCNICA 4-7-8:**
- Inhala 4 segundos
- Sostén 7 segundos
- Exhala 8 segundos
- Repite x ciclos

**ESTRUCTURA:**
```typescript
Estado:
  phase: 'inhale' | 'hold' | 'exhale' // Fase actual
  count: number                        // Segundos restantes en fase
  cycles: number                       // Ciclos completados
  isActive: boolean                    // Si está en progreso

Flujo:
  Inicio
    ↓
  "Prepárate..." (3 segundos)
    ↓
  INHALA (4s) → contador visual animado
    ↓
  SOSTÉN (7s) → círculo se expande y mantiene
    ↓
  EXHALA (8s) → círculo se contrae
    ↓
  cycles++
    ↓
  ¿cycles >= 3? SÍ → Terminar
              NO → Volver a INHALA
```

**ELEMENTOS VISUALES:**
- **Círculo animado**: Se expande/contrae siguiendo la respiración
- **Texto central**: "INHALA", "SOSTÉN", "EXHALA"
- **Contador**: Segundos restantes en la fase
- **Barra de progreso**: Ciclos completados (1/3, 2/3, 3/3)

**CALLBACK:**
```typescript
onComplete('yes')  // Usuario completó los 3 ciclos
onComplete('no')   // Usuario canceló antes de terminar
```

#### 2. `components/interventions/PhysicalExercise.tsx` - **EJERCICIO FÍSICO**
**QUÉ ES:** Rutina de activación física corta (2-3 minutos).

**EJERCICIOS INCLUIDOS:**
```
1. Jumping Jacks (20 repeticiones)
2. Push-ups / Flexiones (10 repeticiones)
3. Squats / Sentadillas (15 repeticiones)
4. Arm Circles / Círculos de brazo (20 segundos)
```

**ESTRUCTURA:**
```typescript
Estado:
  currentExercise: number  // Índice del ejercicio actual (0-3)
  reps: number            // Repeticiones completadas
  phase: 'intro' | 'exercise' | 'rest' | 'complete'

Flujo:
  Intro
    ↓
  Muestra ejercicio 1 con GIF/animación
    ↓
  Usuario hace clic "Completado"
    ↓
  Descanso 10 segundos
    ↓
  Siguiente ejercicio
    ↓
  (repite hasta 4 ejercicios)
    ↓
  Pantalla de completado
    ↓
  onComplete(true)
```

**ELEMENTOS:**
- **Video/GIF demostrativo**: Muestra cómo hacer el ejercicio
- **Contador de reps**: "10 repeticiones"
- **Botón "Completado"**: Avanza al siguiente
- **Timer de descanso**: Cuenta regresiva 10s
- **Barra de progreso**: 1/4, 2/4, 3/4, 4/4

#### 3. `components/interventions/CognitiveReframing.tsx` - **REFLEXIÓN COGNITIVA**
**QUÉ ES:** Herramienta de reencuadre cognitivo para cuestionar la distracción.

**TÉCNICA:**
Pregunta única poderosa: **"¿Esto te ACERCA o te ALEJA de tu objetivo?"**

**ESTRUCTURA:**
```typescript
Estado:
  selectedAnswer: 'away' | 'toward' | null

Flujo:
  Muestra pregunta grande
    ↓
  Usuario selecciona una opción
    ↓
  Muestra mensaje de reflexión
    ↓
  Espera 3 segundos
    ↓
  onComplete(selectedAnswer)
```

**ELEMENTOS:**
- **Título**: Objetivo del usuario ("Terminar proyecto")
- **Pregunta central**: Grande, centrada
- **Botón "Me ALEJA"** (rosa/rojo):
  - onClick: `setSelectedAnswer('away')` → Espera 3s → `onComplete('away')`
  - Muestra: "Bien reconocido. Volvamos al objetivo."
- **Botón "Me ACERCA"** (verde):
  - onClick: `setSelectedAnswer('toward')` → `onComplete('toward')`
  - Muestra: "Perfecto, continúa entonces."

**LÓGICA DE ÉXITO:**
```typescript
// En InterventionFinal:
onComplete={(result) => onComplete(result === 'away')}

Si usuario reconoce que le ALEJA → success = true
Si dice que le ACERCA → success = false (pero se permite continuar)
```

#### 4. `components/interventions/AITherapyBrief.tsx` - **TERAPIA BREVE IA**
**QUÉ ES:** Conversación corta de 3 preguntas con reflexión asistida por IA.

**3 PREGUNTAS:**
```
1. "¿Qué sentiste cuando intentaste distraerte?"
   - Ansiedad / Aburrimiento / Cansancio / Presión

2. "¿Qué necesitas en este momento?"
   - Un break / Claridad / Energía / Ayuda

3. "Compromiso para los próximos 10 minutos"
   - Trabajar enfocado / Tomar un break real / Pedir ayuda
```

**FLUJO:**
```typescript
Estado:
  step: 1 | 2 | 3
  answers: string[]

Flujo:
  Pregunta 1
    ↓
  Usuario selecciona opción
    ↓
  answers[0] = selección
    ↓
  Pregunta 2
    ↓
  answers[1] = selección
    ↓
  Pregunta 3
    ↓
  answers[2] = selección
    ↓
  Muestra resumen de respuestas
    ↓
  Espera 5s
    ↓
  onComplete(true)
```

**ELEMENTOS:**
- **Progress bar**: 1/3, 2/3, 3/3
- **Pregunta central**: Texto grande
- **4 opciones** en cards con hover effect
- **Botón "Siguiente"**: Solo se activa al seleccionar opción
- **Pantalla de resumen**: Muestra las 3 respuestas

**GUARDADO:**
```typescript
// Se guarda en localStorage para analytics
localStorage.setItem('ai_therapy_sessions', JSON.stringify([
  ...history,
  {
    timestamp: new Date(),
    answers: ['ansiedad', 'claridad', 'trabajar_enfocado'],
    successful: true
  }
]))
```

---

## 🔄 FLUJOS DE TRABAJO COMPLETOS

### **FLUJO 1: PRIMER BLOQUEO (attemptCount = 1)**

```
1. Usuario escribe "youtube.com" en Chrome
     ↓
2. Extension (background.js) intercepta
     ↓
3. Compara "youtube.com" con BLOCKED_SITES → ¡Coincide!
     ↓
4. Redirige a: http://localhost:5175/?from=intervention&source=youtube.com
     ↓
5. App.tsx detecta parámetro "?from=intervention"
     ↓
6. Ejecuta:
    - setConsecutiveIgnores(0)  // Resetea a 0
    - localStorage.setItem('consecutiveIgnores', '0')
    - setCurrentView(AppView.INTERVENTION_CONTEXTUAL)
     ↓
7. Renderiza <InterventionFinal> con:
    - attemptCount = consecutiveIgnores + 1 = 0 + 1 = 1
     ↓
8. InterventionFinal (useEffect):
    - Detecta attemptCount = 1
    - Decide herramienta según hora (ej: breathing_4_7_8)
    - Mensaje: "¿Es esto urgente o es una fuga de dopamina?"
    - setView('toast')
     ↓
9. Muestra TOAST en parte superior:
    ┌────────────────────────────────────┐
    │ 🧠 Desvío detectado (1 intento)    │
    │ ¿Es esto urgente o es una fuga de  │
    │ dopamina?                          │
    │ [⚡ Respirar 2 min]  [Ignorar]     │
    └────────────────────────────────────┘
     ↓
10. Usuario tiene 2 opciones:
```

**OPCIÓN A: Click en "Respirar 2 min"**
```
11a. onClick ejecuta: setView('tool')
      ↓
12a. InterventionFinal renderiza <Breathing>
      ↓
13a. Pantalla completa negra con ejercicio de respiración
      ↓
14a. Usuario completa 3 ciclos (4-7-8)
      ↓
15a. Breathing ejecuta: onComplete('yes')
      ↓
16a. InterventionFinal ejecuta: onComplete(true)
      ↓
17a. App.tsx ejecuta:
      - user.points += 10
      - setShowReward(true) → Muestra "+10 puntos"
      - setCurrentView(DASHBOARD)
      ↓
18a. Vuelve al Dashboard
      ↓
19a. consecutiveIgnores sigue en 0 (reseteo al completar)
```

**OPCIÓN B: Click en "Ignorar"**
```
11b. onClick ejecuta: onSkip()
      ↓
12b. InterventionFinal ejecuta callback onSkip desde App.tsx
      ↓
13b. App.tsx ejecuta:
      - newIgnores = consecutiveIgnores + 1 = 0 + 1 = 1
      - setConsecutiveIgnores(1)
      - localStorage.setItem('consecutiveIgnores', '1')
      - user.dailyTikTokAttempts++
      - setCurrentView(DASHBOARD)
      ↓
14b. Vuelve al Dashboard
      ↓
15b. consecutiveIgnores ahora es 1 (para próximo bloqueo)
```

---

### **FLUJO 2: SEGUNDO BLOQUEO (attemptCount = 2)**

```
Usuario ya ignoró 1 vez, consecutiveIgnores = 1

1. Usuario intenta abrir "facebook.com"
     ↓
2. Extension redirige a intervention
     ↓
3. App.tsx NO resetea consecutiveIgnores (solo resetea si viene de extensión Y era 0)
     ↓
4. Renderiza <InterventionFinal> con:
    - attemptCount = consecutiveIgnores + 1 = 1 + 1 = 2
     ↓
5. InterventionFinal detecta attemptCount = 2
     ↓
6. Muestra TOAST:
    ┌────────────────────────────────────┐
    │ 🧠 Desvío detectado (2 intentos)   │
    │ Mensaje contextual...              │
    │ [⚡ Herramienta]  [Ignorar]        │
    └────────────────────────────────────┘
     ↓
7. Todavía permite "Ignorar" (attemptCount <= 2)
     ↓
8. Si ignora → consecutiveIgnores = 2
```

---

### **FLUJO 3: TERCER BLOQUEO (attemptCount = 3)**

```
consecutiveIgnores = 2

1. Usuario intenta YouTube de nuevo
     ↓
2. attemptCount = 2 + 1 = 3
     ↓
3. InterventionFinal detecta attemptCount = 3
    - attemptCount > 2 → No muestra botón "Ignorar"
     ↓
4. Muestra TOAST:
    ┌────────────────────────────────────┐
    │ 🧠 Desvío detectado (3 intentos)   │
    │ Varios intentos. ¿Esto te acerca o │
    │ te aleja de tu objetivo?           │
    │ [⚡ Reflexionar 1 min]             │
    │ ⚠️ Has ignorado esto 3 veces.      │
    │ Es momento de actuar.              │
    └────────────────────────────────────┘
     ↓
5. Usuario DEBE hacer click en la herramienta
     ↓
6. Se abre <CognitiveReframing>
     ↓
7. Pregunta: "¿Intentar usar YouTube te ACERCA o te ALEJA de 'Terminar proyecto'?"
     ↓
8. Usuario hace click en "Me ALEJA"
     ↓
9. Muestra: "Bien reconocido. Volvamos al objetivo."
     ↓
10. onComplete(true) → Puntos +10 → Dashboard
     ↓
11. consecutiveIgnores se resetea a 0
```

---

### **FLUJO 4: SEXTO BLOQUEO (MODO CRISIS)**

```
consecutiveIgnores = 5

1. Usuario intenta distraerse de nuevo
     ↓
2. attemptCount = 5 + 1 = 6
     ↓
3. InterventionFinal detecta attemptCount >= 6
    - setView('crisis')
     ↓
4. Renderiza pantalla completa de CRISIS:
    ┌───────────────────────────────────┐
    │          ⚠️ (grande)              │
    │   Patrón de crisis detectado      │
    │ Has intentado distraerte 6 veces  │
    │ Tu autonomía necesita refuerzo    │
    │                                   │
    │ [📞 Llamar Línea PAS]             │
    │ [💬 Chat Psicológico]             │
    │ [Usar herramienta de enfoque]     │
    │ [Volver al trabajo]               │
    └───────────────────────────────────┘
     ↓
5. Opciones del usuario:

OPCIÓN 1: Llamar Línea PAS
  → Abre app de teléfono con número 3196543210
  
OPCIÓN 2: Chat Psicológico
  → Abre https://semm.com.co en nueva pestaña
  
OPCIÓN 3: Usar herramienta
  → setView('tool')
  → Renderiza <AITherapyBrief> (conversación de 3 preguntas)
  → Usuario completa → onComplete(true) → Dashboard
  
OPCIÓN 4: Volver
  → onSkip()
  → consecutiveIgnores++
  → Dashboard
```

---

## 🧩 TIPOS Y DATOS

### **EmotionalMetrics** (types.ts)
```typescript
interface EmotionalMetrics {
  stressLevel: number          // 0-1, nivel de estrés
  fatigueLevel: number         // 0-1, nivel de fatiga
  focusQuality: number         // 0-1, calidad de enfoque
  attemptCount: number         // Cuántos intentos de distracción
  sessionDurationMinutes: number  // Minutos en sesión actual
  lastInterventions: string[]  // Historial de intervenciones
  clickSpeed?: number          // Clicks por segundo (opcional)
  responseTime?: number        // Segundos de respuesta (opcional)
}
```

### **InterventionType** (types.ts)
```typescript
type InterventionType =
  | 'breathing_4_7_8'      // Ejercicio de respiración
  | 'physical_exercise'    // Ejercicios físicos
  | 'cognitive_reframing'  // Reflexión cognitiva
  | 'ai_therapy_brief'     // Terapia breve IA
  | 'gentle_question';     // Pregunta suave (sin usar actualmente)
```

### **AppView** (types.ts)
```typescript
enum AppView {
  SPLASH = 'SPLASH',                           // Pantalla de carga inicial
  ONBOARDING = 'ONBOARDING',                   // Tutorial inicial
  DASHBOARD = 'DASHBOARD',                     // Panel principal
  INTERVENTION_CONTEXTUAL = 'INTERVENTION_CONTEXTUAL',  // Sistema de intervención
  FOCUS_SESSION = 'FOCUS_SESSION',             // Sesión de enfoque Pomodoro
  BREATHING = 'BREATHING',                     // Ejercicio de respiración standalone
  ANALYTICS = 'ANALYTICS',                     // Estadísticas
  SETTINGS = 'SETTINGS',                       // Configuración
  // ... otros
}
```

---

## 💾 ALMACENAMIENTO LOCAL (localStorage)

### **Datos guardados:**
```javascript
'consecutiveIgnores': "3"           // Cuántas veces ignoró (string)
'intervention_active': "true"       // Si hay intervención activa
'alterfocusUser': "{...}"           // Objeto UserState completo
'alterfocus_history': "[{...}]"     // Historial de sesiones
'alterfocus_interventions': "[{...}]"  // Historial de intervenciones
'autonomyProgress': "{...}"         // Progreso de autonomía
```

### **Cuándo se actualiza:**
- **consecutiveIgnores**: Cada vez que ignora (+1) o completa herramienta (reset a 0)
- **intervention_active**: Cuando activa/desactiva intervención
- **alterfocusUser**: Cada cambio en user state (puntos, objetivos, etc.)
- **alterfocus_history**: Al completar sesión de enfoque
- **alterfocus_interventions**: Al completar cualquier herramienta

---

## 🎮 TODOS LOS BOTONES Y SUS ACCIONES

### **En InterventionFinal (TOAST):**
1. **Botón "Respirar 2 min"** (o nombre de herramienta):
   - Acción: `onClick={() => setView('tool')}`
   - Resultado: Cambia vista a herramienta completa

2. **Botón "Ignorar"**:
   - Acción: `onClick={onSkip}`
   - Resultado: Ejecuta callback → incrementa consecutiveIgnores → vuelve a Dashboard

3. **Botón X** (cerrar):
   - Acción: `onClick={onSkip}`
   - Resultado: Igual que "Ignorar"

### **En Breathing:**
1. **Botón "Comenzar"**:
   - Acción: Inicia temporizador del ejercicio
   - Resultado: Empieza ciclo INHALA → SOSTÉN → EXHALA

2. **Botón "Pausar"**:
   - Acción: Pausa el temporizador
   - Resultado: Congela el contador

3. **Botón "Terminar"** (después de 3 ciclos):
   - Acción: `onComplete('yes')`
   - Resultado: Vuelve a App → +10 puntos → Dashboard

4. **Botón "Salir"** (antes de terminar):
   - Acción: `onComplete('no')`
   - Resultado: Vuelve a Dashboard sin puntos

### **En CognitiveReframing:**
1. **Botón "Me ALEJA"**:
   - Acción: `setSelectedAnswer('away')` → espera 3s → `onComplete('away')`
   - Resultado: Mensaje "Bien reconocido" → +10 puntos → Dashboard

2. **Botón "Me ACERCA"**:
   - Acción: `setSelectedAnswer('toward')` → `onComplete('toward')`
   - Resultado: Mensaje "Perfecto, continúa" → Dashboard (sin puntos extra)

### **En PhysicalExercise:**
1. **Botón "Completado"** (cada ejercicio):
   - Acción: Marca ejercicio como completado → siguiente
   - Resultado: Avanza al siguiente ejercicio o al descanso

2. **Botón "Terminar"** (después de 4 ejercicios):
   - Acción: `onComplete(true)`
   - Resultado: +10 puntos → Dashboard

### **En AITherapyBrief:**
1. **Botones de opción** (ej: "Ansiedad", "Aburrimiento"):
   - Acción: Guarda respuesta en array
   - Resultado: Habilita botón "Siguiente"

2. **Botón "Siguiente"**:
   - Acción: `setStep(step + 1)`
   - Resultado: Avanza a siguiente pregunta

3. **Botón "Completar"** (después de 3 preguntas):
   - Acción: `onComplete(true)`
   - Resultado: +10 puntos → Dashboard

### **En CRISIS:**
1. **"Llamar Línea PAS"**:
   - Acción: `<a href="tel:3196543210">`
   - Resultado: Abre marcador telefónico

2. **"Chat Psicológico"**:
   - Acción: `<a href="https://semm.com.co" target="_blank">`
   - Resultado: Abre nueva pestaña con sitio web

3. **"Usar herramienta"**:
   - Acción: `onClick={() => setView('tool')}`
   - Resultado: Muestra herramienta completa

4. **"Volver al trabajo"**:
   - Acción: `onClick={onSkip}`
   - Resultado: Dashboard (incrementa contador)

---

## 📊 EJEMPLO DE SESIÓN COMPLETA

```
DÍA 1 - MAÑANA:
─────────────────
08:30 - Usuario abre la app
08:31 - Intenta abrir YouTube
        → Toast (1 intento): "¿Es urgente o es fuga de dopamina?"
        → Click "Ignorar"
        → consecutiveIgnores = 1

09:00 - Intenta Facebook
        → Toast (2 intentos): Mensaje contextual
        → Click "Respirar 2 min"
        → Completa ejercicio
        → +10 puntos
        → consecutiveIgnores = 0 (reset)

14:30 - Intenta Instagram
        → Toast (1 intento): "Es el bajón de las 2pm. Tu cuerpo pide energía"
        → Recomienda: Physical Exercise
        → Click "Activarme físicamente"
        → Completa 4 ejercicios
        → +10 puntos

17:00 - Intenta TikTok
        → Toast (1 intento)
        → Click "Ignorar"
        → consecutiveIgnores = 1

17:15 - Intenta TikTok de nuevo
        → Toast (2 intentos)
        → Click "Ignorar"
        → consecutiveIgnores = 2

17:30 - Intenta TikTok otra vez
        → Toast (3 intentos): Sin botón "Ignorar"
        → OBLIGADO a usar herramienta
        → Reflexiona con Cognitive Reframing
        → Click "Me ALEJA"
        → +10 puntos
        → consecutiveIgnores = 0

TOTAL DEL DÍA: 30 puntos ganados, 3 herramientas completadas
```

---

## ✅ RESUMEN EJECUTIVO

**ARQUITECTURA:**
- Extension Chrome (bloquea sitios) → Redirige a App Web
- App Web (React) → Muestra intervenciones contextualizadas
- 4 Herramientas (Breathing, Exercise, Reframing, AI) → Ayudan a refocalizarse

**FLUJO PRINCIPAL:**
1. Usuario intenta distraerse
2. Extension lo redirige a la app
3. App muestra toast contextualizado
4. Usuario elige herramienta o ignora
5. Si completa → puntos; si ignora → contador++
6. Escalada progresiva hasta modo crisis

**OBJETIVO:**
Ayudar a las personas a mantener el enfoque mediante intervenciones inteligentes y progresivas, en lugar de solo bloquear sitios.
