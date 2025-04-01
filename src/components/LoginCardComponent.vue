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

    <Suspense>
      <template #default>
        <LoginFormDialog ref="loginDialogRef" />
      </template>
      <template #fallback>
        <div>Loading login form...</div>
      </template>
    </Suspense>
  </q-card>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue';


const LoginFormDialog = defineAsyncComponent(() =>
  import('src/components/dialogs/LoginFormDialog.vue')
);

const loginDialogRef = ref(null);

const openLoginFormDialog = () => {
  loginDialogRef.value?.open();
};
</script>

<style scoped>

</style>