# Famous Asistente 🎙️

Asistente personal de productividad para Android (APK nativo vía Capacitor y Gradle) y PWA.

## 🚀 Compilación de APK de depuración (Android Debug)

El proyecto cuenta con el proyecto nativo de Android en `android/` configurado con **Android SDK 35 (Android 15)** y **Gradle 8.11.1**.

### En GitHub Actions (Automático)
El flujo `.github/workflows/main.yml` compila el paquete automáticamente:
1. Configura **Java JDK 21** (Temurin) y **Node.js 22**.
2. Instala dependencias (`npm ci`) y compila los recursos web (`npm run build`).
3. Sincroniza los recursos con Android (`npx cap sync android`).
4. Ejecuta `./gradlew assembleDebug --stacktrace`.
5. Sube y empaqueta el APK generado (`app-debug.apk`) como artefacto descargable en la pestaña **Actions**.

### Compilación local
Requisitos:
- **Node.js**: 22 o superior
- **JDK**: Java 21
- **Android SDK**: Build-Tools y Platforms 35

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar aplicación web y sincronizar con Android
npm run build:android

# 3. Compilar APK de depuración con Gradle
cd android
./gradlew assembleDebug
```
El archivo APK compilado se encontrará en:
`android/app/build/outputs/apk/debug/app-debug.apk`
