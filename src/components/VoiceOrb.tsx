import React from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { AssistantState } from '../types';

interface VoiceOrbProps {
  state: AssistantState;
  onToggleListening: () => void;
  disabled?: boolean;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  state,
  onToggleListening,
  disabled = false,
}) => {
  const getOrbStyles = () => {
    switch (state) {
      case 'listening':
        return {
          container: 'bg-indigo-600 ring-8 ring-indigo-200 shadow-xl shadow-indigo-300 scale-105',
          pulse: 'bg-indigo-400 opacity-60 animate-ping',
          label: 'Escuchando tu voz...',
          sublabel: 'Toca para pausar',
        };
      case 'thinking':
        return {
          container: 'bg-amber-500 ring-8 ring-amber-100 shadow-xl shadow-amber-200',
          pulse: 'bg-amber-300 opacity-50 animate-pulse',
          label: 'Procesando con IA...',
          sublabel: 'Un momento por favor',
        };
      case 'speaking':
        return {
          container: 'bg-emerald-600 ring-8 ring-emerald-100 shadow-xl shadow-emerald-200',
          pulse: 'bg-emerald-400 opacity-50 animate-bounce',
          label: 'Hablando...',
          sublabel: 'Toca para interrumpir',
        };
      case 'idle':
      default:
        return {
          container: 'bg-slate-900 hover:bg-indigo-600 ring-4 ring-slate-200/80 shadow-lg shadow-slate-300 hover:shadow-indigo-200',
          pulse: '',
          label: 'Toca para hablar',
          sublabel: 'Di: "Pon una alarma", "Agrega una nota"',
        };
    }
  };

  const style = getOrbStyles();

  return (
    <div className="flex flex-col items-center justify-center py-4 select-none">
      <div className="relative flex items-center justify-center">
        {/* Animated Background Ring */}
        {state !== 'idle' && (
          <div
            className={`absolute w-32 h-32 rounded-full ${style.pulse} pointer-events-none`}
          />
        )}

        {/* Central Orb Button */}
        <button
          type="button"
          id="btn-voice-orb"
          onClick={onToggleListening}
          disabled={disabled}
          className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 cursor-pointer ${style.container} ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label={style.label}
        >
          {state === 'listening' && <Mic className="w-9 h-9 animate-pulse" />}
          {state === 'thinking' && <Loader2 className="w-9 h-9 animate-spin" />}
          {state === 'speaking' && <Volume2 className="w-9 h-9 animate-pulse" />}
          {state === 'idle' && <Mic className="w-9 h-9" />}
        </button>
      </div>

      {/* Dynamic Status Text */}
      <div className="mt-3 text-center">
        <p className="text-sm font-bold text-slate-800 tracking-tight">{style.label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{style.sublabel}</p>
      </div>
    </div>
  );
};
