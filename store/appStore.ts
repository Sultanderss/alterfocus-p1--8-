import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Intervention {
    id: string;
    timestamp: string;
    type: string; // 'reframing', 'breathing', 'timeboxing', etc.
    domain: string; // 'youtube.com'
    pattern: string; // 'compulsive', 'early_attempt', 'crisis'
    userChoice: string;
    successful: boolean;
    helpfulnessScore?: 1 | 2 | 3 | 4 | 5;
    timeWastedAfter?: number;
}

export interface SessionData {
    id: string;
    startTime: Date;
    endTime?: Date;
    objective: string;
    elapsedMinutes: number;
    distractionsThisSession: number;
    progressPercent: number;
    interventions: Intervention[];
    autonomyLevel: number;
    completed: boolean;
}

interface AppState {
    // Session state
    currentSession: SessionData | null;
    sessions: SessionData[];

    // Intervention history
    interventions: Intervention[];

    // Actions
    startSession: (objective: string) => void;
    endSession: () => void;
    addIntervention: (intervention: Omit<Intervention, 'id' | 'timestamp'>) => void;
    updateSessionProgress: (progress: number) => void;
    addFeedback: (interventionId: string, feedback: {
        helpfulnessScore: 1 | 2 | 3 | 4 | 5;
        successful: boolean;
        timeWastedAfter?: number;
    }) => void;
    getSessionData: () => SessionData | null;
    getAnalytics: () => {
        totalSessions: number;
        completedSessions: number;
        avgDistractions: number;
        improvementPercent: number;
        topInterventions: Array<{
            domain: string;
            count: number;
            successRate: number;
            avgTimeWasted: number;
        }>;
        weeklyProgress: number[];
        currentStreak: number;
    };
}

