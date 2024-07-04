import { fraxtal } from '@wagmi/core/chains';
import { walletConnect } from '@wagmi/connectors';
import { defaultWagmiConfig } from '@web3modal/wagmi';

const metadata = {
    name: 'Magenta',
    description: 'Magenta',
    url: 'https://magenta.timelyblock.xyz',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
};

export const chains = [fraxtal];

export const config = defaultWagmiConfig({
    // @ts-ignore
    chains, projectId: import.meta.env.VITE_PROJECT_ID, metadata, connectors: [walletConnect({
        projectId: import.meta.env.VITE_PROJECT_ID
    })]
});