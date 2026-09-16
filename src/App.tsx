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
} from 'lucide-react';
import { VoiceOrb } from './components/VoiceOrb';
import { VoiceTranscript } from './components/VoiceTranscript';
import { ToolActivityFeed } from './components/ToolActivityFeed';
import { DashboardView } from './components/DashboardView';
import { QuickPrompts } from './components/QuickPrompts';
import { AudioSettingsModal } from './components/AudioSettingsModal';
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

export default function App() {
  // Assistant Status
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null);
  const [latestTools, setLatestTools] = useState<ToolInvocation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [textInput, setTextInput] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');

  // Daily Manager State with LocalStorage persistence
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

  // Sync to localStorage
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
                    setEvents((prev) => [
                      {
                        id: tool.result.id || `evt_${Date.now()}`,
                        title: itemData.title,
                        date: itemData.date,
                        time: itemData.time,
                        duration: itemData.duration,
                        description: itemData.description,
                        category: 'Voz',
                      },
                      ...prev,
                    ]);
                    setActiveTab('calendario');
                  }
                  break;
                case 'enviarMensajeWhatsApp':
                case 'enviar_whatsapp':
                  if (itemData) {
                    setWhatsAppMessages((prev) => [
                      {
                        id: tool.result.id || `wa_${Date.now()}`,
                        recipient: itemData.recipient,
                        phone: itemData.phone,
                        message: itemData.message,
                        timestamp: 'Ahora mismo',
                        status: 'delivered',
                      },
                      ...prev,
                    ]);
                    setActiveTab('whatsapp');
                  }
                  break;
                case 'enviarCorreo':
                case 'enviar_correo':
                  if (itemData) {
                    setEmails((prev) => [
                      {
                        id: tool.result.id || `email_${Date.now()}`,
                        to: itemData.to,
                        subject: itemData.subject,
                        body: itemData.body,
                        date: 'Ahora mismo',
                        status: 'sent',
                      },
                      ...prev,
                    ]);
                    setActiveTab('correos');
                  }
                  break;
                case 'programarAlarmaORecordatorio':
                case "programarAlarmaO'Recordatorio":
                case 'programarAlarmaO_Recordatorio':
                  if (itemData) {
                    if (tool.result.type === 'alarm' || ('label' in itemData && 'time' in itemData && !('text' in itemData))) {
                      setAlarms((prev) => [
                        {
                          id: tool.result.id || `alarm_${Date.now()}`,
                          time: itemData.time,
                          label: itemData.label,
                          enabled: true,
                          days: ['Hoy'],
                        },
                        ...prev,
                      ]);
                      setActiveTab('alarmas');
                    } else {
                      setReminders((prev) => [
                        {
                          id: tool.result.id || `rem_${Date.now()}`,
                          text: itemData.text || itemData.label || 'Recordatorio',
                          dueTime: itemData.dueTime || itemData.time || 'Hoy',
                          completed: false,
                          priority: itemData.priority || 'alta',
                        },
                        ...prev,
                      ]);
                      setActiveTab('recordatorios');
                    }
                  }
                  break;
                case 'configurar_alarma':
                  if (itemData) {
                    setAlarms((prev) => [
                      {
                        id: tool.result.id || `alarm_${Date.now()}`,
                        time: itemData.time,
                        label: itemData.label,
                        enabled: true,
                        days: ['Hoy'],
                      },
                      ...prev,
                    ]);
                    setActiveTab('alarmas');
                  }
                  break;
                case 'crear_recordatorio':
                  if (itemData) {
                    setReminders((prev) => [
                      {
                        id: tool.result.id || `rem_${Date.now()}`,
                        text: itemData.text,
                        dueTime: itemData.dueTime,
                        completed: false,
                        priority: itemData.priority || 'media',
                      },
                      ...prev,
                    ]);
                    setActiveTab('recordatorios');
                  }
                  break;
                case 'crear_nota':
                  if (itemData) {
                    setNotes((prev) => [
                      {
                        id: tool.result.id || `note_${Date.now()}`,
                        title: itemData.title,
                        content: itemData.content,
                        createdAt: 'Ahora mismo',
                        color: '#FEF3C7',
                      },
                      ...prev,
                    ]);
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
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
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
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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
                Gestión inteligente por voz de correos, calendario, notas, WhatsApp y alarmas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-settings-modal"
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/70"
              title="Ajustes de voz y reglas"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              id="btn-reset-demo"
              onClick={handleResetData}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/70"
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
    </div>
  );
}
