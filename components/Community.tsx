import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Plus, X, Sparkles, MapPin, Video, ExternalLink, Monitor, Zap, MicOff, Coffee, Library, Link as LinkIcon, Search, Loader2, LocateFixed, Navigation, Edit3, Trash2, AlertCircle, Save, Clock, ChevronRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface CommunityProps {
    onBack: () => void;
    onJoinSession: (roomName: string) => void;
}

type PlatformType = 'Teams' | 'Meet' | 'Zoom' | 'Discord';
type SessionType = 'virtual' | 'physical';
type RoomCategory = 'focus' | 'topic';

interface VirtualRoom {
    id: number;
    isOwner?: boolean;
    category: RoomCategory;
    name: string;
    topic?: string;
    count: number;
    max: number;
    platform: PlatformType;
    link: string;
    host: string;
    avatars: string[];
}

interface PhysicalSession {
    id: number;
    isOwner?: boolean;
    editCount: number; // Track location changes (Max 2)
    category: RoomCategory;
    name: string;
    topic?: string;
    locationName: string;
    address: string;
    mapLink?: string;
    count: number;
    max: number;
    distance: string;
    amenities: ('wifi' | 'coffee' | 'silence')[];
}

const Community: React.FC<CommunityProps> = ({ onBack, onJoinSession }) => {
    const [activeTab, setActiveTab] = useState<SessionType>('virtual');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState<number | null>(null);

    // Wizard Step State for Creation: 0 = Category, 1 = Modality, 2 = Form
    const [createStep, setCreateStep] = useState(0);

    // Data States
    const [virtualRooms, setVirtualRooms] = useState<VirtualRoom[]>([
        {
            id: 1, category: 'focus', name: "Sala de Silencio Profundo", count: 48, max: 100,
            platform: 'Meet', link: 'https://meet.google.com/', host: 'AlterFocus Bot',
            avatars: ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500']
        },
        {
            id: 2, category: 'topic', name: "Repaso de Cálculo II", topic: "Integrales", count: 4, max: 10,
            platform: 'Teams', link: 'https://teams.microsoft.com/', host: 'Prof. García',
            avatars: ['bg-purple-500', 'bg-pink-500']
        }
    ]);

    const [physicalSessions, setPhysicalSessions] = useState<PhysicalSession[]>([
        {
            id: 101, category: 'focus', name: "Mesa Silenciosa", editCount: 0,
            locationName: "Biblioteca Central", address: "Piso 2, Zona Azul",
            count: 3, max: 4, distance: "0.2 km", amenities: ['wifi', 'silence']
        },
        {
            id: 102, category: 'topic', name: "Club de Lectura", topic: "Filosofía", editCount: 0,
            locationName: "Starbucks Calle 93", address: "Mesa comunal",
            count: 2, max: 6, distance: "1.5 km", amenities: ['coffee', 'wifi']
        }
    ]);

    // Form States (Shared for Create & Edit)
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

    // --- ACTIONS ---

    const handleJoinVirtual = (room: VirtualRoom) => {
        window.open(room.link, '_blank');
        onJoinSession(room.name);
    };

    const handleJoinPhysical = (session: PhysicalSession) => {
        if (session.mapLink) window.open(session.mapLink, '_blank');
        onJoinSession(`${session.name} (@${session.locationName})`);
    };

    const handleCloseRoom = (id: number, type: SessionType) => {
        if (!confirm("¿Estás seguro de cerrar esta sala? Los participantes serán notificados.")) return;

        if (type === 'virtual') {
            setVirtualRooms(prev => prev.filter(r => r.id !== id));
        } else {
            setPhysicalSessions(prev => prev.filter(r => r.id !== id));
        }
        setShowEditModal(false);
        setEditingRoomId(null);
    };

    const openEditModal = (room: any, type: SessionType) => {
        setEditingRoomId(room.id);
        setFormType(type);
        setFormCategory(room.category);
        setNewName(room.name);
        setNewTopic(room.topic || '');

        if (type === 'virtual') {
            setNewPlatform(room.platform);
            setNewLink(room.link);
        } else {
            setLocationQuery(room.locationName);
            setFoundLocation({
                name: room.locationName,
                address: room.address,
                uri: room.mapLink || ''
            });
        }
        setShowEditModal(true);
    };

    const handleSaveChanges = () => {
        if (formType === 'virtual') {
            setVirtualRooms(prev => prev.map(r => {
                if (r.id === editingRoomId) {
                    return {
                        ...r,
                        name: newName,
                        topic: formCategory === 'topic' ? newTopic : undefined,
                        platform: newPlatform,
                        link: newLink
                    };
                }
                return r;
            }));
        } else {
            setPhysicalSessions(prev => prev.map(r => {
                if (r.id === editingRoomId) {
                    const locationChanged = r.locationName !== (foundLocation?.name || locationQuery);
                    const newEditCount = locationChanged ? r.editCount + 1 : r.editCount;

                    return {
                        ...r,
                        name: newName,
                        topic: formCategory === 'topic' ? newTopic : undefined,
                        locationName: foundLocation?.name || locationQuery,
                        address: foundLocation?.address || r.address,
                        mapLink: foundLocation?.uri || r.mapLink,
                        editCount: newEditCount
                    };
                }
                return r;
            }));
        }
        resetForm();
        setShowEditModal(false);
    };

    const handleCreate = () => {
        if (formType === 'virtual') {
            const newRoom: VirtualRoom = {
                id: Date.now(),
                isOwner: true,
                category: formCategory,
                name: newName || (formCategory === 'focus' ? "Sesión de Foco" : "Sala de Estudio"),
                topic: formCategory === 'topic' ? newTopic : undefined,
                count: 1, max: 10, platform: newPlatform,
                link: newLink || 'https://meet.new',
                host: 'Tú',
                avatars: ['bg-brand-teal']
            };
            setVirtualRooms([newRoom, ...virtualRooms]);
            setActiveTab('virtual');
        } else {
            const newSession: PhysicalSession = {
                id: Date.now(),
                isOwner: true,
                editCount: 0,
                category: formCategory,
                name: newName || "Grupo de Estudio",
                topic: formCategory === 'topic' ? newTopic : undefined,
                locationName: foundLocation?.name || locationQuery || "Ubicación definida",
                address: foundLocation?.address || "Dirección pendiente",
                mapLink: foundLocation?.uri,
                count: 1, max: 5, distance: "Aquí",
                amenities: ['wifi']
            };
            setPhysicalSessions([newSession, ...physicalSessions]);
            setActiveTab('physical');
        }

        resetForm();
        setShowCreateModal(false);
    };

    const resetForm = () => {
        setNewName(''); setNewTopic(''); setNewLink(''); setLocationQuery(''); setFoundLocation(null); setEditingRoomId(null);
        setCreateStep(0); // Reset wizard step
    };

    // --- MAPS & GPS LOGIC ---

    const handleUseGPS = () => {
        if (!navigator.geolocation) {
            alert("Geolocalización no soportada.");
            return;
        }
        setIsGettingGPS(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Identify a short, generic location name for coordinates: ${latitude}, ${longitude} (e.g., "Centro de la Ciudad", "Zona Norte"). Return ONLY the name.`
                });
                const areaName = response.text.trim() || "Mi Ubicación Actual";

                setFoundLocation({
                    name: areaName,
                    address: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
                    uri: mapsLink
                });
                setLocationQuery(areaName);
            } catch (e) {
                setFoundLocation({
                    name: "Ubicación Compartida",
                    address: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
                    uri: mapsLink
                });
            } finally {
                setIsGettingGPS(false);
            }
        }, (err) => {
            console.error(err);
            alert("No se pudo obtener la ubicación.");
            setIsGettingGPS(false);
        });
    };

    const searchLocationWithAI = async () => {
        if (!locationQuery.trim()) return;
        setIsSearchingLocation(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Find this place: "${locationQuery}". Return the name and address.`,
                config: { tools: [{ googleMaps: {} }] }
            });

            const chunk = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0];
            if (chunk?.web?.uri || chunk?.maps?.uri) {
                setFoundLocation({
                    name: chunk.web?.title || chunk.maps?.title || locationQuery,
                    address: "Ubicación encontrada en Maps",
                    uri: chunk.web?.uri || chunk.maps?.uri || ""
                });
            } else {
                setFoundLocation({
                    name: locationQuery,
                    address: "Dirección simulada por IA",
                    uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`
                });
            }
        } catch (error) {
            console.error("Maps error", error);
            setFoundLocation({ name: locationQuery, address: "", uri: "" });
        } finally {
            setIsSearchingLocation(false);
        }
    };

    // --- RENDER HELPERS ---

    const PlatformIcon = ({ platform }: { platform: PlatformType }) => {
        const initials = platform === 'Teams' ? 'T' : platform === 'Meet' ? 'M' : platform === 'Zoom' ? 'Z' : 'D';
        const colors = platform === 'Teams' ? 'bg-indigo-100 text-indigo-600' : platform === 'Meet' ? 'bg-green-100 text-green-600' : platform === 'Zoom' ? 'bg-blue-100 text-blue-600' : 'bg-violet-100 text-violet-600';
        return (
            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${colors}`}>
                {initials}
            </div>
        );
    };

    const getModalTitle = () => {
        if (showEditModal) return "Editar Sala";
        if (createStep === 0) return "Elige el Propósito";
        if (createStep === 1) return "Elige la Modalidad";
        return "Detalles de la Sala";
    };

    return (
        <motion.div
            className="absolute inset-0 bg-brand-dark z-30 flex flex-col overflow-hidden"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        >
            {/* Header */}
            <div className="bg-brand-surface px-4 py-3 shadow-sm sticky top-0 z-10 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 -ml-2 text-slate-300 hover:bg-slate-700 rounded-full"><ArrowLeft size={24} /></button>
                        <div>
                            <h1 className="font-bold text-lg text-slate-100 leading-none">Comunidad</h1>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Estudiantes cerca de ti
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowCreateModal(true); }}
                        className="bg-brand-primary text-white px-4 py-2 rounded-full shadow-md flex items-center gap-2 hover:bg-brand-primary/80 active:scale-95 transition-all"
                    >
                        <Plus size={16} />
                        <span className="text-xs font-bold">Crear</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-slate-700/50 rounded-xl">
                    <button onClick={() => setActiveTab('virtual')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'virtual' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                        <Monitor size={14} /> Salas Virtuales
                    </button>
                    <button onClick={() => setActiveTab('physical')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'physical' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                        <MapPin size={14} /> Presencial
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">

                {activeTab === 'virtual' && (
                    <>
                        <div className="bg-gradient-to-br from-brand-teal to-brand-600 rounded-3xl p-6 text-white shadow-lg shadow-brand-teal/20 relative overflow-hidden cursor-pointer" onClick={() => onJoinSession("Body Doubling Rápido")}>
                            <div className="absolute top-0 right-0 p-6 opacity-10"><Users size={100} /></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase">Empieza Ya</div>
                                    <div className="flex items-center gap-1 text-xs font-medium text-white/80"><MicOff size={12} /><span>Sin micrófono</span></div>
                                </div>
                                <h2 className="text-2xl font-bold mb-1">Body Doubling Rápido</h2>
                                <p className="text-white/80 text-sm mb-4 max-w-[80%]">Únete a una sala silenciosa aleatoria.</p>
                                <button className="bg-white text-brand-teal px-4 py-2 rounded-xl text-sm font-bold shadow-sm">Unirme Ahora ⚡</button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {virtualRooms.map((room) => (
                                <motion.div key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-brand-surface p-4 rounded-2xl border shadow-sm transition-all ${room.isOwner ? 'border-brand-primary/30 bg-brand-primary/10' : 'border-slate-700'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${room.category === 'focus' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                {room.category === 'focus' ? <Zap size={20} /> : <Sparkles size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-100 text-sm">{room.name} {room.isOwner && <span className="text-[10px] bg-brand-primary text-white px-1.5 rounded ml-1">TÚ</span>}</h4>
                                                {room.topic ? <p className="text-xs text-slate-400 mt-0.5">Tema: {room.topic}</p> : <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MicOff size={10} /> Solo acompañamiento</p>}
                                            </div>
                                        </div>
                                        <PlatformIcon platform={room.platform} />
                                    </div>

                                    {room.isOwner && (
                                        <div className="flex justify-end gap-2 mb-3 pb-3 border-b border-slate-700">
                                            <button onClick={() => openEditModal(room, 'virtual')} className="p-2 bg-slate-700 rounded-lg text-slate-300 hover:text-brand-primary hover:bg-slate-600 border border-transparent hover:border-brand-primary transition-all" title="Editar">
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => handleCloseRoom(room.id, 'virtual')} className="p-2 bg-rose-500/20 rounded-lg text-rose-400 hover:bg-rose-500/30 transition-all" title="Cerrar Sala">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-4 border-t border-slate-700/50 pt-3">
                                        <div className="flex -space-x-2">
                                            {room.avatars.map((color, i) => <div key={i} className={`w-6 h-6 rounded-full border-2 border-brand-surface ${color}`} />)}
                                        </div>
                                        <button onClick={() => handleJoinVirtual(room)} className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-full hover:bg-brand-primary/20 transition-colors">
                                            Unirse
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'physical' && (
                    <div className="space-y-4">
                        <div className="bg-orange-500/10 p-4 rounded-xl text-orange-300 text-xs border border-orange-500/30 flex items-start gap-3">
                            <MapPin className="flex-shrink-0 mt-0.5" size={16} />
                            <p><strong>Encuentros Locales:</strong> Estas salas son físicas. Llega al lugar para unirte.</p>
                        </div>

                        {physicalSessions.map((session) => (
                            <motion.div key={session.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`bg-brand-surface p-4 rounded-2xl border shadow-sm ${session.isOwner ? 'border-orange-500/30 bg-orange-500/10' : 'border-slate-700'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${session.category === 'focus' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {session.locationName.toLowerCase().includes('biblioteca') ? <Library size={20} /> : <Coffee size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-100 text-sm">{session.name} {session.isOwner && <span className="text-[10px] bg-orange-500 text-white px-1.5 rounded ml-1">TÚ</span>}</h4>
                                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                                <MapPin size={10} /> {session.locationName}
                                            </div>
                                            {session.topic && <p className="text-xs text-slate-500 mt-1 italic">Tema: {session.topic}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs font-bold text-slate-300">{session.distance}</span>
                                        <span className={`text-[10px] font-bold ${session.count >= session.max ? 'text-red-400' : 'text-green-400'}`}>
                                            {session.max - session.count} cupos
                                        </span>
                                    </div>
                                </div>

                                {session.isOwner && (
                                    <div className="flex items-center justify-between mt-3 bg-slate-700/50 p-2 rounded-lg border border-slate-600">
                                        <span className="text-[10px] text-slate-400 font-bold ml-2 flex items-center gap-1">
                                            <Edit3 size={10} /> {2 - session.editCount} cambios de ubicación restantes
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditModal(session, 'physical')} className="p-1.5 bg-slate-600 rounded border border-slate-500 text-slate-300 hover:text-orange-400 hover:border-orange-400 transition-all">
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => handleCloseRoom(session.id, 'physical')} className="p-1.5 bg-slate-600 rounded border border-slate-500 text-rose-400 hover:bg-rose-500/20 hover:border-rose-400 transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleJoinPhysical(session)}
                                    disabled={session.count >= session.max}
                                    className="w-full mt-4 bg-slate-700 border border-slate-600 text-slate-200 py-2.5 rounded-xl text-xs font-bold hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {session.mapLink ? <><ExternalLink size={12} /> Ver Mapa y Reservar</> : "Reservar Cupo"}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for Create OR Edit */}
            <AnimatePresence>
                {(showCreateModal || showEditModal) && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                        <motion.div
                            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    {/* Back button within wizard */}
                                    {!showEditModal && createStep > 0 && (
                                        <button onClick={() => setCreateStep(prev => prev - 1)} className="p-1 -ml-2 text-slate-400 hover:text-slate-600">
                                            <ArrowLeft size={20} />
                                        </button>
                                    )}
                                    <h3 className="text-lg font-bold text-slate-800">{getModalTitle()}</h3>
                                </div>
                                <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="p-2 hover:bg-slate-100 rounded-full">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            {/* --- STEP 0: CATEGORY SELECTION --- */}
                            {!showEditModal && createStep === 0 && (
                                <div className="space-y-3">
                                    <button onClick={() => { setFormCategory('focus'); setCreateStep(1); }} className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-brand-teal hover:bg-brand-50 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Zap size={24} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-slate-800">Solo Foco</div>
                                                <div className="text-xs text-slate-500">Sin micrófono, solo compañía.</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-teal" />
                                    </button>

                                    <button onClick={() => { setFormCategory('topic'); setCreateStep(1); }} className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Sparkles size={24} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-slate-800">Temática</div>
                                                <div className="text-xs text-slate-500">Para debatir o estudiar un tema.</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500" />
                                    </button>
                                </div>
                            )}

                            {/* --- STEP 1: MODALITY SELECTION --- */}
                            {!showEditModal && createStep === 1 && (
                                <div className="space-y-3">
                                    <button onClick={() => { setFormType('virtual'); setCreateStep(2); }} className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Video size={24} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-slate-800">Sala Virtual</div>
                                                <div className="text-xs text-slate-500">Google Meet, Zoom, Teams...</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500" />
                                    </button>

                                    <button onClick={() => { setFormType('physical'); setCreateStep(2); }} className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <MapPin size={24} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-slate-800">Presencial</div>
                                                <div className="text-xs text-slate-500">Biblioteca, Café, Parque...</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-300 group-hover:text-orange-500" />
                                    </button>
                                </div>
                            )}

                            {/* --- STEP 2 (or EDIT): FORM DETAILS --- */}
                            {(createStep === 2 || showEditModal) && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase">Nombre de la Sala</label>
                                        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={formCategory === 'focus' ? "Ej: Sesión silenciosa" : "Ej: Debate de Historia"} className="w-full p-3 mt-1 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-teal outline-none text-sm" />
                                    </div>

                                    {formCategory === 'topic' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <label className="text-xs font-bold text-slate-400 uppercase">Tema Específico</label>
                                            <input value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="Ej: Cálculo Integral" className="w-full p-3 mt-1 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-teal outline-none text-sm" />
                                        </motion.div>
                                    )}

                                    {formType === 'virtual' && (
                                        <>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase">Plataforma</label>
                                                <div className="flex gap-2 mt-1 overflow-x-auto no-scrollbar">
                                                    {(['Meet', 'Teams', 'Zoom', 'Discord'] as PlatformType[]).map(p => (
                                                        <button key={p} onClick={() => setNewPlatform(p)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${newPlatform === p ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}>{p}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase">Enlace de la Reunión</label>
                                                <input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://meet.google.com/..." className="w-full p-3 mt-1 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-teal outline-none text-sm" />
                                            </div>
                                        </>
                                    )}

                                    {formType === 'physical' && (
                                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="text-xs font-bold text-orange-800 uppercase flex items-center gap-1"><MapPin size={12} /> Ubicación</label>
                                                {showEditModal && editingRoomId && (
                                                    (() => {
                                                        const room = physicalSessions.find(r => r.id === editingRoomId);
                                                        if (room && room.editCount >= 2) return <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10} /> Cambios agotados</span>
                                                        return <span className="text-[10px] text-orange-600 font-bold">{room ? 2 - room.editCount : 0} cambios restantes</span>
                                                    })()
                                                )}
                                            </div>

                                            {(!showEditModal || (physicalSessions.find(r => r.id === editingRoomId)?.editCount || 0) < 2) ? (
                                                <>
                                                    <button onClick={handleUseGPS} disabled={isGettingGPS} className="w-full mb-3 bg-white border border-orange-200 text-orange-700 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors shadow-sm">
                                                        {isGettingGPS ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                                                        {isGettingGPS ? "Obteniendo coordenadas..." : "Usar mi ubicación actual"}
                                                    </button>
                                                    <div className="flex gap-2">
                                                        <input value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} placeholder="Ej: Biblioteca Nacional" className="flex-1 p-3 rounded-xl border border-orange-200 text-sm outline-none bg-white" onKeyDown={(e) => e.key === 'Enter' && searchLocationWithAI()} />
                                                        <button onClick={searchLocationWithAI} disabled={isSearchingLocation || !locationQuery} className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600">{isSearchingLocation ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="bg-orange-100/50 p-3 rounded border border-orange-200 text-orange-800 text-xs italic text-center">
                                                    Has alcanzado el límite de cambios de ubicación para esta sala. Si te has movido, por favor cierra esta sala y crea una nueva.
                                                </div>
                                            )}

                                            {(foundLocation || (showEditModal && locationQuery)) && (
                                                <div className="mt-3 bg-white p-3 rounded-lg border border-orange-200 shadow-sm">
                                                    <p className="text-sm font-bold text-slate-800">{foundLocation?.name || locationQuery}</p>
                                                    <p className="text-xs text-slate-500 truncate">{foundLocation?.address || "Ubicación guardada"}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={showEditModal ? handleSaveChanges : handleCreate}
                                        className="w-full bg-brand-teal text-white py-4 rounded-xl font-bold mt-4 hover:bg-brand-700 transition-all shadow-lg shadow-brand-teal/20 flex items-center justify-center gap-2"
                                    >
                                        {showEditModal ? <><Save size={18} /> Guardar Cambios</> : "Lanzar Sala"}
                                    </button>

                                    {showEditModal && (
                                        <button
                                            onClick={() => handleCloseRoom(editingRoomId!, formType)}
                                            className="w-full mt-3 bg-rose-50 text-rose-500 py-3 rounded-xl font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 border border-rose-100"
                                        >
                                            <Trash2 size={18} /> Eliminar Sala
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Community;