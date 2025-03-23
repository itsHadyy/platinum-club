<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
        <q-card class="q-pa-md">
            <q-card-section class="flex text-center">
                <q-toolbar-title class=""> Choose a Sport </q-toolbar-title>
            </q-card-section>

            <q-card-section>
                <q-inner-loading :showing="academyStore.academyOptions.length === 0">
                    <q-spinner size="50px" color="primary" />
                </q-inner-loading>

                <q-btn v-for="sport in availableSports" :key="sport" class="full-width q-mb-md" color="secondary"
                    @click="goToAcademies(sport)">
                    {{ sport }}
                </q-btn>

                <div v-if="availableSports.length === 0 && academyStore.academyOptions.length > 0"
                    class="text-center text-grey q-mt-md">
                    No sports available at the moment.
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useAcademiesStore } from "stores/academyStore";

defineProps({
    modelValue: Boolean
});

const emit = defineEmits(["update:modelValue"]);
const router = useRouter();
const academyStore = useAcademiesStore();

const availableSports = computed(() => {
    const sportsSet = new Set();

    academyStore.academyOptions.forEach(academy => {
        if (academy.programs && Array.isArray(academy.programs)) {
            academy.programs.forEach(program => {
                if (program.sport) {
                    sportsSet.add(program.sport); 
                }
            });
        }
    });

    return Array.from(sportsSet); 
});

const goToAcademies = (sport) => {
    emit("update:modelValue", false);
    router.push(`/academies/${sport}`);
};
</script>