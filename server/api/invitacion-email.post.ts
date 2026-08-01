import { sendResendEmail } from '../utils/resend';

interface InvitationEmailPayload {
  name?: unknown;
  email?: unknown;
  pdfBase64?: unknown;
  pdfFilename?: unknown;
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function normalizeEmail(value: unknown): string {
  return normalizeText(value).toLowerCase();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildSubject() {
  return 'Invitación de boda de Renée & Gabriel';
}

function buildText(name: string, invitationUrl: string) {
  return [
    `Hola ${name},`,
    '',
    'Te compartimos la invitación de nuestra boda.',
    invitationUrl,
    '',
    'Renée & Gabriel',
  ].join('\n');
}

function buildHtml(name: string, invitationUrl: string) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(invitationUrl);

  return `
    <div style="margin:0;padding:0;background:#f7f4ee;font-family:Arial,sans-serif;color:#512301;">
      <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
        <div style="background:#fbfaf6;border:1px solid #e3d8c4;padding:32px;">
          <p style="margin:0 0 12px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#9a7a3f;">Renée & Gabriel</p>
          <h1 style="margin:0 0 18px;font-size:32px;line-height:1.05;font-family:Georgia,serif;">Tu invitación digital</h1>
          <p style="margin:0 0 22px;font-size:16px;line-height:1.6;">Hola ${safeName}, te compartimos nuestra invitación para que la consultes cuando quieras.</p>
          <p style="margin:0 0 28px;">
            <a href="${safeUrl}" style="display:inline-block;background:#512301;color:#fbfaf6;text-decoration:none;padding:14px 22px;border-radius:4px;font-size:14px;letter-spacing:.12em;text-transform:uppercase;">Ver invitación</a>
          </p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#6f5b50;">Si el botón no funciona, abre este enlace:</p>
          <p style="margin:8px 0 0;word-break:break-all;font-size:14px;line-height:1.6;color:#512301;">${safeUrl}</p>
        </div>
      </div>
    </div>
  `;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InvitationEmailPayload>(event);
  const name = normalizeText(body?.name);
  const email = normalizeEmail(body?.email);
  const pdfBase64 = normalizeText(body?.pdfBase64);
  const pdfFilename = normalizeText(body?.pdfFilename) || 'invitacion-boda-renee-gabriel.pdf';

  if (name.length < 3) {
    throw createError({
      statusCode: 400,
      message: 'Escribe un nombre válido.',
    });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({
      statusCode: 400,
      message: 'Escribe un correo válido.',
    });
  }

  if (!pdfBase64 || !/^[A-Za-z0-9+/=]+$/.test(pdfBase64)) {
    throw createError({
      statusCode: 400,
      message: 'No se recibió el PDF de la invitación.',
    });
  }

  const requestUrl = getRequestURL(event);
  const invitationUrl = new URL(
    `${requestUrl.pathname.replace(/\/api\/invitacion-email$/, '')}asistencia?nombre=${encodeURIComponent(name)}`,
    requestUrl.origin,
  ).toString();

  await sendResendEmail({
    to: email,
    subject: buildSubject(),
    text: buildText(name, invitationUrl),
    html: buildHtml(name, invitationUrl),
    attachments: [
      {
        filename: pdfFilename,
        content: pdfBase64,
        contentType: 'application/pdf',
      },
    ],
  });

  return {
    success: true,
    message: 'Invitación enviada por correo.',
  };
});
