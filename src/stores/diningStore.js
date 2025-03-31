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

    // Fetch all shops from Firestore
    const fetchShops = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "shops"));
            const shopData = [];

            for (const docSnap of querySnapshot.docs) {
                const shop = { id: docSnap.id, ...docSnap.data() };
                shopData.push(shop);
                await fetchProducts(shop.id); // Fetch products for each shop
            }

            shops.value = shopData;
        } catch (error) {
            console.error("Error fetching shops:", error);
        }
    };

    // Fetch products under a specific shop
    const fetchProducts = async (shopId) => {
        try {
            const querySnapshot = await getDocs(collection(db, `shops/${shopId}/products`));
            const productData = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            productsByShop.value[shopId] = productData;
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // Add a new shop
    const addShop = async (shopData) => {
        try {
            const docRef = await addDoc(collection(db, "shops"), shopData);
            shopData.id = docRef.id; // Assign Firestore ID
            shops.value.push(shopData);
            console.log(`Shop added: ${shopData.name}`);
        } catch (error) {
            console.error("Error adding shop:", error);
        }
    };

    // Upload image to Firebase Storage
    const uploadImage = async (file, path) => {
        const storagePath = storageRef(storage, path);
        await uploadBytes(storagePath, file);
        return getDownloadURL(storagePath);
    };

    // Add a product under a shop
    const addProduct = async (shopId, productData) => {
        try {
            const docRef = await addDoc(collection(db, `shops/${shopId}/products`), productData);
            productData.id = docRef.id; // Assign Firestore ID

            if (!productsByShop.value[shopId]) {
                productsByShop.value[shopId] = [];
            }
            productsByShop.value[shopId].push(productData);
            console.log(`Product added: ${productData.name}`);
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    // Update a shop
    const updateShop = async (shopId, updatedShopData) => {
        try {
            const shopRef = doc(db, "shops", shopId);
            await updateDoc(shopRef, updatedShopData);
            shops.value = shops.value.map(shop => (shop.id === shopId ? updatedShopData : shop));
        } catch (error) {
            console.error("Error updating shop:", error);
        }
    };

    // Update a product
    const updateProduct = async (shopId, productId, updatedProductData) => {
        try {
            const productRef = doc(db, `shops/${shopId}/products`, productId);
            await updateDoc(productRef, updatedProductData);
            productsByShop.value[shopId] = productsByShop.value[shopId].map(product =>
                product.id === productId ? updatedProductData : product
            );
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    // Delete a shop
    const deleteShop = async (shopId) => {
        try {
            await deleteDoc(doc(db, "shops", shopId));
            shops.value = shops.value.filter(shop => shop.id !== shopId);
            delete productsByShop.value[shopId]; // Remove its products as well
        } catch (error) {
            console.error("Error deleting shop:", error);
        }
    };

    // Delete a product
    const deleteProduct = async (shopId, productId) => {
        try {
            await deleteDoc(doc(db, `shops/${shopId}/products`, productId));
            productsByShop.value[shopId] = productsByShop.value[shopId].filter(product => product.id !== productId);
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    onMounted(fetchShops);

    return {
        shops,
        productsByShop,
        fetchShops,
        fetchProducts,
        addShop,
        uploadImage,
        addProduct,
        updateShop,
        updateProduct,
        deleteShop,
        deleteProduct
    };
});