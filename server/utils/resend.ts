interface ResendEmailResponse {
  id?: string;
}

interface SendResendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export async function sendResendEmail(input: SendResendEmailInput): Promise<void> {
  const config = useRuntimeConfig();

  if (!config.resendApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Resend no está configurado.',
    });
  }

  const response = await $fetch<ResendEmailResponse>('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      from: config.resendFromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.attachments ? { attachments: input.attachments } : {}),
    },
  });

  if (!response.id) {
    throw createError({
      statusCode: 502,
      message: 'Resend no devolvió una respuesta válida.',
    });
  }
}
