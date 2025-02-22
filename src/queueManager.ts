// queueManager.ts
import PQueue from 'p-queue';
import { V3Swap, V2Swap } from './graphql/graphql';
import { processTrade } from './tradeProcessor';

// Создаем очередь с ограничением на 1 одновременную задачу
const queue = new PQueue({ concurrency: 1 });

// Функция для добавления свопа в очередь
export const addToQueue = (swap: V3Swap | V2Swap) => {
  queue.add(() => processTrade(swap));
};

// Экспортируем очередь для возможного мониторинга или управления
export { queue };