import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, User, Sparkles, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';

interface VoiceTranscriptProps {
  currentTranscript: string;
  isListening: boolean;
  lastMessage: ChatMessage | null;
  onReplayVoice: (text: string) => void;
  isSpeaking: boolean;
  errorMessage: string | null;
}

export const VoiceTranscript: React.FC<VoiceTranscriptProps> = ({
  currentTranscript,
  isListening,
  lastMessage,
  onReplayVoice,
  isSpeaking,
  errorMessage,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2" id="voice-transcript-wrapper">
      {/* Error notification if mic or network failed */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="flex-1">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live speech recognition transcription bar */}
      <AnimatePresence>
        {isListening && currentTranscript && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl shadow-sm mb-4"
          >
            <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold tracking-wider text-emerald-700 uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Transcribiendo en vivo:
            </div>
            <p className="text-sm font-medium italic">"{currentTranscript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Latest exchange display */}
      {lastMessage && (
        <motion.div
          key={lastMessage.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 divide-y divide-slate-100"
        >
          {/* User query */}
          <div className="flex items-start gap-3 pb-3">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 mt-0.5">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Tú</span>
              <p className="text-sm text-slate-800 font-medium">{lastMessage.text}</p>
            </div>
          </div>

          {/* Assistant Voice Response */}
          <div className="flex items-start gap-3 pt-3">
            <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 text-indigo-600 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Asistente (Respuesta por voz)
                </span>
                <button
                  id="btn-replay-voice"
                  onClick={() => onReplayVoice(lastMessage.text)}
                  className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
                    isSpeaking
                      ? 'text-indigo-600 bg-indigo-50 font-medium'
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                  title="Escuchar de nuevo"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Escuchar</span>
                </button>
              </div>
              <p className="text-sm text-slate-900 font-normal leading-relaxed mt-1">
                {lastMessage.text}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
