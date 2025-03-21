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

        <!-- Calendar View -->
        <q-card flat bordered class="q-pa-md q-mb-md">
            <q-calendar view="month" :events="calendarEvents" animated bordered
                @click-date="(date) => filters.date = date" />
        </q-card>

        <!-- Upcoming Bookings -->
        <div v-if="upcomingBookings.length">
            <div class="text-h6 text-bold q-mb-md">Upcoming Bookings</div>
            <q-list separator>
                <q-card v-for="booking in upcomingBookings" :key="booking.id" class="q-mb-md">
                    <q-card-section>
                        <div class="text-h6 text-primary">{{ formatDate(booking.date) }}</div>
                        <q-badge color="positive" class="q-mt-sm">Upcoming</q-badge>
                    </q-card-section>
                    <q-card-section>
                        <p><strong>Sport:</strong> {{ booking.sport }}</p>
                        <p><strong>Court:</strong> {{ booking.court }}</p>
                        <p><strong>Price:</strong> {{ formatPrice(booking.price) }}</p>
                        <p>
                            <strong>Time Slots:</strong>
                            <span v-if="booking.slots?.length">{{ booking.slots.join(", ") }}</span>
                            <span v-else class="text-grey">No slots selected</span>
                        </p>
                    </q-card-section>
                    <q-card-actions align="right">
                        <q-btn color="negative" dense @click="cancelBooking(booking.id)">Cancel</q-btn>
                    </q-card-actions>
                </q-card>
            </q-list>
        </div>

        <!-- Past Bookings -->
        <div v-if="pastBookings.length">
            <div class="text-h6 text-bold q-mb-md q-mt-md">Past Bookings</div>
            <q-list separator>
                <q-card v-for="booking in pastBookings" :key="booking.id" class="q-mb-md">
                    <q-card-section>
                        <div class="text-h6 text-grey">{{ formatDate(booking.date) }}</div>
                        <q-badge color="negative" class="q-mt-sm">Past</q-badge>
                    </q-card-section>
                    <q-card-section>
                        <p><strong>Sport:</strong> {{ booking.sport }}</p>
                        <p><strong>Court:</strong> {{ booking.court }}</p>
                        <p><strong>Price:</strong> {{ formatPrice(booking.price) }}</p>
                        <p>
                            <strong>Time Slots:</strong>
                            <span v-if="booking.slots?.length">{{ booking.slots.join(", ") }}</span>
                            <span v-else class="text-grey">No slots selected</span>
                        </p>
                    </q-card-section>
                </q-card>
            </q-list>
        </div>

        <!-- Empty State -->
        <div v-if="!upcomingBookings.length && !pastBookings.length" class="text-center text-grey q-mt-lg">
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

const filters = ref({
    date: "",
    sport: null,
    court: null,
});

const sportOptions = ref(["Basketball", "Tennis", "Football", "Volleyball"]);
const courtOptions = ref(["Court A", "Court B", "Court C"]);

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

const upcomingBookings = computed(() => {
    return myBookings.value.filter(booking => new Date(booking.date) >= new Date());
});

const pastBookings = computed(() => {
    return myBookings.value.filter(booking => new Date(booking.date) < new Date());
});

const applyFilters = () => { };

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

const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const formatPrice = (price) => (price ? `EGP ${price}` : "N/A");

// Calendar Events
const calendarEvents = computed(() => {
    return myBookings.value.map(booking => ({
        start: booking.date,
        end: booking.date,
        title: `${booking.sport} - ${booking.court}`,
        color: "blue"
    }));
});

onMounted(fetchUserBookings);
</script>