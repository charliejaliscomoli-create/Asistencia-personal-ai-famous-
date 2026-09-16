import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  MessageSquare,
  Mail,
  Clock,
  Bell,
  StickyNote,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Plus,
  Play,
  Copy,
  Check,
  LayoutGrid,
} from 'lucide-react';
import {
  CalendarEventItem,
  WhatsAppMessageItem,
  EmailItem,
  AlarmItem,
  ReminderItem,
  NoteItem,
} from '../types';
import { soundEffects } from '../services/audioService';

interface DashboardViewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  events: CalendarEventItem[];
  whatsAppMessages: WhatsAppMessageItem[];
  emails: EmailItem[];
  alarms: AlarmItem[];
  reminders: ReminderItem[];
  notes: NoteItem[];
  onToggleAlarm: (id: string) => void;
  onToggleReminder: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onDeleteReminder: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeTab,
  onTabChange,
  events,
  whatsAppMessages,
  emails,
  alarms,
  reminders,
  notes,
  onToggleAlarm,
  onToggleReminder,
  onDeleteEvent,
  onDeleteNote,
  onDeleteReminder,
}) => {
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const copyNoteText = (note: NoteItem) => {
    navigator.clipboard.writeText(`${note.title}\n${note.content}`);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: LayoutGrid, count: null },
    { id: 'calendario', label: 'Calendario', icon: Calendar, count: events.length },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, count: whatsAppMessages.length },
    { id: 'correos', label: 'Correos', icon: Mail, count: emails.length },
    { id: 'alarmas', label: 'Alarmas', icon: Clock, count: alarms.filter((a) => a.enabled).length },
    { id: 'recordatorios', label: 'Recordatorios', icon: Bell, count: reminders.filter((r) => !r.completed).length },
    { id: 'notas', label: 'Notas', icon: StickyNote, count: notes.length },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-6 mb-16" id="dashboard-view">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200/80 no-scrollbar">
        {tabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-button-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels Content */}
      <div className="mt-4">
        {/* TAB: RESUMEN GENERAL */}
        {activeTab === 'resumen' && (
          <div className="space-y-4">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => onTabChange('calendario')}
                className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-blue-600 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xl font-bold text-slate-900">{events.length}</span>
                </div>
                <p className="text-xs font-semibold text-slate-700">Eventos</p>
                <span className="text-[11px] text-slate-500">Agendados</span>
              </div>

              <div
                onClick={() => onTabChange('recordatorios')}
                className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-rose-600 mb-2">
                  <Bell className="w-5 h-5" />
                  <span className="text-xl font-bold text-slate-900">
                    {reminders.filter((r) => !r.completed).length}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">Recordatorios</p>
                <span className="text-[11px] text-slate-500">Pendientes</span>
              </div>

              <div
                onClick={() => onTabChange('alarmas')}
                className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-amber-600 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-bold text-slate-900">
                    {alarms.filter((a) => a.enabled).length}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">Alarmas</p>
                <span className="text-[11px] text-slate-500">Activas hoy</span>
              </div>

              <div
                onClick={() => onTabChange('whatsapp')}
                className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-emerald-600 mb-2">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-xl font-bold text-slate-900">{whatsAppMessages.length}</span>
                </div>
                <p className="text-xs font-semibold text-slate-700">WhatsApp</p>
                <span className="text-[11px] text-slate-500">Mensajes enviados</span>
              </div>
            </div>

            {/* Upcoming Agenda & Pending Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Próximos eventos */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" /> Próximos Eventos
                  </h3>
                  <button
                    onClick={() => onTabChange('calendario')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Ver todos
                  </button>
                </div>
                <div className="divide-y divide-slate-100 mt-2">
                  {events.slice(0, 3).map((evt) => (
                    <div key={evt.id} className="py-2.5 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{evt.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {evt.date} • {evt.time}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 shrink-0">
                        {evt.duration || 'Evento'}
                      </span>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-xs text-slate-400 py-3">No hay eventos agendados.</p>
                  )}
                </div>
              </div>

              {/* Recordatorios pendientes */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-rose-600" /> Recordatorios
                  </h3>
                  <button
                    onClick={() => onTabChange('recordatorios')}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Gestionar
                  </button>
                </div>
                <div className="divide-y divide-slate-100 mt-2">
                  {reminders.slice(0, 3).map((rem) => (
                    <div key={rem.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <button
                          onClick={() => onToggleReminder(rem.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            rem.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {rem.completed && <Check className="w-3 h-3" />}
                        </button>
                        <span
                          className={`text-xs truncate ${
                            rem.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                          }`}
                        >
                          {rem.text}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 shrink-0">{rem.dueTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CALENDARIO */}
        {activeTab === 'calendario' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Agenda & Calendario</h2>
                <p className="text-xs text-slate-500">Eventos programados por comandos de voz</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs relative group hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {evt.category || 'General'}
                    </span>
                    <button
                      onClick={() => onDeleteEvent(evt.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"
                      title="Eliminar evento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{evt.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-600 font-medium mb-2">
                    <span>📅 {evt.date}</span>
                    <span>⏰ {evt.time}</span>
                    {evt.duration && <span>⏳ {evt.duration}</span>}
                  </div>
                  {evt.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 border-t border-slate-100 pt-2">
                      {evt.description}
                    </p>
                  )}
                </div>
              ))}
              {events.length === 0 && (
                <div className="col-span-2 text-center py-8 bg-white rounded-2xl border border-slate-200/60">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No hay eventos. Prueba diciendo:</p>
                  <p className="text-xs font-semibold text-blue-600 mt-1">
                    "Agenda una reunión con el cliente mañana a las 4 PM"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: WHATSAPP */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Mensajes de WhatsApp</h2>
                <p className="text-xs text-slate-500">Mensajes despachados mediante comandos de voz</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {whatsAppMessages.map((msg) => {
                const waUrl = msg.phone
                  ? `https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg.message)}`
                  : `https://wa.me/?text=${encodeURIComponent(msg.message)}`;

                return (
                  <div
                    key={msg.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{msg.recipient}</h4>
                          {msg.phone && <span className="text-[11px] text-slate-400">{msg.phone}</span>}
                          <span className="text-[10px] text-slate-400">• {msg.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 italic">"{msg.message}"</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" /> Enviado
                      </span>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-slate-600 hover:text-emerald-700 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 flex items-center gap-1"
                        title="Abrir en WhatsApp Web"
                      >
                        <span>Abrir Web</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: CORREOS */}
        {activeTab === 'correos' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Bandeja de Correos</h2>
                <p className="text-xs text-slate-500">Gestión de correos enviados y recibidos</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-purple-200 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          email.status === 'sent'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {email.status === 'sent' ? 'Enviado' : 'Recibido'}
                      </span>
                      <span className="font-medium text-slate-700">
                        {email.status === 'sent' ? `Para: ${email.to}` : `De: ${email.from}`}
                      </span>
                    </div>
                    <span>{email.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{email.subject}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{email.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ALARMAS */}
        {activeTab === 'alarmas' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Alarmas</h2>
                <p className="text-xs text-slate-500">Horarios configurados por voz</p>
              </div>
              <button
                onClick={() => soundEffects.playAlarmBeep()}
                className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Probar sonido
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    alarm.enabled
                      ? 'bg-white border-amber-300 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {alarm.time}
                      </span>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">{alarm.label}</p>
                      <div className="flex gap-1 mt-2">
                        {alarm.days.map((d, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleAlarm(alarm.id)}
                      className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                        alarm.enabled ? 'bg-amber-500' : 'bg-slate-300'
                      }`}
                      title={alarm.enabled ? 'Desactivar alarma' : 'Activar alarma'}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                          alarm.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: RECORDATORIOS */}
        {activeTab === 'recordatorios' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recordatorios & Tareas</h2>
                <p className="text-xs text-slate-500">Pendientes creados por comandos de voz</p>
              </div>
            </div>

            <div className="space-y-2">
              {reminders.map((rem) => {
                const getPriorityBadge = (p: string) => {
                  switch (p) {
                    case 'alta':
                      return 'bg-rose-100 text-rose-700';
                    case 'media':
                      return 'bg-amber-100 text-amber-700';
                    default:
                      return 'bg-slate-100 text-slate-600';
                  }
                };

                return (
                  <div
                    key={rem.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 group hover:border-rose-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button
                        onClick={() => onToggleReminder(rem.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer ${
                          rem.completed
                            ? 'bg-rose-600 border-rose-600 text-white'
                            : 'border-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {rem.completed && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div className="overflow-hidden">
                        <p
                          className={`text-xs font-semibold truncate ${
                            rem.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {rem.text}
                        </p>
                        <span className="text-[11px] text-slate-500">Hora: {rem.dueTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getPriorityBadge(
                          rem.priority
                        )}`}
                      >
                        {rem.priority}
                      </span>
                      <button
                        onClick={() => onDeleteReminder(rem.id)}
                        className="text-slate-300 hover:text-red-500 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Eliminar recordatorio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: NOTAS */}
        {activeTab === 'notas' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Notas Rápidas</h2>
                <p className="text-xs text-slate-500">Apuntes e ideas dictadas por voz</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  style={{ backgroundColor: note.color || '#FEF3C7' }}
                  className="p-4 rounded-2xl border border-black/5 shadow-2xs flex flex-col justify-between group transition-transform hover:-translate-y-0.5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-xs font-bold text-slate-900">{note.title}</h4>
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyNoteText(note)}
                          className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-black/5"
                          title="Copiar nota"
                        >
                          {copiedNoteId === note.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="p-1 rounded text-slate-600 hover:text-red-600 hover:bg-black/5"
                          title="Eliminar nota"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-3 block">
                    {note.createdAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
