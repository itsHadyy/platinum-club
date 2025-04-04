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

        <div class="fixed-bottom-right q-pa-md q-gutter-sm" style="z-index: 9999">
            <!-- View Orders Button -->
            <q-btn fab color="secondary" icon="receipt" @click="ordersDialog = true" class="orders-btn"
                :loading="isFetchingOrders">
                <q-badge v-if="orders.length" color="red" floating>{{ orders.length }}</q-badge>
            </q-btn>

            <!-- Cart Button -->
            <q-btn fab color="secondary" icon="shopping_cart" @click="cartDialog = true" class="cart-btn"
                :loading="isFetchingCart">
                <q-badge v-if="cartItemCount" color="red" floating>{{ cartItemCount }}</q-badge>
            </q-btn>
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
                    <div class="text-caption">Ordering from: {{ cart[0]?.shopName }}</div>
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
            <q-card class="q-pa-md full-width" style="max-width: 600px;">
                <q-card-section>
                    <div class="row items-center justify-between">
                        <h5 class="text-h6 text-bold q-ma-none">My Orders</h5>
                        <q-btn icon="refresh" flat round dense @click="fetchOrders" :loading="isFetchingOrders" />
                    </div>
                </q-card-section>

                <q-separator />

                <q-card-section v-if="orders.length" class="q-pa-none">
                    <q-list bordered separator>
                        <q-item v-for="order in orders" :key="order.id" class="q-pa-sm">
                            <q-item-section avatar>
                                <q-avatar>
                                    <q-img :src="order.shopImage" />
                                </q-avatar>
                            </q-item-section>
                            <q-item-section>
                                <div class="row items-center">
                                    <div class="col">
                                        <q-item-label class="text-bold">{{ order.shopName }}</q-item-label>
                                        <q-item-label caption>
                                            🏠 {{ order.shopLocation }} •
                                            {{ formatDate(order.createdAt) }} •
                                            <q-badge :color="getStatusColor(order.status)">
                                                {{ order.status }}
                                            </q-badge>
                                        </q-item-label>
                                    </div>
                                    <div class="col-auto text-right q-gutter-xs">
                                        <q-item-label class="text-bold">💰 {{ order.total }} EGP</q-item-label>
                                        <q-btn v-if="canCancelOrder(order)" icon="cancel" color="negative" size="sm"
                                            round flat @click="cancelOrder(order)" :loading="isCancellingOrder"
                                            :disable="isCancellingOrder">
                                            <q-tooltip>Cancel Order</q-tooltip>
                                        </q-btn>
                                    </div>
                                </div>

                                <q-expansion-item v-if="order.items && order.items.length" label="Order Items"
                                    class="q-mt-sm">
                                    <q-card>
                                        <q-card-section>
                                            <q-list dense>
                                                <q-item v-for="item in order.items" :key="item.id">
                                                    <q-item-section avatar>
                                                        <q-img :src="item.image" width="40px" height="40px" />
                                                    </q-item-section>
                                                    <q-item-section>
                                                        <q-item-label>{{ item.name }}</q-item-label>
                                                        <q-item-label caption>
                                                            {{ item.quantity }} × {{ item.price }} EGP
                                                        </q-item-label>
                                                    </q-item-section>
                                                    <q-item-section side>
                                                        {{ (item.quantity * item.price).toFixed(2) }} EGP
                                                    </q-item-section>
                                                </q-item>
                                            </q-list>
                                        </q-card-section>
                                    </q-card>
                                </q-expansion-item>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>

                <div v-else class="text-center q-pa-md">
                    <q-icon name="receipt_long" size="xl" />
                    <p>No orders yet</p>
                </div>

                <q-card-actions align="right">
                    <q-btn label="Close" color="primary" v-close-popup />
                </q-card-actions>

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
import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy, getDoc, doc, updateDoc } from "firebase/firestore";
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
const isCancellingOrder = ref(false);

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


    if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
    }

    else if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }

    else if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
    }

    else if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString();
    }

    return 'Invalid date';
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
        if (!selectedShop.value?.id) {
            throw new Error('No shop selected');
        }
        console.log('Adding product with shopId:', selectedShop.value.id);
        cartStore.addToCart({
            ...product,
            shopId: selectedShop.value.id
        }, selectedShop.value.id);
        $q.notify({
            type: 'positive',
            message: `${product.name} added to cart`,
            position: 'top'
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        $q.notify({
            type: 'negative',
            message: error.message || "Failed to add item to cart",
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

const fetchOrders = async () => {
    if (!authStore.user?.uid) {
        orders.value = [];
        return;
    }

    isFetchingOrders.value = true;
    try {
        const q = query(
            collection(db, "orders"),
            where("userId", "==", authStore.user.uid),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        orders.value = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();

            const createdAt = data.createdAt
                ? (data.createdAt.toDate ? data.createdAt.toDate()
                    : new Date(data.createdAt.seconds * 1000))
                : new Date();

            let shopDetails = {};
            if (data.shopId && !data.shopName) {
                try {
                    const shopDoc = await getDoc(doc(db, "shops", data.shopId));
                    if (shopDoc.exists()) {
                        shopDetails = {
                            shopName: shopDoc.data().name,
                            shopImage: shopDoc.data().image,
                            shopLocation: shopDoc.data().location
                        };
                    }
                } catch (shopError) {
                    console.warn("Couldn't fetch shop details:", shopError);
                }
            }

            return {
                id: doc.id,
                ...data,
                ...shopDetails,
                createdAt,

                shopName: data.shopName || shopDetails.shopName || "Unknown Shop",
                shopImage: data.shopImage || shopDetails.shopImage || "",
                shopLocation: data.shopLocation || shopDetails.shopLocation || ""
            };
        }));

    } catch (error) {
        console.error("Order fetch error:", error);
        if (error.code === 'failed-precondition') {

            try {
                const fallbackQuery = query(
                    collection(db, "orders"),
                    where("userId", "==", authStore.user.uid)
                );
                const snapshot = await getDocs(fallbackQuery);
                orders.value = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date(),

                    shopName: doc.data().shopName || "Unknown Shop",
                    shopImage: doc.data().shopImage || "",
                    shopLocation: doc.data().shopLocation || ""
                })).sort((a, b) => b.createdAt - a.createdAt);
            } catch (fallbackError) {
                console.error("Fallback query failed:", fallbackError);
                $q.notify({
                    type: 'negative',
                    message: "Failed to load orders",
                    position: 'top'
                });
            }
        } else {
            $q.notify({
                type: 'negative',
                message: "Failed to load orders",
                position: 'top'
            });
        }
    } finally {
        isFetchingOrders.value = false;
    }
};

