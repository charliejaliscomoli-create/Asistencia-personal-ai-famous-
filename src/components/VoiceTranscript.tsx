import React from 'react';
import { Mic, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage, AssistantState } from '../types';

interface VoiceTranscriptProps {
  messages: ChatMessage[];
  currentTranscript: string;
  assistantState: AssistantState;
}

export const VoiceTranscript: React.FC<VoiceTranscriptProps> = ({
  messages,
  currentTranscript,
  assistantState,
}) => {
  // Show only the last 3-4 messages to keep the view focused and concise
  const displayMessages = messages.slice(-4);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Conversación por Voz
        </span>
        <span className="text-[11px] text-slate-400 font-medium">
          {assistantState === 'listening'
            ? 'Escuchando en vivo...'
            : assistantState === 'thinking'
            ? 'Pensando...'
            : 'Listo'}
        </span>
      </div>

      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
        {displayMessages.length === 0 && !currentTranscript && (
          <div className="text-center py-4 text-xs text-slate-400">
            Presiona el micrófono y di una instrucción como:
            <span className="block text-indigo-600 font-medium mt-1">
              "Pon una alarma a las 7:00 am con etiqueta Gimnasio"
            </span>
          </div>
        )}

        {displayMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 text-xs ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
            </div>
            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {/* Live realtime speech preview */}
        {currentTranscript && (
          <div className="flex items-start gap-2 text-xs justify-end">
            <div className="max-w-[85%] rounded-xl px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-900 italic rounded-tr-none flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>{currentTranscript}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
