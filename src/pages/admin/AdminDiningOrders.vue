<template>
    <q-page class="q-pa-md">
        <h4>Orders - Dining & Shopping</h4>

        <!-- Loading indicator -->
        <q-inner-loading :showing="isLoading" />

        <!-- Filters -->
        <div class="row q-col-gutter-md q-mb-md">
            <!-- Shop filter -->
            <q-select v-model="selectedShop" :options="shopOptions" label="Filter by Shop" outlined dense clearable
                class="col-md-4 col-sm-6 col-xs-12" />

            <!-- User filter -->
            <q-input v-model="userFilter" label="Filter by User (Email or Phone)" outlined dense clearable
                class="col-md-4 col-sm-6 col-xs-12" />

            <!-- Date range filter -->
            <div class="col-md-4 col-sm-6 col-xs-12">
                <q-input v-model="dateRangeText" label="Filter by Date Range" outlined dense readonly>
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="dateRange" range>
                                    <div class="row items-center justify-end q-gutter-sm">
                                        <q-btn label="Cancel" color="primary" flat v-close-popup />
                                        <q-btn label="OK" color="primary" flat @click="applyDateFilter" v-close-popup />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                        <q-icon v-if="dateRange.from" name="cancel" class="cursor-pointer" @click="clearDateFilter" />
                    </template>
                </q-input>
            </div>

            <!-- Status filter -->
            <q-select v-model="selectedStatus" :options="statusOptions" label="Filter by Status" outlined dense
                clearable class="col-md-4 col-sm-6 col-xs-12" />
        </div>

        <!-- Orders Table -->
        <q-table :rows="filteredOrders" :columns="columns" row-key="id" :pagination="pagination" :loading="isLoading"
            flat bordered>
            <template v-slot:body-cell-status="props">
                <q-td :props="props">
                    <q-badge :color="getStatusColor(props.value)">
                        {{ props.value }}
                    </q-badge>
                </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                    <q-btn icon="visibility" size="sm" flat dense @click="viewOrderDetails(props.row)" />
                    <q-btn icon="edit" size="sm" flat dense @click="editOrderStatus(props.row)" class="q-ml-sm" />
                </q-td>
            </template>

            <template v-slot:body-cell-items="props">
                <q-td :props="props">
                    <q-btn label="View Items" size="sm" flat dense @click="viewOrderItems(props.row)" />
                </q-td>
            </template>
        </q-table>

        <!-- Order Details Dialog -->
        <q-dialog v-model="orderDialog" maximized>
            <q-card>
                <q-card-section class="row items-center q-pb-none">
                    <div class="text-h6">Order Details</div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>

                <q-card-section v-if="selectedOrder">
                    <div class="row q-col-gutter-md">
                        <div class="col-md-6 col-xs-12">
                            <q-card flat bordered>
                                <q-card-section>
                                    <div class="text-h6">Order Information</div>
                                </q-card-section>

                                <q-separator />

                                <q-card-section>
                                    <div class="row q-col-gutter-y-sm">
                                        <div class="col-6">
                                            <strong>Order ID:</strong>
                                            <div>{{ selectedOrder.id }}</div>
                                        </div>
                                        <div class="col-6">
                                            <strong>Date:</strong>
                                            <div>{{ formatDate(selectedOrder.createdAt) }}</div>
                                        </div>
                                        <div class="col-6">
                                            <strong>Status:</strong>
                                            <div>
                                                <q-badge :color="getStatusColor(selectedOrder.status)">
                                                    {{ selectedOrder.status }}
                                                </q-badge>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <strong>Total:</strong>
                                            <div>{{ selectedOrder.total }} EGP</div>
                                        </div>
                                    </div>
                                </q-card-section>
                            </q-card>

                            <q-card flat bordered class="q-mt-md">
                                <q-card-section>
                                    <div class="text-h6">Shop Information</div>
                                </q-card-section>

                                <q-separator />

                                <q-card-section>
                                    <div class="row items-center">
                                        <q-avatar size="60px" class="q-mr-sm">
                                            <q-img :src="selectedOrder.shopImage" />
                                        </q-avatar>
                                        <div>
                                            <div class="text-bold">{{ selectedOrder.shopName }}</div>
                                            <div>{{ selectedOrder.shopLocation }}</div>
                                        </div>
                                    </div>
                                </q-card-section>
                            </q-card>

                            <q-card flat bordered class="q-mt-md">
                                <q-card-section>
                                    <div class="text-h6">Customer Information</div>
                                </q-card-section>

                                <q-separator />

                                <q-card-section>
                                    <div class="row q-col-gutter-y-sm">
                                        <div class="col-6">
                                            <strong>Name:</strong>
                                            <div>{{ selectedOrder.userName || 'N/A' }}</div>
                                        </div>
                                        <div class="col-6">
                                            <strong>Email:</strong>
                                            <div>{{ selectedOrder.userEmail || 'N/A' }}</div>
                                        </div>
                                        <div class="col-6">
                                            <strong>Phone:</strong>
                                            <div>{{ selectedOrder.userPhone || 'N/A' }}</div>
                                        </div>
                                        <div class="col-6">
                                            <strong>User ID:</strong>
                                            <div>{{ selectedOrder.userId }}</div>
                                        </div>
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>

                        <div class="col-md-6 col-xs-12">
                            <q-card flat bordered>
                                <q-card-section>
                                    <div class="text-h6">Order Items</div>
                                </q-card-section>

                                <q-separator />

                                <q-card-section>
                                    <q-list bordered separator>
                                        <q-item v-for="item in selectedOrder.items" :key="item.id">
                                            <q-item-section avatar>
                                                <q-img :src="item.image" width="50px" height="50px" />
                                            </q-item-section>
                                            <q-item-section>
                                                <q-item-label class="text-bold">{{ item.name }}</q-item-label>
                                                <q-item-label caption>{{ item.category }}</q-item-label>
                                            </q-item-section>
                                            <q-item-section side>
                                                <div>{{ item.quantity }} × {{ item.price }} EGP</div>
                                                <div class="text-bold">{{ (item.quantity * item.price).toFixed(2) }} EGP
                                                </div>
                                            </q-item-section>
                                        </q-item>
                                    </q-list>

                                    <div class="row justify-end q-mt-md">
                                        <div class="col-auto">
                                            <div class="text-h6">Total: {{ selectedOrder.total }} EGP</div>
                                        </div>
                                    </div>
                                </q-card-section>
                            </q-card>

                            <q-card flat bordered class="q-mt-md">
                                <q-card-section>
                                    <div class="text-h6">Update Status</div>
                                </q-card-section>

                                <q-separator />

                                <q-card-section>
                                    <q-select v-model="selectedOrder.status" :options="statusOptions"
                                        label="Order Status" outlined dense />
                                    <q-btn label="Update Status" color="primary" class="q-mt-md"
                                        @click="updateOrderStatus" :loading="isUpdatingStatus" />
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- Order Items Dialog -->
        <q-dialog v-model="itemsDialog">
            <q-card style="min-width: 300px">
                <q-card-section>
                    <div class="text-h6">Order Items</div>
                </q-card-section>

                <q-card-section v-if="selectedOrder">
                    <q-list bordered separator>
                        <q-item v-for="item in selectedOrder.items" :key="item.id">
                            <q-item-section avatar>
                                <q-img :src="item.image" width="40px" height="40px" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label class="text-bold">{{ item.name }}</q-item-label>
                                <q-item-label caption>{{ item.category }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <div>{{ item.quantity }} × {{ item.price }} EGP</div>
                                <div class="text-bold">{{ (item.quantity * item.price).toFixed(2) }} EGP</div>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Close" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { collection, query, getDocs, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from 'src/boot/firebase';

const $q = useQuasar();

// Data
const allOrders = ref([]);
const isLoading = ref(false);
const isUpdatingStatus = ref(false);
const orderDialog = ref(false);
const itemsDialog = ref(false);
const selectedOrder = ref(null);

// Filters
const selectedShop = ref(null);
const userFilter = ref('');
const dateRange = ref({ from: null, to: null });
const selectedStatus = ref(null);

// Columns for the table
const columns = [
    {
        name: 'id',
        label: 'Order ID',
        field: 'id',
        align: 'left',
        sortable: true
    },
    {
        name: 'date',
        label: 'Date',
        field: row => formatDate(row.createdAt),
        align: 'left',
        sortable: true
    },
    {
        name: 'shop',
        label: 'Shop',
        field: row => row.shopName,
        align: 'left',
        sortable: true
    },
    {
        name: 'user',
        label: 'User',
        field: row => row.userName || row.userEmail || row.userId,
        align: 'left',
        sortable: true
    },
    {
        name: 'total',
        label: 'Total',
        field: 'total',
        align: 'right',
        sortable: true,
        format: val => `${val} EGP`
    },
    {
        name: 'status',
        label: 'Status',
        field: 'status',
        align: 'center',
        sortable: true
    },
    {
        name: 'items',
        label: 'Items',
        field: 'items',
        align: 'center'
    },
    {
        name: 'actions',
        label: 'Actions',
        field: 'actions',
        align: 'center'
    }
];

// Pagination
const pagination = ref({
    sortBy: 'date',
    descending: true,
    page: 1,
    rowsPerPage: 10
});

// Status options
const statusOptions = ['Pending', 'Processing', 'Completed', 'Cancelled'];

// Computed properties
const shopOptions = computed(() => {
    const shops = new Set();
    allOrders.value.forEach(order => {
        if (order.shopName) {
            shops.add(order.shopName);
        }
    });
    return Array.from(shops).sort();
});

const dateRangeText = computed(() => {
    if (!dateRange.value.from) return '';
    if (!dateRange.value.to) return formatDate(dateRange.value.from);
    return `${formatDate(dateRange.value.from)} - ${formatDate(dateRange.value.to)}`;
});

const filteredOrders = computed(() => {
    return allOrders.value.filter(order => {
        // Filter by shop
        if (selectedShop.value && order.shopName !== selectedShop.value) {
            return false;
        }

        // Filter by user (email or phone)
        if (userFilter.value) {
            const searchTerm = userFilter.value.toLowerCase();
            const userEmail = order.userEmail?.toLowerCase() || '';
            const userPhone = order.userPhone?.toLowerCase() || '';
            const userName = order.userName?.toLowerCase() || '';

            if (!userEmail.includes(searchTerm) &&
                !userPhone.includes(searchTerm) &&
                !userName.includes(searchTerm)) {
                return false;
            }
        }

        // Filter by status
        if (selectedStatus.value && order.status !== selectedStatus.value) {
            return false;
        }

        // Filter by date range
        if (dateRange.value.from || dateRange.value.to) {
            const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
            const fromDate = dateRange.value.from ? new Date(dateRange.value.from) : null;
            const toDate = dateRange.value.to ? new Date(dateRange.value.to) : null;

            if (fromDate && orderDate < fromDate) return false;
            if (toDate && orderDate > toDate) return false;
        }

        return true;
    });
});

// Methods
const formatDate = (date) => {
    if (!date) return '';

    let jsDate;
    if (date.toDate) {
        jsDate = date.toDate();
    } else if (date.seconds) {
        jsDate = new Date(date.seconds * 1000);
    } else {
        jsDate = new Date(date);
    }

    return jsDate.toLocaleDateString() + ' ' + jsDate.toLocaleTimeString();
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

const applyDateFilter = () => {
    // The date picker already updates the dateRange ref
};

const clearDateFilter = () => {
    dateRange.value = { from: null, to: null };
};

const fetchAllOrders = async () => {
    isLoading.value = true;
    try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        allOrders.value = await Promise.all(querySnapshot.docs.map(async (orderDoc) => {
            const data = orderDoc.data();

            // Get user details from order's userInfo or fetch from users collection
            let userDetails = data.userInfo || {};
            if (data.userId && !userDetails.email) {
                try {
                    const userDocRef = doc(db, 'users', data.userId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        userDetails = userDocSnap.data();
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                }
            }

            // Get shop details if shopId exists
            let shopDetails = {};
            if (data.shopId) {
                try {
                    const shopDocRef = doc(db, 'shops', data.shopId);
                    const shopDocSnap = await getDoc(shopDocRef);
                    if (shopDocSnap.exists()) {
                        shopDetails = shopDocSnap.data();
                    }
                } catch (error) {
                    console.error('Error fetching shop details:', error);
                }
            }

            return {
                id: orderDoc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                // User details
                userName: userDetails.fullName ||
                    `${userDetails.firstName || ''} ${userDetails.middleName || ''} ${userDetails.lastName || ''}`.trim() ||
                    'Unknown User',
                userEmail: userDetails.email || '',
                userPhone: userDetails.phone || userDetails.phoneNumber || '',
                // Shop details
                shopName: shopDetails.name || data.shopName || 'Unknown Shop',
                shopImage: shopDetails.image || data.shopImage || '',
                shopLocation: shopDetails.location || data.shopLocation || ''
            };
        }));
    } catch (error) {
        console.error('Error fetching orders:', error);
        $q.notify({
            type: 'negative',
            message: 'Failed to load orders'
        });
    } finally {
        isLoading.value = false;
    }
};

const viewOrderDetails = (order) => {
    selectedOrder.value = order;
    orderDialog.value = true;
};

const viewOrderItems = (order) => {
    selectedOrder.value = order;
    itemsDialog.value = true;
};

const editOrderStatus = (order) => {
    selectedOrder.value = order;
    orderDialog.value = true;
};

const updateOrderStatus = async () => {
    if (!selectedOrder.value) return;

    isUpdatingStatus.value = true;
    try {
        await updateDoc(doc(db, 'orders', selectedOrder.value.id), {
            status: selectedOrder.value.status
        });

        $q.notify({
            type: 'positive',
            message: 'Order status updated successfully'
        });

        // Refresh the orders list
        await fetchAllOrders();
    } catch (error) {
        console.error('Error updating order status:', error);
        $q.notify({
            type: 'negative',
            message: 'Failed to update order status'
        });
    } finally {
        isUpdatingStatus.value = false;
    }
};

// Lifecycle hooks
onMounted(() => {
    fetchAllOrders();
});
</script>

<style scoped>
.q-table__container {
    box-shadow: none;
    border: 1px solid #e0e0e0;
}

.q-card {
    border-radius: 8px;
}

.q-badge {
    font-size: 0.75em;
    padding: 2px 8px;
    border-radius: 4px;
}
</style>