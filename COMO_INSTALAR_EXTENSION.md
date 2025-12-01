# 🔧 GUÍA DE INSTALACIÓN DE LA EXTENSIÓN ALTERFOCUS

## ⚠️ PASOS OBLIGATORIOS (Seguir EN ORDEN)

### 1️⃣ Abrir Chrome en la página de extensiones
1. Abre Google Chrome
2. Escribe en la barra de direcciones: `chrome://extensions`
3. Presiona Enter

### 2️⃣ Activar el modo desarrollador
1. En la esquina superior derecha, activa el switch **"Modo de desarrollador"**
2. Deberían aparecer 3 botones nuevos: "Cargar extensión sin empaquetar", "Empaquetar extensión", "Actualizar"

### 3️⃣ Cargar la extensión
1. Haz clic en **"Cargar extensión sin empaquetar"**
2. Navega a la carpeta: `C:\Users\U S U A R I O\Downloads\alterfocus-p1 (8)\extension`
3. Selecciona esa carpeta y haz clic en "Seleccionar carpeta"

### 4️⃣ Verificar que se cargó correctamente
Deberías ver una tarjeta que dice:
- **AlterFocus Companion**
- Version 1.0
- ID: (algún código largo)
- **El switch debe estar AZUL (activado)**

### 5️⃣ Abrir la consola del service worker
1. En la tarjeta de "AlterFocus Companion", busca el texto azul que dice **"service worker"**
2. Haz clic en él
3. Se abrirá DevTools mostrando logs como:
   ```
   ✅ AlterFocus Background Worker Started
   📦 Extension installed/updated
   💾 Initial storage set
   🚫 Blocking sites: (lista de sitios)
   🎯 Background worker ready - webNavigation blocking enabled
   ```

### 6️⃣ Probar el bloqueo
1. **Con DevTools ABIERTO**, abre una nueva pestaña
2. Intenta ir a `facebook.com`
3. En la consola del service worker DEBES ver:
   ```
   🔴 Blocking facebook.com redirecting to http://localhost:5175/...
   📊 Stats updated: 1 blocked, 5min saved
   ```
4. La página debe redirigirse a `localhost:5175`

---

## ❌ SI NO FUNCIONA:

### Problema 1: No aparece nada en la consola
- La extensión no se cargó bien
- **Solución:** Haz clic en el botón "🔄 Actualizar" en la tarjeta de la extensión

### Problema 2: Error "service worker registration failed"
- Hay un error de sintaxis en el código
- **Solución:** Revisa que `background.js` no tenga errores

### Problema 3: Bloquea pero no redirige
- El puerto de localhost está mal
- **Solución:** Verifica que `npm run dev` esté corriendo en el puerto **5175**

### Problema 4: La extensión se desactiva sola
- Chrome está bloqueando la extensión
- **Solución:** Haz clic en "Detalles" y verifica que todos los permisos estén activados

---

## 🎯 VERIFICACIÓN FINAL

Abre `chrome://extensions` y en la tarjeta de AlterFocus:
- [ ] El switch está AZUL (activado)
- [ ] No aparece ningún mensaje de error en rojo
- [ ] El service worker está activo (texto azul clickeable)
- [ ] Al hacer clic en service worker, se abre DevTools con logs

Si todo lo anterior está bien, la extensión DEBE funcionar.

---

## 📞 DEBUG RÁPIDO

Ejecuta esto en la consola del navegador (F12):
```javascript
chrome.storage.local.get(null, (data) => console.log('Extension data:', data));
```

Si ves `Extension data: { isActive: true, blockedToday: 0, ... }` → La extensión está funcionando.
Si ves `undefined` o error → La extensión no está instalada.
