import 'dotenv/config';
import { Percent } from '@uniswap/sdk-core';
import CONFIG from '../user_config.json' with { type: 'json'};


///////////////////
// Настройки бота//
///////////////////
const USER_CONFIG = CONFIG.USER_CONFIG;
// Кошелек, за которым следим
export const TARGET_WALLET_ADDRESS = USER_CONFIG.TARGET_WALLET_ADDRESS;
// Макс количество повторных покупок
export const MAX_DUPE_BUY = Number(USER_CONFIG.MAX_DUPE_BUY);
// Делать покупку на процент от покупки таргета
export const COPY_BUY_PERCENT: string = USER_CONFIG.COPY_BUY_PERCENT; // 10 = 10%
// Дедлайн для транзакции покупки/продажи
export const DEADLINE = Number(USER_CONFIG.DEADLINE);
// Адрес файла для хранения портфолио (по умолчанию корень приложения)
export const PORTFOLIO_FILE_PATH = USER_CONFIG.PORTFOLIO_FILE_PATH;
// Проскальзывание
export const SLIPPAGE_PERCENT = new Percent(Number(USER_CONFIG.SLIPPAGE), 10_000); // делитель 10_000, т.е. 50 это 0.005
// Останавливаем ли мы сделку, если не можем сформировать для нее статистику по какой-то причине
// например, не пришел Symbol одного токена
export const ABORT_IF_STATS_FAIL = USER_CONFIG.ABORT_IF_STATS_FAIL;

////////////////////////
// Системные настройки//
////////////////////////
// Количество попыток при совершении действий
export const FETCH_PRICE_API_RETRIES = 3;

// Идентификатор сети: Ethereum Mainnet = 1; Ethereum sepolia testnet = 11155111;
export const CHAIN_ID = 1;//11155111;

// Subgraph IDs
export const UNI_V3_SUBGRAPH_ID = {
    1: '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
    11155111: 'B4QeFHkfWXjKCDzNn3BJtDRDfG6VeHzGXgkf4Jt3fRn5'
}

export const UNI_V2_SUBGRAPH_ID = {
    1: 'EYCKATKGBKLWvSfwvBjzfCBmGwYNdVkduYXVivCsLRFu',
    11155111: '' // no subgraph for V2 in sepolia
}

// The Graph API 
export const GRAPH_URL_UNI_V3 = `https://gateway.thegraph.com/api/${process.env.GRAPH_API_TOKEN}/subgraphs/id/${UNI_V3_SUBGRAPH_ID[CHAIN_ID]}`;
export const GRAPH_URL_UNI_V2 = `https://gateway.thegraph.com/api/${process.env.GRAPH_API_TOKEN}/subgraphs/id/${UNI_V2_SUBGRAPH_ID[CHAIN_ID]}`;

// Адреса Flashbots RPC для защиты от MEV
export const FLASHBOTS_RPC = {
  1: 'https://rpc.flashbots.net/fast',
  11155111: 'https://relay-sepolia.flashbots.net'//'https://rpc-sepolia.flashbots.net/',
};

// Проверка наличия API ключа Infura в .env файле
if (!process.env.INFURA_API_KEY) {
  console.error('Ошибка: Не найден API ключ Infura в .env файле');
  process.exit(1);
}

export const INFURA_RPC = {
  1: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
  11155111: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
};

// Uniswap Routers
export const UNISWAP_ROUTERS = {
  1: {
    v2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    v3: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    router02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    universalRouter: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
  },
  11155111: {
    v2: '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3',
    v3: '0x65669fE35312947050C450Bd5d36e6361F85eC12', // Не официальный деплой
    router02: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
    universalRouter: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
  },
};

// Адреса контрактов обернутого эфира
export const WETH_ADDRESS = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  11155111: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
};

// Chain names
export const CHAIN_NAMES = {
  1: 'Ethereum Mainnet',
  11155111: 'Ethereum Sepolia testnet',
};