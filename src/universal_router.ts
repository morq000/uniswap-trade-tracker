import {
    TradeType,
    Ether,
    Token,
    CurrencyAmount,
    Percent,
    BigintIsh,
} from "@uniswap/sdk-core";
import {
    CHAIN_ID,
    TARGET_WALLET_ADDRESS,
    SLIPPAGE_PERCENT,
    UNISWAP_ROUTERS,
} from "./config";
import {
    UniversalRouterVersion,
} from "@uniswap/universal-router-sdk";
import {
    AlphaRouter,
    SwapType,
    SwapOptionsUniversalRouter,
} from "@uniswap/smart-order-router";
import { provider, signer } from "./web3Provider";
import { makeTokenApprove } from "./utils";
import { sendTelegramMessage } from "./telegram_notifier";

const router = new AlphaRouter({
    chainId: CHAIN_ID,
    provider,
});

const ETHER = Ether.onChain(CHAIN_ID);

const swapOptionsUniversalRouter: SwapOptionsUniversalRouter = {
    recipient: TARGET_WALLET_ADDRESS,
    slippageTolerance: new Percent(SLIPPAGE_PERCENT, 10_000),
    type: SwapType.UNIVERSAL_ROUTER,
    version: UniversalRouterVersion.V2_0, // ???
};

export const executeTrade = async (
    tokenIn: Token,
    amountIn: BigintIsh,
    tokenOut: Token
) => {
    const route = await router.route(
        CurrencyAmount.fromRawAmount(tokenIn, amountIn),
        tokenOut,
        TradeType.EXACT_INPUT,
        swapOptionsUniversalRouter
    );
    if (!route || !route.methodParameters) {
        throw new Error(
            `Failed to get route. Params: ${tokenIn}, ${tokenOut}, ${amountIn}`
        );
    }
    const approveSuccess = await makeTokenApprove(
        tokenIn.address,
        UNISWAP_ROUTERS[CHAIN_ID]["universalRouter"],
        signer
    );
    if (!approveSuccess) {
        throw new Error(
            `Ошибка при попытке аппрува токена ${tokenIn.symbol} для адреса ${UNISWAP_ROUTERS[CHAIN_ID]["universalRouter"]}.`
        );
    }
    try {
        const tx = await signer.sendTransaction({
            data: route.methodParameters.calldata,
            to: UNISWAP_ROUTERS[CHAIN_ID]["universalRouter"],
            value: route.methodParameters.value,
        });
        const receipt = await tx.wait();
        if (receipt.status == 1) {
            await sendTelegramMessage(
                `Swap успешно выполнен: ${tokenIn.symbol} -> ${tokenOut.symbol}.\nTX hash: ${receipt.transactionHash}`
            );
            return true;
        } else {
            await sendTelegramMessage(
                `Ошибка при выполнении swap: ${tokenIn.symbol} -> ${tokenOut.symbol}. TX hash: ${receipt.transactionHash}`
            );
            return false;
        }
    } catch (error) {
        console.log("Swap error: ", error);
        return false;
    }
};
