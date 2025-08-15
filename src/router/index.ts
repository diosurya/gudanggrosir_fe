import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    PublicRoutes, // landing & auth
    MainRoutes,   // admin dashboard
    {
      path: '/:pathMatch(.*)*', // fallback 404
      name: 'NotFound',
      component: () => import('@/views/admin/pages/maintenance/error/Error404Page.vue')
    }
  ]
});

// ----- Navigation Guard -----
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  const uiStore = useUIStore();

  // set loading
  uiStore.isLoading = true;

  // initialize user from localStorage jika belum ada
  if (!auth.user) auth.initialize();

  // halaman publik
  const publicPages = ['/', '/login', '/login1', '/register'];
  const authRequired = !publicPages.includes(to.path) && to.matched.some(record => record.meta.requiresAuth);

  if (authRequired && !auth.user) {
    // user belum login, simpan returnUrl
    auth.setReturnUrl(to.fullPath);
    return next('/login');
  }

  // jika user sudah login dan akses login page, redirect
  if (auth.user && ['/login', '/login1'].includes(to.path)) {
    return next('/admin/dashboard');
  }

  // role-based access (optional)
  const requiredRoles = to.meta.roles as string[] | undefined;
  if (requiredRoles && auth.user) {
    const hasAccess = auth.user.roles?.some(role => requiredRoles.includes(role));
    if (!hasAccess) return next('/admin/dashboard'); // default redirect jika tidak punya role
  }

  next();
});

// ----- Setelah navigasi selesai -----
router.afterEach(() => {
  const uiStore = useUIStore();
  uiStore.isLoading = false;
});