const calculateStreak = (sessions: SessionData[]): number => {
    if (sessions.length === 0) return 0;

    const sorted = [...sessions].sort((a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sorted) {
        const sessionDate = new Date(session.startTime);
        sessionDate.setHours(0, 0, 0, 0);

        const dayDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dayDiff === streak && session.completed) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            currentSession: null,
            sessions: [],
            interventions: [],

            startSession: (objective: string) => {
                const newSession: SessionData = {
                    id: crypto.randomUUID(),
                    startTime: new Date(),
                    objective,
                    elapsedMinutes: 0,
                    distractionsThisSession: 0,
                    progressPercent: 0,
                    interventions: [],
                    autonomyLevel: 50,
                    completed: false,
                };
                set({ currentSession: newSession });
            },

            endSession: () => {
                const { currentSession, sessions } = get();
                if (!currentSession) return;

                const endedSession: SessionData = {
                    ...currentSession,
                    endTime: new Date(),
                    elapsedMinutes: Math.floor((Date.now() - currentSession.startTime.getTime()) / 60000),
                    completed: true,
                };

                set({
                    sessions: [...sessions, endedSession],
                    currentSession: null,
                });
            },

            addIntervention: (interventionData) => {
                const { currentSession, interventions } = get();

                const newIntervention: Intervention = {
                    ...interventionData,
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                };

                // Update current session
                if (currentSession) {
                    const updatedSession = {
                        ...currentSession,
                        interventions: [...currentSession.interventions, newIntervention],
                        distractionsThisSession: currentSession.distractionsThisSession + 1,
                    };
                    set({
                        currentSession: updatedSession,
                        interventions: [...interventions, newIntervention],
                    });
                } else {
                    set({ interventions: [...interventions, newIntervention] });
                }
            },

            updateSessionProgress: (progress: number) => {
                const { currentSession } = get();
                if (!currentSession) return;

                set({
                    currentSession: {
                        ...currentSession,
                        progressPercent: Math.min(100, Math.max(0, progress)),
                    },
                });
            },

            addFeedback: (interventionId, feedback) => {
                const { interventions, currentSession } = get();

                // Update intervention in global list
                const updatedInterventions = interventions.map(int =>
                    int.id === interventionId
                        ? { ...int, ...feedback }
                        : int
                );

                // Update intervention in current session
                if (currentSession) {
                    const updatedSessionInterventions = currentSession.interventions.map(int =>
                        int.id === interventionId
                            ? { ...int, ...feedback }
                            : int
                    );

                    // Update autonomy level based on success
                    const autonomyChange = feedback.successful ? 10 : -5;
                    const newAutonomyLevel = Math.min(100, Math.max(0, currentSession.autonomyLevel + autonomyChange));

                    set({
                        interventions: updatedInterventions,
                        currentSession: {
                            ...currentSession,
                            interventions: updatedSessionInterventions,
                            autonomyLevel: newAutonomyLevel,
                        },
                    });
                } else {
                    set({ interventions: updatedInterventions });
                }
            },

            getSessionData: () => {
                return get().currentSession;
            },

            getAnalytics: () => {
                const { sessions, interventions } = get();

                // Total and completed sessions
                const totalSessions = sessions.length;
                const completedSessions = sessions.filter(s => s.completed).length;

                // Average distractions
                const avgDistractions = totalSessions > 0
                    ? sessions.reduce((sum, s) => sum + s.distractionsThisSession, 0) / totalSessions
                    : 0;

                // Improvement percent (last week vs previous week)
                const now = new Date();
                const lastWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const prevWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

                const lastWeekSessions = sessions.filter(s =>
                    new Date(s.startTime) >= lastWeekStart
                );
                const prevWeekSessions = sessions.filter(s =>
                    new Date(s.startTime) >= prevWeekStart && new Date(s.startTime) < lastWeekStart
                );

                const lastWeekAvg = lastWeekSessions.length > 0
                    ? lastWeekSessions.reduce((sum, s) => sum + s.distractionsThisSession, 0) / lastWeekSessions.length
                    : 0;
                const prevWeekAvg = prevWeekSessions.length > 0
                    ? prevWeekSessions.reduce((sum, s) => sum + s.distractionsThisSession, 0) / prevWeekSessions.length
                    : lastWeekAvg;

                const improvementPercent = prevWeekAvg > 0
                    ? Math.round(((prevWeekAvg - lastWeekAvg) / prevWeekAvg) * 100)
                    : 0;

                // Top interventions by domain
                const domainStats = interventions.reduce((acc, int) => {
                    if (!acc[int.domain]) {
                        acc[int.domain] = { count: 0, successCount: 0, totalTimeWasted: 0 };
                    }
                    acc[int.domain].count++;
                    if (int.successful) acc[int.domain].successCount++;
                    if (int.timeWastedAfter) acc[int.domain].totalTimeWasted += int.timeWastedAfter;
                    return acc;
                }, {} as Record<string, { count: number; successCount: number; totalTimeWasted: number }>);

                const topInterventions = Object.entries(domainStats)
                    .map(([domain, stats]) => ({
                        domain,
                        count: stats.count,
                        successRate: Math.round((stats.successCount / stats.count) * 100),
                        avgTimeWasted: Math.round(stats.totalTimeWasted / stats.count),
                    }))
                    .sort((a, b) => b.count - a.count);

                // Weekly progress (last 7 days)
                const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
                    date.setHours(0, 0, 0, 0);
                    const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

                    return sessions.filter(s => {
                        const sessionDate = new Date(s.startTime);
                        return sessionDate >= date && sessionDate < nextDate && s.completed;
                    }).length;
                });

                // Current streak
                const currentStreak = calculateStreak(sessions);

                return {
                    totalSessions,
                    completedSessions,
                    avgDistractions: Math.round(avgDistractions * 10) / 10,
                    improvementPercent,
                    topInterventions,
                    weeklyProgress,
                    currentStreak,
                };
            },
        }),
        {
            name: 'alterfocus-storage',
        }
    )
);
