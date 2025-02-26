<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="text-grey bg-white">
      <q-toolbar>

        <!-- <q-toolbar-title>
          Quasar App
        </q-toolbar-title> -->

        <div>Welcome to Platinum Club</div>
        <q-space />
        <!-- <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" /> -->
        <q-btn flat dense round icon="notifications" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-btn flat dense round icon="chat" aria-label="Menu" @click="openContactDialog" />
        <ContactDialog v-model="contactDialogVisible" />

      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header>
          Menu
        </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer>
      <div class="footer-nav">
        <q-tabs dense active-color="white" indicator-color="transparent" class="footer-tabs">
          <q-route-tab to="/" icon="home" label="" />
          <q-route-tab to="/profile" icon="account_circle" label="" />
          <q-route-tab to="/wallet" icon="account_balance_wallet" label="" />
          <!-- <q-route-tab to="/wallet" label="">
            <img alt="Quasar logo" src="~assets/logo.png" style="width: 50px" />
          </q-route-tab> -->
          <!-- <q-route-tab to="/wallet" icon="wallet" label="" /> -->
          <q-route-tab icon="menu" label="" @click="toggleLeftDrawer" />
        </q-tabs>
      </div>
    </q-footer>

    <!-- <q-footer elevated>
      <q-tabs dense active-color="primary" indicator-color="primary" class="bg-white text-grey q-pa-sm">
        <q-route-tab to="/" icon="home" label="" />
        <q-route-tab to="/profile" icon="account_circle" label="" />
        <q-route-tab to="/wallet" label="">
          <img alt="Quasar logo" src="~assets/logo.png" style="width: 50px" />
        </q-route-tab>
        <q-route-tab to="/wallet" icon="notifications" label="" />
        <q-route-tab icon="menu" label="" @click="toggleLeftDrawer" />
      </q-tabs>
    </q-footer> -->
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import ContactDialog from 'components/dialogs/ContactDialog.vue'; // Import ContactDialog

const linksList = [
  {
    title: 'Access Control',
    icon: 'qr_code_scanner',
    link: 'https://quasar.dev'
  },
  {
    title: 'Bookings',
    icon: 'sports_basketball',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Amenities',
    // caption: 'chat.quasar.dev',
    icon: 'volunteer_activism',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Wallet',
    // caption: 'forum.quasar.dev',
    icon: 'wallet',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Dining',
    // caption: '@quasarframework',
    icon: 'dining',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Calendar',
    // caption: '@QuasarFramework',
    icon: 'event',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Help & Support',
    // caption: 'Community Quasar projects',
    icon: 'help',
    link: 'https://awesome.quasar.dev'
  },
  {
    title: 'Conditions & Privacy',
    // caption: 'Community Quasar projects',
    icon: 'local_library',
    link: 'https://awesome.quasar.dev'
  },
  {
    title: 'Settings',
    // caption: 'Community Quasar projects',
    icon: 'settings',
    link: 'https://awesome.quasar.dev'
  }
]

const leftDrawerOpen = ref(false)
const contactDialogVisible = ref(false);


function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function openContactDialog() {
  contactDialogVisible.value = true;
}
</script>


<style scoped></style>