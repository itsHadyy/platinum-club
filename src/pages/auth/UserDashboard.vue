<template>
    <q-page class="q-pa-md">
      <h2>Welcome to Your Dashboard</h2>
      <p>This page is accessible only to logged-in users.</p>
    </q-page>
  </template>
  
  <script setup>
  import { auth } from 'src/boot/firebase';
  import { onMounted, ref } from 'vue';
  
  const user = ref(null);
  
  onMounted(() => {
    user.value = auth.currentUser;
  });
  </script>