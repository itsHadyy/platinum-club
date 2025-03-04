export default [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/authed/HomePage.vue') },  // Public homepage
      { path: '/register', component: () => import('src/pages/auth/RegisterPage.vue') },
      { path: '/login', component: () => import('src/pages/auth/LoginPage.vue') },

      // Restricted Routes
      { 
        path: '/dashboard',
        component: () => import('src/pages/auth/UserDashboard.vue'), 
        meta: { requiresAuth: true } 
      },
      { 
        path: '/admin', 
        component: () => import('src/pages/AdminPanel.vue'), 
        meta: { requiresAdmin: true } 
      },
      { 
        path: '/pending', 
        component: () => import('src/pages/auth/PendingApproval.vue') 
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound.vue')
  }
];