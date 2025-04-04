<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-secondary text-primary">
      <q-toolbar>
        <q-btn dense flat icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>Admin Panel</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item clickable v-ripple to="/admin/dashboard"
          :class="{ 'bg-secondary text-primary': $route.path === '/admin/dashboard' }">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section class="text-weight-bold">Dashboard</q-item-section>
        </q-item>

        <q-expansion-item expand-separator icon="event" label="Booking">
          <q-item clickable v-ripple to="/admin/bookings"
            :class="{ 'bg-secondary text-primary': $route.path === '/admin/bookings' }">
            <q-item-section avatar>
              <q-icon name="event" />
            </q-item-section>
            <q-item-section class="text-weight-bold">Bookings</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/courts"
            :class="{ 'bg-secondary text-primary': $route.path === '/admin/courts' }">
            <q-item-section avatar>
              <q-icon name="sports_tennis" />
            </q-item-section>
            <q-item-section class="text-weight-bold">Manage Courts</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/academies"
            :class="{ 'bg-secondary text-primary': $route.path === '/admin/academies' }">
            <q-item-section avatar>
              <q-icon name="sports" />
            </q-item-section>
            <q-item-section class="text-weight-bold">Manage Academies</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item expand-separator icon="restaurant" label="Dining & Shopping">
          <q-item clickable v-ripple to="/admin/dining"
            :class="{ 'bg-secondary text-primary': $route.path === '/admin/dining' }">
            <q-item-section avatar>
              <q-icon name="restaurant" />
            </q-item-section>
            <q-item-section class="text-weight-bold">Dining</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/orders"
            :class="{ 'bg-secondary text-primary': $route.path === '/admin/orders' }">
            <q-item-section avatar>
              <q-icon name="receipt" />
            </q-item-section>
            <q-item-section class="text-weight-bold">Orders</q-item-section>
          </q-item>
        </q-expansion-item>


        <q-item clickable v-ripple to="/admin/users"
          :class="{ 'bg-secondary text-primary': $route.path === '/admin/users' }">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section class="text-weight-bold">Users</q-item-section>
        </q-item>

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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signOut, getAuth } from 'firebase/auth';

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