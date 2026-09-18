import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Using fallback mode.');
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return aiClient;
}

export const calendarTool: FunctionDeclaration = {
  name: 'scheduleCalendarEvent',
  description: 'Programa una nueva cita, reunión o evento en el calendario.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Título o motivo de la reunión o cita' },
      date: { type: Type.STRING, description: 'Fecha en formato YYYY-MM-DD' },
      time: { type: Type.STRING, description: 'Hora de inicio en formato HH:mm (24 horas)' },
      durationMinutes: { type: Type.NUMBER, description: 'Duración estimada en minutos (por defecto 30)' },
      location: { type: Type.STRING, description: 'Ubicación física o enlace virtual (opcional)' },
      category: {
        type: Type.STRING,
        enum: ['trabajo', 'personal', 'salud', 'reunión'],
        description: 'Categoría del evento',
      },
    },
    required: ['title', 'date', 'time'],
  },
};

export const whatsAppTool: FunctionDeclaration = {
  name: 'sendWhatsAppMessage',
  description: 'Prepara o envía un mensaje de WhatsApp a un contacto o número telefónico.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      recipientName: { type: Type.STRING, description: 'Nombre de la persona o contacto' },
      recipientPhone: { type: Type.STRING, description: 'Número telefónico con código de país opcional' },
      message: { type: Type.STRING, description: 'Texto del mensaje a enviar' },
    },
    required: ['recipientName', 'message'],
  },
};

export const emailTool: FunctionDeclaration = {
  name: 'sendEmail',
  description: 'Redacta o envía un correo electrónico.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      to: { type: Type.STRING, description: 'Dirección de correo electrónico del destinatario' },
      subject: { type: Type.STRING, description: 'Asunto del correo' },
      body: { type: Type.STRING, description: 'Cuerpo o contenido del mensaje' },
    },
    required: ['to', 'subject', 'body'],
  },
};

export const alarmTool: FunctionDeclaration = {
  name: 'setAlarm',
  description: 'Establece o activa una alarma a una hora determinada.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      time: { type: Type.STRING, description: 'Hora de la alarma en formato HH:mm (24 horas)' },
      label: { type: Type.STRING, description: 'Etiqueta o descripción de la alarma' },
      days: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Días de repetición (L, M, X, J, V, S, D)',
      },
    },
    required: ['time'],
  },
};

export const reminderTool: FunctionDeclaration = {
  name: 'createReminder',
  description: 'Crea un recordatorio o tarea pendiente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING, description: 'Descripción o texto del recordatorio' },
      dueDate: { type: Type.STRING, description: 'Fecha límite opcional (YYYY-MM-DD)' },
      dueTime: { type: Type.STRING, description: 'Hora límite opcional (HH:mm)' },
      priority: {
        type: Type.STRING,
        enum: ['alta', 'media', 'baja'],
        description: 'Nivel de prioridad',
      },
    },
    required: ['text'],
  },
};

export const noteTool: FunctionDeclaration = {
  name: 'saveNote',
  description: 'Guarda una nota o anotación de texto con título y contenido.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Título de la nota' },
      content: { type: Type.STRING, description: 'Contenido completo o ideas dictadas' },
      tags: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Etiquetas o palabras clave para clasificar la nota',
      },
    },
    required: ['title', 'content'],
  },
};

