<template>
    <q-page class="q-pa-md">
        <q-card-section class="header flex">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-toolbar-title>{{ academy?.name }}</q-toolbar-title>
        </q-card-section>

        <!-- Academy Details -->
        <q-card v-if="academy" class="q-pa-md">
            <q-card-section>
                <div class="text-h5">{{ academy.name }}</div>
                <div class="text-subtitle1 text-grey">{{ academy.location }}</div>
            </q-card-section>

            <q-separator />

            <q-card-section>
                <q-list>
                    <q-item v-for="program in academy.programs" :key="program.id">
                        <q-item-section>
                            <q-item-label class="text-bold">{{ program.name }}</q-item-label>
                            <q-item-label caption>Price: {{ program.price }} EGP</q-item-label>
                            <q-item-label caption>Duration: {{ program.duration }}</q-item-label>
                            <q-item-label caption>Schedule: {{ program.schedule }}</q-item-label>
                            <q-item-label caption>Age Group: {{ program.ageGroup }}</q-item-label>
                            <q-item-label caption>
                                Coach:
                                <span class="text-primary">
                                    {{ getCoach(program.coachId)?.name }} ({{ getCoach(program.coachId)?.experience }}
                                    experience)
                                </span>
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>

            <q-separator />

            <!-- Booking Button -->
            <q-card-section>
                <q-btn color="secondary" class="full-width" @click="showBookingDialog = true">
                    Book a Session
                </q-btn>
            </q-card-section>
        </q-card>

        <!-- Show Message if Academy Not Found -->
        <div v-else class="text-center text-grey q-mt-md">
            Academy not found.
        </div>

        <q-dialog v-model="showBookingDialog">
            <q-card class="q-pa-md">
                <q-card-section class="text-h6">Select a Program</q-card-section>
                <q-card-section>
                    <q-btn v-for="program in academy.programs" :key="program.id" class="full-width q-mb-md"
                        color="secondary" @click="bookSlot(program)">
                        {{ program.name }} - {{ program.schedule }} ({{ getCoach(program.coachId)?.name }})
                    </q-btn>
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { useRoute } from "vue-router";
import { computed, ref } from "vue";
import { useAcademyStore } from "stores/academyStore";

const route = useRoute();
const academyStore = useAcademyStore();
const showBookingDialog = ref(false);

const academy = computed(() => {
    return academyStore.academies.find(a => a.id === parseInt(route.params.id));
});

const getCoach = (coachId) => {
    return academy.value.coaches.find(c => c.id === coachId) || {};
};

// Function to book a time slot
const bookSlot = (slot) => {
    alert(`You have booked a session at ${academy.value.name} for ${slot}`);
    showBookingDialog.value = false;
};
</script>