import "dotenv/config";
import { sendTelegramMessage } from './telegram_notifier';
import { startWalletMonitoring } from "./wallet_listener";

const main = async () => {
  console.log('Запуск приложения...');
  try {
    await sendTelegramMessage('🚀 Запуск UniswapWalletTracker!');
    console.log('✅ Приложение успешно запущено');
    await startWalletMonitoring();
  } catch (error) {
    console.error('🚨 Критическая ошибка:', error);
    process.exit(1);
  }
};

// Обработка сигналов завершения
const gracefulShutdown = async () => {
  console.log('\nПолучен сигнал завершения. Начинаем корректное завершение...');
  // TODO освобождение ресурсов
  try {
    // Здесь можно добавить асинхронное освобождение ресурсов
    await sendTelegramMessage('👋 Приложение завершает работу...');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при завершении работы:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

main().catch((error) => {
  console.error('Необработанная ошибка:', error);
  process.exit(1);
});
