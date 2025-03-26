<template>
    <q-page class="q-pa-md">
        <div class="flex items-center q-mb-md">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <div class="text-h5 q-ml-md">Book {{ program.name }}</div>
        </div>

        <q-card class="q-mb-md">
            <q-card-section>
                <div class="text-h6">{{ program.name }}</div>
                <div class="text-subtitle1">{{ program.sport }} Program</div>

                <q-separator class="q-my-md" />

                <div class="row q-col-gutter-md">
                    <div class="col-md-6">
                        <div class="text-subtitle2 q-mb-sm">Program Details</div>

                        <div class="q-mb-sm row items-center">
                            <q-icon name="event" class="q-mr-sm" />
                            <div>
                                <strong>Duration:</strong> {{ formatDuration(program) }}
                            </div>
                        </div>

                        <div class="q-mb-sm row items-center">
                            <q-icon name="people" class="q-mr-sm" />
                            <div>
                                <strong>Coaches:</strong> {{ program.coaches.join(', ') }}
                            </div>
                        </div>

                        <div class="q-mb-sm row items-center">
                            <q-icon name="child_care" class="q-mr-sm" />
                            <div>
                                <strong>Age Group:</strong> {{ program.ageGroup }}
                            </div>
                        </div>

                        <div class="q-mb-sm">
                            <div class="row items-center">
                                <q-icon name="schedule" class="q-mr-sm" />
                                <strong>Schedule:</strong>
                            </div>
                            <ul class="q-pl-md q-mt-xs">
                                <li v-for="(session, idx) in program.schedule" :key="idx">
                                    {{ session.day }} at {{ session.time }}
                                    <span v-if="session.location" class="text-caption"> ({{ session.location }})</span>
                                </li>
                            </ul>
                        </div>

                        <div v-if="program.description" class="q-mt-md">
                            <strong>Description:</strong>
                            <p class="q-mt-xs">{{ program.description }}</p>
                        </div>
                    </div>

                    <!-- Right Column - Booking Confirmation -->
                    <div class="col-md-6">
                        <div class="text-subtitle2 q-mb-sm">Booking Information</div>

                        <q-list bordered separator class="q-mb-md">
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Program</q-item-label>
                                    <q-item-label caption>{{ program.name }}</q-item-label>
                                </q-item-section>
                            </q-item>

                            <q-item>
                                <q-item-section>
                                    <q-item-label>Duration</q-item-label>
                                    <q-item-label caption>{{ formatCompactDuration(program) }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>

                        <!-- Participant Info -->
                        <q-input v-model="participantName" label="Participant Full Name" outlined class="q-mb-md"
                            :rules="[val => !!val || 'Name is required']" />

                        <div class="row q-col-gutter-md">
                            <div class="col-6">
                                <q-input v-model="participantEmail" label="Email" outlined type="email"
                                    :rules="[val => !!val || 'Email is required', isValidEmail]" />
                            </div>
                            <div class="col-6">
                                <q-input v-model="participantPhone" label="Phone" outlined mask="(###) ### - ####"
                                    :rules="[val => !!val || 'Phone is required']" />
                            </div>
                        </div>

                        <q-select v-model="participantAge" :options="ageOptions" label="Participant Age" outlined
                            class="q-mt-md" :rules="[val => !!val || 'Age is required']" />

                        <div class="text-subtitle2 q-mt-md">Emergency Contact</div>
                        <div class="row q-col-gutter-md">
                            <div class="col-6">
                                <q-input v-model="emergencyContactName" label="Name" outlined />
                            </div>
                            <div class="col-6">
                                <q-input v-model="emergencyContactPhone" label="Phone" outlined
                                    mask="(###) ### - ####" />
                            </div>
                        </div>

                        <q-checkbox v-model="acceptedTerms" label="I agree to the terms and conditions"
                            class="q-mt-md" />

                        <q-btn color="primary" label="Confirm Booking" @click="confirmBooking" :disable="!isFormValid"
                            class="full-width q-mt-md" :loading="isProcessing" />
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <q-card>
            <q-card-section>
                <div class="text-subtitle2">Academy Contact Information</div>
                <div class="q-mt-sm">
                    <q-icon name="phone" class="q-mr-sm" />
                    {{ currentAcademy.phone }}
                </div>
                <div>
                    <q-icon name="email" class="q-mr-sm" />
                    {{ currentAcademy.email }}
                </div>
                <div v-if="currentAcademy.address" class="q-mt-sm">
                    <q-icon name="location_on" class="q-mr-sm" />
                    {{ currentAcademy.address }}
                </div>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAcademiesStore } from 'stores/academyStore';
import { useAuthStore } from 'stores/useAuthStore';

const route = useRoute();
const router = useRouter();
const academyStore = useAcademiesStore();
const authStore = useAuthStore();

const program = ref({
    name: '',
    sport: '',
    coaches: [],
    schedule: [],
    startDate: '',
    durationWeeks: 0,
    ageGroup: '',
    description: '',
    levels: []
});

