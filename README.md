# Asistente IA Personal por Voz (Gemini Flash + Firebase)

Asistente inteligente por voz que procesa comandos en lenguaje natural y ejecuta acciones automáticas mediante herramientas compiladas (Function Calling) usando el SDK oficial `@google/genai`.

## Herramientas Compiladas Soportadas

1. **`crearEventoCalendario`**: Agenda citas en Google Calendar con título, fecha ISO y duración.
2. **`enviarCorreo`**: Envía correos con Gmail a destinatario con asunto y cuerpo.
3. **`enviarMensajeWhatsApp`**: Envía mensajes a contactos o números mediante WhatsApp Cloud API / wa.me.
4. **`programarAlarmaORecordatorio`**: Programa alarmas físicas de reloj (`esAlarma: true`) o recordatorios con notificación (`esAlarma: false`).

---

## Estructura del Proyecto

- `/src`: Aplicación web interactiva en React + Vite + Tailwind con reconocimiento de voz (Web Speech API / dictado en vivo), síntesis de voz (TTS) y panel de control por pestañas.
- `/server.ts`: Servidor backend Express en Node.js que expone `/api/chat` y `/api/atenderAsistenteVoz`.
- `/firebase-functions/`: Código listo para producción para desplegar como Cloud Function en Firebase (`index.js`).

---

## Despliegue en Firebase Cloud Functions

### 1. Requisitos
```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

### 2. Variables de Entorno en Firebase
Configura tu clave de Gemini en el entorno de Firebase:
```bash
firebase functions:secrets:set GEMINI_API_KEY
```

O define la variable en `.env` dentro de `firebase-functions/`:
```env
GEMINI_API_KEY=tu_api_key_de_ai_studio
```

### 3. Despliegue
```bash
cd firebase-functions
npm install
firebase deploy --only functions
```

---

## Descarga e Instalación en Android (APK y WebAPK)

Tienes **dos opciones directas** para instalar y utilizar esta aplicación en Android:

### Opción 1: Instalación Directa en Android (Recomendada - Sin PC ni cables)
La aplicación cuenta con soporte completo **PWA / WebAPK**:
1. Abre la URL de la aplicación en el navegador **Google Chrome**, **Brave** o **Edge** de tu teléfono Android.
2. Toca el botón **"Instalar APK"** en el encabezado de la app o abre el menú del navegador (los tres puntos `⋮` arriba a la derecha).
3. Selecciona **"Instalar aplicación"** o **"Añadir a la pantalla principal"**.
4. Android generará e instalará automáticamente el paquete nativo **WebAPK** con icono independiente, soporte de pantalla completa y acceso al micrófono.

---

### Opción 2: Compilación de archivo APK nativo con Capacitor

El proyecto ya incluye **Capacitor** completamente configurado en `/android` con permisos en `AndroidManifest.xml` (`RECORD_AUDIO`, `INTERNET`, `VIBRATE`, etc.):

1. **Sincronizar cambios web con el proyecto Android:**
   ```bash
   npm run android:sync
   ```

2. **Compilar el archivo APK de depuración:**
   ```bash
   npm run android:apk
   ```
   *El archivo APK se generará en:* `android/app/build/outputs/apk/debug/app-debug.apk`

3. **Abrir en Android Studio:**
   ```bash
   npm run cap:open
   ```
   *Desde Android Studio puedes conectar tu teléfono por USB y pulsar "Run" (▶) o generar un APK firmado desde el menú `Build > Build Bundle(s) / APK(s) > Build APK(s)`.*

---

Realiza una petición `POST` al endpoint `atenderAsistenteVoz`:

**Endpoint**:
`POST https://<REGION>-<PROJECT_ID>.cloudfunctions.net/atenderAsistenteVoz`

**Body**:
```json
{
  "mensajeUsuario": "Pon una alarma a las 07:30 para salir al trabajo"
}
```

**Respuesta cuando invoca una acción**:
```json
{
  "tipo": "accion",
  "accion": "programarAlarmaORecordatorio",
  "argumentos": {
    "etiqueta": "Salir al trabajo",
    "hora": "07:30",
    "esAlarma": true
  },
  "resultado": {
    "status": "ok",
    "action": "SET_LOCAL_ALARM",
    "message": "Listo, configuré tu alarma para las 07:30."
  }
}
```

**Respuesta cuando es texto directo**:
```json
{
  "tipo": "texto",
  "respuesta": "Claro, ¿a qué hora te gustaría que programe la alarma?"
}
```

