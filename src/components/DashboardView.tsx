import React, { useState } from 'react';
import {
  Calendar,
  MessageCircle,
  Mail,
  Clock,
  Bell,
  StickyNote,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  ExternalLink,
  Copy,
  Check,
  Send,
  Download,
  BellRing,
  User as UserIcon,
  Settings,
  Sun,
  Smartphone,
  ShieldCheck,
  Cloud,
  LogIn,
  LogOut,
  Volume2,
  Sliders,
  Database,
} from 'lucide-react';
import {
  CalendarEventItem,
  WhatsAppMessageItem,
  EmailItem,
  AlarmItem,
  ReminderItem,
  NoteItem,
  AppSettings,
} from '../types';
import { soundEffects } from '../services/audioService';
import { speechService } from '../services/speechService';
import { type User } from '../lib/firebase';

interface DashboardViewProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
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
  currentUser?: User | null;
  onOpenAuth?: () => void;
  onSignOut?: () => Promise<void>;
  settings?: AppSettings;
  onUpdateSettings?: (newSettings: Partial<AppSettings>) => void;
  onOpenSettingsModal?: () => void;
  onExportData?: () => void;
  onResetData?: () => void;
  isFirebaseConnected?: boolean;
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
  currentUser,
  onOpenAuth,
  onSignOut,
  settings,
  onUpdateSettings,
  onOpenSettingsModal,
  onExportData,
  onResetData,
  isFirebaseConnected = false,
}) => {
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const handleCopyNote = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNoteId(id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const handleOpenWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleOpenMailto = (to: string, subject: string, body: string) => {
    const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: Clock, count: null },
    { id: 'calendario', label: 'Citas', icon: Calendar, count: events.length },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, count: whatsAppMessages.length },
    { id: 'correos', label: 'Correos', icon: Mail, count: emails.length },
    { id: 'alarmas', label: 'Alarmas', icon: Clock, count: alarms.filter((a) => a.enabled).length },
    { id: 'recordatorios', label: 'Recordatorios', icon: Bell, count: reminders.filter((r) => !r.completed).length },
    { id: 'notas', label: 'Notas', icon: StickyNote, count: notes.length },
    { id: 'cuenta', label: currentUser ? 'Mi Cuenta' : 'Iniciar Sesión', icon: UserIcon, count: null },
    { id: 'configuracion', label: 'Ajustes', icon: Settings, count: null },
  ];

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="border-b border-slate-200/80 bg-slate-50/70 px-3 pt-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`tab-btn-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="p-4 sm:p-5">
        {/* TAB: RESUMEN */}
        {activeTab === 'resumen' && (
          <div className="space-y-5" id="view-summary-section">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                <div className="flex items-center justify-between text-indigo-700">
                  <span className="text-xs font-bold">Citas Hoy</span>
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="block text-xl font-extrabold text-indigo-950 mt-1">{events.length}</span>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="text-xs font-bold">Alarmas Activas</span>
                  <Clock className="w-4 h-4" />
                </div>
                <span className="block text-xl font-extrabold text-emerald-950 mt-1">
                  {alarms.filter((a) => a.enabled).length}
                </span>
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-2xl">
                <div className="flex items-center justify-between text-amber-700">
                  <span className="text-xs font-bold">Recordatorios</span>
                  <Bell className="w-4 h-4" />
                </div>
                <span className="block text-xl font-extrabold text-amber-950 mt-1">
                  {reminders.filter((r) => !r.completed).length}
                </span>
              </div>
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl">
                <div className="flex items-center justify-between text-purple-700">
                  <span className="text-xs font-bold">Notas</span>
                  <StickyNote className="w-4 h-4" />
                </div>
                <span className="block text-xl font-extrabold text-purple-950 mt-1">{notes.length}</span>
              </div>
            </div>

            {/* Quick List Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Próximas Citas y Eventos
                </span>
                <div className="space-y-1.5">
                  {events.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{ev.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {ev.date} a las {ev.time} • {ev.durationMinutes} min
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 capitalize">
                        {ev.category}
                      </span>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-xs text-slate-400 py-2">No hay citas registradas</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Alarmas Principales
                </span>
                <div className="space-y-1.5">
                  {alarms.map((al) => (
                    <div
                      key={al.id}
                      className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{al.time}</p>
                          <p className="text-[11px] text-slate-500">{al.label}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleAlarm(al.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          al.enabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {al.enabled ? 'Activa' : 'Pausada'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CALENDARIO */}
        {activeTab === 'calendario' && (
          <div className="space-y-3" id="view-calendar-section">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Citas y Agenda en Google Calendar
              </h2>
              <span className="text-xs text-slate-400">{events.length} citas guardadas</span>
            </div>
            <div className="space-y-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs hover:border-indigo-200 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900">{ev.title}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 capitalize">
                        {ev.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>📅 {ev.date}</span>
                      <span>⏰ {ev.time} ({ev.durationMinutes} min)</span>
                      {ev.location && <span>📍 {ev.location}</span>}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteEvent(ev.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar cita"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  No hay citas registradas. Pide por voz: "Agendar reunión con Pedro para mañana a las 3pm"
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: WHATSAPP */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-3" id="view-whatsapp-section">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Mensajes de WhatsApp Dictados
              </h2>
              <span className="text-xs text-slate-400">{whatsAppMessages.length} mensajes</span>
            </div>
            <div className="space-y-2">
              {whatsAppMessages.map((wa) => (
                <div
                  key={wa.id}
                  className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{wa.recipientName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{wa.recipientPhone}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{wa.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{wa.message}"
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenWhatsApp(wa.recipientPhone, wa.message)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Abrir en WhatsApp Web / App
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CORREOS */}
        {activeTab === 'correos' && (
          <div className="space-y-3" id="view-emails-section">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Correos Electrónicos
              </h2>
              <span className="text-xs text-slate-400">{emails.length} correos</span>
            </div>
            <div className="space-y-2">
              {emails.map((em) => (
                <div
                  key={em.id}
                  className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Para: {em.to}</span>
                    <span className="text-[10px] text-slate-400">{em.timestamp}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{em.subject}</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{em.body}</p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenMailto(em.to, em.subject, em.body)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Enviar con Gmail / Cliente
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ALARMAS */}
        {activeTab === 'alarmas' && (
          <div className="space-y-3" id="view-alarms-section">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Gestión de Alarmas
              </h2>
              <button
                type="button"
                onClick={() => soundEffects.playAlarmRing()}
                className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5" />
                Probar sonido
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {alarms.map((al) => (
                <div
                  key={al.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    al.enabled
                      ? 'bg-white border-indigo-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-2xl font-black tracking-tight text-slate-900 block">
                      {al.time}
                    </span>
                    <span className="text-xs font-medium text-slate-600 block">{al.label}</span>
                    <div className="flex items-center gap-1 pt-1">
                      {al.days.map((d, i) => (
                        <span
                          key={i}
                          className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleAlarm(al.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      al.enabled
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {al.enabled ? 'Activa' : 'Apagada'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: RECORDATORIOS */}
        {activeTab === 'recordatorios' && (
          <div className="space-y-3" id="view-reminders-section">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Recordatorios y Tareas
              </h2>
              <span className="text-xs text-slate-400">
                {reminders.filter((r) => !r.completed).length} pendientes
              </span>
            </div>
            <div className="space-y-2">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-3 bg-white border rounded-2xl flex items-center justify-between shadow-2xs transition-colors ${
                    rem.completed ? 'border-slate-200 opacity-60 bg-slate-50/60' : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleReminder(rem.id)}
                      className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                    >
                      {rem.completed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          rem.completed ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {rem.text}
                      </p>
                      {(rem.dueDate || rem.dueTime) && (
                        <p className="text-[11px] text-slate-400">
                          {rem.dueDate} {rem.dueTime && `a las ${rem.dueTime}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteReminder(rem.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: NOTAS */}
        {activeTab === 'notas' && (
          <div className="space-y-3" id="view-notes-section">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Bloc de Notas Rápidas
              </h2>
              <span className="text-xs text-slate-400">{notes.length} notas</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {notes.map((nt) => (
                <div
                  key={nt.id}
                  className="p-3.5 bg-amber-50/40 border border-amber-200/70 rounded-2xl shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900">{nt.title}</h3>
                      <span className="text-[10px] text-slate-400">{nt.updatedAt}</span>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {nt.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-amber-200/50">
                    <div className="flex items-center gap-1">
                      {nt.tags.map((t, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-amber-800 border border-amber-200/60"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyNote(nt.id, `${nt.title}\n\n${nt.content}`)}
                        className="p-1 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        title="Copiar nota"
                      >
                        {copiedNoteId === nt.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(nt.id)}
                        className="p-1 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar nota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CUENTA GMAIL */}
        {activeTab === 'cuenta' && (
          <div className="space-y-4" id="view-account-section">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                  Inicio de Sesión y Registro con Gmail
                </h2>
                <p className="text-xs text-slate-500">
                  Autenticación oficial con Google y sincronización en tiempo real con Firebase
                </p>
              </div>
              {currentUser && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  Sesión Activa en la Nube
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="space-y-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'Usuario'}
                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-xs">
                        {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {currentUser.displayName || 'Usuario de Google'}
                        </h3>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Gmail Verificado
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">{currentUser.email}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">ID: {currentUser.uid}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="flex-1 sm:flex-none py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Detalles de Cuenta
                    </button>
                    {onSignOut && (
                      <button
                        type="button"
                        onClick={onSignOut}
                        className="flex-1 sm:flex-none py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Cerrar Sesión
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-indigo-600" />
                      Estado de Sincronización en Firebase Firestore:
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        isFirebaseConnected
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isFirebaseConnected ? 'Conectado y Actualizado' : 'Conectando nube...'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                      <span className="block text-base font-bold text-slate-900">{events.length}</span>
                      <span className="text-[11px] text-slate-500">Eventos en la Nube</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                      <span className="block text-base font-bold text-slate-900">{reminders.length}</span>
                      <span className="text-[11px] text-slate-500">Recordatorios</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                      <span className="block text-base font-bold text-slate-900">{alarms.length}</span>
                      <span className="text-[11px] text-slate-500">Alarmas Activas</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                      <span className="block text-base font-bold text-slate-900">{notes.length}</span>
                      <span className="text-[11px] text-slate-500">Notas Guardadas</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
                <div className="max-w-xl mx-auto text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 mx-auto shadow-2xs">
                    <LogIn className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Accede o Regístrate con tu Cuenta de Gmail
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sincroniza automáticamente tus citas, notas, alarmas y recordatorios en la nube con Firebase Cloud Firestore. Accede desde cualquier PC o teléfono Android sin riesgo a perder tu información.
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-2.5">
                  <button
                    type="button"
                    id="btn-login-gmail-tab"
                    onClick={onOpenAuth}
                    className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar con Google / Gmail</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-500">
                    Si es tu primera vez, tu cuenta se registrará automáticamente en Firebase.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
                    <Cloud className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
                    <h4 className="text-xs font-bold text-slate-800">Persistencia Cloud</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Tus datos se guardan en Firestore y no se borran al limpiar cookies.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
                    <Smartphone className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                    <h4 className="text-xs font-bold text-slate-800">Sincronización Móvil</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Lo que dictes en tu PC aparecerá de inmediato en tu app Android.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                    <h4 className="text-xs font-bold text-slate-800">Sin Contraseñas</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Protegido por el sistema seguro de inicio de sesión de Google.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: CONFIGURACIÓN CLÁSICA */}
        {activeTab === 'configuracion' && (
          <div className="space-y-5" id="view-settings-section">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600" />
                  Configuraciones Clásicas de la Aplicación
                </h2>
                <p className="text-xs text-slate-500">
                  Ajustes de apariencia, voz, notificaciones y almacenamiento de datos
                </p>
              </div>
              {onOpenSettingsModal && (
                <button
                  type="button"
                  onClick={onOpenSettingsModal}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Abrir Panel Avanzado
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Apariencia */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Apariencia y Visualización</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">Tema visual</span>
                    <span className="text-[11px] text-slate-500">Modo de color de la interfaz</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ theme: 'light' })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        settings?.theme === 'light'
                          ? 'bg-white text-slate-900 font-bold shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Claro
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ theme: 'dark' })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        settings?.theme === 'dark'
                          ? 'bg-white text-slate-900 font-bold shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Oscuro
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ theme: 'system' })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        settings?.theme === 'system'
                          ? 'bg-white text-slate-900 font-bold shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Auto
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800 block">Sugerencias rápidas</span>
                    <span className="text-[11px] text-slate-500">Barra de atajos de voz frecuentes</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings?.showQuickPrompts ?? true}
                      onChange={(e) => onUpdateSettings?.({ showQuickPrompts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Card 2: Voz */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span>Voz y Síntesis de Audio</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Velocidad de habla</span>
                    <span className="font-mono text-slate-500">{(settings?.speechRate ?? 1.05).toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={settings?.speechRate ?? 1.05}
                    onChange={(e) => {
                      const r = Number(e.target.value);
                      onUpdateSettings?.({ speechRate: r });
                      speechService.setRate(r);
                    }}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800 block">Efectos de sonido</span>
                    <span className="text-[11px] text-slate-500">Tonos al escuchar y responder</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings?.soundEffectsEnabled ?? true}
                      onChange={(e) => onUpdateSettings?.({ soundEffectsEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Card 3: Datos */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span>Datos y Almacenamiento</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">Copia de seguridad</span>
                    <span className="text-[11px] text-slate-500">Descarga tus datos en formato JSON</span>
                  </div>
                  {onExportData && (
                    <button
                      type="button"
                      onClick={onExportData}
                      className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Exportar
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800 block">Restaurar ejemplos</span>
                    <span className="text-[11px] text-slate-500">Vuelve a los datos iniciales</span>
                  </div>
                  {onResetData && (
                    <button
                      type="button"
                      onClick={onResetData}
                      className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      Restaurar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
