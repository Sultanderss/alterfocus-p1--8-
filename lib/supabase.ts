import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Modo desarrollo sin Supabase configurado
const isDevelopment = !supabaseUrl || !supabaseKey;

// Cliente Supabase (null si no está configurado)
export const supabase = isDevelopment
    ? null
    : createClient(supabaseUrl, supabaseKey);

// ════════════════════════════════════════════
// TIPOS
// ════════════════════════════════════════════
export interface UserProfile {
    id: string;
    email: string;
    display_name?: string;
    light_minutes: number;
    base_level: number;
    total_sessions: number;
    first_time: boolean;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface ScheduleEvent {
    id: string;
    user_id: string;
    event_title: string;
    description?: string;
    location?: string;
    professor_name?: string;
    start_time: string;
    end_time: string;
    type: 'clase' | 'entrega' | 'examen' | 'estudio' | 'descanso';
    priority: 'rojo' | 'amarillo' | 'verde';
    source: 'outlook' | 'brightspace' | 'manual' | 'google' | 'upload';
    progress_percentage: number;
    started: boolean;
    completed: boolean;
    course_code?: string;
    course_name?: string;
}

export interface Session {
    id: string;
    user_id: string;
    session_type: 'flipphone' | 'deepfocus' | 'breathing' | 'offline' | 'pomodoro' | 'community';
    duration: number;
    light_earned: number;
    context?: string;
    emoji?: string;
    tags?: string[];
    focus_score?: number;
    distractions_blocked?: number;
    start_time: string;
    end_time: string;
}

export interface UserPreferences {
    id: string;
    user_id: string;
    peak_procrastination_hour?: number;
    peak_procrastination_day?: string;
    top_distractions: string[];
    weekly_goal?: string;
    preferred_session_type?: string;
    do_not_disturb_hours: { start: number; end: number };
    outlook_token?: string;
    brightspace_token?: string;
    google_token?: string;
    notification_enabled: boolean;
    dark_mode: boolean;
}

export interface DailyStats {
    id: string;
    user_id: string;
    stat_date: string;
    total_focus_time: number;
    sessions_completed: number;
    light_earned: number;
    distractions_count: number;
    focus_quality: number;
    streak_days: number;
}

// ════════════════════════════════════════════
// LOCAL STORAGE FALLBACK (Development Mode)
// ════════════════════════════════════════════

const LOCAL_STORAGE_KEYS = {
    USER_PROFILE: 'alterfocus_user_profile',
    SCHEDULE: 'alterfocus_schedule',
    SESSIONS: 'alterfocus_sessions',
    PREFERENCES: 'alterfocus_preferences',
    DAILY_STATS: 'alterfocus_daily_stats',
};

function getLocalData<T>(key: string, defaultValue: T): T {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setLocalData<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
}

// ════════════════════════════════════════════
// USER PROFILE FUNCTIONS
// ════════════════════════════════════════════

export async function createUserProfile(userId: string, email: string): Promise<UserProfile> {
    const newProfile: UserProfile = {
        id: userId,
        email,
        display_name: email.split('@')[0],
        light_minutes: 0,
        base_level: 1,
        total_sessions: 0,
        first_time: true,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    if (supabase) {
        const { data, error } = await supabase
            .from('user_profiles')
            .insert([newProfile])
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        setLocalData(LOCAL_STORAGE_KEYS.USER_PROFILE, newProfile);
        return newProfile;
    }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    if (supabase) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) return null;
        return data;
    } else {
        return getLocalData<UserProfile | null>(LOCAL_STORAGE_KEYS.USER_PROFILE, null);
    }
}

