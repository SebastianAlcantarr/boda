import { sendTelegram } from '../utils/telegram';

interface RsvpPayload {
  name?: unknown;
  email?: unknown;
}

interface RsvpRecord {
  name: string;
  email: string;
  submittedAt: string;
}

const RSVP_STORAGE_KEY = 'list';

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function normalizeEmail(value: unknown): string {
  return normalizeText(value).toLowerCase();
}

function formatSubmittedAt(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Hermosillo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const dayPeriod = values.dayPeriod ? values.dayPeriod.toUpperCase() : '';

  return `${values.day}/${values.month}/${values.year} ${values.hour}:${values.minute} ${dayPeriod}`.trim();
}

function buildTelegramMessage(record: RsvpRecord): string {
  return [
    '🎉 NUEVA CONFIRMACIÓN',
    '',
    '👤 Nombre:',
    record.name,
    '',
    '📧 Correo:',
    record.email,
    '',
    '🕒 Fecha:',
    record.submittedAt,
  ].join('\n');
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RsvpPayload>(event);
  const name = normalizeText(body?.name);
  const email = normalizeEmail(body?.email);

  if (name.length < 3 || name.split(' ').length < 2) {
    throw createError({
      statusCode: 400,
      message: 'Escribe tu nombre y apellido.',
    });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({
      statusCode: 400,
      message: 'Escribe un correo válido.',
    });
  }

  const record: RsvpRecord = {
    name,
    email,
    submittedAt: formatSubmittedAt(new Date()),
  };

  const storage = useStorage('rsvps');
  const savedEntries = (await storage.getItem<RsvpRecord[]>(RSVP_STORAGE_KEY)) || [];

  await storage.setItem(RSVP_STORAGE_KEY, [...savedEntries, record]);

  try {
    await sendTelegram(buildTelegramMessage(record));

    return {
      success: true,
      telegramSent: true,
      message: 'Confirmación registrada y enviada a Telegram.',
    };
  } catch (error) {
    console.error('[api/asistencia] Telegram error:', error);

    return {
      success: true,
      telegramSent: false,
      message: 'Confirmación registrada, pero no se pudo enviar a Telegram.',
    };
  }
});
