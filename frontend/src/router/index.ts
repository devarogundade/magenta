import { createRouter, createWebHistory } from 'vue-router';
import SwapView from '../views/SwapView.vue';
import LimitOrderView from '../views/LimitOrderView.vue';
import DCAOrderView from '../views/DCAOrderView.vue';
import TransferOrderView from '../views/TransferOrderView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'swap',
      component: SwapView
    },
    {
      path: '/limit-order',
      name: 'limit-order',
      component: LimitOrderView
    },
    {
      path: '/dca',
      name: 'dca',
      component: DCAOrderView
    },
    {
      path: '/stream',
      name: 'stream',
      component: TransferOrderView
    }
  ]
});

export default router;
