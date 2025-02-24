import { gql, GraphQLClient } from "graphql-request";
import "dotenv/config";
import { GRAPH_URL_UNI_V3, GRAPH_URL_UNI_V2 } from "../config.js";
export const graphQlV3Client = new GraphQLClient(GRAPH_URL_UNI_V3);
export const graphQlV2Client = new GraphQLClient(GRAPH_URL_UNI_V2);
export const getWalletV3Swaps = gql `
    query GetV3Swaps($origin: String!, $timestamp_gt: BigInt) {
        swaps(
            first: 10
            orderBy: timestamp
            orderDirection: desc
            where: { origin: $origin, timestamp_gt: $timestamp_gt}
        ) {
            id
            timestamp
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
            sender
            recipient
            origin
            amount0
            amount1
            amountUSD
        }
    }
`;
export const getWalletv2Swaps = gql `
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
