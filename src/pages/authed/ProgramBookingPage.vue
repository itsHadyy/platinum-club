<template>
    <q-page class="q-pa-md">
        <!-- Header with Back Button -->
        <div class="flex items-center q-mb-md">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <div class="text-h5 q-ml-md">Book {{ props.program.name }}</div>
        </div>

        <!-- Program Details Card -->
        <q-card class="q-mb-md">
            <q-card-section>
                <div class="text-h6">{{ props.program.name }}</div>
                <div class="text-subtitle1">{{ props.program.sport }} Program</div>

                <q-separator class="q-my-md" />

                <div class="row q-col-gutter-md">
                    <!-- Left Column - Program Info -->
                    <div class="col-md-6">
                        <div class="text-subtitle2 q-mb-sm">Program Details</div>

                        <div class="q-mb-sm row items-center">
                            <q-icon name="event" class="q-mr-sm" />
                            <div>
                                <strong>Duration:</strong> {{ formatDuration(props.program) }}
                            </div>
                        </div>

                        <div class="q-mb-sm row items-center">
                            <q-icon name="people" class="q-mr-sm" />
                            <div>
                                <strong>Coaches:</strong> {{ props.program.coaches.join(', ') }}
                            </div>
                        </div>

                        <div class="q-mb-sm row items-center">
                            <q-icon name="attach_money" class="q-mr-sm" />
                            <div>
                                <strong>Price:</strong> ${{ props.program.price.toLocaleString() }}
                                <span v-if="props.program.durationWeeks > 1" class="text-caption">
                                    ({{ calculateWeeklyRate(props.program) }} per week)
                                </span>
                            </div>
                        </div>

                        <div class="q-mb-sm row items-center">
                            <q-icon name="child_care" class="q-mr-sm" />
                            <div>
                                <strong>Age Group:</strong> {{ props.program.ageGroup }}
                            </div>
                        </div>

                        <div class="q-mb-sm">
                            <div class="row items-center">
                                <q-icon name="schedule" class="q-mr-sm" />
                                <strong>Schedule:</strong>
                            </div>
                            <ul class="q-pl-md q-mt-xs">
                                <li v-for="(session, idx) in props.program.schedule" :key="idx">
                                    {{ session.day }} at {{ session.time }}
                                    <span v-if="session.location" class="text-caption"> ({{ session.location }})</span>
                                </li>
                            </ul>
                        </div>

                        <div v-if="props.program.description" class="q-mt-md">
                            <strong>Description:</strong>
                            <p class="q-mt-xs">{{ props.program.description }}</p>
                        </div>
                    </div>

                    <!-- Right Column - Booking Confirmation -->
                    <div class="col-md-6">
                        <div class="text-subtitle2 q-mb-sm">Booking Information</div>

                        <q-list bordered separator class="q-mb-md">
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Program</q-item-label>
                                    <q-item-label caption>{{ props.program.name }}</q-item-label>
                                </q-item-section>
                            </q-item>

                            <q-item>
                                <q-item-section>
                                    <q-item-label>Duration</q-item-label>
                                    <q-item-label caption>{{ formatCompactDuration(props.program) }}</q-item-label>
                                </q-item-section>
                            </q-item>

                            <q-item>
                                <q-item-section>
                                    <q-item-label>Total Price</q-item-label>
                                    <q-item-label caption>${{ props.program.price.toLocaleString() }}</q-item-label>
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

                        <q-select v-if="props.program.levels" v-model="selectedLevel" :options="props.program.levels"
                            label="Skill Level" outlined class="q-mt-md" />

                        <!-- Emergency Contact -->
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

                        <!-- Terms Acceptance -->
                        <q-checkbox v-model="acceptedTerms" label="I agree to the terms and conditions"
                            class="q-mt-md" />

                        <!-- Payment Options -->
                        <div class="text-subtitle2 q-mt-md">Payment Method</div>
                        <q-option-group v-model="paymentMethod" :options="paymentOptions" color="primary" inline />

                        <!-- Booking Button -->
                        <q-btn color="primary" label="Confirm Booking" @click="confirmBooking" :disable="!isFormValid"
                            class="full-width q-mt-md" :loading="isProcessing" />
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <!-- Academy Contact Info -->
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
import { useQuasar } from 'quasar';

