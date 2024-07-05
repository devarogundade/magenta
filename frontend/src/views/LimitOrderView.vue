<script setup lang="ts">
import ArrowRightIcon from '@/components/icons/ArrowRightIcon.vue';
import InterChangeIcon from '@/components/icons/InterChangeIcon.vue';
import LoadingBox from '../components/LoadingBox.vue';
import FailedfulIcon from '../components/icons/FailedfulIcon.vue';
import SuccessfulIcon from '../components/icons/SuccessfulIcon.vue';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon.vue';
import OutIcon from '@/components/icons/OutIcon.vue';

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import { config, chains } from '../scripts/config';
import { onMounted, ref, watch } from 'vue';
import { useAddressStore } from '@/stores/address';
import { useTimelyStore } from '@/stores/timely';
import { notify } from '@/reactives/notify';
import { getAmountOut, createLimitOrder, cancelLimitOrder, magentaId, timelyFee, timelyTokenId } from '@/scripts/magenta';
import { getTokenBalance, approve, getAllowance } from '@/scripts/erc20';
import Converter from '@/scripts/converter';
import { tokens, getToken, getTokensExcept } from '@/scripts/tokens';
import { createWeb3Modal } from '@web3modal/wagmi/vue';
import { useWeb3Modal } from '@web3modal/wagmi/vue';
import { watchAccount } from '@wagmi/core';
import type { LimitOrderCreated } from "@/types";
import { getLimitOrders } from "@/scripts/graph";
import gsap from 'gsap';
import { format } from 'timeago.js';
import { fineHash, fineId } from '@/scripts/utils';

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
const swapping = ref<boolean>(false);
const approving = ref<boolean>(false);
const swapAction = ref<boolean>(true);
const limitOrders = ref<LimitOrderCreated[]>([]);
const loading = ref<Boolean | undefined>(undefined);
const total = ref<number>(0);

const limitOrder = ref({
  tokenIn: tokens[0].tokenId,
  tokenOut: tokens[1].tokenId,
  amountIn: undefined as number | undefined,
  amountOutMin: undefined as number | undefined,
  approveIn: 0,
  balanceIn: undefined as number | undefined,
  balanceOut: undefined as number | undefined,
  startDate: new Date() as Date | null,
  expireDate: new Date(Date.now() + (72 * 60 * 60 * 1000)) as Date | null,
  openFrom: false,
  openTo: false
});

const updateAmountOut = async () => {
  if (!limitOrder.value.amountIn) {
    limitOrder.value.amountOutMin = undefined;
    return;
  };

  const amountOutMin = await getAmountOut(
    limitOrder.value.tokenIn,
    limitOrder.value.tokenOut,
    Converter.toWei(limitOrder.value.amountIn!)
  );

  limitOrder.value.amountOutMin = Converter.fromWei(amountOutMin);
};

const updateApprovals = async () => {
  if (addressStore.address) {
    const allowance = await getAllowance(
      limitOrder.value.tokenIn,
      addressStore.address,
      magentaId
    );

    limitOrder.value.approveIn = Converter.fromWei(allowance);

    const timelyAllowance = await getAllowance(
      timelyTokenId,
      addressStore.address,
      magentaId
    );

    timelyStore.setAllowance(Converter.fromWei(timelyAllowance));
  }
};

const updateBalances = async () => {
  if (addressStore.address) {
    const balanceIn = await getTokenBalance(
      limitOrder.value.tokenIn,
      addressStore.address
    );

    const balanceOut = await getTokenBalance(
      limitOrder.value.tokenOut,
      addressStore.address
    );

    limitOrder.value.balanceIn = Converter.fromWei(balanceIn);
    limitOrder.value.balanceOut = Converter.fromWei(balanceOut);

    const timelyBalance = await getTokenBalance(
      timelyTokenId,
      addressStore.address
    );

    timelyStore.setBalance(Converter.fromWei(timelyBalance));
  }
};

