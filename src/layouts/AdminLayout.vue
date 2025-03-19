<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-secondary text-white">
      <q-toolbar>
        <q-btn dense flat icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>Admin Panel</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item clickable v-ripple to="/admin/dashboard">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/admin/bookings">
          <q-item-section avatar>
            <q-icon name="event" />
          </q-item-section>
          <q-item-section>Bookings</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/admin/courts">
          <q-item-section avatar>
            <q-icon name="sports_tennis" />
          </q-item-section>
          <q-item-section>Manage Courts</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/admin/users">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>Users</q-item-section>
        </q-item>

        <!-- Logout Button -->
        <q-item clickable @click="logout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Logout</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signOut, getAuth } from 'firebase/auth'

const router = useRouter();
const auth = getAuth();

const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

async function logout() {
  try {
    await signOut(auth);
    router.push('/auth/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
</script>