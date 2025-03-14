<template>
    <q-page class="q-pa-md">

        <div class="text-subtitle1 text-bold q-mb-lg">Sports Booking</div>

        <div class="row justify-center q-gutter-md">
            <q-card class="q-pa-md col-5" clickable @click="openCourtDialog">
                <q-card-section class="text-center">
                    <q-icon name="sports_tennis" size="60px" />
                    <div class="text-h6">Book a Court</div>
                </q-card-section>
            </q-card>

            <q-card class="q-pa-md col-5" clickable>
                <q-card-section class="text-center">
                    <q-icon name="school" size="60px" />
                    <div class="text-h6">Book an Academy</div>
                </q-card-section>
            </q-card>
        </div>

        <!-- Dialog for selecting court type -->
        <CourtTypeDialog v-model="showCourtDialog" @selectCourt="handleCourtSelection" />
    </q-page>
</template>

<script setup>
import { ref } from 'vue';
import CourtTypeDialog from 'src/components/dialogs/CourtTypeDialog.vue';
import { useRouter } from 'vue-router';

const showCourtDialog = ref(false);

const openCourtDialog = () => {
    showCourtDialog.value = true;
};

const router = useRouter();

const handleCourtSelection = (courtType) => {
    showCourtDialog.value = false;
    router.push(`/booking/court/${courtType}`);
};

</script>

<style>
.q-card {
    cursor: pointer;
}
</style>