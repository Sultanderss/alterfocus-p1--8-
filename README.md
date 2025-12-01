# AlterFocus - Sistema de Intervención Cognitiva Inteligente

## 🧠 Descripción
AlterFocus es una aplicación anti-procrastinación que utiliza IA para detectar estados emocionales en tiempo real y ofrecer intervenciones terapéuticas personalizadas. A diferencia de apps tradicionales que solo bloquean sitios web, AlterFocus **entiende por qué procrastinas** y ofrece la ayuda que realmente necesitas.

## 🎯 Diferenciación vs. Competencia

| Aspecto | Opal (Líder) | AlterFocus |
|---------|-------------|------------|
| **Filosofía** | Punitiva: "Te bloqueo" | Terapéutica: "Te entiendo" |
| **Mecanismo** | Bloqueo binario | 5 intervenciones adaptativas |
| **Inteligencia** | Nula (Timer simple) | IA detecta emociones |
| **Autonomía** | Dependencia crónica | Progresiva (desbloquea "Ignorar") |
| **Privacidad** | Datos en nube | 100% offline-first |

---

## 🚀 Arquitectura del Sistema

### **Frontend**
- **Framework:** React 18.2 + TypeScript 5.0
- **Styling:** Tailwind CSS 3.3 (Glassmorphism design)
- **State Management:** Zustand 4.4
- **Animations:** Framer Motion 10.16
- **Router:** React Router 6.15
- **Icons:** Lucide React

### **Backend/Persistencia**
- **Primary Storage:** IndexedDB (offline-first)
- **Secondary Storage:** localStorage
- **Cloud Sync:** Opcional (Firebase Firestore)
- **IA API:** Google Gemini 2.0 Flash

### **Chrome Extension**
- **Manifest:** V3
- **Background:** Service Worker
- **Content Scripts:** Non-intrusive toast (9 seg)

---

## 📁 Estructura de Carpetas

```
alterfocus/
├── public/
│   ├── icons/
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx              # Panel principal con autonomía
│   │   ├── FocusSession.tsx          # Timer Pomodoro con simulación
│   │   ├── interventions/            # ⭐ 5 Modalidades
│   │   │   ├── InterventionMultimodal.tsx  # Orquestador IA
│   │   │   ├── GentleQuestion.tsx          # Pregunta suave (30s)
│   │   │   ├── Breathing.tsx               # Respiración 4-7-8 (75s)
│   │   │   ├── CognitiveReframing.tsx      # Reencuadre (60s)
│   │   │   ├── PhysicalExercise.tsx        # Ejercicio físico (120s)
│   │   │   └── AITherapyBrief.tsx          # Chat IA (180s)
│   │   ├── MildToast.tsx             # Toast suave (primeros 2 intentos)
│   │   ├── Analytics.tsx             # Dashboard emocional
│   │   ├── AIGuide.tsx              # Asistente IA
│   │   ├── Settings.tsx
│   │   └── ...
│   ├── services/
│   │   ├── interventionEngine.ts    # Cerebro: detección emocional
│   │   └── ...
│   ├── types.ts                     # TypeScript interfaces
│   └── App.tsx
├── package.json
└── README.md
```

---

## 🔧 Componentes Principales

### **1. Motor de Detección Emocional**
Analiza métricas comportamentales:
- `clickSpeed`: clics/segundo
- `responseTime`: tiempo de inactividad
- `attemptCount`: intentos consecutivos

**Output:** Estado emocional (`anxiety`, `confusion`, `fatigue`, `overwhelm`)

### **2. Sistema de Intervención Multimodal**
5 modalidades terapéuticas que se activan según emoción:

| Modalidad | Duración | Trigger | Técnica |
|-----------|----------|---------|---------|
| **Pregunta Suave** | 30-60s | Intentos 1-2 | Autoconciencia |
| **Respiración 4-7-8** | 75s | Ansiedad | Regulación fisiológica |
| **Reencuadre Cognitivo** | 60s | Confusión | Cambio perspectiva |
| **Ejercicio Físico** | 120s | Fatiga | Activación dopamina |
| **Chat IA** | 180s | Crisis | Plan de acción |

