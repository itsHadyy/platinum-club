<template>
    <q-page class="q-pa-md">

        <q-card-section class="header flex">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-toolbar-title>Academies for {{ selectedSport }}</q-toolbar-title>
        </q-card-section>

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

            <div v-else class="text-center q-mt-md text-grey">
                No academies available for this sport.
            </div>

        </q-card>
    </q-page>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import { useAcademyStore } from "stores/academyStore";

const route = useRoute();
const router = useRouter();
const academyStore = useAcademyStore();
const selectedSport = route.params.sport;

// Get academies that offer the selected sport
const filteredAcademies = computed(() => academyStore.getAcademiesBySport(selectedSport));

// Navigate to academy details page
const goToAcademy = (academyId) => {
    router.push(`/academy/${academyId}`);
};
</script>