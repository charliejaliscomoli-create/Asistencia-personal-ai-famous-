import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mic,
  Send,
  Volume2,
  VolumeX,
  Settings,
  Sparkles,
  RefreshCw,
  Info,
  Calendar,
  MessageSquare,
  Mail,
  Clock,
  Bell,
  StickyNote,
  Cloud,
  CloudCheck,
  LogIn,
  LogOut,
  User as UserIcon,
  Smartphone,
} from 'lucide-react';
import { VoiceOrb } from './components/VoiceOrb';
import { VoiceTranscript } from './components/VoiceTranscript';
import { ToolActivityFeed } from './components/ToolActivityFeed';
import { DashboardView } from './components/DashboardView';
import { QuickPrompts } from './components/QuickPrompts';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { InstallAppModal } from './components/InstallAppModal';
import {
  CalendarEventItem,
  WhatsAppMessageItem,
  EmailItem,
  AlarmItem,
  ReminderItem,
  NoteItem,
  AssistantState,
  ChatMessage,
  ToolInvocation,
} from './types';
import {
  initialEmails,
  initialCalendarEvents,
  initialNotes,
  initialWhatsAppMessages,
  initialAlarms,
  initialReminders,
} from './data/initialData';
import { speechService } from './services/speechService';
import { soundEffects } from './services/audioService';
import {
  auth,
  testFirestoreConnection,
  signInWithGoogle,
  logoutUser,
  onAuthStateChanged,
  type User,
} from './lib/firebase';
import {
  subscribeUserData,
  saveEventToFirestore,
  saveAlarmToFirestore,
  saveReminderToFirestore,
  saveNoteToFirestore,
  saveMessageToFirestore,
  saveEmailToFirestore,
  deleteItemFromFirestore,
} from './services/firestoreSync';

