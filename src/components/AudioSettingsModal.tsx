import React, { useEffect, useState } from 'react';
import { X, Volume2, Mic, Play, Check } from 'lucide-react';
import { speechService } from '../services/speechService';
import { soundEffects } from '../services/audioService';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  speechRate: number;
  onRateChange: (rate: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  speechRate,
  onRateChange,
  isMuted,
  onToggleMute,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [pitch, setPitch] = useState<number>(1.0);
  const [tested, setTested] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const vList = window.speechSynthesis.getVoices();
        setVoices(vList.filter((v) => v.lang.startsWith('es') || v.lang.startsWith('en')));
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    speechService.setRate(speechRate);
    speechService.setPitch(pitch);
    if (selectedVoice) speechService.setPreferredVoice(selectedVoice);
    speechService.speak('Hola, soy tu asistente de voz personal. Estoy listo para ayudarte.');
    setTested(true);
    setTimeout(() => setTested(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Ajustes de Audio y Voz</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Mute toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Silenciar respuestas de voz</p>
              <p className="text-[11px] text-slate-500">Solo mostrar texto en pantalla sin hablar</p>
            </div>
            <button
              type="button"
              onClick={onToggleMute}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                isMuted ? 'bg-rose-100 text-rose-700' : 'bg-indigo-600 text-white'
              }`}
            >
              {isMuted ? 'Silenciado' : 'Activado'}
            </button>
          </div>

          {/* Rate slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Velocidad de reproducción</span>
              <span className="font-mono text-slate-500 font-bold">{speechRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={speechRate}
              onChange={(e) => onRateChange(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Pitch slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Tono de voz (Pitch)</span>
              <span className="font-mono text-slate-500 font-bold">{pitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.1"
              value={pitch}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPitch(val);
                speechService.setPitch(val);
              }}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Voice selector */}
          {voices.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-slate-800">Voz del sistema</span>
              <select
                value={selectedVoice}
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  speechService.setPreferredVoice(e.target.value);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-indigo-600"
              >
                <option value="">Predeterminada del dispositivo</option>
                {voices.map((v, i) => (
                  <option key={i} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Test Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestVoice}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {tested ? <Check className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4" />}
              <span>Probar Voz y Síntesis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
