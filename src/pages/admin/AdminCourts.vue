<template>
    <q-page class="q-pa-md">
        <q-bar class="bg-white text-dark">
            <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
            <q-space />
        </q-bar>

        <div class="text-h5 text-bold text-center q-mb-md">Manage Sports & Courts</div>

        <!-- Add New Sport -->
        <q-card class="q-pa-md q-mb-md">
            <q-card-section>
                <q-input v-model="newSport" label="New Sport Name" outlined dense class="q-mb-md" />
                <q-btn color="secondary" label="Add Sport" @click="addSport" />
            </q-card-section>
        </q-card>

        <!-- Courts Section -->
        <q-card class="q-pa-md q-mb-md">
            <q-card-section>
                <div class="row q-gutter-md">
                    <q-input v-model="newCourtName" label="New Court Name" outlined dense class="col" />
                    <q-input v-model="newCourtPrice" type="number" label="Court Price" outlined dense class="col" />
                    <q-btn color="primary" label="Add Court" @click="addCourt" />
                </div>
            </q-card-section>
        </q-card>

        <!-- Courts Table -->
        <q-table flat bordered :rows="courtsList" :columns="courtColumns" row-key="name">
            <template v-slot:body-cell(price)="props">
                <q-td :props="props">
                    <q-input v-model="props.row.price" type="number" dense outlined
                        @blur="updateCourtPrice(props.row)" />
                </q-td>
            </template>

            <template v-slot:body-cell(sports)="props">
                <q-td :props="props">
                    <q-chip v-for="sport in props.row.sports" :key="sport" color="primary" class="q-mr-sm">
                        {{ sport }}
                    </q-chip>
                    <q-btn dense icon="add" @click="openAddSportDialog(props.row)" />
                </q-td>
            </template>

            <template v-slot:body-cell(actions)="props">
                <q-td :props="props">
                    <q-btn flat dense icon="delete" color="negative" @click="removeCourt(props.row)" />
                </q-td>
            </template>
        </q-table>

        <!-- Add Sport to Court Dialog -->
        <q-dialog v-model="addSportDialog">
            <q-card>
                <q-card-section>
                    <div class="text-h6">Assign Sport to {{ selectedCourt?.name }}</div>
                </q-card-section>

                <q-card-section>
                    <q-select v-model="selectedSport" :options="sportsList.map(s => s.name)" label="Select Sport"
                        outlined />
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn label="Cancel" flat v-close-popup />
                    <q-btn label="Assign" color="primary" @click="assignSportToCourt" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "boot/firebase";

const sportsList = ref([]);
const courtsList = ref([]);
const newSport = ref("");
const newCourtName = ref("");
const newCourtPrice = ref("");
const addSportDialog = ref(false);
const selectedCourt = ref(null);
const selectedSport = ref("");

// Columns for court table
const courtColumns = [
    { name: "name", label: "Court", field: "name", align: "left" },
    { name: "price", label: "Price", field: "price", align: "left" },
    { name: "sports", label: "Sports", field: "sports", align: "left" },
    { name: "actions", label: "Actions", field: "actions", align: "center" }
];

// Fetch sports and courts from Firestore
const fetchData = async () => {
    const sportsSnap = await getDocs(collection(db, "sportsCollection"));
    sportsList.value = sportsSnap.docs.map(doc => ({ id: doc.id, name: doc.id }));

    const courtsSnap = await getDocs(collection(db, "courtsCollection"));
    courtsList.value = courtsSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.id,
        price: doc.data().price || 0,
        sports: doc.data().sports || []
    }));
};

// Add a new sport
const addSport = async () => {
    if (!newSport.value) return;
    await setDoc(doc(db, "sportsCollection", newSport.value), {});
    newSport.value = "";
    fetchData();
};

// Add a new court
const addCourt = async () => {
    if (!newCourtName.value || !newCourtPrice.value) return;
    await setDoc(doc(db, "courtsCollection", newCourtName.value), { price: parseFloat(newCourtPrice.value), sports: [] });
    newCourtName.value = "";
    newCourtPrice.value = "";
    fetchData();
};

// Update court price
const updateCourtPrice = async (court) => {
    await updateDoc(doc(db, "courtsCollection", court.name), { price: court.price });
};

// Assign sport to court
const openAddSportDialog = (court) => {
    selectedCourt.value = court;
    addSportDialog.value = true;
};

const assignSportToCourt = async () => {
    if (!selectedCourt.value || !selectedSport.value) return;

    const updatedSports = [...selectedCourt.value.sports, selectedSport.value];
    await updateDoc(doc(db, "courtsCollection", selectedCourt.value.name), { sports: updatedSports });

    selectedCourt.value.sports = updatedSports;
    addSportDialog.value = false;
    fetchData();
};

// Remove court
const removeCourt = async (court) => {
    await deleteDoc(doc(db, "courtsCollection", court.name));
    fetchData();
};

onMounted(fetchData);
</script>