const initLimitOrder = async () => {
  if (!addressStore.address) {
    notify.push({
      title: 'Connect Wallet',
      description: 'Wallet connection is required.',
      category: 'error'
    });
    return;
  }
  if (!limitOrder.value.amountIn || limitOrder.value.amountIn == 0) {
    notify.push({
      title: 'Invalid amount in',
      description: 'Enter a valid amount to limitOrder.',
      category: 'error'
    });
    return;
  };

  if (!limitOrder.value.amountOutMin || limitOrder.value.amountOutMin == 0) {
    notify.push({
      title: 'Invalid amount out',
      description: 'Please wait for estimated amount out.',
      category: 'error'
    });
    return;
  };

  if (!limitOrder.value.expireDate) {
    notify.push({
      title: 'Invalid expire time',
      description: 'Enter a valid expires datetime.',
      category: 'error'
    });
    return;
  }

  if (limitOrder.value.amountIn > (limitOrder.value.balanceIn || 0)) {
    notify.push({
      title: 'Insufficient funds',
      description: 'Please carefully enter your actual balance.',
      category: 'error'
    });
    return;
  };

  if (swapping.value) {
    notify.push({
      title: 'Please wait',
      description: 'Swapping in progress.',
      category: 'error'
    });
    return;
  }

  swapping.value = true;

  if (!limitOrder.value.startDate) {
    limitOrder.value.startDate = new Date();
  }

  const delayMs: number = limitOrder.value.startDate.getTime() - Date.now();
  const delaySecs: number = delayMs > 30_000 ? (delayMs / 1000) : 0;

  const expiresMs: number = limitOrder.value.expireDate.getTime();
  const espireSecs: number = (expiresMs / 1000);

  if (delaySecs > 0) {
    timelyStore.setRequestAllowance(Converter.fromWei(timelyFee));
    if (timelyStore.balance < timelyStore.requestAllowance) {
      setTimeout(() => {
        timelyStore.setRequestAllowance(0);
      }, 3000);
      swapping.value = false;
      return;
    }

    if (timelyStore.allowance < Converter.fromWei(timelyFee)) {
      const approveHash = await approve(
        timelyTokenId,
        magentaId,
        timelyFee
      );

      if (!approveHash) {
        notify.push({
          title: 'Transaction failed',
          description: 'Try again later.',
          category: 'error'
        });
        swapping.value = false;
        return;
      }
    }
  }

  const txHash = await createLimitOrder(
    limitOrder.value.tokenIn,
    limitOrder.value.tokenOut,
    Converter.toWei(limitOrder.value.amountIn),
    Converter.toWei(limitOrder.value.amountOutMin),
    delaySecs > 0 ? Number(delaySecs.toFixed(0)) : 0,
    Number(espireSecs.toFixed(0))
  );

  if (txHash) {
    if (delaySecs == 0) {
      notify.push({
        title: 'Swap completed',
        description: 'Transaction was sent succesfully.',
        category: 'success',
        linkTitle: 'View Trx',
        linkUrl: `https://fraxscan.com/tx/${txHash}`
      });
    } else {
      notify.push({
        title: 'Swap scheduled',
        description: 'Transaction was sent succesfully.',
        category: 'success',
        linkTitle: 'View Trx',
        linkUrl: `https://fraxscan.com/tx/${txHash}`
      });
    }

    limitOrder.value.amountIn = undefined;
    limitOrder.value.amountOutMin = undefined;

    updateBalances();

    setTimeout(() => { updateLimitOrders(); }, 3000);
  } else {
    notify.push({
      title: 'Transaction failed',
      description: 'Try again later.',
      category: 'error'
    });
  }

  timelyStore.setRequestAllowance(0);
  swapping.value = false;
};

const initLimitOrderCancel = async (identifier: `0x${string}`) => {
  const txHash = await cancelLimitOrder(identifier);

  if (txHash) {
    notify.push({
      title: 'Limit order cancelled',
      description: 'Transaction was sent succesfully.',
      category: 'success',
      linkTitle: 'View Trx',
      linkUrl: `https://fraxscan.com/tx/${txHash}`
    });

    updateBalances();

    setTimeout(() => { updateLimitOrders(); }, 3000);
  } else {
    notify.push({
      title: 'Transaction failed',
      description: 'Try again later.',
      category: 'error'
    });
  }
};


