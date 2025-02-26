import { defineRouter } from '#q-app/wrappers';
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router';
import routes from './routes';
import { auth, db } from 'src/boot/firebase'; // Import Firebase auth & DB
import { getDoc, doc } from 'firebase/firestore';

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  });

  // Navigation Guard for Protected Routes
  Router.beforeEach(async (to, from, next) => {
    const user = auth.currentUser; // Get logged-in user

    if (to.meta.requiresAuth && !user) {
      next('/login'); // Redirect if not logged in
      return;
    }

    if (to.meta.requiresAdmin) {
      if (!user) {
        next('/login');
        return;
      }

      // Fetch user's role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        next(); // Allow admin access
      } else {
        next('/dashboard'); // Redirect non-admins
      }
      return;
    }

    next(); // Continue navigation
  });

  return Router;
});