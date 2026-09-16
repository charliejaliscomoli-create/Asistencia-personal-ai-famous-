import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, MessageSquare, Calendar, Mail, Bell, Clock, StickyNote, ArrowRight } from 'lucide-react';
import { ToolInvocation } from '../types';

interface ToolActivityFeedProps {
  latestTools: ToolInvocation[];
  onSelectTab: (tab: string) => void;
}

export const ToolActivityFeed: React.FC<ToolActivityFeedProps> = ({ latestTools, onSelectTab }) => {
  if (!latestTools || latestTools.length === 0) return null;

  const getToolMeta = (name: string) => {
    switch (name) {
      case 'enviarMensajeWhatsApp':
      case 'enviar_whatsapp':
        return {
          label: 'WhatsApp',
          icon: MessageSquare,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50 border-emerald-200',
          tab: 'whatsapp',
        };
      case 'crearEventoCalendario':
      case 'gestionar_calendario':
        return {
          label: 'Calendario',
          icon: Calendar,
          color: 'text-blue-600',
          bg: 'bg-blue-50 border-blue-200',
          tab: 'calendario',
        };
      case 'enviarCorreo':
      case 'enviar_correo':
        return {
          label: 'Correo',
          icon: Mail,
          color: 'text-purple-600',
          bg: 'bg-purple-50 border-purple-200',
          tab: 'correos',
        };
      case 'programarAlarmaORecordatorio':
      case "programarAlarmaO'Recordatorio":
      case 'programarAlarmaO_Recordatorio':
      case 'configurar_alarma':
        return {
          label: 'Alarma',
          icon: Clock,
          color: 'text-amber-600',
          bg: 'bg-amber-50 border-amber-200',
          tab: 'alarmas',
        };
      case 'crear_recordatorio':
        return {
          label: 'Recordatorio',
          icon: Bell,
          color: 'text-rose-600',
          bg: 'bg-rose-50 border-rose-200',
          tab: 'recordatorios',
        };
      case 'crear_nota':
        return {
          label: 'Nota',
          icon: StickyNote,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50 border-yellow-200',
          tab: 'notas',
        };
      default:
        return {
          label: 'Función ejecutada',
          icon: CheckCircle2,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50 border-indigo-200',
          tab: 'resumen',
        };
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 my-3" id="tool-activity-feed">
      <AnimatePresence>
        {latestTools.map((tool, idx) => {
          const meta = getToolMeta(tool.name);
          const IconComponent = meta.icon;
          return (
            <motion.div
              key={`${tool.name}-${idx}`}
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-3 rounded-xl border ${meta.bg} flex items-center justify-between gap-3 shadow-xs`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-lg bg-white shadow-xs shrink-0 ${meta.color}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Función: {tool.name}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Éxito
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium truncate mt-0.5">
                    {tool.result?.message || JSON.stringify(tool.args)}
                  </p>
                </div>
              </div>

              <button
                id={`view-tool-tab-${meta.tab}`}
                onClick={() => onSelectTab(meta.tab)}
                className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 flex items-center gap-1 transition-colors"
              >
                <span>Ver en {meta.label}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