const initApprove = async () => {
  if (!addressStore.address) {
    notify.push({
      title: 'Connect Wallet',
      description: 'Wallet connection is required.',
      category: 'error'
    });
    return;
  }

  if (!limitOrder.value.amountIn || limitOrder.value.amountIn == 0) {
    notify.push({
      title: 'Invalid amount in',
      description: 'Enter a valid amount to limitOrder.',
      category: 'error'
    });
    return;
  };

  if (approving.value) {
    notify.push({
      title: 'Please wait',
      description: 'Approval in progress.',
      category: 'error'
    });
    return;
  }

  approving.value = true;

  const txHash = await approve(
    limitOrder.value.tokenIn,
    magentaId,
    Converter.toWei(limitOrder.value.amountIn)
  );

  if (txHash) {
    notify.push({
      title: 'Approval completed',
      description: 'Transaction was sent succesfully.',
      category: 'success',
      linkTitle: 'View Trx',
      linkUrl: `https://fraxscan.com/tx/${txHash}`
    });

    updateApprovals();

    initLimitOrder();
  } else {
    notify.push({
      title: 'Transaction failed',
      description: 'Try again later.',
      category: 'error'
    });
  }

  approving.value = false;
};

const interchange = () => {
  let tempIn = limitOrder.value.tokenIn;
  limitOrder.value.tokenIn = limitOrder.value.tokenOut;
  limitOrder.value.tokenOut = tempIn;
};

const updateLimitOrders = async () => {
  if (addressStore.address) {
    loading.value = true;

    const data = await getLimitOrders(addressStore.address);
    limitOrders.value = data;
    total.value = data.length;

    loading.value = false;

    gsap.fromTo('#table_anim',
      { scale: .95, opacity: 0 },
      { scale: 1, opacity: 1, duration: .4, ease: 'sine.inOut', delay: 0.2 }
    );
  }
};


const initialize = async () => {
  updateBalances();
  updateLimitOrders();
};

watch(
  limitOrder,
  () => {
    updateAmountOut();
    updateBalances();
    updateApprovals();
  },
  {
    deep: true
  }
);

watch(
  swapAction,
  () => {
    updateLimitOrders();
  },
  {
    deep: true
  }
);

