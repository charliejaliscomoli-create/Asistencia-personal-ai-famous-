export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  location?: string;
  category: 'trabajo' | 'personal' | 'salud' | 'reunión';
  syncedToGoogleCalendar?: boolean;
}

export interface WhatsAppMessageItem {
  id: string;
  recipientName: string;
  recipientPhone: string;
  message: string;
  timestamp: string;
  status: 'borrador' | 'enviado';
}

export interface EmailItem {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'recibido' | 'borrador' | 'enviado';
}

export interface AlarmItem {
  id: string;
  time: string; // HH:mm
  label: string;
  enabled: boolean;
  days: string[]; // ['L', 'M', 'X', 'J', 'V', 'S', 'D']
}

export interface ReminderItem {
  id: string;
  text: string;
  dueTime?: string;
  dueDate?: string;
  completed: boolean;
  priority: 'alta' | 'media' | 'baja';
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags: string[];
}

export interface ToolInvocation {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  resultSummary: string;
  timestamp: string;
  status: 'ejecutado' | 'pendiente' | 'error';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  toolsUsed?: ToolInvocation[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
  showQuickPrompts: boolean;
  speechRate: number;
  speechPitch: number;
  speechVoiceName: string;
  soundEffectsEnabled: boolean;
  muteSpeech: boolean;
  pushNotificationsEnabled: boolean;
  alarmVibration: boolean;
  autoListenAfterReply: boolean;
  confirmBeforeActions: boolean;
}
