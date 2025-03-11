import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export const useAuthStore = defineStore("auth", () => {
  const isAuthenticated = ref(false);
  const user = ref(null);
  const isAuthReady = ref(false);
  const auth = getAuth();
  const db = getFirestore();

  async function fetchUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    return null;
  }

  async function initAuth() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const storedUser = JSON.parse(localStorage.getItem("authUser"));
        const firestoreData = await fetchUserData(firebaseUser.uid);

        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firestoreData?.name || firebaseUser.displayName || storedUser?.displayName || "User",
          photoURL: firebaseUser.photoURL,
          role: firestoreData?.role || storedUser?.role || "user",
        };

        isAuthenticated.value = true;
        localStorage.setItem("authUser", JSON.stringify(user.value)); // Save to localStorage
      } else {
        user.value = null;
        isAuthenticated.value = false;
        localStorage.removeItem("authUser");
      }
      isAuthReady.value = true; // Ensure UI waits for auth state
    });
  }

  function login(userData) {
    user.value = userData;
    isAuthenticated.value = true;
    localStorage.setItem("authUser", JSON.stringify(userData));
  }

  async function logout() {
    await signOut(auth);
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem("authUser");
  }

  onMounted(() => {
    initAuth();
  });

  return { isAuthenticated, user, login, logout, initAuth, isAuthReady };
});