onMounted(() => {
  gsap.fromTo('#intro_anim',
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: .4, stagger: 0.1, ease: 'sine.inOut' }
  );

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
      <div class="swap_container">
        <div class="swap_wrapper" v-if="swapAction">
          <div class="swap" id="intro_anim">
            <div class="history" v-if="addressStore.address" @click="swapAction = false">
              <button>History</button>
            </div>
            <div class="amount">
              <p class="label">You're selling <span
                  @click="limitOrder.amountIn = Number(Converter.toMoney(limitOrder.balanceIn))">Bal: {{
                    Converter.toMoney(limitOrder.balanceIn) }}</span></p>
              <div class="input">
                <div class="tokens">
                  <div class="token" @click="limitOrder.openFrom = !limitOrder.openFrom">
                    <div class="token_info">
                      <img :src="getToken(limitOrder.tokenIn)?.image" alt="">
                      <p>{{ getToken(limitOrder.tokenIn)?.symbol }}</p>
                    </div>
                    <ArrowRightIcon style="rotate: 90deg;" />
                  </div>

                  <div class="dropdown_tokens" v-if="limitOrder.openFrom">
                    <div class="token" v-for="token, index in getTokensExcept(limitOrder.tokenIn)"
                      @click="limitOrder.tokenIn = token.tokenId; limitOrder.openFrom = !limitOrder.openFrom"
                      :key="index">
                      <div class="token_info">
                        <img :src="token.image" alt="">
                        <p>{{ token.symbol }}</p>
                      </div>
                      <ArrowRightIcon style="rotate: 90deg; visibility: hidden;" />
                    </div>
                  </div>
                </div>

                <input type="number" v-model="limitOrder.amountIn" placeholder="0.00">
              </div>
            </div>

            <div class="interchange">
              <div class="divider"></div>
              <button @click="interchange">
                <InterChangeIcon />
              </button>
            </div>

            <div class="amount">
              <p class="label">You want <span>Bal: {{ Converter.toMoney(limitOrder.balanceOut) }}</span></p>
              <div class="input">
                <div class="tokens">
                  <div class="token" @click="limitOrder.openTo = !limitOrder.openTo">
                    <div class="token_info">
                      <img :src="getToken(limitOrder.tokenOut)?.image" alt="">
                      <p>{{ getToken(limitOrder.tokenOut)?.symbol }}</p>
                    </div>
                    <ArrowRightIcon style="rotate: 90deg;" />
                  </div>

                  <div class="dropdown_tokens" v-if="limitOrder.openTo">
                    <div class="token" v-for="token, index in getTokensExcept(limitOrder.tokenOut)" :key="index"
                      @click="limitOrder.tokenOut = token.tokenId; limitOrder.openTo = !limitOrder.openTo">
                      <div class="token_info">
                        <img :src="token.image" alt="">
                        <p>{{ token.symbol }}</p>
                      </div>
                      <ArrowRightIcon style="rotate: 90deg; visibility: hidden;" />
                    </div>
                  </div>
                </div>

                <input type="number"
                  :value="limitOrder.amountOutMin ? Converter.toMoney(limitOrder.amountOutMin, null, false) : limitOrder.amountOutMin"
                  placeholder="0.00">
              </div>
            </div>

            <div class="add_delay">
              <p>Schedule</p>
              <VueDatePicker v-model="limitOrder.startDate"></VueDatePicker>
            </div>

            <div class="add_delay">
              <p>Expires in</p>
              <VueDatePicker v-model="limitOrder.expireDate"></VueDatePicker>
            </div>

            <div v-if="addressStore.address && (limitOrder.approveIn || 0) >= Number(limitOrder.amountIn)"
              class="action">
              <button @click="initLimitOrder">{{ swapping ? 'Processing..' : 'Place order' }}</button>
            </div>

            <div v-else-if="addressStore.address && (limitOrder.approveIn || 0) < Number(limitOrder.amountIn)"
              class="action">
              <button @click="initApprove">{{ approving ? 'Approving..' : 'Approve ' +
                getToken(limitOrder.tokenIn)?.symbol
                }}</button>
            </div>

            <div v-else-if="!addressStore.address" @click="modal.open()" class="action">
              <button>Connect Wallet</button>
            </div>

            <div v-else class="action">
              <button style="opacity: 0.5; cursor: not-allowed;">Place order</button>
            </div>
          </div>
        </div>
      </div>

      <LoadingBox v-show="loading && !swapAction" id="intro_anim" />

      <div class="explore" v-show="!loading && !swapAction">
        <div class="explore_stat">
          <div class="explore_stat_title">
            <p id="intro_anim">
              <ArrowLeftIcon @click="swapAction = true" /> Limit orders: <span>{{ total.valueOf() }}</span>
            </p>
          </div>
        </div>

        <div class="explore_table" id="table_anim">
          <table>
            <div class="thead">
              <thead>
                <tr>
                  <td>Identifier</td>
                  <td>Status</td>
                  <td>Swap pair</td>
                  <td>Timestamp</td>
                  <td>Hash</td>
                </tr>
              </thead>
            </div>
            <div class="tbody" v-for="order, index in limitOrders" :key="index">
              <tbody>
                <tr>
                  <td>
                    <div class="payload_id">
                      <a target="_blank" :href="`https://timelyblock.xyz/explorer/${order.identifier}`">
                        <p>{{ fineId(order.id) }}</p>
                        <OutIcon />
                      </a>
                    </div>
                  </td>
                  <td>
                    <div class="payload_status" v-if="order.executed">
                      <SuccessfulIcon />
                      <p>Executed</p>
                    </div>
                    <div class="payload_status" v-else-if="order.cancelled">
                      <FailedfulIcon />
                      <p>Cancelled</p>
                    </div>
                    <div class="payload_status" v-else>
                      <SuccessfulIcon />
                      <a>
                        <p>Placed</p>
                        <button @click="initLimitOrderCancel(order.identifier)">Cancel</button>
                      </a>
                    </div>
                  </td>
                  <td>
                    <div class="payload_hash">
                      <a>
                        <div class="stack">
                          <div class="images">
                            <img :src="getToken(order.tokenIn)?.image" alt="">
                            <img :src="getToken(order.tokenOut)?.image" alt="">
                          </div>
                          <p>{{ Converter.toMoney(Converter.fromWei(order.amountIn)) }} {{
                            getToken(order.tokenIn)?.symbol
                          }} to {{
                              getToken(order.tokenOut)?.symbol
                            }}</p>
                        </div>
                      </a>
                    </div>
                  </td>
                  <td>
                    <div class="payload_hash">
                      <a>
                        <p>{{ format(order.blockTimestamp * 1000) }}</p>
                      </a>
                    </div>
                  </td>
                  <td>
                    <div class="payload_hash">
                      <a target="_blank" :href="`https://fraxscan.com/tx/${order.transactionHash}`">
                        <p>{{ fineHash(order.transactionHash) }}</p>
                        <OutIcon />
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </div>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.swap_container {
  padding-top: 50px;
}

.swap_wrapper {
  display: flex;
  justify-content: center;
}

.swap {
  width: 420px;
  max-width: 100%;
  padding: 20px;
  gap: 20px;
  background: var(--background-light);
  border: 1px solid var(--background-lighter);
  border-radius: 16px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.1) 0px 3px 6px;
}

