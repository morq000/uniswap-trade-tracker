import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';

if (!process.env.TELEGRAM_API_TOKEN) {
  console.error(
    'Ошибка: Не найдет API токен Телеграм бота. Выход из приложения...',
  );
  process.exit(1);
}
if (!process.env.TELEGRAM_CHAT_ID) {
  console.error('Ошибка: Не найден ID чата Телеграм. Выход из приложения...');
  process.exit(1);
}

const teleBot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, {
  polling: true,
});

export const sendTelegramMessage = async (message: string) => {
  try {
    await teleBot.sendMessage(process.env.TELEGRAM_CHAT_ID!, message);
  }
  catch(error) {
    console.log(`Ошибка при отправке Telegram сообщения: ${error}`);
  }
};
