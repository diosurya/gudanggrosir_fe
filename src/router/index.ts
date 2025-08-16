import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { useSeoStore } from '@/stores/seo_store';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    PublicRoutes,
    MainRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/admin/pages/maintenance/error/Error404Page.vue')
    }
  ]
});

// Guard sebelum masuk halaman
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  const uiStore = useUIStore();
  uiStore.isLoading = true;

  if (!auth.user) auth.initialize();

  const publicPages = ['/', '/login', '/register'];
  const authRequired = !publicPages.includes(to.path) && to.matched.some(record => record.meta.requiresAuth);

  if (authRequired && !auth.user) {
    auth.setReturnUrl(to.fullPath);
    return next('/login');
  }

  if (auth.user && ['/login'].includes(to.path)) {
    return next('/admin/dashboard');
  }

  next();
});

// Setelah halaman load, set SEO meta
router.afterEach(async (to) => {
  const uiStore = useUIStore();
  const seoStore = useSeoStore();
  uiStore.isLoading = false;

  // Skip kalau di admin
  if (to.path.startsWith('/admin')) {
    document.title = to.meta.title || 'Admin - Gudang Grosiran';
    return;
  }

  // Slug untuk public
  let slug = to.meta.slug || to.path.split('/').filter(Boolean).pop() || 'home';

  const meta = await seoStore.fetchSeoMeta(slug as string);

  if (meta) {
    document.title = meta.seo_title || 'Gudang Grosiran';
    let descriptionTag = document.querySelector("meta[name='description']");
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.setAttribute('name', 'description');
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute('content', meta.seo_description || '');
  }
});