export async function updateLightMinutes(userId: string, amount: number): Promise<UserProfile> {
    if (supabase) {
        const profile = await getUserProfile(userId);
        if (!profile) throw new Error('Perfil no encontrado');

        const newTotal = profile.light_minutes + amount;

        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                light_minutes: newTotal,
                total_sessions: profile.total_sessions + 1,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        const profile = getLocalData<UserProfile | null>(LOCAL_STORAGE_KEYS.USER_PROFILE, null);
        if (!profile) throw new Error('Perfil no encontrado');

        profile.light_minutes += amount;
        profile.total_sessions += 1;
        profile.updated_at = new Date().toISOString();

        setLocalData(LOCAL_STORAGE_KEYS.USER_PROFILE, profile);
        return profile;
    }
}

export async function completeOnboarding(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const newPrefs: UserPreferences = {
        id: crypto.randomUUID(),
        user_id: userId,
        peak_procrastination_hour: preferences.peak_procrastination_hour,
        peak_procrastination_day: preferences.peak_procrastination_day,
        top_distractions: preferences.top_distractions || [],
        weekly_goal: preferences.weekly_goal,
        preferred_session_type: preferences.preferred_session_type,
        do_not_disturb_hours: { start: 22, end: 6 },
        notification_enabled: true,
        dark_mode: true,
    };

    if (supabase) {
        const { data: prefsData, error: prefsError } = await supabase
            .from('user_preferences')
            .upsert(newPrefs, { onConflict: 'user_id' })
            .select()
            .single();

        if (prefsError) throw prefsError;

        await supabase
            .from('user_profiles')
            .update({
                onboarding_completed: true,
                first_time: false
            })
            .eq('id', userId);

        return prefsData;
    } else {
        setLocalData(LOCAL_STORAGE_KEYS.PREFERENCES, newPrefs);

        const profile = getLocalData<UserProfile | null>(LOCAL_STORAGE_KEYS.USER_PROFILE, null);
        if (profile) {
            profile.onboarding_completed = true;
            profile.first_time = false;
            setLocalData(LOCAL_STORAGE_KEYS.USER_PROFILE, profile);
        }

        return newPrefs;
    }
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
    if (supabase) {
        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) return null;
        return data;
    } else {
        return getLocalData<UserPreferences | null>(LOCAL_STORAGE_KEYS.PREFERENCES, null);
    }
}

// ════════════════════════════════════════════
// SCHEDULE FUNCTIONS
// ════════════════════════════════════════════

