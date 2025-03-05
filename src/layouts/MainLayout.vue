<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="text-grey bg-white">
      <q-toolbar>
        <div>Welcome to Platinum Club</div>
        <q-space />
        <q-btn flat dense round icon="notifications" aria-label="Notifications" />
        <q-btn flat dense round icon="chat" aria-label="Chat" @click="openContactDialog" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header> Menu </q-item-label>

        <template v-if="authStore.isAuthenticated">
          <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
        </template>

        <template v-else>
          <q-item v-for="link in restrictedLinks" :key="link.title" clickable v-ripple @click="requireLogin">
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>{{ link.title }}</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <Suspense>
      <template #default>
        <ContactDialog v-if="contactDialogVisible" v-model="contactDialogVisible" />
      </template>
      <template #fallback>Loading...</template>
    </Suspense>

    <q-footer>
      <div class="footer-nav">
        <q-tabs dense active-color="white" indicator-color="transparent" class="footer-tabs">
          <q-route-tab to="/" icon="home" label="" />
          <q-route-tab
            v-if="authStore.isAuthenticated"
            to="/profile"
            icon="account_circle"
            label=""
          />
          <q-route-tab
            v-if="authStore.isAuthenticated"
            to="/wallet"
            icon="account_balance_wallet"
            label=""
          />
          <q-route-tab icon="menu" label="" @click="toggleLeftDrawer" />
        </q-tabs>
      </div>
    </q-footer>

    <LoginFormDialog ref="loginDialogRef" @login="handleLoginSuccess" />
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/useAuthStore'
import EssentialLink from 'components/EssentialLink.vue'
import ContactDialog from 'components/dialogs/ContactDialog.vue'
import LoginFormDialog from 'components/dialogs/LoginFormDialog.vue'

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loginDialogRef = ref(null);
const leftDrawerOpen = ref(false);
const contactDialogVisible = ref(false);

const linksList = [
  { title: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { title: 'Access Control', icon: 'qr_code_scanner', route: '/access-control' },
  { title: 'Bookings', icon: 'sports_basketball', route: '/bookings' },
  { title: 'Amenities', icon: 'volunteer_activism', route: '/amenities' },
  { title: 'Wallet', icon: 'account_balance_wallet', route: '/wallet' },
  { title: 'Dining', icon: 'dining', route: '/dining' },
  { title: 'Calendar', icon: 'event', route: '/calendar' },
  { title: 'Help & Support', icon: 'help', route: '/help' },
  { title: 'Conditions & Privacy', icon: 'local_library', route: '/privacy' },
  { title: 'Settings', icon: 'settings', route: '/settings' },
  { title: 'Logout', icon: 'logout', route: '/logout', action: () => authStore.logout() }
];

const restrictedLinks = linksList.filter(link => link.route !== '/logout');

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function openContactDialog() {
  contactDialogVisible.value = true;
}

function requireLogin() {
  loginDialogRef.value?.open();
}

function handleLoginSuccess(userData) {
  authStore.login(userData);

  // Redirect to the page the user originally wanted, or home if it's the first login
  const redirectTo = route.query.redirect || '/';
  router.push(redirectTo);
}

// Watch for authentication changes and update the UI
watch(() => authStore.isAuthenticated, (newValue) => {
  if (newValue) {
    // User just logged in, ensure they stay on the home page
    router.push('/');
  }
});
</script>