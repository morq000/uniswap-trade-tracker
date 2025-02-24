import { ethers, BigNumber } from "ethers";
import Big from "big.js";
import { BigintIsh, Token } from "@uniswap/sdk-core";
import { V2Swap, V3Swap } from "./graphql/graphql.js";
import { sendTelegramMessage } from "./telegram_notifier.js";
import { executeTrade } from "./universal_router.js";
import {
    CHAIN_ID,
    ABORT_IF_STATS_FAIL,
    MAX_DUPE_BUY,
    WETH_ADDRESS,
    BASE_CURRENCIES
} from "./config.js";
import {
    calcBuyPercent,
    calcSellPercent,
    getCurrencyBalance,
    getPriceInUSD,
} from "./utils.js";
import { getOpenPositions, processTransactionStats } from "./statsEngine.js";
import { provider, signer } from "./web3Provider.js";

interface ProcessedSwapParams {
    shouldSwap: boolean;
    amountIn?: BigintIsh;
    description?: string;
}

export const processTrade = async (swap: V2Swap | V3Swap) => {
    try {
        let sendNativeEther = false;
        const { tokenIn, tokenOut, amountIn, tokenInPrice, tokenOutPrice } =
            processData(swap);
        // Если оба токена в позиции - базовые, то не открывать такую позицию
        if (tokenIn.symbol && tokenOut.symbol && tokenIn.symbol in BASE_CURRENCIES && tokenOut.symbol in BASE_CURRENCIES) {
            console.log(`Пропуск создания позиции по базовым активам: ${tokenIn.symbol}/${tokenOut.symbol}`);
            return;
        }
        const processedData = await processPositions(
            tokenIn,
            amountIn,
            tokenOut
        );
        if (processedData.description) await sendTelegramMessage(`Новый своп: ${processedData.description}`);
        // Возврат если не нужно свопать
        if (!processedData.shouldSwap || !processedData.amountIn) {
            console.log(processedData.description);
            return;
        }
        // Проверка баланса
        const currentBalance = await getCurrencyBalance(
            tokenIn.address,
            signer.address,
            provider
        );
        // Если отдаем эфир или обернутый эфир
        if (
            tokenIn.address.toLowerCase() ==
            WETH_ADDRESS[CHAIN_ID].toLowerCase()
        ) {
            const nativeBalance = await provider.getBalance(signer.address);
            if (
                nativeBalance <
                BigNumber.from(processedData.amountIn.toString())
            ) {
                // Недостаточно баланса нативного эфира, проверяем, хватит ли обернутого
                if (
                    BigNumber.from(currentBalance) <
                    BigNumber.from(processedData.amountIn.toString())
                ) {
                    // обернутого тоже нет, пишем ошибку
                    const msgString = `Недостаточно баланса Эфира.\nНужно: ${processedData.amountIn}\nЕсть нативного: ${nativeBalance}\nЕсть WETH: ${currentBalance}`;
                    await sendTelegramMessage(msgString);
                    console.log(msgString);
                    return;
                }
            } else {
                sendNativeEther = true;
                console.log("Отдаем нативный эфир");
            }
        } else if (processedData.amountIn > currentBalance) {
            const msgString = `Недостаточно баланса токена ${tokenIn.symbol}.\nНужно: ${processedData.amountIn}\nЕсть: ${currentBalance}`;
            await sendTelegramMessage(msgString);
            console.log(msgString);
            return;
        }
        const receiveNativeEther =
            tokenOut.address.toLowerCase() ==
            WETH_ADDRESS[CHAIN_ID].toLowerCase();
        const tokenOutStartBalance =
        receiveNativeEther
                ? BigInt((await provider.getBalance(signer.address)).toString())
                : await getCurrencyBalance(
                      tokenOut.address,
                      signer.address,
                      provider
                  );
        const receipt = await executeTrade(
            tokenIn,
            processedData.amountIn,
            tokenOut,
            sendNativeEther,
            receiveNativeEther
        );
        if (receipt && receipt.status == 1) {
            const tokenOutEndBalance =
            receiveNativeEther
                    ? BigInt(
                          (await provider.getBalance(signer.address)).toString()
                      )
                    : await getCurrencyBalance(
                          tokenOut.address,
                          signer.address,
                          provider
                      );
            await processTransactionStats({
                txHash: receipt.transactionHash,
                tokenInName: tokenIn.symbol ? tokenIn.symbol : tokenIn.address,
                tokenOutName: tokenOut.symbol
                    ? tokenOut.symbol
                    : tokenOut.address,
                amountIn: BigInt(amountIn.toString()),
                amountOut: BigInt(tokenOutEndBalance - tokenOutStartBalance),
                decimalsIn: BigInt(tokenIn.decimals),
                decimalsOut: BigInt(tokenOut.decimals),
                tokenInPrice,
                tokenOutPrice,
            });
        } else {
            console.error("Ошибка: транзакция не была выполнена успешно.");
        }
    } catch (error) {
        console.log(`Ошибка создания свопа: ${error}`);
    }
};

