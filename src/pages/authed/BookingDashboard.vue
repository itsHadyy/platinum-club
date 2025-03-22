<template>
    <q-page class="q-pa-md">

        <div class="text-subtitle1 text-bold q-mb-lg">Sports Booking</div>

        <div class="row justify-center q-gutter-md">
            <q-card class="q-pa-md col-5" clickable @click="openCourtDialog">
                <q-card-section class="text-center">
                    <q-icon name="sports_tennis" size="60px" />
                    <div class="text-h6">Courts</div>
                </q-card-section>
            </q-card>

            <q-card class="q-pa-md col-5" clickable @click="openAcademiesDialog">
                <q-card-section class="text-center">
                    <q-icon name="school" size="60px" />
                    <div class="text-h6">Academies</div>
                </q-card-section>
            </q-card>
        </div>

        <!-- My Bookings Button -->
        <div class="row justify-center q-mt-lg">
            <q-btn color="secondary" label="View My Bookings" @click="goToMyBookings" />
        </div>

        <!-- Dialog for selecting court type -->
        <CourtTypeDialog v-model="showCourtDialog" @selectCourt="handleCourtSelection" />
        <AcademyTypeDialog v-model="showAcademyDialog" @selectCourt="handleAcademySelection" />
    </q-page>
</template>

<script setup>
import { ref } from 'vue';
import CourtTypeDialog from 'src/components/dialogs/CourtTypeDialog.vue';
import AcademyTypeDialog from 'src/components/dialogs/AcademyTypeDialog.vue';
import { useRouter } from 'vue-router';

const showCourtDialog = ref(false);
const showAcademyDialog = ref(false);
const router = useRouter();

const openCourtDialog = () => {
    showCourtDialog.value = true;
};

const openAcademiesDialog = () => {
    showAcademyDialog.value = true;
};

const handleCourtSelection = (courtType) => {
    showCourtDialog.value = false;
    router.push(`/booking/court/${courtType}`);
};

const handleAcademySelection = (courtType) => {
    showCourtDialog.value = false;
    router.push(`/booking/academy/${courtType}`);
};

const goToMyBookings = () => {
    router.push('/my-bookings');
};
</script>

<style>
.q-card {
    cursor: pointer;
}
</style>