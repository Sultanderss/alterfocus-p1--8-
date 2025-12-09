import { UserState, DailyStats, CommunityRoom, PhysicalSession } from '../types';

export const SIMULATION_USER: UserState = {
    name: 'Usuario Demo',
    email: 'demo@alterfocus.com',
    points: 2450, // Nivel 5 (Casi 6)
    level: 5,
    streak: 42,
    focusTime: 18000, // 300 horas
    sessionsCompleted: 154,
    autonomousMode: true,
    stats: {
        focusQuality: 92,
        distractionsBlocked: 1450,
        weeklyProgress: [45, 60, 85, 70, 90, 100, 20] // Gráfica bonita
    }
};

export const SIMULATION_STATS: DailyStats[] = Array.from({ length: 30 }).map((_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    focusMinutes: Math.floor(Math.random() * 120) + 60, // 1-3 horas diarias
    sessions: Math.floor(Math.random() * 3) + 2,
    quality: Math.floor(Math.random() * 20) + 80
}));

export const SIMULATION_VIRTUAL_ROOMS = [
    {
        id: 'sim-1',
        name: 'Deep Work - Programación',
        category: 'focus',
        platform: 'Meet',
        participants: 12,
        maxParticipants: 50,
        host: 'Ana M.',
        avatars: ['👩‍💻', '👨‍💻', '👩‍🎓', '👨‍🔬']
    },
    {
        id: 'sim-2',
        name: 'Lectura Silenciosa',
        category: 'focus',
        platform: 'Discord',
        participants: 28,
        maxParticipants: 100,
        host: 'Carlos R.',
        avatars: ['📚', '🧐', '🤓', '☕']
    }
];

export const SIMULATION_PHYSICAL_SESSIONS = [
    {
        id: 'sim-phys-1',
        name: 'Grupo de Estudio Cálculo',
        location_name: 'Biblioteca Karl C. Parrish',
        address: 'Universidad del Norte, Km 5',
        participants: 3,
        maxParticipants: 5,
        host: 'Juan D.',
        distance: 'a 500m',
        isEmergency: true, // "Inmediata"
        amenities: ['wifi', 'silence']
    },
    {
        id: 'sim-phys-2',
        name: 'Co-working Tesis',
        location_name: 'WeWork Barranquilla',
        address: 'Calle 77B # 57-103',
        participants: 1,
        maxParticipants: 4,
        host: 'Luisa F.',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
        distance: 'a 2.5km',
        amenities: ['wifi', 'coffee']
    }
];
