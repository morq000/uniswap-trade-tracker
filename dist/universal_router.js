import { TradeType, Ether, CurrencyAmount, } from "@uniswap/sdk-core";
import { CHAIN_ID, SLIPPAGE_PERCENT, UNISWAP_ROUTERS, } from "./config.js";
import { UniversalRouterVersion } from "@uniswap/universal-router-sdk";
import { AlphaRouter, SwapType, } from "@uniswap/smart-order-router";
import { provider, signer } from "./web3Provider.js";
import { makeTokenApprove } from "./utils.js";
import { sendTelegramMessage } from "./telegram_notifier.js";
const router = new AlphaRouter({
    chainId: CHAIN_ID,
    provider,
});
const ETHER = Ether.onChain(CHAIN_ID);
const slippage = SLIPPAGE_PERCENT;
const swapOptionsUniversalRouter = {
    recipient: signer.address,
    slippageTolerance: slippage,
    type: SwapType.UNIVERSAL_ROUTER,
    version: UniversalRouterVersion.V1_2, // Убедиться что версия нужная ???
};
export const executeTrade = async (tokenIn, amountIn, tokenOut, sendNativeEther, receiveNativeEther) => {
    const route = await router.route(sendNativeEther ? CurrencyAmount.fromRawAmount(ETHER, amountIn) : CurrencyAmount.fromRawAmount(tokenIn, amountIn), receiveNativeEther ? ETHER : tokenOut, TradeType.EXACT_INPUT, swapOptionsUniversalRouter);
    // console.log('Route: ', JSON.stringify(route, null, 2));
    if (!route || !route.methodParameters) {
        throw new Error(`Failed to get route. Params: ${tokenIn}, ${tokenOut}, ${amountIn}`);
    }
    if (!sendNativeEther) {
        const approveSuccess = await makeTokenApprove(tokenIn.address, UNISWAP_ROUTERS[CHAIN_ID]["universalRouter"], signer, BigInt(amountIn.toString()));
        if (!approveSuccess) {
            throw new Error(`Ошибка при попытке аппрува токена ${tokenIn.symbol} для адреса ${UNISWAP_ROUTERS[CHAIN_ID]["universalRouter"]}.`);
        }
    }
    try {
        const tx = await signer.sendTransaction({
            data: route.methodParameters.calldata,
            to: UNISWAP_ROUTERS[CHAIN_ID]["universalRouter"],
            value: route.methodParameters.value,
        });
        const receipt = await tx.wait();
        if (receipt.status == 1) {
            await sendTelegramMessage(`Обмен успешно выполнен: ${tokenIn.symbol} -> ${tokenOut.symbol}.\nTX hash: ${receipt.transactionHash}`);
            return receipt;
        }
        else {
            await sendTelegramMessage(`Ошибка при выполнении обмена: ${tokenIn.symbol} -> ${tokenOut.symbol}. TX hash: ${receipt.transactionHash}`);
            return receipt;
        }
    }
    catch (error) {
        console.log("Swap error: ", error);
        return undefined;
    }
};
