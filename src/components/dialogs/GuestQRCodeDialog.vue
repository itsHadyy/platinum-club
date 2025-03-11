<template>
    <q-dialog v-model="showDialog">
        <q-card>
            <q-card-section>
                <div class="text-h6">Guest QR Code</div>
            </q-card-section>

            <q-card-section class="flex flex-center">
                <vue-qrcode :value="qrData" :size="200"></vue-qrcode>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Close" v-close-popup />
                <q-btn color="primary" label="Share" @click="shareQRCode" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import VueQrcode from 'vue-qrcode';

const showDialog = ref(false);
const guestId = ref("");

const qrData = computed(() => {
    return `https://yourapp.com/guest/${guestId.value}`; // Dynamic QR Code URL
});

function showQR(id) {
    guestId.value = id;
    showDialog.value = true;
}

function shareQRCode() {
    const shareData = {
        title: "Guest QR Code",
        text: "Here is your one-time guest pass QR Code",
        url: qrData.value
    };

    if (navigator.share) {
        navigator.share(shareData).catch(console.error);
    } else {
        alert("Sharing not supported in this browser.");
    }
}

defineExpose({ showQR });
</script>