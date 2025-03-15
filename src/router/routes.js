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
      { path: 'admin', component: () => import('src/pages/AdminPanel.vue'), meta: { requiresAdmin: true } },
      { path: 'profile', component: () => import('src/pages/authed/UserProfile.vue') },
      // { path: 'amenities', component: () => import('src/pages/authed/AmenitiesPage.vue') },
      { path: 'access-control', component: () => import('src/pages/authed/AccessControl.vue') },
      { path: 'bookings-dashboard', component: () => import('src/pages/authed/BookingDashboard.vue') },
      {
        path: '/booking/court/:courtType',
        component: () => import('src/pages/authed/CourtBookingPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/booking/summary',
        name: 'BookingSummaryPage',
        component: () => import('src/pages/authed/BookingSummaryPage.vue')
      },
      {
        path: '/my-bookings',
        component: () => import('src/pages/authed/MyBookingsPage.vue')
    }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound.vue')
  }
];