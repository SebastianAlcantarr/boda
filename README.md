# Boda Renée & Gabriel

Sitio Nuxt 3 listo para publicarse como sitio estático en GitHub Pages o como app Node.

## Desarrollo

```bash
npm install
npm run dev
```

## Build para servidor Node

```bash
npm install
npm run build
npm run start
```

## Build estático

```bash
npm install
npm run generate
```

El resultado queda en `.output/public`.

## Publicación en GitHub Pages

El workflow `.github/workflows/deploy.yml` genera y publica el sitio automáticamente al hacer push a `master`.

En GitHub, configura `Settings > Pages > Build and deployment > Source` como `GitHub Actions`. Después, cada push a `master` actualizará la web.

## GitHub Pages en subcarpeta

Si publicas en `https://usuario.github.io/nombre-del-repo/`, genera el sitio con:

```bash
NUXT_APP_BASE_URL=/nombre-del-repo/ npm run generate
```

Si publicas en un dominio propio o en la raíz del servidor, usa simplemente:

```bash
npm run generate
```

## Confirmaciones por Telegram

El formulario de `pages/asistencia.vue` envía la confirmación a `server/api/asistencia.post.ts`. Esa ruta guarda la confirmación en Nitro storage y usa `server/utils/telegram.ts` para mandar el mensaje al bot de Telegram con `$fetch()`.

### Variables de entorno

```env
TELEGRAM_BOT_TOKEN=tu_bot_token
TELEGRAM_CHAT_ID=tu_chat_id
```

### Desarrollo local

1. Copia `.env.example` como `.env` si todavía no existe.
2. Completa las variables de Telegram.
3. Inicia Nuxt con `npm run dev` y prueba el formulario en `/asistencia`.

### Producción

Despliega como servidor Nitro (por ejemplo en Vercel o Railway) y agrega las variables de Telegram como secretos del entorno. Esta integración no funciona en un sitio estático puro como GitHub Pages porque requiere `server/api/asistencia.post.ts`.

No subas `.env` al repositorio.

## Invitación por correo

Después de confirmar la asistencia, aparece un botón para enviar la invitación al correo capturado usando Resend.

### Variables de entorno

```env
RESEND_API_KEY=tu_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Qué se sube al repositorio

El repositorio necesita el código de `app.vue`, `pages/`, `server/`, `assets/`, `public/images/`, `.env.example`, la configuración de Nuxt/Tailwind y `package-lock.json`. `node_modules/`, `.nuxt/`, `.output/`, `dist/`, `.env` y los archivos originales de fotos son generados, locales o innecesarios para el despliegue.
