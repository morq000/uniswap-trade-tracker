// import { ethers } from 'ethers';
import "dotenv/config";
import { CHAIN_ID, CHAIN_NAMES, TARGET_WALLET_ADDRESS } from "./config";
// import { provider } from './utils/web3Provider';
import { sendTelegramMessage } from "./telegram_notifier";
import {
    graphQlV3Client,
    graphQlV2Client,
    getWalletV3Swaps,
    getWalletv2Swaps,
    V2SwapsResponse,
    V3SwapsResponse,
    V3Swap,
    V2Swap,
} from "./graphql/graphql";

// // Временное хранилище для транзакций
const transactionPool: (V3Swap | V2Swap)[] = [];
let lastTimestamp = Math.floor(Date.now() / 1000); // Текущее время в секундах //1738273319//

// Функция мониторинга
export const startWalletMonitoring = async () => {
    await sendTelegramMessage(
        `Начало мониторинга кошелька ${TARGET_WALLET_ADDRESS} в сети ${CHAIN_NAMES[CHAIN_ID]}`
    );
    // Основная петля приложения
    setInterval(async () => {
        try {
            // Запрос свопов из V3
            const v3Result = await graphQlV3Client.request<V3SwapsResponse>(
                getWalletV3Swaps,
                {
                    origin: TARGET_WALLET_ADDRESS,
                    timestamp_gt: lastTimestamp,
                }
            );

            // Запрос свопов из V2
            const v2Result = await graphQlV2Client.request<V2SwapsResponse>(
                getWalletv2Swaps,
                {
                    from: TARGET_WALLET_ADDRESS,
                    timestamp_gt: lastTimestamp,
                }
            );

            // Объединение результатов
            const allSwaps = [...v3Result.swaps, ...v2Result.swaps];
            console.log("New swaps: ", allSwaps);

            if (allSwaps.length > 0) {
                // Сортировка свопов по временной метке в порядке возрастания
                allSwaps.sort(
                    (a, b) => parseInt(a.timestamp) - parseInt(b.timestamp)
                );

                // Добавление новых свопов в пул транзакций
                transactionPool.push(...allSwaps);
                console.log("TX pool: ", transactionPool);
                // Обновление lastTimestamp на временную метку последнего свопа
                lastTimestamp = parseInt(
                    allSwaps[allSwaps.length - 1].timestamp
                );

                // Обработка новых свопов (например, отправка уведомлений)
                for (const swap of allSwaps) {
                    await sendTelegramMessage(
                        `Новый своп: ${JSON.stringify(swap)}`
                    );
                }
            } else {
                // Если новых свопов нет, обновляем lastTimestamp на текущее время
                lastTimestamp = Math.floor(Date.now() / 1000);
            }
            console.log("New timestamp: ", lastTimestamp);
        } catch (error) {
            console.error("Ошибка при получении свопов:", error);
        }
    }, 10000);
};

// // Функция для обработки транзакций из хранилища
// const processTransactions = async () => {
//   while (transactionPool.length > 0) {
//     const tx = transactionPool.shift();

//   }
// };
