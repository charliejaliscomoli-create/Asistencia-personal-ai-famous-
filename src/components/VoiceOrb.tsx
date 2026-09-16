import React from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { AssistantState } from '../types';

interface VoiceOrbProps {
  state: AssistantState;
  onToggleListening: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  state,
  onToggleListening,
  isListening,
  isSpeaking,
  onStopSpeaking,
  isMuted,
  onToggleMute,
}) => {
  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'Escuchando tu voz...';
      case 'thinking':
        return 'Procesando y ejecutando función...';
      case 'speaking':
        return 'Hablando...';
      default:
        return 'Toca el micrófono o presiona Espacio para hablar';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 select-none" id="voice-orb-container">
      {/* Outer Glow & Ambient Rings */}
      <div className="relative flex items-center justify-center w-52 h-52 sm:w-60 sm:h-60">
        {/* State: Listening Ripple Effect */}
        {state === 'listening' && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-500/20"
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-teal-500/25"
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, ease: 'easeOut' }}
            />
          </>
        )}

        {/* State: Thinking Orbital Ring */}
        {state === 'thinking' && (
          <motion.div
            className="absolute -inset-4 rounded-full border-2 border-dashed border-sky-400/60"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          />
        )}

        {/* State: Speaking Waves */}
        {state === 'speaking' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-indigo-500/15"
            animate={{ scale: [1, 1.22, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          />
        )}

        {/* Main Central Tactile Orb Button */}
        <motion.button
          id="main-voice-orb-btn"
          onClick={onToggleListening}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          className={`relative z-10 w-40 h-40 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center shadow-xl transition-colors duration-300 focus:outline-none cursor-pointer border ${
            state === 'listening'
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30 border-emerald-300'
              : state === 'thinking'
              ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-sky-500/30 border-sky-300'
              : state === 'speaking'
              ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 border-indigo-300'
              : 'bg-gradient-to-tr from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 shadow-slate-900/20 border-slate-700'
          }`}
          title={isListening ? 'Detener escucha' : 'Hablar con el asistente'}
        >
          {state === 'listening' ? (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="flex flex-col items-center gap-2"
            >
              <Mic className="w-12 h-12 text-white" />
              <div className="flex gap-1 items-end h-5">
                <span className="w-1 bg-white rounded-full animate-bounce" style={{ height: '14px', animationDelay: '0ms' }}></span>
                <span className="w-1 bg-white rounded-full animate-bounce" style={{ height: '22px', animationDelay: '150ms' }}></span>
                <span className="w-1 bg-white rounded-full animate-bounce" style={{ height: '18px', animationDelay: '300ms' }}></span>
                <span className="w-1 bg-white rounded-full animate-bounce" style={{ height: '24px', animationDelay: '450ms' }}></span>
                <span className="w-1 bg-white rounded-full animate-bounce" style={{ height: '12px', animationDelay: '200ms' }}></span>
              </div>
            </motion.div>
          ) : state === 'thinking' ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-12 h-12 animate-spin text-white" />
              <span className="text-xs font-medium tracking-wide text-sky-100">PROCESANDO</span>
            </div>
          ) : state === 'speaking' ? (
            <div className="flex flex-col items-center gap-2">
              <Volume2 className="w-12 h-12 text-white animate-pulse" />
              <div className="flex gap-1 items-end h-4">
                <span className="w-1 bg-white/90 rounded-full animate-pulse" style={{ height: '10px' }}></span>
                <span className="w-1 bg-white/90 rounded-full animate-pulse" style={{ height: '18px' }}></span>
                <span className="w-1 bg-white/90 rounded-full animate-pulse" style={{ height: '14px' }}></span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs font-medium tracking-wider text-slate-300">HABLAR</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Dynamic Status Text */}
      <div className="mt-5 text-center flex flex-col items-center gap-1">
        <p className="text-base font-semibold text-slate-800">
          {getStatusText()}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Modelo Gemini Flash con llamadas a funciones activas</span>
        </div>
      </div>

      {/* Auxiliary Controls (Mute / Stop audio) */}
      <div className="flex items-center gap-3 mt-4">
        {isSpeaking && (
          <button
            id="btn-stop-speaking"
            onClick={(e) => {
              e.stopPropagation();
              onStopSpeaking();
            }}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center gap-1 border border-red-200"
          >
            <MicOff className="w-3.5 h-3.5" />
            Detener audio
          </button>
        )}
        <button
          id="btn-toggle-mute"
          onClick={onToggleMute}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 border ${
            isMuted
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
          }`}
          title={isMuted ? 'Activar voz' : 'Silenciar voz'}
        >
          <Volume2 className="w-3.5 h-3.5" />
          {isMuted ? 'Voz silenciada' : 'Voz activada'}
        </button>
      </div>
    </div>
  );
};
