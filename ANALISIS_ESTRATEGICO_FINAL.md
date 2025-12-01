# 🚀 ESTRATEGIA TÉCNICA Y DE NEGOCIO: AlterFocus

**Autor:** Antigravity (CTO Virtual)
**Fecha:** Noviembre 2025
**Objetivo:** Guía estratégica para Pitch y Roadmap de 6 meses.

---

## 📊 1. ANÁLISIS DE ARQUITECTURA

### **¿Necesita Backend ahora?**
**NO.** Para el MVP y los primeros 1,000 usuarios, la arquitectura **Local-First** (Zustand + localStorage) es superior por:
- **Privacidad:** Los datos sensibles (patrones de distracción) nunca salen del dispositivo. Esto es un *selling point* masivo.
- **Costo:** $0 en servidores. Ideal para estudiante entrepreneur.
- **Velocidad:** Latencia cero. La intervención es inmediata.

**¿Cuándo migrar?**
Cuando necesites:
- Sincronización multi-dispositivo (Laptop ↔ Celular).
- Analytics agregados para B2B (ej: "Reporte de bienestar para Uninorte").
- Leaderboards sociales reales.

### **Escalabilidad**
- **Actual:** Soporta ilimitados usuarios (cada uno es su propio "servidor").
- **Futuro:** Firebase o Supabase para sync simple. No compliques la infraestructura antes de validar el mercado.

---

## 🎯 2. FEATURES DE ALTO IMPACTO (Corto Plazo)

### **Semana 1-2 (Post-Lanzamiento):**

1.  **Push Notifications "Humanas"**
    *   *Por qué:* El usuario olvida descansar.
    *   *Cómo:* `Notification API` del navegador.
    *   *Trigger:* "Llevas 2h sin pausa. ¿Un café?" (No intrusivo).

2.  **Integración Google Calendar (Solo lectura)**
    *   *Por qué:* Contexto real. Si tiene examen mañana, la intervención debe ser más estricta.
    *   *Cómo:* Google Calendar API (scope `calendar.readonly`).
    *   *Impacto:* "AlterFocus sabe que tengo parcial y me protege más". Magia pura.

3.  **"Modo Compañero" (Social Anónimo)**
    *   *Por qué:* La soledad mata la productividad.
    *   *Cómo:* Websockets simples (Socket.io). Ver "5 personas están enfocadas contigo ahora".
    *   *Impacto:* Validación social sin presión de redes sociales.

---

## ⚔️ 3. DIFERENCIADORES COMPETITIVOS (Para el Pitch)

| Característica | 🟢 AlterFocus | 🔴 Opal | 🟡 Forest |
| :--- | :---: | :---: | :---: |
| **Filosofía** | **Ciencia + Empatía** | Bloqueo Bruto | Gamificación |
| **Detección** | **Multimodal (Hora, Patrón)** | Solo App | Manual |
| **Intervención** | **Cognitiva (Reencuadre)** | Pantalla Bloqueada | Árbol Muerto |
| **Crisis** | **Protocolo SOS (Línea PAS)** | N/A | N/A |
| **Privacidad** | **Local-First (100% Privado)** | VPN (Ve tu tráfico) | Nube |
| **Costo** | **Freemium Ético** | $99/año | $4 app |

**Tu "Killer Line":**
> *"Opal te trata como a un niño y te quita el juguete. Forest te da puntos virtuales. AlterFocus te trata como a un adulto y te devuelve el control."*

---

## 💰 4. MONETIZACIÓN ÉTICA

### **Modelo: Freemium "Consciente"**

1.  **Free (Para siempre):**
    *   Bloqueo básico.
    *   Detección de crisis (Ética: nunca cobrar por seguridad).
    *   3 intervenciones diarias.

2.  **Pro ($3.99/mes o $29/año):**
    *   Intervenciones ilimitadas.
    *   Analytics avanzados (Heatmaps de distracción).
    *   Integración Calendar.
    *   Personalización de herramientas (ej: subir tus propios audios).

3.  **B2B (Universidades - La mina de oro):**
    *   Vender a Bienestar Universitario (Uninorte, Andes).
    *   *Pitch:* "Reducimos la deserción por burnout y mejoramos el rendimiento académico".
    *   *Precio:* Licencias por volumen ($1/estudiante/año).

---

## 📈 5. MÉTRICAS PARA INVERSORES

No midas vanidad (descargas). Mide valor.

1.  **Intervention Success Rate:** % de veces que el usuario acepta la herramienta y vuelve al trabajo. (Target: >40%).
2.  **Day-7 Retention:** % de usuarios que vuelven al día 7. (Target: >30%).
3.  **"Saved Time":** Minutos recuperados (estimados). Métrica emocional potente.
4.  **Crisis Averted:** Número de veces que se mostró el modal SOS (Métrica de impacto social).

---

## ⚠️ 6. RIESGOS Y MITIGACIÓN

1.  **Riesgo Legal (Crisis):** Usuario se hace daño tras usar la app.
    *   *Mitigación:* Disclaimer claro en onboarding. "No somos médicos". El botón SOS debe ser directo a líneas oficiales (ya implementado).

2.  **Churn por "Molestia":** La app se vuelve un "nagware" (molesta demasiado).
    *   *Mitigación:* "Presupuesto de Intervención". Si el usuario ignora 3 veces, la app se silencia por 2 horas ("Modo Respeto").

3.  **Privacidad (GDPR/Habeas Data):**
    *   *Mitigación:* Arquitectura Local-First. No recolectas datos, no tienes riesgo de fuga.

---

## 🗺️ 7. ROADMAP 6 MESES

*   **Mes 1 (MVP):** Lanzamiento beta en Uninorte (50 usuarios). Ajuste de algoritmo de detección.
*   **Mes 2 (Retention):** Push notifications, Gamificación leve (rachas), Feedback loop mejorado.
*   **Mes 3 (Growth):** Lanzamiento en Product Hunt. Integración Google Calendar.
*   **Mes 4 (Monetización):** Lanzamiento Tier PRO. Pasarela de pagos (Wompi/Stripe).
*   **Mes 5 (B2B):** Piloto oficial con Bienestar Uninorte. Dashboard para universidades (anónimo).
*   **Mes 6 (Scale):** Versión Móvil (React Native) sincronizada.

---

### 💡 CONSEJO FINAL PARA EL PITCH

Eres un estudiante de Barranquilla resolviendo un problema global. Úsalo.
No vendas "una app de bloqueo". Vende **"Salud Mental Digital basada en Ciencia"**.

Tu competencia es Silicon Valley (Opal). Tu ventaja es que tú entiendes el contexto local y la presión académica real, y tienes la ética para manejar crisis, no solo productividad.

**¡Éxito!**
