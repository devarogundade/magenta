import type { Token } from '@/types';

export const tokens: Token[] = [
    {
        tokenId: '0xFC00000000000000000000000000000000000006',
        name: 'Wrapped Frax Ether',
        symbol: 'wfrxETH',
        image: '/images/wfrxeth.png'
    },
    {
        tokenId: '0xfc00000000000000000000000000000000000002',
        name: 'FXS',
        symbol: 'FXS',
        image: '/images/fxs.png'
    },
    {
        tokenId: '0xc84c0f36e42d0100c6ff5e1d04e2978f0a5b63cf',
        name: 'RWA',
        symbol: 'RWA',
        image: '/images/rwa.png'
    }
];

export function getTokens(): Token[] {
    return tokens;
}

export function getTokensExcept(tokenId: `0x${string}`): Token[] {
    return tokens.filter((token) => token.tokenId.toLowerCase() != tokenId.toLowerCase());
}

export function getToken(tokenId: `0x${string}`): Token | undefined {
    return tokens.find((token) => token.tokenId.toLowerCase() == tokenId.toLowerCase());
}
