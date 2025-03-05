// src/stores/auth.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false); // Default: User is not logged in
  const user = ref(null);

  function login(userData) {
    user.value = userData;
    isAuthenticated.value = true;
  }

  function logout() {
    user.value = null;
    isAuthenticated.value = false;
  }

  return { isAuthenticated, user, login, logout };
});