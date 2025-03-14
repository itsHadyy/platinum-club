<template>
    <q-page class="q-pa-md">

        <!-- Back Button -->
        <q-bar class="bg-white text-dark">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-space />
        </q-bar>

        <!-- Header -->
        <div class="text-h6 q-mt-md">
            {{ courtType }} - Choose Date & Time
        </div>

        <!-- Available Days -->
        <q-card-section>
            <div class="text-subtitle1 q-mb-md">Available Days:</div>
            <q-chip v-for="day in availableDays" :key="day" clickable @click="selectDay(day)"
                :class="{ 'bg-primary text-white': selectedDay === day }">
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
            <q-chip v-for="time in availableTimeSlots" :key="time" clickable @click="toggleTimeSlot(time)"
                :class="{ 'bg-primary text-white': selectedSlots.includes(time) }">
                {{ time }}
            </q-chip>
        </q-card-section>

        <!-- Confirm Booking Button -->
        <q-btn class="full-width q-mt-md" color="primary" :label="`Confirm Booking (${totalPrice} EGP)`"
            @click="goToSummary" />
    </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
const courtPrice = 100; // Price per hour

// Generate days from today to next 7 days
const generateDays = () => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return date;
    });
    availableDays.value = days;
};

// Generate available time slots (starting from next hour)
const availableTimeSlots = computed(() => {
    const now = new Date();
    const currentHour = now.getHours();

    const slots = [];
    for (let i = currentHour + 1; i <= 22; i++) {
        slots.push(`${i}:00 - ${i + 1}:00`);
    }

    return slots;
});

// Select Day
const selectDay = (day) => {
    selectedDay.value = day;
};

// Select Court
const selectCourt = (court) => {
    selectedCourt.value = court;
};

// Toggle Time Slots
const toggleTimeSlot = (slot) => {
    if (selectedSlots.value.includes(slot)) {
        selectedSlots.value = selectedSlots.value.filter((s) => s !== slot);
    } else {
        selectedSlots.value.push(slot);
    }
};

// Total Price Calculation
const totalPrice = computed(() => {
    return selectedSlots.value.length * courtPrice;
});

// Navigate to Booking Summary Page
const goToSummary = () => {
    if (!selectedDay.value || !selectedCourt.value || selectedSlots.value.length === 0) {
        alert('Please select all fields');
        return;
    }

    router.push({
        path: '/booking/summary',
        query: {
            courtType: courtType.value,
            day: selectedDay.value,
            court: selectedCourt.value,
            slots: JSON.stringify(selectedSlots.value),
            price: totalPrice.value
        }
    });
};

// Format date
const formatDate = (date) => {
    const options = { weekday: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

// On Component Mount
onMounted(() => {
    generateDays();
});
</script>