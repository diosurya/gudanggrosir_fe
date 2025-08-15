
const PublicRoutes = {
  path: '/',
  component: () => import('@/layouts/blank/BlankLayout.vue'), // layout kosong
  meta: { requiresAuth: false },
  children: [
    {
      name: 'Landing',
      path: '',
      component: () => import('@/views/landing/LandingPage.vue')
    },
    {
      name: 'Login',
      path: '/login',
      component: () => import('@/views/authentication/LoginPage.vue')
    },
    {
      name: 'LoginAlt',
      path: '/login1',
      component: () => import('@/views/authentication/auth/LoginPage.vue')
    },
    {
      name: 'Register',
      path: '/register',
      component: () => import('@/views/authentication/auth/RegisterPage.vue')
    },
    {
      name: 'Error404',
      path: '/error',
      component: () => import('@/views/admin/pages/maintenance/error/Error404Page.vue')
    }
  ]
};

export default PublicRoutes;
