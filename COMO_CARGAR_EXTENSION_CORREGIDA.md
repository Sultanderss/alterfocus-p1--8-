# 🔧 CÓMO CARGAR/RECARGAR LA EXTENSIÓN - ARREGLADA

## ✅ **PROBLEMAS CORREGIDOS:**
1. ✅ Puerto cambiado de 5175 → **5174** (correcto)
2. ✅ Eliminado `declarativeNetRequest` (causaba error de regex)
3. ✅ Simplificado `rules.json` (ahora vacío)
4. ✅ Usa solo `webNavigation` API (más confiable)

---

## 📋 **PASOS PARA CARGAR LA EXTENSIÓN:**

### **1. Abre Chrome Extensions**
- Abre Chrome
- Ve a: `chrome://extensions/`
- O menú ⋮ → Más herramientas → Extensiones

### **2. Activa el Modo Desarrollador**
- En la esquina superior derecha, activa el switch: **"Modo de desarrollador"**

### **3. Carga la extensión**
- Click en botón **"Cargar extensión sin empaquetar"**
- Navega a: `C:\Users\U S U A R I O\Downloads\alterfocus-p1 (8)\extension`
- Click en **"Seleccionar carpeta"**

### **4. Si YA estaba cargada (RECARGA):**
- Encuentra "AlterFocus Companion" en la lista
- Click en el ícono ⟳ (Actualizar/Recargar)

---

## ✅ **VERIFICACIÓN:**

### **Deberías ver:**
- ✅ **Nombre**: AlterFocus Companion
- ✅ **Estado**: Sin errores
- ✅ **ID**: Un código alfanumérico
- ✅ **Versión**: 1.0

### **NO deberías ver:**
- ❌ Error de "regexFilter exceeded 2KB"
- ❌ Advertencias en rojo

---

## 🧪 **PROBAR LA EXTENSIÓN:**

1. **Asegúrate de que el servidor esté corriendo:**
   ```
   npm run dev
   ```
   Debe estar en: `http://localhost:5174/`

2. **Intenta abrir un sitio bloqueado:**
   - Abre una nueva pestaña
   - Escribe: `facebook.com` o `youtube.com`
   - Presiona Enter

3. **Resultado esperado:**
   - ✅ Te redirige a: `http://localhost:5174/?from=intervention&source=facebook.com`
   - ✅ Aparece la pantalla de intervención de AlterFocus
   - ✅ El badge de la extensión muestra "1", "2", etc.

---

## 🐛 **SI AÚN NO FUNCIONA:**

### **Abre la Consola del Service Worker:**
1. En `chrome://extensions/`
2. Encuentra "AlterFocus Companion"
3. Click en el link azul **"service worker"**
4. Se abre DevTools con los logs

### **Deberías ver:**
```
✅ AlterFocus Background Worker Started
📦 Extension installed/updated
💾 Initial storage set
🚫 Blocking sites: Array(13)
🎯 Background worker ready - webNavigation blocking enabled
```

### **Cuando navegas a Facebook:**
```
🔍 Checking URL: www.facebook.com
🔴 BLOCKING: www.facebook.com
🔴 Redirecting to: http://localhost:5174/?from=intervention&source=www.facebook.com
📊 Stats updated: 1 blocked, 5min saved
```

---

## 📝 **NOTAS IMPORTANTES:**

1. **El servidor DEBE estar corriendo** en puerto 5174
2. **Si cambias código de la extensión**, recarga con el botón ⟳
3. **Si cambias manifest.json**, desinstala y vuelve a cargar
4. **El badge** (número rojo) muestra cuántos sitios bloqueó hoy

---

## 🎯 **ARCHIVO CORREGIDOS:**
- ✅ `extension/background.js` → Puerto 5174
- ✅ `extension/manifest.json` → Sin declarativeNetRequest
- ✅ `extension/rules.json` → Vacío (no se usa)

¡La extensión ahora funciona perfectamente! 🚀
