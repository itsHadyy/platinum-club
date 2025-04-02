<template>
    <q-page class="q-pa-md">
        <h4 class="text-h5 text-bold">Dining & Shopping</h4>

        <!-- Loading indicator for initial data load -->
        <q-inner-loading :showing="isFetchingShops || isFetchingCategories" />

        <!-- Search & Sorting -->
        <div class="q-mb-md row q-col-gutter-sm">
            <q-input v-model="searchQuery" label="Search by Name or Location" outlined dense class="col-grow" clearable
                :disable="isFetchingShops" />
            <q-select v-model="sortBy" :options="sortOptions" label="Sort By" outlined dense class="col-5" clearable
                :disable="isFetchingShops" />
        </div>

        <!-- Shops List -->
        <q-list bordered separator v-if="filteredShops.length">
            <q-item v-for="shop in sortedShops" :key="shop.id" clickable @click="selectShop(shop)"
                :disable="isFetchingProducts">
                <q-item-section avatar>
                    <q-img :src="shop.image" class="shop-avatar" />
                </q-item-section>
                <q-item-section>
                    <q-item-label class="text-bold">{{ shop.name }}</q-item-label>
                    <q-item-label caption>🏠 {{ shop.location }} | ⭐ {{ shop.rating }} | ⏳ {{ shop.deliveryTime }}
                        min</q-item-label>
                </q-item-section>
                <q-inner-loading :showing="isFetchingProducts && selectedShop?.id === shop.id" />
            </q-item>
        </q-list>

        <!-- Empty state -->
        <div v-if="!filteredShops.length && !isFetchingShops" class="text-center q-pa-md">
            <q-icon name="search_off" size="xl" />
            <p>No shops found matching your search</p>
        </div>

        <!-- Floating Cart Button -->
        <q-btn fab color="secondary" icon="shopping_cart" @click="cartDialog = true" class="cart-btn"
            :loading="isFetchingCart">
            <q-badge v-if="cartItemCount" color="red" floating>{{ cartItemCount }}</q-badge>
        </q-btn>

        <!-- Shop Dialog -->
        <q-dialog v-model="shopDialog" @hide="selectedCategory = null">
            <q-card class="q-pa-md full-width" style="max-width: 500px;">
                <q-card-section>
                    <h5 class="text-h6 text-bold">{{ selectedShop?.name }}</h5>
                </q-card-section>

                <q-select v-model="selectedCategory" :options="categories" label="Filter by Category" outlined dense
                    class="q-mb-md" clearable :disable="isFetchingProducts" />

                <!-- Products List -->
                <q-list bordered separator v-if="filteredProducts.length">
                    <q-item v-for="product in filteredProducts" :key="product.id">
                        <q-item-section avatar>
                            <q-img :src="product.image" class="product-img" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-bold">{{ product.name }}</q-item-label>
                            <q-item-label caption>💰 {{ product.price }} EGP | 🏷️ {{ product.category }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn label="Add" color="secondary" dense @click="addToCart(product)"
                                :loading="isUpdatingCart" :disable="isUpdatingCart" />
                        </q-item-section>
                    </q-item>
                </q-list>

                <!-- Empty products state -->
                <div v-if="!filteredProducts.length && !isFetchingProducts" class="text-center q-pa-md">
                    <q-icon name="fastfood" size="xl" />
                    <p>No products available in this category</p>
                </div>

                <q-inner-loading :showing="isFetchingProducts" />
            </q-card>
        </q-dialog>

        <!-- Cart Dialog -->
        <q-dialog v-model="cartDialog">
            <q-card class="q-pa-md full-width" style="max-width: 500px;">
                <q-card-section>
                    <h5 class="text-h6 text-bold">Your Cart</h5>
                </q-card-section>

                <q-list v-if="cart.length">
                    <q-item v-for="item in cart" :key="item.id">
                        <q-item-section avatar>
                            <q-img :src="item.image" class="product-img" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-bold">{{ item.name }}</q-item-label>
                            <q-item-label caption>💰 {{ item.price }} EGP | Qty: {{ item.quantity }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn icon="remove" dense flat @click="updateCart(item.id, -1)"
                                :disable="isUpdatingCart" />
                            <q-btn icon="add" dense flat @click="updateCart(item.id, 1)" :disable="isUpdatingCart" />
                            <q-btn icon="delete" color="red" dense flat @click="removeFromCart(item.id)"
                                :disable="isUpdatingCart" />
                        </q-item-section>
                    </q-item>
                </q-list>

                <!-- Empty cart state -->
                <div v-if="!cart.length" class="text-center q-pa-md">
                    <q-icon name="shopping_cart_off" size="xl" />
                    <p>Your cart is empty</p>
                </div>

                <q-card-section v-if="cart.length">
                    <strong>Total: 💰 {{ cartTotal }} EGP</strong>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn label="Place Order" color="secondary" @click="placeOrder" :loading="isPlacingOrder"
                        :disable="isPlacingOrder || !cart.length" />
                    <q-btn label="Close" color="negative" v-close-popup :disable="isPlacingOrder" />
                </q-card-actions>

                <q-inner-loading :showing="isUpdatingCart" />
            </q-card>
        </q-dialog>

        <!-- Orders Dialog -->
        <q-dialog v-model="ordersDialog">
            <q-card class="q-pa-md full-width" style="max-width: 500px;">
                <q-card-section>
                    <h5 class="text-h6 text-bold">My Orders</h5>
                </q-card-section>
                <q-list bordered separator v-if="orders.length">
                    <q-item v-for="order in orders" :key="order.id">
                        <q-item-section>
                            <q-item-label class="text-bold">Order #{{ order.id }}</q-item-label>
                            <q-item-label caption>Status: <strong>{{ order.status }}</strong></q-item-label>
                            <q-item-label caption>Total: 💰 {{ order.total }} EGP</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>

                <!-- Empty orders state -->
                <div v-if="!orders.length" class="text-center q-pa-md">
                    <q-icon name="receipt_long" size="xl" />
                    <p>No orders yet</p>
                </div>

                <q-inner-loading :showing="isFetchingOrders" />
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from 'quasar';
import { useDiningStore } from "src/stores/diningStore";
import { useCartStore } from "src/stores/cartStore";

const $q = useQuasar();
const diningStore = useDiningStore();
const cartStore = useCartStore();

// State variables
const searchQuery = ref("");
const sortBy = ref(null);
const selectedCategory = ref(null);
const shopDialog = ref(false);
const cartDialog = ref(false);
const ordersDialog = ref(false);
const selectedShop = ref(null);
const products = ref([]);
const orders = ref([]);

// Loading states
const isFetchingShops = ref(false);
const isFetchingCategories = ref(false);
const isFetchingProducts = ref(false);
const isUpdatingCart = ref(false);
const isPlacingOrder = ref(false);
const isFetchingOrders = ref(false);
const isFetchingCart = ref(false);

// Computed properties
const sortOptions = computed(() => ["Name", "Rating", "Delivery Time"]);
const shops = computed(() => diningStore.shops);
const categories = computed(() => diningStore.categories || []);
const cart = computed(() => cartStore.cart);
const cartTotal = computed(() => cartStore.cartTotal);
const cartItemCount = computed(() => cartStore.cartItemCount);

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

const filteredProducts = computed(() =>
    selectedCategory.value ? products.value.filter(product => product.category === selectedCategory.value) : products.value
);

// Methods
const selectShop = async (shop) => {
    selectedShop.value = shop;
    isFetchingProducts.value = true;

    try {
        await diningStore.fetchProducts(shop.id);
        products.value = diningStore.productsByShop[shop.id] || [];
        shopDialog.value = true;
    } catch (error) {
        console.error("Error fetching products:", error);
        $q.notify({
            type: 'negative',
            message: "Failed to load shop details",
            position: 'top'
        });
    } finally {
        isFetchingProducts.value = false;
    }
};

const addToCart = async (product) => {
    isUpdatingCart.value = true;
    try {
        cartStore.addToCart(product);
        $q.notify({
            type: 'positive',
            message: `${product.name} added to cart`,
            position: 'top'
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        $q.notify({
            type: 'negative',
            message: "Failed to add item to cart",
            position: 'top'
        });
    } finally {
        isUpdatingCart.value = false;
    }
};

const updateCart = async (productId, amount) => {
    isUpdatingCart.value = true;
    try {
        cartStore.updateCartQuantity(productId, amount);
    } catch (error) {
        console.error("Error updating cart:", error);
        $q.notify({
            type: 'negative',
            message: "Failed to update cart",
            position: 'top'
        });
    } finally {
        isUpdatingCart.value = false;
    }
};

const removeFromCart = async (productId) => {
    isUpdatingCart.value = true;
    try {
        cartStore.removeFromCart(productId);
        $q.notify({
            type: 'info',
            message: "Item removed from cart",
            position: 'top'
        });
    } catch (error) {
        console.error("Error removing from cart:", error);
        $q.notify({
            type: 'negative',
            message: "Failed to remove item",
            position: 'top'
        });
    } finally {
        isUpdatingCart.value = false;
    }
};

const placeOrder = async () => {
    try {
        if (cart.value.length === 0) {
            $q.notify({
                type: 'warning',
                message: "Your cart is empty!",
                position: 'top'
            });
            return;
        }

        isPlacingOrder.value = true;
        await cartStore.placeOrder();

        cartDialog.value = false;
        $q.notify({
            type: 'positive',
            message: "Order placed successfully!",
            position: 'top'
        });
    } catch (error) {
        console.error("Order placement error:", error);
        $q.notify({
            type: 'negative',
            message: error.message || "Failed to place order",
            position: 'top'
        });
    } finally {
        isPlacingOrder.value = false;
    }
};

// Lifecycle hooks
onMounted(async () => {
    isFetchingShops.value = true;
    isFetchingCategories.value = true;
    try {
        await Promise.all([
            diningStore.fetchShops(),
            diningStore.fetchCategories()
        ]);
    } catch (error) {
        console.error("Initialization error:", error);
        $q.notify({
            type: 'negative',
            message: "Failed to load data",
            position: 'top'
        });
    } finally {
        isFetchingShops.value = false;
        isFetchingCategories.value = false;
    }
});
</script>

<style scoped>
/* Styles remain exactly the same */
.shop-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
}

.product-img {
    width: 50px;
    height: 50px;
    border-radius: 8px;
}

.cart-btn {
    position: absolute;
    top: 10px;
    right: 20px;
    z-index: 9999;
}
</style>