<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="text-grey bg-white">
      <q-toolbar>

        <!-- <q-toolbar-title>
          Quasar App
        </q-toolbar-title> -->

        <div>Welcome to Platinum Club</div>
        <q-space />
        <!-- <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" /> -->
        <q-btn flat dense round icon="chat" aria-label="Menu" @click="toggleLeftDrawer" />

      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header>
          Essential Links
        </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated>
      <div class="footer-nav">
        <q-tabs dense active-color="white" indicator-color="transparent" class="footer-tabs">
          <q-route-tab to="/" icon="home" label="" />
          <q-route-tab to="/profile" icon="account_circle" label="" />
          <!-- <q-route-tab to="/wallet" icon="account_balance_wallet" label="" /> -->
          <q-route-tab to="/wallet" label="">
            <img alt="Quasar logo" src="~assets/logo.png" style="width: 50px" />
          </q-route-tab>
          <q-route-tab to="/wallet" icon="notifications" label="" />
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

const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>


<style scoped>
.footer-nav {
  background-color: #222;
  /* Dark background color */
  border-radius: 20px;
  /* Rounded corners */
  padding: 8px 16px;
  /* Padding for spacing */
  margin: 8px auto;
  /* Center the footer nav */
  width: fit-content;
  /* Adjust width to content */
}

.footer-tabs {
  padding: 0;
  /* Remove default padding from q-tabs */
}

.footer-tabs .q-tab {
  flex-direction: column;
  /* Stack icons and labels vertically */
  padding: 8px 12px;
  /* Adjust padding for tabs */
  color: white;
  /* White icon and label color */
}

.footer-tabs .q-tab__icon {
  font-size: 24px;
  /* Adjust icon size */
  margin-bottom: 4px;
  /* Space between icon and label */
}

.footer-tabs .q-tab__label {
  font-size: 12px;
  /* Adjust label size */
}

.footer-tabs .q-tab--active {
  color: white;
  /* Active tab color */
}
</style>