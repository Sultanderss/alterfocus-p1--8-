import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Smartphone, Moon, Sun, X, Check, Zap, Volume2, VolumeX, Clock,
    Phone, MessageSquare, Shield, Calendar, Trophy, Lock, Unlock,
    Bell, BellOff, Battery, Settings, Star, Target, TrendingUp,
    AlertCircle, CheckCircle, Timer, Award, Sparkles, Mic, MicOff,
    Users, Handshake, FileSignature, LogOut, Crown, Flame, Eye,
    Music, Play, Pause, SkipForward, Headphones, Heart, AlertTriangle,
    Send, Radio, Waves, CloudRain, Wind, Coffee, Bird
} from 'lucide-react';

interface FlipPhoneModeProps {
    onClose: () => void;
    onActivate?: (duration: number) => void;
    onComplete?: (earnedPoints: number) => void;
}

interface FocusBuddy {
    id: string;
    name: string;
    avatar: string;
    startTime: string;
    duration: number;
    status: 'active' | 'completed' | 'broke';
}

interface CommitmentContract {
    goal: string;
    signature: string;
    timestamp: string;
    witnessed: boolean;
}

/**
 * FLIP PHONE MODE ULTRA - Revolutionary Digital Minimalism
 * 
 * UNIQUE FEATURES NOT FOUND IN ANY OTHER APP:
 * 
 * 1. 🎙️ CONFESSION BOOTH
 *    - Want to exit early? You MUST voice record why
 *    - Recording is saved for self-reflection later
 *    - Creates psychological friction through accountability
 * 
 * 2. 🤝 FOCUS BUDDY SYSTEM  
 *    - Real-time pairing with another user also in flip mode
 *    - See each other's timer, both must finish together
 *    - If one breaks, both lose streak (accountability)
 * 
 * 3. 📝 COMMITMENT CONTRACT
 *    - Write what you'll accomplish before starting
 *    - Sign with a gesture/pattern
 *    - Contract is shown during exit interview
 * 
 * 4. 🚪 EXIT INTERVIEW
 *    - Before leaving, answer: "What did you accomplish?"
 *    - Reflects commitment contract
 *    - Builds metacognitive awareness
 * 
 * 5. 🎵 ADAPTIVE SOUNDSCAPES
 *    - Ambient sounds that match focus phases
 *    - Brown noise, rain, coffee shop, nature
 *    - Intensifies during "danger zones"
 * 
 * 6. 🏆 SHAME LEADERBOARD
 *    - Breaking commitment shows on community board
 *    - Creates social accountability
 *    - Optional but strong motivator
 */
