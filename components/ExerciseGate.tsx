import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Zap, Check, AlertCircle, Target, Trophy, Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs';

interface ExerciseGateProps {
    onComplete: (pointsEarned: number) => void;
    onCancel: () => void;
    requiredPoints?: number;
    blockedApp?: string;
}

type ExerciseType = 'jumping_jacks' | 'squats' | 'high_knees';

interface Exercise {
    id: ExerciseType;
    name: string;
    emoji: string;
    pointsPerRep: number;
    instructions: string;
}

interface Keypoint {
    x: number;
    y: number;
    score?: number;
    name?: string;
}

const EXERCISES: Exercise[] = [
    { id: 'jumping_jacks', name: 'Jumping Jacks', emoji: '⭐', pointsPerRep: 5, instructions: 'Salta abriendo brazos y piernas' },
    { id: 'squats', name: 'Sentadillas', emoji: '🏋️', pointsPerRep: 8, instructions: 'Baja flexionando rodillas a 90°' },
    { id: 'high_knees', name: 'Rodillas Altas', emoji: '🏃', pointsPerRep: 4, instructions: 'Eleva rodillas alternando rápido' }
];

// Helper to get keypoint by name
const getKeypoint = (keypoints: Keypoint[], name: string): Keypoint | undefined => {
    return keypoints.find(kp => kp.name === name);
};

// Calculate angle between three points
const calculateAngle = (a: Keypoint, b: Keypoint, c: Keypoint): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
};

