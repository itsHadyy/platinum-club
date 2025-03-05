import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const user = ref(null);

  function login(userData) {
    user.value = userData;
    isAuthenticated.value = true;
    localStorage.setItem('authUser', JSON.stringify(userData)); // Persist session
  }

  function logout() {
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('authUser');
  }

  return { isAuthenticated, user, login, logout };
});