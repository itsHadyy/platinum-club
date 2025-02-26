<template>
    <q-card class="login-prompt-card q-pa-md">
        <div class="card-content">
            <div class="text-container">
                <div class="message">
                    Unlock Premium Access. Your Platinum Journey Starts Here.
                </div>
                <q-btn color="secondary" label="Login" @click="openLoginFormDialog" />
            </div>
            <div class="image-container">
                <q-img src="~assets/banner/img02.jpeg" fit="cover" />
            </div>
        </div>
        <LoginFormDialog ref="loginDialogRef" />
    </q-card>
</template>

<script setup>
import LoginFormDialog from 'src/components/dialogs/LoginFormDialog.vue';
import { ref } from 'vue';

const loginDialogRef = ref(null);

const openLoginFormDialog = () => {
    loginDialogRef.value.open();
};
</script>

<style scoped></style>