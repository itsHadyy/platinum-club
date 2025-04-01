// stores/academiesStore.js
import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { db } from "boot/firebase";
import {
    collection, getDocs, updateDoc, doc,
    setDoc, deleteDoc, getDoc, serverTimestamp,
    query, where, orderBy
} from "firebase/firestore";

export const useAcademiesStore = defineStore("academiesStore", () => {
    const academyOptions = ref([]);
    const programsByAcademy = ref({});
    const selectedAcademy = ref(null);
    const userBookings = ref([]);

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
            throw error;
        }
    };

    const addAcademy = async (academy) => {
        try {
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
        } catch (error) {
            console.error("Error adding academy:", error);
            throw error;
        }
    };

    const updateAcademy = async (academy) => {
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
        } catch (error) {
            console.error("Error updating academy:", error);
            throw error;
        }
    };

    const deleteAcademy = async (academyId) => {
        try {
            await deleteDoc(doc(db, "academies", academyId));
            academyOptions.value = academyOptions.value.filter(a => a.id !== academyId);
            delete programsByAcademy.value[academyId];
        } catch (error) {
            console.error("Error deleting academy:", error);
            throw error;
        }
    };

    const addProgram = async (academyId, program) => {
        try {
            const academyPrograms = programsByAcademy.value[academyId] || [];
            academyPrograms.push(program);
            programsByAcademy.value[academyId] = academyPrograms;
            await updateDoc(doc(db, "academies", academyId), { programs: academyPrograms });
        } catch (error) {
            console.error("Error adding program:", error);
            throw error;
        }
    };

    const updateProgram = async (academyId, program) => {
        try {
            const academyPrograms = programsByAcademy.value[academyId] || [];
            const index = academyPrograms.findIndex(p => p.name === program.name);
            if (index !== -1) {
                academyPrograms[index] = program;
                programsByAcademy.value[academyId] = academyPrograms;
                await updateDoc(doc(db, "academies", academyId), { programs: academyPrograms });
            }
        } catch (error) {
            console.error("Error updating program:", error);
            throw error;
        }
    };

    const deleteProgram = async (academyId, program) => {
        try {
            const academyPrograms = programsByAcademy.value[academyId] || [];
            const updatedPrograms = academyPrograms.filter(p => p.name !== program.name);
            programsByAcademy.value[academyId] = updatedPrograms;
            await updateDoc(doc(db, "academies", academyId), { programs: updatedPrograms });
        } catch (error) {
            console.error("Error deleting program:", error);
            throw error;
        }
    };

    const createBooking = async (bookingData) => {
        try {
            const requiredFields = [
                'academyId',
                'programId',
                'userId',
                'participantName',
                'participantEmail',
                'participantPhone'
            ];

            const missingFields = requiredFields.filter(field => !bookingData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            const bookingsRef = collection(db, "bookings");
            const newBookingRef = doc(bookingsRef);

            await setDoc(newBookingRef, {
                ...bookingData,
                createdAt: serverTimestamp(),
                status: "confirmed",
                participantAge: bookingData.participantAge || null,
                emergencyContactName: bookingData.emergencyContactName || bookingData.participantName,
                emergencyContactPhone: bookingData.emergencyContactPhone || bookingData.participantPhone
            });

            return newBookingRef.id;
        } catch (error) {
            console.error("Error creating booking:", error);
            throw error;
        }
    };

    const fetchUserBookings = async (userId) => {
        try {
            const q = query(
                collection(db, "bookings"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);

            userBookings.value = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching user bookings:", error);
            throw error;
        }
    };

    const cancelBooking = async (bookingId) => {
        try {
            await updateDoc(doc(db, "bookings", bookingId), {
                status: "cancelled",
                cancelledAt: serverTimestamp()
            });

            const index = userBookings.value.findIndex(b => b.id === bookingId);
            if (index !== -1) {
                userBookings.value[index].status = "cancelled";
                userBookings.value[index].cancelledAt = new Date().toISOString();
            }
        } catch (error) {
            console.error("Error cancelling booking:", error);
            throw error;
        }
    };

    const getAcademiesBySport = (sport) => {
        return academyOptions.value.filter(academy => {
            return academy.programs?.some(program => program.sport === sport);
        });
    };

    const fetchAcademyById = async (academyId) => {
        try {
            const docRef = doc(db, "academies", academyId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                selectedAcademy.value = { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error("Academy not found");
            }
        } catch (error) {
            console.error("Error fetching academy:", error);
            throw error;
        }
    };

    onMounted(fetchAcademies);

    return {
        academyOptions,
        programsByAcademy,
        selectedAcademy,
        userBookings,
        fetchAcademies,
        addAcademy,
        updateAcademy,
        deleteAcademy,
        fetchAcademyById,
        getAcademiesBySport,
        addProgram,
        updateProgram,
        deleteProgram,
        createBooking,
        fetchUserBookings,
        cancelBooking
    };
});