export async function fetchSchedule(userId: string, daysAhead: number = 7): Promise<ScheduleEvent[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    if (supabase) {
        const { data, error } = await supabase
            .from('student_schedule')
            .select('*')
            .eq('user_id', userId)
            .gte('start_time', now.toISOString())
            .lte('start_time', futureDate.toISOString())
            .order('start_time', { ascending: true });

        if (error) throw error;
        return data || [];
    } else {
        const schedule = getLocalData<ScheduleEvent[]>(LOCAL_STORAGE_KEYS.SCHEDULE, []);
        return schedule.filter(e => {
            const eventTime = new Date(e.start_time).getTime();
            return eventTime >= now.getTime() && eventTime <= futureDate.getTime();
        }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    }
}

export async function fetchPendingDeadlines(userId: string): Promise<ScheduleEvent[]> {
    const now = new Date();

    if (supabase) {
        const { data, error } = await supabase
            .from('student_schedule')
            .select('*')
            .eq('user_id', userId)
            .eq('completed', false)
            .in('type', ['entrega', 'examen'])
            .gte('start_time', now.toISOString())
            .order('start_time', { ascending: true });

        if (error) throw error;
        return data || [];
    } else {
        const schedule = getLocalData<ScheduleEvent[]>(LOCAL_STORAGE_KEYS.SCHEDULE, []);
        return schedule
            .filter(e => !e.completed && ['entrega', 'examen'].includes(e.type) && new Date(e.start_time) > now)
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    }
}

export async function addScheduleEvent(
    userId: string,
    event: {
        eventTitle: string;
        description?: string;
        location?: string;
        professorName?: string;
        startTime: Date;
        endTime: Date;
        type: 'clase' | 'entrega' | 'examen' | 'estudio' | 'descanso';
        priority: 'rojo' | 'amarillo' | 'verde';
        source: string;
        courseCode?: string;
        courseName?: string;
    }
): Promise<ScheduleEvent> {
    const newEvent: ScheduleEvent = {
        id: crypto.randomUUID(),
        user_id: userId,
        event_title: event.eventTitle,
        description: event.description,
        location: event.location,
        professor_name: event.professorName,
        start_time: event.startTime.toISOString(),
        end_time: event.endTime.toISOString(),
        type: event.type,
        priority: event.priority,
        source: event.source as ScheduleEvent['source'],
        progress_percentage: 0,
        started: false,
        completed: false,
        course_code: event.courseCode,
        course_name: event.courseName,
    };

    if (supabase) {
        const { data, error } = await supabase
            .from('student_schedule')
            .insert([newEvent])
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        const schedule = getLocalData<ScheduleEvent[]>(LOCAL_STORAGE_KEYS.SCHEDULE, []);
        schedule.push(newEvent);
        setLocalData(LOCAL_STORAGE_KEYS.SCHEDULE, schedule);
        return newEvent;
    }
}

export async function updateScheduleEvent(eventId: string, updates: Partial<ScheduleEvent>): Promise<ScheduleEvent> {
    if (supabase) {
        const { data, error } = await supabase
            .from('student_schedule')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', eventId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        const schedule = getLocalData<ScheduleEvent[]>(LOCAL_STORAGE_KEYS.SCHEDULE, []);
        const index = schedule.findIndex(e => e.id === eventId);
        if (index === -1) throw new Error('Event not found');

        schedule[index] = { ...schedule[index], ...updates };
        setLocalData(LOCAL_STORAGE_KEYS.SCHEDULE, schedule);
        return schedule[index];
    }
}

export async function deleteScheduleEvent(eventId: string): Promise<void> {
    if (supabase) {
        const { error } = await supabase
            .from('student_schedule')
            .delete()
            .eq('id', eventId);

        if (error) throw error;
    } else {
        const schedule = getLocalData<ScheduleEvent[]>(LOCAL_STORAGE_KEYS.SCHEDULE, []);
        const filtered = schedule.filter(e => e.id !== eventId);
        setLocalData(LOCAL_STORAGE_KEYS.SCHEDULE, filtered);
    }
}

// ════════════════════════════════════════════
// SESSION FUNCTIONS
// ════════════════════════════════════════════

export async function saveSession(
    userId: string,
    session: {
        sessionType: 'flipphone' | 'deepfocus' | 'breathing' | 'offline' | 'pomodoro' | 'community';
        duration: number;
        lightEarned: number;
        context?: string;
        emoji?: string;
        tags?: string[];
        focusScore?: number;
        distractionsBlocked?: number;
    }
): Promise<Session> {
    const now = new Date().toISOString();
    const newSession: Session = {
        id: crypto.randomUUID(),
        user_id: userId,
        session_type: session.sessionType,
        duration: session.duration,
        light_earned: session.lightEarned,
        context: session.context || '',
        emoji: session.emoji || '',
        tags: session.tags || [],
        focus_score: session.focusScore,
        distractions_blocked: session.distractionsBlocked,
        start_time: now,
        end_time: now,
    };

    if (supabase) {
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .insert([newSession])
            .select()
            .single();

        if (sessionError) throw sessionError;

        // Actualizar light_minutes en perfil
        await updateLightMinutes(userId, session.lightEarned);

        // Actualizar daily_stats
        await updateDailyStats(userId, session.duration, session.lightEarned);

        return sessionData;
    } else {
        const sessions = getLocalData<Session[]>(LOCAL_STORAGE_KEYS.SESSIONS, []);
        sessions.unshift(newSession);
        setLocalData(LOCAL_STORAGE_KEYS.SESSIONS, sessions);

        await updateLightMinutes(userId, session.lightEarned);
        await updateDailyStats(userId, session.duration, session.lightEarned);

        return newSession;
    }
}

async function updateDailyStats(userId: string, duration: number, lightEarned: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    if (supabase) {
        const { data: statsData } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', userId)
            .eq('stat_date', today)
            .single();

        if (statsData) {
            await supabase
                .from('daily_stats')
                .update({
                    total_focus_time: (statsData.total_focus_time || 0) + duration,
                    sessions_completed: (statsData.sessions_completed || 0) + 1,
                    light_earned: (statsData.light_earned || 0) + lightEarned
                })
                .eq('id', statsData.id);
        } else {
            await supabase
                .from('daily_stats')
                .insert([{
                    user_id: userId,
                    stat_date: today,
                    total_focus_time: duration,
                    sessions_completed: 1,
                    light_earned: lightEarned
                }]);
        }
    } else {
        const stats = getLocalData<DailyStats[]>(LOCAL_STORAGE_KEYS.DAILY_STATS, []);
        const existingIndex = stats.findIndex(s => s.stat_date === today);

        if (existingIndex >= 0) {
            stats[existingIndex].total_focus_time += duration;
            stats[existingIndex].sessions_completed += 1;
            stats[existingIndex].light_earned += lightEarned;
        } else {
            stats.push({
                id: crypto.randomUUID(),
                user_id: userId,
                stat_date: today,
                total_focus_time: duration,
                sessions_completed: 1,
                light_earned: lightEarned,
                distractions_count: 0,
                focus_quality: 0,
                streak_days: 0,
            });
        }

        setLocalData(LOCAL_STORAGE_KEYS.DAILY_STATS, stats);
    }
}

export async function fetchSessionJournal(userId: string, days: number = 30): Promise<Session[]> {
    const pastDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    if (supabase) {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', pastDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } else {
        const sessions = getLocalData<Session[]>(LOCAL_STORAGE_KEYS.SESSIONS, []);
        return sessions.filter(s => new Date(s.start_time) >= pastDate);
    }
}

export async function fetchDailyStats(userId: string, days: number = 30): Promise<DailyStats[]> {
    const pastDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (supabase) {
        const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', userId)
            .gte('stat_date', pastDate)
            .order('stat_date', { ascending: false });

        if (error) throw error;
        return data || [];
    } else {
        const stats = getLocalData<DailyStats[]>(LOCAL_STORAGE_KEYS.DAILY_STATS, []);
        return stats.filter(s => s.stat_date >= pastDate);
    }
}

export async function calculateStreak(userId: string): Promise<number> {
    if (supabase) {
        const { data, error } = await supabase
            .from('daily_stats')
            .select('stat_date')
            .eq('user_id', userId)
            .order('stat_date', { ascending: false })
            .limit(30);

        if (error || !data || data.length === 0) return 0;

        return calculateStreakFromDates(data.map(d => d.stat_date));
    } else {
        const stats = getLocalData<DailyStats[]>(LOCAL_STORAGE_KEYS.DAILY_STATS, []);
        if (stats.length === 0) return 0;

        const sortedDates = stats
            .map(s => s.stat_date)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        return calculateStreakFromDates(sortedDates);
    }
}

function calculateStreakFromDates(sortedDates: string[]): number {
    if (sortedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Check if streak is active (today or yesterday)
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
        return 0;
    }

    let expectedDate = new Date(sortedDates[0]);

    for (const dateStr of sortedDates) {
        const currentDate = new Date(dateStr);
        const diffDays = Math.round((expectedDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));

        if (diffDays === 0) {
            streak++;
            expectedDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
        } else {
            break;
        }
    }

    return streak;
}

// ════════════════════════════════════════════
// UTILITY: Get today's light
// ════════════════════════════════════════════

export async function getTodayLight(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    if (supabase) {
        const { data } = await supabase
            .from('daily_stats')
            .select('light_earned')
            .eq('user_id', userId)
            .eq('stat_date', today)
            .single();

        return data?.light_earned || 0;
    } else {
        const stats = getLocalData<DailyStats[]>(LOCAL_STORAGE_KEYS.DAILY_STATS, []);
        const todayStats = stats.find(s => s.stat_date === today);
        return todayStats?.light_earned || 0;
    }
}

// ════════════════════════════════════════════
// EXPORT: Check if Supabase is configured
// ════════════════════════════════════════════

export function isSupabaseConfigured(): boolean {
    return !!supabase;
}

export function getLocalUserId(): string {
    const existing = localStorage.getItem('alterfocus_local_user_id');
    if (existing) return existing;

    const newId = crypto.randomUUID();
    localStorage.setItem('alterfocus_local_user_id', newId);
    return newId;
}

// ════════════════════════════════════════════
// COMMUNITY TYPES
// ════════════════════════════════════════════

export type PlatformType = 'Teams' | 'Meet' | 'Zoom' | 'Discord';
export type RoomCategory = 'focus' | 'topic';

export interface CommunityRoom {
    id: string;
    host_id: string;
    host_name?: string;
    category: RoomCategory;
    name: string;
    topic?: string;
    max_participants: number;
    participant_count: number;
    platform: PlatformType;
    link: string;
    is_live: boolean;
    duration_minutes?: number;
    created_at: string;
    is_owner?: boolean;
    avatars?: string[];
}

export interface PhysicalSession {
    id: string;
    host_id: string;
    host_name?: string;
    category: RoomCategory;
    name: string;
    topic?: string;
    location_name: string;
    address?: string;
    map_link?: string;
    latitude?: number;
    longitude?: number;
    max_participants: number;
    participant_count: number;
    amenities: ('wifi' | 'coffee' | 'silence')[];
    edit_count: number;
    is_active: boolean;
    scheduled_time?: string;
    is_immediate?: boolean;
    created_at: string;
    is_owner?: boolean;
    distance?: string;
}

const COMMUNITY_STORAGE_KEYS = {
    ROOMS: 'alterfocus_community_rooms',
    PHYSICAL: 'alterfocus_physical_sessions',
    ROOM_PARTICIPANTS: 'alterfocus_room_participants',
    PHYSICAL_PARTICIPANTS: 'alterfocus_physical_participants',
};

// ════════════════════════════════════════════
// COMMUNITY ROOM FUNCTIONS
// ════════════════════════════════════════════

export async function fetchCommunityRooms(userId: string): Promise<CommunityRoom[]> {
    if (supabase) {
        // Use the view that includes participant count
        const { data, error } = await supabase
            .from('community_rooms_with_count')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching community rooms:', error);
            return getDefaultRooms(userId);
        }

        return (data || []).map(room => ({
            ...room,
            is_owner: room.host_id === userId,
            avatars: ['🧑‍💻', '👩‍🎓', '👨‍💼', '👩‍🔬'].slice(0, Math.min(room.participant_count, 4))
        }));
    } else {
        // Local storage fallback
        const rooms = getLocalData<CommunityRoom[]>(COMMUNITY_STORAGE_KEYS.ROOMS, getDefaultRooms(userId));
        return rooms.map(room => ({
            ...room,
            is_owner: room.host_id === userId
        }));
    }
}

