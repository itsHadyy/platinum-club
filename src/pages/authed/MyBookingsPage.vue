<template>
    <q-page class="q-pa-md">

        <q-bar class="bg-white text-dark">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
        </q-bar>

        <!-- Page Title -->
        <div class="text-h6 q-mb-lg text-bold">My Bookings</div>

        <!-- Filters -->
        <q-card flat bordered class="q-pa-md q-mb-md">
            <q-form @submit="applyFilters">
                <q-input v-model="filters.date" label="Filter by Date" type="date" outlined dense class="q-mb-sm" />
                <q-select v-model="filters.sport" :options="sportOptions" label="Filter by Sport" outlined dense
                    class="q-mb-sm" />
                <q-select v-model="filters.court" :options="courtOptions" label="Filter by Court" outlined dense
                    class="q-mb-sm" />
                <q-btn label="Apply Filters" color="primary" type="submit" class="full-width" />
            </q-form>
        </q-card>

        <!-- Loading State -->
        <q-inner-loading :showing="loading">
            <q-spinner size="50px" color="primary" />
        </q-inner-loading>

        <!-- Bookings List -->
        <q-list bordered separator v-if="filteredBookings.length">
            <q-item v-for="booking in filteredBookings" :key="booking.id">
                <q-item-section>
                    <q-item-label>
                        <strong>Date:</strong> {{ formatDate(booking.date) }}
                        <q-badge :color="getBookingStatus(booking.date).color" class="q-ml-sm">
                            {{ getBookingStatus(booking.date).label }}
                        </q-badge>
                    </q-item-label>
                    <q-item-label><strong>Sport:</strong> {{ booking.sport }}</q-item-label>
                    <q-item-label><strong>Court:</strong> {{ booking.court }}</q-item-label>
                    <q-item-label><strong>Price:</strong> {{ formatPrice(booking.price) }}</q-item-label>
                    <q-item-label>
                        <strong>Time Slots:</strong>
                        <span v-if="booking.slots?.length">{{ booking.slots.join(", ") }}</span>
                        <span v-else class="text-grey">No slots selected</span>
                    </q-item-label>
                </q-item-section>

                <q-item-section side>
                    <q-btn color="negative" dense @click="cancelBooking(booking.id)">
                        Cancel
                    </q-btn>
                </q-item-section>
            </q-item>
        </q-list>

        <!-- Empty State -->
        <div v-else class="text-center text-grey q-mt-lg">
            <q-icon name="event_busy" size="48px" />
            <div class="q-mt-md">No bookings found.</div>
        </div>

    </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from 'boot/firebase';
import { useAuthStore } from "src/stores/useAuthStore";

const myBookings = ref([]);
const loading = ref(true);
const userStore = useAuthStore();

// Filters
const filters = ref({
    date: "",
    sport: null,
    court: null,
});
const sportOptions = ref(["Basketball", "Tennis", "Football", "Volleyball"]); // Customize
const courtOptions = ref(["Court A", "Court B", "Court C"]); // Customize

// Fetch user bookings from Firebase
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

// Filtered bookings based on selected filters
const filteredBookings = computed(() => {
    return myBookings.value.filter(booking => {
        return (
            (!filters.value.date || booking.date === filters.value.date) &&
            (!filters.value.sport || booking.sport === filters.value.sport) &&
            (!filters.value.court || booking.court === filters.value.court)
        );
    });
});

// Apply filters (just re-triggers computed property)
const applyFilters = () => { };

// Cancel a booking
const cancelBooking = async (bookingId) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
        try {
            await deleteDoc(doc(db, 'courtBookings', bookingId));
            fetchUserBookings();
        } catch (error) {
            console.error("Error canceling booking:", error);
        }
    }
};

// Format date
const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// Format price
const formatPrice = (price) => price ? `EGP ${price}` : "N/A";

// Get booking status (Upcoming or Past)
const getBookingStatus = (date) => {
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate >= today) {
        return { label: "Upcoming", color: "positive" };
    } else {
        return { label: "Past", color: "negative" };
    }
};

onMounted(fetchUserBookings);
</script>