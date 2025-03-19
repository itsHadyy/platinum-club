<template>
    <q-page class="q-pa-md">
        <q-bar class="bg-white text-dark">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-space />
        </q-bar>

        <div class="text-subtitle1 text-bold q-mb-lg">{{ courtType }} - Choose Date & Time</div>

        <q-card-section>
            <div class="text-subtitle1 q-mb-md">Available Days:</div>
            <div v-if="availableDays.length > 0">
                <q-chip v-for="day in availableDays" :key="day" clickable @click="selectDay(day)"
                    :class="{ 'bg-secondary text-white': selectedDay === day, 'bg-primary text-secondary': selectedDay !== day }">
                    {{ formatDate(day) }}
                </q-chip>
            </div>
            <div v-else class="text-grey">No available days</div>
        </q-card-section>

        <q-card-section>
            <div class="text-subtitle1 q-mb-md">Select a Court:</div>
            <div v-if="availableCourts.length > 0">
                <q-chip v-for="court in availableCourts" :key="court.id" clickable @click="selectCourt(court)"
                    :class="{ 'bg-secondary text-white': selectedCourt?.id === court.id, 'bg-primary text-secondary': selectedCourt?.id !== court.id }">
                    {{ court.name }} - {{ court.price }} EGP/hour
                </q-chip>
            </div>
            <div v-else class="text-grey">No courts available</div>
        </q-card-section>

        <q-card-section v-if="selectedDay && selectedCourt">
            <div class="text-subtitle1 q-mb-md">Select Time Slots:</div>
            <div v-if="availableTimeSlots.length > 0">
                <q-chip v-for="slot in availableTimeSlots" :key="slot.time" clickable
                    @click="toggleSlotSelection(slot.time)" :class="{
                        'bg-secondary text-white': selectedSlots.includes(slot.time),
                        'bg-red text-white': slot.isReserved
                    }" :disable="slot.isReserved">
                    {{ slot.time }}
                </q-chip>
            </div>
            <div v-else class="text-grey">No available time slots</div>
        </q-card-section>

        <div class="row justify-center q-mt-lg" v-if="selectedSlots.length > 0">
            <q-btn class="q-mt-md" color="secondary" :label="`Confirm Booking (${totalPrice} EGP)`"
                @click="confirmBooking" />
        </div>
    </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSportsStore } from 'src/stores/sportsStore';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const db = getFirestore();
const route = useRoute();
const router = useRouter();
const sportsStore = useSportsStore();

const courtType = ref(route.params.courtType);
const selectedDay = ref(null);
const selectedCourt = ref(null);
const selectedSlots = ref([]);
const reservedSlots = ref([]);

const availableCourts = computed(() => sportsStore.courtsBySport[courtType.value] || []);
const courtPrice = computed(() => selectedCourt.value ? selectedCourt.value.price : 0);

const availableDays = ref([]);
const generateDays = () => {
    const today = new Date();
    availableDays.value = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return date;
    });
};

// ✅ Fetch booked slots when both court and date are selected
watch([selectedDay, selectedCourt], async () => {
    if (selectedDay.value && selectedCourt.value) {
        await fetchReservedSlots();
    }
});

// ✅ Compute available time slots dynamically
const availableTimeSlots = computed(() => {
    if (!selectedDay.value || !selectedCourt.value) return [];

    console.log("Checking reserved slots:", reservedSlots.value);

    const now = new Date();
    const currentHour = now.getHours();
    const startHour = isToday(selectedDay.value) ? currentHour + 1 : 9;

    return Array.from({ length: 22 - startHour + 1 }, (_, i) => {
        const timeSlot = `${startHour + i}:00 - ${startHour + i + 1}:00`;
        return {
            time: timeSlot,
            isReserved: reservedSlots.value.includes(timeSlot)
        };
    });
});

// ✅ Check if selected day is today
const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

// ✅ Select day and fetch reservations
const selectDay = (day) => {
    selectedDay.value = day;
};

// ✅ Select court and fetch reservations
const selectCourt = (court) => {
    selectedCourt.value = court;
};

const fetchReservedSlots = async () => {
    if (!selectedDay.value || !selectedCourt.value) return;

    try {
        const dateString = selectedDay.value.toISOString().split('T')[0]; // Ensure it matches Firestore format

        console.log("Fetching reserved slots for:", {
            date: dateString,
            court: selectedCourt.value.name // Fix: Use correct field name
        });

        const q = query(
            collection(db, "courtBookings"),
            where("date", "==", dateString),
            where("court", "==", selectedCourt.value.name) // Fix: Ensure correct field name
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No bookings found!");
            reservedSlots.value = [];
            return;
        }

        reservedSlots.value = querySnapshot.docs.flatMap(doc => doc.data().slots || []);

        console.log("Reserved Slots AFTER update:", reservedSlots.value);
    } catch (error) {
        console.error("Error fetching reserved slots:", error);
    }
};

// ✅ Toggle time slot selection
const toggleSlotSelection = (slot) => {
    if (reservedSlots.value.includes(slot)) return;
    selectedSlots.value = selectedSlots.value.includes(slot)
        ? selectedSlots.value.filter(s => s !== slot)
        : [...selectedSlots.value, slot];
};

// ✅ Compute total price
const totalPrice = computed(() => selectedSlots.value.length * courtPrice.value);

// ✅ Confirm booking and navigate to summary
const confirmBooking = () => {
    if (!selectedDay.value || !selectedCourt.value || selectedSlots.value.length === 0) {
        alert('Please select all fields');
        return;
    }

    router.push({
        name: "BookingSummaryPage",
        query: {
            court: selectedCourt.value.name,
            courtId: selectedCourt.value.id,
            sport: courtType.value,
            day: selectedDay.value.toISOString(),
            slots: JSON.stringify(selectedSlots.value),
            price: totalPrice.value,
        },
    });
};

// ✅ Format date for display
const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

// ✅ Generate days on mount
onMounted(() => {
    generateDays();
});
</script>