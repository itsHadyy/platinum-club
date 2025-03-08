import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

export const useAuthStore = defineStore("auth", () => {
  const isAuthenticated = ref(false);
  const user = ref(null);
  const auth = getAuth();
  const isAuthReady = ref(false);

  function initAuth() {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        isAuthenticated.value = true;
      } else {
        user.value = null;
        isAuthenticated.value = false;
      }
      isAuthReady.value = true; 
    });
  }

  function login(userData) {
    user.value = userData;
    isAuthenticated.value = true;
    localStorage.setItem("authUser", JSON.stringify(userData)); // Persist session
  }

  async function logout() {
    await signOut(auth);
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem("authUser");
  }

  // ✅ Call initAuth when store is used
  onMounted(() => {
    initAuth();
  });

  return { isAuthenticated, user, login, logout, initAuth, isAuthReady };
});