export default function App() {
  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  // Assistant Status
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null);
  const [latestTools, setLatestTools] = useState<ToolInvocation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [textInput, setTextInput] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('resumen');

  // Listen for native Android PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const choice = await deferredPrompt.userChoice;
        console.log('Install prompt result:', choice.outcome);
      } catch (err) {
        console.warn('Install error:', err);
      }
      setDeferredPrompt(null);
    }
  };

  // Daily Manager State with LocalStorage persistence fallback
  const [events, setEvents] = useState<CalendarEventItem[]>(() => {
    const saved = localStorage.getItem('asistente_events');
    return saved ? JSON.parse(saved) : initialCalendarEvents;
  });

  const [whatsAppMessages, setWhatsAppMessages] = useState<WhatsAppMessageItem[]>(() => {
    const saved = localStorage.getItem('asistente_wa');
    return saved ? JSON.parse(saved) : initialWhatsAppMessages;
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

  // Conversation history for multi-turn parameter prompting
  const chatHistoryRef = useRef<Array<{ role: 'user' | 'assistant'; parts: any[] }>>([]);

  // Test Firebase connection and track Auth state
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore real-time collections when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    setIsSyncingCloud(true);
    const unsubscribeSync = subscribeUserData(currentUser.uid, {
      onEvents: (liveEvents) => {
        if (liveEvents.length > 0) setEvents(liveEvents);
      },
      onAlarms: (liveAlarms) => {
        if (liveAlarms.length > 0) setAlarms(liveAlarms);
      },
      onReminders: (liveReminders) => {
        if (liveReminders.length > 0) setReminders(liveReminders);
      },
      onNotes: (liveNotes) => {
        if (liveNotes.length > 0) setNotes(liveNotes);
      },
      onMessages: (liveMsgs) => {
        if (liveMsgs.length > 0) setWhatsAppMessages(liveMsgs);
      },
      onEmails: (liveEmails) => {
        if (liveEmails.length > 0) setEmails(liveEmails);
      },
    });

    setIsSyncingCloud(false);
    return () => unsubscribeSync();
  }, [currentUser]);

  // Sync to localStorage as local fallback
  useEffect(() => {
    localStorage.setItem('asistente_events', JSON.stringify(events));
  }, [events]);
  useEffect(() => {
    localStorage.setItem('asistente_wa', JSON.stringify(whatsAppMessages));
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

  // Handle Google Login
  const handleGoogleSignIn = async () => {
    try {
      setErrorMessage(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setErrorMessage(err?.message || 'No se pudo iniciar sesión con Google.');
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  // Main interaction handler
  const processUserPrompt = useCallback(
    async (promptText: string) => {
      const trimmed = promptText.trim();
      if (!trimmed) return;

      setErrorMessage(null);
      setAssistantState('thinking');
      setCurrentTranscript('');

      // Add to conversation history
      chatHistoryRef.current.push({
        role: 'user',
        parts: [{ text: trimmed }],
      });

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            history: chatHistoryRef.current.slice(-6),
            contextData: {
              eventosCount: events.length,
              recordatoriosCount: reminders.filter((r) => !r.completed).length,
              alarmasCount: alarms.filter((a) => a.enabled).length,
              correosCount: emails.length,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Error en el servidor (${response.status})`);
        }

        const data = await response.json();
        const replyText = data.reply || 'He recibido tu solicitud.';
        const tools: ToolInvocation[] = data.toolInvocations || [];

        // Apply tool modifications to client state
        if (tools.length > 0) {
          soundEffects.playActionSuccess();
          setLatestTools(tools);

          tools.forEach((tool) => {
            if (tool.result && tool.result.status === 'success') {
              const itemData = tool.result.data;
              switch (tool.name) {
                case 'crearEventoCalendario':
                case 'gestionar_calendario':
                  if (itemData) {
                    const newEvent: CalendarEventItem = {
                      id: tool.result.id || `evt_${Date.now()}`,
                      title: itemData.title,
                      date: itemData.date,
                      time: itemData.time,
                      duration: itemData.duration,
                      description: itemData.description,
                      category: 'Voz',
                    };
                    setEvents((prev) => [newEvent, ...prev]);
                    if (currentUser) {
                      saveEventToFirestore(currentUser.uid, newEvent).catch(console.warn);
                    }
                    setActiveTab('calendario');
                  }
                  break;
                case 'enviarMensajeWhatsApp':
                case 'enviar_whatsapp':
                  if (itemData) {
                    const newWa: WhatsAppMessageItem = {
                      id: tool.result.id || `wa_${Date.now()}`,
                      recipient: itemData.recipient,
                      phone: itemData.phone,
                      message: itemData.message,
                      timestamp: 'Ahora mismo',
                      status: 'delivered',
                    };
                    setWhatsAppMessages((prev) => [newWa, ...prev]);
                    if (currentUser) {
                      saveMessageToFirestore(currentUser.uid, newWa).catch(console.warn);
                    }
                    setActiveTab('whatsapp');
                  }
                  break;
                case 'enviarCorreo':
                case 'enviar_correo':
                  if (itemData) {
                    const newEmail: EmailItem = {
                      id: tool.result.id || `email_${Date.now()}`,
                      to: itemData.to,
                      subject: itemData.subject,
                      body: itemData.body,
                      date: 'Ahora mismo',
                      status: 'sent',
                    };
                    setEmails((prev) => [newEmail, ...prev]);
                    if (currentUser) {
                      saveEmailToFirestore(currentUser.uid, newEmail).catch(console.warn);
                    }
                    setActiveTab('correos');
                  }
                  break;
                case 'programarAlarmaORecordatorio':
                case "programarAlarmaO'Recordatorio":
                case 'programarAlarmaO_Recordatorio':
                  if (itemData) {
                    if (tool.result.type === 'alarm' || ('label' in itemData && 'time' in itemData && !('text' in itemData))) {
                      const newAlarm: AlarmItem = {
                        id: tool.result.id || `alarm_${Date.now()}`,
                        time: itemData.time,
                        label: itemData.label,
                        enabled: true,
                        days: ['Hoy'],
                      };
                      setAlarms((prev) => [newAlarm, ...prev]);
                      if (currentUser) {
                        saveAlarmToFirestore(currentUser.uid, newAlarm).catch(console.warn);
                      }
                      setActiveTab('alarmas');
                    } else {
                      const newReminder: ReminderItem = {
                        id: tool.result.id || `rem_${Date.now()}`,
                        text: itemData.text || itemData.label || 'Recordatorio',
                        dueTime: itemData.dueTime || itemData.time || 'Hoy',
                        completed: false,
                        priority: itemData.priority || 'alta',
                      };
                      setReminders((prev) => [newReminder, ...prev]);
                      if (currentUser) {
                        saveReminderToFirestore(currentUser.uid, newReminder).catch(console.warn);
                      }
                      setActiveTab('recordatorios');
                    }
                  }
                  break;
                case 'configurar_alarma':
                  if (itemData) {
                    const newAlarm: AlarmItem = {
                      id: tool.result.id || `alarm_${Date.now()}`,
                      time: itemData.time,
                      label: itemData.label,
                      enabled: true,
                      days: ['Hoy'],
                    };
                    setAlarms((prev) => [newAlarm, ...prev]);
                    if (currentUser) {
                      saveAlarmToFirestore(currentUser.uid, newAlarm).catch(console.warn);
                    }
                    setActiveTab('alarmas');
                  }
                  break;
                case 'crear_recordatorio':
                  if (itemData) {
                    const newReminder: ReminderItem = {
                      id: tool.result.id || `rem_${Date.now()}`,
                      text: itemData.text,
                      dueTime: itemData.dueTime,
                      completed: false,
                      priority: itemData.priority || 'media',
                    };
                    setReminders((prev) => [newReminder, ...prev]);
                    if (currentUser) {
                      saveReminderToFirestore(currentUser.uid, newReminder).catch(console.warn);
                    }
                    setActiveTab('recordatorios');
                  }
                  break;
                case 'crear_nota':
                  if (itemData) {
                    const newNote: NoteItem = {
                      id: tool.result.id || `note_${Date.now()}`,
                      title: itemData.title,
                      content: itemData.content,
                      createdAt: 'Ahora mismo',
                      color: '#FEF3C7',
                    };
                    setNotes((prev) => [newNote, ...prev]);
                    if (currentUser) {
                      saveNoteToFirestore(currentUser.uid, newNote).catch(console.warn);
                    }
                    setActiveTab('notas');
                  }
                  break;
              }
            }
          });
        }

        // Add assistant reply to history
        chatHistoryRef.current.push({
          role: 'assistant',
          parts: [{ text: replyText }],
        });

        // Set lastMessage state
        setLastMessage({
          id: `msg_${Date.now()}`,
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolInvocations: tools,
        });

        // Speak reply using speech synthesis (maximum 2 sentences, clear and concise)
        speechService.speak(
          replyText,
          () => setAssistantState('speaking'),
          () => setAssistantState('idle')
        );
      } catch (err: any) {
        console.error('Error processing voice query:', err);
        setErrorMessage(
          err?.message || 'Hubo un inconveniente al comunicarse con el asistente. Intenta de nuevo.'
        );
        setAssistantState('idle');
      }
    },
    [events.length, reminders, alarms, emails.length]
  );

  // Toggle speech recognition
  const handleToggleListening = useCallback(() => {
    if (assistantState === 'listening') {
      speechService.stopListening();
      if (currentTranscript.trim()) {
        processUserPrompt(currentTranscript);
      } else {
        setAssistantState('idle');
      }
      return;
    }

    if (assistantState === 'speaking') {
      speechService.stopSpeaking();
      setAssistantState('idle');
      return;
    }

    // Play tone and start microphone
    soundEffects.playMicStart();
    const started = speechService.startListening({
      onStart: () => {
        setAssistantState('listening');
        setErrorMessage(null);
      },
      onResult: (transcript, isFinal) => {
        setCurrentTranscript(transcript);
        if (isFinal) {
          speechService.stopListening();
          processUserPrompt(transcript);
        }
      },
      onError: (err) => {
        setErrorMessage(err);
        setAssistantState('idle');
      },
      onEnd: () => {
        setAssistantState((prev) => (prev === 'listening' ? 'idle' : prev));
      },
    });

    if (!started) {
      setAssistantState('idle');
    }
  }, [assistantState, currentTranscript, processUserPrompt]);

  // Handle Spacebar shortcut for speech
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handleToggleListening();
      } else if (e.code === 'Escape') {
        speechService.stopListening();
        speechService.stopSpeaking();
        setAssistantState('idle');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleListening]);

  // Replay voice button
  const handleReplayVoice = (text: string) => {
    speechService.speak(
      text,
      () => setAssistantState('speaking'),
      () => setAssistantState('idle')
    );
  };

  // Toggle mute
  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    speechService.setMuted(newMuted);
    if (newMuted && assistantState === 'speaking') {
      setAssistantState('idle');
    }
  };

  // Stop current speaking
  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    setAssistantState('idle');
  };

  // Text input submit
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || assistantState === 'thinking') return;
    const text = textInput;
    setTextInput('');
    processUserPrompt(text);
  };

  // Entity controls
  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
      const target = updated.find((a) => a.id === id);
      if (currentUser && target) {
        saveAlarmToFirestore(currentUser.uid, target).catch(console.warn);
      }
      return updated;
    });
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r));
      const target = updated.find((r) => r.id === id);
      if (currentUser && target) {
        saveReminderToFirestore(currentUser.uid, target).catch(console.warn);
      }
      return updated;
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (currentUser) {
      deleteItemFromFirestore(currentUser.uid, 'events', id).catch(console.warn);
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (currentUser) {
      deleteItemFromFirestore(currentUser.uid, 'notes', id).catch(console.warn);
    }
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    if (currentUser) {
      deleteItemFromFirestore(currentUser.uid, 'reminders', id).catch(console.warn);
    }
  };

  // Reset demo data
  const handleResetData = () => {
    if (confirm('¿Deseas restaurar los datos iniciales de ejemplo?')) {
      setEvents(initialCalendarEvents);
      setWhatsAppMessages(initialWhatsAppMessages);
      setEmails(initialEmails);
      setAlarms(initialAlarms);
      setReminders(initialReminders);
      setNotes(initialNotes);
      setLatestTools([]);
      setLastMessage(null);
      chatHistoryRef.current = [];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900" id="voice-assistant-app">
      {/* Top Application Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-900 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Asistente de Voz Personal
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Gemini Flash Tools
                </span>
              </h1>
              <p className="text-[11px] text-slate-500">
                Gestión inteligente por voz con Firebase Cloud Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Firebase Auth & Sync Status Pill */}
            {!isAuthLoading && (
              currentUser ? (
                <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
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
                    <span className="hidden md:inline">Sincronizado</span>
                  </span>
                  <button
                    id="btn-sign-out"
                    onClick={handleSignOut}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  id="btn-google-sign-in"
                  onClick={handleGoogleSignIn}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                  title="Inicia sesión con Google para sincronizar tus datos en la nube con Firebase"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Conectar Firebase</span>
                </button>
              )
            )}

            <button
              id="btn-install-apk-modal"
              onClick={() => setInstallModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
              title="Descargar o instalar como APK en Android"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar APK</span>
            </button>

            <button
              id="btn-settings-modal"
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/70 cursor-pointer"
              title="Ajustes de voz y reglas"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              id="btn-reset-demo"
              onClick={handleResetData}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/70 cursor-pointer"
              title="Restaurar datos de ejemplo"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto pb-12">
        {/* Core Voice Interaction Orb */}
        <section className="pt-6 pb-2" aria-label="Control por voz">
          <VoiceOrb
            state={assistantState}
            onToggleListening={handleToggleListening}
            isListening={assistantState === 'listening'}
            isSpeaking={assistantState === 'speaking'}
            onStopSpeaking={handleStopSpeaking}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        </section>

        {/* Live Transcript & Assistant Voice Output */}
        <VoiceTranscript
          currentTranscript={currentTranscript}
          isListening={assistantState === 'listening'}
          lastMessage={lastMessage}
          onReplayVoice={handleReplayVoice}
          isSpeaking={assistantState === 'speaking'}
          errorMessage={errorMessage}
        />

        {/* Real-time Tool Invocations Notification */}
        <ToolActivityFeed
          latestTools={latestTools}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* Text Input Fallback Bar */}
        <div className="max-w-2xl mx-auto px-4 my-3">
          <form
            onSubmit={handleTextSubmit}
            className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-1.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
          >
            <button
              type="button"
              id="btn-input-mic"
              onClick={handleToggleListening}
              className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                assistantState === 'listening'
                  ? 'bg-emerald-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title="Hablar por micrófono"
            >
              <Mic className="w-4 h-4" />
            </button>
            <input
              type="text"
              id="voice-text-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="O escribe tu petición (ej. Envía un WhatsApp a Carlos o Agenda reunión mañana)..."
              className="flex-1 text-xs sm:text-sm bg-transparent border-none text-slate-800 placeholder:text-slate-400 focus:outline-none"
              disabled={assistantState === 'thinking'}
            />
            <button
              type="submit"
              id="btn-send-message"
              disabled={!textInput.trim() || assistantState === 'thinking'}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Enviar comando"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Quick Voice Prompt Suggestions */}
        <QuickPrompts
          onSelectPrompt={(text) => processUserPrompt(text)}
          disabled={assistantState === 'thinking'}
        />

        {/* Daily Manager Dashboard & Entity Views */}
        <DashboardView
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
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
        />
      </main>

      {/* Settings Modal */}
      <AudioSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Android APK & WebAPK Install Modal */}
      <InstallAppModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onTriggerInstall={handleTriggerInstall}
      />
    </div>
  );
}
