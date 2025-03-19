<template>
    <q-page class="q-pa-md">

        <q-bar class="bg-white text-dark">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-space />
        </q-bar>

        <div class="text-subtitle1 text-bold q-mb-lg">My Bookings</div>

        <q-list bordered separator>
            <q-item v-for="booking in myBookings" :key="booking.id">
                <q-item-section>
                    <q-item-label>
                        <strong>Date:</strong> {{ booking.date }}
                    </q-item-label>
                    <q-item-label>
                        <strong>Court Type:</strong> {{ booking.courtType }}
                    </q-item-label>
                    <q-item-label>
                        <strong>Court:</strong> {{ booking.court }}
                    </q-item-label>
                    <q-item-label><strong>Sport:</strong> {{ booking.sport }}</q-item-label>
                    <q-item-label><strong>Court Type:</strong> {{ booking.courtType }}</q-item-label>
                    <q-item-label><strong>Court Number:</strong> {{ booking.courtNumber }}</q-item-label>
                    <q-item-label>
                        <strong>Price:</strong> {{ booking.price }}
                    </q-item-label>
                    <q-item-label>
                        <strong>Time Slots:</strong> {{ booking.slots.join(', ') }}
                    </q-item-label>
                </q-item-section>

                <q-item-section side>
                    <q-btn color="negative" dense @click="cancelBooking(booking.id)">
                        Cancel
                    </q-btn>
                </q-item-section>
            </q-item>
        </q-list>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from 'boot/firebase';
import { useAuthStore } from "src/stores/useAuthStore";

const myBookings = ref([]);
const userStore = useAuthStore(); // Get current user ID

const fetchUserBookings = async () => {
    const q = query(collection(db, 'courtBookings'), where('userId', '==', userStore.user.uid));
    const querySnapshot = await getDocs(q);

    myBookings.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

const cancelBooking = async (bookingId) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
        await deleteDoc(doc(db, 'courtBookings', bookingId));
        fetchUserBookings(); // Refresh bookings
    }
};

onMounted(fetchUserBookings);
</script>