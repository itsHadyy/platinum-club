<template>
    <div>
        <q-btn label="Scan QR Code" color="secondary" @click="scanQR" />
        <q-input v-model="scannedData" readonly class="q-mt-md" />
    </div>
</template>

<script setup>
import { ref } from 'vue';

const scannedData = ref("");

const scanQR = async () => {
    try {
        const result = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const scannedQR = JSON.parse(result); // Decode the QR data

        if (scannedQR.type === "guest" && Date.now() < scannedQR.expiresAt) {
            scannedData.value = "Guest QR Valid - Access Granted";
        } else if (scannedQR.type === "user") {
            scannedData.value = `Welcome, User ${scannedQR.uid}`;
        } else {
            scannedData.value = "Invalid QR Code or Expired";
        }
    } catch (error) {
        console.error("Error scanning QR Code:", error);
        scannedData.value = "Error scanning QR Code";
    }
};
</script>