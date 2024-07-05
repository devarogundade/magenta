export type SwapOrderCreated = {
    id: `0x${string}`;
    actor: `0x${string}`;
    identifier: `0x${string}`;
    tokenIn: `0x${string}`;
    tokenOut: `0x${string}`;
    amountIn: string;
    amountOutMin: string;
    executed: boolean;
    cancelled: boolean;
    deadline: number;
    startDelay: number;
    blockNumber: number;
    transactionHash: `0x${string}`;
    blockTimestamp: number;
};

export type LimitOrderCreated = {
    id: `0x${string}`;
    actor: `0x${string}`;
    identifier: `0x${string}`;
    tokenIn: `0x${string}`;
    tokenOut: `0x${string}`;
    amountIn: string;
    amountOutMin: string;
    executed: boolean;
    cancelled: boolean;
    deadline: number;
    startDelay: number;
    blockNumber: number;
    transactionHash: `0x${string}`;
    blockTimestamp: number;
};

export type DCAOrderCreated = {
    id: `0x${string}`;
    actor: `0x${string}`;
    identifier: `0x${string}`;
    tokenIn: `0x${string}`;
    tokenOut: `0x${string}`;
    amountIn: string;
    numOfOrders: number;
    amountInBalance: string;
    iMinutes: Minutes;
    iHours: Hours;
    executed: boolean;
    cancelled: boolean;
    startDelay: number;
    blockNumber: number;
    transactionHash: `0x${string}`;
    blockTimestamp: number;
};

export type TransferOrderCreated = {
    id: `0x${string}`;
    actor: `0x${string}`;
    identifier: `0x${string}`;
    receiver: `0x${string}`;
    tokenIn: `0x${string}`;
    amountIn: string;
    numOfOrders: number;
    iMinutes: Minutes;
    iHours: Hours;
    executed: boolean;
    cancelled: boolean;
    startDelay: number;
    blockNumber: number;
    transactionHash: `0x${string}`;
    blockTimestamp: number;
};

export enum TimePayloadEventStatus {
    SUCCESSFUL,
    FAILED
}

export enum Minutes {
    ONE_MINUTES,
    TWO_MINUTES,
    FIVE_MINUTES,
    TEN_MINUTES,
    FIFTEEN_MINUTES,
    TWENTY_MINUTES,
    TWENTY_FIVE_MINUTES,
    THIRTY_MINUTES,
    THIRTY_FIVE_MINUTES,
    FORTY_MINUTES,
    FORTY_FIVE_MINUTES,
    FIFTY_MINUTES,
    FIFTY_FIVE_MINUTES,
    SIXTY_MINUTES,
    INGORE
}

export enum Hours {
    ZERO_HOUR,
    ONE_HOUR,
    TWO_HOUR,
    THREE_HOUR,
    FOUR_HOUR,
    FIVE_HOUR,
    SIX_HOUR,
    SEVEN_HOUR,
    EIGHT_HOUR,
    NINE_HOUR,
    TEN_HOUR,
    ELEVEN_HOUR,
    TWELVE_HOUR,
    THIRTEEN_HOUR,
    FOURTEEN_HOUR,
    FIFTEEN_HOUR,
    SIXTEEN_HOUR,
    SEVENTEEN_HOUR,
    EIGHTEEN_HOUR,
    NINETEEN_HOUR,
    TWENTY_HOUR,
    TWENTY_ONE_HOUR,
    TWENTY_TWO_HOUR,
    TWENTY_THREE_HOUR,
    INGORE
}

export type Token = {
    tokenId: `0x${string}`;
    name: string;
    symbol: string;
    image: string;
};

export interface Notification {
    title: string;
    description: string;
    category: string;
    linkTitle?: string;
    linkUrl?: string;
}

export type ReadableDate = {
    month: string;
    day: number;
    hour: number;
    min: number;
    year: number;
};
