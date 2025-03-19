<template>
    <q-dialog :model-value="modelValue"  @update:model-value="$emit('update:modelValue', $event)">
        <q-card class="q-pa-md">
            <q-bar class="bg-white text-dark">
                <q-btn flat round dense icon="arrow_back" @click="$emit('update:modelValue', false)" />
                <q-space />
            </q-bar>

            <q-card-section class="text-h6 q-mt-md q-ml-md">
                Choose Court Type
            </q-card-section>

            <q-card-section>
                <q-btn v-for="type in courtTypes" :key="type" class="full-width q-mb-md" color="secondary"
                    @click="$emit('selectCourt', type)">
                    {{ type }}
                </q-btn>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
defineProps({
    modelValue: Boolean
});

import { useSportsStore } from "stores/sportsStore";

const sportsStore = useSportsStore();
const courtTypes = sportsStore.sportsOptions;

</script>