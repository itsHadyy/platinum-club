<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
        <q-card class="q-pa-md">

            <q-card-section class="flex text-center">
                <q-toolbar-title class=""> Choose a Sport </q-toolbar-title>
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
import { computed } from "vue";
import { useSportsStore } from "stores/sportsStore";

defineProps({ modelValue: Boolean });

const sportsStore = useSportsStore();

const courtTypes = computed(() => sportsStore.sportsOptions);
</script>