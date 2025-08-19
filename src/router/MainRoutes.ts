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
      name: 'Blogs',
      path: 'pages/blogs',
      meta: { title: 'Blogs - Gudang Grosiran' },
      component: () => import('@/views/admin/pages/blogs/Blogs.vue')
    },
    {
      name: 'Blog Detail',
      path: 'pages/blogs/:id',
      meta: { title: 'Blog Detail - Gudang Grosiran' },
      component: () => import('@/views/admin/pages/blogs/DetailBlogs.vue'),
      props: true
    },
     {
      name: 'Products',
      path: 'ecommerce/products',
      meta: { title: 'Products - Gudang Grosiran' },
      component: () => import('@/views/admin/pages/products/Products.vue'),
      props: true
    },
    {
      name: 'Add Product',
      path: 'ecommerce/products/add',
      meta: { title: 'Add Product - Gudang Grosiran' },
      component: () => import('@/views/admin/pages/products/AddProduct.vue')
    },
    {
      name: 'Edit Product',
      path: 'ecommerce/products/:id',
      meta: { title: 'Edit Product - Gudang Grosiran' },
      component: () => import('@/views/admin/pages/products/EditProduct.vue'),
      props: true
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
