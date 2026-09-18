import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mic,
  Settings,
  Cloud,
  LogOut,
  Smartphone,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AssistantState,
  CalendarEventItem,
  WhatsAppMessageItem,
  EmailItem,
  AlarmItem,
  ReminderItem,
  NoteItem,
  ChatMessage,
  ToolInvocation,
  AppSettings,
} from './types';
import {
  initialEvents,
  initialWhatsApp,
  initialEmails,
  initialAlarms,
  initialReminders,
  initialNotes,
} from './data/initialData';
import { VoiceOrb } from './components/VoiceOrb';
import { VoiceTranscript } from './components/VoiceTranscript';
import { ToolActivityFeed } from './components/ToolActivityFeed';
import { QuickPrompts } from './components/QuickPrompts';
import { DashboardView } from './components/DashboardView';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { AppSettingsModal } from './components/AppSettingsModal';
import { AuthModal } from './components/AuthModal';
import { InstallAppModal } from './components/InstallAppModal';
import { speechService } from './services/speechService';
import { soundEffects } from './services/audioService';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  logOut,
  type User,
} from './lib/firebase';
import {
  saveUserProfileToFirestore,
  saveEventToFirestore,
  deleteEventFromFirestore,
  saveAlarmToFirestore,
  deleteAlarmFromFirestore,
  saveReminderToFirestore,
  deleteReminderFromFirestore,
  saveNoteToFirestore,
  deleteNoteFromFirestore,
  saveWhatsAppToFirestore,
  deleteWhatsAppFromFirestore,
  saveEmailToFirestore,
  deleteEmailFromFirestore,
  subscribeToUserData,
} from './services/firestoreSync';

const defaultSettings: AppSettings = {
  theme: 'light',
  density: 'comfortable',
  showQuickPrompts: true,
  speechRate: 1.05,
  speechPitch: 1.0,
  speechVoiceName: '',
  soundEffectsEnabled: true,
  muteSpeech: false,
  pushNotificationsEnabled: false,
  alarmVibration: true,
  autoListenAfterReply: false,
  confirmBeforeActions: false,
};

