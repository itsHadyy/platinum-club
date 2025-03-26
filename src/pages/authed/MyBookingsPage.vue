<template>
    <q-page class="q-pa-md">
        <q-bar class="bg-white text-dark">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
        </q-bar>

        <!-- Page Title -->
        <div class="text-h6 q-mb-lg text-bold">My Bookings</div>

        <!-- Booking Type Tabs -->
        <q-tabs v-model="activeTab" dense class="text-secondary q-mb-md" active-color="secondary"
            indicator-color="secondary" align="justify" narrow-indicator>
            <q-tab name="courts" label="Court Bookings" />
            <q-tab name="programs" label="Program Bookings" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
            <!-- Court Bookings Panel -->
            <q-tab-panel name="courts">
                <!-- Filters -->
                <q-card flat bordered class="q-pa-md q-mb-md">
                    <q-form @submit="applyFilters">
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <q-input v-model="filters.date" label="Filter by Date" type="date" outlined dense />
                            </div>
                            <div class="col-12 col-md-6">
                                <q-select v-model="filters.sport" :options="sportOptions" label="Filter by Sport"
                                    outlined dense />
                            </div>
                        </div>
                        <div class="flex justify-center q-mt-md">
                            <q-btn label="Apply Filters" color="secondary" type="submit" />
                        </div>
                    </q-form>
                </q-card>

                <!-- Loading State -->
                <q-inner-loading :showing="loading">
                    <q-spinner size="50px" color="primary" />
                </q-inner-loading>

                <!-- Upcoming Court Bookings -->
                <div v-if="upcomingCourtBookings.length">
                    <div class="text-h6 text-bold q-mb-md">Upcoming Court Bookings</div>
                    <q-list separator>
                        <q-card v-for="booking in upcomingCourtBookings" :key="booking.id" class="q-mb-md">
                            <q-card-section>
                                <div class="text-h6 text-secondary">{{ formatDate(booking.date) }}</div>
                                <q-badge color="positive" class="q-mt-sm">Upcoming</q-badge>
                            </q-card-section>
                            <q-card-section>
                                <p><strong>Sport:</strong> {{ booking.sport }}</p>
                                <p><strong>Court:</strong> {{ booking.court }}</p>
                                <p><strong>Price:</strong> {{ formatPrice(booking.price) }}</p>
                                <p>
                                    <strong>Time Slots: </strong>
                                    <span v-if="booking.slots?.length">{{ booking.slots.join(", ") }}</span>
                                    <span v-else class="text-grey">No slots selected</span>
                                </p>
                            </q-card-section>
                            <q-card-actions align="right">
                                <q-btn color="negative" dense
                                    @click="cancelBooking(booking.id, 'courtBookings')">Cancel</q-btn>
                            </q-card-actions>
                        </q-card>
                    </q-list>
                </div>

                <!-- Past Court Bookings -->
                <div v-if="pastCourtBookings.length">
                    <div class="text-h6 text-bold q-mb-md q-mt-md">Past Court Bookings</div>
                    <q-list separator>
                        <q-card v-for="booking in pastCourtBookings" :key="booking.id" class="q-mb-md">
                            <q-card-section>
                                <div class="text-h6 text-grey">{{ formatDate(booking.date) }}</div>
                                <q-badge color="negative" class="q-mt-sm">Past</q-badge>
                            </q-card-section>
                            <q-card-section>
                                <p><strong>Sport:</strong> {{ booking.sport }}</p>
                                <p><strong>Court:</strong> {{ booking.court }}</p>
                                <p><strong>Price:</strong> {{ formatPrice(booking.price) }}</p>
                                <p>
                                    <strong>Time Slots: </strong>
                                    <span v-if="booking.slots?.length">{{ booking.slots.join(", ") }}</span>
                                    <span v-else class="text-grey">No slots selected</span>
                                </p>
                            </q-card-section>
                        </q-card>
                    </q-list>
                </div>

                <!-- Empty State -->
                <div v-if="!loading && !upcomingCourtBookings.length && !pastCourtBookings.length"
                    class="text-center text-grey q-mt-lg">
                    <q-icon name="event_busy" size="48px" />
                    <div class="q-mt-md">No court bookings found.</div>
                </div>
            </q-tab-panel>

            <!-- Program Bookings Panel -->
            <q-tab-panel name="programs">
                <!-- Filters -->
                <q-card flat bordered class="q-pa-md q-mb-md">
                    <q-form @submit="applyFilters">
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <q-input v-model="filters.programDate" label="Filter by Start Date" type="date" outlined
                                    dense />
                            </div>
                            <div class="col-12 col-md-6">
                                <q-select v-model="filters.programSport" :options="sportOptions" label="Filter by Sport"
                                    outlined dense />
                            </div>
                        </div>
                        <div class="flex justify-center q-mt-md">
                            <q-btn label="Apply Filters" color="secondary" type="submit" />
                        </div>
                    </q-form>
                </q-card>

                <!-- Loading State -->
                <q-inner-loading :showing="loading">
                    <q-spinner size="50px" color="primary" />
                </q-inner-loading>

                <!-- Upcoming Program Bookings -->
                <div v-if="upcomingProgramBookings.length">
                    <div class="text-h6 text-bold q-mb-md">Upcoming Program Bookings</div>
                    <q-list separator>
                        <q-card v-for="booking in upcomingProgramBookings" :key="booking.id" class="q-mb-md">
                            <q-card-section>
                                <div class="text-h6 text-secondary">{{ booking.programName }}</div>
                                <q-badge color="positive" class="q-mt-sm">Upcoming</q-badge>
                            </q-card-section>
                            <q-card-section>
                                <div class="row q-col-gutter-md">
                                    <div class="col-12 col-md-6">
                                        <p><strong>Sport:</strong> {{ booking.sport }}</p>
                                        <p><strong>Academy:</strong> {{ booking.academyName }}</p>
                                        <p><strong>Start Date:</strong> {{ formatDate(booking.startDate) }}</p>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <p><strong>Duration:</strong> {{ booking.durationWeeks }} weeks</p>
                                        <p><strong>Price:</strong> {{ formatPrice(booking.price) }}</p>
                                        <p><strong>Age Group:</strong> {{ booking.ageGroup }}</p>
                                    </div>
                                </div>
                                <div v-if="booking.schedule?.length" class="q-mt-md">
                                    <p class="text-bold">Schedule:</p>
                                    <ul>
                                        <li v-for="(session, idx) in booking.schedule" :key="idx">
                                            {{ session.day }} at {{ session.time }}
                                        </li>
                                    </ul>
                                </div>
                            </q-card-section>
                            <q-card-actions align="right">
                                <q-btn color="negative" dense
                                    @click="cancelBooking(booking.id, 'bookings')">Cancel</q-btn>
                            </q-card-actions>
                        </q-card>
                    </q-list>
                </div>

                <!-- Past Program Bookings -->
                <div v-if="pastProgramBookings.length">
                    <div class="text-h6 text-bold q-mb-md q-mt-md">Past Program Bookings</div>
                    <q-list separator>
                        <q-card v-for="booking in pastProgramBookings" :key="booking.id" class="q-mb-md">
                            <q-card-section>
                                <div class="text-h6 text-grey">{{ booking.programName }}</div>
                                <q-badge color="negative" class="q-mt-sm">Completed</q-badge>
                            </q-card-section>
                            <q-card-section>
                                <div class="row q-col-gutter-md">
                                    <div class="col-12 col-md-6">
                                        <p><strong>Sport:</strong> {{ booking.sport }}</p>
                                        <p><strong>Academy:</strong> {{ booking.academyName }}</p>
                                        <p><strong>Start Date:</strong> {{ formatDate(booking.startDate) }}</p>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <p><strong>Duration:</strong> {{ booking.durationWeeks }} weeks</p>
                                        <p><strong>Price:</strong> {{ formatPrice(booking.price) }}</p>
                                        <p><strong>Age Group:</strong> {{ booking.ageGroup }}</p>
                                    </div>
                                </div>
                                <div v-if="booking.schedule?.length" class="q-mt-md">
                                    <p class="text-bold">Schedule:</p>
                                    <ul>
                                        <li v-for="(session, idx) in booking.schedule" :key="idx">
                                            {{ session.day }} at {{ session.time }}
                                        </li>
                                    </ul>
                                </div>
                            </q-card-section>
                        </q-card>
                    </q-list>
                </div>

                <!-- Empty State -->
                <div v-if="!loading && !upcomingProgramBookings.length && !pastProgramBookings.length"
                    class="text-center text-grey q-mt-lg">
                    <q-icon name="event_busy" size="48px" />
                    <div class="q-mt-md">No program bookings found.</div>
                </div>
            </q-tab-panel>
        </q-tab-panels>
    </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from 'boot/firebase';
