
const PublicRoutes = {
  path: '/',
  component: () => import('@/layouts/blank/BlankLayout.vue'), // layout kosong
  meta: { requiresAuth: false },
  children: [
    {
      name: 'Landing',
      path: '',
      meta: { slug: 'Home' },
      component: () => import('@/views/landing/LandingPage.vue')
    },
    {
      name: 'Login',
      path: '/login',
      component: () => import('@/views/authentication/LoginPage.vue')
    },
    {
      name: 'Products',
      path: '/products',
      meta: { slug: 'products' },
      component: () => import('@/views/authentication/auth/LoginPage.vue')
    },
    {
      name: 'Product Detail',
      path: '/products/:slug',
      meta: { isDynamicSeo: true, type: 'product' },
      component: () => import('@/views/authentication/auth/LoginPage.vue')
      // component: () => import('@/views/landing/products/ProductDetail.vue')
    },
    // {
    //   name: 'Blogs',
    //   path: '/blogs',
    //   meta: { slug: 'blogs' },
    //   component: () => import('@/views/landing/blogs/BlogList.vue')
    // },
    // {
    //   name: 'Blog Detail',
    //   path: '/blogs/:slug',
    //   meta: { isDynamicSeo: true, type: 'blog' },
    //   component: () => import('@/views/landing/blogs/BlogDetail.vue')
    // },
    //  {
    //   name: 'About',
    //   path: '/about',
    //   meta: { slug: 'about' },
    //   component: () => import('@/views/landing/AboutPage.vue')
    // },
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
