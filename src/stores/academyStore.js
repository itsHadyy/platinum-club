import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { db } from "boot/firebase";
import {
    collection,
    getDocs,
    doc,
    setDoc,
} from "firebase/firestore";

export const useAcademyStore = defineStore("academyStore", () => {
    const academies = ref([]);
    const programs = ref([]);

    // 🔹 Fetch Academies from Firestore
    const fetchAcademies = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "academies"));
            const academyData = [];

            querySnapshot.forEach((docSnap) => {
                const academy = { id: docSnap.id, ...docSnap.data() };
                academyData.push(academy);
            });

            academies.value = academyData;
        } catch (error) {
            console.error("Error fetching academies:", error);
        }
    };

    // 🔹 Add Academy
    const addAcademy = async (academy) => {
        if (!academy.name || !academy.email || !academy.website) {
            console.error("Academy details are incomplete:", academy);
            return;
        }

        try {
            const academyRef = doc(db, "academies", academy.name);
            await setDoc(academyRef, {
                email: academy.email,
                website: academy.website,
            }, { merge: true });

            academies.value.push(academy);
            console.log(`Added Academy: ${academy.name}`);
        } catch (error) {
            console.error("Error adding academy:", error);
        }
    };

    // 🔹 Fetch Programs from Firestore
    const fetchPrograms = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "programs"));
            const programData = [];

            querySnapshot.forEach((docSnap) => {
                const program = { id: docSnap.id, ...docSnap.data() };
                programData.push(program);
            });

            programs.value = programData;
        } catch (error) {
            console.error("Error fetching programs:", error);
        }
    };

    // 🔹 Add Program
    const addProgram = async (academyId, program) => {
        if (!academyId || !program.name || !program.days) {
            console.error("Program details are incomplete:", program);
            return;
        }

        try {
            const programRef = doc(db, "programs", program.name);
            await setDoc(programRef, {
                academyId,
                startDate: program.startDate,
                days: program.days,
                schedule: program.schedule,
                coaches: program.coaches,
                support: program.support,
            }, { merge: true });

            programs.value.push(program);
            console.log(`Added Program: ${program.name}`);
        } catch (error) {
            console.error("Error adding program:", error);
        }
    };

    onMounted(() => {
        fetchAcademies();
        fetchPrograms();
    });

    return {
        academies,
        programs,
        fetchAcademies,
        fetchPrograms,
        addAcademy,
        addProgram,
    };
});