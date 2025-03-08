import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from 'stores/useAuthStore';
import routes from './routes';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthReady) {
    await new Promise((resolve) => {
      const unwatch = authStore.$subscribe(() => {
        if (authStore.isAuthReady) {
          unwatch();
          resolve();
        }
      });
    });
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login');
  } else {
    next();
  }
});

export default router;