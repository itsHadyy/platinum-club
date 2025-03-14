<template>
    <q-page class="q-pa-md">
        <q-card class="q-pa-md shadow-2">
            <q-card-section>
                <div class="text-h5 text-center text-secondary">Admin Panel</div>
            </q-card-section>

            <!-- Role Filter -->
            <q-card-section>
                <q-select v-model="selectedRole" :options="roleOptions" label="Filter by role" outlined dense emit-value
                    map-options />
            </q-card-section>

            <q-card-section>
                <q-banner v-if="loading" class="bg-blue text-white">Loading users...</q-banner>
                <q-banner v-if="error" class="bg-red text-white">{{ error }}</q-banner>

                <q-table v-if="filteredUsers.length" flat bordered :rows="filteredUsers" :columns="columns" row-key="id"
                    :rows-per-page-options="[5, 10, 20]" class="scroll">
                    <template v-slot:body-cell-name="props">
                        <q-td :props="props">
                            <q-btn flat dense @click="viewUserDetails(props.row)">
                                {{ props.row.firstName }} {{ props.row.middleName }} {{ props.row.lastName }}
                            </q-btn>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-role="props">
                        <q-td :props="props">
                            <q-badge v-if="props.row.role === 'admin'" color="blue" text-color="white">Admin</q-badge>
                            <q-badge v-else-if="props.row.role === 'user'" color="green"
                                text-color="white">User</q-badge>
                            <q-badge v-else color="orange" text-color="white">Pending</q-badge>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-actions="props">
                        <q-td :props="props">
                            <q-btn v-if="props.row.role === 'pending'" color="positive" icon="check" dense round
                                class="q-mr-sm" @click="updateRole(props.row.id, 'user')" />

                            <q-btn v-if="props.row.role === 'user'" color="warning" icon="admin_panel_settings" dense
                                round class="q-mr-sm" @click="confirmAdminPassword(props.row.id)" />

                            <q-btn color="negative" icon="delete" dense round class="q-mr-sm"
                                @click="confirmDeleteUser(props.row.id)" />
                        </q-td>
                    </template>

                    <template v-slot:body-cell-details="props">
                        <q-td :props="props">
                            <q-btn icon="visibility" flat dense @click="viewUserDetails(props.row)" />
                        </q-td>
                    </template>
                </q-table>

                <p v-else class="text-center text-grey q-mt-md">No users found.</p>
            </q-card-section>
        </q-card>

        <q-dialog v-model="showUserDialog">
            <q-card class="q-pa-md">
                <q-card-section class="text-center">
                    <q-avatar size="120px">
                        <img :src="selectedUser?.profileImage || defaultProfileImage"
                            :key="selectedUser?.profileImage" />
                    </q-avatar>

                    <q-btn v-if="isAdmin" flat dense icon="edit" class="q-mt-sm" color="primary"
                        @click="triggerFileInput">
                        <q-tooltip>Change Image</q-tooltip>
                    </q-btn>

                    <input ref="fileInput" type="file" accept="image/*" @change="updateUserImage"
                        class="hidden-file-input" />
                </q-card-section>

                <q-card-section>
                    <p><strong>Name:</strong> {{ selectedUser?.firstName }} {{ selectedUser?.middleName }} {{
                        selectedUser?.lastName }}</p>
                    <p><strong>Email:</strong> {{ selectedUser?.email }}</p>
                    <p><strong>Phone Number:</strong> {{ selectedUser?.phone }}</p>
                    <p><strong>Membership ID:</strong> {{ selectedUser?.membershipId }}</p>
                    <p><strong>National ID:</strong> {{ selectedUser?.nationalId }}</p>
                    <p><strong>Date of Birth:</strong> {{ selectedUser?.dob }}</p>
                    <p><strong>Role:</strong> {{ selectedUser?.role }}</p>

                    <p>
                        <strong>Image URL:</strong>
                        <button @click="copyImageUrl" title="Copy URL"
                            style="border: none; background: none; cursor: pointer;">
                            📋
                        </button>
                        <button onclick="toggleUrlVisibility()" title="View URL"
                            style="border: none; background: none; cursor: pointer;">
                            👁️
                        </button>
                        <span style="display: flex; align-items: center;">
                            <span id="imageUrl"
                                style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                {{ selectedUser?.profileImage }}
                            </span>
                        </span>
                    </p>

                    <p v-if="selectedUser?.createdAt"><strong>Joined:</strong> {{ selectedUser.createdAt }}</p>
                </q-card-section>

                <q-card-actions>
                    <q-btn flat label="Close" color="primary" v-close-popup class="bg-secondary" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from 'src/boot/firebase';

