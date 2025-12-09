import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

import { AppView, UserState, FocusConfig, POINTS, InterventionTone, SessionRecord } from './types';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
<<<<<<< HEAD
import WelcomeScreen from './components/WelcomeScreen';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
=======
import { Auth } from './components/Auth';




import { AnimatePresence, motion } from 'framer-motion';
>>>>>>> b9bd1215171e9e1213355d6d8658abba0da60981
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
import FlipPhoneMode from './components/tools/FlipPhoneMode';
import PageTransition from './components/PageTransition';
import OnboardingFlow from './components/OnboardingFlow';
import ExerciseGate from './components/ExerciseGate';
import ScheduleUpload from './components/ScheduleUpload';
import PatternDashboard from './components/PatternDashboard';
import { ArchetypeInterventionSelector } from './components/interventions/ArchetypeInterventionSelector';

import { getLocalUserId, supabase } from './lib/supabase';
import { AutonomyProgress, shouldUnlockIgnoreButton } from './services/autonomySystem';
import { analyzeCircadianContext, getCircadianMessage } from './services/circadianContext';

import { SimulationProvider, useSimulation } from './context/SimulationContext';

// --- GLOBAL AMBIENT BACKGROUND (Endel Style) - Respects Dark Mode ---
const GlobalAmbientBackground = ({ darkMode }: { darkMode: boolean }) => (
  <div className={`fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-brand-dark' : 'bg-slate-50'}`}>
    {darkMode && (
      <>
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
      </>
    )}
  </div>
);