import { useAuthStore } from "src/stores/useAuthStore";

const authStore = useAuthStore();
const loading = ref(true);
const activeTab = ref('courts'); // Default to courts tab
const courtBookings = ref([]);
const programBookings = ref([]);

const filters = ref({
    date: "",
    sport: null,
    programDate: "",
    programSport: null
});

const sportOptions = ref(["Basketball", "Tennis", "Football", "Volleyball"]);

const fetchBookings = async () => {
    loading.value = true;
    try {
        // Fetch court bookings
        const courtQuery = query(
            collection(db, 'courtBookings'),
            where('userId', '==', authStore.user.uid)
        );
        const courtSnapshot = await getDocs(courtQuery);
        courtBookings.value = courtSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Fetch program bookings with error handling
        const programQuery = query(
            collection(db, 'bookings'),
            where('userId', '==', authStore.user.uid)
        );

        try {
            const programSnapshot = await getDocs(programQuery);
            if (programSnapshot.empty) {
                console.warn('No program bookings found for user');
            } else {
                programBookings.value = programSnapshot.docs.map(doc => {
                    const data = doc.data();
                    console.log('Raw booking data:', data); // Debug each document
                    return {
                        id: doc.id,
                        programName: data.programName || 'Unnamed Program',
                        sport: data.sport || 'General',
                        academyName: data.academyName || 'Unknown Academy',
                        startDate: data.startDate || null,
                        durationWeeks: data.durationWeeks || 0,
                        price: data.price || 0,
                        ageGroup: data.ageGroup || 'Not specified',
                        schedule: data.schedule || [],
                        // Include any other required fields
                    };
                });
            }
        } catch (error) {
            console.error('Error fetching program bookings:', error);
        }
    } catch (error) {
        console.error("Error fetching bookings:", error);
    } finally {
        loading.value = false;
    }
};

// Computed properties for court bookings
const upcomingCourtBookings = computed(() => {
    return courtBookings.value.filter(booking => new Date(booking.date) >= new Date());
});

const pastCourtBookings = computed(() => {
    return courtBookings.value.filter(booking => new Date(booking.date) < new Date());
});

// Computed properties for program bookings
const upcomingProgramBookings = computed(() => {
    return programBookings.value.filter(booking => {
        const endDate = new Date(booking.startDate);
        endDate.setDate(endDate.getDate() + (booking.durationWeeks * 7));
        return endDate >= new Date();
    });
});

const pastProgramBookings = computed(() => {
    return programBookings.value.filter(booking => {
        const endDate = new Date(booking.startDate);
        endDate.setDate(endDate.getDate() + (booking.durationWeeks * 7));
        return endDate < new Date();
    });
});

const cancelBooking = async (bookingId, collectionName) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
        try {
            await deleteDoc(doc(db, collectionName, bookingId));
            await fetchBookings();
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

const applyFilters = () => {
    // Implement your filter logic here
    console.log('Applying filters:', filters.value);
};

onMounted(fetchBookings);
</script>