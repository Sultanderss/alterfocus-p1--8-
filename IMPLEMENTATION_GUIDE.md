# AlterFocus Implementation Guide

## 🌟 Status

### ✅ COMPLETADO
- ✅ `.env.local` con credenciales Supabase
- ✅ Componente `Auth.tsx` (Login/Signup completo)
- ✅ Auth import agregado a `App.tsx`
- ✅ Supabase configurado en `lib/supabase.ts` (647 líneas)

### ⚠️ PENDIENTE (TODO INMEDIATAMENTE)
- [ ] Integrar Auth flow en App.tsx
- [ ] Corregir errores visuales del Pitch
- [ ] Ejecutar supabase-schema.sql
- [ ] Testear Login/Signup con Supabase

---

## 📄 PASOS PARA TERMINAR

### 1. COMPLETAR INTEGRACIÓN DE AUTH EN APP.TSX

**Archivo:** `App.tsx` (línea ~75)

**Agregar estos estados:**
```typescript
const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
const [authLoading, setAuthLoading] = useState<boolean>(true);
const [currentUser, setCurrentUser] = useState<any>(null);
```

**Agregar este effect al inicio (después de que cargue la configuración):**
```typescript
// Check auth status on mount
useEffect(() => {
  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setCurrentUser(session.user);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  checkAuth();
}, []);
```

**Modificar el retorno (JSX):**

REMPLAZA esta línea:
```typescript
return (
  <div className="h-screen w-full bg-brand-dark...">
```

CON:
```typescript
// Show loading state
if (authLoading) {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">AlterFocus</h2>
        <p className="text-gray-400">Cargando...</p>
      </div>
    </div>
  );
}

// Show Auth screen if not authenticated
if (!isAuthenticated) {
  return <Auth onAuthSuccess={() => { setIsAuthenticated(true); }} />;
}

return (
  <div className="h-screen w-full bg-brand-dark...">
```

### 2. EJECUTAR SCHEMA DE SUPABASE

**En tu dashboard Supabase:**

1. Ve a `SQL Editor`
2. Click en `New Query`
3. Copia el contenido de `supabase-schema.sql` (en la raíz del proyecto)
4. Ejecuta la query

**Esto crea las tablas:**
- `users` (perfil del usuario)
- `sessions` (histórico de sesiones)
- `interventions` (registro de intervenciones)
- `achievements` (logros desbloqueados)

### 3. CORREGIR ERRORES VISUALES DEL PITCH

**Archivo:** `components/LandingPage.tsx` (líneas 476-604)

**Problemas identificados:**
- ❌ Espaciado inconsistente entre secciones
- ❌ Grid se desborda en móviles (responsive issue)
- ❌ Sin CTA final (Call to Action)
- ❌ Colores no están alineados con brand guidelines

**Soluciones:**

#### a) Agregar gap consistente:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
  {/* En lugar de gap-4 */}
</div>
```

#### b) Mejorar mobile responsiveness:
```typescript
// En los títulos de sección:
<h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
  {/* En lugar de text-2xl directo */}
</h2>
```

#### c) Agregar CTA final:
```typescript
<div className="mt-12 p-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-center">
  <h3 className="text-2xl font-bold text-white mb-4">Listo para cambiar tu vida?</h3>
  <button className="px-8 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition">
    Comienza Ahora
  </button>
</div>
```

### 4. FLUJO COMPLETO ESPERADO

```
Splash (2s)
    ↓
┌─────────────────┐
│ Usuario Nuevo?  │
└─────────────────┘
    ↙         ↘
  NO          SI
   ↓           ↓
  Auth      Dashboard
   ↓
 Onboarding (opcional)
   ↓
 Dashboard
```

### 5. TESTING

**Test 1: Signup**
1. Abre la app
2. Click en "Regístrate"
3. Ingresa: `test@example.com` / `TestPass123`
4. Debe crear la cuenta en Supabase
5. Debe ir a Dashboard

**Test 2: Login**
1. Abre la app (nueva ventana incógnito)
2. Ingresa las credenciales
3. Debe ir a Dashboard

**Test 3: Persistencia**
1. Inicia sesión
2. Recarga la página (F5)
3. NO debe volver a pedir login

---

## 📁 ARCHIVOS CREADOS/MODIFICADOS

| Archivo | Status | Cambios |
|---------|--------|----------|
| `.env.local` | ✅ Creado | Credenciales Supabase |
| `components/Auth.tsx` | ✅ Creado | 116 líneas - Login/Signup completo |
| `App.tsx` | ⚠️ Parcial | Solo import, falta integración completa |
| `LandingPage.tsx` | ❌ Pendiente | Errores visuales del Pitch |
| `supabase-schema.sql` | ⏳ Pendiente | Schema a ejecutar manualmente |

---

## 🔡 COMANDOS ÚTILES

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

---

## ⚭ NOTAS IMPORTANTES

1. **Seguridad:** Las credenciales Supabase en `.env.local` NO deben committearse. Git ya lo ignora.
2. **Base de datos:** El schema es automático - Supabase genera RLS policies.
3. **Auth:** Supabase maneja el JWT automáticamente en cookies seguras.
4. **localStorage fallback:** Si Supabase falla, la app usa localStorage como fallback.

---

## 🐛 PROBLEMAS COMUNES

**"Error: Supabase URL or key missing"**
→ Verifica que `.env.local` esté en la raíz del proyecto

**"Auth component not found"**
→ Verifica que `Auth.tsx` esté en `components/` con la export correcta

**"CORS error al conectar Supabase"**
→ En Supabase Settings → Auth → Redirect URLs:
  - Agrega: `http://localhost:5173`
  - Agrega: Tu dominio de Vercel

---

## 🏡 PRÓXIMOS PASOS

1. ✅ Termina la integración de Auth en App.tsx
2. ✅ Ejecuta el schema de Supabase
3. ✅ Corrige los errores visuales del Pitch
4. ✅ Haz testing completo
5. ✅ Deploy a Vercel

**¡Todo listo para producción!**
