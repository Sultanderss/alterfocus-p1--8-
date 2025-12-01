# 🧠 AlterFocus Extension - INSTALACIÓN RÁPIDA

## ⚡ INSTALACIÓN EN 3 PASOS

### 📍 PASO 1: Abrir Extensiones
1. Abre Chrome/Brave/Edge
2. Escribe en la barra de direcciones: **`chrome://extensions/`**
3. Presiona Enter

### 🔧 PASO 2: Activar Modo Desarrollador
- En la esquina superior derecha, activa el switch **"Modo de desarrollador"**

### 📂 PASO 3: Cargar la Extensión
1. Haz clic en el botón **"Cargar extensión sin empaquetar"**
2. Navega a esta carpeta:
   ```
   C:\Users\U S U A R I O\Downloads\alterfocus-p1 (8)\extension
   ```
3. Selecciona la carpeta `extension` y haz clic en **"Seleccionar carpeta"**

---

## ✅ VERIFICACIÓN

La extensión **"AlterFocus Companion"** debería aparecer en tu lista con:
- ✅ Nombre: AlterFocus Companion
- ✅ ID: Un código alfanumérico
- ✅ Estado: Habilitado
- ✅ Versión: 1.0

---

## 🧪 PRUEBA RÁPIDA

1. **Fija la extensión** a la barra de tareas:
   - Haz clic en el ícono de puzzle (🧩) en la barra superior
   - Encuentra "AlterFocus Companion"
   - Haz clic en el pin 📌

2. **Abre el popup**:
   - Haz clic en el ícono de AlterFocus (🧠)
   - Deberías ver: "Protección Activa"

3. **Prueba el bloqueo**:
   - Ve a `https://www.youtube.com`
   - Deberías ver la pantalla de "AlterFocus Activado"
   - Serás redirigido a `localhost:5174`

---

## 🎯 ARCHIVOS DE LA EXTENSIÓN

Los 5 archivos necesarios están en la carpeta `extension/`:

✅ `manifest.json` - Configuración principal
✅ `background.js` - Lógica de fondo (3.3 KB)
✅ `content.js` - Script de bloqueo (2.2 KB)
✅ `popup.html` - Interfaz del popup (5.7 KB)
✅ `popup.js` - Lógica del popup (2.1 KB)

**Total:** 5 archivos, ~14.6 KB

---

## 🔍 SITIOS BLOQUEADOS

Por defecto, la extensión bloquea:
- 🎥 YouTube
- 📘 Facebook
- 📷 Instagram
- 🎵 TikTok
- 🐦 Twitter/X
- 🔴 Reddit
- 🎬 Netflix

---

## 💡 CARACTERÍSTICAS

✨ **Feedback Visual**: Pantalla de carga antes de redireccionar
📊 **Estadísticas**: Contador de sitios bloqueados por día
⏱️ **Tiempo Ahorrado**: Estimación automática (5min/bloqueo)
🌙 **Reset Automático**: Estadísticas se reinician a medianoche
🎨 **UI Premium**: Diseño oscuro con gradientes modernos
⚡ **Pause Mode**: Desactiva temporalmente desde el popup

---

## 🛠️ SI ALGO NO FUNCIONA

### ❌ "La extensión no aparece"
→ Verifica que seleccionaste la carpeta `extension` correcta

### ❌ "No redirecciona"
→ Asegúrate de que el servidor esté corriendo:
```bash
cmd /c "npx vite --port 5174"
```

### ❌ "Error en el popup"
→ Abre DevTools del popup:
- Clic derecho en el ícono de AlterFocus
- Selecciona "Inspect popup"
- Revisa errores en la consola

---

## 🚀 ¡LISTO!

La extensión está 100% funcional y lista para usar.

**Próximo paso:** Prueba visitando YouTube para ver la magia. 🎯
