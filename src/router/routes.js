export default [
  // Layout for Unauthenticated Users
  {
    path: '/auth',
    component: () => import('src/layouts/AuthLayout.vue'),
    children: [
      { path: 'login', component: () => import('src/pages/auth/LoginPage.vue') },
      { path: 'register', component: () => import('src/pages/auth/RegisterPage.vue') },
      { path: 'pending', component: () => import('src/pages/auth/PendingApproval.vue') },
      { path: 'landing', component: () => import('src/pages/auth/LandingPage.vue') },
    ]
  },

  // Layout for Authenticated Users
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('src/pages/authed/HomePage.vue') },
      { path: 'dashboard', component: () => import('src/pages/authed/UserDashboard.vue') },
      // { path: 'amenities', component: () => import('src/pages/authed/AmenitiesPage.vue') },
      { path: 'admin', component: () => import('src/pages/AdminPanel.vue'), meta: { requiresAdmin: true } }
    ]
  },

  // Catch-All for 404 Errors
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound.vue')
  }
];