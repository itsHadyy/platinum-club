<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated class="bg-primary text-white">
            <q-toolbar>
                <q-btn flat dense round icon="arrow_back" @click="$router.push('/')" v-if="showBack" />
                <q-toolbar-title> Platinum Club </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <router-view />
        </q-page-container>

        <q-footer class="text-center text-grey">
            <p class="q-pa-sm"> © 2025 Platinum Club. All rights reserved. </p>
        </q-footer>
    </q-layout>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const showBack = computed(() => route.path !== '/auth');
</script>