export async function createCommunityRoom(
    userId: string,
    room: {
        category: RoomCategory;
        name: string;
        topic?: string;
        platform: PlatformType;
        link: string;
        maxParticipants?: number;
        durationMinutes?: number;
    }
): Promise<CommunityRoom> {
    const newRoom: CommunityRoom = {
        id: crypto.randomUUID(),
        host_id: userId,
        host_name: 'Tú',
        category: room.category,
        name: room.name || (room.category === 'focus' ? 'Sesión de Foco' : 'Sala de Estudio'),
        topic: room.topic,
        max_participants: room.maxParticipants || 10,
        participant_count: 1,
        platform: room.platform,
        link: room.link || 'https://meet.new',
        is_live: true,
        duration_minutes: room.durationMinutes || 25,
        created_at: new Date().toISOString(),
        is_owner: true,
        avatars: ['👤']
    };

    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('community_rooms')
                .insert([{
                    host_id: userId,
                    category: room.category,
                    name: newRoom.name,
                    topic: room.topic,
                    max_participants: newRoom.max_participants,
                    platform: room.platform,
                    link: room.link,
                    duration_minutes: newRoom.duration_minutes
                }])
                .select()
                .single();

            if (error) throw error;

            // Auto-join the creator
            await supabase.from('community_room_participants').insert([{
                room_id: data.id,
                user_id: userId
            }]);

            return { ...data, participant_count: 1, is_owner: true, avatars: ['👤'] };
        } catch (err) {
            console.error("Supabase error, falling back to local:", err);
            // Fallthrough to local logic
        }
    }

    // Local Fallback
    const rooms = getLocalData<CommunityRoom[]>(COMMUNITY_STORAGE_KEYS.ROOMS, []);
    rooms.unshift(newRoom);
    setLocalData(COMMUNITY_STORAGE_KEYS.ROOMS, rooms);
    return newRoom;
}

