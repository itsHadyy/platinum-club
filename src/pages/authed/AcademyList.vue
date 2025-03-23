<template>
    <q-page class="q-pa-md">
        <!-- Header with Back Button -->
        <q-card-section class="header flex">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-toolbar-title>Academies for {{ selectedSport }}</q-toolbar-title>
        </q-card-section>

        <!-- List of Academies Offering the Selected Sport -->
        <q-card>
            <q-list v-if="filteredAcademies.length">
                <q-item v-for="academy in filteredAcademies" :key="academy.id" clickable v-ripple
                    @click="goToAcademy(academy.id)">
                    <q-item-section class="q-pb-md">
                        <q-item-label class="text-h6">{{ academy.name }}</q-item-label>
                        <q-item-label caption>{{ academy.location }}</q-item-label>
                        <q-separator />
                    </q-item-section>
                </q-item>
            </q-list>

            <!-- Show Message if No Academies Are Available -->
            <div v-else class="text-center q-mt-md text-grey">
                No academies available for this sport.
            </div>
        </q-card>
    </q-page>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted } from "vue";
import { useAcademiesStore } from "stores/academyStore";

const route = useRoute();
const router = useRouter();
const academyStore = useAcademiesStore();

const selectedSport = route.params.sport;

// Fetch academies when the component is mounted
onMounted(() => {
    console.log("Fetching academies..."); // Debugging log
    academyStore.fetchAcademies().then(() => {
        console.log("Academies fetched:", academyStore.academyOptions); // Debugging log
    });
});

// Filter academies that offer the selected sport
const filteredAcademies = computed(() => {
    console.log("Filtering academies for sport:", selectedSport); // Debugging log
    const result = academyStore.getAcademiesBySport(selectedSport);
    console.log("Filtered Academies:", result); // Debugging log
    return result;
});

// Navigate to the academy details page
const goToAcademy = (academyId) => {
    router.push(`/academy/${academyId}`);
};
</script>