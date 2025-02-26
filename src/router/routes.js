import { defineAsyncComponent } from 'vue';

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/auth/HomePage.vue') },
      { path: '/register', component: defineAsyncComponent(() => import('pages/auth/RegisterPage.vue')) },
      { path: '/login', component: defineAsyncComponent(() => import('pages/auth/LoginPage.vue')) },  // New login page
      { path: '/pending', component: () => import('src/pages/auth/PendingApproval.vue') },
      {
        path: '/admin-dashboard',
        component: () => import('pages/AdminDashboard.vue'),
        meta: { requiresAdmin: true } // Protect admin dashboard
      }
    ]
  },

  // Catch all unknown routes
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;