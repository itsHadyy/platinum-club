<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="text-grey bg-white">
      <q-toolbar>
        <div class="logo-header">
          <img alt="Quasar logo" src="~assets/logo.png"/>
          Platinum Club
        </div>
        <q-space />
        <!-- <q-btn flat dense round icon="notifications" aria-label="Notifications" @click="toggleLeftDrawer" /> -->
        <NotificationsMenu />
        <q-btn flat dense round icon="chat" aria-label="Chat" @click="openContactDialog" />
        <ContactDialog v-model="contactDialogVisible" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header>Menu</q-item-label>

        <EssentialLink 
          v-for="link in linksList" 
          :key="link.title" 
          v-bind="link"
          :class="{'bg-secondary text-primary': $route.path === link.link}"
        />

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

    <q-footer>
      <div class="footer-nav">
        <q-tabs dense active-color="text-primary" indicator-color="transparent" class="footer-tabs">
          <q-route-tab to="/" icon="home" label="" />
          <q-route-tab to="/profile" icon="account_circle" label="" />
          <q-route-tab to="/wallet" icon="account_balance_wallet" label="" />
          <q-route-tab icon="menu" label="" @click="toggleLeftDrawer" />
        </q-tabs>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signOut } from 'firebase/auth'
import EssentialLink from 'components/EssentialLink.vue'
import ContactDialog from 'components/dialogs/ContactDialog.vue'
import NotificationsMenu from "src/components/NotificationsMenu.vue";

const router = useRouter();
const auth = getAuth();

const leftDrawerOpen = ref(false)
const contactDialogVisible = ref(false);

const linksList = [
  { title: 'Access Control', icon: 'qr_code_scanner', link: '/access-control' },
  { title: 'Bookings', icon: 'sports_basketball', link: '/bookings-dashboard' },
  { title: 'Amenities', icon: 'volunteer_activism', link: '/' },
  { title: 'Wallet', icon: 'wallet', link: '/' },
  { title: 'Dining', icon: 'dining', link: '/dining' },
  { title: 'Calendar', icon: 'event', link: '/' },
  { title: 'Help & Support', icon: 'help', link: '/' },
  { title: 'Conditions & Privacy', icon: 'local_library', link: '/' },
  { title: 'Settings', icon: 'settings', link: '/' }
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function openContactDialog() {
  contactDialogVisible.value = true;
}

async function logout() {
  try {
    await signOut(auth);
    router.push('/auth/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
</script>

<style scoped></style>