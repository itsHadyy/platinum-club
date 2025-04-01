import { defineStore } from "pinia";
import { useAuthStore } from "./useAuthStore";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
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

        async placeOrder() {
            if (this.cart.length === 0) return;

            const authStore = useAuthStore();
            if (!authStore.user) return;

            const order = {
                userId: authStore.user.id,
                items: this.cart,
                total: this.cartTotal,
                status: "Pending",
                createdAt: new Date(),
            };

            await addDoc(collection(db, "orders"), order);
            this.cart = [];
        },

        async fetchUserOrders() {
            const authStore = useAuthStore();
            if (!authStore.user) return [];

            const q = query(collection(db, "orders"), where("userId", "==", authStore.user.id));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
    },
});