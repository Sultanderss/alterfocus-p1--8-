# 🎯 GUÍA RÁPIDA - Sistema de Niveles de Intervención

## 📊 Flujo Visual del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO EN DASHBOARD                         │
│  - Ve sus últimas 3 intervenciones                             │
│  - Puede hacer clic en "Ver Historial Completo"                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
      ┌──────────────────────────────────┐
      │  MODAL: InterventionHistory      │
      │  ────────────────────────────    │
      │  📈 Nivel Actual: 2              │
      │  📊 Progreso Diario: 75%         │
      │  ⭐ Racha Éxito: 3/3             │
      │  ❌ Racha Fracaso: 0/2           │
      │  👤 Perfil: Evitador 🐌          │
      │  📋 Últimas 10 intervenciones    │
      └──────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│         FLUJO DE INTERVENCIÓN CON NIVELES                       │
└─────────────────────────────────────────────────────────────────┘

1️⃣ USUARIO INTENTA ABRIR SITIO BLOQUEADO
   └─> Extensión detecta y redirige a app
   
2️⃣ APP ABRE InterventionContextual
   ┌────────────────────────────────────────────┐
   │  AlterFocus            🛡️ Nivel 2         │
   │  ────────────────────────────────────────  │
   │  GUARDIANÍA CONTEXTUAL                     │
   │  Desbloqueo suave con mensaje reflexivo   │
   ├────────────────────────────────────────────┤
   │  🚫 Estás abriendo YouTube...             │
   │  🎯 Tu meta: Terminar informe             │
   │  ✅ Ya completaste 2 sesiones hoy         │
   └────────────────────────────────────────────┘
   
3️⃣ USUARIO SELECCIONA ACCIÓN:

   Opción A: ACEPTA HERRAMIENTA ✅
   └─> Registro: SUCCESS
       ├─> successStreak++
       ├─> failureStreak = 0
       └─> Si successStreak >= 3 → NIVEL BAJA ⬇️
   
   Opción B: INSISTE 2 VECES → RETO FÍSICO ❌
   └─> Registro: FAILURE
       ├─> failureStreak++
       ├─> successStreak = 0
       └─> Si failureStreak >= 2 → NIVEL SUBE ⬆️


┌─────────────────────────────────────────────────────────────────┐
│              TABLA DE NIVELES Y SUS EFECTOS                     │
└─────────────────────────────────────────────────────────────────┘

┌─────┬──────────────────────┬────────────┬───────────────────────┐
│ LVL │ NOMBRE               │ INTENSIDAD │ QUÉ PASA              │
├─────┼──────────────────────┼────────────┼───────────────────────┤
│  0  │ Recordatorio         │ none       │ Solo notificaciones   │
│  1  │ Onboarding           │ soft       │ Recalibración         │
│  2  │ Guardianía           │ soft       │ Mensaje reflexivo     │
│  3  │ Intervención Activa  │ medium     │ Acción requerida      │
│  4  │ Bloqueo Condicionado │ hard       │ Ventana de gracia     │
│  5  │ Emergencia           │ emergency  │ Recursos de ayuda     │
└─────┴──────────────────────┴────────────┴───────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│         PERFILES DE USUARIO (AUTO-DETECTADOS)                   │
└─────────────────────────────────────────────────────────────────┘

🐌 EVITADOR
   - Evita comenzar tareas
   - Escalamiento: LENTO
   - Mensajes: Empáticos
   - Detecta: mucho "posponer" o "reagendar"

⚡ IMPULSIVO
   - Reacciona rápido a distracciones
   - Escalamiento: RÁPIDO
   - Mensajes: Directos
   - Detecta: múltiples bloqueos rápidos

💎 PERFECCIONISTA
   - Parálisis por análisis
   - Escalamiento: NORMAL
   - Mensajes: Alentadores
   - Detecta: "parálisis", "confusión"

🎯 NEUTRO
   - Perfil desconocido/default
   - Escalamiento: NORMAL
   - Mensajes: Empáticos


┌─────────────────────────────────────────────────────────────────┐
│                  CÓMO PROBAR EL SISTEMA                         │
└─────────────────────────────────────────────────────────────────┘

🧪 MÉTODO 1: Simulación desde Dashboard
   1. Abre Dashboard
   2. Scroll abajo → "Simular Distracción (Test Mode)"
   3. Se abre InterventionContextual
   4. Observa el badge "Nivel X" en header
   5. Selecciona una herramienta
   6. Vuelve a Dashboard
   7. Haz clic en "Ver Historial Completo"
   8. ¡Verás tu intervención registrada!

