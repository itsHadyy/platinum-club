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

        <div class="row q-col-gutter-md">
            <div v-for="academy in academyOptions" :key="academy.id" class="col-12 col-md-4">
                <q-card flat bordered class="q-pa-md cursor-pointer">
                    <q-card-section>
                        <h5>{{ academy.id }}</h5>
                        <p class="text-caption"><strong>Email:</strong> {{ academy.email }}</p>
                        <p class="text-caption"><strong>Phone:</strong> {{ academy.phone }}</p>
                        <p class="text-caption">
                            <strong>Website:</strong>
                            <a :href="academy.website" target="_blank">{{ academy.website }}</a>
                        </p>
                    </q-card-section>
                    <q-card-actions align="right">
                        <q-btn icon="edit" color="secondary" flat @click="openAcademyDialog(academy)" />
                        <q-btn icon="delete" color="negative" flat @click="deleteAcademy(academy)" />
                        <q-btn label="View Programs" color="secondary" @click="openAcademyDetails(academy)" />
                    </q-card-actions>
                </q-card>
            </div>
        </div>

        <q-dialog v-model="academyDialog">
            <q-card class="q-pa-md" style="min-width: 500px;">
                <q-card-section>
                    <h5>{{ selectedAcademy?.id }}</h5>
                    <p><strong>Email:</strong> {{ selectedAcademy?.email }}</p>
                    <p><strong>Phone:</strong> {{ selectedAcademy?.phone }}</p>
                    <p>
                        <strong>Website:</strong>
                        <a :href="selectedAcademy?.website" target="_blank">{{ selectedAcademy?.website }}</a>
                    </p>
                </q-card-section>

                <q-separator />

                <q-card-section>
                    <h6>🎯 Programs</h6>
                    <q-list v-if="programs.length" separator bordered>
                        <q-item v-for="program in programs" :key="program.id">
                            <q-item-section>
                                <q-item-label><strong>{{ program.name }}</strong> ({{ program.sport }})</q-item-label>
                                <q-item-label caption>
                                    {{ formatDateRange(program.startDate, program.durationWeeks) }} •
                                    ${{ program.price }} • Ages {{ program.ageGroup }}
                                </q-item-label>
                                <q-item-label caption>Coaches: {{ program.coaches.join(", ") }}</q-item-label>
                                <q-item-label caption>
                                    Schedule:
                                    <ul>
                                        <li v-for="(day, index) in program.schedule" :key="index">
                                            {{ day.day }} at {{ day.time }}
                                        </li>
                                    </ul>
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-btn icon="edit" color="secondary" flat @click="openEditProgramDialog(program)" />
                                <q-btn icon="delete" color="negative" flat @click="deleteProgram(program)" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                    <div v-else class="text-center q-pa-md">
                        No programs available.
                    </div>

                    <q-btn label="Add Program" color="secondary" @click="openAddProgramDialog" class="q-mt-md" />
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn label="Close" color="negative" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="programDialog" persistent>
            <q-card class="q-pa-md" style="min-width: 500px;">
                <q-card-section>
                    <h5>{{ isEditingProgram ? 'Edit Program' : 'Add New Program' }}</h5>
                    <q-input v-model="currentProgram.name" label="Program Name" dense outlined class="q-mb-md" />
                    <q-input v-model="currentProgram.sport" label="Sport" dense outlined class="q-mb-md" />
                    <q-input v-model="currentProgram.coaches" label="Coaches (comma-separated)" dense outlined
                        class="q-mb-md" />

                    <div class="row q-col-gutter-md">
                        <div class="col-6">
                            <q-input v-model="currentProgram.startDate" label="Start Date" type="date" dense outlined
                                class="q-mb-md" />
                        </div>
                        <div class="col-6">
                            <q-input v-model.number="currentProgram.durationWeeks" label="Duration (weeks)"
                                type="number" min="1" dense outlined class="q-mb-md" />
                        </div>
                    </div>

                    <div class="row q-col-gutter-md">
                        <div class="col-6">
                            <q-input v-model.number="currentProgram.price" label="Price" type="number" min="0" dense
                                outlined class="q-mb-md" />
                        </div>
                        <div class="col-6">
                            <q-select v-model="currentProgram.ageGroup" :options="ageGroupOptions" label="Age Group"
                                dense outlined class="q-mb-md" />
                        </div>
                    </div>

                    <h6>Schedule</h6>
                    <div v-for="(day, index) in currentProgram.schedule" :key="index" class="q-mb-md">
                        <q-select v-model="day.day" :options="daysOfWeek" label="Day" dense outlined class="q-mb-sm" />
                        <q-select v-model="day.time" :options="timeSlots" label="Time" dense outlined class="q-mb-sm" />
                        <q-btn label="Remove Day" color="negative" @click="removeDay(index)" class="q-mb-md" />
                    </div>
                    <q-btn label="Add Day" color="secondary" @click="addDay" class="q-mb-md" />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn v-if="!isEditingProgram" label="Add Program" color="secondary" @click="handleAddProgram" />
                    <q-btn v-if="isEditingProgram" label="Update Program" color="secondary"
                        @click="handleUpdateProgram" />
                    <q-btn label="Cancel" color="negative" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="academyEditDialog">
            <q-card class="q-pa-md" style="min-width: 400px;">
                <q-card-section>
                    <h5>{{ isEditingAcademy ? 'Edit Academy' : 'Add New Academy' }}</h5>
                    <div v-if="isEditingAcademy">
                        <p><strong>Academy Name:</strong> {{ currentAcademy.name }}</p>
                    </div>
                    <q-input v-else v-model="currentAcademy.name" label="Academy Name" dense outlined class="q-mb-md" />
                    <q-input v-model="currentAcademy.phone" label="Academy Phone" dense outlined class="q-mb-md" />
                    <q-input v-model="currentAcademy.email" label="Academy Email" dense outlined class="q-mb-md" />
                    <q-input v-model="currentAcademy.website" label="Academy Website" dense outlined class="q-mb-md" />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn :label="isEditingAcademy ? 'Update Academy' : 'Add Academy'" color="secondary"
                        @click="handleAcademySave" />
                    <q-btn label="Cancel" color="negative" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAcademiesStore } from "src/stores/academyStore";
