import React from 'react';
import { MessageSquare, Calendar, Bell, Clock, StickyNote, Mail, HelpCircle } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled: boolean;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt, disabled }) => {
  const suggestions = [
    {
      label: 'WhatsApp a Laura',
      text: 'Envía un WhatsApp a Laura diciendo que llego en 10 minutos',
      icon: MessageSquare,
      color: 'hover:border-emerald-300 hover:text-emerald-700',
    },
    {
      label: 'Agendar Reunión',
      text: 'Agenda una reunión con el equipo mañana a las 3 PM',
      icon: Calendar,
      color: 'hover:border-blue-300 hover:text-blue-700',
    },
    {
      label: 'Poner Alarma',
      text: 'Pon una alarma a las 06:30 AM para despertar',
      icon: Clock,
      color: 'hover:border-amber-300 hover:text-amber-700',
    },
    {
      label: 'Recordatorio',
      text: 'Recuérdame pagar el internet hoy a las 8 de la noche',
      icon: Bell,
      color: 'hover:border-rose-300 hover:text-rose-700',
    },
    {
      label: 'Guardar Nota',
      text: 'Anota una idea: revisar el presupuesto trimestral del proyecto',
      icon: StickyNote,
      color: 'hover:border-yellow-300 hover:text-yellow-700',
    },
    {
      label: 'Enviar Correo',
      text: 'Manda un correo a Carlos sobre el presupuesto diciendo que está aprobado',
      icon: Mail,
      color: 'hover:border-purple-300 hover:text-purple-700',
    },
    {
      label: 'Faltan parámetros (Prueba Regla 3)',
      text: 'Envía un WhatsApp',
      icon: HelpCircle,
      color: 'hover:border-slate-400 hover:text-slate-800',
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 my-2" id="quick-prompts-container">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>Comandos de voz rápidos de prueba:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <button
              key={idx}
              id={`quick-prompt-${idx}`}
              disabled={disabled}
              onClick={() => onSelectPrompt(item.text)}
              className={`text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-600 transition-all duration-150 flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${item.color}`}
              title={item.text}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
