<script setup lang="ts">
import ArrowRightIcon from '@/components/icons/ArrowRightIcon.vue';
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
import { createTransferOrder, magentaId, timelyFee, timelyTokenId, cancelTransferOrder } from '@/scripts/magenta';
import { getTokenBalance, approve, getAllowance } from '@/scripts/erc20';
import Converter from '@/scripts/converter';
import { tokens, getToken, getTokensExcept } from '@/scripts/tokens';
import { createWeb3Modal } from '@web3modal/wagmi/vue';
import { useWeb3Modal } from '@web3modal/wagmi/vue';
import { watchAccount } from '@wagmi/core';
import { Minutes, Hours } from '@/types';
import type { TransferOrderCreated } from "@/types";
import { getTransferOrders } from "@/scripts/graph";
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
const transferOrders = ref<TransferOrderCreated[]>([]);
const loading = ref<Boolean | undefined>(undefined);
const total = ref<number>(0);

const transferOrder = ref({
  tokenIn: tokens[0].tokenId,
  receiver: undefined as `0x${string}` | undefined,
  amountIn: undefined as number | undefined,
  approveIn: 0,
  numOfOrders: 2,
  iMinutes: Minutes.TWO_MINUTES,
  iHours: Hours.INGORE,
  balanceIn: undefined as number | undefined,
  startDate: new Date() as Date | null,
  openFrom: false,
  openTo: false
});

const updateApprovals = async () => {
  if (addressStore.address) {
    const allowance = await getAllowance(
      transferOrder.value.tokenIn,
      addressStore.address,
      magentaId
    );

    transferOrder.value.approveIn = Converter.fromWei(allowance);

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
      transferOrder.value.tokenIn,
      addressStore.address
    );

    transferOrder.value.balanceIn = Converter.fromWei(balanceIn);

    const timelyBalance = await getTokenBalance(
      timelyTokenId,
      addressStore.address
    );

    timelyStore.setBalance(Converter.fromWei(timelyBalance));
  }
};

const initTransferCancel = async (identifier: `0x${string}`) => {
  const txHash = await cancelTransferOrder(identifier);

  if (txHash) {
    notify.push({
      title: 'Stream cancelled',
      description: 'Transaction was sent succesfully.',
      category: 'success',
      linkTitle: 'View Trx',
      linkUrl: `https://fraxscan.com/tx/${txHash}`
    });

    updateBalances();

    setTimeout(() => { updateTransferOrders(); }, 3000);
  } else {
    notify.push({
      title: 'Transaction failed',
      description: 'Try again later.',
      category: 'error'
    });
  }
};

