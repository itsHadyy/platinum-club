import { defineStore } from "pinia";
import { useAuthStore } from "./useAuthStore";
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "src/boot/firebase";

export const useCartStore = defineStore("cart", {
    state: () => ({
        cart: [],
    }),

    getters: {
        cartTotal: (state) => state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        cartItemCount: (state) => state.cart.reduce((count, item) => count + item.quantity, 0),
    },

    actions: {
        addToCart(product) {
            const existingItem = this.cart.find(item => item.id === product.id);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                this.cart.push({ ...product, quantity: 1 });
            }
        },

        updateCartQuantity(productId, amount) {
            const index = this.cart.findIndex(item => item.id === productId);
            if (index !== -1) {
                this.cart[index].quantity += amount;
                if (this.cart[index].quantity <= 0) {
                    this.cart.splice(index, 1);
                }
            }
        },

        removeFromCart(productId) {
            this.cart = this.cart.filter(item => item.id !== productId);
        },

        clearCart() {
            this.cart = [];
        },

        async placeOrder() {
            try {
                const authStore = useAuthStore();
                const userId = authStore.user?.uid;

                if (!userId) throw new Error('User not authenticated');
                if (this.cart.length === 0) throw new Error('Cart is empty');

                // Fetch complete user data from Firestore
                const userDoc = await getDoc(doc(db, "users", userId));
                if (!userDoc.exists()) throw new Error('User data not found');

                const userData = userDoc.data();
                const fullName = `${userData.firstName} ${userData.middleName ? userData.middleName + ' ' : ''}${userData.lastName}`.trim();

                const orderData = {
                    userId,
                    userInfo: {
                        fullName,
                        email: userData.email,
                        phone: userData.phone,
                        nationalId: userData.nationalId || null // Include if available
                    },
                    items: this.cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: Number(item.price),
                        quantity: Number(item.quantity),
                        image: item.image || null
                    })),
                    total: Number(this.cartTotal),
                    status: "Pending",
                    createdAt: serverTimestamp()
                };

                const orderRef = await addDoc(collection(db, "orders"), orderData);
                this.clearCart();
                return orderRef.id;
            } catch (error) {
                console.error("Order placement failed:", error);
                throw error;
            }
        },

        async fetchUserOrders() {
            const authStore = useAuthStore();
            if (!authStore.user?.uid) return [];

            try {
                const q = query(collection(db, "orders"), where("userId", "==", authStore.user.uid));
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Convert Firestore timestamp to JS Date if needed
                    createdAt: doc.data().createdAt?.toDate()
                }));
            } catch (error) {
                console.error("Error fetching orders:", error);
                throw error;
            }
        },
    },
});