<template>
    <div>
      <template v-if="authStore.isAuthenticated">
        <q-toolbar class="q-mb-md">
          <q-avatar size="40px">
            <img :src="userProfileImage || defaultProfileImage" />
          </q-avatar>
          <div class="q-ml-md text-sm">Welcome, {{ authStore.user?.name || authStore.user?.displayName || "User" }}!</div>
          <q-space />
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
  import { ref, onMounted } from 'vue';
  import { useAuthStore } from 'src/stores/useAuthStore';
  import { getAuth } from 'firebase/auth';
  import { getFirestore, doc, getDoc } from 'firebase/firestore';
  
  import CarouselComponent from 'src/components/CarouselComponent.vue';
  import CardComponent from 'src/components/LoginCardComponent.vue';
  import LoginFormDialog from 'src/components/dialogs/LoginFormDialog.vue';
  
  // Firebase instances
  const auth = getAuth();
  const db = getFirestore();
  
  const authStore = useAuthStore();
  const loginDialogRef = ref(null);
  const userProfileImage = ref(null);
  
  // Default profile image
  const defaultProfileImage = 'https://cdn.quasar.dev/img/avatar.png';
  
  // Fetch user data when the component is mounted
  onMounted(async () => {
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userProfileImage.value = userData.imageUrl || defaultProfileImage;
      }
    }
  });
  
  const handleLoginSuccess = (userData) => {
    authStore.login(userData);
  };
  </script>