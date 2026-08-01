interface TelegramSendMessageResponse {
  ok: boolean;
  description?: string;
}

export async function sendTelegram(message: string): Promise<void> {
  const config = useRuntimeConfig();

  if (!config.telegramBotToken || !config.telegramChatId) {
    throw createError({
      statusCode: 500,
      message: 'Telegram no está configurado.',
    });
  }

  const response = await $fetch<TelegramSendMessageResponse>(
    `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
    {
      method: 'POST',
      body: {
        chat_id: config.telegramChatId,
        text: message,
      },
    },
  );

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      message: response.description || 'Telegram rechazó el mensaje.',
    });
  }
}
