<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from 'src/stores/useAuthStore';
import { QSpinnerDots } from 'quasar';

const authStore = useAuthStore();
const isOffline = ref(!navigator.onLine); // Initial state

// Function to update network status
const updateNetworkStatus = () => {
  isOffline.value = !navigator.onLine;
};

onMounted(() => {
  authStore.initAuth();

  // Listen for online/offline events
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
});

onUnmounted(() => {
  window.removeEventListener("online", updateNetworkStatus);
  window.removeEventListener("offline", updateNetworkStatus);
});
</script>

<template>
  <div v-if="authStore.isAuthReady">
    <router-view />
  </div>

  <!-- 🔹 Loading Screen with Spinner -->
  <div v-else class="loading-screen">
    <q-spinner-dots color="primary" size="50px" />
    <p>Loading, please wait...</p>
  </div>

  <!-- 🔹 Show offline message when user has no internet -->
  <div v-if="isOffline" class="offline-message">
    <p>No internet connection. Please check your network.</p>
  </div>
</template>

<style scoped>
.loading-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: #555;
}

/* 🔹 Offline Message Style */
.offline-message {
  position: fixed;
  bottom: 10px;
  left: 50%;
  width: 80%;
  transform: translateX(-50%);
  background: red;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  z-index: 9999;
}

.offline-message p{
  margin: 0 ;
}
</style>