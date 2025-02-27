<template>
    <div class="q-pa-md">
        <h2 class="text-center">Admin Panel</h2>

        <q-banner v-if="loading" class="bg-blue text-white q-mb-md">Loading users...</q-banner>
        <q-banner v-if="error" class="bg-red text-white q-mb-md">{{ error }}</q-banner>

        <q-table v-if="users.length" flat bordered :rows="users" :columns="columns" row-key="id">
            <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                    <q-btn v-if="props.row.role === 'pending'" color="positive" label="Approve"
                        @click="updateRole(props.row.id, 'user')" />
                    <q-btn v-if="props.row.role === 'user'" color="warning" label="Make Admin"
                        @click="updateRole(props.row.id, 'admin')" />
                </q-td>
            </template>
        </q-table>

        <p v-else class="text-center text-grey">No users found.</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from 'src/boot/firebase';

const users = ref([]);
const loading = ref(true);
const error = ref("");

const columns = [
    { name: "name", label: "Name", field: "name", align: "left" },
    { name: "email", label: "Email", field: "email", align: "left" },
    { name: "role", label: "Role", field: "role", align: "left" },
    { name: "actions", label: "Actions", align: "center" }
];

const fetchUsers = async () => {
    loading.value = true;
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        users.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Users fetched:", users.value); // Debugging
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
        fetchUsers(); // Refresh user list
        alert(`User role updated to ${newRole}`);
    } catch (err) {
        console.error("Error updating role:", err);
        alert("Failed to update role.");
    }
};

onMounted(fetchUsers);
</script>

<style scoped>
.q-btn {
    margin-right: 8px;
}
</style>