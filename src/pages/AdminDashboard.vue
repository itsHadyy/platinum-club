<template>
    <q-page class="q-pa-md">
        <div class="text-h5">Admin Dashboard - Approve Members</div>

        <q-list bordered separator>
            <q-item v-for="user in pendingUsers" :key="user.id">
                <q-item-section>
                    <q-item-label>{{ user.name }}</q-item-label>
                    <q-item-label caption>{{ user.email }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn label="Approve" color="green" @click="approveUser(user.id)" />
                    <q-btn label="Deny" color="red" class="q-ml-md" @click="denyUser(user.id)" />
                </q-item-section>
            </q-item>
        </q-list>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "src/boot/firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

const pendingUsers = ref([]);

const fetchPendingUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    pendingUsers.value = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.role === "pending");
};

const approveUser = async (id) => {
    await updateDoc(doc(db, "users", id), { role: "approved" });
    fetchPendingUsers();
};

const denyUser = async (id) => {
    await deleteDoc(doc(db, "users", id));
    fetchPendingUsers();
};

onMounted(fetchPendingUsers);
</script>