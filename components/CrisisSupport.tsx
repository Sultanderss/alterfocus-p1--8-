import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Brain, Sparkles, MapPin } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface CrisisSupportProps {
  onBack: () => void;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  grounding?: any;
}

const CrisisSupport: React.FC<CrisisSupportProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hola. Soy tu Copiloto de Enfoque. ¿En qué puedo ayudarte hoy? Puedo ayudarte a organizar tus tareas, escuchar si estás frustrado, o buscar lugares tranquilos para estudiar cerca de ti.", isUser: false }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim()) return;

    const newMsg: Message = { id: Date.now(), text: textToSend, isUser: true };
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Detect intent for location-based queries to switch models
      const lowerText = textToSend.toLowerCase();
      const isLocationQuery = lowerText.match(/dónde|donde|mapa|ubicación|lugar|cerca|restaurante|biblioteca|parque|café|estudiar/);

      let model = 'gemini-3-pro-preview';
      let config: any = {
        thinkingConfig: { thinkingBudget: 32768 }
      };

      // Configure for Maps Grounding if location intent is detected
      if (isLocationQuery) {
        model = 'gemini-2.5-flash';
        config = {
          tools: [{ googleMaps: {} }],
        };

        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          if (pos) {
            config.toolConfig = {
              retrievalConfig: {
                latLng: {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude
                }
              }
            };
          }
        } catch (e) {
          console.warn("Location access denied or failed, proceeding without precise location.");
        }
      } else {
        // System instruction for the Copilot persona (only supported on some models/configs, 
        // but helpful context for the reasoning model)
        config.systemInstruction = "Eres AlterFocus, un copiloto emocional empático y científico. Ayudas a los estudiantes a enfocarse, gestionar la ansiedad y la procrastinación sin culpa. Sé breve, directo y útil.";
      }

      const response = await ai.models.generateContent({
        model,
        contents: textToSend,
        config
      });

      const replyText = response.text || "Lo siento, no pude generar una respuesta en este momento.";
      const grounding = response.candidates?.[0]?.groundingMetadata;

      const replyMsg: Message = {
        id: Date.now() + 1,
        text: replyText,
        isUser: false,
        grounding: grounding
      };

      setMessages(prev => [...prev, replyMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = { id: Date.now() + 1, text: "Lo siento, tuve un problema al conectar con mi cerebro digital. Por favor intenta de nuevo.", isUser: false };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderGrounding = (grounding: any) => {
    if (!grounding?.groundingChunks) return null;

    // Filter for chunks that have map or web URIs
    const links = grounding.groundingChunks.filter((c: any) => c.web?.uri || c.maps?.uri || c.source?.uri);

    if (links.length === 0) return null;

    return (
      <div className="mt-3 pt-2 border-t border-indigo-100/50 flex flex-col gap-2">
        <div className="text-xs font-bold text-indigo-700 flex items-center gap-1">
          <MapPin size={10} /> Fuentes y Lugares:
        </div>
        {links.map((chunk: any, i: number) => {
          // Handle Maps Grounding specific structure if available, otherwise fallback to web
          const uri = chunk.maps?.uri || chunk.web?.uri || chunk.source?.uri;
          const title = chunk.maps?.title || chunk.web?.title || chunk.source?.title || "Ver en Mapa / Web";

          if (!uri) return null;

          return (
            <a
              key={i}
              href={uri}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 underline truncate flex items-center gap-1 bg-white/50 p-1 rounded"
            >
              <ExternalLinkIcon size={10} /> {title}
            </a>
          );
        })}
      </div>
    );
  };

  // Simple external link icon component for the renderGrounding helper
  const ExternalLinkIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  );

  return (
    <motion.div
      className="absolute inset-0 bg-slate-50 z-50 flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-4 shadow-sm z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <Brain size={18} />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-800">IA Copiloto</h1>
            <div className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              En línea
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 pb-24" ref={scrollRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {!msg.isUser && (
              <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0 text-indigo-600 shadow-sm">
                <Sparkles size={14} />
              </div>
            )}
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.isUser
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
              }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {renderGrounding(msg.grounding)}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0 text-indigo-600 shadow-sm">
              <Sparkles size={14} />
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center h-10">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        <button onClick={() => handleSend("Me siento abrumado")} className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors">
          😰 Abrumado
        </button>
        <button onClick={() => handleSend("Lugares tranquilos para estudiar cerca")} className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors">
          📍 Estudiar Cerca
        </button>
        <button onClick={() => handleSend("Estoy cansado")} className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors">
          😴 Cansado
        </button>
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escribe aquí..."
          className="flex-1 bg-slate-100 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isTyping}
          className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
        >
          <Send size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default CrisisSupport;