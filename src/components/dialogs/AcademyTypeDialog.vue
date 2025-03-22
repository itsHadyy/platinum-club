<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
        <q-card class="q-pa-md">
            <!-- Top Bar -->
            <q-bar class="bg-white text-dark">
                <q-btn flat round dense icon="close" @click="$emit('update:modelValue', false)" />
                <q-space />
            </q-bar>

            <!-- Title -->
            <q-card-section class="text-h6 q-mt-md q-ml-md">
                Select a Sport
            </q-card-section>

            <!-- List of Available Sports -->
            <q-card-section>
                <q-btn v-for="sport in availableSports" :key="sport" class="full-width q-mb-md" color="secondary"
                    @click="goToAcademies(sport)">
                    {{ sport }}
                </q-btn>

                <!-- Show Message if No Sports Are Available -->
                <div v-if="availableSports.length === 0" class="text-center text-grey q-mt-md">
                    No sports available at the moment.
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useAcademyStore } from "stores/academyStore";

defineProps({
    modelValue: Boolean
});

const emit = defineEmits(["update:modelValue"]);
const router = useRouter();
const academyStore = useAcademyStore();

// Dynamically filter sports based on academy availability
const availableSports = computed(() => {
    // Get all unique sports from the academies
    const sportsSet = new Set();
    academyStore.academies.forEach(academy => {
        academy.sportsOffered.forEach(sport => sportsSet.add(sport));
    });
    return Array.from(sportsSet);
});

// Navigate to academies page for selected sport
const goToAcademies = (sport) => {
    emit("update:modelValue", false); // Close the dialog
    router.push(`/academies/${sport}`);
};
</script>