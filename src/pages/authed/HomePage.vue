<template>
  <div>
    <template v-if="authStore.isAuthenticated">
      <q-toolbar class="q-mb-md">
        <q-avatar size="40px">
          <img :src="userProfileImage || defaultProfileImage" />
        </q-avatar>
        <div class="q-ml-md text-sm">Welcome, {{ userName|| "User"}}!</div>
        <q-space />
      </q-toolbar>
      
      <CarouselComponent />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from 'src/stores/useAuthStore';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

import CarouselComponent from 'src/components/CarouselComponent.vue';

// Firebase instances
const auth = getAuth();
const db = getFirestore();

const authStore = useAuthStore();
const userProfileImage = ref(null);
const userName = ref(null);

// Default profile image
const defaultProfileImage = 'https://cdn.quasar.dev/img/avatar.png';

// Fetch user data when the component is mounted
onMounted(async () => {
  if (auth.currentUser) {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      userProfileImage.value = userData.imageUrl || defaultProfileImage;
      userName.value = userData.firstName;
    }
  }
});

</script>