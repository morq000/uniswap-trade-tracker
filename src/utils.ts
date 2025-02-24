import { ethers } from "ethers";
import Big from "big.js";
import {
    DEADLINE,
    COPY_BUY_PERCENT,
    TARGET_WALLET_ADDRESS,
    WETH_ADDRESS,
    CHAIN_ID,
} from "./config";
import { IERC20 } from "./abi/IERC20";
import { Token } from "@uniswap/sdk-core";

export const generateDeadline = (): number => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return currentTimestamp + DEADLINE;
};

export const makeTokenApprove = async (
    tokenAddress: string,
    routerAddress: string,
    signer: ethers.Wallet,
    spendingAmount?: bigint
): Promise<Boolean> => {
    console.log(
        `Approve called with params: `,
        tokenAddress,
        routerAddress,
        signer,
        spendingAmount
    );
    const tokenContract = new ethers.Contract(tokenAddress, IERC20, signer);
    //не делать аппрув если текущего аппрува достаточно
    if (
        spendingAmount &&
        (await tokenContract.allowance(signer.address, routerAddress)) >=
            spendingAmount
    ) {
        console.log(`Current approve is enough`);
        return true;
    }
    const maxUint = ethers.constants.MaxUint256;

    try {
        const approveTx = await tokenContract.approve(routerAddress, maxUint);
        console.log(`Approve TX: ${approveTx}`);
        const receipt = await approveTx.wait();
        console.log(`Approve transaction sent: ${receipt?.transactionHash}`);
        return true;
    } catch (error) {
        console.error(`Error sending approve transaction: ${error}`);
        return false;
    }
};

export const calcBuyPercent = (amountString: string): string => {
    if (COPY_BUY_PERCENT == "100") {
        return amountString;
    }
    return new Big(amountString)
        .mul(new Big(COPY_BUY_PERCENT))
        .div(new Big("100"))
        .toFixed(0)
        .toString();
};

export const calcSellPercent = async (
    provider: ethers.providers.JsonRpcProvider,
    myAddress: string,
    tokenAddress: string,
    amountIn: string // amountIn уже в wei или наименьших единицах актива
): Promise<string> => {
    console.log(
        `calcSellPercent params: ${myAddress}, ${tokenAddress}, ${amountIn}`
    );
    // Создаем контракт токена
    const targetBalanceAfterSell = await getCurrencyBalance(
        tokenAddress,
        TARGET_WALLET_ADDRESS,
        provider
    );
    const targetBalanceBeforeSell = ethers.BigNumber.from(
        targetBalanceAfterSell
    ).add(amountIn);
    // Получаем баланс нашего кошелька (в wei или наименьших единицах актива)
    const myBalanceBeforeSell = await getCurrencyBalance(
        tokenAddress,
        myAddress,
        provider
    );
    // Таргет продал весь свой токен, и мы тоже продаем
    if (targetBalanceAfterSell.isZero()) {
        console.log("targetBalanceAfterSell balance is zero");
        return myBalanceBeforeSell;
    }
    // Вычисляем, сколько нам нужно продать
    const amountToSell = myBalanceBeforeSell
        .mul(ethers.BigNumber.from(amountIn))
        .div(targetBalanceBeforeSell);
    console.log("Amount to sell: ", amountToSell.toString());
    return amountToSell.toString();
};

export const getCurrencyBalance = async (
    tokenAddress: string,
    ownerAddress: string,
    provider: ethers.providers.JsonRpcProvider
) => {
    const tokenContract = new ethers.Contract(tokenAddress, IERC20, provider);
    return await tokenContract.balanceOf(ownerAddress);
};

export const getPriceInUSD = (buyAmount: string, quoteAmount: string) => {
    console.log("Get price USD:", quoteAmount, buyAmount);
    return new Big(quoteAmount).div(new Big(buyAmount));
};
