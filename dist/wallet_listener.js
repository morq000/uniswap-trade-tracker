import "dotenv/config";
import { CHAIN_ID, CHAIN_NAMES, TARGET_WALLET_ADDRESS, COPY_BUY_PERCENT, SLIPPAGE_PERCENT, DEADLINE, MAX_DUPE_BUY, } from "./config.js";
import { sendTelegramMessage } from "./telegram_notifier.js";
import { graphQlV3Client, graphQlV2Client, getWalletV3Swaps, getWalletv2Swaps, } from "./graphql/graphql.js";
import { addToQueue } from "./queueManager.js";
let lastTimestamp = Math.floor(Date.now() / 1000); // Текущее время в секундах
// Функция мониторинга
export const startWalletMonitoring = async () => {
    await sendTelegramMessage(`Начало мониторинга кошелька ${TARGET_WALLET_ADDRESS} в сети ${CHAIN_NAMES[CHAIN_ID]}\n
        --- Настройки ---\n
        - Покупать на ${COPY_BUY_PERCENT}% от размера оригинальной покупки
        - Докупать монету максимум ${MAX_DUPE_BUY} раз(а)
        - Дедлайн транзакции: ${DEADLINE} секунд
        - Проскальзывание: ${Number(SLIPPAGE_PERCENT.toFixed())}%
        `);
    // Основная петля приложения
    setInterval(async () => {
        try {
            let v3Result = { swaps: [] };
            let v2Result = { swaps: [] };
            // Запрос свопов из V3
            try {
                v3Result = await graphQlV3Client.request(getWalletV3Swaps, {
                    origin: TARGET_WALLET_ADDRESS,
                    timestamp_gt: lastTimestamp,
                });
            }
            catch (error) {
                console.log(`Ошибка получения свопов из V3 subgraph`);
            }
            try {
                // Запрос свопов из V2
                v2Result = await graphQlV2Client.request(getWalletv2Swaps, {
                    from: TARGET_WALLET_ADDRESS,
                    timestamp_gt: lastTimestamp,
                });
            }
            catch (error) {
                console.log(`Ошибка получения свопов из V2 subgraph`);
            }
            // Объединение результатов
            const allSwaps = [...v3Result.swaps, ...v2Result.swaps];
            console.log("New swaps: ", allSwaps);
            if (allSwaps.length > 0) {
                // Сортировка свопов по временной метке в порядке возрастания
                allSwaps.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));
                // Обновление lastTimestamp на временную метку последнего свопа
                lastTimestamp = parseInt(allSwaps[allSwaps.length - 1].timestamp);
                allSwaps.forEach((swap) => addToQueue(swap));
            }
            else {
                // Если новых свопов нет, обновляем lastTimestamp на текущее время
                lastTimestamp = Math.floor(Date.now() / 1000);
            }
            console.log("New timestamp: ", lastTimestamp);
        }
        catch (error) {
            console.error("Ошибка при получении свопов:", error);
        }
    }, 10000);
};
