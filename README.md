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

## Notificaciones por WhatsApp (Twilio)

El formulario de `pages/asistencia.vue` envía el nombre a la ruta Nitro `server/api/whatsapp.post.ts`. Esa ruta usa Twilio WhatsApp Sandbox y mantiene las credenciales únicamente en el servidor.

### Configuración de Twilio WhatsApp Sandbox

1. Crea una cuenta en [Twilio](https://console.twilio.com/).
2. Activa el WhatsApp Sandbox en `Twilio Console > Messaging > Try Twilio > WhatsApp`.
3. Autoriza tu número de WhatsApp en el sandbox desde la consola de Twilio.
4. Configura las siguientes variables en tu `.env`:

```env
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_TO=whatsapp:+52XXXXXXXXXX
```

### Desarrollo local

1. Copia `.env.example` como `.env` si todavía no existe.
2. Completa las variables de Twilio.
3. Inicia Nuxt con `npm run dev` y prueba el formulario en `/asistencia`.

### Producción

Despliega como servidor Nitro (por ejemplo en Vercel o Railway) y agrega las variables de Twilio como secretos del entorno. No uses `npm run generate` para la versión que necesita enviar WhatsApp: un sitio estático de GitHub Pages no puede ejecutar `server/api/whatsapp.post.ts`.

No subas `.env` al repositorio.

## Qué se sube al repositorio

El repositorio necesita el código de `app.vue`, `pages/`, `server/`, `assets/`, `public/images/`, `.env.example`, la configuración de Nuxt/Tailwind y `package-lock.json`. `node_modules/`, `.nuxt/`, `.output/`, `dist/`, `.env` y los archivos originales de fotos son generados, locales o innecesarios para el despliegue.