<template>
    <q-page class="q-pa-md">
        <q-bar class="bg-white text-dark">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-space />
        </q-bar>

        <div class="text-h5 text-bold text-center q-mb-md">All Court Bookings</div>

        <q-card class="q-pa-md q-mb-md shadow-2">
            <q-card-section class="row q-gutter-md">
                <q-input v-model="selectedDate" type="date" label="Filter by Date" outlined dense class="col" />

                <q-select v-model="selectedSport" :options="sportsOptions" label="Sport" outlined dense class="col"
                    emit-value map-options @update:model-value="updateCourtTypes" />

                <q-select v-model="selectedCourtType" :options="courtTypes" label="Court Type" outlined dense
                    class="col" emit-value map-options @update:model-value="updateCourtNumbers" />

                <q-select v-model="selectedCourtNumber" :options="courtNumbers" label="Court Number" outlined dense
                    class="col" emit-value map-options />

                <q-btn color="secondary" label="Reset Filters" dense @click="resetFilters" class="col-auto" />
            </q-card-section>
        </q-card>

        <q-list bordered separator v-if="filteredBookings.length">
            <q-item v-for="booking in filteredBookings" :key="booking.id">
                <q-item-section>
                    <q-item-label><strong>Date:</strong> {{ booking.date }}</q-item-label>
                    <q-item-label><strong>Sport:</strong> {{ booking.courtType }}</q-item-label>
                    <q-item-label><strong>Court:</strong> {{ booking.court }}</q-item-label>
                    <q-item-label><strong>Price:</strong> {{ booking.price }}</q-item-label>
                    <q-item-label><strong>Time Slots:</strong> {{ booking.slots.join(', ') }}</q-item-label>
                    <q-item-label><strong>Booked By:</strong> {{ booking.userName }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                    <q-btn color="negative" dense @click="cancelBooking(booking.id)">
                        Cancel
                    </q-btn>
                </q-item-section>
            </q-item>
        </q-list>

        <p v-else class="text-center text-grey">No bookings found.</p>
    </q-page>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from 'boot/firebase';

const bookings = ref([]);
const sportsOptions = ref([]);
const courtTypes = ref([]);
const courtNumbers = ref([]);

const selectedDate = ref(null);
const selectedSport = ref(null);
const selectedCourtType = ref(null);
const selectedCourtNumber = ref(null);


const fetchSportsData = async () => {
    const sportsSnapshot = await getDocs(collection(db, "sportsCollection"));
    sportsOptions.value = sportsSnapshot.docs.map(doc => ({
        label: doc.id, value: doc.id, ...doc.data()
    }));
};


const updateCourtTypes = () => {
    const sportData = sportsOptions.value.find(s => s.value === selectedSport.value);
    courtTypes.value = sportData ? sportData.courtTypes : [];
    selectedCourtType.value = null; 
    courtNumbers.value = []; 
};


const updateCourtNumbers = () => {
    const sportData = sportsOptions.value.find(s => s.value === selectedSport.value);
    courtNumbers.value = sportData && selectedCourtType.value ? sportData.courts[selectedCourtType.value] : [];
};


const fetchAllBookings = async () => {
    const querySnapshot = await getDocs(collection(db, "courtBookings"));
    bookings.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


const filteredBookings = computed(() => {
    return bookings.value.filter(booking => {
        return (!selectedDate.value || booking.date === selectedDate.value) &&
            (!selectedSport.value || booking.sport === selectedSport.value) &&
            (!selectedCourtType.value || booking.courtType === selectedCourtType.value) &&
            (!selectedCourtNumber.value || booking.courtNumber === selectedCourtNumber.value);
    });
});


const resetFilters = () => {
    selectedDate.value = null;
    selectedSport.value = null;
    selectedCourtType.value = null;
    selectedCourtNumber.value = null;
};


const cancelBooking = async (bookingId) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
        await deleteDoc(doc(db, "courtBookings", bookingId));
        fetchAllBookings(); 
    }
};

onMounted(() => {
    fetchAllBookings();
    fetchSportsData();
});
</script>