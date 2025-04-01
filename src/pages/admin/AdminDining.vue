<template>
    <q-page class="q-pa-md">
        <h4>Manage Dining & Shopping</h4>

        <q-btn label="Add Shop/Restaurant" color="secondary" @click="openAddShopDialog" class="q-mb-md" />

        <q-list bordered separator v-if="shops.length">
            <q-item v-for="shop in shops" :key="shop.id">
                <q-item-section avatar>
                    <q-img :src="shop.image" style="width: 50px; height: 50px; border-radius: 50%;" />
                </q-item-section>
                <q-item-section>
                    <q-item-label><strong>{{ shop.name }}</strong></q-item-label>
                    <q-item-label caption>🏠 {{ shop.location }} | ⭐ {{ shop.rating }} | ⏳ {{ shop.deliveryTime }}
                        min</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn label="Manage Products" color="secondary" @click="openManageProducts(shop)" />
                    <q-btn label="Edit" color="primary" @click="openEditShopDialog(shop)" />
                    <q-btn label="Delete" color="negative" flat @click="deleteShop(shop.id)" />
                </q-item-section>
            </q-item>
        </q-list>

        <!-- Add/Edit Shop Dialog -->
        <q-dialog v-model="shopDialog">
            <q-card class="q-pa-md">
                <q-card-section>
                    <h5>{{ editingShop ? "Edit Shop" : "Add New Shop" }}</h5>
                    <q-input v-model="newShop.name" label="Name" dense outlined class="q-mb-md" />
                    <q-input v-model="newShop.deliveryTime" label="Delivery Time (minutes)" type="number" dense outlined
                        class="q-mb-md" />
                    <q-input v-model="newShop.location" label="Location" dense outlined class="q-mb-md" />
                    <q-file v-model="newShop.imageFile" label="Upload Image" dense outlined class="q-mb-md"
                        @update:model-value="uploadImage" />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn :label="editingShop ? 'Save' : 'Add Shop'" color="primary" @click="saveShop" />
                    <q-btn label="Cancel" color="negative" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Manage Products Dialog -->
        <q-dialog v-model="manageProductsDialog">
            <q-card class="q-pa-md" style="min-width: 500px;">
                <q-card-section>
                    <h5>Manage Products - {{ selectedShop?.name }}</h5>
                    <q-btn label="Add Product" color="secondary" @click="openAddProductDialog" class="q-mb-md" />
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
                            <q-btn label="Edit" color="primary" @click="editProduct(product)" />
                            <q-btn label="Delete" color="negative" flat @click="deleteProduct(product.id)" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </q-dialog>

        <!-- Add/Edit Product Dialog -->
        <q-dialog v-model="productDialog">
            <q-card class="q-pa-md">
                <q-card-section>
                    <h5>{{ editingProduct ? "Edit Product" : "Add Product" }}</h5>
                    <q-input v-model="newProduct.name" label="Product Name" dense outlined class="q-mb-md" />
                    <q-input v-model.number="newProduct.price" type="number" label="Price (EGP)" dense outlined
                        class="q-mb-md" />
                    <q-input v-model="newProduct.description" label="Description" dense outlined class="q-mb-md" />

                    <q-select v-model="newProduct.category" :options="categories" label="Category" dense outlined
                        class="q-mb-md">
                        <template v-slot:after>
                            <q-btn icon="add" flat @click="addNewCategory" />
                        </template>
                    </q-select>

                    <q-file v-model="newProduct.imageFile" label="Upload Image" dense outlined class="q-mb-md"
                        @update:model-value="uploadProductImage" />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn :label="editingProduct ? 'Save' : 'Add Product'" color="primary" @click="saveProduct" />
                    <q-btn label="Cancel" color="negative" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useDiningStore } from "src/stores/diningStore";

const store = useDiningStore();
const shops = computed(() => store.shops);
const categories = computed(() => store.categories || []);

const shopDialog = ref(false);
const manageProductsDialog = ref(false);
const productDialog = ref(false);

const selectedShop = ref(null);
const newShop = ref({ name: "", deliveryTime: "", location: "", imageFile: null });
const newProduct = ref({ name: "", price: "", description: "", category: "", imageFile: null });

const editingShop = ref(false);
const editingProduct = ref(false);
const products = ref([]);

const openAddShopDialog = () => {
    newShop.value = { name: "", deliveryTime: "", location: "", imageFile: null };
    editingShop.value = false;
    shopDialog.value = true;
};

const openEditShopDialog = (shop) => {
    newShop.value = { ...shop };
    editingShop.value = true;
    shopDialog.value = true;
};

const openManageProducts = async (shop) => {
    selectedShop.value = shop;
    manageProductsDialog.value = true;
    await store.fetchProducts(shop.id);
    products.value = store.productsByShop[shop.id] || [];
};

const openAddProductDialog = () => {
    newProduct.value = { name: "", price: "", description: "", category: "", imageFile: null };
    editingProduct.value = false;
    productDialog.value = true;
};

const editProduct = (product) => {
    newProduct.value = { ...product };
    editingProduct.value = true;
    productDialog.value = true;
};

const addNewCategory = () => {
    const newCategory = prompt("Enter new category:");
    if (newCategory && newCategory.trim()) { 
        store.addCategory(newCategory.trim());
    }
};

const saveShop = async () => {
    if (editingShop.value) {
        await store.updateShop(newShop.value.id, newShop.value);
    } else {
        await store.addShop(newShop.value);
    }
    shopDialog.value = false;
};

const saveProduct = async () => {
    if (editingProduct.value) {
        await store.updateProduct(selectedShop.value.id, newProduct.value.id, newProduct.value);
    } else {
        await store.addProduct(selectedShop.value.id, newProduct.value);
    }
    productDialog.value = false;
};

const deleteShop = async (shopId) => {
    await store.deleteShop(shopId);
};

const deleteProduct = async (productId) => {
    await store.deleteProduct(selectedShop.value.id, productId);
};

onMounted(store.fetchShops);
</script>