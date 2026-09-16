import { EmailItem, CalendarEventItem, NoteItem, WhatsAppMessageItem, AlarmItem, ReminderItem } from '../types';

export const initialEmails: EmailItem[] = [
  {
    id: 'email_1',
    to: 'tu@correo.com',
    from: 'claudia.lopez@empresa.com',
    subject: 'Avance del diseño de producto',
    body: 'Hola, te comparto el enlace a los bocetos aprobados. Quedo atenta a tus comentarios.',
    date: 'Hoy, 09:30 AM',
    status: 'received',
  },
  {
    id: 'email_2',
    to: 'soporte@banco.com',
    from: 'tu@correo.com',
    subject: 'Solicitud de estado de cuenta',
    body: 'Buen día, requiero el comprobante fiscal del mes de agosto. Saludos cordiales.',
    date: 'Ayer, 04:15 PM',
    status: 'sent',
  },
];

export const initialCalendarEvents: CalendarEventItem[] = [
  {
    id: 'evt_1',
    title: 'Revisión semanal de proyectos',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    duration: '45 min',
    description: 'Sincronización con el equipo de ingeniería y diseño.',
    category: 'Trabajo',
  },
  {
    id: 'evt_2',
    title: 'Consulta médica de rutina',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '04:30 PM',
    duration: '30 min',
    description: 'Clínica San José, Consultorio 302.',
    category: 'Salud',
  },
];

export const initialNotes: NoteItem[] = [
  {
    id: 'note_1',
    title: 'Ideas para el fin de semana',
    content: 'Comprar frutas en el mercado orgánico, preparar cena italiana y salir a caminar al parque.',
    createdAt: 'Hoy, 08:10 AM',
    color: '#FEF3C7',
  },
  {
    id: 'note_2',
    title: 'Recomendaciones de libros',
    content: 'Hábitos Atómicos de James Clear, y Pensar rápido, pensar despacio de Daniel Kahneman.',
    createdAt: 'Ayer',
    color: '#E0E7FF',
  },
];

export const initialWhatsAppMessages: WhatsAppMessageItem[] = [
  {
    id: 'wa_1',
    recipient: 'Carlos Méndez',
    phone: '+52 55 1234 5678',
    message: 'Hola Carlos, confirmo nuestra reunión de mañana a las 3 PM.',
    timestamp: '11:20 AM',
    status: 'delivered',
  },
  {
    id: 'wa_2',
    recipient: 'Mamá',
    message: 'Ya llegué a casa, todo bien por aquí. Te llamo al rato.',
    timestamp: 'Ayer',
    status: 'delivered',
  },
];

export const initialAlarms: AlarmItem[] = [
  {
    id: 'alarm_1',
    time: '07:00 AM',
    label: 'Despertador matutino',
    enabled: true,
    days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
  },
  {
    id: 'alarm_2',
    time: '08:30 PM',
    label: 'Lectura nocturna',
    enabled: false,
    days: ['Todos los días'],
  },
];

export const initialReminders: ReminderItem[] = [
  {
    id: 'rem_1',
    text: 'Pagar servicio de luz e internet',
    dueTime: 'Hoy, 06:00 PM',
    completed: false,
    priority: 'alta',
  },
  {
    id: 'rem_2',
    text: 'Comprar café tostado en grano',
    dueTime: 'Mañana, 12:00 PM',
    completed: false,
    priority: 'media',
  },
  {
    id: 'rem_3',
    text: 'Enviar reporte mensual de métricas',
    dueTime: 'Viernes',
    completed: true,
    priority: 'baja',
  },
];
