import React, { useState, useEffect, useRef } from 'react';
import OnboardingTutorial from './components/OnboardingTutorial';
import { AppView, UserState, FocusConfig, POINTS, InterventionTone, SessionRecord } from './types';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';




import { AnimatePresence, motion } from 'framer-motion';
import Alternatives from './components/Alternatives';
import FocusSession from './components/FocusSession';
import Breathing from './components/Breathing';
import CrisisSupport from './components/CrisisSupport';
import Community from './components/Community';
import StudyPanel from './components/StudyPanel';
import OfflineStudy from './components/OfflineStudy';
import Settings from './components/Settings';
import Analytics from './components/Analytics';
import AIGuide from './components/AIGuide';
import BottomNavigation from './components/BottomNavigation';
import InterventionMultimodal from './components/interventions/InterventionMultimodal';
import ErrorBoundary from './components/ErrorBoundary';
import { Trophy } from 'lucide-react';

import { AutonomyProgress, shouldUnlockIgnoreButton } from './services/autonomySystem';

// --- GLOBAL AMBIENT BACKGROUND (Endel Style) ---
const GlobalAmbientBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
    <motion.div
      animate={{
        opacity: [0.3, 0.5, 0.3],
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-brand-primary/20 blur-[120px]"
    />
    <motion.div
      animate={{
        opacity: [0.2, 0.4, 0.2],
        x: [0, 50, 0],
        y: [0, -50, 0]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-brand-secondary/10 blur-[120px]"
    />
  </div>
);


import Dashboard from './components/Dashboard';

export default function App() {
  // -- State Management --
  const [currentView, setCurrentView] = useState<AppView>(AppView.SPLASH);

  // ... (rest of state)

  const [tutorialCompleted, setTutorialCompleted] = useState<boolean>(false);

  const [user, setUser] = useState<UserState>({
    name: 'Estudiante',
    peakTime: 'Mañana',
    helpStyle: 'Visual',
    points: 0,
    completedSessions: 0,
    focusMinutes: 0,
    postponeCount: 0,
    dailyGoal: '', // Start empty for logic checks
    dailyGoalTarget: 120,
    hasOnboarded: false,
    dailyTikTokAttempts: 0,
    interventionTone: 'empathic',
    notificationsEnabled: false,
    soundEnabled: true,
    darkMode: true,
    hasCompletedAISetup: false,
    distractionApps: [],
    procrastinationHours: [],
    connectedIntegrations: [],
  });

  // --- AUTONOMY PROGRESS STATE ---
  const [autonomyProgress, setAutonomyProgress] = useState<AutonomyProgress>({
    currentLevel: 'aprendiz',
    successfulInterventions: 0,
    ignoredInterventions: 0,
    physicalChallengesCompleted: 0,
    daysStreak: 0,
    ignoreButtonUnlocked: false,
  });

  const [focusConfig, setFocusConfig] = useState<FocusConfig>({
    durationMinutes: 25,
    taskName: 'Sesión de Estudio',
    mode: 'digital'
  });
  const [showReward, setShowReward] = useState<{ show: boolean, points: number }>({ show: false, points: 0 });

  // New state to pass context from Dashboard to AIGuide
  const [aiContext, setAiContext] = useState<{ type: 'kickstart' | 'motivation' | 'analysis' | null, goal: string } | null>(null);

  // State to track WHY intervention was triggered (Manual simulation vs Real tab switch)
  const [interventionTrigger, setInterventionTrigger] = useState<'manual' | 'auto'>('manual');

  // State to track blocked site from extension
  const [blockedSiteContext, setBlockedSiteContext] = useState<string | undefined>(undefined);

  // --- INTERVENTION METRICS TRACKING ---
  const [consecutiveIgnores, setConsecutiveIgnores] = useState<number>(0);
  const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(null);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number>(0);

  // Refs for managing notifications and timeouts
  const notificationsEnabledRef = useRef(user.notificationsEnabled);
  const scheduledNotificationsRef = useRef<number[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    notificationsEnabledRef.current = user.notificationsEnabled;
  }, [user.notificationsEnabled]);

  // Update session duration every minute
  useEffect(() => {
    if (currentSessionStart) {
      const interval = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - currentSessionStart.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        setSessionDurationMinutes(diffMinutes);
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [currentSessionStart]);

  // Load consecutive ignores from storage
  useEffect(() => {
    const stored = localStorage.getItem('consecutiveIgnores');
    if (stored) setConsecutiveIgnores(parseInt(stored, 10));
  }, []);

  // -- Initialization & Daily Reset --
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const lastDate = localStorage.getItem('lastActiveDate');

    // Check if user has completed onboarding (Introduction screens)
    const storedOnboarding = localStorage.getItem('onboardingCompleted');
    const storedTutorial = localStorage.getItem('tutorialCompleted');

    const storedPoints = localStorage.getItem('alterFocusPoints');
    const storedGoal = localStorage.getItem('dailyGoal');
    const storedTarget = localStorage.getItem('dailyGoalTarget');
    const storedTone = localStorage.getItem('interventionTone') as InterventionTone;
    const storedNotifs = localStorage.getItem('notificationsEnabled') === 'true';
    const storedSound = localStorage.getItem('soundEnabled') !== 'false';
    const storedDark = localStorage.getItem('darkMode') !== 'false';

    const storedAISetup = localStorage.getItem('hasCompletedAISetup') === 'true';
    const storedDistractions = JSON.parse(localStorage.getItem('distractionApps') || '[]');
    const storedHours = JSON.parse(localStorage.getItem('procrastinationHours') || '[]');
    const storedIntegrations = JSON.parse(localStorage.getItem('connectedIntegrations') || '[]');
    const storedName = localStorage.getItem('userName') || 'Estudiante';
    const storedHelpStyle = localStorage.getItem('helpStyle') || 'Visual';
    const storedPeakTime = localStorage.getItem('peakTime') || 'Mañana';

    // Load tutorial completed status
    if (storedTutorial === 'true') {
      setTutorialCompleted(true);
    }

    // Check if coming from intervention (skip splash)
    const urlParams = new URLSearchParams(window.location.search);
    const fromIntervention = urlParams.get('from') === 'intervention';
    const blockedSite = urlParams.get('source');
    const skipSplash = localStorage.getItem('skip_splash') === 'true';

    if (fromIntervention) {
      // Coming from extension - show intervention immediately
      console.log('🚨 Redirected from extension, blocked site:', blockedSite);

      // RESETEAR contador de intentos - es el PRIMER intento
      setConsecutiveIgnores(0);
      localStorage.setItem('consecutiveIgnores', '0');

      // Store blocked site for intervention context
      if (blockedSite) {
        setBlockedSiteContext(blockedSite);
      }

      // Set intervention as active
      localStorage.setItem('intervention_active', 'true');

      // Skip directly to intervention view
      setCurrentView(AppView.INTERVENTION_CONTEXTUAL);

      // Ensure user is onboarded
      setUser(prev => ({ ...prev, hasOnboarded: true }));
      return;
    }

    if (skipSplash) {
      // Clear flags
      localStorage.removeItem('skip_splash');
      localStorage.removeItem('intervention_active');

      // Skip directly to dashboard (or tool if specified)
      const tool = urlParams.get('tool');
      if (tool === 'breathing') {
        setCurrentView(AppView.BREATHING);
      } else if (tool === 'focus_10' || tool === 'focus_15') {
        const duration = tool === 'focus_10' ? 10 : 15;
        setFocusConfig({
          durationMinutes: duration,
          taskName: user.dailyGoal || 'Trabajar en objetivo',
          mode: 'digital'
        });
        setCurrentView(AppView.FOCUS_SESSION);
      } else {
        setCurrentView(AppView.DASHBOARD);
      }

      // Ensure user is onboarded
      setUser(prev => ({ ...prev, hasOnboarded: true }));
      return;
    }

    // Normal flow: Load from storage
    const savedUser = localStorage.getItem('alterfocusUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }
    }

    // Load autonomy progress from localStorage
    const storedProgress = localStorage.getItem('autonomyProgress');
    if (storedProgress) {
      try {
        const parsedProgress = JSON.parse(storedProgress);
        setAutonomyProgress(parsedProgress);
      } catch (e) {
        console.error('Error loading autonomy progress:', e);
      }
    }

    let initialFocusMinutes = 0;
    let initialSessions = 0;
    let initialAttempts = 0;
    let initialPostpone = 0;

    // Daily Reset Logic
    if (lastDate !== todayStr) {
      localStorage.setItem('lastActiveDate', todayStr);
      localStorage.setItem('alterFocusMinutes', '0');
      localStorage.setItem('completedSessions', '0');
      localStorage.setItem('dailyTikTokAttempts', '0');
      localStorage.setItem('postponeCount', '0');
    } else {
      initialFocusMinutes = parseInt(localStorage.getItem('alterFocusMinutes') || '0', 10);
      initialSessions = parseInt(localStorage.getItem('completedSessions') || '0', 10);
      initialAttempts = parseInt(localStorage.getItem('dailyTikTokAttempts') || '0', 10);
      initialPostpone = parseInt(localStorage.getItem('postponeCount') || '0', 10);
    }

    setUser(prev => ({
      ...prev,
      name: storedName,
      peakTime: storedPeakTime,
      helpStyle: storedHelpStyle,
      points: storedPoints ? parseInt(storedPoints, 10) : 0,
      dailyGoal: storedGoal || prev.dailyGoal,
      dailyGoalTarget: storedTarget ? parseInt(storedTarget, 10) : 120,
      focusMinutes: initialFocusMinutes,
      completedSessions: initialSessions,
      dailyTikTokAttempts: initialAttempts,
      postponeCount: initialPostpone,
      interventionTone: storedTone || 'empathic',
      notificationsEnabled: storedNotifs,
      soundEnabled: storedSound,
      darkMode: storedDark,
      hasCompletedAISetup: storedAISetup,
      distractionApps: storedDistractions,
      procrastinationHours: storedHours,
      connectedIntegrations: storedIntegrations,
      hasOnboarded: storedOnboarding === 'true'
    }));

    // -- INTRO FLOW LOGIC --
    // Always show Splash first.
    // Wait 2.5s, then route based on onboarding status.
    console.log('🕐 Setting up splash timer...');
    const timer = setTimeout(() => {
      console.log('⏰ Timer fired! Checking URL params...');
      // Check for Extension Redirection
      const urlParams = new URLSearchParams(window.location.search);
      const isBlocked = urlParams.get('blocked') === 'true';
      const blockedSite = urlParams.get('source');
      console.log('🔍 URL params:', { isBlocked, blockedSite });

      if (isBlocked && blockedSite) {
        // Extension redirected us here!
        console.log("✅ Redirection from Extension detected:", blockedSite);
        setBlockedSiteContext(blockedSite);
        setInterventionTrigger('auto');
        setCurrentView(AppView.INTERVENTION_CONTEXTUAL);
        // Clean URL without reload
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.log('📊 Normal flow - going to Dashboard...');
        // TEMPORARY FIX: Skip onboarding, go directly to Dashboard
        // This bypasses the broken Onboarding component
        if (storedOnboarding !== 'true') {
          localStorage.setItem('onboardingCompleted', 'true');
          localStorage.setItem('lastActiveDate', new Date().toDateString());
        }
        if (storedTutorial !== 'true') {
          localStorage.setItem('tutorialCompleted', 'true');
        }
        setUser(prev => ({ ...prev, hasOnboarded: true }));
        setTutorialCompleted(true);
        console.log('🚀 Setting view to DASHBOARD');
        setCurrentView(AppView.DASHBOARD);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // -- Update autonomy progress when sessions complete --
  useEffect(() => {
    if (user.completedSessions > 0) {
      setAutonomyProgress(prev => ({
        ...prev,
        successfulInterventions: user.completedSessions,
        daysStreak: Math.max(prev.daysStreak, 1),
      }));
    }
  }, [user.completedSessions]);

  // -- Dark Mode Effect --
  useEffect(() => {
    if (user.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user.darkMode]);

  // -- Notification Logic --
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("Este navegador no soporta notificaciones");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setUser(prev => ({ ...prev, notificationsEnabled: true }));
      localStorage.setItem('notificationsEnabled', 'true');
    } else {
      setUser(prev => ({ ...prev, notificationsEnabled: false }));
      localStorage.setItem('notificationsEnabled', 'false');
    }
  };

  const sendNotification = (title: string, body: string) => {
    if (notificationsEnabledRef.current && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const scheduleNotification = (title: string, body: string, delayMs: number) => {
    if (Notification.permission === 'granted') {
      const id = window.setTimeout(() => {
        if (notificationsEnabledRef.current) {
          sendNotification(title, body);
        }
      }, delayMs);
      scheduledNotificationsRef.current.push(id);
    }
  };

  // -- Handlers --

  const handleOAuthFlow = (provider: string, callback: () => void) => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const popup = window.open('', 'Connect ' + provider, `width=${width},height=${height},top=${top},left=${left}`);

    if (popup) {
      popup.document.write(`
            <html>
                <body style="background:#000; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;">
                    <h2>Connecting to ${provider}...</h2>
                    <p>Authenticating...</p>
                </body>
            </html>
        `);
      setTimeout(() => { popup.close(); callback(); }, 1500);
    } else {
      callback();
    }
  };

  const handleConnectIntegration = (id: string) => {
    const isConnected = user.connectedIntegrations.includes(id);
    if (isConnected) {
      const updated = user.connectedIntegrations.filter(i => i !== id);
      handleUpdateUser({ connectedIntegrations: updated });
    } else {
      handleOAuthFlow(id, () => {
        const updated = [...user.connectedIntegrations, id];
        handleUpdateUser({ connectedIntegrations: updated });
        setTimeout(() => sendNotification("Conectado", `${id} listo para usar.`), 500);
      });
    }
  };

  // -- Update autonomy progress when sessions complete --
  useEffect(() => {
    if (user.completedSessions > 0) {
      setAutonomyProgress(prev => ({
        ...prev,
        successfulInterventions: user.completedSessions,
        daysStreak: Math.max(prev.daysStreak, 1),
      }));
    }
  }, [user.completedSessions]);

  // -- Autonomy Bar will be rendered directly in JSX --

  // -- Handle Autonomy Progress Updates --
  const handleUpdateProgress = (updates: Partial<AutonomyProgress>) => {
    setAutonomyProgress(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('autonomyProgress', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('lastActiveDate', new Date().toDateString());
    setUser(prev => ({ ...prev, hasOnboarded: true }));
    setCurrentView(AppView.DASHBOARD);
  };

  const handleUpdateUser = (updates: Partial<UserState>) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      if (updates.points !== undefined) localStorage.setItem('alterFocusPoints', updated.points.toString());
      if (updates.dailyGoal !== undefined) localStorage.setItem('dailyGoal', updated.dailyGoal);
      if (updates.interventionTone !== undefined) localStorage.setItem('interventionTone', updated.interventionTone);
      if (updates.hasCompletedAISetup !== undefined) localStorage.setItem('hasCompletedAISetup', updated.hasCompletedAISetup.toString());
      if (updates.distractionApps !== undefined) localStorage.setItem('distractionApps', JSON.stringify(updated.distractionApps));
      if (updates.procrastinationHours !== undefined) localStorage.setItem('procrastinationHours', JSON.stringify(updated.procrastinationHours));
      if (updates.connectedIntegrations !== undefined) localStorage.setItem('connectedIntegrations', JSON.stringify(updated.connectedIntegrations));
      if (updates.name !== undefined) localStorage.setItem('userName', updated.name);
      if (updates.peakTime !== undefined) localStorage.setItem('peakTime', updated.peakTime);
      if (updates.darkMode !== undefined) localStorage.setItem('darkMode', updated.darkMode.toString());

      // Handle Theme Toggle
      if (updates.darkMode !== undefined) {
        if (updated.darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }

      return updated;
    });
  };

  const handleStartSession = (config: FocusConfig) => {
    setFocusConfig(config);
    setCurrentSessionStart(new Date()); // Track session start
    setSessionDurationMinutes(0);
    if (config.mode === 'offline') {
      setCurrentView(AppView.OFFLINE_STUDY);
    } else {
      setCurrentView(AppView.FOCUS_SESSION);
    }
  };

  const handleSessionComplete = () => {
    const pointsEarned = focusConfig.mode === 'community' ? POINTS.SESSION_COMPLETE_COMMUNITY : focusConfig.mode === 'offline' ? POINTS.SESSION_COMPLETE_OFFLINE : POINTS.SESSION_COMPLETE_DIGITAL;
    const newPoints = user.points + pointsEarned;
    const newCompleted = user.completedSessions + 1;
    const newMinutes = user.focusMinutes + focusConfig.durationMinutes;

    handleUpdateUser({
      points: newPoints,
      completedSessions: newCompleted,
      focusMinutes: newMinutes
    });

    localStorage.setItem('completedSessions', newCompleted.toString());
    localStorage.setItem('alterFocusMinutes', newMinutes.toString());

    // Save History
    const record: SessionRecord = {
      date: new Date().toISOString(),
      durationMinutes: focusConfig.durationMinutes,
      completed: true,
      mode: focusConfig.mode
    };
    const history = JSON.parse(localStorage.getItem('alterfocus_history') || '[]');
    localStorage.setItem('alterfocus_history', JSON.stringify([record, ...history]));

    // Reset session tracking
    setCurrentSessionStart(null);
    setSessionDurationMinutes(0);

    // Reset consecutive ignores on successful session
    setConsecutiveIgnores(0);
    localStorage.setItem('consecutiveIgnores', '0');

    setShowReward({ show: true, points: pointsEarned });
    setTimeout(() => setShowReward({ show: false, points: 0 }), 3000);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleTriggerIntervention = (type: 'manual' | 'auto' = 'manual') => {
    setInterventionTrigger(type);
    setCurrentView(AppView.INTERVENTION_CONTEXTUAL); // USA LA NUEVA VISTA
  };

  // ... (rest of handlers)

  return (
    <div className="h-screen w-full bg-brand-dark text-slate-200 overflow-hidden relative font-sans selection:bg-brand-primary/30">
      {/* ... (background code) */}
      <GlobalAmbientBackground />

      <div className="relative z-10 h-full max-w-md mx-auto glass-panel overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {/* ... (other views) */}

            {currentView === AppView.SPLASH && (
              <SplashScreen key="splash" />
            )}

            {currentView === AppView.ONBOARDING && (
              <Onboarding key="onboarding" onComplete={handleCompleteOnboarding} />
            )}

            {currentView === AppView.DASHBOARD && (
              <Dashboard
                user={user}
                onNavigate={setCurrentView}
                onUpdateGoal={(g, t) => handleUpdateUser({ dailyGoal: g, dailyGoalTarget: t })}
              />
            )}

            {currentView === AppView.AI_GUIDE && (
              <AIGuide
                key="aiguide"
                user={user}
                initialContext={aiContext}
                onBack={() => { setAiContext(null); setCurrentView(AppView.DASHBOARD); }}
                onStartSession={handleStartSession}
                onNavigate={setCurrentView}
                onUpdateUser={handleUpdateUser}
              />
            )}

            {/* ELIMINADO: Intervention (Vieja) */}

            {/* INTERVENCIÓN MULTIMODAL COMPLETA */}
            {currentView === AppView.INTERVENTION_CONTEXTUAL && (
              <InterventionMultimodal
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
                  // Increment consecutive ignores metric
                  const newIgnores = consecutiveIgnores + 1;
                  setConsecutiveIgnores(newIgnores);
                  localStorage.setItem('consecutiveIgnores', newIgnores.toString());
                  // Update user state for attempts count
                  handleUpdateUser({ dailyTikTokAttempts: user.dailyTikTokAttempts + 1 });
                  setCurrentView(AppView.DASHBOARD);
                }}
              />
            )}

            {currentView === AppView.ALTERNATIVES && (
              <Alternatives
                key="alternatives"
                onBack={() => setCurrentView(AppView.DASHBOARD)}
                onNavigate={setCurrentView}
                attempts={user.dailyTikTokAttempts}
                onUpdateAttempts={(val) => {
                  handleUpdateUser({ dailyTikTokAttempts: val });
                  localStorage.setItem('dailyTikTokAttempts', val.toString());
                }}
                onReward={(pts) => {
                  handleUpdateUser({ points: user.points + pts });
                  setShowReward({ show: true, points: pts });
                  setTimeout(() => setShowReward({ show: false, points: 0 }), 3000);
                }}
                onScheduleNotification={scheduleNotification}
              />
            )}

            {currentView === AppView.FOCUS_SESSION && (
              <FocusSession
                key="focus"
                config={focusConfig}
                onComplete={handleSessionComplete}
                onAbort={() => setCurrentView(AppView.DASHBOARD)}
                onTriggerIntervention={handleTriggerIntervention}
              />
            )}

            {currentView === AppView.OFFLINE_STUDY && (
              <OfflineStudy
                key="offline"
                config={focusConfig}
                onBack={() => setCurrentView(AppView.DASHBOARD)}
                onComplete={handleSessionComplete}
              />
            )}

            {currentView === AppView.BREATHING && (
              <Breathing key="breathing" onComplete={() => setCurrentView(AppView.DASHBOARD)} />
            )}

            {currentView === AppView.COMMUNITY && (
              <Community
                key="community"
                onBack={() => setCurrentView(AppView.DASHBOARD)}
                onJoinSession={(room) => handleStartSession({ durationMinutes: 25, taskName: 'Sesión en Grupo', mode: 'community', communityRoomName: room })}
              />
            )}

            {currentView === AppView.STUDY_PANEL && (
              <StudyPanel
                key="studypanel"
                selectedDuration={focusConfig.durationMinutes}
                onBack={() => setCurrentView(AppView.DASHBOARD)}
                onStartOffline={() => handleStartSession({ durationMinutes: 25, taskName: 'Offline', mode: 'offline' })}
                onResourceSelect={() => { }}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === AppView.CRISIS && (
              <CrisisSupport key="crisis" onBack={() => setCurrentView(AppView.DASHBOARD)} />
            )}

            {currentView === AppView.SETTINGS && (
              <Settings
                key="settings"
                user={user}
                onUpdateUser={handleUpdateUser}
                onRequestNotifications={requestNotificationPermission}
                onConnectIntegration={handleConnectIntegration}
                onBack={() => setCurrentView(AppView.DASHBOARD)}
                onLogout={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              />
            )}

            {currentView === AppView.ANALYTICS && (
              <Analytics key="analytics" onBack={() => setCurrentView(AppView.DASHBOARD)} />
            )}
          </AnimatePresence>
        </div>

        {/* Global Reward Overlay */}
        <AnimatePresence>
          {showReward.show && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 20, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
            >
              <div className="bg-amber-400 text-amber-900 px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
                <Trophy size={20} /> +{showReward.points} Puntos
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Persistent Bottom Navigation - Hide during AI Guide and Intervention */}
        {currentView !== AppView.AI_GUIDE && currentView !== AppView.INTERVENTION_CONTEXTUAL && (
          <BottomNavigation currentView={currentView} onNavigate={setCurrentView} />
        )}
      </div>
    </div>
  );
}