export async function joinCommunityRoom(userId: string, roomId: string): Promise<void> {
    if (supabase) {
        const { error } = await supabase
            .from('community_room_participants')
            .upsert([{ room_id: roomId, user_id: userId }], { onConflict: 'room_id,user_id' });

        if (error) throw error;
    } else {
        const participants = getLocalData<{ roomId: string; oderId: string }[]>(COMMUNITY_STORAGE_KEYS.ROOM_PARTICIPANTS, []);
        const userIdVal = userId;
        if (!participants.find(p => p.roomId === roomId && p.oderId === userIdVal)) {
            participants.push({ roomId, oderId: userIdVal });
            setLocalData(COMMUNITY_STORAGE_KEYS.ROOM_PARTICIPANTS, participants);
        }

        // Update participant count
        const rooms = getLocalData<CommunityRoom[]>(COMMUNITY_STORAGE_KEYS.ROOMS, []);
        const roomIndex = rooms.findIndex(r => r.id === roomId);
        if (roomIndex >= 0) {
            rooms[roomIndex].participant_count = (rooms[roomIndex].participant_count || 0) + 1;
            setLocalData(COMMUNITY_STORAGE_KEYS.ROOMS, rooms);
        }
    }
}

export async function leaveCommunityRoom(userId: string, roomId: string): Promise<void> {
    if (supabase) {
        const { error } = await supabase
            .from('community_room_participants')
            .update({ left_at: new Date().toISOString() })
            .eq('room_id', roomId)
            .eq('user_id', userId);

        if (error) throw error;
    } else {
        const rooms = getLocalData<CommunityRoom[]>(COMMUNITY_STORAGE_KEYS.ROOMS, []);
        const roomIndex = rooms.findIndex(r => r.id === roomId);
        if (roomIndex >= 0 && rooms[roomIndex].participant_count > 0) {
            rooms[roomIndex].participant_count -= 1;
            setLocalData(COMMUNITY_STORAGE_KEYS.ROOMS, rooms);
        }
    }
}

