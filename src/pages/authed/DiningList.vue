<template>
    <q-page class="q-pa-md">
        <h4 class="text-h5 text-bold">Dining & Shopping</h4>

        <!-- Loading indicators -->
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
                    <q-item-label caption>
                        🏠 {{ shop.location }} |
                        ⭐ {{ shop.averageRating || 'No ratings' }} ({{ shop.reviewCount || 0 }}) |
                        ⏳ {{ shop.deliveryTime }} min
                    </q-item-label>
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
        <q-dialog v-model="shopDialog" @hide="resetShopDialog">
            <q-card class="q-pa-md full-width" style="max-width: 500px;">
                <q-card-section>
                    <h5 class="text-h6 text-bold">{{ selectedShop?.name }}</h5>
                    <div class="row items-center q-mb-sm">
                        <q-rating v-model="selectedShop.averageRating" size="1.5em" readonly />
                        <span class="q-ml-sm text-caption">({{ selectedShop.reviewCount || 0 }} reviews)</span>
                    </div>
                </q-card-section>

                <q-tabs v-model="shopDialogTab" dense class="text-grey" active-color="primary">
                    <q-tab name="products" label="Products" />
                    <q-tab name="reviews" label="Reviews" />
                </q-tabs>

                <q-tab-panels v-model="shopDialogTab" animated>
                    <!-- Products Tab -->
                    <q-tab-panel name="products">
                        <q-select v-model="selectedCategory" :options="categories" label="Filter by Category" outlined
                            dense class="q-mb-md" clearable :disable="isFetchingProducts" />

                        <q-list bordered separator v-if="filteredProducts.length">
                            <q-item v-for="product in filteredProducts" :key="product.id">
                                <q-item-section avatar>
                                    <q-img :src="product.image" class="product-img" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label class="text-bold">{{ product.name }}</q-item-label>
                                    <q-item-label caption>💰 {{ product.price }} EGP | 🏷️ {{ product.category
                                    }}</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-btn label="Add" color="secondary" dense @click="addToCart(product)"
                                        :loading="isUpdatingCart" :disable="isUpdatingCart" />
                                </q-item-section>
                            </q-item>
                        </q-list>

                        <div v-if="!filteredProducts.length && !isFetchingProducts" class="text-center q-pa-md">
                            <q-icon name="fastfood" size="xl" />
                            <p>No products available in this shop</p>
                        </div>

                        <q-inner-loading :showing="isFetchingProducts" />
                    </q-tab-panel>

                    <!-- Reviews Tab -->
                    <q-tab-panel name="reviews">
                        <div v-if="reviews.length">
                            <q-list bordered separator>
                                <q-item v-for="review in reviews" :key="review.id">
                                    <q-item-section>
                                        <q-item-label class="text-bold">{{ review.userName }}</q-item-label>
                                        <q-rating v-model="review.rating" size="1.5em" readonly />
                                        <q-item-label caption>{{ formatDate(review.createdAt) }}</q-item-label>
                                        <q-item-label>{{ review.comment }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </div>
                        <div v-else class="text-center q-pa-md">
                            <p>No reviews yet</p>
                        </div>

                        <!-- Add Review Form -->
                        <q-form @submit="submitReview" class="q-mt-md">
                            <h6 class="text-h6">Add Your Review</h6>
                            <q-rating v-model="newReview.rating" size="2em" :max="5" />
                            <q-input v-model="newReview.comment" label="Your review" type="textarea" outlined
                                class="q-mt-sm" :rules="[val => val.length <= 500 || 'Maximum 500 characters']" />
                            <q-btn label="Submit Review" type="submit" color="primary" class="q-mt-md"
                                :disable="!newReview.rating || newReview.comment.length > 500" />
                        </q-form>
                    </q-tab-panel>
                </q-tab-panels>
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

                <div v-if="!orders.length" class="text-center q-pa-md">
                    <q-icon name="receipt_long" size="xl" />
                    <p>No orders yet</p>
                </div>

                <q-inner-loading :showing="isFetchingOrders" />
            </q-card>
        </q-dialog>

        <!-- Review Prompt Dialog -->
        <q-dialog v-model="reviewPromptDialog" persistent>
            <q-card class="q-pa-md" style="min-width: 350px">
                <q-card-section>
                    <h6 class="text-h6">How was your experience?</h6>
                    <p>We'd love to hear your feedback about {{ lastOrderShop?.name }}</p>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-rating v-model="newReview.rating" size="2em" :max="5" />
                    <q-input v-model="newReview.comment" label="Your review (optional)" type="textarea" outlined
                        class="q-mt-sm" :rules="[val => !val || val.length <= 500 || 'Maximum 500 characters']" />
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Skip" color="negative" v-close-popup @click="resetReviewPrompt" />
                    <q-btn flat label="Submit" color="primary" @click="submitReview" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from 'quasar';
import { useDiningStore } from "src/stores/diningStore";
import { useCartStore } from "src/stores/cartStore";
import { useAuthStore } from "src/stores/useAuthStore";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "src/boot/firebase";

const $q = useQuasar();
const diningStore = useDiningStore();
const cartStore = useCartStore();
const authStore = useAuthStore();


const searchQuery = ref("");
const sortBy = ref(null);
const selectedCategory = ref(null);
const shopDialog = ref(false);
const shopDialogTab = ref("products");
const cartDialog = ref(false);
const ordersDialog = ref(false);
const reviewPromptDialog = ref(false);
const selectedShop = ref(null);
const lastOrderShop = ref(null);
const products = ref([]);
const orders = ref([]);
const reviews = ref([]);


const newReview = ref({
    shopId: null,
    rating: 0,
    comment: '',
});


const isFetchingShops = ref(false);
const isFetchingCategories = ref(false);
const isFetchingProducts = ref(false);
const isFetchingReviews = ref(false);
const isUpdatingCart = ref(false);
const isPlacingOrder = ref(false);
const isFetchingOrders = ref(false);
const isFetchingCart = ref(false);
const isSubmittingReview = ref(false);


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
    if (sortBy.value === "Rating") sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    if (sortBy.value === "Delivery Time") sorted.sort((a, b) => a.deliveryTime - b.deliveryTime);
    return sorted;
});

