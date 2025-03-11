<template>
    <div>
        <q-btn label="Generate Guest QR" color="secondary" @click="qrStore.generateGuestQRCode" />
        <q-img v-if="qrStore.guestQRCode" :src="qrStore.guestQRCode" class="q-mt-md" />
    </div>
</template>

<script setup>
import { useQRStore } from 'src/stores/useQRStore';

const qrStore = useQRStore();
</script>