export async function closeCommunityRoom(userId: string, roomId: string): Promise<void> {
    if (supabase) {
        const { error } = await supabase
            .from('community_rooms')
            .update({ is_live: false })
            .eq('id', roomId)
            .eq('host_id', userId);

        if (error) throw error;
    } else {
        const rooms = getLocalData<CommunityRoom[]>(COMMUNITY_STORAGE_KEYS.ROOMS, []);
        const filtered = rooms.filter(r => r.id !== roomId || r.host_id !== userId);
        setLocalData(COMMUNITY_STORAGE_KEYS.ROOMS, filtered);
    }
}

export async function updateCommunityRoom(
    userId: string,
    roomId: string,
    updates: Partial<{ name: string; topic: string; platform: PlatformType; link: string }>
): Promise<CommunityRoom> {
    if (supabase) {
        const { data, error } = await supabase
            .from('community_rooms')
            .update(updates)
            .eq('id', roomId)
            .eq('host_id', userId)
            .select()
            .single();

        if (error) throw error;
        return { ...data, is_owner: true };
    } else {
        const rooms = getLocalData<CommunityRoom[]>(COMMUNITY_STORAGE_KEYS.ROOMS, []);
        const roomIndex = rooms.findIndex(r => r.id === roomId && r.host_id === userId);
        if (roomIndex < 0) throw new Error('Room not found');

        rooms[roomIndex] = { ...rooms[roomIndex], ...updates };
        setLocalData(COMMUNITY_STORAGE_KEYS.ROOMS, rooms);
        return rooms[roomIndex];
    }
}

