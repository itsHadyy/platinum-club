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
        addToCart(product, shopId) {
            const cartProduct = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image || null,
                category: product.category || null,
                shopId: shopId 
            };
        
            const existingItem = this.cart.find(item => item.id === cartProduct.id);
        
            if (!shopId) {
                console.error('Shop ID is missing');
                throw new Error('Shop ID is required');
            }
        
            if (this.cart.length > 0 && this.cart[0].shopId !== shopId) {
                throw new Error('Cannot mix products from different shops in one order');
            }
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                this.cart.push({
                    ...cartProduct,
                    quantity: 1
                });
            }
        },

        validateCart() {
            if (this.cart.length === 0) return false;
            return this.cart.every(item => item.shopId && item.shopId === this.cart[0].shopId);
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
            if (!this.validateCart()) {
                throw new Error('Invalid cart state - shop information missing or inconsistent');
            }
            
            try {
                const authStore = useAuthStore();
                const userId = authStore.user?.uid;
        
                if (!userId) throw new Error('User not authenticated');
                if (this.cart.length === 0) throw new Error('Cart is empty');
                
                const shopId = this.cart[0]?.shopId;
                if (!shopId) throw new Error('Shop information missing');
                
                
                const userDoc = await getDoc(doc(db, "users", userId));
                if (!userDoc.exists()) throw new Error('User data not found');
                const userData = userDoc.data();
        
                
                const shopDoc = await getDoc(doc(db, "shops", shopId));
                if (!shopDoc.exists()) throw new Error('Shop data not found');
                const shopData = shopDoc.data();
        
                
                const orderData = {
                    
                    userId,
                    userName: userData.fullName || `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim(),
                    userEmail: userData.email,
                    userPhone: userData.phone,
                    userNationalId: userData.nationalId,
                    
                    
                    shopId,
                    shopName: shopData.name,
                    shopImage: shopData.image,
                    shopLocation: shopData.location,
                    shopDeliveryTime: shopData.deliveryTime,
                    
                    
                    items: this.cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: Number(item.price),
                        quantity: Number(item.quantity),
                        image: item.image,
                        category: item.category
                    })),
                    
                    
                    total: Number(this.cartTotal),
                    status: "Pending",
                    paymentMethod: "Cash on Delivery",
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };
        
                
                const orderRef = await addDoc(collection(db, "orders"), orderData);
                this.clearCart();
                
                return {
                    id: orderRef.id,
                    ...orderData
                };
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
                    createdAt: doc.data().createdAt?.toDate()
                }));
            } catch (error) {
                console.error("Error fetching orders:", error);
                throw error;
            }
        },
    },
});