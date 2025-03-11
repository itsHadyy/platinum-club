import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from 'src/boot/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const useGuestStore = defineStore("guest", () => {
  const guests = ref([]);

  async function inviteGuest(guestData) {
    try {
      const docRef = await addDoc(collection(db, "guestInvites"), guestData);
      console.log("Guest invited with ID:", docRef.id);
      return docRef.id; // Return the Firestore ID for QR Code
    } catch (error) {
      console.error("Error inviting guest:", error);
      throw error;
    }
  }

  return { guests, inviteGuest };
});