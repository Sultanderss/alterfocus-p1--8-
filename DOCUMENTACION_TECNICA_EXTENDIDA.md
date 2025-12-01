# DOCUMENTACIÓN TÉCNICA EXTENDIDA Y LÓGICA DE NEGOCIO - ALTERFOCUS

## 1. INTRO Y PROPÓSITO
AlterFocus no es solo un bloqueador. Es la única app construida por y para estudiantes, basada en psicología, IA y evidencia real, que transforma la procrastinación en acción con microintervenciones inteligentes y personalizadas. Reduce ansiedad, aumenta autonomía y educa en gestión emocional.

## 2. DIFERENCIADOR FRENTE A OPAL Y OTROS

| Aspecto | Opal | AlterFocus |
|---------|------|------------|
| **Control** | Bloquea apps, rachas | Diagnóstico emocional, intervención real |
| **Método** | Fricción y castigo | Apoyo terapéutico, reencuadre y reflexión |
| **IA** | No adaptativa | IA personaliza mensajes, flujos y módulos |
| **Educación** | Nula | Enseña hábitos y autogestión |
| **Privacidad** | Servidor central | Local, anonimizado, ética certificada |
| **Autonomía** | Dependencia app | Menos intervención según progreso |
| **Gamificación** | Rachas y motivación | Microrecompensas y badges, grupos de soporte |
| **Emergencias** | Bloquea igual | Protocolo SOS educativo y preventivo |
| **Grupos** | Parental control | Microgrupos privados, opt-in, sin presión |
| **Resultados** | Menos minutos pantalla | Más logros, menos culpa, más avance real |

## 3. FLUJO MODULAR Y ARQUITECTURA

**Microintervención cognitiva multimodal escalada en 5 salidas automáticas:**
1. Pregunta suave
2. Respiración guiada
3. Reencuadre cognitivo
4. Ejercicio físico
5. Chat IA tipo terapia breve

**Lógica de Decisión IA (Pseudocódigo):**

```javascript
function decideIntervention(attemptCount, metrics, history) {
  const { clickSpeed, responseTime, emotionalPattern } = metrics;
  
  // Nivel 1: Pregunta Suave (Intentos 1-2)
  if (attemptCount <= 2) {
    return { 
      type: 'gentlequestion', 
      message: '¿Qué te está frenando?', 
      options: ['Respiración', 'Reencuadre', 'Reflexión'] 
    };
  }
  
  // Nivel 2: Intervenciones Específicas
  if (clickSpeed > 2 && emotionalPattern === 'anxiety') {
    return { type: 'breathing478', duration: 75 };
  }
  
  if (responseTime > 5 && emotionalPattern === 'confusion') {
    return { type: 'reframing', prompt: '¿Esto te acerca o te aleja?' };
  }
  
  if (responseTime > 10 && emotionalPattern === 'fatigue') {
    return { type: 'physicalexercise', exercises: 'push-ups/squats' };
  }
  
  // Nivel 3: Crisis / Ayuda Recurrente
  if (history.userClickedHelpCount >= 3) {
    return { 
      type: 'aitherapybrief', 
      questions: ['¿Qué sentiste?', '¿Qué necesitas?', 'Compromiso para próximos 10 min?'] 
    };
  }
  
  return { type: 'none' };
}
```

## 4. INTEGRACIÓN DE HERRAMIENTAS (Multi-modalidad)

- **Respiración:** Animación guiada, desbloquea tras ciclo fisiológico de estrés (30-75s).
- **Salas comunitarias:** “Body doubling” virtual, temporizador grupal, sin chat distractor.
- **NotebookLM/IA:** Consulta instantánea de datos personales/proyectos.
- **Sonidos binaurales:** Fondo auditivo adaptado que se activa antes de rendirse.

## 5. PROTOCOLO SOS Y EDUCACIÓN

- **Protocolo SOS de bienestar:** Botón visible si detectar crisis, activa derivación a ayuda profesional, pausa todas las intervenciones productivas.
- **Módulo preventivo educativo:** Lecciones breves, quizzes, micro-videos sobre hábitos y emociones.

## 6. ROADMAP Y ESCALABILIDAD

- Arquitectura modular lista para API externas.
- Algoritmo IA adaptable: aprendizaje continuo, feedback del usuario.
- Privacy by design: datos locales.

## 7. REFERENCIAS APA Y EVIDENCIA

- Pychyl, T., Sirois, F. (2016). Procrastination, Emotion Regulation, and Well-being.
- Ryan & Deci (Self-determination theory).
- Gross & John (Cognitive emotion regulation).
