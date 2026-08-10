const baseURL = process.env.NUXT_APP_BASE_URL || '/';
const normalizedBaseURL = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    whatsappNotificationPhone: process.env.WHATSAPP_NOTIFICATION_PHONE || '',
    whatsappAuthDir: process.env.WHATSAPP_AUTH_DIR || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
    resendFromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  },
  nitro: {
    storage: {
      rsvps: {
        driver: 'fs',
        base: './.data/rsvps',
      },
    },
  },
  app: {
    baseURL: normalizedBaseURL,
    head: {
      title: 'Boda Renée & Gabriel',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0',
        },
        {
          name: 'description',
          content:
            'Invitación de boda de Renée y Gabriel en Hermosillo, Sonora.',
        },
        {
          property: 'og:title',
          content: 'Boda Renée & Gabriel',
        },
        {
          property: 'og:description',
          content:
            'Invitación de boda de Renée y Gabriel en Hermosillo, Sonora.',
        },
        {
          property: 'og:image',
          content: `${normalizedBaseURL}images/slide-1.webp`,
        },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@400;500;600;700&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
        },
      ],
    },
  },
});
