<template>
    <div>
        <template v-if="authStore.isAuthenticated">
            <q-toolbar class="q-mb-md">
                <q-avatar size="40px">
                    <img src="https://cdn.quasar.dev/img/avatar.png" />
                </q-avatar>
                <div class="q-ml-md text-sm">Welcome, {{ authStore.user?.name }}!</div>
                <q-space />
                <!-- <q-btn label="Logout" color="negative" @click="authStore.logout" /> -->
            </q-toolbar>

            <q-list bordered class="q-mb-md">
                <q-item to="/profile" clickable v-ripple>
                    <q-item-section avatar>
                        <q-icon name="account_circle" />
                    </q-item-section>
                    <q-item-section>Profile</q-item-section>
                </q-item>

                <q-item to="/wallet" clickable v-ripple>
                    <q-item-section avatar>
                        <q-icon name="account_balance_wallet" />
                    </q-item-section>
                    <q-item-section>Wallet</q-item-section>
                </q-item>
            </q-list>
        </template>

        <template v-else>
            <CarouselComponent />
            <CardComponent />
        </template>

        <LoginFormDialog ref="loginDialogRef" @login="handleLoginSuccess" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from 'src/stores/useAuthStore';
import CarouselComponent from 'src/components/CarouselComponent.vue';
import CardComponent from 'src/components/LoginCardComponent.vue';
import LoginFormDialog from 'src/components/dialogs/LoginFormDialog.vue';

const authStore = useAuthStore();
const loginDialogRef = ref(null);

const handleLoginSuccess = (userData) => {
    authStore.login(userData);
};
</script>