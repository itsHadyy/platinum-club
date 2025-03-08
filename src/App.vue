<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "stores/useAuthStore";

const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuth();
});
</script>

<template>
  <div v-if="authStore.isAuthReady">
    <router-view />
  </div>
  <div v-else class="loading-screen">
    <p>Loading...</p> <!-- Show a loading state while waiting for auth -->
  </div>
</template>

<style scoped>
.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 20px;
}
</style>