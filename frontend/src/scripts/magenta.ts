import { config } from './config';
import { abi } from '../abis/magenta';
import { waitForTransactionReceipt, writeContract, readContract } from '@wagmi/core';
import type { Hours, Minutes } from '@/types';
import Converter from './converter';

export const DefaultDDL: number = 5 * 60;

export const timelyTokenId: `0x${string}` = '0x1A7ACB0B1F382e6497DD010465CDa3E714d3709b';
export const magentaId: `0x${string}` = '0x3199C8dAADac1285167066c2C917E9D8B11366bc';

export const timelyFee: string = Converter.toWei('0.01');
export const magentaFee: string = Converter.toWei('0.00003');

export async function swapTokens(
    tokenIn: `0x${string}`,
    tokenOut: `0x${string}`,
    amountIn: string,
    amountOutMin: string,
    startDelay: number,
    deadline: number
): Promise<`0x${string}` | null> {
    try {
        const result = await writeContract(config, {
            abi: abi,
            address: magentaId,
            functionName: 'swapTokens',
            args: [tokenIn, tokenOut, amountIn, amountOutMin, startDelay, deadline],
            value: startDelay > 0 ? BigInt(magentaFee) : BigInt(0)
        });

        const receipt = await waitForTransactionReceipt(config, { hash: result });

        return receipt.transactionHash;
    } catch (error) {
        console.log(error);

        return null;
    }
}

export async function cancelSwapOrder(
    identifier: `0x${string}`
): Promise<`0x${string}` | null> {
    try {
        const result = await writeContract(config, {
            abi: abi,
            address: magentaId,
            functionName: 'cancelSwapOrder',
            args: [identifier]
        });

        const receipt = await waitForTransactionReceipt(config, { hash: result });

        return receipt.transactionHash;
    } catch (error) {
        console.log(error);

        return null;
    }
}

export async function createLimitOrder(
    tokenIn: `0x${string}`,
    tokenOut: `0x${string}`,
    amountIn: string,
    amountOutMin: string,
    startDelay: number,
    deadline: number
): Promise<`0x${string}` | null> {
    try {
        const result = await writeContract(config, {
            abi: abi,
            address: magentaId,
            functionName: 'createLimitOrder',
            args: [tokenIn, tokenOut, amountIn, amountOutMin, startDelay, deadline],
            value: BigInt(magentaFee)
        });

        const receipt = await waitForTransactionReceipt(config, { hash: result });

        console.log(receipt.logs);

        return receipt.transactionHash;
    } catch (error) {
        console.log(error);

        return null;
    }
}

export async function cancelLimitOrder(
    identifier: `0x${string}`
): Promise<`0x${string}` | null> {
    try {
        const result = await writeContract(config, {
            abi: abi,
            address: magentaId,
            functionName: 'cancelLimitOrder',
            args: [identifier]
        });

        const receipt = await waitForTransactionReceipt(config, { hash: result });

        return receipt.transactionHash;
    } catch (error) {
        console.log(error);

        return null;
    }
}

export async function createDCAOrder(
    tokenIn: `0x${string}`,
    tokenOut: `0x${string}`,
    amountIn: string,
    startDelay: number,
    numOfOrders: number,
    iMinutes: Minutes,
    iHours: Hours
): Promise<`0x${string}` | null> {
    try {
        const result = await writeContract(config, {
            abi: abi,
            address: magentaId,
            functionName: 'createDCAOrder',
            args: [tokenIn, tokenOut, amountIn, startDelay, numOfOrders, iMinutes, iHours],
            value: BigInt(magentaFee)
        });

        const receipt = await waitForTransactionReceipt(config, { hash: result });

        console.log(receipt.logs);

        return receipt.transactionHash;
    } catch (error) {
        console.log(error);

        return null;
    }
}

export async function cancelDCAOrder(
    identifier: `0x${string}`
): Promise<`0x${string}` | null> {
    try {
        const result = await writeContract(config, {
            abi: abi,
            address: magentaId,
            functionName: 'cancelDCAOrder',
            args: [identifier]
        });

        const receipt = await waitForTransactionReceipt(config, { hash: result });

        return receipt.transactionHash;
    } catch (error) {
        console.log(error);

        return null;
    }
}

export async function createTransferOrder(
    receiver: `0x${string}`,
    tokenIn: `0x${string}`,
    amountIn: string,
    startDelay: number,
    numOfOrders: number,
    iMinutes: Minutes,
    iHours: Hours
): Promise<`0x${string}` | null> {
    try {
        const result = await writeContract(config, {
            abi: abi,
            address: magentaId,
            functionName: 'createTransferOrder',
            args: [receiver, tokenIn, amountIn, startDelay, numOfOrders, iMinutes, iHours],
            value: BigInt(magentaFee)
        });

        const receipt = await waitForTransactionReceipt(config, { hash: result });

        console.log(receipt.logs);

        return receipt.transactionHash;
    } catch (error) {
        console.log(error);

        return null;
    }
}

export async function cancelTransferOrder(
    identifier: `0x${string}`
): Promise<`0x${string}` | null> {
    try {
        const result = await writeContract(config, {
            abi: abi,
            address: magentaId,
            functionName: 'cancelTranferOrder',
            args: [identifier]
        });

        const receipt = await waitForTransactionReceipt(config, { hash: result });

        return receipt.transactionHash;
    } catch (error) {
        console.log(error);

        return null;
    }
}


export async function getAmountOut(
    tokenIn: `0x${string}`,
    tokenOut: `0x${string}`,
    amountIn: string,
): Promise<bigint> {
    try {
        const amountOut = await readContract(config, {
            abi: abi,
            address: magentaId,
            functionName: 'getAmountOut',
            args: [tokenIn, tokenOut, amountIn, 0]
        });

        return amountOut as bigint;
    } catch (error) {
        console.log(error);
        return BigInt(0);
    }
}   