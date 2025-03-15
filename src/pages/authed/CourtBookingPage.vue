<template>
    <q-page class="q-pa-md">
        <!-- Back Button -->
        <q-bar class="bg-white text-dark">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-space />
        </q-bar>

        <!-- Header -->
        <div class="text-subtitle1 text-bold q-mb-lg">{{ courtType }} - Choose Date & Time</div>

        <!-- Available Days -->
        <q-card-section>
            <div class="text-subtitle1 q-mb-md">Available Days:</div>
            <q-chip v-for="day in availableDays" :key="day" clickable @click="selectDay(day)"
                :class="{ 'bg-secondary text-white': selectedDay === day }">
                {{ formatDate(day) }}
            </q-chip>
        </q-card-section>

        <!-- Select Court -->
        <q-card-section>
            <div class="text-subtitle1 q-mb-md">Select a Court:</div>
            <q-btn v-for="court in availableCourts" :key="court" class="full-width q-mb-md" color="secondary"
                @click="selectCourt(court)">
                Court {{ court }} - {{ courtPrice }} EGP/hour
            </q-btn>
        </q-card-section>

        <!-- Select Time Slots -->
        <q-card-section>
            <div class="text-subtitle1 q-mb-md">Select Time Slots:</div>
            <q-chip v-for="time in availableTimeSlots" :key="time" clickable @click="toggleTimeSlot(time)" :class="{
                'bg-secondary text-white': selectedSlots.includes(time),
                'bg-red text-white': reservedSlots.includes(time)
            }" :disable="reservedSlots.includes(time)">
                {{ time }}
            </q-chip>
        </q-card-section>

        <div class="row justify-center q-mt-lg">
            <q-btn class="q-mt-md" color="secondary" :label="`Confirm Booking (${totalPrice} EGP)`"
                @click="confirmBooking" />
        </div>
    </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from 'boot/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Route params
const route = useRoute();
const router = useRouter();
const courtType = ref(route.params.courtType);

// Data
const availableDays = ref([]);
const availableCourts = [1, 2, 3, 4];
const selectedDay = ref(null);
const selectedCourt = ref(null);
const selectedSlots = ref([]);
const reservedSlots = ref([]);
const courtPrice = 100; // Price per hour

// Generate days from today to next 7 days
const generateDays = () => {
    const today = new Date();
    availableDays.value = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return date;
    });
};

const availableTimeSlots = computed(() => {
    const now = new Date();
    const currentHour = now.getHours();

    const startHour = selectedDay.value && isToday(selectedDay.value)
        ? currentHour + 1 // If today, show slots after current time
        : 9; // If future day, start from 9 AM

    const slots = [];

    for (let i = startHour; i <= 22; i++) {
        slots.push(`${i}:00 - ${i + 1}:00`);
    }

    return slots;
});

const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

// Select Day
const selectDay = (day) => {
    selectedDay.value = day;
    fetchReservedSlots();
};

// Select Court
const selectCourt = (court) => {
    selectedCourt.value = court;
    fetchReservedSlots();
};

// Toggle Time Slots
const toggleTimeSlot = (slot) => {
    if (reservedSlots.value.includes(slot)) return;

    if (selectedSlots.value.includes(slot)) {
        selectedSlots.value = selectedSlots.value.filter((s) => s !== slot);
    } else {
        selectedSlots.value.push(slot);
    }
};


const fetchReservedSlots = async () => {
    if (!selectedDay.value || !selectedCourt.value) return;

    const dateString = selectedDay.value.toISOString().split('T')[0];

    try {
        const q = query(
            collection(db, 'courtBookings'),
            where('date', '==', dateString),
            where('court', '==', selectedCourt.value)
        );

        const querySnapshot = await getDocs(q);
        const bookedSlots = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.slots) {
                bookedSlots.push(...data.slots);
            }
        });

        console.log('Reserved slots:', bookedSlots);
        reservedSlots.value = bookedSlots;

    } catch (error) {
        console.error('Error fetching reserved slots:', error);
    }
};

const totalPrice = computed(() => selectedSlots.value.length * courtPrice);

const confirmBooking = () => {
    if (!selectedDay.value || !selectedCourt.value || selectedSlots.value.length === 0) {
        alert('Please select all fields');
        return;
    }

    // Navigate to BookingSummaryPage with data
    router.push({
        name: 'BookingSummaryPage',
        query: {
            courtType: courtType.value,
            day: selectedDay.value.toISOString(),
            court: selectedCourt.value,
            slots: JSON.stringify(selectedSlots.value),
            price: totalPrice.value,
        }
    });
};

// Format Date
const formatDate = (date) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
};

// On Component Mount
onMounted(() => {
    generateDays();
});
</script>