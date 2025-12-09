import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Users, Plus, X, Sparkles, MapPin, Video, ExternalLink, Monitor, Zap,
    MicOff, Coffee, Library, Link as LinkIcon, Search, Loader2, LocateFixed, Navigation,
    Edit3, Trash2, AlertCircle, Save, Clock, ChevronRight, Wifi, VolumeX, Crown, Star,
    Globe, Play, Headphones, Eye, Radio, Target, RefreshCw
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import {
    getLocalUserId,
    fetchCommunityRooms,
    fetchPhysicalSessions,
    createCommunityRoom,
    createPhysicalSession,
    updateCommunityRoom,
    updatePhysicalSession,
    closeCommunityRoom,
    closePhysicalSession,
    joinCommunityRoom,
    joinPhysicalSession,
    getTotalOnlineUsers,
    CommunityRoom,
    PhysicalSession as PhysicalSessionType,
    PlatformType,
    RoomCategory
} from '../lib/supabase';
import { useSimulation } from '../context/SimulationContext';
import { UserState } from '../types';
import { LocationPicker } from './LocationPicker';

interface CommunityProps {
    user: UserState;
    onBack: () => void;
    onJoinSession: (roomName: string) => void;
}

type SessionType = 'virtual' | 'physical';

interface LocationPlace {
    name: string;
    address: string;
    icon: string;
}

