export interface EmailItem {
  id: string;
  to: string;
  from?: string;
  subject: string;
  body: string;
  date: string;
  status: 'sent' | 'received' | 'draft';
}

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration?: string;
  description?: string;
  category?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  color?: string;
}

export interface WhatsAppMessageItem {
  id: string;
  recipient: string;
  phone?: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered';
}

export interface AlarmItem {
  id: string;
  time: string; // HH:mm
  label: string;
  enabled: boolean;
  days: string[];
}

export interface ReminderItem {
  id: string;
  text: string;
  dueTime: string;
  completed: boolean;
  priority: 'baja' | 'media' | 'alta';
}

export interface ToolInvocation {
  name: string;
  args: Record<string, any>;
  result?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  toolInvocations?: ToolInvocation[];
}

export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';
