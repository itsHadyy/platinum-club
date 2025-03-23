import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { db } from "boot/firebase";
import { collection, getDocs, updateDoc, doc, setDoc, deleteDoc } from "firebase/firestore";

export const useAcademiesStore = defineStore("academiesStore", () => {
    const academyOptions = ref([]);
    const programsByAcademy = ref({});

    const fetchAcademies = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "academies"));
            const academyData = [];
            const programData = {};

            querySnapshot.forEach((docSnap) => {
                const academyId = docSnap.id;
                const data = docSnap.data();
                academyData.push({ id: academyId, ...data });
                programData[academyId] = data.programs || [];
            });

            academyOptions.value = academyData;
            programsByAcademy.value = programData;
        } catch (error) {
            console.error("Error fetching academies:", error);
        }
    };

    const addAcademy = async (academy) => {
        const academyRef = doc(db, "academies", academy.name);
        await setDoc(academyRef, {
            email: academy.email,
            phone: academy.phone,
            website: academy.website,
            programs: []
        }, { merge: true });

        academyOptions.value.push({
            id: academy.name,
            email: academy.email,
            phone: academy.phone,
            website: academy.website,
            programs: []
        });
        programsByAcademy.value[academy.name] = [];
    };

    const updateAcademy = async (academy) => {
        console.log("Updating Academy in Store:", academy);

        try {
            const academyRef = doc(db, "academies", academy.name);
            await updateDoc(academyRef, {
                email: academy.email,
                phone: academy.phone,
                website: academy.website
            });

            const index = academyOptions.value.findIndex(a => a.id === academy.name);
            if (index !== -1) {
                academyOptions.value[index] = { ...academyOptions.value[index], ...academy };
            }

            console.log("Academy Updated Successfully");
        } catch (error) {
            console.error("Error updating academy:", error);
        }
    };

    const deleteAcademy = async (academyId) => {
        await deleteDoc(doc(db, "academies", academyId));
        academyOptions.value = academyOptions.value.filter(a => a.id !== academyId);
        delete programsByAcademy.value[academyId];
    };

    const addProgram = async (academyId, program) => {
        const academyPrograms = programsByAcademy.value[academyId] || [];
        academyPrograms.push(program);
        programsByAcademy.value[academyId] = academyPrograms;

        await updateDoc(doc(db, "academies", academyId), { programs: academyPrograms });
    };

    const updateProgram = async (academyId, program) => {
        const academyPrograms = programsByAcademy.value[academyId] || [];
        const index = academyPrograms.findIndex(p => p.name === program.name);
        if (index !== -1) {
            academyPrograms[index] = program;
            programsByAcademy.value[academyId] = academyPrograms;
            await updateDoc(doc(db, "academies", academyId), { programs: academyPrograms });
        }
    };

    const deleteProgram = async (academyId, program) => {
        const academyPrograms = programsByAcademy.value[academyId] || [];
        const updatedPrograms = academyPrograms.filter(p => p.name !== program.name);
        programsByAcademy.value[academyId] = updatedPrograms;

        await updateDoc(doc(db, "academies", academyId), { programs: updatedPrograms });
    };

    onMounted(fetchAcademies);

    return { academyOptions, programsByAcademy, fetchAcademies, addAcademy, updateAcademy, deleteAcademy, addProgram, updateProgram, deleteProgram };
});