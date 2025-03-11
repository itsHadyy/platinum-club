import { defineStore } from 'pinia';
import { ref } from 'vue';
import QRCode from 'qrcode';

export const useQRStore = defineStore('qr', () => {
    const qrCode = ref(null);
    const guestQRCode = ref(null);
    const lastUpdated = ref(Date.now());

    const generateQRCode = async (user) => {
        const qrData = JSON.stringify({
            uid: user.uid,
            timestamp: Date.now(),
            expiresIn: 30000, // Expires in 30 sec
            type: "user"
        });

        qrCode.value = await QRCode.toDataURL(qrData);
        lastUpdated.value = Date.now();
    };

    const generateGuestQRCode = async () => {
        const guestToken = Math.random().toString(36).substring(2, 10); // Random one-time code
        const qrData = JSON.stringify({
            token: guestToken,
            expiresAt: Date.now() + 1800000, // Valid for 30 min
            type: "guest"
        });

        guestQRCode.value = await QRCode.toDataURL(qrData);
    };

    return { qrCode, guestQRCode, generateQRCode, generateGuestQRCode, lastUpdated };
});