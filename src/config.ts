import 'dotenv/config';

///////////////////
// Настройки бота//
///////////////////
// Кошелек, за которым следим
export const TARGET_WALLET_ADDRESS =
  '0x08e390762f64ABA6F9F9269589e1A702623e90F1'; // test wallet
//'0xF0948D9E11C81FaAA0EdC54022Bf53Ff513163B0';
// Макс количество повторных покупок
export const MAX_DUPE_BUY = 3;
// Делать покупку на процент от покупки таргета
export const COPY_BUY_PERCENT: string = '10'; // 10 = 10%
// Дедлайн для транзакции покупки/продажи
export const DEADLINE = 5 * 60; // 5 минут
// Адрес файла для хранения портфолио (по умолчанию корень приложения)
export const PORTFOLIO_FILE_PATH = './portfolio.json';

////////////////////////
// Системные настройки//
////////////////////////
// Количество попыток при совершении действий
export const FETCH_PRICE_API_RETRIES = 3;

// Идентификатор сети: Ethereum Mainnet = 1; Ethereum sepolia testnet = 11155111;
export const CHAIN_ID = 11155111;

// Subgraph IDs
export const UNI_V3_SUBGRAPH_ID = {
    1: '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
    11155111: 'B4QeFHkfWXjKCDzNn3BJtDRDfG6VeHzGXgkf4Jt3fRn5'
}

export const UNI_V2_SUBGRAPH_ID = {
    1: 'EYCKATKGBKLWvSfwvBjzfCBmGwYNdVkduYXVivCsLRFu',
    11155111: 'EYCKATKGBKLWvSfwvBjzfCBmGwYNdVkduYXVivCsLRFu'
}

// The Graph API 
export const GRAPH_URL_UNI_V3 = `https://gateway.thegraph.com/api/${process.env.GRAPH_API_TOKEN}/subgraphs/id/${UNI_V3_SUBGRAPH_ID[CHAIN_ID]}`;

//
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

// export const FUNCTION_SIGNATURES = {
//   v2: [
//     '0x38ed1739',
//     '0x8803dbee',
//     '0x7ff36ab5',
//     '0x4a25d94a',
//     '0x18cbafe5',
//     '0xfb3bdb41',
//     '0x5c11d795',
//     '0xb6f9de95',
//     '0x791ac947',
//   ],
//   v3: [
//     '0x414bf389',
//     '0xc04b8d59',
//     '0xdb3e2198',
//     '0xf28c0498',
//     '0x5ae401dc',
//     '0x1f0464d1',
//   ],
//   multicall: ['0x5ae401dc', '0x1f0464d1'],

// };

// // Человекочитаемые названия фукнций, копирование которых поддерживает приложение
// export const FUNCTION_NAMES: { [key: string]: string } = {
//   '0x38ed1739': 'V2: Обмен фикс. кол-ва токенов на токены',
//   '0x8803dbee': 'V2: Обмен токенов на фикс. кол-во токенов',
//   '0x7ff36ab5': 'V2: Обмен фикс. кол-ва ETH на токены',
//   '0x4a25d94a': 'V2: Обмен токенов на фикс. кол-во ETH',
//   '0x18cbafe5': 'V2: Обмен фикс. кол-ва токенов на ETH',
//   '0xfb3bdb41': 'V2: Обмен ETH на фикс. кол-во токенов',
//   '0x5c11d795':
//     'V2: Обмен фикс. кол-ва токенов на токены с поддержкой сбора комиссии',
//   '0xb6f9de95':
//     'V2: Обмен фикс. кол-ва ETH на токены с поддержкой сбора комиссии',
//   '0x791ac947':
//     'V2: Обмен фикс. кол-ва токенов на ETH с поддержкой сбора комиссии',
//   '0x414bf389': 'V3 Обмен фикс. кол-ва токенов на токены по одному пути',
//   '0xc04b8d59': 'V3 Обмен фикс. кол-ва токенов на токены',
//   '0xdb3e2198': 'V3 Обмен токенов на фикс. кол-во токенов по одному пути',
//   '0xf28c0498': 'V3 Обмен токенов на фикс. кол-во токенов',
//   '0x5ae401dc': 'V3: Multicall обмен',
//   '0x1f0464d1': 'V3: Multicall обмен',
// };

// Список стейблов, относительно которых действие считается покупкой или продажей
export const STABLE_COINS = ['USDT', 'USDC', 'DAI'];
