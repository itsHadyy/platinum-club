import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/useAuthStore';

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isLoggedIn = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/auth/login'); // Redirect to login if not authenticated
  } else {
    next(); // Allow navigation
  }
});

export default router;