// Reactive State
const users = ref([]);
const loading = ref(true);
const error = ref("");
const selectedRole = ref("all");
const showUserDialog = ref(false);
const selectedUser = ref(null);
const isAdmin = true;
const fileInput = ref(null);

// Static Data
const ADMIN_PASSWORD = "Admin1234"; // Change this for security later
const defaultProfileImage = "https://cdn.quasar.dev/img/avatar5.png";

// Open File Input
const triggerFileInput = () => {
    fileInput.value.click();
};

const columns = [
    { name: "name", label: "Name", field: "firstName", align: "left" },
    { name: "email", label: "Email", field: "email", align: "left" },
    { name: "role", label: "Role", field: "role", align: "left" },
    { name: "actions", label: "Actions", align: "center" },
    { name: "details", label: "Details", align: "center" }
];

const roleOptions = [
    { label: "All", value: "all" },
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
    { label: "Pending", value: "pending" }
];

const filteredUsers = computed(() => {
    if (selectedRole.value === "all") {
        return users.value;
    }
    return users.value.filter(user => user.role === selectedRole.value);
});

const fetchUsers = async () => {
    loading.value = true;
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        users.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        console.error("Error fetching users:", err);
        error.value = "Failed to load users.";
    } finally {
        loading.value = false;
    }
};

const updateRole = async (userId, newRole) => {
    try {
        await setDoc(doc(db, "users", userId), { role: newRole }, { merge: true });
        fetchUsers();
        alert(`User role updated to ${newRole}`);
    } catch (err) {
        console.error("Error updating role:", err);
        alert("Failed to update role.");
    }
};

const confirmAdminPassword = async (userId) => {
    const password = prompt("Enter the admin password to approve:");
    if (password === ADMIN_PASSWORD) {
        updateRole(userId, "admin");
    } else {
        alert("Incorrect password! Action denied.");
    }
};

const confirmDeleteUser = async (userId) => {
    const confirmation = confirm("Are you sure you want to delete this user?");
    if (confirmation) {
        deleteUser(userId);
    }
};

const deleteUser = async (userId) => {
    try {
        await deleteDoc(doc(db, "users", userId));
        fetchUsers();
        alert("User deleted successfully.");
    } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user.");
    }
};

const viewUserDetails = (user) => {
    selectedUser.value = user;
    showUserDialog.value = true;
};

let isUrlVisible = false;

const copyImageUrl = () => {
    const imageUrl = selectedUser.value?.profileImage || '';

    if (!imageUrl) {
        alert('No image URL found');
        return;
    }

    navigator.clipboard.writeText(imageUrl)
        .then(() => alert('Image URL copied to clipboard!'))
        .catch(err => console.error('Failed to copy: ', err));
};

window.toggleUrlVisibility = function () {
    const urlElement = document.getElementById('imageUrl');
    isUrlVisible = !isUrlVisible;
    urlElement.style.whiteSpace = isUrlVisible ? 'normal' : 'nowrap';
    urlElement.style.maxWidth = isUrlVisible ? 'none' : 'auto';
}

const updateUserImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const fileRef = storageRef(storage, `profile_pictures/${selectedUser.value.id}`);

        const snapshot = await uploadBytes(fileRef, file);

        const imageUrl = await getDownloadURL(snapshot.ref);

        await updateDoc(doc(db, 'users', selectedUser.value.id), {
            imageUrl: imageUrl
        });

        selectedUser.value.profileImage = imageUrl;

    } catch (error) {
        console.error('Error updating user image:', error);
    }
};

onMounted(fetchUsers);
</script>

<style scoped>
.hidden-file-input {
    display: none;
}
</style>