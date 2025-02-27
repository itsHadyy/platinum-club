import { defineAsyncComponent } from 'vue';

export default [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/auth/HomePage.vue') },
      { path: '/register', component: defineAsyncComponent(() => import('pages/auth/RegisterPage.vue')) },
      { path: '/admin', component: () => import('src/pages/AdminPanel.vue'), meta: { requiresAdmin: true } },
      { path: '/pending', component: () => import('src/pages/auth/PendingApproval.vue') },
    ]
  },
  {
    path: '/login',
    component: () => import('src/pages/auth/LoginPage.vue')
  }
];