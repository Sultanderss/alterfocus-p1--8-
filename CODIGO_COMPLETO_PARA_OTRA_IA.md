# CÓDIGO COMPLETO PARA OTRA IA - AlterFocus Intervention System

## CONTEXTO DEL PROYECTO
- Aplicación web React + TypeScript
- Extensión de Chrome para bloqueo de sitios
- Sistema de intervención progresivo
- Usuario frustrado porque el sistema no muestra el toast inicial correctamente

## PROBLEMA PRINCIPAL
El usuario quiere que cuando bloquee Facebook/YouTube:
1. PRIMER INTENTO: Muestre un toast pequeño arriba con opciones "Usar herramienta" e "Ignorar"
2. SEGUNDO/TERCER INTENTO: Mismo toast pero sin "Ignorar"
3. CUARTO+ INTENTO: Herramienta completa en pantalla
4. SEXTO+ INTENTO: Pantalla de crisis

Actualmente puede que esté yendo directo a la herramienta sin mostrar el toast.

## ARCHIVOS CRÍTICOS Y SU CÓDIGO COMPLETO

### 1. components/interventions/InterventionFinal.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmotionalMetrics, InterventionType } from '../../types';
import { Brain, X, AlertTriangle, Zap } from 'lucide-react';
import Breathing from '../Breathing';
import PhysicalExercise from './PhysicalExercise';
import CognitiveReframing from './CognitiveReframing';
import AITherapyBrief from './AITherapyBrief';

interface InterventionFinalProps {
  metrics: EmotionalMetrics;
  userGoal: string;
  onComplete: (success: boolean) => void;
  onSkip: () => void;
}

type ViewState = 'toast' | 'tool' | 'crisis';