export default function App() {
  // Assistant core state
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recentTools, setRecentTools] = useState<ToolInvocation[]>([]);
  const [activeTab, setActiveTab] = useState<string>('resumen');

  // Application data entities
  const [events, setEvents] = useState<CalendarEventItem[]>(() => {
    const saved = localStorage.getItem('asistente_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });
  const [whatsAppMessages, setWhatsAppMessages] = useState<WhatsAppMessageItem[]>(() => {
    const saved = localStorage.getItem('asistente_whatsapp');
    return saved ? JSON.parse(saved) : initialWhatsApp;
  });
  const [emails, setEmails] = useState<EmailItem[]>(() => {
    const saved = localStorage.getItem('asistente_emails');
    return saved ? JSON.parse(saved) : initialEmails;
  });
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    const saved = localStorage.getItem('asistente_alarms');
    return saved ? JSON.parse(saved) : initialAlarms;
  });
  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    const saved = localStorage.getItem('asistente_reminders');
    return saved ? JSON.parse(saved) : initialReminders;
  });
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('asistente_notes');
    return saved ? JSON.parse(saved) : initialNotes;
  });

  // Settings
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('asistente_settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  // Modals
  const [audioSettingsOpen, setAudioSettingsOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // User & Firebase Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // PWA install prompt detection
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Sync settings with services
  useEffect(() => {
    soundEffects.setEnabled(appSettings.soundEffectsEnabled);
    speechService.setRate(appSettings.speechRate);
    speechService.setPitch(appSettings.speechPitch);
    if (appSettings.speechVoiceName) {
      speechService.setPreferredVoice(appSettings.speechVoiceName);
    }
  }, [appSettings]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('asistente_events', JSON.stringify(events));
  }, [events]);
  useEffect(() => {
    localStorage.setItem('asistente_whatsapp', JSON.stringify(whatsAppMessages));
  }, [whatsAppMessages]);
  useEffect(() => {
    localStorage.setItem('asistente_emails', JSON.stringify(emails));
  }, [emails]);
  useEffect(() => {
    localStorage.setItem('asistente_alarms', JSON.stringify(alarms));
  }, [alarms]);
  useEffect(() => {
    localStorage.setItem('asistente_reminders', JSON.stringify(reminders));
  }, [reminders]);
  useEffect(() => {
    localStorage.setItem('asistente_notes', JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem('asistente_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      setIsFirebaseConnected(Boolean(user));
    });
    return () => unsubscribe();
  }, []);

  // Sync with Firestore when logged in
  useEffect(() => {
    if (!currentUser) return;
    setIsFirebaseConnected(true);

    saveUserProfileToFirestore(currentUser.uid, {
      email: currentUser.email,
      displayName: currentUser.displayName,
    }).catch(console.warn);

    const unsub = subscribeToUserData(currentUser.uid, {
      onEvents: (remoteEvents) => {
        if (remoteEvents.length > 0) setEvents(remoteEvents);
      },
      onAlarms: (remoteAlarms) => {
        if (remoteAlarms.length > 0) setAlarms(remoteAlarms);
      },
      onReminders: (remoteReminders) => {
        if (remoteReminders.length > 0) setReminders(remoteReminders);
      },
      onNotes: (remoteNotes) => {
        if (remoteNotes.length > 0) setNotes(remoteNotes);
      },
      onWhatsApp: (remoteWA) => {
        if (remoteWA.length > 0) setWhatsAppMessages(remoteWA);
      },
      onEmails: (remoteEmails) => {
        if (remoteEmails.length > 0) setEmails(remoteEmails);
      },
    });

    return () => unsub();
  }, [currentUser]);

  // Auth actions
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Google Sign-in failed:', e);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setCurrentUser(null);
      setIsFirebaseConnected(false);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Toggle & Delete handlers
  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((al) => {
        if (al.id === id) {
          const updated = { ...al, enabled: !al.enabled };
          if (currentUser) saveAlarmToFirestore(currentUser.uid, updated).catch(console.warn);
          return updated;
        }
        return al;
      })
    );
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((rem) => {
        if (rem.id === id) {
          const updated = { ...rem, completed: !rem.completed };
          if (currentUser) saveReminderToFirestore(currentUser.uid, updated).catch(console.warn);
          return updated;
        }
        return rem;
      })
    );
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (currentUser) deleteEventFromFirestore(currentUser.uid, id).catch(console.warn);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (currentUser) deleteNoteFromFirestore(currentUser.uid, id).catch(console.warn);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    if (currentUser) deleteReminderFromFirestore(currentUser.uid, id).catch(console.warn);
  };

  const handleResetData = () => {
    setEvents(initialEvents);
    setWhatsAppMessages(initialWhatsApp);
    setEmails(initialEmails);
    setAlarms(initialAlarms);
    setReminders(initialReminders);
    setNotes(initialNotes);
  };

  const handleExportData = () => {
    const payload = {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      user: currentUser ? { email: currentUser.email, uid: currentUser.uid } : null,
      events,
      whatsAppMessages,
      emails,
      alarms,
      reminders,
      notes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asistente_respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (data: any) => {
    if (!data || typeof data !== 'object') return;
    if (Array.isArray(data.events)) setEvents(data.events);
    if (Array.isArray(data.whatsAppMessages)) setWhatsAppMessages(data.whatsAppMessages);
    if (Array.isArray(data.emails)) setEmails(data.emails);
    if (Array.isArray(data.alarms)) setAlarms(data.alarms);
    if (Array.isArray(data.reminders)) setReminders(data.reminders);
    if (Array.isArray(data.notes)) setNotes(data.notes);

    if (currentUser) {
      if (Array.isArray(data.events)) {
        data.events.forEach((ev: any) => saveEventToFirestore(currentUser.uid, ev).catch(console.warn));
      }
      if (Array.isArray(data.alarms)) {
        data.alarms.forEach((al: any) => saveAlarmToFirestore(currentUser.uid, al).catch(console.warn));
      }
      if (Array.isArray(data.reminders)) {
        data.reminders.forEach((rem: any) => saveReminderToFirestore(currentUser.uid, rem).catch(console.warn));
      }
      if (Array.isArray(data.notes)) {
        data.notes.forEach((nt: any) => saveNoteToFirestore(currentUser.uid, nt).catch(console.warn));
      }
    }
  };

  // Main interaction handler
  const processUserPrompt = useCallback(
    async (promptText: string) => {
      if (!promptText.trim()) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text: promptText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setCurrentTranscript('');
      setAssistantState('thinking');

      try {
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText }),
        });

        const data = await response.json();
        const executedTools: ToolInvocation[] = [];

        // Apply returned tool calls
        if (Array.isArray(data.toolCalls)) {
          for (const call of data.toolCalls) {
            const toolId = `tool-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

            if (call.name === 'setAlarm') {
              const newAlarm: AlarmItem = {
                id: `al-${Date.now()}`,
                time: call.args.time || '08:00',
                label: call.args.label || 'Alarma dictada por voz',
                enabled: true,
                days: call.args.days || ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
              };
              setAlarms((prev) => [newAlarm, ...prev]);
              setActiveTab('alarmas');
              if (currentUser) saveAlarmToFirestore(currentUser.uid, newAlarm).catch(console.warn);
              executedTools.push({
                id: toolId,
                toolName: 'setAlarm',
                parameters: call.args,
                resultSummary: `Alarma a las ${newAlarm.time} activada`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'ejecutado',
              });
            } else if (call.name === 'scheduleCalendarEvent') {
              const newEvent: CalendarEventItem = {
                id: `ev-${Date.now()}`,
                title: call.args.title || 'Cita',
                date: call.args.date || new Date().toISOString().slice(0, 10),
                time: call.args.time || '10:00',
                durationMinutes: call.args.durationMinutes || 30,
                location: call.args.location || 'Oficina / Enlace',
                category: call.args.category || 'trabajo',
                syncedToGoogleCalendar: true,
              };
              setEvents((prev) => [newEvent, ...prev]);
              setActiveTab('calendario');
              if (currentUser) saveEventToFirestore(currentUser.uid, newEvent).catch(console.warn);
              executedTools.push({
                id: toolId,
                toolName: 'scheduleCalendarEvent',
                parameters: call.args,
                resultSummary: `Cita "${newEvent.title}" para ${newEvent.date} a las ${newEvent.time}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'ejecutado',
              });
            } else if (call.name === 'sendWhatsAppMessage') {
              const newMsg: WhatsAppMessageItem = {
                id: `wa-${Date.now()}`,
                recipientName: call.args.recipientName || 'Contacto',
                recipientPhone: call.args.recipientPhone || '+34 600 000 000',
                message: call.args.message || '',
                timestamp: 'Ahora',
                status: 'borrador',
              };
              setWhatsAppMessages((prev) => [newMsg, ...prev]);
              setActiveTab('whatsapp');
              if (currentUser) saveWhatsAppToFirestore(currentUser.uid, newMsg).catch(console.warn);
              executedTools.push({
                id: toolId,
                toolName: 'sendWhatsAppMessage',
                parameters: call.args,
                resultSummary: `WhatsApp para ${newMsg.recipientName}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'ejecutado',
              });
            } else if (call.name === 'sendEmail') {
              const newEmail: EmailItem = {
                id: `em-${Date.now()}`,
                to: call.args.to || '',
                subject: call.args.subject || 'Sin asunto',
                body: call.args.body || '',
                timestamp: 'Ahora',
                read: true,
                type: 'borrador',
              };
              setEmails((prev) => [newEmail, ...prev]);
              setActiveTab('correos');
              if (currentUser) saveEmailToFirestore(currentUser.uid, newEmail).catch(console.warn);
              executedTools.push({
                id: toolId,
                toolName: 'sendEmail',
                parameters: call.args,
                resultSummary: `Correo para ${newEmail.to}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'ejecutado',
              });
            } else if (call.name === 'createReminder') {
              const newRem: ReminderItem = {
                id: `rem-${Date.now()}`,
                text: call.args.text || 'Recordatorio',
                dueDate: call.args.dueDate,
                dueTime: call.args.dueTime,
                completed: false,
                priority: call.args.priority || 'media',
              };
              setReminders((prev) => [newRem, ...prev]);
              setActiveTab('recordatorios');
              if (currentUser) saveReminderToFirestore(currentUser.uid, newRem).catch(console.warn);
              executedTools.push({
                id: toolId,
                toolName: 'createReminder',
                parameters: call.args,
                resultSummary: `Recordatorio: "${newRem.text}"`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'ejecutado',
              });
            } else if (call.name === 'saveNote') {
              const newNote: NoteItem = {
                id: `nt-${Date.now()}`,
                title: call.args.title || 'Nueva nota',
                content: call.args.content || '',
                updatedAt: 'Ahora',
                tags: call.args.tags || ['Voz'],
              };
              setNotes((prev) => [newNote, ...prev]);
              setActiveTab('notas');
              if (currentUser) saveNoteToFirestore(currentUser.uid, newNote).catch(console.warn);
              executedTools.push({
                id: toolId,
                toolName: 'saveNote',
                parameters: call.args,
                resultSummary: `Nota "${newNote.title}" guardada`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'ejecutado',
              });
            }
          }
        }

        if (executedTools.length > 0) {
          setRecentTools((prev) => [...executedTools, ...prev].slice(0, 8));
          soundEffects.playSuccess();
        }

        const replyText = data.reply || 'Acción completada con éxito.';
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolsUsed: executedTools,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Speak reply if not muted
        if (!appSettings.muteSpeech) {
          setAssistantState('speaking');
          await speechService.speak(
            replyText,
            () => setAssistantState('speaking'),
            () => setAssistantState('idle'),
            () => setAssistantState('idle')
          );
        } else {
          setAssistantState('idle');
        }
      } catch (err: any) {
        console.error('Error in voice interaction:', err);
        setAssistantState('idle');
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Lo siento, ocurrió un problema al procesar tu instrucción.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    },
    [currentUser, appSettings.muteSpeech]
  );

  // Toggle listening from VoiceOrb
  const handleToggleListening = () => {
    if (assistantState === 'listening') {
      speechService.stopListening();
      soundEffects.playListeningStop();
      setAssistantState('idle');
    } else if (assistantState === 'speaking') {
      speechService.stopSpeaking();
      setAssistantState('idle');
    } else {
      soundEffects.playListeningStart();
      setAssistantState('listening');
      setCurrentTranscript('');

      speechService.startListening(
        (text, isFinal) => {
          setCurrentTranscript(text);
          if (isFinal) {
            speechService.stopListening();
            soundEffects.playListeningStop();
            processUserPrompt(text);
          }
        },
        (error) => {
          console.warn('Speech recognition error:', error);
          setAssistantState('idle');
        },
        () => {
          setAssistantState((prev) => (prev === 'listening' ? 'idle' : prev));
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-12 flex flex-col items-center">
      {/* Top Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">
                Asistente de Voz Personal
              </h1>
              <span className="text-[11px] font-medium text-slate-500">
                Gemini 2.5 Flash • Control por Voz
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google / Gmail Auth & Account Status */}
            {!isAuthLoading && (
              currentUser ? (
                <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
                  <button
                    type="button"
                    id="btn-user-account-header"
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
                    title="Ver perfil de cuenta de Gmail y sincronización"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'Usuario'}
                        className="w-5 h-5 rounded-full object-cover border border-slate-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                        {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:inline font-medium text-slate-800 max-w-[120px] truncate">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    <span
                      className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200"
                      title="Datos persistidos de forma segura en Firebase Firestore"
                    >
                      <Cloud className="w-3 h-3 text-emerald-600" />
                      <span className="hidden md:inline">Cloud</span>
                    </span>
                  </button>
                  <button
                    id="btn-sign-out"
                    onClick={handleSignOut}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer ml-1"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  id="btn-google-auth-header"
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs transition-colors cursor-pointer group"
                  title="Inicia sesión o regístrate con tu cuenta Gmail"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                  <span className="hidden sm:inline">Gmail / Registro</span>
                  <span className="sm:hidden">Gmail</span>
                </button>
              )
            )}

            {/* Install button */}
            <button
              id="btn-install-header"
              onClick={() => setInstallModalOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/70 cursor-pointer"
              title="Instalar en Android / Móvil"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Audio Toggle */}
            <button
              id="btn-mute-toggle"
              onClick={() => setAppSettings((p) => ({ ...p, muteSpeech: !p.muteSpeech }))}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/70 cursor-pointer"
              title={appSettings.muteSpeech ? 'Activar voz' : 'Silenciar voz'}
            >
              {appSettings.muteSpeech ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Settings modal */}
            <button
              id="btn-settings-modal"
              onClick={() => setSettingsModalOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/70 cursor-pointer"
              title="Configuración de la aplicación"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl px-3 sm:px-4 py-4 space-y-4">
        {/* Voice Interaction Orb Section */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 flex flex-col items-center">
          <VoiceOrb
            state={assistantState}
            onToggleListening={handleToggleListening}
            disabled={assistantState === 'thinking'}
          />

          {/* Realtime transcript & conversation preview */}
          <div className="w-full mt-2">
            <VoiceTranscript
              messages={messages}
              currentTranscript={currentTranscript}
              assistantState={assistantState}
            />
          </div>

          {/* Activity Feed */}
          {recentTools.length > 0 && (
            <div className="w-full mt-3">
              <ToolActivityFeed tools={recentTools} />
            </div>
          )}
        </div>

        {/* Quick Voice Prompt Suggestions */}
        {appSettings.showQuickPrompts && (
          <QuickPrompts
            onSelectPrompt={(text) => processUserPrompt(text)}
            disabled={assistantState === 'thinking'}
          />
        )}

        {/* Daily Manager Dashboard & Entity Views */}
        <DashboardView
          activeTab={activeTab}
          onTabChange={setActiveTab}
          events={events}
          whatsAppMessages={whatsAppMessages}
          emails={emails}
          alarms={alarms}
          reminders={reminders}
          notes={notes}
          onToggleAlarm={handleToggleAlarm}
          onToggleReminder={handleToggleReminder}
          onDeleteEvent={handleDeleteEvent}
          onDeleteNote={handleDeleteNote}
          onDeleteReminder={handleDeleteReminder}
          currentUser={currentUser}
          onOpenAuth={() => setAuthModalOpen(true)}
          onSignOut={handleSignOut}
          settings={appSettings}
          onUpdateSettings={(newSt) => setAppSettings((p) => ({ ...p, ...newSt }))}
          onOpenSettingsModal={() => setSettingsModalOpen(true)}
          onExportData={handleExportData}
          onResetData={handleResetData}
          isFirebaseConnected={isFirebaseConnected}
        />
      </main>

      {/* Gmail Sign In & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Classic Application Settings Modal */}
      <AppSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={appSettings}
        onUpdateSettings={(newSt) => setAppSettings((p) => ({ ...p, ...newSt }))}
        currentUser={currentUser}
        onOpenAuth={() => {
          setSettingsModalOpen(false);
          setAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* Advanced Audio Settings Modal */}
      <AudioSettingsModal
        isOpen={audioSettingsOpen}
        onClose={() => setAudioSettingsOpen(false)}
        speechRate={appSettings.speechRate}
        onRateChange={(rate) => {
          setAppSettings((p) => ({ ...p, speechRate: rate }));
          speechService.setRate(rate);
        }}
        isMuted={appSettings.muteSpeech}
        onToggleMute={() => setAppSettings((p) => ({ ...p, muteSpeech: !p.muteSpeech }))}
      />

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallAccepted={() => setDeferredPrompt(null)}
      />
    </div>
  );
}
