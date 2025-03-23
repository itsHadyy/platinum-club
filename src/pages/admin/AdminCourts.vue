<template>
    <q-page class="q-pa-md">
        <h4>Manage Sports & Courts</h4>

        <q-select v-model="selectedSport" :options="sportsOptions" label="Select Sport" outlined dense
            class="q-mb-md" />

        <div class="row q-mb-md">
            <q-input v-model="newSport" label="New Sport Name" dense outlined />
            <q-btn label="Add Sport" color="primary" class="q-ml-md" @click="handleAddSport" />
        </div>

        <q-list bordered separator v-if="selectedSport && courts[selectedSport]?.length">
            <q-item v-for="court in courts[selectedSport]" :key="court.id">
                <q-item-section>
                    <q-item-label>{{ court.name }}</q-item-label>
                    <q-item-label caption>Price: {{ court.price }} EGP</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn label="Edit" color="secondary" @click="editCourt(court)" />
                </q-item-section>
            </q-item>
        </q-list>

        <div v-if="selectedSport" class="q-mt-md">
            <h5>Add New Court</h5>
            <q-input v-model="newCourt.name" label="Court Name" dense outlined class="q-mb-md" />
            <q-input v-model.number="newCourt.price" type="number" label="Price" dense outlined class="q-mb-md" />
            <q-input v-model="newCourt.location" label="Location" dense outlined class="q-mb-md" />
            <q-input v-model="newCourt.size" label="Size" dense outlined class="q-mb-md" />
            <q-input v-model="newCourt.surface" label="Surface Type" dense outlined class="q-mb-md" />
            <q-btn label="Add Court" color="primary" @click="handleAddCourt" />
        </div>

        <q-dialog v-model="editDialog">
            <q-card class="q-pa-md">
                <q-card-section>
                    <h5>Edit Court</h5>
                    <q-input v-model="editCourtData.name" label="Court Name" dense outlined class="q-mb-md" />
                    <q-input v-model.number="editCourtData.price" type="number" label="Price" dense outlined
                        class="q-mb-md" />
                    <q-input v-model="editCourtData.location" label="Location" dense outlined class="q-mb-md" />
                    <q-input v-model="editCourtData.size" label="Size" dense outlined class="q-mb-md" />
                    <q-input v-model="editCourtData.surface" label="Surface" dense outlined class="q-mb-md" />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn label="Save" color="primary" @click="saveEditCourt" />
                    <q-btn label="Cancel" color="negative" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>
import { ref, computed } from "vue";
import { useSportsStore } from "../../stores/sportsStore";

export default {
    setup() {
        const store = useSportsStore();

        const selectedSport = ref(null);
        const newSport = ref("");
        const newCourt = ref({ name: "", price: 0, location: "", size: "", surface: "" });
        const editCourtData = ref({});
        const editDialog = ref(false);

        const sportsOptions = computed(() => store.sportsOptions);
        const courts = computed(() => store.courtsBySport);

        const handleAddSport = () => {
            if (newSport.value) {
                store.addSport(newSport.value);
                newSport.value = "";
            }
        };

        const handleAddCourt = () => {
            if (selectedSport.value) {
                store.addCourt(selectedSport.value, { ...newCourt.value, id: Date.now() });
                newCourt.value = { name: "", price: 0, location: "", size: "", surface: "" };
            }
        };

        const editCourt = (court) => {
            editCourtData.value = { ...court };
            editDialog.value = true;
        };

        const saveEditCourt = () => {
            store.updateCourt(selectedSport.value, editCourtData.value.id, editCourtData.value);
            editDialog.value = false;
        };

        return { selectedSport, newSport, newCourt, editCourtData, editDialog, sportsOptions, courts, handleAddSport, handleAddCourt, editCourt, saveEditCourt };
    },
};
</script>