🌐 MÉTODO 2: Desde Extensión (Más Realista)
   1. Asegúrate de tener la extensión cargada
   2. Intenta abrir YouTube o sitio bloqueado
   3. La app se abre mostrando nivel actual
   4. Realiza varias intervenciones:
      - 3 exitosas seguidas → Nivel BAJA
      - 2 insistencias seguidas → Nivel SUBE
   5. Revisa historial en Dashboard

📈 MÉTODO 3: Ver Evolución en el Tiempo
   1. Usa la app normalmente por varios días
   2. Dashboard → Ver Historial Completo
   3. Observa:
      - Cómo evoluciona tu nivel
      - Tu perfil detectado
      - Tasa de éxito
      - Racha actual


┌─────────────────────────────────────────────────────────────────┐
│              DATOS ALMACENADOS (localStorage)                   │
└─────────────────────────────────────────────────────────────────┘

📦 KEY: "alterfocus_intervention_state"

{
  "currentLevel": 2,                    // Nivel actual (0-5)
  "userProfile": "evitador",            // Perfil detectado
  "successStreak": 3,                   // Éxitos consecutivos
  "failureStreak": 0,                   // Fracasos consecutivos
  "lastLevelChange": "2025-11-25T...",  // Última vez que cambió
  "dailyProgressIndex": 75,             // Score 0-100
  "interventionHistory": [              // Últimas 50
    {
      "timestamp": "2025-11-25T10:30:00.000Z",
      "level": 2,
      "action": "breathing",
      "success": true,
      "emotionalState": "anxiety"
    },
    // ... más registros
  ]
}


┌─────────────────────────────────────────────────────────────────┐
│                    PRÓXIMOS PASOS                               │
└─────────────────────────────────────────────────────────────────┘

🎯 Fase Actual: COMPLETADO ✅
   - Dashboard con historial
   - InterventionContextual con niveles
   - Auto-escalamiento funcional
   - Auto-detección de perfil

🚀 Fase Siguiente (Recomendada):
   
   1. MENSAJES CONTEXTUALES
      - Usar nivel actual para personalizar mensajes
      - Adaptar tono según perfil
   
   2. NOTIFICACIONES DE NIVEL
      - Alert cuando sube de nivel
      - Felicitación cuando baja
   
   3. ANALYTICS VISUAL
      - Gráfico de evolución temporal
      - Comparativa con otros usuarios
   
   4. SINCRONIZACIÓN EXTENSIÓN
      - Extensión consulta nivel actual
      - Adapta intensidad de bloqueo


┌─────────────────────────────────────────────────────────────────┐
│                    TROUBLESHOOTING                              │
└─────────────────────────────────────────────────────────────────┘

❓ No veo el botón de historial en Dashboard
   → Necesitas tener al menos 1 intervención registrada
   → Simula una distracción primero

❓ El nivel no cambia
   → Necesitas cumplir el umbral (3 éxitos o 2 fracasos)
   → Verifica en el modal: muestra las rachas actuales

❓ El perfil siempre es "neutro"
   → Se necesitan al menos 5 intervenciones para detectar
   → Varía tus acciones y estados emocionales

❓ Los datos se pierden
   → localStorage se limpia al hacer logout
   → No uses modo incógnito


┌─────────────────────────────────────────────────────────────────┐
│                    RESUMEN TÉCNICO                              │
└─────────────────────────────────────────────────────────────────┘

📁 Archivos Modificados:
   ✅ components/Dashboard.tsx
   ✅ components/InterventionContextual.tsx
   ✅ ACTUALIZACIONES_INTERVENCION.md

📁 Archivos Usados (ya existían):
   ✅ services/interventionLevelSystem.ts
   ✅ services/interventionLevelManager.ts
   ✅ hooks/useInterventionSystem.ts
   ✅ components/InterventionHistory.tsx

📁 Archivos Nuevos:
   ✅ INTEGRACION_SISTEMA_NIVELES.md (documentación completa)
   ✅ GUIA_RAPIDA_NIVELES.md (este archivo)


🎉 SISTEMA 100% OPERATIVO Y DOCUMENTADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Última actualización: 2025-11-25 11:15 AM
Desarrollado con ❤️ por el equipo AlterFocus