const filteredProducts = computed(() =>
    selectedCategory.value ? products.value.filter(product => product.category === selectedCategory.value) : products.value
);


const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString();
};

const resetShopDialog = () => {
    selectedCategory.value = null;
    products.value = [];
    reviews.value = [];
    newReview.value = {
        shopId: null,
        rating: 0,
        comment: ''
    };
};

const resetReviewPrompt = () => {
    reviewPromptDialog.value = false;
    lastOrderShop.value = null;
    newReview.value = {
        shopId: null,
        rating: 0,
        comment: ''
    };
};

const selectShop = async (shop) => {
    selectedShop.value = shop;
    newReview.value.shopId = shop.id;
    isFetchingProducts.value = true;
    isFetchingReviews.value = true;

    try {
        await Promise.all([
            diningStore.fetchProducts(shop.id),
            fetchShopReviews(shop.id)
        ]);
        products.value = diningStore.productsByShop[shop.id] || [];
        shopDialog.value = true;
    } catch (error) {
        console.error("Error loading shop data:", error);
        $q.notify({
            type: 'negative',
            message: "Failed to load shop details",
            position: 'top'
        });
    } finally {
        isFetchingProducts.value = false;
        isFetchingReviews.value = false;
    }
};

const calculateAverageRating = (reviews) => {
    if (!reviews.length) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1); 
};

const fetchShopReviews = async (shopId) => {
    try {
        const q = query(collection(db, "shopReviews"), where("shopId", "==", shopId));
        const querySnapshot = await getDocs(q);
        const fetchedReviews = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt
        }));

        reviews.value = fetchedReviews;

        
        selectedShop.value.averageRating = calculateAverageRating(fetchedReviews);
        selectedShop.value.reviewCount = fetchedReviews.length;
    } catch (error) {
        console.error("Error fetching reviews:", error);
    }
};

const fetchAllShopReviews = async () => {
    try {
        const q = query(collection(db, "shopReviews"));
        const querySnapshot = await getDocs(q);
        const allReviews = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt
        }));
        
        const reviewsByShop = {};
        allReviews.forEach(review => {
            if (!reviewsByShop[review.shopId]) {
                reviewsByShop[review.shopId] = [];
            }
            reviewsByShop[review.shopId].push(review);
        });
        
        diningStore.shops.forEach(shop => {
            const shopReviews = reviewsByShop[shop.id] || [];
            shop.averageRating = calculateAverageRating(shopReviews);
            shop.reviewCount = shopReviews.length;
        });
    } catch (error) {
        console.error("Error fetching all shop reviews:", error);
    }
};

const submitReview = async () => {
    isSubmittingReview.value = true;
    try {
        if (!authStore.user) {
            throw new Error('Please login to submit a review');
        }

        const reviewData = {
            shopId: newReview.value.shopId,
            userId: authStore.user.uid,
            userName: authStore.user.displayName || 'Anonymous',
            rating: newReview.value.rating,
            comment: newReview.value.comment,
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "shopReviews"), reviewData);

        $q.notify({
            type: 'positive',
            message: 'Review submitted successfully!',
            position: 'top'
        });

        
        if (shopDialog.value) {
            await fetchShopReviews(newReview.value.shopId);
        }

        
        newReview.value = {
            shopId: newReview.value.shopId,
            rating: 0,
            comment: ''
        };

        
        if (reviewPromptDialog.value) {
            reviewPromptDialog.value = false;
            lastOrderShop.value = null;
        }
    } catch (error) {
        console.error("Error submitting review:", error);
        $q.notify({
            type: 'negative',
            message: error.message || 'Failed to submit review',
            position: 'top'
        });
    } finally {
        isSubmittingReview.value = false;
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

        
        const shopId = cart.value[0]?.shopId;

        
        await cartStore.placeOrder();

        
        $q.notify({
            type: 'positive',
            message: "Order placed successfully!",
            position: 'top'
        });

        
        cartDialog.value = false;

        
        const shop = shops.value.find(s => s.id === shopId);
        if (shop) {
            lastOrderShop.value = shop;
            newReview.value.shopId = shop.id;
            reviewPromptDialog.value = true;
        }
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

onMounted(async () => {
    isFetchingShops.value = true;
    isFetchingCategories.value = true;
    try {
        await Promise.all([
            diningStore.fetchShops(),
            diningStore.fetchCategories()
        ]);
    
        await fetchAllShopReviews();
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