const initTransferOrder = async () => {
  if (!addressStore.address) {
    notify.push({
      title: 'Connect Wallet',
      description: 'Wallet connection is required.',
      category: 'error'
    });
    return;
  }

  if (!transferOrder.value.receiver) {
    notify.push({
      title: 'Invalid receiver',
      description: 'Enter a valid EVM address.',
      category: 'error'
    });
    return;
  }

  if (!transferOrder.value.amountIn || transferOrder.value.amountIn == 0) {
    notify.push({
      title: 'Invalid amount in',
      description: 'Enter a valid amount to transferOrder.',
      category: 'error'
    });
    return;
  };

  if (!transferOrder.value.numOfOrders || transferOrder.value.numOfOrders == 0) {
    notify.push({
      title: 'Invalid number of order in',
      description: 'Enter a minimum of 1 order numbers.',
      category: 'error'
    });
    return;
  };

  if (swapping.value) {
    notify.push({
      title: 'Please wait',
      description: 'Stream creation in progress.',
      category: 'error'
    });
    return;
  }

  swapping.value = true;

  if (!transferOrder.value.startDate) {
    transferOrder.value.startDate = new Date();
  }

  const delayMs: number = transferOrder.value.startDate!.getTime() - Date.now();

  const delaySecs: number = delayMs > 30_000 ? (delayMs / 1000) : 0;

  const cost = Number(Converter.fromWei(timelyFee)) * transferOrder.value.numOfOrders;

  timelyStore.setRequestAllowance(cost);

  if (timelyStore.balance < timelyStore.requestAllowance) {
    setTimeout(() => {
      timelyStore.setRequestAllowance(0);
    }, 3000);
    swapping.value = false;
    return;
  }

  if (timelyStore.allowance < cost) {
    const approveHash = await approve(
      timelyTokenId,
      magentaId,
      Converter.toWei(cost)
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

  const txHash = await createTransferOrder(
    transferOrder.value.receiver,
    transferOrder.value.tokenIn,
    Converter.toWei(transferOrder.value.amountIn!),
    delaySecs > 0 ? Number(delaySecs.toFixed(0)) : 0,
    transferOrder.value.numOfOrders,
    transferOrder.value.iMinutes,
    transferOrder.value.iHours
  );

  if (txHash) {
    notify.push({
      title: 'Stream created',
      description: 'Transaction was sent succesfully.',
      category: 'success',
      linkTitle: 'View Trx',
      linkUrl: `https://fraxscan.com/tx/${txHash}`
    });

    transferOrder.value.amountIn = undefined;
    transferOrder.value.receiver = undefined;

    updateBalances();

    setTimeout(() => { updateTransferOrders(); }, 3000);
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

const initApprove = async () => {
  if (!addressStore.address) {
    notify.push({
      title: 'Connect Wallet',
      description: 'Wallet connection is required.',
      category: 'error'
    });
    return;
  }

  if (!transferOrder.value.amountIn || transferOrder.value.amountIn == 0) {
    notify.push({
      title: 'Invalid amount in',
      description: 'Enter a valid amount to transferOrder.',
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
    transferOrder.value.tokenIn,
    magentaId,
    Converter.toWei(transferOrder.value.amountIn)
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

    initTransferOrder();
  } else {
    notify.push({
      title: 'Transaction failed',
      description: 'Try again later.',
      category: 'error'
    });
  }

  approving.value = false;
};

const updateTransferOrders = async () => {
  if (addressStore.address) {
    loading.value = true;

    const data = await getTransferOrders(addressStore.address);
    transferOrders.value = data;
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
  updateTransferOrders();
};


watch(
  transferOrder,
  () => {
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
    updateTransferOrders();
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
              <p class="label">I want to send <span
                  @click="transferOrder.amountIn = Number(Converter.toMoney(transferOrder.balanceIn))">Bal: {{
                    Converter.toMoney(transferOrder.balanceIn) }}</span></p>
              <div class="input">
                <div class="tokens">
                  <div class="token" @click="transferOrder.openFrom = !transferOrder.openFrom">
                    <div class="token_info">
                      <img :src="getToken(transferOrder.tokenIn)?.image" alt="">
                      <p>{{ getToken(transferOrder.tokenIn)?.symbol }}</p>
                    </div>
                    <ArrowRightIcon style="rotate: 90deg;" />
                  </div>

                  <div class="dropdown_tokens" v-if="transferOrder.openFrom">
                    <div class="token" v-for="token, index in getTokensExcept(transferOrder.tokenIn)"
                      @click="transferOrder.tokenIn = token.tokenId" :key="index">
                      <div class="token_info">
                        <img :src="token.image" alt="">
                        <p>{{ token.symbol }}</p>
                      </div>
                      <ArrowRightIcon style="rotate: 90deg; visibility: hidden;" />
                    </div>
                  </div>
                </div>

                <input type="number" v-model="transferOrder.amountIn" placeholder="0.00">
              </div>
            </div>

            <br>

            <div class="amount">
              <p class="label">To </p>
              <div class="input">
                <input type="text" style="text-align: left; width: 100%; max-width: 100%; font-size: 16px;"
                  v-model="transferOrder.receiver" placeholder="EVM address">
              </div>
            </div>

            <br>

            <div class="amount_grid">
              <div class="amount">
                <p class="label">Every</p>
                <div class="input">
                  <div class="tag">Minute</div>
                  <select name="" id="" @change="(e: any) => {
                    transferOrder.iMinutes = e.target.value as Minutes;
                  }">
                    <option :value="Minutes.ONE_MINUTES">1</option>
                    <option :value="Minutes.TWO_MINUTES">2</option>
                    <option :value="Minutes.FIVE_MINUTES">5</option>
                    <option :value="Minutes.TEN_MINUTES">10</option>
                    <option :value="Minutes.FIFTEEN_MINUTES">15</option>
                    <option :value="Minutes.TWENTY_MINUTES">20</option>
                    <option :value="Minutes.TWENTY_FIVE_MINUTES">25</option>
                    <option :value="Minutes.THIRTY_MINUTES">30</option>
                    <option :value="Minutes.THIRTY_FIVE_MINUTES">35</option>
                    <option :value="Minutes.FORTY_MINUTES">40</option>
                    <option :value="Minutes.FORTY_FIVE_MINUTES">45</option>
                    <option :value="Minutes.FIFTY_MINUTES">50</option>
                    <option :value="Minutes.FIFTY_FIVE_MINUTES">55</option>
                    <option :value="Minutes.SIXTY_MINUTES">60</option>
                  </select>
                </div>
              </div>

              <div class="amount">
                <p class="label">&nbsp;</p>
                <div class="input">
                  <div class="tag">Hour</div>
                  <select name="" id="" @change="(e: any) => {
                    transferOrder.iHours = e.target.value as Hours;
                  }">
                    <option :value="Hours.ZERO_HOUR">0</option>
                    <option :value="Hours.ONE_HOUR">1</option>
                    <option :value="Hours.TWO_HOUR">2</option>
                    <option :value="Hours.THREE_HOUR">3</option>
                    <option :value="Hours.FOUR_HOUR">4</option>
                    <option :value="Hours.FIVE_HOUR">5</option>
                    <option :value="Hours.SIX_HOUR">6</option>
                    <option :value="Hours.SEVEN_HOUR">7</option>
                    <option :value="Hours.EIGHT_HOUR">8</option>
                    <option :value="Hours.NINE_HOUR">9</option>
                    <option :value="Hours.TEN_HOUR">10</option>
                    <option :value="Hours.ELEVEN_HOUR">11</option>
                    <option :value="Hours.TWELVE_HOUR">12</option>
                    <option :value="Hours.THIRTEEN_HOUR">13</option>
                    <option :value="Hours.FOURTEEN_HOUR">14</option>
                    <option :value="Hours.FIFTEEN_HOUR">15</option>
                    <option :value="Hours.SIXTEEN_HOUR">16</option>
                    <option :value="Hours.SEVENTEEN_HOUR">17</option>
                    <option :value="Hours.EIGHTEEN_HOUR">18</option>
                    <option :value="Hours.NINETEEN_HOUR">19</option>
                    <option :value="Hours.TWENTY_HOUR">20</option>
                    <option :value="Hours.TWENTY_ONE_HOUR">21</option>
                    <option :value="Hours.TWENTY_TWO_HOUR">22</option>
                    <option :value="Hours.TWENTY_THREE_HOUR">23</option>
                  </select>
                </div>
              </div>
            </div>

            <br>

            <div class="amount">
              <p class="label">Over</p>
              <div class="input">
                <div class="tag">Orders</div>
                <input type="number" v-model="transferOrder.numOfOrders" placeholder="0">
              </div>
            </div>

            <div class="add_delay">
              <p>Schedule</p>
              <VueDatePicker v-model="transferOrder.startDate"></VueDatePicker>
            </div>

            <div v-if="addressStore.address && (transferOrder.approveIn || 0) >= Number(transferOrder.amountIn)"
              class="action">
              <button @click="initTransferOrder">{{ swapping ? 'Processing..' : 'Start stream' }}</button>
            </div>

            <div v-else-if="addressStore.address && (transferOrder.approveIn || 0) < Number(transferOrder.amountIn)"
              class="action">
              <button @click="initApprove">{{ approving ? 'Approving..' : 'Approve ' +
                getToken(transferOrder.tokenIn)?.symbol
                }}</button>
            </div>

            <div v-else-if="!addressStore.address" @click="modal.open()" class="action">
              <button>Connect Wallet</button>
            </div>

            <div v-else class="action">
              <button style="opacity: 0.5; cursor: not-allowed;">Start stream</button>
            </div>
          </div>
        </div>
        <LoadingBox v-show="loading && !swapAction" id="intro_anim" />

        <div class="explore" v-show="!loading && !swapAction">
          <div class="explore_stat">
            <div class="explore_stat_title">
              <p id="intro_anim">
                <ArrowLeftIcon @click="swapAction = true" />Stream orders: <span>{{ total.valueOf() }}</span>
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
                    <td>Token </td>
                    <td>Timestamp</td>
                    <td>Hash</td>
                  </tr>
                </thead>
              </div>
              <div class="tbody" v-for="order, index in transferOrders" :key="index">
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
                          <button @click="initTransferCancel(order.identifier)">Cancel</button>
                        </a>
                      </div>
                    </td>
                    <td>
                      <div class="payload_hash">
                        <a>
                          <div class="stack">
                            <div class="images">
                              <p><img :src="getToken(order.tokenIn)?.image" alt=""> sent to {{ fineHash(order.receiver)
                                }}
                              </p>
                            </div>
                            <p>{{ Converter.toMoney(Converter.fromWei(order.amountIn)) }} {{
                              getToken(order.tokenIn)?.symbol
                              }} Over {{ order.numOfOrders }} Orders</p>
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

.amount .input {
  background: var(--background-lighter);
  height: 60px;
  border-radius: 16px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

select {
  border: none;
  outline: none;
  padding: 4px 6px;
  border-radius: 6px;
  color: var(--tx-normal);
  background: var(--background);
  cursor: pointer;
}

option {
  cursor: pointer;
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

.amount_grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.amount_grid .input {
  height: 50px;
}

.amount_grid input {
  max-width: 100px;
}

.amount .tag {
  font-size: 14px;
  font-weight: 500;
  color: var(--tx-dimmed);
}

.add_delay {
  margin-top: 20px;
  display: flex;
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