const InterventionFinal: React.FC<InterventionFinalProps> = ({
  metrics,
  userGoal,
  onComplete,
  onSkip,
}) => {
  const [view, setView] = useState<ViewState>('toast');
  const [selectedTool, setSelectedTool] = useState<InterventionType>('breathing_4_7_8');
  const [contextMessage, setContextMessage] = useState('');

  useEffect(() => {
    const { attemptCount } = metrics;
    const hour = new Date().getHours();

    let tool: InterventionType = 'breathing_4_7_8';
    let message = '¿Es esto urgente o es una fuga de dopamina?';

    if (hour >= 14 && hour < 16) {
      tool = 'physical_exercise';
      message = 'Es el bajón de las 2pm. Tu cuerpo pide energía, no Instagram.';
    } else if (hour >= 23 || hour < 1) {
      tool = 'breathing_4_7_8';
      message = 'Es tarde. La presión del deadline te está bloqueando.';
    } else if (attemptCount >= 5) {
      tool = 'ai_therapy_brief';
      message = 'Has intentado distraerte muchas veces. Hablemos un momento.';
    } else if (attemptCount >= 3) {
      tool = 'cognitive_reframing';
      message = 'Varios intentos. ¿Esto te acerca o te aleja de tu objetivo?';
    }

    setSelectedTool(tool);
    setContextMessage(message);

    if (attemptCount <= 2) {
      setView('toast');
    } else if (attemptCount >= 6) {
      setView('crisis');
    } else {
      setView('toast');
    }
  }, [metrics]);

  if (view === 'toast') {
    const { attemptCount } = metrics;
    
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-4 right-4 z-[100] max-w-lg mx-auto"
        >
          <div className="bg-slate-900/98 backdrop-blur-xl border border-indigo-500/40 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
                <Brain size={24} className="text-indigo-400" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-white text-base">
                    Desvío detectado ({attemptCount} {attemptCount === 1 ? 'intento' : 'intentos'})
                  </h3>
                  <button onClick={onSkip} className="text-slate-400 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  {contextMessage}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setView('tool')}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap size={16} />
                    {getToolButtonLabel(selectedTool)}
                  </button>
                  
                  {attemptCount <= 2 && (
                    <button
                      onClick={onSkip}
                      className="px-4 py-2.5 text-sm text-slate-400 hover:text-white font-medium underline transition-colors"
                    >
                      Ignorar
                    </button>
                  )}
                </div>

                {attemptCount > 2 && (
                  <p className="text-xs text-amber-400 mt-2">
                    ⚠️ Has ignorado esto {attemptCount} veces. Es momento de actuar.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (view === 'tool') {
    return (
      <div className="fixed inset-0 z-[100] bg-black">
        {renderTool(selectedTool, userGoal, onComplete)}
      </div>
    );
  }

  if (view === 'crisis') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-rose-950/95 backdrop-blur-lg p-6">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-slate-900 border border-rose-500/50 rounded-3xl p-8 max-w-md w-full"
        >
          <AlertTriangle size={56} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Patrón de crisis detectado
          </h2>
          <p className="text-slate-300 text-center mb-6">
            Has intentado distraerte <strong>{metrics.attemptCount} veces</strong> en poco tiempo.
          </p>
          <div className="space-y-3">
            <button onClick={() => setView('tool')} className="w-full bg-indigo-600 text-white py-3 rounded-xl">
              Usar herramienta
            </button>
            <button onClick={onSkip} className="w-full text-slate-500 text-sm">Volver</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};

function getToolButtonLabel(tool: InterventionType): string {
  const labels: Record<InterventionType, string> = {
    breathing_4_7_8: 'Respirar 2 min',
    physical_exercise: 'Activarme físicamente',
    cognitive_reframing: 'Reflexionar 1 min',
    ai_therapy_brief: 'Hablar con IA',
    gentle_question: 'Continuar'
  };
  return labels[tool] || 'Continuar';
}

function renderTool(tool: InterventionType, userGoal: string, onComplete: (success: boolean) => void) {
  switch (tool) {
    case 'breathing_4_7_8':
      return <Breathing onComplete={(result) => onComplete(result === 'yes')} />;
    case 'physical_exercise':
      return <PhysicalExercise onComplete={onComplete} />;
    case 'cognitive_reframing':
      return <CognitiveReframing userGoal={userGoal} onComplete={(result) => onComplete(result === 'away')} />;
    case 'ai_therapy_brief':
      return <AITherapyBrief onComplete={onComplete} />;
    default:
      return <div className="flex items-center justify-center h-full">
        <button onClick={() => onComplete(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-xl">
          Continuar
        </button>
      </div>;
  }
}

export default InterventionFinal;
```

### 2. App.tsx (SECCIÓN RELEVANTE - Líneas 175-210 y 575-610)
```typescript
// Línea 22 - Import
import InterventionFinal from './components/interventions/InterventionFinal';

// Líneas 181-205 - Detección de redirect desde extensión
if (fromIntervention) {
  console.log('🚨 Redirected from extension, blocked site:', blockedSite);
  
  // RESETEAR contador de intentos - es el PRIMER intento
  setConsecutiveIgnores(0);
  localStorage.setItem('consecutiveIgnores', '0');

  if (blockedSite) {
    setBlockedSiteContext(blockedSite);
  }
  
  localStorage.setItem('intervention_active', 'true');
  setCurrentView(AppView.INTERVENTION_CONTEXTUAL);
  setUser(prev => ({ ...prev, hasOnboarded: true }));
  return;
}

// Líneas 575-610 - Renderizado de InterventionFinal
{currentView === AppView.INTERVENTION_CONTEXTUAL && (
  <InterventionFinal
    metrics={{
      stressLevel: 0.5,
      fatigueLevel: 0.5,
      focusQuality: 0.5,
      attemptCount: consecutiveIgnores + 1,
      sessionDurationMinutes: sessionDurationMinutes,
      lastInterventions: []
    }}
    userGoal={user.dailyGoal || "Mantener el enfoque"}
    onComplete={(success) => {
      if (success) {
        handleUpdateUser({ points: user.points + 10 });
        setShowReward({ show: true, points: 10 });
        setTimeout(() => setShowReward({ show: false, points: 0 }), 3000);
        setCurrentView(AppView.DASHBOARD);
      }
    }}
    onSkip={() => {
      const newIgnores = consecutiveIgnores + 1;
      setConsecutiveIgnores(newIgnores);
      localStorage.setItem('consecutiveIgnores', newIgnores.toString());
      handleUpdateUser({ dailyTikTokAttempts: user.dailyTikTokAttempts + 1 });
      setCurrentView(AppView.DASHBOARD);
    }}
  />
)}
```

### 3. extension/background.js (COMPLETO)
```javascript
console.log('✅ AlterFocus Background Worker Started');

const BLOCKED_SITES = [
  'youtube.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'twitter.com',
  'x.com',
  'reddit.com',
  'netflix.com',
  'twitch.tv',
];

chrome.runtime.onInstalled.addListener(() => {
  console.log('📦 Extension installed/updated');
  chrome.storage.local.set({
    isActive: true,
    blockedToday: 0,
    savedMinutes: 0,
    lastResetDate: new Date().toDateString(),
    blockedSites: BLOCKED_SITES
  }, () => {
    console.log('💾 Initial storage set');
    console.log('🚫 Blocking sites:', BLOCKED_SITES);
  });
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;

  const url = new URL(details.url);
  const hostname = url.hostname;
  
  console.log('🔍 Checking URL:', hostname);

  const shouldBlock = BLOCKED_SITES.some(site => hostname.includes(site));
  if (shouldBlock) {
    console.log('🔴 BLOCKING:', hostname);
    const appUrl = 'http://localhost:5175';
    const interventionUrl = `${appUrl}/?from=intervention&blocked=true&source=${encodeURIComponent(hostname)}`;
    console.log('🔴 Redirecting to:', interventionUrl);
    chrome.tabs.update(details.tabId, { url: interventionUrl });
    updateBlockStats(hostname);
  }
});

function updateBlockStats(hostname) {
  chrome.storage.local.get(['blockedToday', 'savedMinutes'], (result) => {
    const newBlocked = (result.blockedToday || 0) + 1;
    const newMinutes = (result.savedMinutes || 0) + 5;
    chrome.storage.local.set({
      blockedToday: newBlocked,
      savedMinutes: newMinutes
    }, () => {
      console.log(`📊 Stats updated: ${newBlocked} blocked, ${newMinutes}min saved`);
      chrome.action.setBadgeText({ text: newBlocked.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    });
  });
}

console.log('🎯 Background worker ready - webNavigation blocking enabled');
```

## PARA CONVERTIR A APK (RESPUESTA DIRECTA)

Esta es una app web React. Para convertirla a APK necesitas:

1. Instalar Capacitor:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npm install @capacitor/android
npx cap add android
npx cap sync
```

2. Abrir en Android Studio:
```bash
npx cap open android
```

3. Build APK desde Android Studio

**PERO** esto requiere configuración adicional y tiempo. No es instantáneo.

## UBICACIÓN DEL PROYECTO
`c:\Users\U S U A R I O\Downloads\alterfocus-p1 (8)`

## PARA COMPARTIR CON OTRA IA
Comprime la carpeta completa y pásale este archivo como contexto.

## ESTADO ACTUAL
- Build exitoso (Exit code: 0)
- Código compila sin errores TypeScript
- Extension funcional
- Solo falta verificar que apparezca el toast correctamente