.history {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
}

.history button {
  border: 1px solid var(--primary);
  background: var(--background-lighter);
  color: var(--tx-normal);
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 10px;
}

.amount .input {
  background: var(--background-lighter);
  height: 60px;
  border-radius: 16px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.amount .label {
  color: var(--tx-dimmed);
  margin-bottom: 10px;
  font-weight: 500;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.amount .label span {
  font-size: 14px;
  cursor: pointer;
}

.amount .tokens {
  padding: 0 10px;
  background: var(--background-light);
  border-radius: 10px;
  position: relative;
}

.amount .dropdown_tokens {
  position: absolute;
  top: 45px;
  left: 0;
  background: var(--background);
  border-radius: 10px;
  padding: 0 10px;
  z-index: 1;
  box-shadow: rgba(75, 75, 75, 0.16) 0px 3px 3px, rgba(73, 73, 73, 0.1) 0px 3px 3px;
}

.amount .token {
  display: flex;
  align-items: center;
  height: 40px;
  gap: 6px;
  color: var(--tx-normal);
  font-weight: 500;
  font-size: 14px;
  user-select: none;
  cursor: pointer;
}

.amount .token_info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.amount .token_info img {
  width: 18px;
  height: 18px;
  border-radius: 10px;
}

.amount input {
  font-size: 24px;
  text-align: right;
  background: none;
  border: none;
  color: var(--tx-normal);
  font-weight: 500;
  outline: none;
  max-width: 200px;
}

.amount input::placeholder {
  color: var(--tx-dimmed);
}

.interchange {
  height: 80px;
  position: relative;
  width: 100%;
}

.interchange .divider {
  position: absolute;
  top: 50%;
  left: 50%;
  background: var(--background);
  height: 1px;
  width: 100%;
  transform: translate(-50%, -50%);
}

.interchange button {
  position: absolute;
  top: 50%;
  left: 50%;
  background: var(--background);
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  border-radius: 12px;
}

.add_delay {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  color: var(--tx-dimmed);
  font-size: 14px;
  width: 100%;
  cursor: pointer;
}

.action {
  margin-top: 30px;
}

.action button {
  height: 55px;
  width: 100%;
  border-radius: 16px;
  background: var(--primary);
  font-size: 18px;
  font-weight: 500;
  padding: 0 16px;
  color: var(--tx-normal);
}
</style>