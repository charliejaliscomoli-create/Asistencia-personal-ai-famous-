import React from 'react';
import { Calendar, Clock, Bell, StickyNote, MessageCircle, Mail } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const PROMPTS = [
  {
    label: 'Alarma 7:00 am',
    text: 'Pon una alarma mañana a las 7:00 am con etiqueta Rutina matutina',
    icon: Clock,
  },
  {
    label: 'Cita médica',
    text: 'Agenda una cita con el dentista para mañana a las 11:00 am',
    icon: Calendar,
  },
  {
    label: 'Recordatorio compras',
    text: 'Recuérdame comprar café y frutas hoy a las 6:00 pm',
    icon: Bell,
  },
  {
    label: 'Guardar nota',
    text: 'Guarda una nota con el título Proyecto Web y el contenido: revisar componentes y API',
    icon: StickyNote,
  },
  {
    label: 'WhatsApp a Carlos',
    text: 'Envía un mensaje de WhatsApp a Carlos diciendo que ya tengo listos los documentos',
    icon: MessageCircle,
  },
  {
    label: 'Enviar correo',
    text: 'Envía un correo a soporte@proveedor.com con el asunto Estado del servidor y confirmando entrega',
    icon: Mail,
  },
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Acciones Rápidas
        </span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
        {PROMPTS.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPrompt(p.text)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200/80 shadow-2xs shrink-0 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon className="w-3.5 h-3.5 text-indigo-600" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
