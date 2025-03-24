<template>
    <q-page class="q-pa-md">
        <!-- Header with Back Button -->
        <q-card-section class="header flex">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-toolbar-title>Academies for {{ selectedSport }}</q-toolbar-title>
        </q-card-section>

        <!-- List of Academies Offering the Selected Sport -->
        <div class="q-gutter-md">
            <q-card v-for="academy in filteredAcademies" :key="academy.id" class="my-card">
                <!-- Academy Basic Info -->
                <q-card-section>
                    <div class="text-h6">{{ academy.id }}</div>
                    <div class="text-subtitle2 q-mt-sm">
                        <q-icon name="email" size="sm" class="q-mr-xs" />
                        {{ academy.email }}
                    </div>
                    <div class="text-subtitle2">
                        <q-icon name="phone" size="sm" class="q-mr-xs" />
                        {{ academy.phone }}
                    </div>
                    <div v-if="academy.website" class="text-subtitle2">
                        <q-icon name="public" size="sm" class="q-mr-xs" />
                        <a :href="academy.website" target="_blank">{{ academy.website }}</a>
                    </div>
                </q-card-section>

                <q-separator />

                <!-- Programs Section (Expandable) -->
                <q-expansion-item expand-separator label="Available Programs"
                    caption="Click to view programs for this sport">
                    <q-card>
                        <q-card-section>
                            <q-list>
                                <q-item v-for="program in getProgramsForSport(academy, selectedSport)"
                                    :key="program.name" clickable @click="goToProgramDetails(academy.id, program)"
                                    class="q-my-sm">
                                    <q-item-section>
                                        <q-item-label class="text-weight-bold">{{ program.name }}</q-item-label>

                                        <!-- Program Details -->
                                        <q-item-label caption class="row items-center q-gutter-sm">
                                            <div>
                                                <q-icon name="event" size="sm" class="q-mr-xs" />
                                                {{ formatDateRange(program.startDate, program.durationWeeks) }}
                                            </div>
                                            <div>
                                                <q-icon name="attach_money" size="sm" class="q-mr-xs" />
                                                ${{ program.price }}
                                            </div>
                                            <div>
                                                <q-icon name="child_care" size="sm" class="q-mr-xs" />
                                                Ages {{ program.ageGroup }}
                                            </div>
                                        </q-item-label>

                                        <q-item-label caption>
                                            <q-icon name="people" size="sm" class="q-mr-xs" />
                                            Coaches: {{ program.coaches.join(', ') }}
                                        </q-item-label>

                                        <q-item-label caption>
                                            <q-icon name="schedule" size="sm" class="q-mr-xs" />
                                            Schedule:
                                            <span v-for="(session, idx) in program.schedule" :key="idx">
                                                {{ session.day }} at {{ session.time }}
                                                <span v-if="idx < program.schedule.length - 1">, </span>
                                            </span>
                                        </q-item-label>
                                    </q-item-section>

                                    <q-item-section side>
                                        <q-btn color="primary" label="Book Now"
                                            @click.stop="goToProgramDetails(academy.id, program)" />
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-card-section>
                    </q-card>
                </q-expansion-item>
            </q-card>

            <!-- Show Message if No Academies Are Available -->
            <div v-if="!filteredAcademies.length" class="text-center q-mt-md text-grey">
                No academies available for this sport.
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted } from "vue";
import { useAcademiesStore } from "stores/academyStore";
import { date } from 'quasar';

const route = useRoute();
const router = useRouter();
const academyStore = useAcademiesStore();

const selectedSport = route.params.sport;

onMounted(() => {
    academyStore.fetchAcademies();
});

// Format date range display
const formatDateRange = (startDate, weeks) => {
    if (!startDate) return "Dates not set";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (weeks * 7));
    return `${date.formatDate(start, 'MMM D')} - ${date.formatDate(end, 'MMM D, YYYY')}`;
};

// Get academies that have at least one program for the selected sport
const filteredAcademies = computed(() => {
    return academyStore.academyOptions.filter(academy =>
        academy.programs?.some(program => program.sport === selectedSport)
    );
});

// Helper function to get programs for a specific sport in an academy
const getProgramsForSport = (academy, sport) => {
    return academy.programs?.filter(program => program.sport === sport) || [];
};

// Navigate to program details page
const goToProgramDetails = (academyId, program) => {
    router.push({
        path: `/booking/academy/${academyId}/program`,
        query: {
            programName: program.name,
            sport: program.sport,
            coaches: program.coaches.join(','),
            schedule: JSON.stringify(program.schedule),
            startDate: program.startDate,
            durationWeeks: program.durationWeeks,
            price: program.price,
            ageGroup: program.ageGroup
        }
    });
};
</script>

<style lang="scss" scoped>
.my-card {
    transition: box-shadow 0.3s;
    cursor: auto;

    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
}

a {
    color: inherit;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
        color: var(--q-primary);
    }
}
</style>