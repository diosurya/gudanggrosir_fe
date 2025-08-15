const MainRoutes = {
  path: '/admin',
  component: () => import('@/layouts/dashboard/DashboardLayout.vue'),
  meta: { requiresAuth: true },
  redirect: '/admin/dashboard',
  children: [
    {
      name: 'Dashboard',
      path: 'dashboard', // /admin/dashboard
      component: () => import('@/views/admin/dashboard/DefaultDashboard.vue')
    },
    {
      name: 'Admin Pages About',
      path: 'pages/about',
      component: () => import('@/views/admin/pages/about/About.vue')
    },
    {
      name: 'Settings Pages About',
      path: 'pages/settings',
      component: () => import('@/views/admin/pages/settings/settings.vue')
    },
    {
      name: 'Typography',
      path: 'typography', // /admin/typography
      component: () => import('@/views/admin/typography/TypographyPage.vue')
    },
    {
      name: 'Colors',
      path: 'colors', // /admin/colors
      component: () => import('@/views/admin/colors/ColorPage.vue')
    },
    {
      name: 'Shadow',
      path: 'shadow', // /admin/shadow
      component: () => import('@/views/admin/shadows/ShadowPage.vue')
    },
    {
      name: 'AntIcons',
      path: 'icon/ant', // /admin/icon/ant
      component: () => import('@/views/admin/icons/AntDesignIcons.vue')
    },
    {
      name: 'SamplePage',
      path: 'sample-page', // /admin/sample-page
      component: () => import('@/views/admin/StarterPage.vue')
    }
  ]
};

export default MainRoutes;
