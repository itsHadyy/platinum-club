<template>
    <q-card class="upcoming-bookings-card q-pa-md q-ma-md">
        <q-card-section class="header">
            <div class="text-h5 text-bold">Top Rated Shops</div>
        </q-card-section>

        <q-separator />

        <q-inner-loading :showing="loading">
            <q-spinner size="40px" color="primary" />
        </q-inner-loading>

        <q-list bordered separator v-if="topShops.length">
            <q-item v-for="shop in topShops" :key="shop.id" clickable @click="selectShop(shop)">
                <q-item-section avatar>
                    <q-img :src="shop.image" class="shop-avatar" />
                </q-item-section>
                <q-item-section>
                    <q-item-label class="text-bold">{{ shop.name }}</q-item-label>
                    <q-item-label caption>
                        🏠 {{ shop.location }} |
                        ⭐ {{ shop.averageRating || 'No ratings' }} ({{ shop.reviewCount || 0 }}) |
                        ⏳ {{ shop.deliveryTime }} mins
                    </q-item-label>
                </q-item-section>
            </q-item>
        </q-list>

        <div v-if="!topShops.length && !loading" class="text-center q-pa-md">
            <q-icon name="storefront" size="xl" />
            <p>No top rated shops found</p>
        </div>
    </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDiningStore } from 'src/stores/diningStore';

const router = useRouter();
const diningStore = useDiningStore();
const loading = ref(false);


const topShops = computed(() => {
    if (!diningStore.shops.length) return [];

    return [...diningStore.shops]
        .filter(shop => shop.averageRating > 0)
        .sort((a, b) => {

            const ratingDiff = b.averageRating - a.averageRating;
            if (ratingDiff !== 0) return ratingDiff;


            return b.reviewCount - a.reviewCount;
        })
        .slice(0, 3);
});

const selectShop = () => {
    router.push('/dining'); 
};


onMounted(async () => {
    if (!diningStore.shops.length) {
        loading.value = true;
        try {
            await diningStore.fetchShops();
        } finally {
            loading.value = false;
        }
    }
});
</script>

<style scoped >

.upcoming-bookings-card{
    cursor: auto;
}
.shop-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
}
</style>