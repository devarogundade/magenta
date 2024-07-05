<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import SnackbarPop from '@/pops/SnackbarPop.vue';
import { initializeApp } from "firebase/app";
import { onMounted } from 'vue';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FS_API_KEY,
  authDomain: import.meta.env.VITE_FS_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FS_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FS_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FS_MSG_SENDER_ID,
  appId: import.meta.env.VITE_FS_APP_ID,
  measurementId: import.meta.env.VITE_FS_MEASUREMENT_ID,
};

// Initialize Firebase
initializeApp(firebaseConfig);

const isDesktop = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileDevices = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'
  ];

  for (const device of mobileDevices) {
    if (userAgent.includes(device)) {
      return false;
    }
  }
  return true;
};

onMounted(() => {
  if (!isDesktop()) {
    alert('Switch to desktop for better user experience. Mobile view is in progress.');
  }
});
</script>

<template>
  <main>
    <AppHeader />
    <RouterView style="padding-bottom: 50px;" />
    <SnackbarPop />
    <AppFooter />
  </main>
</template>
