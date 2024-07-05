import axios from "axios";
import type { DCAOrderCreated, LimitOrderCreated, SwapOrderCreated } from "@/types";

const Endpoint: string = 'https://api.goldsky.com/api/public/project_cly656z1bbfza0114c0f02goy/subgraphs/magenta/2.0/g';

export async function getSwapOrders(address: `0x${string}`, first = 15): Promise<SwapOrderCreated[]> {
    try {
        const response = await axios.post(Endpoint, {
            query: `
            {
                swapOrderCreateds(where: {actor: "${address}"}, orderBy: blockTimestamp, orderDirection: desc, first: ${first}) {
                    id
                    actor
                    identifier
                    tokenIn
                    tokenOut
                    amountIn
                    amountOutMin
                    executed
                    cancelled
                    deadline
                    startDelay
                    blockNumber
                    transactionHash
                    blockTimestamp
                }
            }
            `
        });

        return response.data.data.swapOrderCreateds as SwapOrderCreated[];
    } catch (error) {
        console.log(error);
        return [];
    }
}

export async function getLimitOrders(address: `0x${string}`, first = 15): Promise<LimitOrderCreated[]> {
    try {
        const response = await axios.post(Endpoint, {
            query: `
            {
                limitOrderCreateds(where: {actor: "${address}"}, orderBy: blockTimestamp, orderDirection: desc, first: ${first}) {
                    id
                    actor
                    identifier
                    tokenIn
                    tokenOut
                    amountIn
                    amountOutMin
                    executed
                    cancelled
                    deadline
                    startDelay
                    blockNumber
                    transactionHash
                    blockTimestamp
                }
            }
            `
        });

        return response.data.data.limitOrderCreateds as LimitOrderCreated[];
    } catch (error) {
        console.log(error);
        return [];
    }
}

export async function getDCAOrders(address: `0x${string}`, first = 15): Promise<DCAOrderCreated[]> {
    try {
        const response = await axios.post(Endpoint, {
            query: `
            {
                dcaorderCreateds(where: {actor: "${address}"}, orderBy: blockTimestamp, orderDirection: desc, first: ${first}) {
                    id
                    actor
                    identifier
                    tokenIn
                    tokenOut
                    amountIn
                    numOfOrders
                    amountInBalance
                    iMinutes
                    iHours
                    executed
                    cancelled
                    startDelay
                    blockNumber
                    transactionHash
                    blockTimestamp
                }
            }
            `
        });

        return response.data.data.dcaorderCreateds as DCAOrderCreated[];
    } catch (error) {
        console.log(error);
        return [];
    }
}

export async function getTransferOrders(address: `0x${string}`, first = 15): Promise<DCAOrderCreated[]> {
    try {
        const response = await axios.post(Endpoint, {
            query: `
            {
                transferOrderCreateds(where: {actor: "${address}"}, orderBy: blockTimestamp, orderDirection: desc, first: ${first}) {
                    id
                    actor
                    identifier
                    tokenIn
                    amountIn
                    numOfOrders
                    iMinutes
                    iHours
                    executed
                    cancelled
                    startDelay
                    blockNumber
                    transactionHash
                    blockTimestamp
                }
            }
            `
        });

        return response.data.data.transferOrderCreateds as DCAOrderCreated[];
    } catch (error) {
        console.log(error);
        return [];
    }
}