### **3. Timer Pomodoro Adaptativo**
3 modos contextuales:
- **🎯 Trabajo Profundo** (45-120 min): 0-1 distracciones
- **⚡ Revisión Rápida** (15-30 min): 1-2 distracciones
- **📄 Flujo de Entrega** (30-60 min): 0-1 distracciones

### **4. Sistema de Autonomía Progresiva**
- **Meta:** 5 intervenciones exitosas / 7 días
- **Recompensa:** Botón "Ignorar" desbloqueado
- **Niveles:** Aprendiz → Intermedio → Autónomo

### **5. Dashboard de Comprensión Emocional**
**Métricas únicas de AlterFocus:**
- Triggers emocionales (% ansiedad, confusión, fatiga)
- Efectividad por intervención (% éxito)
- Patrones temporales (horas productivas)
- Insights personalizados con IA

### **6. Chrome Extension No Intrusiva**
- Detección contextual: solo interviene si hay objetivo activo
- Toast suave (9 seg, no bloqueante)
- Validación: horario productivo + meta definida

### **7. Modo Offline Total**
- IndexedDB para sesiones e intervenciones
- localStorage para configuración
- Sincronización inteligente al volver online

---

## 💻 Stack Tecnológico

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "zustand": "^4.4.0",
    "framer-motion": "^10.16.0",
    "react-router-dom": "^6.15.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.263.0",
    "@google/generative-ai": "^0.1.3",
    "recharts": "^2.8.0"
  },
  "devDependencies": {
    "vite": "^4.4.0",
    "@types/react": "^18.2.0",
    "@types/chrome": "^0.0.243"
  }
}
```

---

## 🛠️ Instalación Local

```bash
# 1. Clonar repositorio
git clone https://github.com/anderson-linero/alterfocus.git
cd alterfocus

# 2. Instalar dependencias
npm install

# 3. Desarrollo
npm run dev

# 4. Build producción
npm run build

# 5. Build extensión Chrome
npm run build:extension
```

---

## ⚙️ Variables de Entorno

Crear archivo `.env` en la raíz:

```env
VITE_GEMINI_API_KEY=your_api_key_here
VITE_FIREBASE_CONFIG=your_firebase_config
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📊 Flujo de Usuario Completo

1. **Onboarding:** Define objetivo, horario, apps distractoras
2. **Dashboard:** Ve progreso de autonomía (X/5 intervenciones)
3. **Sesión:** Elige modo Pomodoro (Deep Work, Quick Review, Assignment)
4. **Distracción:**
   - **Intento 1-2:** Toast suave (9 seg)
   - **Intento 3+:** Intervención completa según emoción
5. **Intervención:** IA selecciona modalidad (Breathing, Reframing, etc.)
6. **Completar:** Vuelve a sesión, registra éxito
7. **Analytics:** Ve insights personalizados (triggers, efectividad)
8. **Autonomía:** Al 5/5, desbloquea botón "Ignorar"

---

## 🗺️ Roadmap

### **Fase 1: MVP** (Actual) ✅
- 7 componentes principales
- Detección emocional básica
- 5 modalidades de intervención
- Modo offline
- Dashboard emocional

### **Fase 2: Expansión** (Q1 2026)
- [ ] App móvil (React Native)
- [ ] Integración con wearables
- [ ] Módulo de seguimiento por psicólogos
- [ ] Salas comunitarias virtuales

### **Fase 3: Escala** (Q2 2026)
- [ ] Modelos de IA personalizados
- [ ] Certificación educativa
- [ ] API para universidades
- [ ] Expansión LATAM

---

## 📄 Licencia
MIT License - Ver LICENSE.md

---

## 👨‍💻 Contacto
**Anderson Jannir Linero Álvarez**  
Email: alinero@uninorte.edu.co  
Universidad del Norte - Barranquilla, Colombia

---

## 🙏 Agradecimientos

- Universidad del Norte (Investigación y apoyo)
- 122 estudiantes participantes (Encuesta validación)
- Google AI Studio (API Gemini)
- Comunidad Open Source

---

**⭐ Si este proyecto te ayudó, considera darle una estrella en GitHub!**