const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case 'completed': return 'positive';
        case 'processing': return 'warning';
        case 'pending': return 'info';
        case 'cancelled': return 'negative';
        default: return 'grey';
    }
};

const canCancelOrder = (order) => {
    if (order.status !== 'Pending' && order.status !== 'Processing') {
        return false;
    }

    const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    return orderDate >= thirtyMinutesAgo;
};

// Add this method to handle order cancellation
const cancelOrder = async (order) => {
    isCancellingOrder.value = true;
    try {
        // First verify the order can still be cancelled
        if (!canCancelOrder(order)) {
            throw new Error('This order can no longer be cancelled');
        }

        // Update the order status in Firestore
        await updateDoc(doc(db, 'orders', order.id), {
            status: 'Cancelled',
            updatedAt: serverTimestamp()
        });

        $q.notify({
            type: 'positive',
            message: 'Order cancelled successfully',
            position: 'top'
        });

        // Refresh the orders list
        await fetchOrders();
    } catch (error) {
        console.error('Error cancelling order:', error);
        $q.notify({
            type: 'negative',
            message: error.message || 'Failed to cancel order',
            position: 'top'
        });
    } finally {
        isCancellingOrder.value = false;
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


        if (authStore.user) {
            await fetchOrders();
        }
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
    position: relative;
    margin-left: 10px;
}

.orders-btn {
    position: relative;
}

.fixed-bottom-right {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column-reverse;
}

/* Order items expansion */
.q-expansion-item__content {
    background: #f5f5f5;
    border-radius: 4px;
}

/* Status badges */
.q-badge {
    font-size: 0.75em;
    padding: 2px 6px;
}
</style>