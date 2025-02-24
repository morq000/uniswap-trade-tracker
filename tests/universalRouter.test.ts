// executeTrade.test.ts
import { executeTrade } from "../src/universal_router";
import { makeTokenApprove } from "../src/utils";
import { sendTelegramMessage } from "../src/telegram_notifier";
import { provider, signer } from "../src/web3Provider";
import { Token, CurrencyAmount } from "@uniswap/sdk-core";
import { AlphaRouter } from "@uniswap/smart-order-router";

// Мокируем зависимости
jest.mock("../src/utils", () => ({
    makeTokenApprove: jest.fn(),
}));

jest.mock("../src/telegram_notifier", () => ({
    sendTelegramMessage: jest.fn(),
}));

jest.mock("../src/web3Provider", () => ({
    provider: {},
    signer: {
        sendTransaction: jest.fn(),
    },
}));

jest.mock("@uniswap/smart-order-router", () => ({
    AlphaRouter: jest.fn().mockImplementation(() => ({
        route: jest.fn(),
    })),
}));

describe("executeTrade", () => {
    const tokenIn = new Token(1, "0xTokenIn", 18, "IN", "TokenIn");
    const tokenOut = new Token(1, "0xTokenOut", 18, "OUT", "TokenOut");
    const amountIn = "1000000000000000000"; // 1 токен

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("должен успешно выполнить своп", async () => {
        // Мокируем успешный вызов route
        const mockRoute = {
            methodParameters: {
                calldata: "0xabc123",
                value: "0x0",
            },
        };
        (AlphaRouter as jest.Mock).mockImplementation(() => ({
            route: jest.fn().mockResolvedValue(mockRoute),
        }));

        // Мокируем успешный аппрув
        (makeTokenApprove as jest.Mock).mockResolvedValue(true);

        // Мокируем успешную транзакцию
        const mockReceipt = { status: 1, transactionHash: "0x123abc" };
        (signer.sendTransaction as jest.Mock).mockResolvedValue({
            wait: jest.fn().mockResolvedValue(mockReceipt),
        });

        // Вызываем функцию
        const result = await executeTrade(tokenIn, amountIn, tokenOut);

        // Проверяем результаты
        expect(result).toBe(true);
        expect(makeTokenApprove).toHaveBeenCalledWith(
            tokenIn.address,
            expect.any(String),
            signer
        );
        expect(signer.sendTransaction).toHaveBeenCalledWith({
            data: mockRoute.methodParameters.calldata,
            to: expect.any(String),
            value: mockRoute.methodParameters.value,
        });
        expect(sendTelegramMessage).toHaveBeenCalledWith(
            `Swap успешно выполнен: ${tokenIn.symbol} -> ${tokenOut.symbol}.\nTX hash: ${mockReceipt.transactionHash}`
        );
    });

    it("должен выбросить ошибку, если route не найден", async () => {
        // Мокируем отсутствие route
        (AlphaRouter as jest.Mock).mockImplementation(() => ({
            route: jest.fn().mockResolvedValue(null),
        }));

        // Вызываем функцию и ожидаем ошибку
        await expect(executeTrade(tokenIn, amountIn, tokenOut)).rejects.toThrow(
            "Failed to get route"
        );
    });

    it("должен выбросить ошибку, если аппрув не удался", async () => {
        // Мокируем успешный route
        const mockRoute = {
            methodParameters: {
                calldata: "0xabc123",
                value: "0x0",
            },
        };
        (AlphaRouter as jest.Mock).mockImplementation(() => ({
            route: jest.fn().mockResolvedValue(mockRoute),
        }));

        // Мокируем неудачный аппрув
        (makeTokenApprove as jest.Mock).mockResolvedValue(false);

        // Вызываем функцию и ожидаем ошибку
        await expect(executeTrade(tokenIn, amountIn, tokenOut)).rejects.toThrow(
            `Ошибка при попытке аппрува токена ${tokenIn.symbol}`
        );
    });

    it("должен обработать ошибку при отправке транзакции", async () => {
        // Мокируем успешный route
        const mockRoute = {
            methodParameters: {
                calldata: "0xabc123",
                value: "0x0",
            },
        };
        (AlphaRouter as jest.Mock).mockImplementation(() => ({
            route: jest.fn().mockResolvedValue(mockRoute),
        }));

        // Мокируем успешный аппрув
        (makeTokenApprove as jest.Mock).mockResolvedValue(true);

        // Мокируем ошибку при отправке транзакции
        (signer.sendTransaction as jest.Mock).mockRejectedValue(
            new Error("Transaction failed")
        );

        // Вызываем функцию
        const result = await executeTrade(tokenIn, amountIn, tokenOut);

        // Проверяем, что функция вернула false
        expect(result).toBe(false);
        expect(sendTelegramMessage).not.toHaveBeenCalled();
    });

    it("должен обработать неудачную транзакцию (receipt.status != 1)", async () => {
        // Мокируем успешный route
        const mockRoute = {
            methodParameters: {
                calldata: "0xabc123",
                value: "0x0",
            },
        };
        (AlphaRouter as jest.Mock).mockImplementation(() => ({
            route: jest.fn().mockResolvedValue(mockRoute),
        }));

        // Мокируем успешный аппрув
        (makeTokenApprove as jest.Mock).mockResolvedValue(true);

        // Мокируем неудачную транзакцию
        const mockReceipt = { status: 0, transactionHash: "0x123abc" };
        (signer.sendTransaction as jest.Mock).mockResolvedValue({
            wait: jest.fn().mockResolvedValue(mockReceipt),
        });

        // Вызываем функцию
        const result = await executeTrade(tokenIn, amountIn, tokenOut);

        // Проверяем, что функция вернула false
        expect(result).toBe(false);
        expect(sendTelegramMessage).toHaveBeenCalledWith(
            `Ошибка при выполнении swap: ${tokenIn.symbol} -> ${tokenOut.symbol}. TX hash: ${mockReceipt.transactionHash}`
        );
    });
});