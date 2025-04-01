import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { db, storage } from "boot/firebase";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { uploadBytes, getDownloadURL, ref as storageRef } from "firebase/storage";

export const useDiningStore = defineStore("diningStore", () => {
    const shops = ref([]);
    const productsByShop = ref({});
    const categories = ref([]);

    const fetchShops = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "shops"));
            const shopData = [];

            for (const docSnap of querySnapshot.docs) {
                const shop = { id: docSnap.id, ...docSnap.data() };
                shopData.push(shop);
                await fetchProducts(shop.id);
            }

            shops.value = shopData;
        } catch (error) {
            console.error("Error fetching shops:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "categories"));
            categories.value = querySnapshot.docs.map(docSnap => docSnap.data().name);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const addCategory = async (newCategory) => {
        try {
            if (!categories.value.includes(newCategory)) {
                categories.value.push(newCategory);

                await addDoc(collection(db, "categories"), { name: newCategory });
            }
        } catch (error) {
            console.error("Error adding category:", error);
        }
    };

    const fetchProducts = async (shopId) => {
        try {
            const querySnapshot = await getDocs(collection(db, `shops/${shopId}/products`));
            const productData = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            productsByShop.value[shopId] = productData;
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const uploadImage = async (file, path) => {
        try {
            const storagePath = storageRef(storage, path);
            const snapshot = await uploadBytes(storagePath, file);
            return await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error("Error uploading image:", error);
            return null;
        }
    };

    const addShop = async (shopData) => {
        try {
            let imageUrl = "";
            if (shopData.imageFile) {
                imageUrl = await uploadImage(shopData.imageFile, `shops/${shopData.imageFile.name}`);
            }

            const newShop = {
                name: shopData.name,
                deliveryTime: shopData.deliveryTime,
                location: shopData.location,
                image: imageUrl, 
                rating: 0,
            };

            const docRef = await addDoc(collection(db, "shops"), newShop);
            newShop.id = docRef.id; 

            shops.value.push(newShop);
            console.log(`✅ Shop added: ${newShop.name}`);
        } catch (error) {
            console.error("Error adding shop:", error);
        }
    };

    const addProduct = async (shopId, productData) => {
        try {
            let imageUrl = "";
            if (productData.imageFile) {
                imageUrl = await uploadImage(productData.imageFile, `products/${productData.imageFile.name}`);
            }

            const newProduct = {
                name: productData.name,
                price: productData.price,
                description: productData.description,
                image: imageUrl,
            };

            const docRef = await addDoc(collection(db, `shops/${shopId}/products`), newProduct);
            newProduct.id = docRef.id; 

            if (!productsByShop.value[shopId]) {
                productsByShop.value[shopId] = [];
            }
            productsByShop.value[shopId].push(newProduct);
            console.log(`Product added: ${newProduct.name}`);
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    const updateShop = async (shopId, updatedShopData) => {
        try {
            const shopRef = doc(db, "shops", shopId);
            await updateDoc(shopRef, updatedShopData);
            shops.value = shops.value.map(shop => (shop.id === shopId ? { ...shop, ...updatedShopData } : shop));
        } catch (error) {
            console.error("Error updating shop:", error);
        }
    };

    const updateProduct = async (shopId, productId, updatedProductData) => {
        try {
            const productRef = doc(db, `shops/${shopId}/products`, productId);
            await updateDoc(productRef, updatedProductData);
            productsByShop.value[shopId] = productsByShop.value[shopId].map(product =>
                product.id === productId ? { ...product, ...updatedProductData } : product
            );
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    const deleteShop = async (shopId) => {
        try {
            await deleteDoc(doc(db, "shops", shopId));
            shops.value = shops.value.filter(shop => shop.id !== shopId);
            delete productsByShop.value[shopId];
            console.log("✅ Shop deleted successfully.");
        } catch (error) {
            console.error("Error deleting shop:", error);
        }
    };

    const deleteProduct = async (shopId, productId) => {
        try {
            await deleteDoc(doc(db, `shops/${shopId}/products`, productId));
            productsByShop.value[shopId] = productsByShop.value[shopId].filter(product => product.id !== productId);
            console.log("✅ Product deleted successfully.");
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const orders = ref([]);

    const placeOrder = async (order) => {
        try {
            const docRef = await addDoc(collection(db, "orders"), order);
            order.id = docRef.id;
            orders.value.push(order);
            console.log("✅ Order placed successfully");
        } catch (error) {
            console.error("Error placing order:", error);
        }
    };

    const fetchUserOrders = async (userId) => {
        try {
            const querySnapshot = await getDocs(collection(db, "orders"));
            return querySnapshot.docs
                .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
                .filter(order => order.userId === userId);
        } catch (error) {
            console.error("Error fetching orders:", error);
            return [];
        }
    };

    onMounted(() => {
        fetchShops();
        fetchCategories();
    });

    return {
        shops,
        productsByShop,
        categories,
        fetchCategories,
        addCategory,
        fetchShops,
        fetchProducts,
        addShop,
        uploadImage,
        addProduct,
        updateShop,
        updateProduct,
        deleteShop,
        deleteProduct,
        placeOrder,
        fetchUserOrders
    };
});