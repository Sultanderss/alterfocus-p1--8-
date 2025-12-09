/**
 * MOMENTO SERVICE - Identity Economy
 * Handles claiming momentos and updating user identity
 */

import { supabase, getLocalUserId } from '../lib/supabase';
import {
    UserIdentity,
    MomentoRecord,
    MomentoSource,
    calculateIdentityLevel,
    isNewStreakDay,
    isStreakBroken,
    IdentityLevel
} from '../types/identity';

// Default identity for new users
const DEFAULT_IDENTITY: Omit<UserIdentity, 'userId' | 'createdAt' | 'updatedAt'> = {
    totalMomentos: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: IdentityLevel.INICIANTE,
    unlockedMilestones: [],
    lastMomentoDate: null,
};

// Get or create user identity
export async function getUserIdentity(userId: string): Promise<UserIdentity> {
    try {
        const { data, error } = await supabase
            .from('user_identity')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            // Create new identity
            const newIdentity: UserIdentity = {
                userId,
                ...DEFAULT_IDENTITY,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await supabase.from('user_identity').insert({
                user_id: userId,
                total_momentos: 0,
                current_streak: 0,
                longest_streak: 0,
                level: IdentityLevel.INICIANTE,
                unlocked_milestones: [],
                last_momento_date: null,
            });

            return newIdentity;
        }

        return {
            userId: data.user_id,
            totalMomentos: data.total_momentos,
            currentStreak: data.current_streak,
            longestStreak: data.longest_streak,
            level: data.level,
            unlockedMilestones: data.unlocked_milestones || [],
            lastMomentoDate: data.last_momento_date,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    } catch (error) {
        console.error('Error getting user identity:', error);
        // Return local fallback
        const stored = localStorage.getItem(`identity_${userId}`);
        if (stored) return JSON.parse(stored);

        return {
            userId,
            ...DEFAULT_IDENTITY,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
}

// Claim a momento
export async function claimMomento(
    source: MomentoSource,
    sessionDuration?: number
): Promise<{
    success: boolean;
    newTotal: number;
    levelUp: boolean;
    newLevel?: IdentityLevel;
    streakUpdated: boolean;
    newStreak: number;
}> {
    const userId = getLocalUserId();
    const identity = await getUserIdentity(userId);

    // Calculate momento value (Rayo gives 1.5x)
    const value = source === 'rayo_intervention' ? 1.5 : 1;
    const newTotal = identity.totalMomentos + value;

    // Calculate new level
    const oldLevel = identity.level;
    const newLevel = calculateIdentityLevel(newTotal);
    const levelUp = newLevel !== oldLevel;

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    let newStreak = identity.currentStreak;
    let streakUpdated = false;

    if (isStreakBroken(identity.lastMomentoDate)) {
        // Streak broken - reset to 1
        newStreak = 1;
        streakUpdated = true;
    } else if (isNewStreakDay(identity.lastMomentoDate)) {
        // New day - increment streak
        newStreak = identity.currentStreak + 1;
        streakUpdated = true;
    }

    const newLongestStreak = Math.max(identity.longestStreak, newStreak);

    try {
        // Update database
        await supabase.from('user_identity').upsert({
            user_id: userId,
            total_momentos: newTotal,
            current_streak: newStreak,
            longest_streak: newLongestStreak,
            level: newLevel,
            last_momento_date: today,
            updated_at: new Date().toISOString(),
        });

        // Record the momento
        await supabase.from('momentos').insert({
            user_id: userId,
            source,
            value,
            session_duration: sessionDuration,
            claimed_at: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error saving momento:', error);
    }

    // Update local storage fallback
    localStorage.setItem(`identity_${userId}`, JSON.stringify({
        ...identity,
        totalMomentos: newTotal,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        level: newLevel,
        lastMomentoDate: today,
        updatedAt: new Date().toISOString(),
    }));

    return {
        success: true,
        newTotal,
        levelUp,
        newLevel: levelUp ? newLevel : undefined,
        streakUpdated,
        newStreak,
    };
}

// Get momento history
export async function getMomentoHistory(userId: string, limit = 30): Promise<MomentoRecord[]> {
    try {
        const { data, error } = await supabase
            .from('momentos')
            .select('*')
            .eq('user_id', userId)
            .order('claimed_at', { ascending: false })
            .limit(limit);

        if (error || !data) return [];

        return data.map(m => ({
            id: m.id,
            userId: m.user_id,
            source: m.source,
            value: m.value,
            claimedAt: m.claimed_at,
            sessionDuration: m.session_duration,
        }));
    } catch (error) {
        console.error('Error getting momento history:', error);
        return [];
    }
}

// Get today's momentos count
export async function getTodayMomentos(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    try {
        const { data, error } = await supabase
            .from('momentos')
            .select('value')
            .eq('user_id', userId)
            .gte('claimed_at', `${today}T00:00:00`);

        if (error || !data) return 0;

        return data.reduce((sum, m) => sum + (m.value || 1), 0);
    } catch (error) {
        return 0;
    }
}