function AppContent() {
  // -- State Management --
  // Start at DASHBOARD if user already completed onboarding, otherwise SPLASH
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const onboardingDone = localStorage.getItem('onboardingCompleted');
    return onboardingDone === 'true' ? AppView.DASHBOARD : AppView.SPLASH;
  });
  const [tutorialCompleted, setTutorialCompleted] = useState<boolean>(false);

  // Initial User State
  const [user, setUser] = useState<UserState>({
    name: 'Estudiante',
    peakTime: 'Mañana',
    helpStyle: 'Visual',
    points: 0,
    completedSessions: 0,
    focusMinutes: 0,
    postponeCount: 0,
    dailyGoal: '',
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

  // --- SIMULATION HOOK ---
  const { isSimulationActive, simulatedData } = useSimulation();

  useEffect(() => {
    if (isSimulationActive) {
      setUser(simulatedData.user);
    } else {
      // RESTORE REAL USER STATE ON EXIT
      const savedUser = localStorage.getItem('alterfocusUser');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Failed to parse saved user", e);
          // Do not reload, just keep default state
        }
      }
    }
  }, [isSimulationActive, simulatedData]);

  // --- AUTONOMY PROGRESS STATE ---
  const [autonomyProgress, setAutonomyProgress] = useState<AutonomyProgress>({
    currentLevel: 'aprendiz',
    successfulInterventions: 0,
    ignoredInterventions: 0,
    physicalChallengesCompleted: 0,
    daysStreak: 0,
    ignoreButtonUnlocked: false,
  });

  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Initialize Welcome/Onboarding from localStorage so returning users go straight to dashboard
  const [showWelcome, setShowWelcome] = useState(() => {
    const onboardingDone = localStorage.getItem('onboardingCompleted');
    return onboardingDone !== 'true';
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [focusConfig, setFocusConfig] = useState<FocusConfig>({
    durationMinutes: 25,
    taskName: 'Sesión de Estudio',
    mode: 'digital'
  });
  const [showReward, setShowReward] = useState<{ show: boolean, points: number }>({ show: false, points: 0 });
  const [aiContext, setAiContext] = useState<{ type: 'kickstart' | 'motivation' | 'analysis' | null, goal: string } | null>(null);
  const [interventionTrigger, setInterventionTrigger] = useState<'manual' | 'auto'>('manual');
  const [blockedSiteContext, setBlockedSiteContext] = useState<string | undefined>(undefined);
  const [consecutiveIgnores, setConsecutiveIgnores] = useState<number>(0);
  const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(null);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number>(0);

  const notificationsEnabledRef = useRef(user.notificationsEnabled);
  const scheduledNotificationsRef = useRef<number[]>([]);

  useEffect(() => {
    notificationsEnabledRef.current = user.notificationsEnabled;
  }, [user.notificationsEnabled]);

  // --- DARK MODE - Single point of control for entire app ---
  useEffect(() => {
    if (user.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0a0a0f';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [user.darkMode]);

  // --- AUTH CHECK ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // EMERGENCY FIX: Force local mode ONLY if Supabase is not configured
        if (!supabase) {
          console.log("Dev Mode: Skipping Supabase Auth check");
          const hasLocalUser = localStorage.getItem('alterfocusUser');
          setIsAuthenticated(!!hasLocalUser || true); // Auto-login in dev
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setIsAuthenticated(!!data.session);
      } catch (e) {
        console.error("Auth Check Failed:", e);
        // Fallback: Assume not authenticated explicitly, or allow bypass in dev
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  // Session Timer
  useEffect(() => {
    if (currentSessionStart) {
      const interval = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - currentSessionStart.getTime();
        setSessionDurationMinutes(Math.floor(diffMs / 60000));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [currentSessionStart]);

  // Initialization - Run once protected by ref
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const todayStr = new Date().toDateString();
    const lastDate = localStorage.getItem('lastActiveDate');

    // Load Persisted Data
    const storedOnboarding = localStorage.getItem('onboardingCompleted');
    const storedTutorial = localStorage.getItem('tutorialCompleted');
    const storedPoints = localStorage.getItem('alterFocusPoints');
    const storedUser = localStorage.getItem('alterfocusUser');

    if (storedTutorial === 'true') setTutorialCompleted(true);

    // Daily Reset
    if (lastDate !== todayStr) {
      localStorage.setItem('lastActiveDate', todayStr);
      localStorage.setItem('alterFocusMinutes', '0');
      localStorage.setItem('completedSessions', '0');
      localStorage.setItem('dailyTikTokAttempts', '0');
    }

    // Restore User if exists and NOT in simulation
    if (storedUser && !isSimulationActive) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(prev => ({ ...prev, ...parsed }));
      } catch { }
    }

    // Special Start Logic (Intervention Redirection)
    const urlParams = new URLSearchParams(window.location.search);
    const isBlocked = urlParams.get('blocked') === 'true';
    const isFromIntervention = urlParams.get('from') === 'intervention';
    // Check both 'source' and 'site' param for compatibility
    const blockedSite = urlParams.get('source') || urlParams.get('site');
    const attemptCount = parseInt(urlParams.get('attempt') || '1', 10);

    console.log("App Init - Params:", { isBlocked, isFromIntervention, blockedSite, attemptCount });

    // Trigger intervention if EITHER blocked=true OR from=intervention
    if ((isBlocked || isFromIntervention) && blockedSite) {
      // IMMEDIATE INTERVENTION - Set attempt count from URL
      console.log("TRIGGERING INTERVENTION VIEW");
      setConsecutiveIgnores(Math.max(0, attemptCount - 1));
      setBlockedSiteContext(blockedSite);
      setInterventionTrigger('auto');
      setShowWelcome(false); // Ensure welcome screen hides
      setCurrentView(AppView.INTERVENTION_CONTEXTUAL);

      // Clean URL WITHOUT triggering a reload, but wait a tick to ensure state is set
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 500);
    } else {
      // Normal Splash Screen Delay
      const timer = setTimeout(() => {
        const storedOnboardingLocal = localStorage.getItem('onboardingCompleted');
        if (storedOnboardingLocal === 'true') {
          setCurrentView(AppView.DASHBOARD);
          setShowWelcome(false);
        } else {
          console.log("Onboarding verification: New user detected. Showing Welcome.");
          setShowWelcome(true);
        }
      }, 100);
      return () => clearTimeout(timer); // Only relevant if component unmounts quickly
    }
  }, []); // Logic runs once on mount

  // Dark Mode Effect
  useEffect(() => {
    if (user.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0F172A';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F8FAFC';
    }
  }, [user.darkMode]);

  // Helpers
  const handleUpdateUser = (updates: Partial<UserState>) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };

      // Only persist to storage if NOT in simulation mode
      if (!isSimulationActive) {
        localStorage.setItem('alterfocusUser', JSON.stringify(updated));
        if (updates.points !== undefined) localStorage.setItem('alterFocusPoints', updated.points.toString());
        if (updates.darkMode !== undefined) localStorage.setItem('darkMode', updated.darkMode.toString());
      }

      return updated;
    });
  };

  const handleUpdateProgress = (updates: Partial<AutonomyProgress>) => {
    setAutonomyProgress(prev => {
      const updated = { ...prev, ...updates };
      if (!isSimulationActive) {
        localStorage.setItem('autonomyProgress', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleStartSession = (config: FocusConfig) => {
    setFocusConfig(config);
    setCurrentSessionStart(new Date());
    setSessionDurationMinutes(0);
    setCurrentView(config.mode === 'offline' ? AppView.OFFLINE_STUDY : AppView.FOCUS_SESSION);
  };

  const handleSessionComplete = () => {
    const pointsEarned = focusConfig.mode === 'community' ? POINTS.SESSION_COMPLETE_COMMUNITY : focusConfig.mode === 'offline' ? POINTS.SESSION_COMPLETE_OFFLINE : POINTS.SESSION_COMPLETE_DIGITAL;
    const newPoints = user.points + pointsEarned;

    handleUpdateUser({
      points: newPoints,
      completedSessions: user.completedSessions + 1,
      focusMinutes: user.focusMinutes + focusConfig.durationMinutes
    });

    setShowReward({ show: true, points: pointsEarned });
    setTimeout(() => setShowReward({ show: false, points: 0 }), 3000);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleTriggerIntervention = (type: 'manual' | 'auto' = 'manual') => {
    setInterventionTrigger(type);
    setCurrentView(AppView.INTERVENTION_CONTEXTUAL);
  };

  const handleConnectIntegration = (id: string) => {
    // Simulated OAuth Flow
    const isConnected = user.connectedIntegrations.includes(id);
    if (isConnected) {
      handleUpdateUser({ connectedIntegrations: user.connectedIntegrations.filter(i => i !== id) });
    } else {
      handleUpdateUser({ connectedIntegrations: [...user.connectedIntegrations, id] });
      // Show fake success notification
      if (Notification.permission === 'granted') {
        new Notification("AlterFocus", { body: `Conectado exitosamente con ${id}` });
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    handleUpdateUser({ notificationsEnabled: permission === 'granted' });
  };

  return (
    <div className="h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden font-sans selection:bg-brand-primary/30">

      {/* PHONE FRAME CONTAINER */}
      <div className={`
        relative w-full h-full 
        sm:max-w-[390px] sm:h-[95vh] sm:max-h-[850px]
        sm:rounded-[3rem] sm:border-[6px] sm:border-[#1a1a1a] sm:shadow-2xl 
        overflow-hidden flex flex-col
        ${user.darkMode ? 'bg-brand-dark text-slate-200' : 'bg-slate-50 text-slate-900'}
      `}>

        <GlobalAmbientBackground darkMode={user.darkMode} />

        {/* Reward Overlay - Changed to absolute to stay within phone frame */}
        <AnimatePresence>
          {showReward.show && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-gradient-to-r from-yellow-400 to-amber-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-white/20 w-max"
            >
              <Trophy size={32} className="text-yellow-200 animate-bounce" />
              <div>
                <p className="text-2xl font-black">+{showReward.points}</p>
                <p className="text-xs font-medium text-yellow-100 uppercase tracking-wider">Puntos Ganados</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main View Router */}
        {authLoading ? (
          <SplashScreen />
        ) : !isAuthenticated ? (
          <LoginPage onAuthSuccess={() => setIsAuthenticated(true)} />
        ) : showWelcome ? (
          <WelcomeScreen onContinue={() => { setShowWelcome(false); setShowOnboarding(true); }} />
        ) : showOnboarding ? (
          <OnboardingFlow onComplete={(data) => {
            localStorage.setItem('onboardingCompleted', 'true');
            handleUpdateUser({
              hasOnboarded: true,
              distractionApps: data.top_distractions,
              dailyGoal: data.weekly_goal
            });
            setShowOnboarding(false);
            setCurrentView(AppView.DASHBOARD);
          }} />
        ) : (
          <div className="relative z-10 w-full h-full flex flex-col overflow-hidden">

            {/* Page Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide relative">
              <AnimatePresence mode="wait">
                {currentView === AppView.SPLASH && <SplashScreen key="splash" />}

                {currentView === AppView.DASHBOARD && (
                  <PageTransition key="dashboard" variant="fade">
                    <Dashboard
                      key={isSimulationActive ? 'sim-dashboard' : 'real-dashboard'}
                      user={user}
                      onNavigate={setCurrentView}
                      onUpdateGoal={(g, t) => handleUpdateUser({ dailyGoal: g, dailyGoalTarget: t })}
                      onTriggerIntervention={handleTriggerIntervention}
                    />
                  </PageTransition>
                )}

                {currentView === AppView.SETTINGS && (
                  <PageTransition key="settings" variant="slide">
                    <Settings
                      user={user}
                      onUpdateUser={handleUpdateUser}
                      onRequestNotifications={requestNotificationPermission}
                      onConnectIntegration={handleConnectIntegration}
                      onNavigate={setCurrentView}
                      onBack={() => setCurrentView(AppView.DASHBOARD)}
                      onLogout={async () => {
                        await supabase.auth.signOut();
                        setIsAuthenticated(false);
                        localStorage.removeItem('alterfocusUser');
                      }}
                    />
                  </PageTransition>
                )}

                {currentView === AppView.COMMUNITY && (
                  <PageTransition key="community" variant="slide">
                    <Community
                      user={user}
                      onBack={() => setCurrentView(AppView.DASHBOARD)}
                      onJoinSession={(type) => handleStartSession({
                        durationMinutes: 25,
                        mode: 'community',
                        taskName: type
                      })}
                    />
                  </PageTransition>
                )}

                {currentView === AppView.AI_GUIDE && (
                  <PageTransition key="aiguide" variant="fade">
                    <AIGuide
                      user={user}
                      onBack={() => setCurrentView(AppView.DASHBOARD)}
                      onStartSession={(config) => handleStartSession(config)}
                      onNavigate={setCurrentView}
                      onUpdateUser={handleUpdateUser}
                    />
                  </PageTransition>
                )}

                {currentView === AppView.INTERVENTION_CONTEXTUAL && (() => {
                  // Calculate REAL circadian context
                  const circadian = analyzeCircadianContext(new Date().getHours(), sessionDurationMinutes);
                  const circadianMessage = getCircadianMessage(circadian.pattern, consecutiveIgnores + 1);

                  return (
                    <InterventionMultimodal
                      key="intervention"
                      user={user}
                      metrics={{
                        stressLevel: circadian.energyLevel === 'low' || circadian.energyLevel === 'very_low' ? 0.7 : 0.4,
                        fatigueLevel: sessionDurationMinutes > 60 ? 0.7 : sessionDurationMinutes > 30 ? 0.5 : 0.3,
                        focusQuality: circadian.energyLevel === 'high' ? 0.8 : circadian.energyLevel === 'medium' ? 0.6 : 0.4,
                        attemptCount: consecutiveIgnores + 1,
                        sessionDurationMinutes: sessionDurationMinutes,
                        lastInterventions: []
                      }}
                      userGoal={user.dailyGoal || "Mantener el enfoque"}
                      ignoreButtonUnlocked={shouldUnlockIgnoreButton(autonomyProgress)}
                      autonomyLevel={autonomyProgress.currentLevel}
                      circadianContext={{
                        pattern: circadian.pattern as 'morning_flow' | 'circadian_slump' | 'late_fatigue' | 'neutral',
                        message: circadianMessage
                      }}
                      onComplete={(success) => {
                        if (success) {
                          handleUpdateProgress({ successfulInterventions: autonomyProgress.successfulInterventions + 1 });
                          handleSessionComplete();
                        }
                        setConsecutiveIgnores(0); // Reset on success
                      }}
                      onSkip={() => {
                        handleUpdateProgress({ ignoredInterventions: autonomyProgress.ignoredInterventions + 1 });
                        setConsecutiveIgnores(prev => prev + 1);
                        setCurrentView(AppView.DASHBOARD);
                      }}
                    />
                  );
                })()}

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
                    onNavigate={setCurrentView}
                  />
                )}

                {currentView === AppView.ANALYTICS && (
                  <PageTransition key="analytics" variant="slide">
                    <Analytics onBack={() => setCurrentView(AppView.DASHBOARD)} darkMode={user.darkMode} user={user} />
                  </PageTransition>
                )}

                {currentView === AppView.FLIP_PHONE_MODE && (
                  <PageTransition key="flipphone" variant="morph">
                    <FlipPhoneMode
                      onClose={() => setCurrentView(AppView.DASHBOARD)}
                      onActivate={(duration) => { console.log(`Flip Phone Mode for ${duration}`); }}
                      onComplete={(earnedPoints) => {
                        handleUpdateUser({ points: user.points + earnedPoints });
                        setShowReward({ show: true, points: earnedPoints });
                        setTimeout(() => setShowReward({ show: false, points: 0 }), 3000);
                      }}
                    />
                  </PageTransition>
                )}

                {currentView === AppView.EXERCISE_GATE && (
                  <ExerciseGate
                    onComplete={(earnedPoints) => {
                      handleUpdateUser({ points: user.points + earnedPoints });
                      setShowReward({ show: true, points: earnedPoints });
                      setTimeout(() => setShowReward({ show: false, points: 0 }), 3000);
                      setCurrentView(AppView.DASHBOARD);
                    }}
                    onCancel={() => setCurrentView(AppView.DASHBOARD)}
                  />
                )}

                {currentView === AppView.SCHEDULE_UPLOAD && (
                  <PageTransition key="schedule" variant="slide">
                    <ScheduleUpload
                      onUploadComplete={() => setCurrentView(AppView.SETTINGS)}
                      onClose={() => setCurrentView(AppView.SETTINGS)}
                    />
                  </PageTransition>
                )}

                {currentView === AppView.BREATHING && (
                  <PageTransition key="breathing" variant="fade">
                    <Breathing onComplete={(res) => setCurrentView(AppView.DASHBOARD)} />
                  </PageTransition>
                )}

                {currentView === AppView.CRISIS && (
                  <PageTransition key="crisis" variant="fade">
                    <CrisisSupport onBack={() => setCurrentView(AppView.DASHBOARD)} />
                  </PageTransition>
                )}

                {currentView === AppView.PATTERN_DASHBOARD && (
                  <PageTransition key="patterns" variant="slide">
                    <PatternDashboard onBack={() => setCurrentView(AppView.DASHBOARD)} />
                  </PageTransition>
                )}

                {currentView === AppView.ARCHETYPE_INTERVENTION && (
                  <ArchetypeInterventionSelector
                    onComplete={(result) => {
                      handleUpdateUser({ points: user.points + result.points });
                      setShowReward({ show: true, points: result.points });
                      setTimeout(() => setShowReward({ show: false, points: 0 }), 3000);
                      setCurrentView(AppView.DASHBOARD);
                    }}
                    onCancel={() => setCurrentView(AppView.DASHBOARD)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Navigation for Core Views */}
            <BottomNavigation currentView={currentView} onNavigate={setCurrentView} />
          </div>
        )}
      </div>
    </div>
  );
}
<<<<<<< HEAD

// Wrapper for Providers
export default function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}
=======
>>>>>>> b9bd1215171e9e1213355d6d8658abba0da60981
