import React, { useEffect, useState } from 'react';
import { X, Volume2, Mic, Settings, Sliders, CheckCircle, Sparkles } from 'lucide-react';
import { speechService } from '../services/speechService';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ isOpen, onClose }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(1.05);

  useEffect(() => {
    if (isOpen) {
      const availableVoices = speechService.getVoices();
      setVoices(availableVoices);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVoiceChange = (idx: number) => {
    setSelectedVoiceIndex(idx);
    if (voices[idx]) {
      speechService.setVoice(voices[idx]);
    }
  };

  const handleRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    speechService.setRate(newRate);
  };

  const handleTestSpeech = () => {
    speechService.speak('Hola, soy tu asistente de voz. He guardado tu recordatorio con éxito.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ajustes de Voz</h3>
              <p className="text-[11px] text-slate-500">Configuración de audio y reglas activas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Active Interaction Rules Card */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Reglas del Asistente Activas
            </h4>
            <ul className="text-[11px] text-indigo-950/80 space-y-1">
              <li>• <strong>Voz concisa:</strong> Respuestas de máximo 2 oraciones, claras y naturales.</li>
              <li>• <strong>Llamada a herramientas:</strong> Llama a la función correspondiente con los datos extraídos.</li>
              <li>• <strong>Confirmación de parámetros:</strong> Pregunta directamente si falta algún dato obligatorio.</li>
              <li>• <strong>Confirmación breve:</strong> Confirma la realización de la acción de inmediato.</li>
            </ul>
          </div>

          {/* Voice selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Voz del sistema (Síntesis de voz)
            </label>
            <select
              value={selectedVoiceIndex}
              onChange={(e) => handleVoiceChange(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {voices.map((v, i) => (
                <option key={i} value={i}>
                  {v.name} ({v.lang})
                </option>
              ))}
              {voices.length === 0 && <option value={0}>Voz estándar del navegador</option>}
            </select>
          </div>

          {/* Speech Rate Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Velocidad de habla</span>
              <span className="text-slate-500 font-mono">{speechRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={speechRate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Pausada (0.8x)</span>
              <span>Natural (1.05x)</span>
              <span>Rápida (1.4x)</span>
            </div>
          </div>

          {/* Voice Preview Button */}
          <div className="pt-2">
            <button
              onClick={handleTestSpeech}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-indigo-600" />
              Probar voz del asistente
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
