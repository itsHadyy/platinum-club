<template>
    <q-page class="q-pa-md">
        <!-- Header with Back Button -->
        <q-card-section class="header flex">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-toolbar-title>{{ academy?.name }}</q-toolbar-title>
        </q-card-section>

        <!-- Academy Details -->
        <q-card v-if="academy" class="q-pa-md">
            <q-card-section>
                <div class="text-h5">{{ academy.name }}</div>
                <div class="text-subtitle1 text-grey">{{ academy.location }}</div>
                <div class="text-subtitle1 text-grey">Email: {{ academy.email }}</div>
                <div class="text-subtitle1 text-grey">Phone: {{ academy.phone }}</div>
                <div class="text-subtitle1 text-grey">Website: <a :href="academy.website" target="_blank">{{
                        academy.website }}</a></div>
            </q-card-section>

            <q-separator />

            <!-- Programs List -->
            <q-card-section>
                <q-list>
                    <q-item v-for="program in academy.programs" :key="program.name">
                        <q-item-section>
                            <q-item-label class="text-bold">{{ program.name }}</q-item-label>
                            <q-item-label caption>Sport: {{ program.sport }}</q-item-label>
                            <q-item-label caption>
                                Schedule:
                                <ul>
                                    <li v-for="session in program.schedule" :key="session.day">
                                        {{ session.day }} at {{ session.time }}
                                    </li>
                                </ul>
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>

            <q-separator />

            <!-- Coaches List -->
            <q-card-section>
                <div class="text-h6">Coaches</div>
                <q-list>
                    <q-item v-for="coach in academy.coaches" :key="coach.name">
                        <q-item-section>
                            <q-item-label class="text-bold">{{ coach.name }}</q-item-label>
                            <q-item-label caption>Experience: {{ coach.experience }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>
        </q-card>

        <!-- Show Message if Academy Not Found -->
        <div v-else class="text-center text-grey q-mt-md">
            Academy not found.
        </div>
    </q-page>
</template>

<script setup>
import { useRoute } from "vue-router";
import { computed, onMounted } from "vue";
import { useAcademiesStore } from "stores/academyStore";

const route = useRoute();
const academyStore = useAcademiesStore();

// Fetch academy details when the component is mounted
onMounted(() => {
    academyStore.fetchAcademyById(route.params.id);
});

// Get the selected academy
const academy = computed(() => academyStore.selectedAcademy);
</script>