<script setup>
import { ref } from "vue";

const linksList = ref([
    { title: "Access Control", icon: "qr_code_scanner", link: "/access-control" },
    { title: "Bookings", icon: "sports_basketball", link: "/bookings-dashboard" },
    { title: "Amenities", icon: "volunteer_activism", link: "/" },
    { title: "Wallet", icon: "wallet", link: "/" },
    { title: "Dining", icon: "dining", link: "/" },
    { title: "Calendar", icon: "event", link: "/" },
    { title: "Settings", icon: "settings", link: "/" },
]);

const scrollArea = ref(null);
</script>

<template>
    <q-card class="q-pl-md q-mt-xl scrollable-card">
        <q-scroll-area ref="scrollArea" horizontal class="scroll-container">
            <div class="row no-wrap">
                <q-btn v-for="item in linksList" :key="item.title" :to="item.link" class="service-card q-mx-sm"
                    unelevated>
                    <q-icon :name="item.icon" size="32px" color="secondary" />
                    <div class="text-caption text-center q-mt-xs service-title">
                        {{ item.title }}
                    </div>
                </q-btn>
            </div>
        </q-scroll-area>
    </q-card>
</template>

<style scoped>
.scroll-container {
    max-width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    height: 120px;
}

.service-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 90px;
    height: 90px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
    text-transform: none;
}

.q-card {
    box-shadow: none;
}

.text-caption {
    text-align: center;
    font-size: 12px;
    line-height: 14px;
    white-space: normal;
    word-wrap: break-word;
    max-width: 80px;
}
</style>