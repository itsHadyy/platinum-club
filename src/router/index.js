import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from 'stores/useAuthStore';
import { Notify } from 'quasar'; // Import Quasar Notify
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

  // 🚀 Allow access to login and pending pages for all users
  if (to.path === '/auth/login' || to.path === '/auth/pending') {
    return next();
  }

  // 🚨 If authentication is required and the user is not logged in, redirect to login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/auth/login');
  }

  // 🚨 If the user is "pending" and tries to access any other page, redirect to "/auth/pending"
  if (authStore.user?.role === 'pending') {
    Notify.create({
      type: 'warning',
      message: "Waiting for account approval, you'll be notified shortly.",
      position: 'top',
      timeout: 3000
    });
    return next('/auth/pending');
  }

  next(); // ✅ Allow access if no restrictions apply
});

export default router;