<template>
    <transition name="fade">
        <q-page v-if="dialogVisible" class="fixed-full bg-grey-2">
            <div class="fixed-full bg-black/50"></div>
            <div class="absolute-center q-pa-md" style="width: 400px; max-width: 90%;">
                <q-card class="q-pa-md">
                    <q-card-section class="row items-center justify-between">
                        <div class="text-h6">Login</div>
                        <q-btn icon="close" flat round dense @click="closeDialog" />
                    </q-card-section>
                    <q-card-section>
                        <q-form class="q-gutter-md">
                            <q-input label="Email" v-model="email" type="email" outlined
                                :rules="[(val) => val.includes('@') && val.includes('.') || 'Invalid E-mail']"
                                hide-bottom-space lazy-rules />
                            <q-input type="password" label="Password" v-model="password" outlined
                                :rules="[(val) => val.length > 7 || 'Invalid Password']" hide-bottom-space lazy-rules />
                            <div class="row justify-center q-mt-md">
                                <q-btn label="Login" color="primary" rounded class="q-px-xl" @click="login" />
                            </div>
                        </q-form>
                    </q-card-section>
                </q-card>
            </div>
        </q-page>
    </transition>
</template>

<script setup>
import { ref } from 'vue';

const dialogVisible = ref(false);
const email = ref('');
const password = ref('');

const open = () => {
    dialogVisible.value = true;
};

const closeDialog = () => {
    dialogVisible.value = false;
};

const login = () => {
    console.log('Email:', email.value, 'Password:', password.value);
    closeDialog();
};

defineExpose({
    open,
    close: closeDialog,
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>