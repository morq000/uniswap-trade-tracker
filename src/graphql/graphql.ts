import { gql, GraphQLClient } from "graphql-request";
import "dotenv/config";
import { GRAPH_URL_UNI_V3, CHAIN_ID, GRAPH_URL_UNI_V2 } from "../config";

// Интерфейс для токена
export interface Token {
  id: string;
  symbol: string;
  decimals: string;
}

// Интерфейс для пары токенов
export interface Pair {
  token0: Token;
  token1: Token;
}

// Интерфейс для свопа
export interface V3Swap {
  amount0: string;
  amount1: string;
  amountUSD: string;
  id: string;
  origin: string;
  recipient: string;
  sender: string;
  timestamp: string;
  token0: Token;
  token1: Token;
}

// Интерфейс для свопа
export interface V2Swap {
  id: string;
  timestamp: string;
  from: string;
  pair: Pair;
  amount0In: string;
  amount1In: string;
  amount0Out: string;
  amount1Out: string;
  amountUSD: string;
}

// Интерфейс для ответа, содержащего массив свопов
export interface V3SwapsResponse {
  swaps: V3Swap[];
}

// Интерфейс для ответа GraphQL-запроса
export interface V2SwapsResponse {
  swaps: V2Swap[];
}

export const graphQlV3Client = new GraphQLClient(GRAPH_URL_UNI_V3);
export const graphQlV2Client = new GraphQLClient(GRAPH_URL_UNI_V2);

export const getWalletV3Swaps = gql`
    query GetV3Swaps($origin: String!, $timestamp_gt: BigInt) {
        swaps(
            first: 10
            orderBy: timestamp
            orderDirection: desc
            where: { origin: $origin, timestamp_gt: $timestamp_gt}
        ) {
            id
            # timestamp of transaction
            timestamp
            # allow indexing by tokens
            token0 {
                id
                symbol
                decimals
            }
            # allow indexing by tokens
            token1 {
                id
                symbol
                decimals
            }
            # sender of the swap
            sender
            # recipient of the swap
            recipient
            # txn origin
            origin
            # delta of token0 swapped
            amount0
            # delta of token1 swapped
            amount1
            # derived info
            amountUSD
        }
    }
`;
export const getWalletv2Swaps = gql`
    query GetV3Swaps($from: String!, $timestamp_gt: BigInt) {
        swaps(
            first: 10
            orderBy: timestamp
            orderDirection: desc
            where: { from: $from, timestamp_gt: $timestamp_gt}
        ) {
            id
            timestamp
            from
            pair {
                token0 {
                    id
                    symbol
                    decimals
                }
                token1 {
                    id
                    symbol
                    decimals
                }
            }
            amount0In
            amount1In
            amount0Out
            amount1Out
            amountUSD
        }
    }
`;
