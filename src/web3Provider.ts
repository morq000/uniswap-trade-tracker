import { ethers } from 'ethers';
import 'dotenv/config';
import { INFURA_RPC, FLASHBOTS_RPC, CHAIN_ID } from './config';
// import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';

// Проверка наличия приватника в .env файле
if (!process.env.PRIVATE_KEY) {
  console.error('Ошибка: Не найден приватный ключ в .env файле');
  process.exit(1);
}

// Инициализация провайдера и сайнера
export const provider = new ethers.providers.JsonRpcProvider(INFURA_RPC[CHAIN_ID]);
// export const flashbotsSigner = new ethers.Wallet(process.env.PRIVATE_KEY, flashbotsProvider);
export const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);    

// Flashbots provider
// export let flashbotsProvider: FlashbotsBundleProvider;
// (async () => {
//     // Flashbots provider
//     flashbotsProvider = await FlashbotsBundleProvider.create(
//         provider,
//         signer
//     );
// })();


