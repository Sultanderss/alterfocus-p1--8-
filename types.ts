export enum AppView {
  SPLASH = 'SPLASH',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  INTERVENTION = 'INTERVENTION',
  INTERVENTION_CONTEXTUAL = 'INTERVENTION_CONTEXTUAL',
  ALTERNATIVES = 'ALTERNATIVES', // Restored
  FOCUS_SESSION = 'FOCUS_SESSION',
  STUDY_PANEL = 'STUDY_PANEL',
  OFFLINE_STUDY = 'OFFLINE_STUDY',
  BREATHING = 'BREATHING',
  COMMUNITY = 'COMMUNITY',
  CRISIS = 'CRISIS',
  SETTINGS = 'SETTINGS',
  ANALYTICS = 'ANALYTICS',
  AI_GUIDE = 'AI_GUIDE',
}

export type InterventionTone = 'empathic' | 'direct' | 'motivational';

export interface UserState {
  name: string;
  peakTime: string;
  helpStyle: string;
  points: number;
  completedSessions: number;
  focusMinutes: number;
  postponeCount: number;
  dailyGoal: string;
  dailyGoalTarget: number;
  hasOnboarded: boolean;
  dailyTikTokAttempts: number;
  interventionTone: InterventionTone;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  darkMode: boolean;

  // AI Context Setup Fields
  hasCompletedAISetup: boolean;
  distractionApps: string[];
  procrastinationHours: string[];
  connectedIntegrations: string[];
}

export type FocusMode = 'digital' | 'offline' | 'community' | 'deep-work' | 'quick-review' | 'assignment-flow';

export interface FocusConfig {
  durationMinutes: number;
  taskName: string;
  mode: FocusMode;
  communityRoomName?: string;
  allowedDistractions?: number; // 0-2 based on mode
}

export interface SessionRecord {
  date: string;
  durationMinutes: number;
  completed: boolean;
  mode: string;
}

export interface StatData {
  day: string;
  hours: number;
  sessions: number;
}

export const POINTS = {
  SESSION_COMPLETE_DIGITAL: 50,
  SESSION_COMPLETE_COMMUNITY: 60,
  SESSION_COMPLETE_OFFLINE: 30,
  BREATHING_COMPLETE: 15,
  RETURN_FROM_INTERVENTION: 25,
  SHARE_X: 10,
  REDIRECT_FROM_BLOCK: 15
};

// ====== ADVANCED INTERVENTION SYSTEM ======

export type EmotionalState = 'neutral' | 'mild_distraction' | 'anxiety' | 'confusion' | 'fatigue' | 'overwhelm';

export type InterventionType =
  | 'gentle_question'     // 30-60s - First/second attempt
  | 'breathing_4_7_8'     // 75s - High anxiety
  | 'cognitive_reframing' // 60s - Confusion/mental block
  | 'physical_exercise'   // 120s - Fatigue/low energy
  | 'ai_therapy_brief';   // 180s - Severe overwhelm

export interface EmotionalMetrics {
  clickSpeed: number;        // clicks per second (high = anxiety)
  responseTime: number;      // seconds of inactivity (high = fatigue/confusion)
  attemptCount: number;      // distraction attempts in session
  timeOfDay: string;         // context: morning/afternoon/night
  lastInterventions: InterventionType[]; // history for learning
}

export interface InterventionDecision {
  type: InterventionType;
  emotionalState: EmotionalState;
  duration: number;       // seconds
  message: string;        // personalized message
  options?: string[];     // for gentle_question type
  prompt?: string;        // for cognitive_reframing
  exercises?: string;     // for physical_exercise
  questions?: string[];   // for ai_therapy_brief
}

export interface InterventionRecord {
  timestamp: string;      // ISO date
  type: InterventionType;
  emotionalState: EmotionalState;
  successful: boolean;    // did user complete or skip?
  durationSeconds: number;
}