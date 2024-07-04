import { defineStore } from 'pinia';

export const useTimelyStore = defineStore('timely', {
  state: () => ({
    balance: 0,
    allowance: 0,
    requestAllowance: 0,
  }),
  actions: {
    setBalance(newBalance: number) {
      this.balance = newBalance;
    },
    setAllowance(newAllowance: number) {
      this.allowance = newAllowance;
    },
    setRequestAllowance(newAllowance: number) {
      this.requestAllowance = newAllowance;
    }
  }
});
