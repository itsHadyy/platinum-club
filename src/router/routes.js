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
      // { path: 'admin', component: () => import('src/pages/AdminPanel.vue'), meta: { requiresAdmin: true } },
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
      },
      {
        path: "/academies/:sport",
        component: () => import("src/pages/authed/AcademyList.vue")
      },
      {
        path: "/academy/:id",
        component: () => import("src/pages/authed/AcademyDetails.vue")
      },
      {
        path: '/booking/academy/:academyId/program',
        name: 'ProgramBooking',
        component: () => import('src/pages/authed/ProgramBookingPage.vue'),
        props: (route) => ({
          program: {
            name: route.query.programName || '',
            sport: route.query.sport || '',
            coaches: route.query.coaches?.split(',') || [],
            schedule: JSON.parse(route.query.schedule || '[]'),
            startDate: route.query.startDate || '',
            durationWeeks: parseInt(route.query.durationWeeks) || 0,
            price: parseFloat(route.query.price) || 0,
            ageGroup: route.query.ageGroup || '',
            description: route.query.description || '',
            levels: JSON.parse(route.query.levels || '[]')
          }
        })
      }
    ]
  },

  // Layout for Admin Users
  {
    path: '/admin',
    component: () => import('src/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'dashboard', component: () => import('src/pages/admin/AdminDashboard.vue') },
      { path: 'bookings', component: () => import('src/pages/admin/AdminBookings.vue') },
      { path: 'courts', component: () => import('src/pages/admin/AdminCourts.vue') },
      { path: 'users', component: () => import('src/pages/admin/AdminUsers.vue') },
      { path: 'academies', component: () => import('src/pages/admin/AdminAcademies.vue') }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound.vue')
  }
];