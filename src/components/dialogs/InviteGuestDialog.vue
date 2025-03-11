<template>
    <q-dialog v-model="showDialog">
        <q-card class="q-pa-sm">
            <q-card-section>
                <div class="text-h6">Enter Guest Information</div>
            </q-card-section>

            <q-card-section>
                <q-input v-model="guest.fullName" label="Full Name" />
                <q-input v-model="guest.mobileNumber" label="Mobile Number" type="tel" />
                <q-input v-model="guest.date" label="Entrance Date" type="date" />
                <q-select v-model="guest.type" :options="['Child', 'Adult']" label="Type" />
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn color="secondary" label="Invite Guest" @click="handleInviteGuest" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref } from 'vue';
import { useGuestStore } from 'src/stores/useGuestStore';

const guestStore = useGuestStore();
const showDialog = ref(false);
const emit = defineEmits(["guestInvited"]); // ✅ Define the event emitter

const guest = ref({
    fullName: '',
    mobileNumber: '',
    date: '',
    type: ''
});

async function handleInviteGuest() {
    if (!guest.value.fullName || !guest.value.mobileNumber || !guest.value.date || !guest.value.type) {
        alert("Please fill all fields.");
        return;
    }

    try {
        const guestId = await guestStore.inviteGuest({ ...guest.value, createdAt: new Date() });
        showDialog.value = false;
        emit("guestInvited", guestId); // ✅ Emit the event correctly
    } catch (error) {
        console.error("Failed to invite guest:", error);
    }
}

defineExpose({ showDialog });
</script>

<style>
.q-dialog__inner .q-card{
    width: 100%;
}
</style>