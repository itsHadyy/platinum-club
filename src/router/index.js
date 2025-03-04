// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { auth, db } from 'src/boot/firebase';
import { getDoc, doc } from 'firebase/firestore';

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 🔐 Navigation Guards
router.beforeEach(async (to, from, next) => {
  const user = auth.currentUser;
  
  if (to.meta.requiresAuth) {
    // If the route requires authentication
    if (!user) {
      return next('/login'); // Redirect if user is not logged in
    }
  }

  if (to.meta.requiresAdmin) {
    // If the route requires admin access
    if (!user) {
      return next('/login'); // Redirect if not logged in
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || userDoc.data().role !== "admin") {
      return next('/'); // Redirect non-admins
    }
  }

  next();
});

export default router;