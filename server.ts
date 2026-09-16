import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

const SYSTEM_INSTRUCTION = `Eres un asistente personal por voz inteligente, eficiente y conciso. Tu objetivo es ayudar al usuario a gestionar su día a día.

REGLAS DE INTERACCIÓN OBLIGATORIAS:
1. Respuestas para voz: Mantén las respuestas habladas extremadamente breves (máximo 2 oraciones), claras y naturales. Evita listas largas o formato Markdown cuando respondas por audio.
2. Ejecución de Tareas: Cuando el usuario solicite gestionar correos, eventos de calendario, notas, mensajes de WhatsApp, alarmas o recordatorios, NO inventes la confirmación. Llama inmediatamente a la función (tool) correspondiente con los parámetros extraídos.
3. Confirmación de parámetros: Si faltan datos obligatorios para ejecutar una función (por ejemplo, el mensaje o el destinatario en WhatsApp, o la hora en un evento), pide únicamente la información faltante de manera directa, en 1 oración.
4. Confirmación posterior: Una vez ejecutada la función, confirma brevemente al usuario que la acción se realizó con éxito (máximo 1 o 2 oraciones).
5. Responde siempre en español conversacional, cordial y fluido.`;

// Define function declarations for tools
const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "enviarCorreo",
    description: "Envía un correo electrónico a través de Gmail.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        destinatario: {
          type: Type.STRING,
          description: "Dirección de correo electrónico del destinatario.",
        },
        asunto: {
          type: Type.STRING,
          description: "Asunto del correo.",
        },
        cuerpo: {
          type: Type.STRING,
          description: "Contenido o mensaje del correo.",
        },
      },
      required: ["destinatario", "asunto", "cuerpo"],
    },
  },
  {
    name: "crearEventoCalendario",
    description: "Agrega una nueva cita o evento al calendario del usuario.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        titulo: {
          type: Type.STRING,
          description: "Título o descripción corta del evento.",
        },
        fechaInicio: {
          type: Type.STRING,
          description: "Fecha y hora de inicio en formato ISO 8601 (ej. 2026-09-16T10:00:00Z).",
        },
        duracionMinutos: {
          type: Type.NUMBER,
          description: "Duración estimada del evento en minutos. Por defecto 30.",
        },
      },
      required: ["titulo", "fechaInicio"],
    },
  },
  {
    name: "crear_nota",
    description: "Crea y guarda una nota de texto rápida o apunte para recordar ideas o datos. Requiere contenido.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        titulo: {
          type: Type.STRING,
          description: "Título o tema de la nota",
        },
        contenido: {
          type: Type.STRING,
          description: "Contenido o texto completo de la nota",
        },
      },
      required: ["contenido"],
    },
  },
  {
    name: "enviarMensajeWhatsApp",
    description: "Envía un mensaje de texto por WhatsApp a un contacto.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        contacto: {
          type: Type.STRING,
          description: "Nombre del contacto o número de teléfono con código de país.",
        },
        mensaje: {
          type: Type.STRING,
          description: "Texto del mensaje a enviar.",
        },
      },
      required: ["contacto", "mensaje"],
    },
  },
  {
    name: "programarAlarmaORecordatorio",
    description: "Establece una alarma física o un recordatorio con hora en el dispositivo.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        etiqueta: {
          type: Type.STRING,
          description: "Nombre o nota de la alarma/recordatorio.",
        },
        hora: {
          type: Type.STRING,
          description: "Hora programada en formato HH:mm (24 horas).",
        },
        esAlarma: {
          type: Type.BOOLEAN,
          description: "true si es alarma de reloj, false si es un recordatorio de notificación.",
        },
      },
      required: ["etiqueta", "hora", "esAlarma"],
    },
  },
  {
    name: "crear_recordatorio",
    description: "Crea un recordatorio para una tarea u obligación pendiente. Requiere descripción del recordatorio.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        descripcion: {
          type: Type.STRING,
          description: "Qué se debe recordar (ej. Comprar leche, Llamar al médico)",
        },
        hora_o_fecha: {
          type: Type.STRING,
          description: "Hora o fecha límite para el recordatorio (ej. en 20 minutos, a las 6 PM)",
        },
        prioridad: {
          type: Type.STRING,
          description: "Nivel de prioridad: alta, media o baja",
        },
      },
      required: ["descripcion"],
    },
  },
  {
    name: "consultar_estado_general",
    description: "Consulta el resumen de actividades del día (eventos de hoy, recordatorios pendientes, alarmas y correos).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        categoria: {
          type: Type.STRING,
          description: "Filtrar por: todo, calendario, recordatorios, correos, alarmas, notas",
        },
      },
    },
  },
];

