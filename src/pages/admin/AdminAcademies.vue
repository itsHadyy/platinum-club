<template>
    <q-page class="q-pa-md">
        <q-card>
            <q-card-section class="row items-center justify-between">
                <div class="text-h5">Academy Management</div>
                <q-btn color="primary" label="Add Academy" icon="add" @click="openAcademyDialog()" />
            </q-card-section>

            <q-separator />

            <q-card-section>
                <q-list bordered separator>
                    <q-item v-for="academy in academies" :key="academy.id" clickable v-ripple>
                        <q-item-section>
                            <q-item-label class="text-h6">{{ academy.name }}</q-item-label>
                            <q-item-label caption>{{ academy.email }} | {{ academy.website }}</q-item-label>

                            <q-btn color="primary" label="Add Program" icon="add" flat
                                @click="openProgramDialog(academy.id)" />
                            <q-list bordered separator>
                                <q-item v-for="program in getPrograms(academy.id)" :key="program.id">
                                    <q-item-section>
                                        <q-item-label class="text-bold">{{ program.name }}</q-item-label>
                                        <q-item-label caption>Coaches: {{ program.coaches?.join(", ") || "N/A"
                                        }}</q-item-label>
                                        <q-item-label caption>Support Staff: {{ program.supportStaff?.join(", ") ||
                                            "N/A" }}</q-item-label>

                                        <q-item-label caption>
                                            <ul>
                                                <li v-for="(time, index) in program.schedule" :key="index">
                                                    {{ time.day }}: {{ time.startTime }} - {{ time.endTime }}
                                                </li>
                                            </ul>
                                        </q-item-label>
                                    </q-item-section>
                                    <q-item-section side>
                                        <q-btn flat icon="edit" @click="openProgramDialog(academy.id, program)" />
                                        <q-btn flat icon="delete" color="red" @click="deleteProgram(program.id)" />
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn flat icon="edit" @click="openAcademyDialog(academy)" />
                            <q-btn flat icon="delete" color="red" @click="deleteAcademy(academy.id)" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>
        </q-card>

        <!-- Add/Edit Academy Dialog -->
        <q-dialog v-model="isAcademyDialogOpen">
            <q-card style="width: 400px">
                <q-card-section>
                    <div class="text-h6">{{ isEditingAcademy ? "Edit Academy" : "Add Academy" }}</div>
                </q-card-section>

                <q-card-section>
                    <q-input v-model="form.name" label="Academy Name" filled />
                    <q-input v-model="form.email" label="Email" type="email" filled />
                    <q-input v-model="form.website" label="Website" filled />
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cancel" @click="isAcademyDialogOpen = false" />
                    <q-btn color="primary" :label="isEditingAcademy ? 'Update' : 'Add'" @click="saveAcademy" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Add/Edit Program Dialog -->
        <q-dialog v-model="isProgramDialogOpen">
            <q-card style="width: 500px">
                <q-card-section>
                    <div class="text-h6">{{ isEditingProgram ? "Edit Program" : "Add Program" }}</div>
                </q-card-section>

                <q-card-section>
                    <q-input v-model="programForm.name" label="Program Name" filled />
                    <q-input v-model="programForm.startDate" label="Start Date" type="date" filled />

                    <q-select v-model="programForm.days" multiple :options="daysOptions" label="Days" filled
                        @update:model-value="updateSchedule" />

                    <q-list bordered>
                        <q-item v-for="(schedule, index) in programForm.schedule" :key="index">
                            <q-item-section>
                                <q-item-label class="text-bold">{{ schedule.day }}</q-item-label>
                                <q-input v-model="schedule.startTime" label="Start Time" type="time" filled />
                                <q-input v-model="schedule.endTime" label="End Time" type="time" filled />
                            </q-item-section>
                        </q-item>
                    </q-list>

                    <q-input v-model="coachesInput" label="Coaches (comma-separated)" filled
                        @update:model-value="updateCoaches" />
                    <q-input v-model="supportInput" label="Support Staff (comma-separated)" filled
                        @update:model-value="updateSupport" />
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cancel" @click="isProgramDialogOpen = false" />
                    <q-btn color="primary" :label="isEditingProgram ? 'Update' : 'Add'" @click="saveProgram" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>
<script setup>
import { ref, computed } from "vue";
import { useAcademyStore } from "src/stores/academyStore";

const academyStore = useAcademyStore();
const isAcademyDialogOpen = ref(false);
const isProgramDialogOpen = ref(false);
const selectedAcademyId = ref(null);

const form = ref({ name: "", email: "", website: "" });
const programForm = ref({ name: "", startDate: "", days: [], schedule: [], coaches: "", support: "" });

const daysOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const academies = computed(() => academyStore.academies);
const getPrograms = (academyId) => academyStore.programs.filter((p) => p.academyId === academyId);

const openAcademyDialog = (academy = null) => {
    form.value = academy ? { ...academy } : { name: "", email: "", website: "" };
    isAcademyDialogOpen.value = true;
};

const saveAcademy = async () => {
    if (!form.value.name || !form.value.email || !form.value.website) {
        console.error("Missing academy details");
        return;
    }
    await academyStore.addAcademy(form.value);
    isAcademyDialogOpen.value = false;
};

const openProgramDialog = (academyId) => {
    selectedAcademyId.value = academyId;
    programForm.value = { name: "", startDate: "", days: [], schedule: [], coaches: "", support: "" };
    isProgramDialogOpen.value = true;
};

const saveProgram = async () => {
    programForm.value.coaches = programForm.value.coaches.split(",");
    programForm.value.support = programForm.value.support.split(",");

    await academyStore.addProgram(selectedAcademyId.value, programForm.value);
    isProgramDialogOpen.value = false;
};
</script>◊