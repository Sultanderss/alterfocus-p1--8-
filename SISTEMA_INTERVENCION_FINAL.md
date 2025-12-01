# 📦 ARCHIVOS CLAVE DEL SISTEMA DE INTERVENCIÓN - AlterFocus

## ✅ Estado: Build exitoso, sin errores de compilación

## 📁 Estructura de Archivos Modificados:

### 1. **Extension (Bloqueador)**
- `extension/background.js` - Service worker que intercepta navegación
- `extension/manifest.json` - Configuración de permisos
- `extension/rules.json` - Reglas de bloqueo declarativas

### 2. **Componente Principal**
- `components/interventions/InterventionFinal.tsx` - Sistema de intervención completo
  - Toast contextualizado (intentos 1-2)
  - Herramientas integradas (intentos 3-5)
  - Modo crisis (intentos 6+)

### 3. **Herramientas Individuales**
- `components/Breathing.tsx` - Ejercicio 4-7-8
- `components/interventions/PhysicalExercise.tsx` - Rutina física
- `components/interventions/CognitiveReframing.tsx` - Reflexión
- `components/interventions/AITherapyBrief.tsx` - Terapia IA

### 4. **Lógica de Decisión**
- `services/interventionLogic.ts` - Motor de decisiones contextual

### 5. **App Principal**
- `App.tsx` - Integración y estado global
  - Línea 22: Import de InterventionFinal
  - Línea 185-188: Reset de contador cuando viene de extensión
  - Línea 578: Renderizado de InterventionFinal

## 🎯 FLUJO FUNCIONAL:

1. Usuario intenta abrir Facebook/YouTube
2. Extension redirige a `localhost:5175/?from=intervention&source=facebook.com`
3. App detecta redirect, resetea contador a 0
4. Muestra InterventionFinal con attemptCount = 1
5. **INTENTO 1-2**: Toast con "Respirar 2 min" + "Ignorar"
6. **INTENTO 3-5**: Toast sin "Ignorar" (obligatorio usar herramienta)
7. **INTENTO 6+**: Pantalla completa de crisis con recursos

## 🔧 PARA USAR CON OTRA IA:

Si necesitas compartir este código con otra IA, estos son los archivos esenciales:

### Obligatorios:
1. `components/interventions/InterventionFinal.tsx` (263 líneas)
2. `extension/background.js` (140 líneas)
3. `App.tsx` (secciones relevantes: líneas 22, 175-205, 575-610)

### Opcionales (para contexto):
4. `services/interventionLogic.ts`
5. `types.ts`

## 📝 INSTRUCCIONES PARA OTRA IA:

```
El sistema AlterFocus tiene:

1. Una extensión de Chrome que bloquea sitios y redirige con parámetro `?from=intervention`

2. Un componente React llamado InterventionFinal que:
   - Muestra toast contextualizado para intentos 1-2
   - Permite ignorar solo en intentos 1-2
   - Obliga a usar herramienta en intentos 3+
   - Muestra pantalla de crisis en intentos 6+
   - Integra 4 herramientas: Breathing, Exercise, Reframing, AI Therapy

3. El contador se resetea a 0 cuando viene de la extensión
4. Se incrementa cuando el usuario ignora la intervención

El código compila sin errores (Exit code: 0).
```

## 🚀 PASOS PARA VERIFICAR:

1. Abrir `chrome://extensions`
2. Actualizar extensión AlterFocus
3. Abrir DevTools del service worker
4. Intentar abrir facebook.com
5. Verificar redirect a localhost:5175
6. Verificar que aparece el toast en la parte superior
7. Hacer clic en "Respirar 2 min" para ver herramienta completa
8. O hacer clic en "Ignorar" para volver y probar segundo intento

## ⚠️ NOTAS:

- El build está completo (npm run build exitoso)
- No hay errores de TypeScript
- Todos los imports están correctos
- El código está en: `c:\Users\U S U A R I O\Downloads\alterfocus-p1 (8)`
