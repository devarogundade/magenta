<template>
    <section>
        <div class="app_width">
            <header>
                <RouterLink to="/">
                    <div class="logo">
                        <img src="/images/logo.png" alt="logo">
                    </div>
                </RouterLink>

                <div class="tabs">
                    <RouterLink to="/">
                        <button :class="$route.name == 'swap' ? 'tab active' : 'tab'">Swap</button>
                    </RouterLink>
                    <RouterLink to="/limit-order">
                        <button :class="$route.name == 'limit-order' ? 'tab active' : 'tab'">Limit Order</button>
                    </RouterLink>
                    <RouterLink to="/dca">
                        <button :class="$route.name == 'dca' ? 'tab active' : 'tab'">DCA</button>
                    </RouterLink>
                    <RouterLink to="/stream">
                        <button :class="$route.name == 'stream' ? 'tab active' : 'tab'">Stream</button>
                    </RouterLink>
                </div>

                <div class="action">
                    <div class="balance">
                        {{ Converter.toMoney(timelyStore.balance) }} $TML
                        <div style="color: #d20808;" class="balance_request"
                            v-if="timelyStore.requestAllowance > 0 && timelyStore.balance < timelyStore.requestAllowance">
                            Insufficient: {{ Converter.toMoney(timelyStore.requestAllowance) }} $TML
                        </div>
                        <div style="color: teal;" class="balance_request" v-else-if="timelyStore.requestAllowance > 0">
                            Paying {{ Converter.toMoney(timelyStore.requestAllowance) }} $TML
                        </div>
                    </div>
                    <button class="explorer" @click="modal.open()"> {{ addressStore.address ?
                        `${Converter.fineHash(addressStore.address, 4)}`
                        : 'Connect Wallet'
                        }}</button>
                </div>
            </header>
        </div>
    </section>
</template>

<script setup lang="ts">
import { config, chains } from '../scripts/config';
import Converter from '@/scripts/converter';
import { onMounted, ref } from 'vue';
import { useAddressStore } from '@/stores/address';
import { useTimelyStore } from '@/stores/timely';

import { createWeb3Modal } from '@web3modal/wagmi/vue';
import { useWeb3Modal } from '@web3modal/wagmi/vue';
import { watchAccount } from '@wagmi/core';

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

const initialize = async () => {

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

<style scoped>
section {
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(8px);
    background: rgba(0, 0, 0, 0.2);
}

header {
    width: 100%;
    height: 100px;
    display: grid;
    grid-template-columns: 2fr 2fr 2fr;
    align-items: center;
}

.logo {
    display: flex;
    align-items: center;
    gap: 10px;
    user-select: none;
}

.logo img {
    height: 50px;
}

.logo svg {
    width: 50px;
    width: 45px;
}

.tabs {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.tab {
    text-wrap: nowrap;
    padding: 0 20px;
    font-size: 16px;
    height: 24px;
    font-weight: 500;
    border-radius: 4px;
    color: var(--tx-dimmed);
    display: flex;
    align-items: center;
    gap: 8px;
}

.tab svg {
    margin-top: 2px;
}

.tab.active {
    color: var(--tx-normal);
}

.action {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
}

.balance {
    padding: 6px 10px;
    border-radius: 12px;
    background: var(--background-light);
    color: var(--tx-normal);
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
    border: 1px solid var(--background-lighter);
    position: relative;
}

.balance_request {
    padding: 6px 10px;
    font-size: 14px;
    top: 40px;
    right: 0;
    border-radius: 12px;
    z-index: 1;
    position: absolute;
    background: var(--background-light);
    border: 1px solid var(--background-lighter);
    text-wrap: nowrap;
}

.action button {
    height: 45px;
    min-width: 160px;
    border-radius: 16px;
    background: var(--primary);
    font-size: 18px;
    font-weight: 500;
    padding: 0 16px;
    color: var(--tx-normal);
}

.faucet {
    font-size: 18px;
}
</style>