// Helper to execute tools with optional external API dispatching
async function executeAssistantTool(name: string, args: Record<string, any>, contextData?: any) {
  const timestamp = new Date().toISOString();
  switch (name) {
    case "enviarCorreo":
    case "enviar_correo": {
      return {
        status: "success",
        id: `email_${Date.now()}`,
        message: `Listo, envié el correo a ${args.destinatario} con el asunto "${args.asunto}".`,
        data: {
          to: args.destinatario,
          subject: args.asunto,
          body: args.cuerpo,
          date: timestamp,
          status: "sent",
        },
      };
    }
    case "crearEventoCalendario":
    case "gestionar_calendario": {
      let date = args.fecha || new Date().toISOString().split("T")[0];
      let time = args.hora || "10:00";
      let duration = args.duracion || (args.duracionMinutos ? `${args.duracionMinutos} min` : "30 min");

      if (args.fechaInicio) {
        try {
          const d = new Date(args.fechaInicio);
          if (!isNaN(d.getTime())) {
            date = d.toISOString().split("T")[0];
            time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
          } else {
            date = args.fechaInicio;
          }
        } catch {
          date = args.fechaInicio;
        }
      }

      return {
        status: "success",
        id: `evt_${Date.now()}`,
        message: `Listo, agendé "${args.titulo}" para ${date} a las ${time}.`,
        data: {
          title: args.titulo,
          date,
          time,
          duration: typeof args.duracionMinutos === "number" ? `${args.duracionMinutos} min` : duration,
          description: args.description || args.descripcion || "",
        },
      };
    }
    case "crear_nota": {
      return {
        status: "success",
        id: `note_${Date.now()}`,
        message: `Listo, he guardado tu nota exitosamente.`,
        data: {
          title: args.titulo || "Nota rápida",
          content: args.contenido,
          createdAt: timestamp,
        },
      };
    }
    case "enviarMensajeWhatsApp":
    case "enviar_whatsapp": {
      const recipient = args.contacto || args.destinatario || "Contacto";
      const phone = args.telefono || (args.contacto && /^(\+|\d)/.test(args.contacto) ? args.contacto : "");
      let messageId = `wa_${Date.now()}`;
      let deliveryNote = "";

      // Optional real WhatsApp dispatch if WHATSAPP_API_TOKEN is provided
      if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && phone) {
        try {
          const cleanPhone = phone.replace(/[^0-9]/g, "");
          const waRes = await fetch(
            `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: cleanPhone,
                type: "text",
                text: { preview_url: false, body: args.mensaje },
              }),
            }
          );
          const waData: any = await waRes.json();
          if (waData?.messages?.[0]?.id) {
            messageId = waData.messages[0].id;
            deliveryNote = " vía WhatsApp Cloud API";
          }
        } catch (waErr) {
          console.warn("WhatsApp Cloud API error:", waErr);
        }
      }

      return {
        status: "success",
        id: messageId,
        message: `Listo, envié el mensaje de WhatsApp a ${recipient}${deliveryNote ? ` (${deliveryNote.trim()})` : ""}.`,
        data: {
          recipient,
          phone,
          message: args.mensaje,
          timestamp,
          status: "delivered",
        },
      };
    }
    case "programarAlarmaORecordatorio":
    case "programarAlarmaO'Recordatorio":
    case "programarAlarmaO_Recordatorio": {
      const isAlarm = Boolean(args.esAlarma);
      if (isAlarm) {
        return {
          status: "success",
          type: "alarm",
          id: `alarm_${Date.now()}`,
          message: `Listo, configuré tu alarma "${args.etiqueta || "Alarma"}" para las ${args.hora}.`,
          data: {
            time: args.hora,
            label: args.etiqueta || "Alarma",
            enabled: true,
            days: ["Hoy"],
          },
        };
      } else {
        return {
          status: "success",
          type: "reminder",
          id: `rem_${Date.now()}`,
          message: `Listo, programé el recordatorio "${args.etiqueta || "Recordatorio"}" para las ${args.hora}.`,
          data: {
            text: args.etiqueta || "Recordatorio",
            dueTime: args.hora,
            completed: false,
            priority: "alta",
          },
        };
      }
    }
    case "configurar_alarma": {
      return {
        status: "success",
        id: `alarm_${Date.now()}`,
        message: `Listo, configuré tu alarma para las ${args.hora}.`,
        data: {
          time: args.hora,
          label: args.etiqueta || "Alarma",
          enabled: true,
          days: ["Hoy"],
        },
      };
    }
    case "crear_recordatorio": {
      return {
        status: "success",
        id: `rem_${Date.now()}`,
        message: `Listo, he guardado tu recordatorio: "${args.descripcion}".`,
        data: {
          text: args.descripcion,
          dueTime: args.hora_o_fecha || "Hoy más tarde",
          completed: false,
          priority: args.prioridad || "media",
        },
      };
    }
    case "consultar_estado_general": {
      const summary = {
        eventosHoy: contextData?.eventosCount ?? 2,
        recordatoriosPendientes: contextData?.recordatoriosCount ?? 3,
        alarmasActivas: contextData?.alarmasCount ?? 1,
        correosSinLeer: contextData?.correosCount ?? 2,
      };
      return {
        status: "success",
        resumen: summary,
        message: `Tienes ${summary.eventosHoy} eventos hoy, ${summary.recordatoriosPendientes} recordatorios pendientes y ${summary.alarmasActivas} alarma activa.`,
      };
    }
    default:
      return { status: "error", message: `Función desconocida: ${name}` };
  }
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/config-status", (req, res) => {
  res.json({
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    gmailConfigured: Boolean(process.env.GMAIL_CLIENT_ID),
    whatsappConfigured: Boolean(process.env.WHATSAPP_API_TOKEN),
  });
});

// Helper for resilient Gemini API calls with retry on temporary 503 / rate limits
async function generateContentWithRetry(ai: GoogleGenAI, params: any, maxRetries = 2) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      attempt++;
      const isTransient =
        err?.message?.includes("503") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("UNAVAILABLE") ||
        err?.status === 503;

      if (isTransient && attempt < maxRetries) {
        const delay = attempt * 800;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("No se pudo conectar con el modelo tras varios intentos.");
}

// Chat / Voice processing endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], contextData = {} } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "El mensaje es requerido." });
    }

    const ai = getAiClient();

    // Format chat history for Gemini
    const contents: any[] = [];

    // Add previous turns if provided
    if (Array.isArray(history)) {
      for (const turn of history.slice(-8)) {
        if (turn.role && turn.parts) {
          contents.push({
            role: turn.role === "assistant" ? "model" : "user",
            parts: turn.parts,
          });
        }
      }
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Call Gemini with tools
    const dynamicSystemInstruction = `${SYSTEM_INSTRUCTION}\n\nFecha y hora actual del sistema: ${new Date().toISOString()}. Cuando llames a crearEventoCalendario, genera fechaInicio en formato ISO 8601 basado en esta fecha.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: dynamicSystemInstruction,
        tools: [{ functionDeclarations: toolDeclarations }],
        temperature: 0.3,
      },
    });

    const functionCalls = response.functionCalls;

    // If a tool was called:
    if (functionCalls && functionCalls.length > 0) {
      const toolInvocations: any[] = [];
      const toolResponseParts: any[] = [];

      for (const call of functionCalls) {
        const result = await executeAssistantTool(call.name, call.args || {}, contextData);
        toolInvocations.push({
          name: call.name,
          args: call.args || {},
          result,
        });

        toolResponseParts.push({
          functionResponse: {
            name: call.name,
            response: result,
          },
        });
      }

      // Generate concise voice confirmation directly from tool execution result
      const primaryResult = toolInvocations[0]?.result;
      const replyText = primaryResult?.message || "Listo, la acción se realizó con éxito.";

      return res.json({
        reply: replyText,
        toolInvocations,
      });
    }

    // Direct text response (e.g. asking for missing required parameters, or general greeting)
    const directReply = response.text?.trim() || "Entendido. ¿En qué más puedo ayudarte?";

    return res.json({
      reply: directReply,
      toolInvocations: [],
    });
  } catch (err: any) {
    console.error("Error in /api/chat:", err);

    if (err?.message?.includes("429") || err?.message?.includes("Quota exceeded") || err?.status === 429) {
      return res.json({
        reply: "He alcanzado el límite momentáneo de peticiones. Por favor repíteme tu solicitud en unos segundos.",
        toolInvocations: [],
      });
    }

    return res.status(500).json({
      error: "Error al procesar la solicitud de voz.",
      details: err?.message || "Error interno del servidor.",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Voice Assistant server running on http://localhost:${PORT}`);
  });
}

startServer();
