<template>
    <q-layout view="lHh Lpr lFf">
        <q-header class="text-grey bg-white">
            <q-toolbar class="column">
                <div class="logo-header row items-center justify-between full-width">
                    <img alt="Quasar logo" src="~assets/logo.png" />
                    <q-btn flat dense round icon="chat" aria-label="Chat" @click="openContactDialog" />
                </div>

                <q-separator />

                <ContactDialog v-model="contactDialogVisible" />
            </q-toolbar>
        </q-header>

        <q-page-container>
            <div class="text-center q-mt-sm text-h6">
                Welcome to Platinum Club
            </div>
            <router-view />
        </q-page-container>

        <q-footer>
            <div class="footer-nav">
                <q-tabs dense active-color="white" indicator-color="transparent" class="footer-tabs">
                    <q-route-tab to="/" icon="home" label="" />
                    <q-tab icon="account_circle" label="" @click="handleAuthNavigation('/profile')" />
                    <q-tab icon="account_balance_wallet" label="" @click="handleAuthNavigation('/wallet')" />
                </q-tabs>
            </div>
        </q-footer>

        <q-dialog v-model="loginDialogVisible">
            <q-card class="q-pa-md">
                <q-card-section>
                    <div class="text-h6">Login Required</div>
                </q-card-section>
                <q-card-section>
                    <p>You need to log in to access this section.</p>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Back to Home" color="secondary" @click="redirectToLogin" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/useAuthStore' 

import ContactDialog from 'components/dialogs/ContactDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const contactDialogVisible = ref(false)
const loginDialogVisible = ref(false)
const pendingRoute = ref(null)

function openContactDialog() {
    contactDialogVisible.value = true
}

function handleAuthNavigation(route) {
    if (authStore.isAuthenticated) {
        router.push(route) 
    } else {
        pendingRoute.value = route
        loginDialogVisible.value = true 
    }
}

function redirectToLogin() {
    loginDialogVisible.value = false
    router.push('/auth/login')
}
</script>