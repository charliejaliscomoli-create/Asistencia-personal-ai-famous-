import {
  CalendarEventItem,
  WhatsAppMessageItem,
  EmailItem,
  AlarmItem,
  ReminderItem,
  NoteItem,
} from '../types';

export const initialEvents: CalendarEventItem[] = [
  {
    id: 'ev-1',
    title: 'Reunión de Estrategia Semanal',
    date: new Date().toISOString().slice(0, 10),
    time: '10:00',
    durationMinutes: 45,
    location: 'Google Meet',
    category: 'trabajo',
    syncedToGoogleCalendar: true,
  },
  {
    id: 'ev-2',
    title: 'Consulta Médica de Control',
    date: new Date().toISOString().slice(0, 10),
    time: '16:30',
    durationMinutes: 30,
    location: 'Centro Médico Sur',
    category: 'salud',
    syncedToGoogleCalendar: true,
  },
];

export const initialWhatsApp: WhatsAppMessageItem[] = [
  {
    id: 'wa-1',
    recipientName: 'Carlos Gómez',
    recipientPhone: '+34 612 345 678',
    message: '¡Hola Carlos! Te confirmo que revisé la propuesta y avanzamos mañana.',
    timestamp: 'Hoy, 09:15',
    status: 'enviado',
  },
  {
    id: 'wa-2',
    recipientName: 'Equipo de Proyecto',
    recipientPhone: '+34 699 000 111',
    message: 'Recuerden enviar sus reportes antes de las 18:00.',
    timestamp: 'Hoy, 11:30',
    status: 'borrador',
  },
];

export const initialEmails: EmailItem[] = [
  {
    id: 'em-1',
    to: 'ana.martinez@empresa.com',
    subject: 'Resumen Ejecutivo y Próximos Pasos',
    body: 'Hola Ana, te adjunto el resumen acordado en la sesión matutina para tu revisión.',
    timestamp: 'Hoy, 08:45',
    read: true,
    type: 'enviado',
  },
  {
    id: 'em-2',
    to: 'soporte@proveedor.com',
    subject: 'Confirmación de Licencias Anuales',
    body: 'Estimado equipo, solicitamos la renovación formal de los accesos cloud.',
    timestamp: 'Ayer, 17:20',
    read: false,
    type: 'recibido',
  },
];

export const initialAlarms: AlarmItem[] = [
  {
    id: 'al-1',
    time: '07:00',
    label: 'Despertar y rutina matutina',
    enabled: true,
    days: ['L', 'M', 'X', 'J', 'V'],
  },
  {
    id: 'al-2',
    time: '14:00',
    label: 'Almuerzo y descanso breve',
    enabled: true,
    days: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  },
];

export const initialReminders: ReminderItem[] = [
  {
    id: 'rem-1',
    text: 'Enviar factura mensual de servicios cloud',
    dueTime: '12:00',
    dueDate: new Date().toISOString().slice(0, 10),
    completed: false,
    priority: 'alta',
  },
  {
    id: 'rem-2',
    text: 'Comprar cartucho de impresora y papel bond',
    dueDate: new Date().toISOString().slice(0, 10),
    completed: true,
    priority: 'baja',
  },
];

export const initialNotes: NoteItem[] = [
  {
    id: 'nt-1',
    title: 'Ideas para optimización del flujo móvil',
    content: '1. Integrar comandos de voz directos en Android.\n2. Notificaciones push con respuestas rápidas.\n3. Modo sin conexión para notas rápidas.',
    updatedAt: 'Hoy, 10:20',
    tags: ['Ideas', 'App', 'Voz'],
  },
];
