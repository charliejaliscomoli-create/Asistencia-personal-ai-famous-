# Asistente de Voz Personal 🎙️

Asistente personal inteligente con reconocimiento y síntesis de voz, impulsado por **Google Gemini 2.5 Flash** y persistencia en la nube mediante **Firebase Cloud Firestore** y autenticación oficial con **Google / Gmail**.

## 🚀 Características Principales
- **Interacción por Voz:** Dictado en tiempo real y respuestas automáticas habladas (Web Speech API).
- **Herramientas Automatizadas (Function Calling):**
  - 📅 **Google Calendar:** Agenda citas y reuniones automáticamente.
  - 💬 **WhatsApp:** Redacta y prepara mensajes directos a contactos.
  - ✉️ **Gmail / Correo:** Redacta y envía correos electrónicos.
  - ⏰ **Alarmas:** Programa alarmas recurrentes con prueba de sonido sintetizado.
  - 🔔 **Recordatorios:** Gestión de tareas prioritarias.
  - 📝 **Bloc de Notas:** Guarda notas e ideas dictadas.
- **Autenticación y Nube:**
  - Registro e inicio de sesión con cuenta de Gmail (Google OAuth 2.0).
  - Sincronización en tiempo real en la nube con Firebase Firestore.
- **Ajustes y Personalización:**
  - Control de velocidad y tono de voz, temas visuales y exportación/importación JSON.
- **Instalable (PWA):**
  - Compatible con instalación directa en teléfonos Android o PC como aplicación independiente.

---

## 🛠️ Instalación y Compilación Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno en .env
cp .env.example .env

# 3. Iniciar en modo desarrollo
npm run dev

# 4. Compilar para producción (Build estático + servidor)
npm run build
npm start
```

---

## 📦 Compilación y Despliegue en GitHub

### Paso 1: Subir el código a tu repositorio de GitHub
```bash
git init
git add .
git commit -m "feat: Asistente de Voz Personal completo v2.5.0"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

### Paso 2: Configuración de Variables Secretas en GitHub
En tu repositorio de GitHub, ve a **Settings > Secrets and variables > Actions** y añade:
- `GEMINI_API_KEY`: Tu clave de API de Google Gemini (obtenible en [Google AI Studio](https://aistudio.google.com/)).
- `VITE_FIREBASE_API_KEY` (Opcional si usas Firebase Cloud).
- `VITE_FIREBASE_PROJECT_ID` (Opcional).

### Paso 3: GitHub Actions CI/CD (Opcional)
El proyecto cuenta con el comando estándar `npm run build` que compila el frontend con Vite y valida los tipos TypeScript con `npm run lint`.
