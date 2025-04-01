<template>
    <q-page class="q-pa-md">
        <h4>Dining & Shopping</h4>

        <q-btn label="View My Orders" color="secondary" @click="viewMyOrders" class="q-mb-md" />

        <q-input v-model="searchQuery" label="Search by Name or Location" outlined dense class="q-mb-md" clearable />
        <q-select v-model="sortBy" :options="sortOptions" label="Sort By" outlined dense class="q-mb-md" clearable />

        <q-list bordered separator v-if="filteredShops.length">
            <q-item v-for="shop in sortedShops" :key="shop.id" clickable @click="selectShop(shop)">
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
                    <h5 style="margin: 0;">{{ selectedShop?.name }}</h5>
                </q-card-section>
                <q-select v-model="selectedCategory" :options="categories" label="Filter by Category" outlined dense
                    class="q-mb-md" clearable />
                <q-list bordered separator v-if="filteredProducts.length">
                    <q-item v-for="product in filteredProducts" :key="product.id">
                        <q-item-section avatar>
                            <q-img :src="product.image" style="width: 50px; height: 50px;" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label><strong>{{ product.name }}</strong></q-item-label>
                            <q-item-label caption>💰 {{ product.price }} EGP | 🏷️ {{ product.category }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn label="Add to Cart" color="secondary" @click="addToCart(product)" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </q-dialog>

        <!-- Cart Button -->
        <q-btn icon="shopping_cart" color="primary" @click="cartDialog = true">
            Cart ({{ cartItemCount }})
        </q-btn>

        <!-- Cart Dialog -->
        <q-dialog v-model="cartDialog">
            <q-card class="q-pa-md">
                <q-card-section>
                    <h5>Your Cart</h5>
                </q-card-section>

                <q-list v-if="cart.length">
                    <q-item v-for="item in cart" :key="item.id">
                        <q-item-section avatar>
                            <q-img :src="item.image" style="width: 50px; height: 50px;" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label><strong>{{ item.name }}</strong></q-item-label>
                            <q-item-label caption>💰 {{ item.price }} EGP | Qty: {{ item.quantity }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn icon="remove" flat @click="updateCart(item.id, -1)" />
                            <q-btn icon="add" flat @click="updateCart(item.id, 1)" />
                            <q-btn icon="delete" color="red" flat @click="removeFromCart(item.id)" />
                        </q-item-section>
                    </q-item>
                </q-list>

                <q-card-section v-if="cart.length">
                    <strong>Total: 💰 {{ cartTotal }} EGP</strong>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn label="Place Order" color="secondary" @click="placeOrder" />
                    <q-btn label="Close" color="negative" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Orders Dialog -->
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
import { useCartStore } from "src/stores/cartStore";

const diningStore = useDiningStore();
const authStore = useAuthStore();
const cartStore = useCartStore();

const searchQuery = ref("");
const sortBy = ref(null);
const sortOptions = ["Name", "Rating", "Delivery Time"];
const selectedCategory = ref(null);

const shops = computed(() => diningStore.shops);
const categories = computed(() => diningStore.categories || []);

const filteredShops = computed(() =>
    shops.value.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        shop.location.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
);

const sortedShops = computed(() => {
    let sorted = [...filteredShops.value];
    if (sortBy.value === "Name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy.value === "Rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sortBy.value === "Delivery Time") sorted.sort((a, b) => a.deliveryTime - b.deliveryTime);
    return sorted;
});

const shopDialog = ref(false);
const cartDialog = ref(false);
const ordersDialog = ref(false);
const orders = ref([]);

const selectedShop = ref(null);
const products = ref([]);

const selectShop = async (shop) => {
    selectedShop.value = shop;
    await diningStore.fetchProducts(shop.id);
    products.value = diningStore.productsByShop[shop.id] || [];
    shopDialog.value = true;
};

const filteredProducts = computed(() =>
    selectedCategory.value
        ? products.value.filter(product => product.category === selectedCategory.value)
        : products.value
);

const cart = computed(() => cartStore.cart);
const cartTotal = computed(() => cartStore.cartTotal);
const cartItemCount = computed(() => cartStore.cartItemCount);

const addToCart = (product) => {
    cartStore.addToCart(product);
};

const updateCart = (productId, amount) => {
    cartStore.updateCartQuantity(productId, amount);
};

const removeFromCart = (productId) => {
    cartStore.removeFromCart(productId);
};

const placeOrder = async () => {
    if (cart.value.length === 0) {
        console.error("Cart is empty. Cannot place order.");
        return;
    }

    if (!authStore.user || !authStore.user.id) {
        console.error("User is not authenticated.");
        return;
    }

    const order = {
        userId: authStore.user.id, // ✅ Ensure this exists
        items: cart.value,
        total: cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: "Pending",
        createdAt: new Date(),
    };

    try {
        await diningStore.placeOrder(order);
        cart.value = []; // ✅ Clear cart after order
        cartDialog.value = false;
    } catch (error) {
        console.error("Error placing order:", error);
    }
};

const viewMyOrders = async () => {
    orders.value = await diningStore.fetchUserOrders(authStore.user.id);
    ordersDialog.value = true;
};

onMounted(() => {
    diningStore.fetchShops();
    diningStore.fetchCategories();
});
</script>