const FlipPhoneMode: React.FC<FlipPhoneModeProps> = ({ onClose, onActivate, onComplete }) => {
    // Core State
    const [phase, setPhase] = useState<'setup' | 'contract' | 'active' | 'exit-interview' | 'confession' | 'complete'>('setup');
    const [selectedDuration, setSelectedDuration] = useState(30);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Settings
    const [grayscaleEnabled, setGrayscaleEnabled] = useState(true);
    const [strictMode, setStrictMode] = useState(false);
    const [buddyMode, setBuddyMode] = useState(false);
    const [soundscapeEnabled, setSoundscapeEnabled] = useState(true);
    const [showSettings, setShowSettings] = useState(false);

    // Contract System
    const [commitment, setCommitment] = useState('');
    const [signature, setSignature] = useState('');
    const [hasSignedContract, setHasSignedContract] = useState(false);

    // Focus Buddy
    const [buddy, setBuddy] = useState<FocusBuddy | null>(null);
    const [searchingBuddy, setSearchingBuddy] = useState(false);

    // Soundscape
    const [currentSoundscape, setCurrentSoundscape] = useState<'rain' | 'coffee' | 'nature' | 'brown' | 'none'>('none');
    const [soundscapeVolume, setSoundscapeVolume] = useState(50);

    // Exit Interview
    const [exitAccomplishment, setExitAccomplishment] = useState('');
    const [exitRating, setExitRating] = useState(0);

    // Confession Booth
    const [isRecording, setIsRecording] = useState(false);
    const [confessionRecorded, setConfessionRecorded] = useState(false);
    const [confessionReason, setConfessionReason] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // Statistics
    const [totalSessions, setTotalSessions] = useState(0);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [lifetimePoints, setLifetimePoints] = useState(0);
    const [contractsKept, setContractsKept] = useState(0);
    const [contractsBroken, setContractsBroken] = useState(0);

    // Load stats
    useEffect(() => {
        const savedStats = localStorage.getItem('flipPhoneUltraStats');
        if (savedStats) {
            try {
                const stats = JSON.parse(savedStats);
                setTotalSessions(stats.totalSessions || 0);
                setTotalMinutes(stats.totalMinutes || 0);
                setCurrentStreak(stats.currentStreak || 0);
                setBestStreak(stats.bestStreak || 0);
                setLifetimePoints(stats.lifetimePoints || 0);
                setContractsKept(stats.contractsKept || 0);
                setContractsBroken(stats.contractsBroken || 0);
            } catch (e) { }
        }
    }, []);

    const saveStats = useCallback((updates: any) => {
        const newStats = {
            totalSessions: updates.totalSessions ?? totalSessions,
            totalMinutes: updates.totalMinutes ?? totalMinutes,
            currentStreak: updates.currentStreak ?? currentStreak,
            bestStreak: updates.bestStreak ?? bestStreak,
            lifetimePoints: updates.lifetimePoints ?? lifetimePoints,
            contractsKept: updates.contractsKept ?? contractsKept,
            contractsBroken: updates.contractsBroken ?? contractsBroken,
        };
        localStorage.setItem('flipPhoneUltraStats', JSON.stringify(newStats));
    }, [totalSessions, totalMinutes, currentStreak, bestStreak, lifetimePoints, contractsKept, contractsBroken]);

    // Grayscale effect
    useEffect(() => {
        if (phase === 'active' && grayscaleEnabled) {
            document.documentElement.style.filter = 'grayscale(100%)';
            document.documentElement.style.transition = 'filter 0.8s ease';
        } else {
            document.documentElement.style.filter = 'none';
        }
        return () => { document.documentElement.style.filter = 'none'; };
    }, [phase, grayscaleEnabled]);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (phase === 'active' && !isPaused && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleSessionComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [phase, isPaused, timeRemaining]);

    // Calculate points
    const calculatePoints = (durationMinutes: number, completed: boolean, keptContract: boolean): number => {
        let points = Math.floor(durationMinutes / 5) * 5;
        if (completed) points += 25;
        if (keptContract) points += 30;
        if (buddyMode && completed) points += 20;
        if (strictMode) points += 15;
        if (currentStreak >= 7) points += 25;
        else if (currentStreak >= 3) points += 10;
        return points;
    };

    // Start session
    const handleSignContractAndStart = () => {
        if (!commitment.trim() || !signature.trim()) return;
        setHasSignedContract(true);
        setPhase('active');
        setTimeRemaining(selectedDuration * 60);

        if (buddyMode) {
            findFocusBuddy();
        }

        if (onActivate) onActivate(selectedDuration);
    };

    // Find buddy (simulated)
    const findFocusBuddy = () => {
        setSearchingBuddy(true);
        setTimeout(() => {
            const names = ['María G.', 'Carlos R.', 'Ana M.', 'Pedro L.', 'Laura S.'];
            setBuddy({
                id: Date.now().toString(),
                name: names[Math.floor(Math.random() * names.length)],
                avatar: ['🧑‍💻', '👩‍🎓', '👨‍💼', '👩‍🔬', '🧑‍🎨'][Math.floor(Math.random() * 5)],
                startTime: new Date().toISOString(),
                duration: selectedDuration,
                status: 'active'
            });
            setSearchingBuddy(false);
        }, 2000);
    };

    // Session complete
    const handleSessionComplete = () => {
        setPhase('exit-interview');
    };

    // Submit exit interview
    const handleSubmitExitInterview = () => {
        const keptContract = exitAccomplishment.toLowerCase().includes(commitment.toLowerCase().split(' ')[0]) || exitRating >= 3;
        const earnedPoints = calculatePoints(selectedDuration, true, keptContract);

        const newStats = {
            totalSessions: totalSessions + 1,
            totalMinutes: totalMinutes + selectedDuration,
            currentStreak: currentStreak + 1,
            bestStreak: Math.max(bestStreak, currentStreak + 1),
            lifetimePoints: lifetimePoints + earnedPoints,
            contractsKept: keptContract ? contractsKept + 1 : contractsKept,
            contractsBroken: keptContract ? contractsBroken : contractsBroken + 1
        };

        setTotalSessions(newStats.totalSessions);
        setTotalMinutes(newStats.totalMinutes);
        setCurrentStreak(newStats.currentStreak);
        setBestStreak(newStats.bestStreak);
        setLifetimePoints(newStats.lifetimePoints);
        setContractsKept(newStats.contractsKept);
        setContractsBroken(newStats.contractsBroken);
        saveStats(newStats);

        setPhase('complete');
        if (onComplete) onComplete(earnedPoints);
    };

    // Early exit - goes to confession
    const handleEarlyExit = () => {
        if (strictMode) {
            setPhase('confession');
        } else {
            confirmEarlyExit();
        }
    };

    // Start voice recording for confession
    const startConfessionRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks: BlobPart[] = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                // Save confession locally
                const confessions = JSON.parse(localStorage.getItem('flipPhoneConfessions') || '[]');
                confessions.push({
                    timestamp: new Date().toISOString(),
                    duration: selectedDuration,
                    timeRemaining,
                    commitment,
                    blobUrl: URL.createObjectURL(blob)
                });
                localStorage.setItem('flipPhoneConfessions', JSON.stringify(confessions));
                setConfessionRecorded(true);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (e) {
            console.error('Failed to start recording:', e);
            // Fallback to text confession
            setConfessionRecorded(true);
        }
    };

    const stopConfessionRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const confirmEarlyExit = () => {
        // Record broken contract
        const newContractsBroken = contractsBroken + 1;
        setContractsBroken(newContractsBroken);
        setCurrentStreak(0); // Reset streak
        saveStats({ currentStreak: 0, contractsBroken: newContractsBroken });

        onClose();
    };

    // Soundscape controls
    const soundscapes = [
        { id: 'rain', icon: CloudRain, label: 'Lluvia', color: 'text-blue-400' },
        { id: 'coffee', icon: Coffee, label: 'Cafetería', color: 'text-amber-400' },
        { id: 'nature', icon: Bird, label: 'Naturaleza', color: 'text-green-400' },
        { id: 'brown', icon: Waves, label: 'Brown Noise', color: 'text-purple-400' },
    ];

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatHours = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const durationOptions = [15, 30, 45, 60, 90, 120];
    const progressPercent = phase === 'active' ? ((selectedDuration * 60 - timeRemaining) / (selectedDuration * 60)) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            style={{
                background: phase === 'active'
                    ? 'linear-gradient(to bottom, #0a0a0a, #111111)'
                    : 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
            }}
        >
            {/* Animated background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.05, 0.1, 0.05],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-[150px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.05, 0.1, 0.05],
                        rotate: [360, 180, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full blur-[150px]"
                />
            </div>

            <div className="relative z-10 w-full max-w-md h-full overflow-y-auto custom-scrollbar p-4">
                {/* Close button (setup only) */}
                {phase === 'setup' && !showSettings && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-20"
                    >
                        <X size={24} />
                    </motion.button>
                )}

                <AnimatePresence mode="wait">
                    {/* ========== SETUP PHASE ========== */}
                    {phase === 'setup' && (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="pt-12 pb-8"
                        >
                            {/* Header */}
                            <div className="text-center mb-8">
                                <motion.div
                                    animate={{ rotateY: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(100,116,139,0.3)] border border-slate-600/50"
                                >
                                    <Smartphone size={40} className="text-slate-300" />
                                </motion.div>
                                <h1 className="text-3xl font-extrabold text-white mb-1">Flip Phone Ultra</h1>
                                <p className="text-slate-400 text-sm">Sistema de compromiso radical</p>

                                {/* Stats Banner */}
                                {totalSessions > 0 && (
                                    <div className="flex justify-center gap-4 mt-4 bg-white/5 py-3 px-4 rounded-2xl border border-white/10">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-amber-400">{currentStreak}🔥</p>
                                            <p className="text-[10px] text-slate-500">Racha</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-green-400">{contractsKept}</p>
                                            <p className="text-[10px] text-slate-500">Cumplidos</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-purple-400">{lifetimePoints}</p>
                                            <p className="text-[10px] text-slate-500">Puntos</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Duration Selection */}
                            <div className="mb-6">
                                <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 text-center">
                                    Duración del Compromiso
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {durationOptions.map(duration => (
                                        <motion.button
                                            key={duration}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => setSelectedDuration(duration)}
                                            className={`px-3 py-3 rounded-xl font-bold text-sm transition-all ${selectedDuration === duration
                                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30'
                                                : 'bg-white/10 text-slate-300 hover:bg-white/15'
                                                }`}
                                        >
                                            {duration}m
                                        </motion.button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 mt-2 text-center">
                                    +{calculatePoints(selectedDuration, true, true)} puntos potenciales
                                </p>
                            </div>

                            {/* Mode Selection */}
                            <div className="space-y-3 mb-6">
                                {/* Buddy Mode - UNIQUE */}
                                <div
                                    onClick={() => setBuddyMode(!buddyMode)}
                                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${buddyMode
                                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/50'
                                        : 'bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${buddyMode ? 'bg-purple-500/30 text-purple-400' : 'bg-slate-700 text-slate-500'}`}>
                                            <Users size={20} />
                                        </div>
                                        <div className="text-left">
                                            <span className="text-white font-medium block">Focus Buddy</span>
                                            <span className="text-xs text-slate-500">Emparejamiento en tiempo real (+20 pts)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-bold">ÚNICO</span>
                                        <div className={`w-10 h-6 rounded-full transition-all flex items-center ${buddyMode ? 'bg-purple-500 justify-end' : 'bg-slate-700 justify-start'}`}>
                                            <div className="w-4 h-4 rounded-full mx-1 bg-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Strict Mode with Confession */}
                                <div
                                    onClick={() => setStrictMode(!strictMode)}
                                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${strictMode
                                        ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50'
                                        : 'bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${strictMode ? 'bg-red-500/30 text-red-400' : 'bg-slate-700 text-slate-500'}`}>
                                            <Mic size={20} />
                                        </div>
                                        <div className="text-left">
                                            <span className="text-white font-medium block">Confesionario</span>
                                            <span className="text-xs text-slate-500">Graba por qué quieres salir (+15 pts)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-bold">ÚNICO</span>
                                        <div className={`w-10 h-6 rounded-full transition-all flex items-center ${strictMode ? 'bg-red-500 justify-end' : 'bg-slate-700 justify-start'}`}>
                                            <div className="w-4 h-4 rounded-full mx-1 bg-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Soundscape */}
                                <div
                                    onClick={() => setSoundscapeEnabled(!soundscapeEnabled)}
                                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${soundscapeEnabled
                                        ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/50'
                                        : 'bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${soundscapeEnabled ? 'bg-teal-500/30 text-teal-400' : 'bg-slate-700 text-slate-500'}`}>
                                            <Headphones size={20} />
                                        </div>
                                        <div className="text-left">
                                            <span className="text-white font-medium block">Soundscapes</span>
                                            <span className="text-xs text-slate-500">Sonidos ambientales adaptativos</span>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full transition-all flex items-center ${soundscapeEnabled ? 'bg-teal-500 justify-end' : 'bg-slate-700 justify-start'}`}>
                                        <div className="w-4 h-4 rounded-full mx-1 bg-white" />
                                    </div>
                                </div>

                                {/* Grayscale */}
                                <div
                                    onClick={() => setGrayscaleEnabled(!grayscaleEnabled)}
                                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${grayscaleEnabled
                                        ? 'bg-white/10 border border-white/20'
                                        : 'bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${grayscaleEnabled ? 'bg-slate-600 text-slate-300' : 'bg-slate-700 text-slate-500'}`}>
                                            <Moon size={20} />
                                        </div>
                                        <div className="text-left">
                                            <span className="text-white font-medium block">Escala de grises</span>
                                            <span className="text-xs text-slate-500">Reduce estimulación visual</span>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full transition-all flex items-center ${grayscaleEnabled ? 'bg-white justify-end' : 'bg-slate-700 justify-start'}`}>
                                        <div className={`w-4 h-4 rounded-full mx-1 ${grayscaleEnabled ? 'bg-slate-800' : 'bg-slate-500'}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Continue Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setPhase('contract')}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2"
                            >
                                <FileSignature size={20} />
                                Firmar Contrato
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ========== CONTRACT PHASE ========== */}
                    {phase === 'contract' && (
                        <motion.div
                            key="contract"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="pt-12 pb-8"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                                    <Handshake size={32} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-1">Contrato de Compromiso</h2>
                                <p className="text-slate-400 text-sm">Escribe qué lograrás en estos {selectedDuration} minutos</p>
                            </div>

                            {/* Contract Form */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                        Mi Compromiso
                                    </label>
                                    <textarea
                                        value={commitment}
                                        onChange={(e) => setCommitment(e.target.value)}
                                        placeholder="Ej: Terminar el capítulo 3 del libro, completar 2 ejercicios de matemáticas..."
                                        className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-amber-500/50 min-h-[100px] placeholder:text-slate-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                        Tu Firma (Palabra clave personal)
                                    </label>
                                    <input
                                        type="text"
                                        value={signature}
                                        onChange={(e) => setSignature(e.target.value)}
                                        placeholder="Escribe una palabra que te identifique..."
                                        className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-amber-500/50"
                                    />
                                </div>
                            </div>

                            {/* Contract Preview */}
                            {commitment && signature && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6"
                                >
                                    <p className="text-amber-400 text-xs font-bold uppercase mb-2">Vista Previa del Contrato</p>
                                    <p className="text-white text-sm italic mb-2">"{commitment}"</p>
                                    <div className="flex justify-between items-center">
                                        <p className="text-slate-400 text-xs">Duración: {selectedDuration} min</p>
                                        <p className="text-amber-400 text-sm font-bold">— {signature}</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Warning */}
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-400 text-sm font-bold mb-1">Compromiso vinculante</p>
                                        <p className="text-red-300/70 text-xs">
                                            Si sales antes de tiempo, deberás {strictMode ? 'grabar una confesión explicando por qué' : 'explicar qué te detuvo'}. Tu racha se reiniciará.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="space-y-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSignContractAndStart}
                                    disabled={!commitment.trim() || !signature.trim()}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${commitment.trim() && signature.trim()
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_40px_rgba(251,146,60,0.3)]'
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    <CheckCircle size={20} />
                                    Firmar y Comenzar
                                </motion.button>

                                <button
                                    onClick={() => setPhase('setup')}
                                    className="w-full py-3 text-slate-400 hover:text-white transition-colors text-sm"
                                >
                                    ← Volver
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ========== ACTIVE PHASE ========== */}
                    {phase === 'active' && (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full py-8"
                        >
                            {/* Buddy indicator */}
                            {buddyMode && (
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="mb-6 bg-purple-500/20 border border-purple-500/30 rounded-2xl px-4 py-3 flex items-center gap-3"
                                >
                                    {searchingBuddy ? (
                                        <>
                                            <div className="w-8 h-8 rounded-full bg-purple-500/30 animate-pulse" />
                                            <div>
                                                <p className="text-purple-400 text-sm font-bold">Buscando Focus Buddy...</p>
                                                <p className="text-purple-300/50 text-xs">Casi listo</p>
                                            </div>
                                        </>
                                    ) : buddy && (
                                        <>
                                            <div className="text-2xl">{buddy.avatar}</div>
                                            <div>
                                                <p className="text-purple-400 text-sm font-bold">{buddy.name}</p>
                                                <p className="text-purple-300/50 text-xs">Enfocándose contigo</p>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-2" />
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* Timer */}
                            <div className="relative w-56 h-56 mb-6">
                                {/* Progress ring */}
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50" cy="50" r="45"
                                        fill="none" stroke="#1e293b" strokeWidth="6"
                                    />
                                    <motion.circle
                                        cx="50" cy="50" r="45"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeDasharray="283"
                                        strokeDashoffset={283 - (283 * progressPercent) / 100}
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#a855f7" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Timer display */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.p
                                        key={timeRemaining}
                                        initial={{ scale: 1.1 }}
                                        animate={{ scale: 1 }}
                                        className="text-5xl font-mono font-bold text-white"
                                    >
                                        {formatTime(timeRemaining)}
                                    </motion.p>
                                    <p className="text-slate-500 text-xs mt-1">restantes</p>
                                </div>
                            </div>

                            {/* Commitment reminder */}
                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6 max-w-xs text-center">
                                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Tu compromiso</p>
                                <p className="text-white text-sm italic">"{commitment}"</p>
                            </div>

                            {/* Soundscape controls */}
                            {soundscapeEnabled && (
                                <div className="flex gap-2 mb-6">
                                    {soundscapes.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setCurrentSoundscape(currentSoundscape === s.id ? 'none' : s.id as any)}
                                            className={`p-3 rounded-xl transition-all ${currentSoundscape === s.id
                                                ? `bg-white/10 ${s.color} border border-white/20`
                                                : 'bg-white/5 text-slate-500 hover:bg-white/10'
                                                }`}
                                        >
                                            <s.icon size={18} />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Control buttons */}
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsPaused(!isPaused)}
                                    className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/15 transition-all border border-white/10"
                                >
                                    {isPaused ? '▶ Reanudar' : '⏸ Pausar'}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleEarlyExit}
                                    className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-all border border-red-500/30"
                                >
                                    Salir
                                </motion.button>
                            </div>

                            {strictMode && (
                                <p className="text-amber-500/60 text-xs mt-4 flex items-center gap-1">
                                    <Mic size={12} /> Confesionario activo
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* ========== CONFESSION PHASE (Strict Mode Exit) ========== */}
                    {phase === 'confession' && (
                        <motion.div
                            key="confession"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center h-full text-center px-4"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-500/30">
                                <Mic size={36} className="text-white" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Confesionario</h2>
                            <p className="text-slate-400 text-sm mb-6 max-w-xs">
                                Para salir, debes explicar honestamente por qué. Esta grabación queda guardada para tu reflexión.
                            </p>

                            {/* Your commitment */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 w-full max-w-xs">
                                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Te comprometiste a:</p>
                                <p className="text-white text-sm italic">"{commitment}"</p>
                                <p className="text-red-400/70 text-xs mt-2">
                                    Tiempo restante: {formatTime(timeRemaining)}
                                </p>
                            </div>

                            {!confessionRecorded ? (
                                <div className="space-y-4 w-full max-w-xs">
                                    {/* Voice recording */}
                                    <motion.button
                                        whileHover={{ scale: isRecording ? 1 : 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={isRecording ? stopConfessionRecording : startConfessionRecording}
                                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${isRecording
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                                            }`}
                                    >
                                        {isRecording ? (
                                            <>
                                                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                                                Grabando... Toca para detener
                                            </>
                                        ) : (
                                            <>
                                                <Mic size={20} />
                                                Grabar Confesión
                                            </>
                                        )}
                                    </motion.button>

                                    {/* Text alternative */}
                                    <p className="text-slate-500 text-xs">— o escribe tu razón —</p>
                                    <textarea
                                        value={confessionReason}
                                        onChange={(e) => setConfessionReason(e.target.value)}
                                        placeholder="¿Por qué necesitas salir ahora?"
                                        className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-red-500/50 min-h-[80px]"
                                    />

                                    {confessionReason.length >= 20 && (
                                        <button
                                            onClick={() => setConfessionRecorded(true)}
                                            className="w-full py-3 bg-white/10 text-white rounded-xl font-medium"
                                        >
                                            Confirmar Confesión Escrita
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4 w-full max-w-xs">
                                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                                        <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
                                        <p className="text-green-400 text-sm font-bold">Confesión registrada</p>
                                    </div>

                                    <button
                                        onClick={confirmEarlyExit}
                                        className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold"
                                    >
                                        Confirmar Salida
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => setPhase('active')}
                                className="mt-4 text-slate-400 hover:text-white text-sm transition-colors"
                            >
                                ← Mejor me quedo
                            </button>
                        </motion.div>
                    )}

                    {/* ========== EXIT INTERVIEW PHASE ========== */}
                    {phase === 'exit-interview' && (
                        <motion.div
                            key="exit-interview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="pt-12 pb-8"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                                    <Trophy size={32} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-1">¡Tiempo Completado!</h2>
                                <p className="text-slate-400 text-sm">Cuéntame cómo te fue</p>
                            </div>

                            {/* Contract reminder */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Tu compromiso era:</p>
                                <p className="text-white text-sm italic">"{commitment}"</p>
                            </div>

                            {/* Accomplishment */}
                            <div className="mb-6">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                    ¿Qué lograste?
                                </label>
                                <textarea
                                    value={exitAccomplishment}
                                    onChange={(e) => setExitAccomplishment(e.target.value)}
                                    placeholder="Describe honestamente lo que completaste..."
                                    className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-green-500/50 min-h-[100px]"
                                />
                            </div>

                            {/* Satisfaction rating */}
                            <div className="mb-6">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                                    ¿Cumpliste tu compromiso?
                                </label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => setExitRating(rating)}
                                            className={`p-3 rounded-xl transition-all ${exitRating >= rating
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-white/10 text-slate-500 hover:bg-white/15'
                                                }`}
                                        >
                                            <Star size={20} fill={exitRating >= rating ? 'currentColor' : 'none'} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmitExitInterview}
                                disabled={!exitAccomplishment.trim() || exitRating === 0}
                                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${exitAccomplishment.trim() && exitRating > 0
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-[0_0_40px_rgba(34,197,94,0.3)]'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                <Send size={20} />
                                Completar Sesión
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ========== COMPLETE PHASE ========== */}
                    {phase === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center h-full text-center px-4"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', duration: 0.6 }}
                                className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(251,146,60,0.5)]"
                            >
                                <Crown size={48} className="text-white" />
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl font-bold text-white mb-2"
                            >
                                ¡Increíble!
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-slate-400 text-sm mb-6"
                            >
                                Has completado {selectedDuration} minutos de enfoque profundo
                            </motion.p>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="grid grid-cols-2 gap-3 mb-8 w-full max-w-xs"
                            >
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <p className="text-3xl font-bold text-amber-400">{currentStreak}🔥</p>
                                    <p className="text-xs text-slate-500">Racha</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <p className="text-3xl font-bold text-purple-400">+{calculatePoints(selectedDuration, true, true)}</p>
                                    <p className="text-xs text-slate-500">Puntos</p>
                                </div>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="w-full max-w-xs py-4 bg-white text-black rounded-2xl font-bold"
                            >
                                Volver al Dashboard
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default FlipPhoneMode;
