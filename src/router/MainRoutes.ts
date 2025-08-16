const MainRoutes = {
  path: '/admin',
  component: () => import('@/layouts/dashboard/DashboardLayout.vue'),
  meta: { requiresAuth: true },
  redirect: '/admin/dashboard',
  children: [
    {
      name: 'Dashboard',
      path: 'dashboard',
      meta: { title: 'Dashboard - Gudang Grosiran' },
      component: () => import('@/views/admin/dashboard/DefaultDashboard.vue')
    },
    // {
    //   name: 'SEO Manager',
    //   path: 'seo-manager',
    //   meta: { title: 'Kelola SEO' },
    //   component: () => import('@/views/admin/seo/SeoManager.vue')
    // },
    {
      name: 'About',
      path: 'pages/about',
      meta: { title: 'Pages About - Gudang Grosiran' },
      component: () => import('@/views/admin/pages/about/About.vue')
    },
    {
      name: 'Settings Pages About',
      path: 'pages/settings',
      meta: { title: 'Settings' },
      component: () => import('@/views/admin/pages/settings/settings.vue')
    },
    {
      name: 'Typography',
      path: 'typography',
      component: () => import('@/views/admin/typography/TypographyPage.vue')
    },
    {
      name: 'Colors',
      path: 'colors',
      component: () => import('@/views/admin/colors/ColorPage.vue')
    },
    {
      name: 'Shadow',
      path: 'shadow',
      component: () => import('@/views/admin/shadows/ShadowPage.vue')
    },
    {
      name: 'AntIcons',
      path: 'icon/ant',
      component: () => import('@/views/admin/icons/AntDesignIcons.vue')
    },
    {
      name: 'SamplePage',
      path: 'sample-page',
      component: () => import('@/views/admin/StarterPage.vue')
    }
  ]
};

export default MainRoutes;
