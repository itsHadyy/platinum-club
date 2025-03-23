import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { db } from "boot/firebase";
import { collection, getDocs, updateDoc, doc, setDoc } from "firebase/firestore";

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
                academyData.push({ id: academyId, ...data }); // Store full data
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
        await setDoc(academyRef, { email: academy.email, website: academy.website, programs: [] }, { merge: true });

        academyOptions.value.push({ id: academy.name, email: academy.email, website: academy.website, programs: [] });
        programsByAcademy.value[academy.name] = [];
    };

    const addProgram = async (academy, program) => {
        programsByAcademy.value[academy] = [...(programsByAcademy.value[academy] || []), program];

        await updateDoc(doc(db, "academies", academy), { programs: programsByAcademy.value[academy] });
    };

    onMounted(fetchAcademies);

    return { academyOptions, programsByAcademy, fetchAcademies, addAcademy, addProgram };
});