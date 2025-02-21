import { gql, GraphQLClient } from "graphql-request";
import "dotenv/config";
import { GRAPH_URL_UNI_V3, CHAIN_ID, GRAPH_URL_UNI_V2 } from "../config";

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
