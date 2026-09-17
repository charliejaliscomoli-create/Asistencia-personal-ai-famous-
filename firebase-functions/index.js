// Firebase Cloud Functions (index.js)
// Asistente Personal por Voz impulsado por Gemini (@google/genai)
const { GoogleGenAI, Type } = require('@google/genai');
const functions = require('firebase-functions');

// Inicializar cliente Gemini con clave de entorno
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Esquemas formales de herramientas compiladas
const toolsDeclarations = [
  {
    name: "crearEventoCalendario",
    description: "Agrega una nueva cita o evento al calendario del usuario.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        titulo: {
          type: Type.STRING,
          description: "Título o descripción corta del evento."
        },
        fechaInicio: {
          type: Type.STRING,
          description: "Fecha y hora de inicio en formato ISO 8601 (ej. 2026-09-16T10:00:00Z)."
        },
        duracionMinutos: {
          type: Type.NUMBER,
          description: "Duración estimada del evento en minutos. Por defecto 30."
        }
      },
      required: ["titulo", "fechaInicio"]
    }
  },
  {
    name: "enviarCorreo",
    description: "Envía un correo electrónico a través de Gmail.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        destinatario: {
          type: Type.STRING,
          description: "Dirección de correo electrónico del destinatario."
        },
        asunto: {
          type: Type.STRING,
          description: "Asunto del correo."
        },
        cuerpo: {
          type: Type.STRING,
          description: "Contenido o mensaje del correo."
        }
      },
      required: ["destinatario", "asunto", "cuerpo"]
    }
  },
  {
    name: "enviarMensajeWhatsApp",
    description: "Envía un mensaje de texto por WhatsApp a un contacto.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        contacto: {
          type: Type.STRING,
          description: "Nombre del contacto o número de teléfono con código de país."
        },
        mensaje: {
          type: Type.STRING,
          description: "Texto del mensaje a enviar."
        }
      },
      required: ["contacto", "mensaje"]
    }
  },
  {
    name: "programarAlarmaORecordatorio",
    description: "Establece una alarma física o un recordatorio con hora en el dispositivo.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        etiqueta: {
          type: Type.STRING,
          description: "Nombre o nota de la alarma/recordatorio."
        },
        hora: {
          type: Type.STRING,
          description: "Hora programada en formato HH:mm (24 horas)."
        },
        esAlarma: {
          type: Type.BOOLEAN,
          description: "true si es alarma de reloj, false si es un recordatorio de notificación."
        }
      },
      required: ["etiqueta", "hora", "esAlarma"]
    }
  }
];

// Controladores para cada herramienta
const handlers = {
  crearEventoCalendario: async (args) => {
    // Aquí puedes conectar googleapis (Google Calendar API)
    return {
      status: "ok",
      action: "CALENDAR_EVENT_CREATED",
      message: `Listo, agendé "${args.titulo}" para ${args.fechaInicio}.`,
      details: args
    };
  },

  enviarCorreo: async (args) => {
    // Aquí puedes conectar Gmail API (OAuth) o nodemailer
    return {
      status: "ok",
      action: "EMAIL_SENT",
      message: `Listo, envié el correo a ${args.destinatario}.`,
      details: args
    };
  },

  enviarMensajeWhatsApp: async (args) => {
    // Aquí puedes invocar WhatsApp Cloud API (Graph Facebook)
    return {
      status: "ok",
      action: "WHATSAPP_MESSAGE_SENT",
      message: `Listo, envié el mensaje de WhatsApp a ${args.contacto}.`,
      details: args
    };
  },

  programarAlarmaORecordatorio: async (args) => {
    // Devuelve la instrucción a la aplicación cliente para programar la alarma local
    const tipo = args.esAlarma ? "alarma" : "recordatorio";
    return {
      status: "ok",
      action: args.esAlarma ? "SET_LOCAL_ALARM" : "SET_LOCAL_REMINDER",
      message: args.esAlarma
        ? `Listo, configuré tu alarma para las ${args.hora}.`
        : `Listo, programé el recordatorio "${args.etiqueta}" a las ${args.hora}.`,
      details: args
    };
  }
};

/**
 * Cloud Function HTTP: atenderAsistenteVoz
 * Recibe: { "mensajeUsuario": "Pon una alarma a las 7:00 para despertar" }
 * Retorna: { "tipo": "accion", "accion": "...", "resultado": { ... } }
 *       o: { "tipo": "texto", "respuesta": "..." }
 */
exports.atenderAsistenteVoz = functions.https.onRequest(async (req, res) => {
  // Configuración de CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  try {
    const { mensajeUsuario } = req.body || {};

    if (!mensajeUsuario) {
      return res.status(400).json({ error: "El campo mensajeUsuario es requerido." });
    }

    const fechaHoraISO = new Date().toISOString();

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: mensajeUsuario,
      config: {
        systemInstruction: `Eres un asistente personal por voz inteligente, eficiente y conciso.
Fecha y hora de referencia: ${fechaHoraISO}.
Reglas:
1. Responde siempre de forma breve (máximo 1 o 2 oraciones), natural para síntesis de voz (TTS).
2. Si el usuario solicita agendar citas, enviar correos, enviar WhatsApp o programar alarmas/recordatorios, invoca la herramienta correspondiente.
3. Si falta algún parámetro obligatorio para completar la acción, pregunta únicamente por ese dato de forma directa.`,
        tools: [{ functionDeclarations: toolsDeclarations }],
        temperature: 0.3
      }
    });

    // Si Gemini decide llamar a una función
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      const handler = handlers[call.name];

      if (handler) {
        const resultado = await handler(call.args);
        return res.json({
          tipo: "accion",
          accion: call.name,
          argumentos: call.args,
          resultado
        });
      }
    }

    // Respuesta convencional de texto (para reproducir con TTS)
    const directText = response.text ? response.text.trim() : "Entendido.";
    return res.json({
      tipo: "texto",
      respuesta: directText
    });
  } catch (error) {
    console.error("Error en atenderAsistenteVoz:", error);
    return res.status(500).json({ error: error.message });
  }
});
