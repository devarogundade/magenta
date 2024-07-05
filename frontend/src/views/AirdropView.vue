<script setup lang="ts">
import { config, chains } from '../scripts/config';
import { onMounted, ref, watch } from 'vue';
import { useAddressStore } from '@/stores/address';
import { createWeb3Modal } from '@web3modal/wagmi/vue';
import { useWeb3Modal } from '@web3modal/wagmi/vue';
import { getTokenBalance } from '@/scripts/erc20';
import { watchAccount } from '@wagmi/core';
import { timelyTokenId, claimTokens } from '@/scripts/magenta';
import { useTimelyStore } from '@/stores/timely';
import Converter from '@/scripts/converter';
import { notify } from '@/reactives/notify';

createWeb3Modal({
    wagmiConfig: config,
    projectId: import.meta.env.VITE_PROJECT_ID,
    // @ts-ignore
    chains: chains,
    enableAnalytics: true
});

const modal = useWeb3Modal();
const addressStore = useAddressStore();
const timelyStore = useTimelyStore();
const claiming = ref<boolean>(false);
const hasTwitterFollow = ref<boolean>(false);

const updateBalances = async () => {
    if (addressStore.address) {
        const timelyBalance = await getTokenBalance(
            timelyTokenId,
            addressStore.address
        );

        timelyStore.setBalance(Converter.fromWei(timelyBalance));
    }
};

const initClaimTokens = async () => {
    if (!addressStore.address) {
        notify.push({
            title: 'Connect Wallet',
            description: 'Wallet connection is required.',
            category: 'error'
        });
        return;
    }

    if (!hasTwitterFollow.value) {
        notify.push({
            title: 'Follow Timely on X.',
            description: 'You must follow the X account to claim tokens.',
            category: 'error'
        });
        return;
    }

    claiming.value = true;

    const txHash = await claimTokens();

    if (txHash) {
        notify.push({
            title: 'Claimed tokens',
            description: 'Transaction was sent succesfully.',
            category: 'success',
            linkTitle: 'View Trx',
            linkUrl: `https://fraxscan.com/tx/${txHash}`
        });
        updateBalances();
    } else {
        notify.push({
            title: 'Transaction failed',
            description: 'Try again later.',
            category: 'error'
        });
    }

    claiming.value = false;
};

const initialize = async () => {
    updateBalances();
};

onMounted(() => {
    watchAccount(config, {
        onChange(account: any) {
            addressStore.setAddress(account.address);
            initialize();
        },
    });

    initialize();
});
</script>

<template>
    <section>
        <div class="app_width">
            <div class="airdrop_container">
                <a href="https://timelyblock.xyz" target="_blank" rel="noopener noreferrer">
                    <div class="airdrop">
                        <img src="/images/airdrop.png" alt="">
                        <p>Claim free $TML tokens sponsored by Timely.</p>
                    </div>
                </a>

                <div class="follow">
                    <input type="checkbox" name="" id="" v-model="hasTwitterFollow">
                    <p>Follow them on <a target="_blank" href="https://x.com/timelyblock">X (formerly Twitter)</a></p>
                </div>

                <div class="claim">
                    <div v-if="addressStore.address" class="action">
                        <button @click="initClaimTokens">{{ claiming ? 'Processing..' : 'Claim tokens' }}</button>
                    </div>

                    <div v-else @click="modal.open()" class="action">
                        <button>Connect Wallet</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.airdrop_container {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    flex-direction: column;
    padding-top: 50px;
}

.airdrop {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    text-align: center;
    flex-direction: column;
    max-width: 100%;
}

.airdrop img {
    border-radius: 16px;
    height: 350px;
    max-width: 100%;
}

.airdrop p {
    font-size: 24px;
    color: var(--tx-normal);
}

.follow {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--tx-normal);
    font-size: 14px;
    margin-top: 30px;
}

.follow a {
    color: var(--primary);
}

.action {
    margin-top: 20px;
}

.action button {
    height: 50px;
    width: 100%;
    border-radius: 16px;
    background: var(--primary);
    font-size: 18px;
    font-weight: 500;
    padding: 0 26px;
    color: var(--tx-normal);
}
</style>