const props = defineProps({
    program: {
        type: Object,
        required: true,
        default: () => ({
            name: '',
            sport: '',
            coaches: [],
            schedule: [],
            startDate: '',
            durationWeeks: 0,
            price: 0,
            ageGroup: '',
            description: '',
            levels: []
        })
    }
});

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const academyStore = useAcademiesStore();
const authStore = useAuthStore();

// Form data
const participantName = ref(authStore.user?.displayName || '');
const participantEmail = ref(authStore.user?.email || '');
const participantPhone = ref('');
const participantAge = ref(null);
const emergencyContactName = ref('');
const emergencyContactPhone = ref('');
const selectedLevel = ref(null);
const acceptedTerms = ref(false);
const paymentMethod = ref('credit');
const isProcessing = ref(false);

// Payment options
const paymentOptions = [
    { label: 'Credit Card', value: 'credit' },
    { label: 'Bank Transfer', value: 'bank' },
    { label: 'Pay on Arrival', value: 'cash' }
];

// Date formatting functions
const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
        return 'Invalid date';
    }
};

const formatDateWithoutYear = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
        return 'Invalid date';
    }
};

// Program duration formatting
const formatDuration = (program) => {
    if (!program.startDate || !program.durationWeeks) return "Dates not available";

    const startFormatted = formatDate(program.startDate);
    const endDate = calculateEndDate(program.startDate, program.durationWeeks);
    const endFormatted = formatDate(endDate);

    return `${startFormatted} to ${endFormatted} (${program.durationWeeks} week${program.durationWeeks > 1 ? 's' : ''})`;
};

const formatCompactDuration = (program) => {
    if (!program.startDate || !program.durationWeeks) return "Dates not available";

    const startFormatted = formatDateWithoutYear(program.startDate);
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

const calculateWeeklyRate = (program) => {
    if (!program.durationWeeks || program.durationWeeks <= 0) return '0.00';
    return (program.price / program.durationWeeks).toFixed(2);
};

// Age options for dropdown
const ageOptions = computed(() => {
    const range = props.program.ageGroup.match(/\d+/g);
    if (!range || range.length < 2) return [];

    const min = parseInt(range[0]);
    const max = parseInt(range[1]);
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
});

// Get current academy data
const currentAcademy = computed(() =>
    academyStore.academyOptions.find(a => a.id === route.params.academyId) || {}
);

// Email validation
const isValidEmail = (val) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(val) || 'Invalid email';
};

// Form validation
const isFormValid = computed(() =>
    participantName.value.trim().length > 0 &&
    participantEmail.value.trim().length > 0 &&
    isValidEmail(participantEmail.value) === true &&
    participantPhone.value.trim().length > 0 &&
    participantAge.value !== null &&
    acceptedTerms.value
);

// Booking confirmation
const confirmBooking = async () => {
    try {
        isProcessing.value = true;

        const endDate = calculateEndDate(props.program.startDate, props.program.durationWeeks);
        if (!endDate && props.program.durationWeeks > 0) {
            throw new Error("Invalid program dates");
        }

        const bookingData = {
            academyId: route.params.academyId,
            academyName: currentAcademy.value.id,
            programId: route.params.programId,
            programName: props.program.name,
            sport: props.program.sport,
            startDate: props.program.startDate,
            endDate: endDate,
            price: props.program.price,
            participantName: participantName.value,
            participantEmail: participantEmail.value,
            participantPhone: participantPhone.value,
            participantAge: participantAge.value,
            emergencyContactName: emergencyContactName.value,
            emergencyContactPhone: emergencyContactPhone.value,
            skillLevel: selectedLevel.value,
            paymentMethod: paymentMethod.value,
            userId: authStore.user?.uid,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };

        await academyStore.createBooking(bookingData);

        $q.notify({
            type: 'positive',
            message: 'Booking confirmed!',
            position: 'top',
            timeout: 3000
        });

        router.push('/my-bookings');

    } catch (error) {
        $q.notify({
            type: 'negative',
            message: 'Booking failed',
            caption: error.message,
            position: 'top'
        });
    } finally {
        isProcessing.value = false;
    }
};

onMounted(() => {
    if (!props.program.name) {
        router.replace('/sports');
    }
});
</script>

<style scoped>
.q-card {
    border-radius: 8px;
}

.q-item__label--caption {
    white-space: normal;
}

.q-field {
    margin-bottom: 16px;
}
</style>