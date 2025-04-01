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
                <!-- Navigation items here (same as before) -->
                <!-- You already have your drawer set up, so no changes needed here -->
            </q-list>
        </q-drawer>

        <q-page-container>
            <q-page>
                <q-row class="q-gutter-md" align="center">
                    <!-- Dashboard Cards -->
                    <q-col v-for="(item, index) in cards" :key="index" cols="12" sm="6" md="4" lg="3">
                        <q-card class="q-pa-md" :shadow="3">
                            <q-card-section class="text-center">
                                <q-icon :name="item.icon" size="50px" class="text-primary" />
                                <div class="text-h6 q-mt-md">{{ item.title }}</div>
                                <div class="text-subtitle2">{{ item.value }}</div>
                            </q-card-section>
                            <q-card-actions align="center">
                                <q-btn flat label="View More" color="primary" @click="goToSection(item.link)" />
                            </q-card-actions>
                        </q-card>
                    </q-col>
                </q-row>

                <q-row class="q-gutter-md" align="center">
                    <!-- Quick Stats or Recent Activity Feed (optional section) -->
                    <q-col v-for="(activity, index) in activities" :key="index" cols="12" sm="6">
                        <q-card class="q-pa-md" :shadow="2">
                            <q-card-section>
                                <div class="text-h6">{{ activity.title }}</div>
                                <div>{{ activity.details }}</div>
                            </q-card-section>
                        </q-card>
                    </q-col>
                </q-row>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => {
    leftDrawerOpen.value = !leftDrawerOpen.value;
};

const cards = ref([
    { title: "Total Orders", value: "1234", icon: "shopping_cart", link: "/admin/orders" },
    { title: "Active Stores", value: "45", icon: "store", link: "/admin/dining" },
    { title: "Total Revenue", value: "$12,345", icon: "attach_money", link: "/admin/revenue" },
    { title: "Pending Approvals", value: "3", icon: "pending", link: "/admin/approvals" },
]);

const activities = ref([
    { title: "New Order Received", details: "Order #1234 has been placed" },
    { title: "Store Added", details: "New store 'Cafe Delight' added" },
    { title: "Product Updated", details: "Product 'Matcha Latte' price updated" },
]);

const goToSection = (link) => {
    router.push(link);
};

</script>

<style scoped>
.q-card {
    cursor: pointer;
}
</style>