const processPositions = async (
    tokenIn: Token,
    amountIn: BigintIsh,
    tokenOut: Token
): Promise<ProcessedSwapParams> => {
    console.log(
        "ProcessPositions called with params:",
        tokenIn.symbol,
        amountIn,
        tokenOut.symbol
    );
    // Получение открытых позиций по этой паре
    if (tokenIn.symbol && tokenOut.symbol) {
        const openPositions = getOpenPositions(tokenIn.symbol, tokenOut.symbol);
        // Если есть открытые позиции по обратной паре, то это продажа
        // нужно продать тот же процент актива, что продает таргет
        console.log(
            `Got open positions for pair: ${tokenIn.symbol}/${tokenOut.symbol}: `,
            openPositions
        );
        if (openPositions.openReversePosition) {
            const sellAmount = await calcSellPercent(
                provider,
                signer.address,
                tokenIn.address,
                amountIn.toString()
            );
            console.log(`Продажа ${tokenIn.symbol}, количество: ${sellAmount}`);
            return {
                shouldSwap: true,
                amountIn: sellAmount,
                description: `Продажа ${tokenIn.symbol}, количество: ${sellAmount}`,
            };
        }
        // Если есть открытые позиции по этой паре, но уже докупали макс кол-во раз
        if (
            openPositions.openPosition &&
            openPositions.openPosition.extraBuyTimes >= MAX_DUPE_BUY
        ) {
            console.log(
                `! Отмена покупки ${tokenOut.symbol}: больше нельзя докупать (${MAX_DUPE_BUY} раза)`
            );
            return {
                shouldSwap: false,
                description: `! Отмена покупки ${tokenOut.symbol}: больше нельзя докупать (${MAX_DUPE_BUY} раза)`,
            };
        }
        // Если нет открытых позиций, либо можно докупить
        const buyAmount = calcBuyPercent(amountIn.toString());
        console.log(
            `Покупка ${tokenOut.symbol}, количество: ${tokenIn.symbol}:${buyAmount}`
        );
        return {
            shouldSwap: true,
            amountIn: buyAmount,
            description: `Покупка ${tokenOut.symbol}, количество: ${tokenIn.symbol}:${buyAmount}`,
        };
    }
    // Если не получили инфы о токенах, но конфиг разрешает свопать
    else if (!ABORT_IF_STATS_FAIL) {
        return {
            shouldSwap: true,
            amountIn,
            description: `! Покупка с ошибкой обработки статистики: токен ${tokenIn.symbol}, количество: ${amountIn}`,
        };
    } else {
        return {
            shouldSwap: false,
            description: `! Отмена покупки ${tokenOut.symbol}: ошибка получения статистики, покупка запрещена.`,
        };
    }
};

const processData = (swap: V2Swap | V3Swap) => {
    let tokenIn: Token | undefined;
    let tokenOut: Token | undefined;
    let amountIn: BigintIsh | undefined;
    let tokenInPrice: Big.Big | undefined;
    let tokenOutPrice: Big.Big | undefined;

    // For v2 swap
    if ("pair" in swap) {
        const token0 = swap.pair.token0;
        const token1 = swap.pair.token1;

        tokenIn =
            swap.amount1In === "0"
                ? new Token(
                      CHAIN_ID,
                      token0.id,
                      Number(token0.decimals),
                      token0.symbol
                  )
                : new Token(
                      CHAIN_ID,
                      token1.id,
                      Number(token1.decimals),
                      token1.symbol
                  );

        tokenOut =
            tokenIn.address.toLowerCase() === token0.id.toLowerCase()
                ? new Token(
                      CHAIN_ID,
                      token1.id,
                      Number(token1.decimals),
                      token1.symbol
                  )
                : new Token(
                      CHAIN_ID,
                      token0.id,
                      Number(token0.decimals),
                      token0.symbol
                  );

        amountIn =
            swap.amount1In === "0"
                ? ethers.utils
                      .parseUnits(swap.amount0In, token0.decimals)
                      .toString()
                : ethers.utils
                      .parseUnits(swap.amount1In, token1.decimals)
                      .toString();

        tokenInPrice =
            swap.amount1In === "0"
                ? getPriceInUSD(swap.amount0In, swap.amountUSD)
                : getPriceInUSD(swap.amount1In, swap.amountUSD);

        tokenOutPrice =
            swap.amount0In === "0"
                ? getPriceInUSD(swap.amount0Out, swap.amountUSD)
                : getPriceInUSD(swap.amount1Out, swap.amountUSD);
    }

    // For v3 swap
    if ("origin" in swap) {
        tokenIn = swap.amount1.startsWith("-")
            ? new Token(
                  CHAIN_ID,
                  swap.token0.id,
                  Number(swap.token0.decimals),
                  swap.token0.symbol
              )
            : new Token(
                  CHAIN_ID,
                  swap.token1.id,
                  Number(swap.token1.decimals),
                  swap.token1.symbol
              );

        tokenOut =
            tokenIn.address.toLowerCase() === swap.token0.id.toLowerCase()
                ? new Token(
                      CHAIN_ID,
                      swap.token1.id,
                      Number(swap.token1.decimals),
                      swap.token1.symbol
                  )
                : new Token(
                      CHAIN_ID,
                      swap.token0.id,
                      Number(swap.token0.decimals),
                      swap.token0.symbol
                  );

        amountIn = swap.amount1.startsWith("-")
            ? ethers.utils
                  .parseUnits(swap.amount0, swap.token0.decimals)
                  .toString()
            : ethers.utils
                  .parseUnits(swap.amount1, swap.token1.decimals)
                  .toString();

        tokenInPrice = swap.amount1.startsWith("-")
            ? getPriceInUSD(swap.amount0, swap.amountUSD)
            : getPriceInUSD(swap.amount1, swap.amountUSD);

        tokenOutPrice = swap.amount0.startsWith("-")
            ? getPriceInUSD(swap.amount0.slice(1), swap.amountUSD)
            : getPriceInUSD(swap.amount1.slice(1), swap.amountUSD);
    }

    if (!(tokenIn && tokenOut && amountIn)) {
        throw new Error(
            `Ошибка формирования входных аргументов для свопа: ${JSON.stringify(
                swap
            )}`
        );
    }

    return { tokenIn, tokenOut, amountIn, tokenInPrice, tokenOutPrice };
};