// ════════════════════════════════════════════
// PHYSICAL SESSION FUNCTIONS
// ════════════════════════════════════════════

export async function fetchPhysicalSessions(userId: string, userLat?: number, userLon?: number): Promise<PhysicalSession[]> {
    if (supabase) {
        const { data, error } = await supabase
            .from('physical_sessions_with_count')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching physical sessions:', error);
            return getDefaultPhysicalSessions(userId);
        }

        return (data || []).map(session => ({
            ...session,
            is_owner: session.host_id === userId,
            distance: calculateDistance(userLat, userLon, session.latitude, session.longitude)
        }));
    } else {
        const sessions = getLocalData<PhysicalSession[]>(COMMUNITY_STORAGE_KEYS.PHYSICAL, getDefaultPhysicalSessions(userId));
        return sessions.map(session => ({
            ...session,
            is_owner: session.host_id === userId
        }));
    }
}

export async function createPhysicalSession(
    userId: string,
    session: {
        category: RoomCategory;
        name: string;
        topic?: string;
        locationName: string;
        address?: string;
        mapLink?: string;
        latitude?: number;
        longitude?: number;
        amenities?: ('wifi' | 'coffee' | 'silence')[];
        maxParticipants?: number;
        scheduledFor?: string;
        isImmediate?: boolean;
    }
): Promise<PhysicalSession> {
    const newSession: PhysicalSession = {
        id: crypto.randomUUID(),
        host_id: userId,
        host_name: 'Tú',
        category: session.category,
        name: session.name || 'Grupo de Estudio',
        topic: session.topic,
        location_name: session.locationName,
        address: session.address,
        map_link: session.mapLink,
        latitude: session.latitude,
        longitude: session.longitude,
        max_participants: session.maxParticipants || 5,
        participant_count: 1,
        amenities: session.amenities || ['wifi'],
        edit_count: 0,
        is_active: true,
        scheduled_time: session.scheduledFor,
        is_immediate: session.isImmediate !== undefined ? session.isImmediate : true,
        created_at: new Date().toISOString(),
        is_owner: true,
        distance: 'Aquí'
    };

    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('community_physical_sessions')
                .insert([{
                    host_id: userId,
                    category: session.category,
                    name: newSession.name,
                    topic: session.topic,
                    location_name: session.locationName,
                    address: session.address,
                    map_link: session.mapLink,
                    latitude: session.latitude,
                    longitude: session.longitude,
                    amenities: session.amenities || ['wifi'],
                    max_participants: newSession.max_participants,
                    scheduled_time: session.scheduledFor,
                    is_immediate: session.isImmediate
                }])
                .select()
                .single();

            if (error) throw error;

            // Auto-join the creator
            await supabase.from('physical_session_participants').insert([{
                session_id: data.id,
                user_id: userId,
                confirmed: true
            }]);

            return { ...data, participant_count: 1, is_owner: true, distance: 'Aquí' };
        } catch (err) {
            console.error("Supabase error, falling back to local:", err);
            // Fallthrough to local logic
        }
    }

    // Local Fallback
    const sessions = getLocalData<PhysicalSession[]>(COMMUNITY_STORAGE_KEYS.PHYSICAL, []);
    sessions.unshift(newSession);
    setLocalData(COMMUNITY_STORAGE_KEYS.PHYSICAL, sessions);
    return newSession;
}

