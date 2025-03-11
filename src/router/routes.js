export default [
  // Layout for Unauthenticated Users
  {
    path: '/auth',
    component: () => import('src/layouts/AuthLayout.vue'),
    children: [
      { path: 'login', component: () => import('src/pages/auth/LoginPage.vue') },
      { path: 'register', component: () => import('src/pages/auth/RegisterPage.vue') },
      { path: 'pending', component: () => import('src/pages/auth/PendingApproval.vue') },
    ]
  },

  // Layout for Authenticated Users
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('src/pages/authed/HomePage.vue') },
      { path: 'profile', component: () => import('src/pages/authed/UserProfile.vue') },
      // { path: 'amenities', component: () => import('src/pages/authed/AmenitiesPage.vue') },
      { path: 'access-control', component: () => import('src/pages/authed/AccessControl.vue') },
      { path: 'admin', component: () => import('src/pages/AdminPanel.vue'), meta: { requiresAdmin: true } }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound.vue')
  }
];