import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface UseVoiceAIProps {
    apiKey: string;
    onTranscript?: (text: string) => void;
    onAIResponse?: (text: string) => void;
}

export function useVoiceAI({ apiKey, onTranscript, onAIResponse }: UseVoiceAIProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        // Initialize Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'es-ES';

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                const fullTranscript = finalTranscript || interimTranscript;
                setTranscript(fullTranscript);

                if (finalTranscript && onTranscript) {
                    onTranscript(finalTranscript);
                    // Auto-send to AI when user stops speaking
                    handleSendToAI(finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setError(`Error de reconocimiento: ${event.error}`);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                // Restart if still in listening mode
                if (isListening) {
                    recognitionRef.current?.start();
                }
            };
        } else {
            setError('Tu navegador no soporta reconocimiento de voz');
        }

        synthRef.current = window.speechSynthesis;

        return () => {
            recognitionRef.current?.stop();
            synthRef.current?.cancel();
        };
    }, []);

    const handleSendToAI = useCallback(async (text: string) => {
        if (!apiKey || !text.trim()) return;

        try {
            const ai = new GoogleGenAI({ apiKey });
            const result = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: [{ role: 'user', parts: [{ text }] }]
            });

            const responseText = result.text || 'Lo siento, no pude procesar eso.';

            if (onAIResponse) {
                onAIResponse(responseText);
            }

            // Speak the response
            speakText(responseText);
        } catch (err) {
            console.error('AI error:', err);
            setError('Error al comunicarse con la IA');
        }
    }, [apiKey, onAIResponse]);

    const speakText = useCallback((text: string) => {
        if (!synthRef.current) return;

        synthRef.current.cancel(); // Cancel any ongoing speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthRef.current.speak(utterance);
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setError(null);
            setTranscript('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    const stopSpeaking = useCallback(() => {
        synthRef.current?.cancel();
        setIsSpeaking(false);
    }, []);

    return {
        isListening,
        isSpeaking,
        transcript,
        error,
        startListening,
        stopListening,
        toggleListening,
        stopSpeaking,
        speakText
    };
}
