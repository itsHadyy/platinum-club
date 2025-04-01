<template>
    <q-page class="q-pa-md">
        <h4>Dining & Shopping</h4>

        <q-btn label="View My Orders" color="primary" @click="viewMyOrders" class="q-mb-md" />

        <q-select v-model="selectedCategory" :options="categories" label="Filter by Category" outlined dense
            class="q-mb-md" clearable />

        <q-list bordered separator v-if="filteredShops.length">
            <q-item v-for="shop in filteredShops" :key="shop.id" clickable @click="selectShop(shop)">
                <q-item-section avatar>
                    <q-img :src="shop.image" style="width: 50px; height: 50px; border-radius: 50%;" />
                </q-item-section>
                <q-item-section>
                    <q-item-label><strong>{{ shop.name }}</strong></q-item-label>
                    <q-item-label caption>🏠 {{ shop.location }} | ⭐ {{ shop.rating }} | ⏳ {{ shop.deliveryTime }}
                        min</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>

        <q-dialog v-model="shopDialog">
            <q-card class="q-pa-md" style="min-width: 500px;">
                <q-card-section>
                    <h5>{{ selectedShop?.name }}</h5>
                </q-card-section>
                <q-list bordered separator v-if="products.length">
                    <q-item v-for="product in products" :key="product.id">
                        <q-item-section avatar>
                            <q-img :src="product.image" style="width: 50px; height: 50px;" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label><strong>{{ product.name }}</strong></q-item-label>
                            <q-item-label caption>💰 {{ product.price }} EGP | 🏷️ {{ product.category }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn label="Add to Cart" color="primary" @click="addToCart(product)" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </q-dialog>

        <q-dialog v-model="cartDialog">
            <q-card class="q-pa-md">
                <q-card-section>
                    <h5>Your Cart</h5>
                </q-card-section>
                <q-list bordered separator v-if="cart.length">
                    <q-item v-for="item in cart" :key="item.id">
                        <q-item-section avatar>
                            <q-img :src="item.image" style="width: 50px; height: 50px;" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label><strong>{{ item.name }}</strong></q-item-label>
                            <q-item-label caption>💰 {{ item.price }} EGP | Qty: {{ item.quantity }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn icon="remove" flat @click="removeFromCart(item)" />
                        </q-item-section>
                    </q-item>
                </q-list>
                <q-card-actions align="right">
                    <q-btn label="Place Order" color="secondary" @click="placeOrder" />
                    <q-btn label="Close" color="negative" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="ordersDialog">
            <q-card class="q-pa-md">
                <q-card-section>
                    <h5>My Orders</h5>
                </q-card-section>
                <q-list bordered separator v-if="orders.length">
                    <q-item v-for="order in orders" :key="order.id">
                        <q-item-section>
                            <q-item-label><strong>Order #{{ order.id }}</strong></q-item-label>
                            <q-item-label caption>Status: <strong>{{ order.status }}</strong></q-item-label>
                            <q-item-label caption>Total: 💰 {{ order.total }} EGP</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useDiningStore } from "src/stores/diningStore";
import { useAuthStore } from "src/stores/useAuthStore";

const diningStore = useDiningStore();
const authStore = useAuthStore();

const shops = computed(() => diningStore.shops);
const categories = computed(() => diningStore.categories || []);
const selectedCategory = ref(null);
const filteredShops = computed(() =>
    selectedCategory.value ? shops.value.filter(shop => shop.category === selectedCategory.value) : shops.value
);

const shopDialog = ref(false);
const cartDialog = ref(false);
const ordersDialog = ref(false);

const selectedShop = ref(null);
const products = ref([]);
const cart = ref([]);
const orders = ref([]);

const selectShop = async (shop) => {
    selectedShop.value = shop;
    await diningStore.fetchProducts(shop.id);
    products.value = diningStore.productsByShop[shop.id] || [];
    shopDialog.value = true;
};

const addToCart = (product) => {
    const existingItem = cart.value.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.value.push({ ...product, quantity: 1 });
    }
};

const removeFromCart = (item) => {
    cart.value = cart.value.filter(cartItem => cartItem.id !== item.id);
};

const placeOrder = async () => {
    if (cart.value.length === 0) return;

    const order = {
        userId: authStore.user.id,
        items: cart.value,
        total: cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: "Pending",
        createdAt: new Date(),
    };

    await diningStore.placeOrder(order);
    cart.value = [];
    cartDialog.value = false;
};

const viewMyOrders = async () => {
    orders.value = await diningStore.fetchUserOrders(authStore.user.id);
    ordersDialog.value = true;
};

onMounted(diningStore.fetchShops);
</script>