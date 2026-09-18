# Famous Asistente

Asistente personal de productividad para Android y PWA.

## Estado del proyecto

El código de la aplicación está actualmente empaquetado en `Famous-asistent-main oficial .zip`. El flujo de integración continua extrae ese archivo y ejecuta instalación, comprobación de TypeScript y compilación.

## Compilar localmente

Requisitos: Node.js 22 o superior y `unzip`.

```bash
mkdir -p extracted
unzip -q "Famous-asistent-main oficial .zip" -d extracted
cd extracted/Famous-asistent-main
npm install
npm run lint
npm run build
npm start