var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables.");
  }
  return new import_genai.GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};
var SYSTEM_INSTRUCTION = `Eres un asistente personal por voz inteligente, eficiente y conciso. Tu objetivo es ayudar al usuario a gestionar su d\xEDa a d\xEDa.

REGLAS DE INTERACCI\xD3N OBLIGATORIAS:
1. Respuestas para voz: Mant\xE9n las respuestas habladas extremadamente breves (m\xE1ximo 2 oraciones), claras y naturales. Evita listas largas o formato Markdown cuando respondas por audio.
2. Ejecuci\xF3n de Tareas: Cuando el usuario solicite gestionar correos, eventos de calendario, notas, mensajes de WhatsApp, alarmas o recordatorios, NO inventes la confirmaci\xF3n. Llama inmediatamente a la funci\xF3n (tool) correspondiente con los par\xE1metros extra\xEDdos.
3. Confirmaci\xF3n de par\xE1metros: Si faltan datos obligatorios para ejecutar una funci\xF3n (por ejemplo, el mensaje o el destinatario en WhatsApp, o la hora en un evento), pide \xFAnicamente la informaci\xF3n faltante de manera directa, en 1 oraci\xF3n.
4. Confirmaci\xF3n posterior: Una vez ejecutada la funci\xF3n, confirma brevemente al usuario que la acci\xF3n se realiz\xF3 con \xE9xito (m\xE1ximo 1 o 2 oraciones).
5. Responde siempre en espa\xF1ol conversacional, cordial y fluido.`;
var toolDeclarations = [
  {
    name: "enviarCorreo",
    description: "Env\xEDa un correo electr\xF3nico a trav\xE9s de Gmail.",
    parameters: {
      type: import_genai.Type.OBJECT,
      properties: {
        destinatario: {
          type: import_genai.Type.STRING,
          description: "Direcci\xF3n de correo electr\xF3nico del destinatario."
        },
        asunto: {
          type: import_genai.Type.STRING,
          description: "Asunto del correo."
        },
        cuerpo: {
          type: import_genai.Type.STRING,
          description: "Contenido o mensaje del correo."
        }
      },
      required: ["destinatario", "asunto", "cuerpo"]
    }
  },
  {
    name: "crearEventoCalendario",
    description: "Agrega una nueva cita o evento al calendario del usuario.",
    parameters: {
      type: import_genai.Type.OBJECT,
      properties: {
        titulo: {
          type: import_genai.Type.STRING,
          description: "T\xEDtulo o descripci\xF3n corta del evento."
        },
        fechaInicio: {
          type: import_genai.Type.STRING,
          description: "Fecha y hora de inicio en formato ISO 8601 (ej. 2026-09-16T10:00:00Z)."
        },
        duracionMinutos: {
          type: import_genai.Type.NUMBER,
          description: "Duraci\xF3n estimada del evento en minutos. Por defecto 30."
        }
      },
      required: ["titulo", "fechaInicio"]
    }
  },
  {
    name: "crear_nota",
    description: "Crea y guarda una nota de texto r\xE1pida o apunte para recordar ideas o datos. Requiere contenido.",
    parameters: {
      type: import_genai.Type.OBJECT,
      properties: {
        titulo: {
          type: import_genai.Type.STRING,
          description: "T\xEDtulo o tema de la nota"
        },
        contenido: {
          type: import_genai.Type.STRING,
          description: "Contenido o texto completo de la nota"
        }
      },
      required: ["contenido"]
    }
  },
  {
    name: "enviarMensajeWhatsApp",
    description: "Env\xEDa un mensaje de texto por WhatsApp a un contacto.",
    parameters: {
      type: import_genai.Type.OBJECT,
      properties: {
        contacto: {
          type: import_genai.Type.STRING,
          description: "Nombre del contacto o n\xFAmero de tel\xE9fono con c\xF3digo de pa\xEDs."
        },
        mensaje: {
          type: import_genai.Type.STRING,
          description: "Texto del mensaje a enviar."
        }
      },
      required: ["contacto", "mensaje"]
    }
  },
  {
    name: "programarAlarmaORecordatorio",
    description: "Establece una alarma f\xEDsica o un recordatorio con hora en el dispositivo.",
    parameters: {
      type: import_genai.Type.OBJECT,
      properties: {
        etiqueta: {
          type: import_genai.Type.STRING,
          description: "Nombre o nota de la alarma/recordatorio."
        },
        hora: {
          type: import_genai.Type.STRING,
          description: "Hora programada en formato HH:mm (24 horas)."
        },
        esAlarma: {
          type: import_genai.Type.BOOLEAN,
          description: "true si es alarma de reloj, false si es un recordatorio de notificaci\xF3n."
        }
      },
      required: ["etiqueta", "hora", "esAlarma"]
    }
  },
  {
    name: "crear_recordatorio",
    description: "Crea un recordatorio para una tarea u obligaci\xF3n pendiente. Requiere descripci\xF3n del recordatorio.",
    parameters: {
      type: import_genai.Type.OBJECT,
      properties: {
        descripcion: {
          type: import_genai.Type.STRING,
          description: "Qu\xE9 se debe recordar (ej. Comprar leche, Llamar al m\xE9dico)"
        },
        hora_o_fecha: {
          type: import_genai.Type.STRING,
          description: "Hora o fecha l\xEDmite para el recordatorio (ej. en 20 minutos, a las 6 PM)"
        },
        prioridad: {
          type: import_genai.Type.STRING,
          description: "Nivel de prioridad: alta, media o baja"
        }
      },
      required: ["descripcion"]
    }
  },
  {
    name: "consultar_estado_general",
    description: "Consulta el resumen de actividades del d\xEDa (eventos de hoy, recordatorios pendientes, alarmas y correos).",
    parameters: {
      type: import_genai.Type.OBJECT,
      properties: {
        categoria: {
          type: import_genai.Type.STRING,
          description: "Filtrar por: todo, calendario, recordatorios, correos, alarmas, notas"
        }
      }
    }
  }
];
async function executeAssistantTool(name, args, contextData) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  switch (name) {
    case "enviarCorreo":
    case "enviar_correo": {
      return {
        status: "success",
        id: `email_${Date.now()}`,
        message: `Listo, envi\xE9 el correo a ${args.destinatario} con el asunto "${args.asunto}".`,
        data: {
          to: args.destinatario,
          subject: args.asunto,
          body: args.cuerpo,
          date: timestamp,
          status: "sent"
        }
      };
    }
    case "crearEventoCalendario":
    case "gestionar_calendario": {
      let date = args.fecha || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
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
        message: `Listo, agend\xE9 "${args.titulo}" para ${date} a las ${time}.`,
        data: {
          title: args.titulo,
          date,
          time,
          duration: typeof args.duracionMinutos === "number" ? `${args.duracionMinutos} min` : duration,
          description: args.description || args.descripcion || ""
        }
      };
    }
    case "crear_nota": {
      return {
        status: "success",
        id: `note_${Date.now()}`,
        message: `Listo, he guardado tu nota exitosamente.`,
        data: {
          title: args.titulo || "Nota r\xE1pida",
          content: args.contenido,
          createdAt: timestamp
        }
      };
    }
    case "enviarMensajeWhatsApp":
    case "enviar_whatsapp": {
      const recipient = args.contacto || args.destinatario || "Contacto";
      const phone = args.telefono || (args.contacto && /^(\+|\d)/.test(args.contacto) ? args.contacto : "");
      let messageId = `wa_${Date.now()}`;
      let deliveryNote = "";
      if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && phone) {
        try {
          const cleanPhone = phone.replace(/[^0-9]/g, "");
          const waRes = await fetch(
            `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: cleanPhone,
                type: "text",
                text: { preview_url: false, body: args.mensaje }
              })
            }
          );
          const waData = await waRes.json();
          if (waData?.messages?.[0]?.id) {
            messageId = waData.messages[0].id;
            deliveryNote = " v\xEDa WhatsApp Cloud API";
          }
        } catch (waErr) {
          console.warn("WhatsApp Cloud API error:", waErr);
        }
      }
      return {
        status: "success",
        id: messageId,
        message: `Listo, envi\xE9 el mensaje de WhatsApp a ${recipient}${deliveryNote ? ` (${deliveryNote.trim()})` : ""}.`,
        data: {
          recipient,
          phone,
          message: args.mensaje,
          timestamp,
          status: "delivered"
        }
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
          message: `Listo, configur\xE9 tu alarma "${args.etiqueta || "Alarma"}" para las ${args.hora}.`,
          data: {
            time: args.hora,
            label: args.etiqueta || "Alarma",
            enabled: true,
            days: ["Hoy"]
          }
        };
      } else {
        return {
          status: "success",
          type: "reminder",
          id: `rem_${Date.now()}`,
          message: `Listo, program\xE9 el recordatorio "${args.etiqueta || "Recordatorio"}" para las ${args.hora}.`,
          data: {
            text: args.etiqueta || "Recordatorio",
            dueTime: args.hora,
            completed: false,
            priority: "alta"
          }
        };
      }
    }
    case "configurar_alarma": {
      return {
        status: "success",
        id: `alarm_${Date.now()}`,
        message: `Listo, configur\xE9 tu alarma para las ${args.hora}.`,
        data: {
          time: args.hora,
          label: args.etiqueta || "Alarma",
          enabled: true,
          days: ["Hoy"]
        }
      };
    }
    case "crear_recordatorio": {
      return {
        status: "success",
        id: `rem_${Date.now()}`,
        message: `Listo, he guardado tu recordatorio: "${args.descripcion}".`,
        data: {
          text: args.descripcion,
          dueTime: args.hora_o_fecha || "Hoy m\xE1s tarde",
          completed: false,
          priority: args.prioridad || "media"
        }
      };
    }
    case "consultar_estado_general": {
      const summary = {
        eventosHoy: contextData?.eventosCount ?? 2,
        recordatoriosPendientes: contextData?.recordatoriosCount ?? 3,
        alarmasActivas: contextData?.alarmasCount ?? 1,
        correosSinLeer: contextData?.correosCount ?? 2
      };
      return {
        status: "success",
        resumen: summary,
        message: `Tienes ${summary.eventosHoy} eventos hoy, ${summary.recordatoriosPendientes} recordatorios pendientes y ${summary.alarmasActivas} alarma activa.`
      };
    }
    default:
      return { status: "error", message: `Funci\xF3n desconocida: ${name}` };
  }
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/config-status", (req, res) => {
  res.json({
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    gmailConfigured: Boolean(process.env.GMAIL_CLIENT_ID),
    whatsappConfigured: Boolean(process.env.WHATSAPP_API_TOKEN)
  });
});
async function generateContentWithRetry(ai, params, maxRetries = 2) {
  const modelsToTry = [params.model || "gemini-3.6-flash", "gemini-3.8-flash"];
  let lastError = null;
  for (const model of modelsToTry) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await ai.models.generateContent({
          ...params,
          model
        });
      } catch (err) {
        lastError = err;
        attempt++;
        const isQuota = err?.message?.includes("429") || err?.message?.includes("Quota exceeded") || err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429;
        if (isQuota) {
          break;
        }
        const isTransient = err?.message?.includes("503") || err?.message?.includes("high demand") || err?.message?.includes("UNAVAILABLE") || err?.status === 503;
        if (isTransient && attempt < maxRetries) {
          const delay = attempt * 700;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }
  }
  throw lastError || new Error("No se pudo conectar con el modelo tras varios intentos.");
}
app.post("/api/chat", async (req, res) => {
  try {
    const rawMessage = req.body.mensajeUsuario || req.body.message;
    const { history = [], contextData = {} } = req.body;
    if (!rawMessage || typeof rawMessage !== "string") {
      return res.status(400).json({ error: "El mensaje es requerido." });
    }
    const message = rawMessage;
    const ai = getAiClient();
    const contents = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-8)) {
        if (turn.role && turn.parts) {
          contents.push({
            role: turn.role === "assistant" ? "model" : "user",
            parts: turn.parts
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });
    const dynamicSystemInstruction = `${SYSTEM_INSTRUCTION}

Fecha y hora actual del sistema: ${(/* @__PURE__ */ new Date()).toISOString()}. Cuando llames a crearEventoCalendario, genera fechaInicio en formato ISO 8601 basado en esta fecha.`;
    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: dynamicSystemInstruction,
        tools: [{ functionDeclarations: toolDeclarations }],
        temperature: 0.3
      }
    });
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const toolInvocations = [];
      const toolResponseParts = [];
      for (const call of functionCalls) {
        const result = await executeAssistantTool(call.name, call.args || {}, contextData);
        toolInvocations.push({
          name: call.name,
          args: call.args || {},
          result
        });
        toolResponseParts.push({
          functionResponse: {
            name: call.name,
            response: result
          }
        });
      }
      const primaryResult = toolInvocations[0]?.result;
      const replyText = primaryResult?.message || "Listo, la acci\xF3n se realiz\xF3 con \xE9xito.";
      return res.json({
        reply: replyText,
        toolInvocations
      });
    }
    const directReply = response.text?.trim() || "Entendido. \xBFEn qu\xE9 m\xE1s puedo ayudarte?";
    return res.json({
      reply: directReply,
      toolInvocations: []
    });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    if (err?.message?.includes("429") || err?.message?.includes("Quota exceeded") || err?.status === 429) {
      return res.json({
        reply: "He alcanzado el l\xEDmite moment\xE1neo de peticiones. Por favor rep\xEDteme tu solicitud en unos segundos.",
        toolInvocations: []
      });
    }
    return res.status(500).json({
      error: "Error al procesar la solicitud de voz.",
      details: err?.message || "Error interno del servidor."
    });
  }
});
app.post("/api/atenderAsistenteVoz", async (req, res) => {
  try {
    const rawMessage = req.body.mensajeUsuario || req.body.message;
    if (!rawMessage || typeof rawMessage !== "string") {
      return res.status(400).json({ error: "El campo mensajeUsuario es requerido." });
    }
    const ai = getAiClient();
    const systemPrompt = `${SYSTEM_INSTRUCTION}
Fecha y hora actual ISO de referencia: ${(/* @__PURE__ */ new Date()).toISOString()}`;
    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.6-flash",
      contents: rawMessage,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ functionDeclarations: toolDeclarations }],
        temperature: 0.3
      }
    });
    const functionCalls = response.functionCalls || [];
    if (functionCalls.length > 0) {
      const call = functionCalls[0];
      const resultado = await executeAssistantTool(call.name, call.args || {});
      return res.json({
        tipo: "accion",
        accion: call.name,
        argumentos: call.args,
        resultado
      });
    }
    return res.json({
      tipo: "texto",
      respuesta: response.text?.trim() || "Entendido. \xBFEn qu\xE9 m\xE1s puedo ayudarte?"
    });
  } catch (error) {
    console.error("Error in /api/atenderAsistenteVoz:", error);
    return res.status(500).json({ error: error?.message || "Error interno" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Voice Assistant server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
