<template>
    <q-page class="q-pa-md">
        <q-bar class="bg-white text-dark">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-space />
        </q-bar>

        <div class="text-h5 text-bold text-center q-mb-md">Manage Courts</div>

        <!-- Add New Court -->
        <q-card class="q-pa-md q-mb-md">
            <q-card-section>
                <div class="text-h6">Add New Court</div>

                <q-input v-model="newCourt.number" label="Court Number" type="text" outlined dense class="q-mb-md" />
                <q-input v-model="newCourt.price" label="Price" type="number" outlined dense class="q-mb-md" />

                <!-- Select Sports -->
                <q-select v-model="newCourt.sports" :options="sportsOptions" label="Select Sports" outlined dense
                    multiple class="q-mb-md" />

                <q-input v-model="newCourt.details" label="Additional Details" outlined dense class="q-mb-md" />

                <q-btn color="secondary" label="Add Court" @click="addCourt" />
            </q-card-section>
        </q-card>

        <!-- List of Courts -->
        <q-list bordered separator>
            <q-item v-for="court in courtsList" :key="court.id">
                <q-item-section>
                    <q-item-label>
                        <strong>Court {{ court.number }}</strong> - Price: ${{ court.price }}
                    </q-item-label>
                    <q-item-label caption>Sports: {{ court.sports.join(", ") }}</q-item-label>
                    <q-item-label caption v-if="court.details">Details: {{ court.details }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn color="negative" flat dense icon="delete" @click="removeCourt(court.id)" />
                </q-item-section>
            </q-item>
        </q-list>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "boot/firebase";
import { useSportsStore } from "stores/sportsStore";

const sportsStore = useSportsStore();
const sportsOptions = sportsStore.sportsOptions;

const courtsList = ref([]);
const newCourt = ref({ number: "", price: "", sports: [], details: "" });

// Fetch all courts from Firestore
const fetchCourts = async () => {
    const querySnapshot = await getDocs(collection(db, "courtsCollection"));
    courtsList.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

// Add a new court
const addCourt = async () => {
    if (!newCourt.value.number || !newCourt.value.price || newCourt.value.sports.length === 0) return;

    const courtRef = doc(db, "courtsCollection", `court-${newCourt.value.number}`);
    await setDoc(courtRef, {
        number: parseInt(newCourt.value.number),
        price: parseFloat(newCourt.value.price),
        sports: newCourt.value.sports,
        details: newCourt.value.details || ""
    });

    newCourt.value = { number: "", price: "", sports: [], details: "" };
    fetchCourts();
};

// Remove court
const removeCourt = async (courtId) => {
    await deleteDoc(doc(db, "courtsCollection", courtId));
    fetchCourts();
};

onMounted(fetchCourts);
</script>