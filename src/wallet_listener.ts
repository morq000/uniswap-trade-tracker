// import { ethers } from 'ethers';
import 'dotenv/config';
import {
  CHAIN_ID,
  CHAIN_NAMES,
  TARGET_WALLET_ADDRESS,
} from './config';
// import { provider } from './utils/web3Provider';
import { sendTelegramMessage } from './telegram_notifier';
import { graphQlV3Client, graphQlV2Client, getWalletV3Swaps, getWalletv2Swaps } from './graphql/graphql';

// // Временное хранилище для транзакций
// const transactionPool: ethers.TransactionResponse[] = [];
const lastTimestamp = 1738273319;

// Функция мониторинга
export const startWalletMonitoring = async () => {
  await sendTelegramMessage(
    `Начало мониторинга кошелька ${TARGET_WALLET_ADDRESS} в сети ${CHAIN_NAMES[CHAIN_ID]}`,
  );

  // Основная петля приложения
  setInterval(async () => {
    const result = await graphQlV3Client.request(getWalletV3Swaps, {origin: TARGET_WALLET_ADDRESS, timestamp_gt: lastTimestamp});
    console.log('Query V3 result: ', result);
    const v2Result = await graphQlV2Client.request(getWalletv2Swaps, {from: TARGET_WALLET_ADDRESS, timestamp_gt: lastTimestamp});
    console.log('V2 result: ', v2Result);
  }, 2000);
};

// // Функция для обработки транзакций из хранилища
// const processTransactions = async () => {
//   while (transactionPool.length > 0) {
//     const tx = transactionPool.shift();

//   }
// };