import { date } from 'quasar';

export default {
    setup() {
        const store = useAcademiesStore();
        const academyDialog = ref(false);
        const academyEditDialog = ref(false);
        const programDialog = ref(false);
        const selectedAcademy = ref(null);
        const programs = ref([]);
        const currentAcademy = ref({ name: "", email: "", phone: "", website: "" });
        const currentProgram = ref({
            name: "",
            sport: "",
            coaches: "",
            schedule: [],
            startDate: "",
            durationWeeks: 4,
            price: 0,
            ageGroup: "8-12"
        });
        const isEditingAcademy = ref(false);
        const isEditingProgram = ref(false);
        const daysOfWeek = ref(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
        const timeSlots = ref([
            "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
            "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
        ]);
        const ageGroupOptions = ref([
            "3-5", "5-7", "7-9", "9-12",
            "12-14", "14-16", "16-18", "18+"
        ]);

        onMounted(() => {
            store.fetchAcademies();
        });

        const academyOptions = computed(() => store.academyOptions || []);

        const formatDateRange = (startDate, weeks) => {
            if (!startDate) return "No date set";
            const start = new Date(startDate);
            const end = new Date(start);
            end.setDate(start.getDate() + (weeks * 7));
            return `${date.formatDate(start, 'MMM D, YYYY')} - ${date.formatDate(end, 'MMM D, YYYY')}`;
        };

        const openAcademyDetails = (academy) => {
            selectedAcademy.value = academy;
            programs.value = store.programsByAcademy[academy.id] || [];
            academyDialog.value = true;
        };

        const openAcademyDialog = (academy = null) => {
            if (academy) {
                currentAcademy.value = { ...academy };
                isEditingAcademy.value = true;
            } else {
                currentAcademy.value = { name: "", email: "", phone: "", website: "" };
                isEditingAcademy.value = false;
            }
            academyEditDialog.value = true;
        };

        const deleteAcademy = async (academy) => {
            if (confirm(`Are you sure you want to delete ${academy.id}?`)) {
                await store.deleteAcademy(academy.id);
                store.fetchAcademies();
            }
        };

        const openAddProgramDialog = () => {
            currentProgram.value = {
                name: "",
                sport: "",
                coaches: "",
                schedule: [],
                startDate: "",
                durationWeeks: 4,
                price: 0,
                ageGroup: "8-12"
            };
            isEditingProgram.value = false;
            programDialog.value = true;
        };

        const openEditProgramDialog = (program) => {
            currentProgram.value = {
                ...program,
                coaches: program.coaches ? program.coaches.join(", ") : "",
                schedule: program.schedule || [],
                startDate: program.startDate || "",
                durationWeeks: program.durationWeeks || 4,
                price: program.price || 0,
                ageGroup: program.ageGroup || "8-12"
            };
            isEditingProgram.value = true;
            programDialog.value = true;
        };

        const addDay = () => {
            if (!currentProgram.value.schedule) {
                currentProgram.value.schedule = [];
            }
            currentProgram.value.schedule.push({ day: "", time: "" });
        };

        const removeDay = (index) => {
            currentProgram.value.schedule.splice(index, 1);
        };

        const handleAcademySave = () => {
            if (isEditingAcademy.value) {
                store.updateAcademy(currentAcademy.value);
            } else {
                store.addAcademy(currentAcademy.value);
            }
            academyEditDialog.value = false;
        };

        const handleAddProgram = () => {
            const program = {
                ...currentProgram.value,
                coaches: currentProgram.value.coaches.split(",").map(coach => coach.trim()),
                schedule: currentProgram.value.schedule || [],
                price: Number(currentProgram.value.price),
                durationWeeks: Number(currentProgram.value.durationWeeks)
            };

            store.addProgram(selectedAcademy.value.id, program);
            programs.value = store.programsByAcademy[selectedAcademy.value.id] || [];
            programDialog.value = false;
        };

        const handleUpdateProgram = () => {
            const program = {
                ...currentProgram.value,
                coaches: currentProgram.value.coaches.split(",").map(coach => coach.trim()),
                schedule: currentProgram.value.schedule || [],
                price: Number(currentProgram.value.price),
                durationWeeks: Number(currentProgram.value.durationWeeks)
            };

            store.updateProgram(selectedAcademy.value.id, program);
            programs.value = store.programsByAcademy[selectedAcademy.value.id] || [];
            programDialog.value = false;
        };

        const deleteProgram = (program) => {
            store.deleteProgram(selectedAcademy.value.id, program);
            programs.value = store.programsByAcademy[selectedAcademy.value.id] || [];
        };

        return {
            academyDialog,
            academyEditDialog,
            programDialog,
            selectedAcademy,
            programs,
            currentAcademy,
            currentProgram,
            isEditingAcademy,
            isEditingProgram,
            daysOfWeek,
            timeSlots,
            ageGroupOptions,
            academyOptions,
            formatDateRange,
            openAcademyDetails,
            openAcademyDialog,
            deleteAcademy,
            openAddProgramDialog,
            openEditProgramDialog,
            addDay,
            removeDay,
            handleAcademySave,
            handleAddProgram,
            handleUpdateProgram,
            deleteProgram
        };
    },
};
</script>