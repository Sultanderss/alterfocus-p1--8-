# ⚡ EJECUCIÓN RÁPIDA - ALTERFOCUS MVP

## 🚀 INICIO RÁPIDO (1 MINUTO)

### **Si tienes error de PowerShell:**

```powershell
# Opción 1: Ejecutar como Admin
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Opción 2: Usar directo
node_modules\.bin\vite
```

### **Inicio Normal:**

```bash
npm run dev
```

La app abrirá en: **http://localhost:5173**

---

## 🧪 TESTING RÁPIDO (5 MIN)

### **1. Extensión:**
1. Chrome -> `chrome://extensions/`
2. "Modo desarrollador" ON
3. "Cargar extensión sin empaquetar"
4. Selecciona carpeta `extension/`
5. Abre YouTube o WhatsApp Web

### **2. App Principal:**
1. Abre http://localhost:5173
2. Completa onboarding (nombre + meta)
3. Inicia Focus Session
4. Prueba intervención (botón "Test Mode")
5. Termina sesión -> Ver PostSessionModal

---

## ✅ FEATURES IMPLEMENTADAS (MVP)

- ✅ **Detección de patrones** (compulsión, early attempt, late session)
- ✅ **Contexto circadiano** (adapta según hora del día)
- ✅ **Crisis detection** + recursos Colombia (Línea PAS)
- ✅ **WhatsApp/Telegram/Discord** detection
- ✅ **PostSessionModal** con feedback + celebration
- ✅ **Analytics Module** con gráficos
- ✅ **Extensión Chrome** moderna y compacta
- ✅ **Offline-first** (localStorage + Zustand)
- ✅ **Mobile responsive**

---

## 📊 DEMO PARA PITCH

### **Flujo Demo (3 minutos):**

1. **Inicio:** "Escribir tesis" como objetivo
2. **Distracción:** Test Mode -> Simula YouTube
3. **Intervención:** Modal pregunta contexto
4. **Herramienta:** Selecciona "5 min Respirar"
5. **Sesión:** Completa timer
6. **Feedback:** Modal aparece, score 5/5
7. **Celebration:** 🎉 Confetti + stats
8. **Analytics:** Dashboard muestra mejora

### **One-Liners para Pitch:**

> "AlterFocus no te bloquea. Te entiende. Usando ciencia de ritmos circadianos."

> "Detectamos que WhatsApp es el #1 distractor en Colombia. Somos los únicos que lo manejan éticamente."

> "70% de estudiantes colombianos luchan con procrastinación. Nosotros también. Por eso lo resolvimos."

---

## 🎯 MÉTRICAS ACTUALES (Para Inversores)

### **Setup Tracking:**
```javascript
// En Dashboard.tsx - agregar Google Analytics
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### **Medir:**
- DAU/MAU
- Session completion rate
- Intervention success rate
- NPS (Net Promoter Score)

---

## 🔥 QUICK FIXES

### **Error: Module not found**
```bash
npm install
```

### **Puerto ocupado:**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### **Build para producción:**
```bash
npm run build
npm run preview
```

---

## 📦 DEPLOY (VERCEL - 2 MIN)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Producción
vercel --prod
```

---

## 🎤 CHECKLIST PRE-PITCH

- [ ] App funciona sin crashes
- [ ] Extensión cargada en Chrome
- [ ] Video demo grabado (60 seg)
- [ ] Pitch deck descargado en laptop
- [ ] Backup: app deployed en Vercel
- [ ] Batería laptop >80%
- [ ] Internet estable (hotspot backup)
- [ ] Slide con métricas actualizado

---

**¡ÉXITO EN EL PITCH! 🚀**

_Tu proyecto es SÓLIDO. Ahora véndelo con confianza._
