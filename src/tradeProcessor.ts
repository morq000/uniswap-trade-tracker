import { BigintIsh, Token } from "@uniswap/sdk-core";
import { V2Swap, V3Swap } from "./graphql/graphql";
import { sendTelegramMessage } from "./telegram_notifier";
import { executeTrade } from "./universal_router";
import { CHAIN_ID } from "./config";
import { calcBuyPercent } from "./utils";

export const processTrade = async (swap: V2Swap | V3Swap) => {
    try {
        await sendTelegramMessage(`Новый своп: ${JSON.stringify(swap)}`);
        let tokenIn: Token | undefined;
        let tokenOut: Token | undefined;
        let amountIn: BigintIsh | undefined;

        // For v2 swap
        if ("pair" in swap) {
            const token0 = swap.pair.token0;
            const token1 = swap.pair.token1;
            tokenIn =
                swap.amount1In == "0"
                    ? new Token(CHAIN_ID, token0.id, Number(token0.decimals))
                    : new Token(CHAIN_ID, token1.id, Number(token1.decimals));

            tokenOut =
                tokenIn.address == token0.id
                    ? new Token(CHAIN_ID, token1.id, Number(token1.decimals))
                    : new Token(CHAIN_ID, token0.id, Number(token0.decimals));

            amountIn = calcBuyPercent(
                swap.amount0In != "0" ? swap.amount0In : swap.amount1In
            );
        }

        // For v3 pair
        if ("origin" in swap) {
            tokenIn = swap.amount0.startsWith("-")
                ? new Token(
                      CHAIN_ID,
                      swap.token0.id,
                      Number(swap.token0.decimals)
                  )
                : new Token(
                      CHAIN_ID,
                      swap.token1.id,
                      Number(swap.token1.decimals)
                  );
            tokenOut =
                tokenIn.address == swap.token0.id
                    ? new Token(
                          CHAIN_ID,
                          swap.token1.id,
                          Number(swap.token1.decimals)
                      )
                    : new Token(
                          CHAIN_ID,
                          swap.token0.id,
                          Number(swap.token0.decimals)
                      );
            amountIn = swap.amount0.startsWith("-")
                ? calcBuyPercent(swap.amount0.slice(1))
                : calcBuyPercent(swap.amount1.slice(1));
        }
        if (!(tokenIn && tokenOut && amountIn)) {
            throw new Error(
                `Ошибка формирования входных аргументво для свопа: ${swap}`
            );
        }
        const success = await executeTrade(tokenIn, amountIn, tokenOut);
    } catch (error) {
        console.log(`Ошибка создания свопа: ${error}`);
    }
};