// Dynamic Location Suggestions - Opens Google Maps with location-based searches
const LocationSuggestions: React.FC<{
    onSelect: (place: LocationPlace) => void;
    selectedName: string;
}> = ({ onSelect, selectedName }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ city: string; coords: { lat: number; lng: number } } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Location categories with Google Maps search queries
    const locationCategories = [
        { name: 'Biblioteca', icon: '📚', searchQuery: 'biblioteca+estudio', color: 'from-blue-500 to-indigo-600' },
        { name: 'Café tranquilo', icon: '☕', searchQuery: 'cafe+tranquilo+wifi', color: 'from-amber-500 to-orange-600' },
        { name: 'Coworking', icon: '💼', searchQuery: 'coworking+espacio+trabajo', color: 'from-emerald-500 to-teal-600' },
        { name: 'Universidad', icon: '🏫', searchQuery: 'universidad+sala+estudio', color: 'from-purple-500 to-fuchsia-600' },
    ];

    useEffect(() => {
        const getLocation = async () => {
            setIsLoading(true);
            setError(null);

            // Try cached location first
            const cached = sessionStorage.getItem('alterfocus_user_location');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.timestamp < 300000) { // 5 min cache
                        setUserLocation(parsed.location);
                        setIsLoading(false);
                        return;
                    }
                } catch { }
            }

            // Get GPS position
            if (!navigator.geolocation) {
                setError('GPS no disponible');
                setIsLoading(false);
                return;
            }

            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    });
                });

                const { latitude, longitude } = position.coords;

                // Reverse geocoding using free Nominatim API
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
                        { headers: { 'Accept-Language': 'es' } }
                    );
                    const data = await response.json();

                    const city = data.address?.city || data.address?.town || data.address?.municipality || data.address?.state || 'Tu ubicación';
                    const neighborhood = data.address?.suburb || data.address?.neighbourhood || '';

                    const locationData = {
                        city: neighborhood ? `${neighborhood}, ${city}` : city,
                        coords: { lat: latitude, lng: longitude }
                    };

                    setUserLocation(locationData);
                    sessionStorage.setItem('alterfocus_user_location', JSON.stringify({
                        location: locationData,
                        timestamp: Date.now()
                    }));
                } catch (e) {
                    // Fallback: just use coords
                    setUserLocation({
                        city: `${latitude.toFixed(2)}°N, ${Math.abs(longitude).toFixed(2)}°W`,
                        coords: { lat: latitude, lng: longitude }
                    });
                }
            } catch (e: any) {
                if (e.code === 1) {
                    setError('Permiso de ubicación denegado');
                } else {
                    setError('No se pudo obtener ubicación');
                }
            } finally {
                setIsLoading(false);
            }
        };

        getLocation();
    }, []);

    const openGoogleMaps = (searchQuery: string) => {
        if (userLocation?.coords) {
            const { lat, lng } = userLocation.coords;
            const url = `https://www.google.com/maps/search/${searchQuery}/@${lat},${lng},15z`;
            window.open(url, '_blank');
        } else {
            // Fallback without coords
            window.open(`https://www.google.com/maps/search/${searchQuery}`, '_blank');
        }
    };

    const handleSelect = (category: typeof locationCategories[0]) => {
        onSelect({
            name: category.name,
            address: userLocation?.city || '',
            icon: category.icon
        });
        openGoogleMaps(category.searchQuery);
    };

    if (isLoading) {
        return (
            <div className="mt-3 space-y-2">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-2">
                    <Loader2 size={10} className="animate-spin" />
                    Detectando tu ubicación...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-3 space-y-2">
                <p className="text-[10px] text-rose-400 flex items-center gap-1">
                    <MapPin size={10} /> {error}
                </p>
                <div className="flex flex-wrap gap-2">
                    {locationCategories.map((cat) => (
                        <button
                            key={cat.name}
                            onClick={() => openGoogleMaps(cat.searchQuery)}
                            className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-3 space-y-2">
            <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1">
                <MapPin size={10} />
                📍 {userLocation?.city}
            </p>
            <p className="text-[9px] text-slate-500 mb-2">Toca para buscar cerca de ti en Google Maps</p>
            <div className="flex flex-wrap gap-2">
                {locationCategories.map((cat) => (
                    <motion.button
                        key={cat.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(cat)}
                        className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all ${selectedName === cat.name
                            ? 'bg-amber-500/30 border-amber-500 text-amber-300'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                        <ExternalLink size={10} className="opacity-50" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

const Community: React.FC<CommunityProps> = ({ user, onBack, onJoinSession }) => {
    const { isSimulationActive, simulatedData } = useSimulation();

    // Theme Variables
    const textColor = user.darkMode ? 'text-white' : 'text-slate-900';
    const subTextColor = user.darkMode ? 'text-slate-400' : 'text-slate-500';
    const bgColor = user.darkMode ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900' : 'bg-slate-50';
    const cardBg = user.darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm';
    const buttonBg = user.darkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700';

    const [activeTab, setActiveTab] = useState<SessionType>('virtual');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
    const [createStep, setCreateStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalOnline, setTotalOnline] = useState(0);

    // Get user ID (uses global auth or local fallback)
    const userId = getLocalUserId();

    // Data States - now uses types from supabase
    const [virtualRooms, setVirtualRooms] = useState<CommunityRoom[]>([]);
    const [physicalSessions, setPhysicalSessions] = useState<PhysicalSessionType[]>([]);

    // Form States
    const [formType, setFormType] = useState<SessionType>('virtual');
    const [formCategory, setFormCategory] = useState<RoomCategory>('focus');
    const [newName, setNewName] = useState('');
    const [newTopic, setNewTopic] = useState('');
    const [newPlatform, setNewPlatform] = useState<PlatformType>('Meet');
    const [newLink, setNewLink] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [foundLocation, setFoundLocation] = useState<{ name: string, address: string, uri: string } | null>(null);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [isGettingGPS, setIsGettingGPS] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isJoiningExpress, setIsJoiningExpress] = useState(false);

    // Session Scheduling States
    const [isScheduledSession, setIsScheduledSession] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [showMapPicker, setShowMapPicker] = useState(false);

    // ═══════════════════════════════════════════
    // LOAD DATA FROM API
    // ═══════════════════════════════════════════
    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [rooms, sessions, onlineCount] = await Promise.all([
                fetchCommunityRooms(userId),
                fetchPhysicalSessions(userId),
                getTotalOnlineUsers()
            ]);
            setVirtualRooms(rooms);
            setPhysicalSessions(sessions);
            setTotalOnline(onlineCount);
        } catch (err) {
            console.error('Error loading community data:', err);
            setError('Error cargando datos. Usando datos locales.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Clear any old fake/mock data from localStorage on first load
        const clearedKey = 'alterfocus_community_cleaned_v2';
        if (!localStorage.getItem(clearedKey)) {
            localStorage.removeItem('alterfocus_community_rooms');
            localStorage.removeItem('alterfocus_physical_sessions');
            localStorage.setItem(clearedKey, 'true');
        }

        loadData();
        // Refresh every 30 seconds for real-time feel
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    // ═══════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════
    const handleJoinVirtual = async (room: CommunityRoom) => {
        try {
            await joinCommunityRoom(userId, room.id);
            window.open(room.link, '_blank');
            onJoinSession(room.name);
        } catch (err) {
            console.error('Error joining room:', err);
            // Still open the link even if join fails
            window.open(room.link, '_blank');
            onJoinSession(room.name);
        }
    };

    const handleJoinPhysical = async (session: PhysicalSessionType) => {
        try {
            await joinPhysicalSession(userId, session.id);
            if (session.map_link) window.open(session.map_link, '_blank');
            onJoinSession(`${session.name} (@${session.location_name})`);
        } catch (err) {
            console.error('Error joining session:', err);
            if (session.map_link) window.open(session.map_link, '_blank');
            onJoinSession(`${session.name} (@${session.location_name})`);
        }
    };

    const handleCloseRoom = async (id: string, type: SessionType) => {
        if (!confirm("¿Estás seguro de cerrar esta sala? Los participantes serán notificados.")) return;

        try {
            if (type === 'virtual') {
                await closeCommunityRoom(userId, id);
                setVirtualRooms(prev => prev.filter(r => r.id !== id));
            } else {
                await closePhysicalSession(userId, id);
                setPhysicalSessions(prev => prev.filter(r => r.id !== id));
            }
        } catch (err) {
            console.error('Error closing room:', err);
            alert('Error al cerrar la sala. Intenta de nuevo.');
        }
        setShowEditModal(false);
        setEditingRoomId(null);
    };

    const openEditModal = (room: CommunityRoom | PhysicalSessionType, type: SessionType) => {
        setEditingRoomId(room.id);
        setFormType(type);
        setFormCategory(room.category);
        setNewName(room.name);
        setNewTopic(room.topic || '');
        if (type === 'virtual') {
            const vRoom = room as CommunityRoom;
            setNewPlatform(vRoom.platform);
            setNewLink(vRoom.link);
        } else {
            const pSession = room as PhysicalSessionType;
            setLocationQuery(pSession.location_name);
            setFoundLocation({
                name: pSession.location_name,
                address: pSession.address || '',
                uri: pSession.map_link || ''
            });
        }
        setShowEditModal(true);
    };

    const handleSaveChanges = async () => {
        if (!editingRoomId) return;
        setIsSaving(true);

        try {
            if (formType === 'virtual') {
                const updated = await updateCommunityRoom(userId, editingRoomId, {
                    name: newName,
                    topic: formCategory === 'topic' ? newTopic : undefined,
                    platform: newPlatform,
                    link: newLink
                });
                setVirtualRooms(prev => prev.map(r => r.id === editingRoomId ? { ...r, ...updated } : r));
            } else {
                const updated = await updatePhysicalSession(userId, editingRoomId, {
                    name: newName,
                    topic: formCategory === 'topic' ? newTopic : undefined,
                    location_name: foundLocation?.name || locationQuery,
                    address: foundLocation?.address,
                    map_link: foundLocation?.uri
                });
                setPhysicalSessions(prev => prev.map(r => r.id === editingRoomId ? { ...r, ...updated } : r));
            }
            resetForm();
            setShowEditModal(false);
        } catch (err) {
            console.error('Error saving changes:', err);
            alert('Error al guardar cambios. Intenta de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreate = async () => {
        setIsSaving(true);

        try {
            if (formType === 'virtual') {
                const newRoom = await createCommunityRoom(userId, {
                    category: formCategory,
                    name: newName || (formCategory === 'focus' ? "Sesión de Foco" : "Sala de Estudio"),
                    topic: formCategory === 'topic' ? newTopic : undefined,
                    platform: newPlatform,
                    link: newLink || 'https://meet.new'
                });
                setVirtualRooms(prev => [newRoom, ...prev]);
                setActiveTab('virtual');
            } else {
                // Validation for scheduled sessions
                if (isScheduledSession) {
                    if (!scheduledDate || !scheduledTime) {
                        alert("Por favor selecciona fecha y hora para la sesión programada.");
                        setIsSaving(false);
                        return;
                    }
                    const sessionTime = new Date(`${scheduledDate}T${scheduledTime}`);
                    const now = new Date();
                    const diffHours = (sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60);

                    if (diffHours < 2) {
                        alert("La sesión debe programarse con al menos 2 horas de anticipación.");
                        setIsSaving(false);
                        return;
                    }
                }

                const newSession = await createPhysicalSession(userId, {
                    category: formCategory,
                    name: newName || "Grupo de Estudio",
                    topic: formCategory === 'topic' ? newTopic : undefined,
                    locationName: foundLocation?.name || locationQuery || "Ubicación definida",
                    address: foundLocation?.address,
                    mapLink: foundLocation?.uri,
                    amenities: ['wifi'],
                    scheduledFor: isScheduledSession ? `${scheduledDate}T${scheduledTime}:00` : undefined,
                    isImmediate: !isScheduledSession
                });
                setPhysicalSessions(prev => [newSession, ...prev]);
                setActiveTab('physical');
            }
            resetForm();
            setShowCreateModal(false);
        } catch (err) {
            console.error('Error creating room:', err);
            alert('Error al crear la sala. Intenta de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setNewName(''); setNewTopic(''); setNewLink(''); setLocationQuery('');
        setFoundLocation(null); setEditingRoomId(null); setCreateStep(0);
        setIsScheduledSession(false); setScheduledDate(''); setScheduledTime('');
    };

    // GPS Logic - Get real location name via reverse geocoding
    const handleUseGPS = () => {
        if (!navigator.geolocation) { alert("Geolocalización no soportada."); return; }
        setIsGettingGPS(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const coordString = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

            // 1. Set immediate precise coordinates as fallback
            setFoundLocation({
                name: "Ubicación por GPS",
                address: `Coordenadas: ${coordString}`,
                uri: mapsLink
            });
            // Clear query to encourage user to name it
            setLocationQuery("");

            try {
                // Use Gemini to get real place name from coordinates
                const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Given these coordinates: latitude ${latitude}, longitude ${longitude}, return the most likely address or place name. If it's a specific venue (like 'Starbucks' or 'Central Library'), include it. If unknown, just return the street address. Be concise. Return ONLY the name/address.`
                });

                const placeName = response.text?.trim();

                if (placeName) {
                    setFoundLocation({
                        name: placeName,
                        address: "Ubicación detectada (Puedes editar el nombre arriba)",
                        uri: mapsLink
                    });
                    setLocationQuery(placeName); // Auto-fill but allow edit
                }
            } catch (e) {
                console.error('Error getting location name:', e);
                // Keep the coordinate fallback
            } finally {
                setIsGettingGPS(false);
                // Save coords for suggestions
                sessionStorage.setItem('alterfocus_user_coords', JSON.stringify({ latitude, longitude }));
            }
        }, (error) => {
            console.error('GPS error:', error);
            alert("No se pudo obtener la ubicación exacta. Por favor escribe la dirección manualmente.");
            setIsGettingGPS(false);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    };

    const handleLocationSelect = (loc: { lat: number; lng: number; address: string; name: string }) => {
        const mapsLink = `https://www.google.com/maps?q=${loc.lat},${loc.lng}`;
        setFoundLocation({
            name: loc.name || "Ubicación seleccionada",
            address: loc.address,
            uri: mapsLink
        });
        setLocationQuery(loc.name || loc.address.split(',')[0]);
        sessionStorage.setItem('alterfocus_user_coords', JSON.stringify({ latitude: loc.lat, longitude: loc.lng }));
    };

    const searchLocationWithAI = async () => {
        if (!locationQuery.trim()) return;
        setIsSearchingLocation(true);
        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Find this place: "${locationQuery}". Return the name and address.`
            });
            setFoundLocation({
                name: locationQuery,
                address: "Ubicación encontrada",
                uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`
            });
        } catch {
            setFoundLocation({ name: locationQuery, address: "", uri: "" });
        }
        finally { setIsSearchingLocation(false); }
    };

    // Render Helpers
    const PlatformBadge = ({ platform }: { platform: PlatformType }) => {
        const config: Record<PlatformType, { bg: string; text: string }> = {
            Teams: { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
            Meet: { bg: 'bg-green-500/20', text: 'text-green-400' },
            Zoom: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
            Discord: { bg: 'bg-violet-500/20', text: 'text-violet-400' }
        };
        return (
            <span className={`${config[platform].bg} ${config[platform].text} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                {platform}
            </span>
        );
    };

    const AmenityIcon = ({ type }: { type: 'wifi' | 'coffee' | 'silence' }) => {
        const icons = { wifi: Wifi, coffee: Coffee, silence: VolumeX };
        const Icon = icons[type];
        return <Icon size={12} className="text-slate-400" />;
    };

    return (
        <motion.div
            className={`absolute inset-0 z-30 flex flex-col overflow-hidden ${bgColor}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Header */}
            <div className="relative px-5 pt-6 pb-2 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-700 dark:text-white" />
                        </motion.button>
                        <div>
                            <h1 className="font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
                                Comunidad
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {isLoading ? '...' : `${isSimulationActive ? 428 : (totalOnline || virtualRooms.reduce((sum, r) => sum + r.participant_count, 0))} online`}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={loadData}
                            disabled={isLoading}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                        >
                            <RefreshCw size={20} className={`text-slate-700 dark:text-white ${isLoading ? 'animate-spin' : ''}`} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { resetForm(); setShowCreateModal(true); }}
                            className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all border border-white/10"
                        >
                            <Plus size={20} />
                        </motion.button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 mb-2">
                    <button
                        onClick={() => setActiveTab('virtual')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'virtual'
                            ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Globe size={16} /> Virtuales
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10">
                            {isSimulationActive ? simulatedData.virtualRooms.length : virtualRooms.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('physical')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'physical'
                            ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <MapPin size={16} /> Presenciales
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10">
                            {isSimulationActive ? simulatedData.physicalSessions.length : physicalSessions.length}
                        </span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-24">
                <AnimatePresence mode="wait">
                    {activeTab === 'virtual' && (
                        <motion.div
                            key="virtual"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4 py-4"
                        >
                            {/* Featured / Quick Join Card - Body Doubling Express */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="relative overflow-hidden bg-[#1e1e24] border border-white/5 rounded-3xl p-5 shadow-xl cursor-pointer group"
                            >
                                {/* Static background - Subtle */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />

                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-bold text-white leading-tight">Body Doubling Express</h2>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">En Vivo Ahora</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Sala silenciosa instantánea. Entra, enfócate 25 min y sal. Sin cámaras ni micrófonos.
                                    </p>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> 25m</span>
                                            <span className="flex items-center gap-1.5"><MicOff size={14} /> Mute</span>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={isJoiningExpress}
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                setIsJoiningExpress(true);
                                                try {
                                                    const room = await createCommunityRoom(userId, {
                                                        category: 'focus',
                                                        name: 'Sesión Express ' + new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
                                                        topic: 'Body Doubling silencioso',
                                                        platform: 'Meet',
                                                        link: 'https://meet.google.com/new',
                                                        maxParticipants: 10,
                                                        durationMinutes: 25
                                                    });
                                                    await loadData();
                                                    window.open(room.link, '_blank');
                                                    onJoinSession('Body Doubling Express');
                                                } catch (err) {
                                                    console.error('Error creating express room:', err);
                                                    alert('Error creando sala. Intenta de nuevo.');
                                                } finally {
                                                    setIsJoiningExpress(false);
                                                }
                                            }}
                                            className="bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 hover:bg-indigo-400 transition-colors flex items-center gap-2"
                                        >
                                            <Play size={14} fill="currentColor" />
                                            {isJoiningExpress ? 'Creando...' : 'Iniciar'}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Room List */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider px-1 text-slate-500 dark:text-white/40">
                                    Salas Activas
                                </h3>

                                {/* Empty State */}
                                {(isSimulationActive ? simulatedData.virtualRooms : virtualRooms).length === 0 && !isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-12 px-6"
                                    >
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center border bg-slate-100 border-slate-200 dark:bg-gradient-to-br dark:from-purple-500/20 dark:to-blue-500/20 dark:border-purple-500/30 transition-colors">
                                            <Users size={36} className="text-purple-500" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">No hay salas activas</h3>
                                        <p className="text-sm mb-6 text-slate-500 dark:text-white/40">
                                            Sé el primero en crear una sala de estudio y conectar con otros estudiantes
                                        </p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setFormType('virtual'); setShowCreateModal(true); }}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30"
                                        >
                                            <Plus size={18} />
                                            Crear Primera Sala
                                        </motion.button>
                                    </motion.div>
                                )}

                                {((isSimulationActive ? simulatedData.virtualRooms : virtualRooms) as any[]).map((room, index) => (
                                    <motion.div
                                        key={room.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`relative overflow-hidden backdrop-blur-sm p-4 rounded-2xl border transition-all hover:shadow-md group bg-white border-slate-200 dark:bg-white/5 dark:border-white/10 ${room.is_owner ? 'ring-1 ring-purple-500/20 !border-purple-500/50' : ''}`}
                                    >
                                        {room.is_live && (
                                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 animate-pulse" />
                                        )}

                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-3">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${room.category === 'focus'
                                                    ? 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-400'
                                                    : 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 text-amber-400'
                                                    }`}>
                                                    {room.category === 'focus' ? <Target size={22} /> : <Sparkles size={22} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{room.name}</h4>
                                                        {room.is_owner && (
                                                            <span className="text-[10px] bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-0.5 rounded-full font-bold">
                                                                TÚ
                                                            </span>
                                                        )}
                                                    </div>
                                                    {room.topic ? (
                                                        <p className="text-xs mt-0.5 text-slate-500 dark:text-white/40">Tema: {room.topic}</p>
                                                    ) : (
                                                        <p className="text-xs mt-0.5 flex items-center gap-1 text-slate-500 dark:text-white/40">
                                                            <MicOff size={10} /> Solo acompañamiento silencioso
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <PlatformBadge platform={room.platform} />
                                                {room.duration_minutes && (
                                                    <p className="text-[10px] mt-1 flex items-center justify-end gap-1 text-slate-500 dark:text-white/40">
                                                        <Clock size={10} /> {room.duration_minutes}m
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {room.is_owner && (
                                            <div className="flex justify-end gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-white/10 transition-colors">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => openEditModal(room, 'virtual')}
                                                    className="p-2 rounded-lg transition-all bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20"
                                                >
                                                    <Edit3 size={14} className="text-slate-600 dark:text-white" />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleCloseRoom(room.id, 'virtual')}
                                                    className="p-2 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500/20 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </motion.button>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-1.5">
                                                    {(room.avatars || ['🧑‍💻', '👩‍🎓', '👨‍💼']).slice(0, 4).map((avatar, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs border bg-slate-100 border-white dark:bg-white/10 dark:border-slate-800 transition-colors"
                                                        >
                                                            {avatar}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-white/40">
                                                    {room.participant_count}/{room.max_participants} personas
                                                </span>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleJoinVirtual(room)}
                                                className="text-xs font-bold text-white bg-violet-600 px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/20 flex items-center gap-1"
                                            >
                                                <Play size={12} fill="currentColor" /> Unirse
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'physical' && (
                        <motion.div
                            key="physical"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4 py-4"
                        >
                            {/* Info Banner */}
                            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 rounded-2xl border border-amber-500/30 flex items-start gap-3">
                                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MapPin size={20} className="text-amber-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-amber-400 text-sm mb-0.5">Encuentros Presenciales</p>
                                    <p className="text-amber-300/70 text-xs">
                                        Estas sesiones son físicas. Llega al lugar para unirte con otros estudiantes.
                                    </p>
                                </div>
                            </div>

                            {/* Physical Sessions List */}
                            <div className="space-y-3">
                                {/* Empty State */}
                                {physicalSessions.length === 0 && !isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-12 px-6"
                                    >
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                                            <MapPin size={36} className="text-amber-400" />
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-2">No hay sesiones presenciales</h3>
                                        <p className="text-slate-400 text-sm mb-6">
                                            Invita a estudiar en persona en tu biblioteca, café o coworking favorito
                                        </p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setFormType('physical'); setShowCreateModal(true); }}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30"
                                        >
                                            <Plus size={18} />
                                            Crear Sesión Presencial
                                        </motion.button>
                                    </motion.div>
                                )}

                                {physicalSessions.map((session, index) => (
                                    <motion.div
                                        key={session.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`bg-white/5 backdrop-blur-sm p-4 rounded-2xl border transition-all hover:bg-white/10 ${session.is_owner ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-white/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${session.location_name.toLowerCase().includes('biblioteca')
                                                    ? 'bg-gradient-to-br from-blue-500/30 to-indigo-500/30 text-blue-400'
                                                    : 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 text-amber-400'
                                                    }`}>
                                                    {session.location_name.toLowerCase().includes('biblioteca') ? <Library size={22} /> : <Coffee size={22} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-white text-sm">{session.name}</h4>
                                                        {session.is_owner && (
                                                            <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                                                                TÚ
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                                        <MapPin size={10} /> {session.location_name}
                                                    </div>

                                                    {/* Schedule Info */}
                                                    {session.scheduled_time ? (
                                                        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold mt-1.5 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 inline-flex">
                                                            <Clock size={10} />
                                                            <span>
                                                                {new Date(session.scheduled_time).toLocaleDateString([], { day: 'numeric', month: 'short' })} • {new Date(session.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-xs text-green-300 font-bold mt-1.5 bg-green-500/10 px-2 py-0.5 rounded-lg border border-green-500/20 inline-flex">
                                                            <Zap size={10} />
                                                            <span>Inmediata</span>
                                                        </div>
                                                    )}
                                                    {session.topic && (
                                                        <p className="text-xs text-slate-500 mt-1 italic">Tema: {session.topic}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-slate-300 flex items-center gap-1 justify-end">
                                                    <Navigation size={10} /> {session.distance || '?'}
                                                </span>
                                                <span className={`text-[10px] font-bold ${session.participant_count >= session.max_participants ? 'text-red-400' : 'text-green-400'}`}>
                                                    {session.max_participants - session.participant_count} cupos
                                                </span>
                                            </div>
                                        </div>

                                        {/* Amenities */}
                                        <div className="flex gap-2 mt-3">
                                            {session.amenities.map((amenity) => (
                                                <div key={amenity} className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg">
                                                    <AmenityIcon type={amenity} />
                                                    <span className="text-[10px] text-slate-400 capitalize">{amenity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {session.is_owner && (
                                            <div className="flex items-center justify-between mt-3 bg-white/5 p-2 rounded-xl border border-white/10">
                                                <span className="text-[10px] text-slate-400 font-medium ml-2 flex items-center gap-1">
                                                    <Edit3 size={10} /> {2 - session.edit_count} cambios restantes
                                                </span>
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => openEditModal(session, 'physical')}
                                                        className="p-1.5 bg-white/5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/20 transition-all"
                                                    >
                                                        <Edit3 size={14} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleCloseRoom(session.id, 'physical')}
                                                        className="p-1.5 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        )}

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleJoinPhysical(session)}
                                            disabled={session.participant_count >= session.max_participants}
                                            className="w-full mt-4 bg-gradient-to-r from-white/5 to-white/10 border border-white/10 text-white py-3 rounded-xl text-sm font-bold hover:border-amber-500/50 hover:text-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {session.map_link ? <><ExternalLink size={14} /> Ver Mapa y Reservar</> : "Reservar Cupo"}
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal for Create/Edit */}
            <AnimatePresence>
                {(showCreateModal || showEditModal) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 100, opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="bg-gradient-to-b from-slate-800 to-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    {!showEditModal && createStep > 0 && (
                                        <motion.button
                                            whileHover={{ x: -2 }}
                                            onClick={() => setCreateStep(prev => prev - 1)}
                                            className="p-2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            <ArrowLeft size={18} />
                                        </motion.button>
                                    )}
                                    <h3 className="text-lg font-bold text-white">
                                        {showEditModal ? "Editar Sala" : createStep === 0 ? "Elige el Propósito" : createStep === 1 ? "Elige la Modalidad" : "Detalles"}
                                    </h3>
                                </div>
                                <motion.button
                                    whileHover={{ rotate: 90 }}
                                    onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X size={18} className="text-slate-400" />
                                </motion.button>
                            </div>

                            {/* Step 0: Category */}
                            {!showEditModal && createStep === 0 && (
                                <div className="space-y-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { setFormCategory('focus'); setCreateStep(1); }}
                                        className="w-full p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                <Target size={28} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-white text-lg">Solo Foco</div>
                                                <div className="text-xs text-slate-400">Sin micrófono, solo compañía silenciosa</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { setFormCategory('topic'); setCreateStep(1); }}
                                        className="w-full p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                                <Sparkles size={28} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-white text-lg">Temática</div>
                                                <div className="text-xs text-slate-400">Para debatir o estudiar un tema específico</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                                    </motion.button>
                                </div>
                            )}

                            {/* Step 1: Modality */}
                            {!showEditModal && createStep === 1 && (
                                <div className="space-y-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { setFormType('virtual'); setCreateStep(2); }}
                                        className="w-full p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 hover:border-blue-500/50 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                                <Video size={28} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-white text-lg">Virtual</div>
                                                <div className="text-xs text-slate-400">Meet, Zoom, Teams, Discord...</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { setFormType('physical'); setCreateStep(2); }}
                                        className="w-full p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                                <MapPin size={28} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-white text-lg">Presencial</div>
                                                <div className="text-xs text-slate-400">Biblioteca, Café, Parque...</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                                    </motion.button>
                                </div>
                            )}

                            {/* Step 2 or Edit: Form */}
                            {(createStep === 2 || showEditModal) && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre de la Sala</label>
                                        <input
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            placeholder={formCategory === 'focus' ? "Ej: Sesión silenciosa" : "Ej: Debate de Historia"}
                                            className="w-full p-4 mt-2 rounded-xl bg-white/5 border border-white/20 focus:border-purple-500/50 outline-none text-white text-sm placeholder:text-slate-600"
                                        />
                                    </div>

                                    {formCategory === 'topic' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tema Específico</label>
                                            <input
                                                value={newTopic}
                                                onChange={e => setNewTopic(e.target.value)}
                                                placeholder="Ej: Cálculo Integral"
                                                className="w-full p-4 mt-2 rounded-xl bg-white/5 border border-white/20 focus:border-purple-500/50 outline-none text-white text-sm placeholder:text-slate-600"
                                            />
                                        </motion.div>
                                    )}

                                    {formType === 'virtual' && (
                                        <>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plataforma</label>
                                                <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
                                                    {(['Meet', 'Teams', 'Zoom', 'Discord'] as PlatformType[]).map(p => (
                                                        <button
                                                            key={p}
                                                            onClick={() => setNewPlatform(p)}
                                                            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${newPlatform === p
                                                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                                                                : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30'
                                                                }`}
                                                        >
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enlace de la Reunión</label>
                                                <input
                                                    value={newLink}
                                                    onChange={e => setNewLink(e.target.value)}
                                                    placeholder="https://meet.google.com/..."
                                                    className="w-full p-4 mt-2 rounded-xl bg-white/5 border border-white/20 focus:border-purple-500/50 outline-none text-white text-sm placeholder:text-slate-600"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {formType === 'physical' && (
                                        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 rounded-2xl border border-amber-500/30">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                                    <MapPin size={12} /> Ubicación
                                                </label>
                                                {showEditModal && editingRoomId && (() => {
                                                    const room = physicalSessions.find(r => r.id === editingRoomId);
                                                    if (room && room.editCount >= 2) return <span className="text-[10px] text-red-400 font-bold flex items-center gap-1"><AlertCircle size={10} /> Cambios agotados</span>;
                                                    return <span className="text-[10px] text-amber-400/70 font-bold">{room ? 2 - room.editCount : 0} cambios restantes</span>;
                                                })()}
                                            </div>

                                            {(!showEditModal || (physicalSessions.find(r => r.id === editingRoomId)?.editCount || 0) < 2) ? (
                                                <>
                                                    {/* Session Timing Toggle */}
                                                    <div className="flex bg-black/20 p-1 rounded-xl mb-4 w-full">
                                                        <button
                                                            onClick={() => setIsScheduledSession(false)}
                                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!isScheduledSession
                                                                ? 'bg-amber-500 text-black shadow-lg'
                                                                : 'text-slate-400 hover:text-white'
                                                                }`}
                                                        >
                                                            Inmediata (Ahora)
                                                        </button>
                                                        <button
                                                            onClick={() => setIsScheduledSession(true)}
                                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isScheduledSession
                                                                ? 'bg-amber-500 text-black shadow-lg'
                                                                : 'text-slate-400 hover:text-white'
                                                                }`}
                                                        >
                                                            Programada
                                                        </button>
                                                    </div>

                                                    {/* Scheduled Time Inputs */}
                                                    {isScheduledSession && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="mb-4 space-y-3 p-3 bg-black/20 rounded-xl border border-white/5"
                                                        >
                                                            <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
                                                                <Clock size={12} />
                                                                <span>Debe programarse con min. 2 horas de anticipación</span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <div className="flex-1">
                                                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Fecha</label>
                                                                    <input
                                                                        type="date"
                                                                        value={scheduledDate}
                                                                        min={new Date().toISOString().split('T')[0]}
                                                                        onChange={(e) => setScheduledDate(e.target.value)}
                                                                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-amber-500/50"
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Hora</label>
                                                                    <input
                                                                        type="time"
                                                                        value={scheduledTime}
                                                                        onChange={(e) => {
                                                                            setScheduledTime(e.target.value);
                                                                            // Validate 2 hour rule
                                                                            if (scheduledDate) {
                                                                                const sessionTime = new Date(`${scheduledDate}T${e.target.value}`);
                                                                                const now = new Date();
                                                                                const diffHours = (sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60);

                                                                                if (diffHours < 2) {
                                                                                    // Just show visual feedback, don't clear yet
                                                                                    setError("La sesión debe ser al menos 2 horas en el futuro para dar tiempo a otros.");
                                                                                } else {
                                                                                    setError(null);
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-amber-500/50"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {/* Input Directo de Ubicación - Simplificado */}
                                                    <div className="mb-4 space-y-2">
                                                        <div className="relative">
                                                            <input
                                                                value={locationQuery}
                                                                onChange={(e) => {
                                                                    setLocationQuery(e.target.value);
                                                                    // Update internal state without complex geocoding unless requested
                                                                    setFoundLocation({
                                                                        name: e.target.value,
                                                                        address: "Ubicación manual",
                                                                        uri: ""
                                                                    });
                                                                }}
                                                                placeholder="Ej: Biblioteca Karl C. Parrish, Mesas del primer piso"
                                                                className="w-full p-4 pr-24 rounded-xl bg-white/5 border border-white/20 text-white text-sm outline-none focus:border-amber-500/50 placeholder:text-slate-600 transition-colors"
                                                            />
                                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={handleUseGPS}
                                                                    disabled={isGettingGPS}
                                                                    className="p-2 bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
                                                                    title="Usar mi ubicación actual"
                                                                >
                                                                    {isGettingGPS ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                                                                </motion.button>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => setShowMapPicker(true)}
                                                                    className="p-2 bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
                                                                    title="Buscar en mapa"
                                                                >
                                                                    <MapPin size={16} />
                                                                </motion.button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Quick Location Suggestions - Dynamic based on location */}
                                                    <LocationSuggestions
                                                        onSelect={(place) => {
                                                            setLocationQuery(place.name);
                                                            setFoundLocation({
                                                                name: place.name,
                                                                address: place.address,
                                                                uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`
                                                            });
                                                        }}
                                                        selectedName={locationQuery}
                                                    />
                                                </>
                                            ) : (
                                                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 text-amber-400 text-xs italic text-center">
                                                    Has alcanzado el límite de cambios de ubicación. Por favor cierra esta sala y crea una nueva.
                                                </div>
                                            )}

                                            {(foundLocation || (showEditModal && locationQuery)) && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-3 bg-white/5 p-4 rounded-xl border border-white/10"
                                                >
                                                    <p className="text-sm font-bold text-white">{foundLocation?.name || locationQuery}</p>
                                                    <p className="text-xs text-slate-400 truncate">{foundLocation?.address || "Ubicación guardada"}</p>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={showEditModal ? handleSaveChanges : handleCreate}
                                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-xl font-bold mt-4 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
                                    >
                                        {showEditModal ? <><Save size={18} /> Guardar Cambios</> : "🚀 Lanzar Sala"}
                                    </motion.button>

                                    {showEditModal && (
                                        <button
                                            onClick={() => handleCloseRoom(editingRoomId!, formType)}
                                            className="w-full mt-3 bg-red-500/10 text-red-400 py-3 rounded-xl font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 border border-red-500/30"
                                        >
                                            <Trash2 size={18} /> Eliminar Sala
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </motion.div >
                )}
            </AnimatePresence>

            {showMapPicker && (
                <LocationPicker
                    initialLat={foundLocation?.uri ? parseFloat(foundLocation.uri.split('q=')[1]?.split(',')[0]) : undefined}
                    initialLng={foundLocation?.uri ? parseFloat(foundLocation.uri.split('q=')[1]?.split(',')[1]) : undefined}
                    onLocationSelect={handleLocationSelect}
                    onClose={() => setShowMapPicker(false)}
                />
            )}
        </motion.div>
    );
};

export default Community;