export async function joinPhysicalSession(userId: string, sessionId: string): Promise<void> {
    if (supabase) {
        const { error } = await supabase
            .from('physical_session_participants')
            .upsert([{ session_id: sessionId, user_id: userId }], { onConflict: 'session_id,user_id' });

        if (error) throw error;
    } else {
        const sessions = getLocalData<PhysicalSession[]>(COMMUNITY_STORAGE_KEYS.PHYSICAL, []);
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex >= 0) {
            sessions[sessionIndex].participant_count = (sessions[sessionIndex].participant_count || 0) + 1;
            setLocalData(COMMUNITY_STORAGE_KEYS.PHYSICAL, sessions);
        }
    }
}

export async function closePhysicalSession(userId: string, sessionId: string): Promise<void> {
    if (supabase) {
        const { error } = await supabase
            .from('community_physical_sessions')
            .update({ is_active: false })
            .eq('id', sessionId)
            .eq('host_id', userId);

        if (error) throw error;
    } else {
        const sessions = getLocalData<PhysicalSession[]>(COMMUNITY_STORAGE_KEYS.PHYSICAL, []);
        const filtered = sessions.filter(s => s.id !== sessionId || s.host_id !== userId);
        setLocalData(COMMUNITY_STORAGE_KEYS.PHYSICAL, filtered);
    }
}

export async function updatePhysicalSession(
    userId: string,
    sessionId: string,
    updates: Partial<{ name: string; topic: string; location_name: string; address: string; map_link: string }>
): Promise<PhysicalSession> {
    if (supabase) {
        // Get current edit count
        const { data: current } = await supabase
            .from('community_physical_sessions')
            .select('edit_count')
            .eq('id', sessionId)
            .single();

        const newEditCount = (current?.edit_count || 0) + 1;

        const { data, error } = await supabase
            .from('community_physical_sessions')
            .update({ ...updates, edit_count: newEditCount })
            .eq('id', sessionId)
            .eq('host_id', userId)
            .select()
            .single();

        if (error) throw error;
        return { ...data, is_owner: true };
    } else {
        const sessions = getLocalData<PhysicalSession[]>(COMMUNITY_STORAGE_KEYS.PHYSICAL, []);
        const sessionIndex = sessions.findIndex(s => s.id === sessionId && s.host_id === userId);
        if (sessionIndex < 0) throw new Error('Session not found');

        sessions[sessionIndex] = {
            ...sessions[sessionIndex],
            ...updates,
            edit_count: sessions[sessionIndex].edit_count + 1
        };
        setLocalData(COMMUNITY_STORAGE_KEYS.PHYSICAL, sessions);
        return sessions[sessionIndex];
    }
}

// ════════════════════════════════════════════
// COMMUNITY UTILITY FUNCTIONS
// ════════════════════════════════════════════

function calculateDistance(lat1?: number, lon1?: number, lat2?: number, lon2?: number): string {
    if (!lat1 || !lon1 || !lat2 || !lon2) return '?';

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    if (d < 1) return `${Math.round(d * 1000)} m`;
    return `${d.toFixed(1)} km`;
}

export async function getTotalOnlineUsers(): Promise<number> {
    if (supabase) {
        const { count } = await supabase
            .from('community_room_participants')
            .select('*', { count: 'exact', head: true })
            .is('left_at', null);

        return count || 0;
    } else {
        const rooms = getLocalData<CommunityRoom[]>(COMMUNITY_STORAGE_KEYS.ROOMS, []);
        return rooms.reduce((sum, room) => sum + (room.participant_count || 0), 0);
    }
}

// ════════════════════════════════════════════
// DEFAULT DATA - Returns empty to show real state
// ════════════════════════════════════════════

// No mock data - Community shows real user activity only
function getDefaultRooms(userId: string): CommunityRoom[] {
    // Return empty array - no fake data
    return [];
}

function getDefaultPhysicalSessions(userId: string): PhysicalSession[] {
    // Return empty array - no fake data
    return [];
}


