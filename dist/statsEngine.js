import { ethers } from "ethers";
import fs from "fs";
import Big from "big.js";
import { PORTFOLIO_FILE_PATH, FETCH_PRICE_API_RETRIES } from "./config.js";
const loadPortfolio = () => {
    if (fs.existsSync(PORTFOLIO_FILE_PATH)) {
        const data = fs.readFileSync(PORTFOLIO_FILE_PATH, "utf-8");
        return JSON.parse(data);
    }
    return {
        openPositions: {},
        closedPositions: {},
        totalProfitUSD: "0",
        transactions: [],
    };
};
const savePortfolio = (portfolio) => {
    fs.writeFileSync(PORTFOLIO_FILE_PATH, JSON.stringify(portfolio, null, 2));
};
const getTokenPriceUSD = async (tokenName) => {
    for (let i = 0; i < FETCH_PRICE_API_RETRIES; i++) {
        try {
            const request = `https://api.coinbase.com/v2/exchange-rates?currency=${tokenName}`;
            const response = await fetch(request);
            const price = (await response.json()).data.rates.USD;
            console.log(`Ответ API цены для токена ${tokenName}:`, price);
            if (!price)
                throw new Error();
            return Number(price);
        }
        catch (error) {
            console.error(`Ошибка при получении цены токена ${tokenName}:`, error);
        }
    }
    console.error(`Не удалось получить цену токена ${tokenName} после ${FETCH_PRICE_API_RETRIES} попыток`);
    return 0;
};
export const getOpenPositions = (token0Symbol, token1Symbol) => {
    const portfolio = loadPortfolio();
    const pair = `${token0Symbol}/${token1Symbol}`;
    const reversePair = `${token1Symbol}/${token0Symbol}`;
    return {
        openPosition: portfolio.openPositions[pair],
        openReversePosition: portfolio.openPositions[reversePair],
    };
};
export const processTransactionStats = async (statsData) => {
    const { txHash, tokenInName, tokenOutName, amountIn, amountOut, decimalsIn, decimalsOut, tokenInPrice, tokenOutPrice } = statsData;
    console.log('received stats data: ', statsData);
    const portfolio = loadPortfolio();
    const timestamp = Date.now();
    const id = ethers.utils.id(`${timestamp}-${tokenInName}-${tokenOutName}-${amountIn}-${amountOut}`);
    // Преобразуем входные значения из bigint в Big с учётом десятичных знаков
    const bigAmountIn = new Big(amountIn.toString()).div(new Big(10).pow(Number(decimalsIn)));
    const bigAmountOut = new Big(amountOut.toString()).div(new Big(10).pow(Number(decimalsOut)));
    // Получаем цены токенов
    // если от АПИ не пришла цена, берем цену на момент свопа
    let priceInUSD = await getTokenPriceUSD(tokenInName);
    if (!priceInUSD)
        priceInUSD = tokenInPrice ? tokenInPrice.toNumber() : 0;
    let priceOutUSD = await getTokenPriceUSD(tokenOutName);
    if (!priceOutUSD)
        priceOutUSD = tokenOutPrice ? tokenOutPrice.toNumber() : 0;
    // Формируем пару токенов
    const pair = `${tokenInName}/${tokenOutName}`;
    const reversePair = `${tokenOutName}/${tokenInName}`;
    // Проверяем, существует ли уже открытая позиция по данной паре или обратной паре
    const existingPosition = portfolio.openPositions[pair] || portfolio.openPositions[reversePair];
    let profitUSD = new Big("0");
    if (existingPosition) {
        if (existingPosition === portfolio.openPositions[pair]) {
            console.log('Found existing position fo pair ', pair);
            // Если позиция существует и это покупка, обновляем среднюю цену и количество
            const prevAmount = new Big(existingPosition.amount);
            const prevAvgPrice = new Big(existingPosition.averagePriceUSD);
            const totalCost = prevAmount
                .times(prevAvgPrice)
                .plus(bigAmountOut.times(priceOutUSD));
            const newAmount = prevAmount.plus(bigAmountOut);
            const newAveragePrice = totalCost.div(newAmount);
            existingPosition.amount = newAmount.toString();
            existingPosition.averagePriceUSD = newAveragePrice.toString();
            existingPosition.extraBuyTimes += 1;
        }
        else {
            // Если позиция существует и это продажа, фиксируем прибыль
            const prevAmount = new Big(existingPosition.amount);
            const prevAvgPrice = new Big(existingPosition.averagePriceUSD);
            const prevProfitUSD = new Big(existingPosition.profitUSD);
            profitUSD = bigAmountIn
                .times(priceInUSD)
                .minus(bigAmountIn.times(prevAvgPrice));
            console.log("profit: ", profitUSD.toString());
            // Обновляем общую прибыль
            portfolio.totalProfitUSD = new Big(portfolio.totalProfitUSD)
                .plus(profitUSD)
                .toString();
            // Уменьшаем количество токенов в позиции
            const newAmount = prevAmount.minus(bigAmountIn);
            // Обновляем данные о прибыли
            existingPosition.profitUSD = prevProfitUSD
                .plus(profitUSD)
                .toNumber();
            if (newAmount.lte(0)) {
                // Если позиция полностью закрыта, перемещаем её в закрытые позиции
                portfolio.closedPositions[reversePair] = existingPosition;
                delete portfolio.openPositions[reversePair];
            }
            else {
                existingPosition.amount = newAmount.toString();
            }
        }
    }
    else {
        // Если позиции нет, создаём новую
        portfolio.openPositions[pair] = {
            amount: bigAmountOut.toString(),
            averagePriceUSD: priceOutUSD.toString(),
            extraBuyTimes: 0,
            profitUSD: 0,
        };
    }
    // Создаём запись о транзакции
    const newTransaction = {
        id,
        txHash,
        timestamp,
        tokenInName,
        tokenOutName,
        amountIn: bigAmountIn.toString(),
        amountOut: bigAmountOut.toString(),
        priceInUSD,
        priceOutUSD,
        profitUSD: profitUSD.toNumber(),
    };
    portfolio.transactions.push(newTransaction);
    // Сохраняем обновлённый портфель
    savePortfolio(portfolio);
};
