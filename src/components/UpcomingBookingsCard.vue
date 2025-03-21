<template>
    <q-card class="upcoming-bookings-card q-pa-md q-ma-md" @click="goToBookings">
        <q-card-section class="header">
            <div class="text-h6 text-secondary">Upcoming Bookings</div>
        </q-card-section>

        <q-separator />

        <!-- Show loading while fetching -->
        <q-inner-loading :showing="loading">
            <q-spinner size="40px" color="primary" />
        </q-inner-loading>

        <!-- Display upcoming bookings -->
        <q-card-section v-if="upcomingBookings.length">
            <q-list separator>
                <q-item v-for="booking in upcomingBookings" :key="booking.id" class="booking-item">
                    <q-item-section>
                        <div class="text-bold text-secondary">{{ booking.sport }} at {{ booking.court }}</div>
                        <div class="text-grey text-caption">{{ formatDate(booking.date) }}</div>
                    </q-item-section>
                    <q-item-section side class="badge-container">
                        <q-badge color="positive" class="status-badge">Upcoming</q-badge>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card-section>

        <!-- Empty state -->
        <q-card-section v-else class="empty-state">
            <q-icon name="event_busy" size="40px" color="grey-6" />
            <div class="text-grey q-mt-md">No upcoming bookings</div>
        </q-card-section>
    </q-card>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'boot/firebase';
import { useAuthStore } from "src/stores/useAuthStore";
import { useRouter } from 'vue-router'; // Import Vue Router

const myBookings = ref([]);
const loading = ref(true);
const userStore = useAuthStore();
const router = useRouter(); // Initialize Vue Router

// Fetch bookings from Firestore
const fetchUserBookings = async () => {
    loading.value = true;
    try {
        const q = query(collection(db, 'courtBookings'), where('userId', '==', userStore.user.uid));
        const querySnapshot = await getDocs(q);
        myBookings.value = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching bookings:", error);
    } finally {
        loading.value = false;
    }
};

// Filter upcoming bookings
const upcomingBookings = computed(() => {
    return myBookings.value.filter(booking => new Date(booking.date) >= new Date());
});

// Format the date
const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
};

// Redirect to "My Bookings" page
const goToBookings = () => {
    router.push('/my-bookings'); // Update with your actual route path
};

// Fetch bookings when component is mounted
onMounted(fetchUserBookings);
</script>