function fallbackLocalQuery(prompt: string): { reply: string; toolCalls: any[] } {
  const normalized = prompt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const toolCalls: any[] = [];
  let reply = '';

  // Simple intent detection for zero-downtime resilience
  if (normalized.includes('alarma')) {
    const timeMatch = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|de la manana|de la tarde|de la noche)?/);
    let hour = timeMatch ? parseInt(timeMatch[1], 10) : 8;
    const minute = timeMatch && timeMatch[2] ? timeMatch[2] : '00';
    if (timeMatch && (timeMatch[3]?.includes('tarde') || timeMatch[3]?.includes('noche') || timeMatch[3]?.includes('pm')) && hour < 12) {
      hour += 12;
    }
    const formattedTime = `${String(hour).padStart(2, '0')}:${minute}`;
    toolCalls.push({
      name: 'setAlarm',
      args: { time: formattedTime, label: 'Alarma activada por voz' },
    });
    reply = `He programado la alarma a las ${formattedTime}.`;
  } else if (normalized.includes('recuerd') || normalized.includes('recordator')) {
    const text = prompt.replace(/recuérdame|recuerdame|recuerda|recordatorio/gi, '').trim() || prompt;
    toolCalls.push({
      name: 'createReminder',
      args: { text, priority: 'media' },
    });
    reply = `Recordatorio guardado: "${text}".`;
  } else if (normalized.includes('nota') || normalized.includes('anota')) {
    const content = prompt.replace(/nota|anota|guarda una nota/gi, '').trim() || prompt;
    toolCalls.push({
      name: 'saveNote',
      args: { title: content.slice(0, 30) || 'Nota rápida', content },
    });
    reply = `Nota guardada con éxito: "${content.slice(0, 30)}".`;
  } else if (normalized.includes('whatsapp') || normalized.includes('mensaje')) {
    toolCalls.push({
      name: 'sendWhatsAppMessage',
      args: { recipientName: 'Contacto', message: prompt },
    });
    reply = `Mensaje de WhatsApp preparado.`;
  } else if (normalized.includes('correo') || normalized.includes('email') || normalized.includes('mail')) {
    toolCalls.push({
      name: 'sendEmail',
      args: { to: 'contacto@ejemplo.com', subject: 'Mensaje de voz', body: prompt },
    });
    reply = `Borrador de correo preparado.`;
  } else if (normalized.includes('cita') || normalized.includes('reunion') || normalized.includes('calendario') || normalized.includes('evento')) {
    toolCalls.push({
      name: 'scheduleCalendarEvent',
      args: { title: prompt, date: new Date().toISOString().slice(0, 10), time: '10:00' },
    });
    reply = `Cita agendada en tu calendario.`;
  } else {
    reply = `Entendido. Procesé tu solicitud: "${prompt}". ¿Deseas hacer algo más?`;
  }

  return { reply, toolCalls };
}

export async function processAssistantQuery(prompt: string): Promise<{ reply: string; toolCalls: any[] }> {
  const todayDate = new Date().toISOString().slice(0, 10);
  const systemInstruction = `Eres un Asistente Personal por Voz altamente eficiente, inteligente y conciso.
Tu objetivo es ayudar al usuario a gestionar su día a día:
1. Agendar citas y reuniones (Google Calendar).
2. Redactar y preparar mensajes de WhatsApp.
3. Redactar correos electrónicos.
4. Programar alarmas.
5. Crear recordatorios.
6. Guardar notas dictadas por voz.

REGLAS OBLIGATORIAS:
- La fecha actual es: ${todayDate}.
- Respuestas directas, breves y amables (máximo 1 o 2 oraciones breves, ideales para ser leídas por voz).
- Siempre invoca las funciones (tools) correspondientes si la petición del usuario lo amerita.
- Responde siempre en español.`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackLocalQuery(prompt);
  }

  const modelsToTry = ['gemini-3.6-flash', 'gemini-flash-latest'];
  const ai = getAI();

  for (const model of modelsToTry) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout calling model')), 2500)
      );

      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            tools: [{ functionDeclarations: [calendarTool, whatsAppTool, emailTool, alarmTool, reminderTool, noteTool] }],
            temperature: 0.2,
          },
        }),
        timeoutPromise,
      ]);

      const candidates = response.candidates || [];
      const firstCandidate = candidates[0];
      const functionCalls = firstCandidate?.content?.parts?.filter((p: any) => p.functionCall) || [];

      const toolCalls = functionCalls.map((p: any) => ({
        name: p.functionCall.name,
        args: p.functionCall.args,
      }));

      let textReply = response.text || '';
      if (!textReply && toolCalls.length > 0) {
        const first = toolCalls[0];
        if (first.name === 'setAlarm') textReply = `He programado la alarma a las ${first.args?.time || ''}.`;
        else if (first.name === 'scheduleCalendarEvent') textReply = `Cita "${first.args?.title || ''}" agendada correctamente.`;
        else if (first.name === 'sendWhatsAppMessage') textReply = `Mensaje de WhatsApp preparado para ${first.args?.recipientName || ''}.`;
        else if (first.name === 'sendEmail') textReply = `Correo redactado para ${first.args?.to || ''}.`;
        else if (first.name === 'createReminder') textReply = `Recordatorio guardado: "${first.args?.text || ''}".`;
        else if (first.name === 'saveNote') textReply = `Nota "${first.args?.title || ''}" guardada con éxito.`;
        else textReply = 'Acción realizada correctamente.';
      }

      return {
        reply: textReply || 'Entendido. ¿En qué más puedo ayudarte?',
        toolCalls,
      };
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err?.message || err);
      // continue to next model
    }
  }

  // Graceful fallback if external AI models are temporarily down or rate-limited
  return fallbackLocalQuery(prompt);
}
