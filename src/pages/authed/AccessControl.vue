<template>
    <q-page class="q-pa-md">
        <h4>Access Control</h4>

        <!-- User's QR Code (Auto-refresh every 30s) -->
        <div class="q-mt-md">
            <q-card class="q-pa-md">
                <p>Your QR Code (Auto-Refreshes every 30s)</p>
                <QRCodeGenerator />
            </q-card>
        </div>

        <!-- Generate a One-Time Guest QR Code -->
        <div class="q-mt-md">
            <q-card class="q-pa-md">
                <p>Generate a One-Time Guest QR Code</p>
                <q-btn label="Invite Guest" color="secondary" @click="openInviteDialog" />
            </q-card>
        </div>

        <!-- QR Code Scanner -->
        <div class="q-mt-md">
            <q-card class="q-pa-md" color="secondary">
                <p>Scan a QR Code</p>
                <QRCodeScanner />
            </q-card>
        </div>

        <!-- Dialog for inviting a guest -->
        <InviteGuestDialog ref="inviteGuestDialog" @guestInvited="showGuestQR" />

        <!-- Dialog for displaying the generated guest QR Code -->
        <GuestQRCodeDialog ref="guestQRCodeDialog" />
    </q-page>
</template>

<script setup>
import { ref } from 'vue';
import QRCodeGenerator from 'src/components/QRCodeGenerator.vue';
import QRCodeScanner from 'src/components/QRCodeScanner.vue';
import InviteGuestDialog from 'src/components/dialogs/InviteGuestDialog.vue';
import GuestQRCodeDialog from 'src/components/dialogs/GuestQRCodeDialog.vue';

const inviteGuestDialog = ref(null);
const guestQRCodeDialog = ref(null);

// Open the invite guest dialog
const openInviteDialog = () => {
    inviteGuestDialog.value.showDialog = true;
};

// Show the generated guest QR code after invitation
const showGuestQR = (guestId) => {
    guestQRCodeDialog.value.showGuestQRCode(guestId);
};
</script>