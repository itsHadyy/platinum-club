<template>
    <q-page class="q-pa-md">
        <div class="row items-center q-mb-md">
            <div class="col">
                <h4>Manage Academies & Programs</h4>
            </div>
            <div class="col-auto">
                <q-btn label="Add Academy" color="secondary" @click="openAcademyDialog()" />
            </div>
        </div>

        <!-- Display Academies -->
        <div class="row q-col-gutter-md">
            <div v-for="academy in academyOptions" :key="academy.id" class="col-12 col-md-4">
                <q-card flat bordered class="q-pa-md cursor-pointer" @click="openAcademyDetails(academy)">
                    <q-card-section>
                        <h5>{{ academy.id }}</h5>
                        <p class="text-caption">📧 {{ academy.email }}</p>
                        <p class="text-caption">🌐 <a :href="academy.website" target="_blank">{{ academy.website }}</a>
                        </p>
                    </q-card-section>
                </q-card>
            </div>
        </div>

        <!-- Academy Details Dialog -->
        <q-dialog v-model="academyDialog">
            <q-card class="q-pa-md" style="min-width: 500px;">
                <q-card-section>
                    <h5>{{ selectedAcademy?.id }}</h5>
                    <p><strong>Email:</strong> {{ selectedAcademy?.email }}</p>
                    <p><strong>Website:</strong> <a :href="selectedAcademy?.website" target="_blank">
                            {{ selectedAcademy?.website }}</a></p>
                </q-card-section>

                <q-separator />

                <q-card-section>
                    <h6>🎯 Programs</h6>
                    <q-list v-if="programs.length" separator bordered>
                        <q-item v-for="program in programs" :key="program.id">
                            <q-item-section>
                                <q-item-label><strong>{{ program.name }}</strong></q-item-label>
                                <q-item-label caption>Coaches: {{ program.coaches.join(", ") }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                    <div v-else class="text-center q-pa-md">
                        No programs available.
                    </div>

                    <!-- Add Program Button -->
                    <q-btn label="Add Program" color="primary" @click="openAddProgramDialog" class="q-mt-md" />
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn label="Close" color="negative" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="addProgramDialog">
            <q-card class="q-pa-md" style="min-width: 400px;">
                <q-card-section>
                    <h5>Add New Program</h5>
                    <q-input v-model="newProgram.name" label="Program Name" dense outlined class="q-mb-md" />
                    <q-input v-model="newProgram.coaches" label="Coaches (comma-separated)" dense outlined
                        class="q-mb-md" />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn label="Add Program" color="primary" @click="handleProgramSave" />
                    <q-btn label="Cancel" color="negative" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Add Academy Dialog -->
        <q-dialog v-model="addAcademyDialog">
            <q-card class="q-pa-md" style="min-width: 400px;">
                <q-card-section>
                    <h5>Add New Academy</h5>
                    <q-input v-model="newAcademy.name" label="Academy Name" dense outlined class="q-mb-md" />
                    <q-input v-model="newAcademy.email" label="Academy Email" dense outlined class="q-mb-md" />
                    <q-input v-model="newAcademy.website" label="Academy Website" dense outlined class="q-mb-md" />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn label="Add Academy" color="primary" @click="handleAcademySave" />
                    <q-btn label="Cancel" color="negative" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAcademiesStore } from "src/stores/academyStore";

export default {
    setup() {
        const store = useAcademiesStore();
        const academyDialog = ref(false);
        const addAcademyDialog = ref(false);
        const selectedAcademy = ref(null);
        const programs = ref([]);
        const newAcademy = ref({ name: "", email: "", website: "" });

        // Load academies on page mount
        onMounted(() => {
            store.fetchAcademies();
        });

        const academyOptions = computed(() => store.academyOptions || []);

        const openAcademyDetails = (academy) => {
            selectedAcademy.value = academy;
            programs.value = store.programsByAcademy[academy.id] || [];
            academyDialog.value = true;
        };

        const openAcademyDialog = () => {
            newAcademy.value = { name: "", email: "", website: "" };
            addAcademyDialog.value = true;
        };

        const handleAcademySave = () => {
            store.addAcademy(newAcademy.value);
            addAcademyDialog.value = false;
        };

        return { academyDialog, addAcademyDialog, selectedAcademy, programs, academyOptions, openAcademyDetails, openAcademyDialog, handleAcademySave };
    },
};
</script>