// Form data
const participantName = ref(authStore.user?.displayName || '');
const participantEmail = ref(authStore.user?.email || '');
const participantPhone = ref('');
const participantAge = ref(null);
const emergencyContactName = ref('');
const emergencyContactPhone = ref('');
const acceptedTerms = ref(false);
const isProcessing = ref(false);

// Initialize program data from route
onMounted(() => {
    if (route.query.programName) {
        program.value = {
            name: route.query.programName || '',
            sport: route.query.sport || '',
            coaches: route.query.coaches?.split(',') || [],
            schedule: tryParseJson(route.query.schedule) || [],
            startDate: route.query.startDate || '',
            durationWeeks: parseInt(route.query.durationWeeks) || 0,
            ageGroup: route.query.ageGroup || '',
            description: route.query.description || '',
            levels: tryParseJson(route.query.levels) || []
        };
    } else {
        alert('Program information missing');
        router.replace('/sports');
    }
});

// Helper function to safely parse JSON
const tryParseJson = (jsonString) => {
    try {
        return jsonString ? JSON.parse(jsonString) : [];
    } catch {
        return [];
    }
};

// Simple alert functions
const showSuccess = (message) => {
    alert(`✅ Success: ${message}`);
};

const showError = (message, caption = '') => {
    alert(`❌ Error: ${message} ${caption ? `\n\nDetails: ${caption}` : ''}`);
};

// Date formatting
const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
        return 'Invalid date';
    }
};

const formatCompactDuration = (program) => {
    if (!program.startDate || !program.durationWeeks) return "Dates not available";

    const startFormatted = formatDate(program.startDate);
    const endDate = calculateEndDate(program.startDate, program.durationWeeks);
    const endFormatted = formatDate(endDate);

    return `${startFormatted} - ${endFormatted}`;
};

const calculateEndDate = (startDate, weeks) => {
    if (!startDate || !weeks) return null;
    try {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (weeks * 7));
        return date.toISOString();
    } catch {
        return null;
    }
};

const ageOptions = computed(() => {
    const range = program.value.ageGroup.match(/\d+/g);
    if (!range || range.length < 2) return [];

    const min = parseInt(range[0]);
    const max = parseInt(range[1]);
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
});

const currentAcademy = computed(() =>
    academyStore.academyOptions.find(a => a.id === route.params.academyId) || {}
);

const isValidEmail = (val) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(val) || 'Invalid email';
};

const isFormValid = computed(() =>
    participantName.value.trim().length > 0 &&
    participantEmail.value.trim().length > 0 &&
    isValidEmail(participantEmail.value) === true &&
    participantPhone.value.trim().length > 0 &&
    participantAge.value !== null &&
    acceptedTerms.value
);

const formatDuration = (program) => {
    if (!program.startDate || !program.durationWeeks) return "Dates not available";

    const startFormatted = formatDate(program.startDate);
    const endDate = calculateEndDate(program.startDate, program.durationWeeks);
    const endFormatted = formatDate(endDate);

    return `${startFormatted} to ${endFormatted} (${program.durationWeeks} weeks)`;
};

const confirmBooking = async () => {
    try {
        isProcessing.value = true;

        // Validate required program data
        if (!program.value?.startDate || !program.value?.durationWeeks) {
            throw new Error("Program dates are incomplete");
        }

        const endDate = calculateEndDate(program.value.startDate, program.value.durationWeeks);
        if (!endDate && program.value.durationWeeks > 0) {
            throw new Error("Invalid program dates");
        }

        // Verify participant info is complete
        if (!participantName.value || !participantEmail.value || !participantPhone.value) {
            throw new Error("Please complete all participant information");
        }

        // Prepare booking data with required fields
        const bookingData = {
            academyId: route.params.academyId,
            academyName: currentAcademy.value?.academyId || 'Unknown Academy',
            programId: route.params.programId,
            programName: program.value?.name || 'Unnamed Program',
            sport: program.value?.sport || 'General',
            startDate: program.value.startDate,
            endDate: endDate,
            participantName: participantName.value,
            participantEmail: participantEmail.value,
            participantPhone: participantPhone.value,
            participantAge: participantAge.value || null,
            emergencyContactName: emergencyContactName.value || participantName.value,
            emergencyContactPhone: emergencyContactPhone.value || participantPhone.value,
            userId: authStore.user?.uid
        };

        // Final validation
        if (!bookingData.userId) {
            throw new Error("You must be logged in to book a program");
        }

        await academyStore.createBooking(bookingData);
        showSuccess('Your booking has been confirmed!');
        router.push('/my-bookings');

    } catch (error) {
        showError('Failed to complete booking', error.message);
    } finally {
        isProcessing.value = false;
    }
};
</script>

<style scoped>
.q-card {
    border-radius: 8px;
    cursor: auto;
}

.q-item__label--caption {
    white-space: normal;
}

.q-field {
    margin-bottom: 16px;
}
</style>