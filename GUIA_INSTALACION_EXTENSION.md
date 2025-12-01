# 🚀 Guía de Instalación - AlterFocus Extension

## ✅ Cambios Realizados (Corrección Completa)

### Problemas Solucionados:
1. ✅ **Puerto actualizado**: Cambio de `5173` → `5174` (coincide con tu servidor actual)
2. ✅ **Feedback visual**: Pantalla de carga antes de redireccionar
3. ✅ **Estadísticas**: Contador de sitios bloqueados y tiempo ahorrado
4. ✅ **UI mejorada**: Popup rediseñado con diseño premium
5. ✅ **Reset diario**: Las estadísticas se reinician automáticamente

---

## 📁 Archivos de la Extensión

Carpeta: `extension/`

- `manifest.json` - Configuración de la extensión
- `background.js` - Service worker con lógica de fondo
- `content.js` - Script que se inyecta en las páginas bloqueadas
- `popup.html` - Interfaz del popup
- `popup.js` - Lógica del popup

---

## 🔧 Instalación en Chrome/Brave/Edge

### Paso 1: Abrir Extensiones
1. Abre tu navegador (Chrome, Brave, Edge, etc.)
2. Ve a: `chrome://extensions/`
3. **Activa** el "Modo de desarrollador" (switch en la esquina superior derecha)

### Paso 2: Cargar la Extensión
1. Haz clic en **"Cargar extensión sin empaquetar"** / **"Load unpacked"**
2. Navega a la carpeta del proyecto: 
   ```
   C:\Users\U S U A R I O\Downloads\alterfocus-p1 (8)\extension
   ```
3. Selecciona la carpeta `extension` y haz clic en **Seleccionar carpeta**

### Paso 3: Verificar Instalación
- La extensión **"AlterFocus Companion"** debería aparecer en tu lista
- Haz clic en el ícono de puzzle (🧩) en la barra de herramientas
- Fija (pin) **AlterFocus** para acceso rápido

---

## 🧪 Probar la Extensión

### Prueba 1: Popup
1. Haz clic en el ícono de AlterFocus en la barra
2. Deberías ver:
   - Estado: "Protección Activa"
   - Estadísticas: Bloqueados Hoy / Tiempo Ahorrado
   - Botón: "Desactivar Temporalmente"
   - Link: "🚀 Abrir AlterFocus App"

### Prueba 2: Bloqueo Activo
1. **Asegúrate de que tu servidor esté corriendo** en `http://localhost:5174`
2. Intenta visitar: `https://www.youtube.com`
3. Deberías ver:
   - Pantalla de carga con el emoji 🧠
   - Mensaje: "AlterFocus Activado"
   - Redirección automática a `localhost:5174` después de 0.8s

### Prueba 3: Estadísticas
1. Después de bloquear un sitio, abre el popup nuevamente
2. El contador de "Bloqueados Hoy" debería aumentar
3. El "Tiempo Ahorrado" también incrementa (5min por bloqueo)

---

## ⚙️ Configuración del Puerto

Si cambias el puerto del servidor (ej. de 5174 a otro), edita:

**`extension/content.js`** - Línea 17:
```javascript
const ALTERFOCUS_APP_URL = 'http://localhost:TU_PUERTO';
```

**`extension/popup.html`** - Línea 198:
```html
<a href="http://localhost:TU_PUERTO" target="_blank" class="app-link">
```

---

## 🌐 Sitios Bloqueados por Defecto

La extensión bloquea automáticamente:
- ✅ YouTube
- ✅ Facebook
- ✅ Instagram
- ✅ TikTok
- ✅ Twitter / X
- ✅ Reddit
- ✅ Netflix

Para agregar o quitar sitios, edita `background.js` línea 7-15.

---

## 🔄 Actualizar la Extensión

Si haces cambios en el código:
1. Ve a `chrome://extensions/`
2. Haz clic en el botón **🔄 Recargar** en la tarjeta de AlterFocus

---

## 🛠️ Solución de Problemas

### ❌ La extensión no redirecciona
**Causa:** El servidor no está corriendo en el puerto 5174
**Solución:** 
```bash
cd "C:\Users\U S U A R I O\Downloads\alterfocus-p1 (8)"
cmd /c "npx vite --port 5174"
```

### ❌ Error "Cannot read chrome.storage"
**Causa:** La extensión no está cargada correctamente
**Solución:** Recarga la extensión en `chrome://extensions/`

### ❌ El popup no se abre
**Causa:** Error en `popup.js` o `popup.html`
**Solución:** 
1. Abre DevTools del popup (clic derecho en el ícono → Inspeccionar)
2. Revisa errores en la consola

### ❌ Las estadísticas no se actualizan
**Causa:** El `background.js` no está ejecutándose
**Solución:**
1. Ve a `chrome://extensions/`
2. Encuentra AlterFocus y haz clic en "Service worker (inactivo)"
3. Verifica errores en la consola

---

## 🎯 Próximos Pasos

1. **Probar con sitios reales**: Intenta abrir YouTube, Instagram, etc.
2. **Revisar estadísticas**: Observa cómo incrementa el contador
3. **Probar modo pausa**: Desactiva temporalmente desde el popup
4. **Integrar con la app**: Verifica que la redirección funcione correctamente

---

## 📝 Notas de Desarrollo

- **Manifest V3**: La extensión usa el estándar más reciente
- **Service Worker**: El background script se ejecuta en segundo plano
- **LocalStorage**: Las estadísticas se guardan localmente
- **Reset Diario**: A medianoche, las estadísticas se reinician automáticamente

**¡Listo!** La extensión ahora está completamente funcional y corregida. 🎉
