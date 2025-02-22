<template>
    <q-page class="text-center q-pa-xl">
        <img alt="Quasar logo" src="~assets/logo.png" style="width: 300px" />

        <q-btn label="login" color="secondary" dense type="submit" class="q-px-xl" @click="openLoginFormDialog" />
        <LoginFormDialog ref="loginDialogRef" />
    </q-page>
</template>

<script setup>
import LoginFormDialog from 'src/components/dialogs/LoginFormDialog.vue';
import { ref } from 'vue';

const loginDialogRef = ref(null);

const openLoginFormDialog = () => {
    loginDialogRef.value.open();
};
</script>