export const ExerciseGate: React.FC<ExerciseGateProps> = ({
    onComplete,
    onCancel,
    requiredPoints = 50,
    blockedApp = 'TikTok'
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
    const animationRef = useRef<number>();

    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [modelLoading, setModelLoading] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<Exercise>(EXERCISES[0]);
    const [isTracking, setIsTracking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [repCount, setRepCount] = useState(0);
    const [currentPoints, setCurrentPoints] = useState(0);
    const [phase, setPhase] = useState<'select' | 'countdown' | 'exercise' | 'complete'>('select');
    const [countdown, setCountdown] = useState(3);
    const [feedback, setFeedback] = useState<string>('');
    const [poseState, setPoseState] = useState<'up' | 'down' | 'neutral'>('neutral');
    const [debugInfo, setDebugInfo] = useState<string>('');

    // Initialize pose detection model
    const initModel = useCallback(async () => {
        setModelLoading(true);
        try {
            const model = poseDetection.SupportedModels.MoveNet;
            const detectorConfig: poseDetection.MoveNetModelConfig = {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                enableSmoothing: true,
            };
            detectorRef.current = await poseDetection.createDetector(model, detectorConfig);
            setModelReady(true);
            setModelLoading(false);
        } catch (err) {
            console.error('Error loading pose model:', err);
            setCameraError('Error cargando el modelo de detección. Intenta recargar.');
            setModelLoading(false);
        }
    }, []);

    // Initialize camera
    const initCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setCameraReady(true);
                };
            }
        } catch (err) {
            setCameraError('No se pudo acceder a la cámara. Verifica los permisos.');
        }
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (detectorRef.current) {
                detectorRef.current.dispose();
            }
        };
    }, []);

    // Countdown timer
    useEffect(() => {
        if (phase === 'countdown' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (phase === 'countdown' && countdown === 0) {
            setPhase('exercise');
            setIsTracking(true);
        }
    }, [phase, countdown]);

    // Pose detection and exercise counting
    useEffect(() => {
        if (!isTracking || !cameraReady || !modelReady || isPaused) return;

        const detectPose = async () => {
            if (!videoRef.current || !detectorRef.current || !canvasRef.current) {
                animationRef.current = requestAnimationFrame(detectPose);
                return;
            }

            try {
                const poses = await detectorRef.current.estimatePoses(videoRef.current);

                if (poses.length > 0 && poses[0].keypoints) {
                    const keypoints = poses[0].keypoints;

                    // Draw skeleton on canvas
                    drawSkeleton(keypoints);

                    // Detect exercise based on type
                    detectExercise(keypoints);
                }
            } catch (err) {
                console.error('Pose detection error:', err);
            }

            animationRef.current = requestAnimationFrame(detectPose);
        };

        animationRef.current = requestAnimationFrame(detectPose);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isTracking, cameraReady, modelReady, isPaused, selectedExercise, poseState]);

    // Draw skeleton on canvas
    const drawSkeleton = (keypoints: Keypoint[]) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !videoRef.current) return;

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw keypoints
        keypoints.forEach(kp => {
            if (kp.score && kp.score > 0.3) {
                ctx.beginPath();
                ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = '#00ff88';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });

        // Draw connections
        const connections = [
            ['left_shoulder', 'right_shoulder'],
            ['left_shoulder', 'left_elbow'],
            ['left_elbow', 'left_wrist'],
            ['right_shoulder', 'right_elbow'],
            ['right_elbow', 'right_wrist'],
            ['left_shoulder', 'left_hip'],
            ['right_shoulder', 'right_hip'],
            ['left_hip', 'right_hip'],
            ['left_hip', 'left_knee'],
            ['left_knee', 'left_ankle'],
            ['right_hip', 'right_knee'],
            ['right_knee', 'right_ankle'],
        ];

        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        connections.forEach(([start, end]) => {
            const startKp = getKeypoint(keypoints, start);
            const endKp = getKeypoint(keypoints, end);
            if (startKp && endKp && startKp.score && endKp.score && startKp.score > 0.3 && endKp.score > 0.3) {
                ctx.beginPath();
                ctx.moveTo(startKp.x, startKp.y);
                ctx.lineTo(endKp.x, endKp.y);
                ctx.stroke();
            }
        });
    };

    // Exercise detection logic
    const detectExercise = (keypoints: Keypoint[]) => {
        switch (selectedExercise.id) {
            case 'jumping_jacks':
                detectJumpingJacks(keypoints);
                break;
            case 'squats':
                detectSquats(keypoints);
                break;
            case 'high_knees':
                detectHighKnees(keypoints);
                break;
        }
    };

    // Jumping Jacks detection
    const detectJumpingJacks = (keypoints: Keypoint[]) => {
        const leftWrist = getKeypoint(keypoints, 'left_wrist');
        const rightWrist = getKeypoint(keypoints, 'right_wrist');
        const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
        const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
        const leftAnkle = getKeypoint(keypoints, 'left_ankle');
        const rightAnkle = getKeypoint(keypoints, 'right_ankle');

        if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder || !leftAnkle || !rightAnkle) return;

        // Check if arms are up (wrists above shoulders)
        const armsUp = leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;

        // Check if legs are apart (ankle distance)
        const legDistance = Math.abs(leftAnkle.x - rightAnkle.x);
        const shoulderDistance = Math.abs(leftShoulder.x - rightShoulder.x);
        const legsApart = legDistance > shoulderDistance * 1.3;

        const isJumpingJackUp = armsUp && legsApart;

        setDebugInfo(`Arms: ${armsUp ? '↑' : '↓'} Legs: ${legsApart ? 'apart' : 'together'}`);

        if (isJumpingJackUp && poseState !== 'up') {
            setPoseState('up');
        } else if (!isJumpingJackUp && poseState === 'up') {
            // Complete rep when returning to neutral
            setPoseState('down');
            countRep();
        }
    };

    // Squat detection
    const detectSquats = (keypoints: Keypoint[]) => {
        const leftHip = getKeypoint(keypoints, 'left_hip');
        const leftKnee = getKeypoint(keypoints, 'left_knee');
        const leftAnkle = getKeypoint(keypoints, 'left_ankle');
        const rightHip = getKeypoint(keypoints, 'right_hip');
        const rightKnee = getKeypoint(keypoints, 'right_knee');
        const rightAnkle = getKeypoint(keypoints, 'right_ankle');

        if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) return;

        // Calculate knee angles
        const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
        const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
        const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

        setDebugInfo(`Knee angle: ${Math.round(avgKneeAngle)}°`);

        // Squat down: knee angle < 120°
        // Standing: knee angle > 160°
        if (avgKneeAngle < 120 && poseState !== 'down') {
            setPoseState('down');
            setFeedback('¡Abajo!');
            setTimeout(() => setFeedback(''), 500);
        } else if (avgKneeAngle > 160 && poseState === 'down') {
            setPoseState('up');
            countRep();
        }
    };

    // High Knees detection
    const detectHighKnees = (keypoints: Keypoint[]) => {
        const leftHip = getKeypoint(keypoints, 'left_hip');
        const leftKnee = getKeypoint(keypoints, 'left_knee');
        const rightHip = getKeypoint(keypoints, 'right_hip');
        const rightKnee = getKeypoint(keypoints, 'right_knee');

        if (!leftHip || !leftKnee || !rightHip || !rightKnee) return;

        // Check if knee is raised above hip level
        const leftKneeHigh = leftKnee.y < leftHip.y;
        const rightKneeHigh = rightKnee.y < rightHip.y;

        setDebugInfo(`L: ${leftKneeHigh ? '↑' : '↓'} R: ${rightKneeHigh ? '↑' : '↓'}`);

        if ((leftKneeHigh || rightKneeHigh) && poseState !== 'up') {
            setPoseState('up');
        } else if (!leftKneeHigh && !rightKneeHigh && poseState === 'up') {
            setPoseState('down');
            countRep();
        }
    };

    // Count repetition
    const countRep = () => {
        setRepCount(prev => prev + 1);
        const earned = selectedExercise.pointsPerRep;
        setCurrentPoints(prev => {
            const newPoints = prev + earned;
            if (newPoints >= requiredPoints) {
                setIsTracking(false);
                setPhase('complete');
            }
            return newPoints;
        });
        setFeedback(`¡Bien! +${earned} pts`);
        setTimeout(() => setFeedback(''), 1000);
    };

    const startExercise = async () => {
        await initModel();
        await initCamera();
        setPhase('countdown');
        setCountdown(3);
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    const resetExercise = () => {
        setRepCount(0);
        setCurrentPoints(0);
        setPhase('select');
        setIsTracking(false);
        setIsPaused(false);
        setPoseState('neutral');
    };

    const handleComplete = () => {
        onComplete(currentPoints);
    };

    const progress = Math.min((currentPoints / requiredPoints) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-[#050508]" />
            <div className="absolute inset-0 bg-gradient-to-b from-violet-600/20 via-transparent to-cyan-600/20" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md mx-auto p-6 h-full flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-white">Exercise Gate</h1>
                        <p className="text-white/50 text-sm">Gana puntos con ejercicio para desbloquear</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onCancel}
                        className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
                    >
                        <X size={20} className="text-white/70" />
                    </motion.button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/60 text-sm">Progreso</span>
                        <span className="text-white font-bold">{currentPoints}/{requiredPoints} pts</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: 'spring', bounce: 0.3 }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* SELECT PHASE */}
                    {phase === 'select' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex-1 flex flex-col"
                        >
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full border border-red-500/30 mb-4">
                                    <AlertCircle size={16} className="text-red-400" />
                                    <span className="text-red-300 text-sm font-medium">Quieres abrir {blockedApp}</span>
                                </div>
                                <p className="text-white/60 text-sm">
                                    Para abrir {blockedApp}, gana <span className="text-white font-bold">{requiredPoints} puntos</span> haciendo ejercicio
                                </p>
                            </div>

                            <h3 className="text-white font-bold mb-3">Elige tu ejercicio:</h3>
                            <div className="space-y-3 mb-6">
                                {EXERCISES.map(exercise => (
                                    <motion.button
                                        key={exercise.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedExercise(exercise)}
                                        className={`w-full p-4 rounded-2xl border text-left transition-all ${selectedExercise.id === exercise.id
                                            ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-violet-500/50'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-3xl">{exercise.emoji}</span>
                                            <div className="flex-1">
                                                <div className="text-white font-bold">{exercise.name}</div>
                                                <div className="text-white/50 text-xs">{exercise.instructions}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-violet-400 font-bold">+{exercise.pointsPerRep}</div>
                                                <div className="text-white/40 text-xs">por rep</div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={startExercise}
                                disabled={modelLoading}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {modelLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Cargando IA...
                                    </>
                                ) : (
                                    <>
                                        <Camera size={20} />
                                        Iniciar con Cámara
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    )}

                    {/* COUNTDOWN PHASE */}
                    {phase === 'countdown' && (
                        <motion.div
                            key="countdown"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex-1 flex flex-col items-center justify-center"
                        >
                            {modelLoading ? (
                                <>
                                    <Loader2 size={64} className="text-violet-400 animate-spin mb-4" />
                                    <p className="text-white/60 text-lg">Cargando modelo de IA...</p>
                                </>
                            ) : (
                                <>
                                    <motion.div
                                        key={countdown}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-8xl font-black text-white mb-4"
                                    >
                                        {countdown}
                                    </motion.div>
                                    <p className="text-white/60 text-lg">¡Prepárate!</p>
                                    <div className="mt-4 text-center">
                                        <span className="text-4xl">{selectedExercise.emoji}</span>
                                        <p className="text-white font-bold mt-2">{selectedExercise.name}</p>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* EXERCISE PHASE */}
                    {phase === 'exercise' && (
                        <motion.div
                            key="exercise"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col"
                        >
                            {/* Camera View */}
                            <div className="relative rounded-3xl overflow-hidden bg-black/50 mb-4 flex-1 min-h-[300px]">
                                {cameraError ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center p-6">
                                            <AlertCircle size={48} className="text-red-400 mx-auto mb-3" />
                                            <p className="text-white/70">{cameraError}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <video
                                            ref={videoRef}
                                            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                                            playsInline
                                            muted
                                        />
                                        <canvas
                                            ref={canvasRef}
                                            className="absolute inset-0 w-full h-full scale-x-[-1]"
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 border-4 border-violet-500/30 rounded-3xl pointer-events-none" />

                                        {/* Rep Counter */}
                                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl">
                                            <div className="text-white/60 text-xs">Repeticiones</div>
                                            <div className="text-3xl font-black text-white">{repCount}</div>
                                        </div>

                                        {/* Debug Info */}
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                                            <div className="text-[10px] text-cyan-400 font-mono">{debugInfo}</div>
                                        </div>

                                        {/* Pause Indicator */}
                                        {isPaused && (
                                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                                <div className="text-white text-2xl font-bold">⏸️ PAUSADO</div>
                                            </div>
                                        )}

                                        {/* Feedback */}
                                        <AnimatePresence>
                                            {feedback && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 rounded-2xl"
                                                >
                                                    <span className="text-white font-bold text-xl">{feedback}</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={togglePause}
                                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${!isPaused
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        }`}
                                >
                                    {!isPaused ? <Pause size={18} /> : <Play size={18} />}
                                    {!isPaused ? 'Pausar' : 'Continuar'}
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={resetExercise}
                                    className="py-3 px-4 rounded-xl bg-white/10 text-white/70"
                                >
                                    <RotateCcw size={18} />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* COMPLETE PHASE */}
                    {phase === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', bounce: 0.5 }}
                                className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30"
                            >
                                <Trophy size={48} className="text-white" />
                            </motion.div>

                            <h2 className="text-3xl font-black text-white mb-2">¡Completado!</h2>
                            <p className="text-white/60 mb-6">Ganaste {currentPoints} puntos con {repCount} repeticiones</p>

                            <div className="bg-white/5 rounded-2xl p-4 mb-6 w-full">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-violet-400">{repCount}</div>
                                        <div className="text-white/50 text-xs">Reps</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-fuchsia-400">{currentPoints}</div>
                                        <div className="text-white/50 text-xs">Puntos</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-cyan-400">{selectedExercise.emoji}</div>
                                        <div className="text-white/50 text-xs">{selectedExercise.name}</div>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleComplete}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                            >
                                <Check size={20} />
                                Desbloquear {blockedApp}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default ExerciseGate;
