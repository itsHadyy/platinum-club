<template>
    <div>
        <q-img v-if="qrCode" :src="qrCode" class="q-mt-md" />
        <p class="text-grey text-caption q-mt-sm">Last updated: {{ new Date(lastUpdated).toLocaleTimeString() }}</p>
    </div>
</template>

<script setup>
import { onMounted, watchEffect } from 'vue';
import { useQRStore } from 'src/stores/useQRStore';
import { useAuthStore } from 'src/stores/useAuthStore';

const qrStore = useQRStore();
const authStore = useAuthStore();

onMounted(() => {
    qrStore.generateQRCode(authStore.user); 
});

watchEffect(() => {
    setInterval(() => {
        qrStore.generateQRCode(authStore.user);
    }, 30000); 
});
</script>