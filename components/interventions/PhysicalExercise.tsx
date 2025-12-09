import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Zap, Check, AlertCircle, Loader2, Trophy, RotateCcw, Play, Pause } from 'lucide-react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl'; // Explicit backend import

interface PhysicalExerciseProps {
    onComplete: (completed: boolean) => void;
}

interface Keypoint {
    x: number;
    y: number;
    score?: number;
    name?: string;
}

type ExerciseType = 'jumping_jacks' | 'squats';

interface Exercise {
    id: ExerciseType;
    name: string;
    emoji: string;
    instructions: string;
}

const EXERCISES: Exercise[] = [
    { id: 'jumping_jacks', name: 'Jumping Jacks', emoji: '⭐', instructions: 'Salta abriendo brazos y piernas' },
    { id: 'squats', name: 'Sentadillas', emoji: '🏋️', instructions: 'Baja flexionando rodillas a 90°' }
];

const getKeypoint = (keypoints: Keypoint[], name: string): Keypoint | undefined => {
    return keypoints.find(kp => kp.name === name);
};

const calculateAngle = (a: Keypoint, b: Keypoint, c: Keypoint): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
};

const PhysicalExercise: React.FC<PhysicalExerciseProps> = ({ onComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
    const animationRef = useRef<number>();

    const [exerciseCount, setExerciseCount] = useState(0);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

    // AI State
    const [cameraReady, setCameraReady] = useState(false);
    const [modelLoading, setModelLoading] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // Fallback State
    const [useManualMode, setUseManualMode] = useState(false);

    // Flow State
    const [isTracking, setIsTracking] = useState(false);
    const [phase, setPhase] = useState<'select' | 'countdown' | 'exercise' | 'complete'>('select');
    const [countdown, setCountdown] = useState(3);
    const [feedback, setFeedback] = useState<string>('');
    const [poseState, setPoseState] = useState<'up' | 'down' | 'neutral'>('neutral');

    const TARGET = 10;

    // Initialize pose detection model
    const initModel = useCallback(async () => {
        if (useManualMode) return;
        setModelLoading(true);
        try {
            await tf.setBackend('webgl').catch(() => console.warn('WebGL backend init failed, falling back to cpu'));
            await tf.ready();

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
            setCameraError('Error cargando IA. (GPU/Red)');
            setModelLoading(false);
        }
    }, [useManualMode]);

    // Initialize camera
    const initCamera = useCallback(async () => {
        if (useManualMode) return;
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
            setCameraError('Permiso de cámara denegado.');
        }
    }, [useManualMode]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
            if (detectorRef.current) {
                detectorRef.current.dispose();
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    const startSession = async (ex: Exercise) => {
        setSelectedExercise(ex);
        if (useManualMode) {
            setPhase('exercise');
            return;
        }
        await initModel();
        await initCamera();
        setPhase('countdown');
        setCountdown(3);
    };

    // Countdown logic
    useEffect(() => {
        if (phase === 'countdown' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (phase === 'countdown' && countdown === 0) {
            setPhase('exercise');
            setIsTracking(true);
        }
    }, [phase, countdown]);

    // Manual Count Logic
    const handleManualCount = () => {
        setExerciseCount(c => {
            const next = c + 1;
            if (next >= TARGET) {
                setPhase('complete');
            }
            return next;
        });
    }

    // Recognition Loop
    useEffect(() => {
        if (!isTracking || !cameraReady || !modelReady || !selectedExercise || useManualMode) return;

        const detectPose = async () => {
            if (!videoRef.current || !detectorRef.current || !canvasRef.current) {
                animationRef.current = requestAnimationFrame(detectPose);
                return;
            }

            try {
                const poses = await detectorRef.current.estimatePoses(videoRef.current);
                if (poses.length > 0 && poses[0].keypoints) {
                    const keypoints = poses[0].keypoints;
                    drawSkeleton(keypoints);

                    if (selectedExercise.id === 'jumping_jacks') detectJumpingJacks(keypoints);
                    if (selectedExercise.id === 'squats') detectSquats(keypoints);
                }
            } catch (err) {
                console.error(err);
            }
            animationRef.current = requestAnimationFrame(detectPose);
        };

        animationRef.current = requestAnimationFrame(detectPose);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        }
    }, [isTracking, cameraReady, modelReady, selectedExercise, poseState, useManualMode]);

    // Drawing
    const drawSkeleton = (keypoints: Keypoint[]) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !videoRef.current) return;

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const connections = [
            ['left_shoulder', 'right_shoulder'], ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
            ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'], ['left_shoulder', 'left_hip'],
            ['right_shoulder', 'right_hip'], ['left_hip', 'right_hip'], ['left_hip', 'left_knee'],
            ['left_knee', 'left_ankle'], ['right_hip', 'right_knee'], ['right_knee', 'right_ankle']
        ];

        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3;

        connections.forEach(([start, end]) => {
            const kp1 = getKeypoint(keypoints, start);
            const kp2 = getKeypoint(keypoints, end);
            if (kp1 && kp2 && (kp1.score || 0) > 0.3 && (kp2.score || 0) > 0.3) {
                ctx.beginPath();
                ctx.moveTo(kp1.x, kp1.y);
                ctx.lineTo(kp2.x, kp2.y);
                ctx.stroke();
            }
        });

        keypoints.forEach(kp => {
            if ((kp.score || 0) > 0.3) {
                ctx.beginPath();
                ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }
        });
    }

    const countRep = () => {
        setExerciseCount(c => {
            const next = c + 1;
            if (next >= TARGET) {
                setIsTracking(false);
                setPhase('complete');
            }
            return next;
        });
        setFeedback("¡Bien! +1");
        setTimeout(() => setFeedback(""), 800);
    }

    const detectJumpingJacks = (keypoints: Keypoint[]) => {
        const leftWrist = getKeypoint(keypoints, 'left_wrist');
        const rightWrist = getKeypoint(keypoints, 'right_wrist');
        const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
        const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
        const leftAnkle = getKeypoint(keypoints, 'left_ankle');
        const rightAnkle = getKeypoint(keypoints, 'right_ankle');

        if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder || !leftAnkle || !rightAnkle) return;

        const armsUp = leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;
        const legDist = Math.abs(leftAnkle.x - rightAnkle.x);
        const shoulderDist = Math.abs(leftShoulder.x - rightShoulder.x);
        const legsApart = legDist > shoulderDist * 1.3;

        if (armsUp && legsApart && poseState !== 'up') {
            setPoseState('up');
        } else if ((!armsUp || !legsApart) && poseState === 'up') {
            setPoseState('down');
            countRep();
        }
    }

    const detectSquats = (keypoints: Keypoint[]) => {
        const leftHip = getKeypoint(keypoints, 'left_hip');
        const leftKnee = getKeypoint(keypoints, 'left_knee');
        const leftAnkle = getKeypoint(keypoints, 'left_ankle');
        const rightHip = getKeypoint(keypoints, 'right_hip');
        const rightKnee = getKeypoint(keypoints, 'right_knee');
        const rightAnkle = getKeypoint(keypoints, 'right_ankle');

        if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) return;

        const avg = (calculateAngle(leftHip, leftKnee, leftAnkle) + calculateAngle(rightHip, rightKnee, rightAnkle)) / 2;

        if (avg < 120 && poseState !== 'down') {
            setPoseState('down');
            setFeedback("¡Abajo!");
        } else if (avg > 160 && poseState === 'down') {
            setPoseState('up');
            countRep();
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center z-50 p-4"
        >
            <AnimatePresence mode="wait">
                {/* 1. SELECTION SCREEN */}
                {phase === 'select' && (
                    <motion.div
                        key="select"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-md w-full text-center"
                    >
                        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Zap size={40} className="text-purple-400" fill="currentColor" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Recarga de Energía</h2>
                        <p className="text-white/60 mb-8">
                            {useManualMode ? 'Modo Manual: Haz click para contar.' : 'Usa tu cámara. La IA contará por ti.'}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {EXERCISES.map(ex => (
                                <button
                                    key={ex.id}
                                    onClick={() => startSession(ex)}
                                    disabled={modelLoading && !useManualMode}
                                    className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all flex flex-col items-center gap-3 hover:scale-105"
                                >
                                    <span className="text-4xl">{ex.emoji}</span>
                                    <span className="font-bold text-white">{ex.name}</span>
                                </button>
                            ))}
                        </div>

                        {!useManualMode && (
                            <button
                                onClick={() => setUseManualMode(true)}
                                className="block w-full py-2 text-white/50 text-sm hover:text-white mb-4 underline decoration-dashed"
                            >
                                Cambiar a modo manual (sin cámara)
                            </button>
                        )}

                        {modelLoading && !useManualMode && (
                            <div className="flex items-center justify-center gap-2 text-purple-400">
                                <Loader2 size={20} className="animate-spin" />
                                <span>Cargando Motor de IA...</span>
                            </div>
                        )}

                        <button onClick={() => onComplete(false)} className="text-white/40 text-sm mt-2 hover:text-white">
                            No puedo ahora (saltar)
                        </button>
                    </motion.div>
                )}

                {/* 2. COUNTDOWN */}
                {phase === 'countdown' && (
                    <motion.div
                        key="cnt"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="text-white text-center"
                    >
                        <div className="text-9xl font-black mb-4">{countdown}</div>
                        <p className="text-2xl opacity-80">¡Prepárate!</p>
                    </motion.div>
                )}

                {/* 3. EXERCISE VIEW (CAMERA OR MANUAL) */}
                {phase === 'exercise' && (
                    <motion.div
                        key="cam"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative w-full max-w-lg aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col"
                    >
                        {/* Header Overlay */}
                        <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur px-4 py-2 rounded-xl text-white">
                            <div className="text-xs opacity-70">Repeticiones</div>
                            <div className="text-3xl font-bold">{exerciseCount}/{TARGET}</div>
                        </div>

                        {useManualMode ? (
                            <div className="flex-1 flex flex-col items-center justify-center bg-slate-900">
                                <motion.div
                                    key={exerciseCount}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="text-8xl mb-8"
                                >
                                    {selectedExercise?.emoji}
                                </motion.div>
                                <p className="text-white/60 mb-8 px-8 text-center">{selectedExercise?.instructions}</p>
                                <button
                                    onClick={handleManualCount}
                                    className="w-48 h-48 rounded-full bg-purple-600 hover:bg-purple-500 border-4 border-purple-400 flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                >
                                    <div className="text-center">
                                        <div className="text-4xl font-black text-white">+1</div>
                                        <div className="text-sm text-purple-200">REPETICIÓN</div>
                                    </div>
                                </button>
                            </div>
                        ) : cameraError ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-red-400 p-6 text-center bg-slate-900">
                                <AlertCircle size={48} className="mb-4" />
                                <p className="mb-6">{cameraError}</p>
                                <button
                                    onClick={() => setUseManualMode(true)}
                                    className="bg-white/10 text-white px-6 py-3 rounded-xl border border-white/20 hover:bg-white/20 flex items-center gap-2"
                                >
                                    <Play size={18} />
                                    Usar Modo Manual
                                </button>
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                                    playsInline
                                    muted
                                    autoPlay
                                />
                                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full scale-x-[-1]" />

                                {/* Emergency Manual Toggle - Always Visible */}
                                <button
                                    onClick={() => setUseManualMode(true)}
                                    className="absolute bottom-4 right-4 z-30 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg text-xs backdrop-blur flex items-center gap-2 transition-all"
                                >
                                    <RotateCcw size={14} />
                                    ¿Problemas de cámara? Modo Manual
                                </button>

                                {feedback && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="absolute bottom-20 left-0 right-0 text-center"
                                    >
                                        <span className="bg-purple-600 text-white font-bold px-6 py-2 rounded-full text-xl shadow-lg">
                                            {feedback}
                                        </span>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}

                {/* 4. COMPLETE */}
                {phase === 'complete' && (
                    <motion.div
                        key="done"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center text-white"
                    >
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
                            <Check size={48} className="text-white" />
                        </div>
                        <h2 className="text-4xl font-black mb-4">¡Excelente Trabajo!</h2>
                        <p className="text-lg opacity-80 mb-8">Has reactivado tu cuerpo y mente.</p>

                        <button
                            onClick={() => onComplete(true)}
                            className="bg-white text-green-600 px-8 py-4 rounded-full font-bold text-xl hover:scale-105 transition-transform"
                        >
                            Volver al Foco
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PhysicalExercise;
