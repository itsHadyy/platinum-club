<script setup>
import { useNotificationsStore } from "src/stores/notificationsStore";
const notificationsStore = useNotificationsStore();
</script>

<template>
    <q-btn round flat icon="notifications">
        <q-badge v-if="notificationsStore.notifications.length" color="red" floating>
            {{ notificationsStore.notifications.length }}
        </q-badge>

        <q-menu>
            <q-list style="min-width: 250px">
                <q-item-label header>Notifications</q-item-label>

                <q-item v-if="notificationsStore.notifications.length === 0">
                    <q-item-section>No new notifications</q-item-section>
                </q-item>

                <q-item v-for="notification in notificationsStore.notifications" :key="notification.id" clickable>
                    <q-item-section>
                        <q-item-label>{{ notification.message }}</q-item-label>
                        <q-item-label caption>{{ new Date(notification.timestamp).toLocaleString() }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-btn icon="close" flat dense
                            @click="notificationsStore.removeNotification(notification.id)" />
                    </q-item-section>
                </q-item>
            </q-list>
        </q-menu>
    </q-btn>
</template>