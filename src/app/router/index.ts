import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/modules/admin/store/auth'

// Prevent browser from restoring previous scroll position on refresh
if (typeof window !== 'undefined') {
  history.scrollRestoration = 'manual'
}

const routes: RouteRecordRaw[] = [
  // Public routes
  {
    path: '/',
    component: () => import('@/modules/public/layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/modules/public/pages/HomePage.vue'),
      },
    ],
  },
  // Booking routes
  {
    path: '/turnos',
    component: () => import('@/modules/booking/layouts/BookingLayout.vue'),
    children: [
      {
        path: '',
        name: 'booking',
        component: () => import('@/modules/booking/pages/BookingPage.vue'),
      },
      {
        path: 'exito',
        name: 'booking-success',
        component: () => import('@/modules/booking/pages/BookingSuccessPage.vue'),
      },
    ],
  },
  // Admin login (outside admin layout)
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/modules/admin/pages/LoginPage.vue'),
    meta: { guestOnly: true },
  },
  // Admin routes (protected)
  {
    path: '/admin',
    component: () => import('@/modules/admin/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'admin-dashboard' },
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/modules/admin/pages/DashboardPage.vue'),
      },
      {
        path: 'agenda',
        name: 'admin-agenda',
        component: () => import('@/modules/admin/pages/AgendaPage.vue'),
      },
      {
        path: 'turnos',
        name: 'admin-turnos',
        component: () => import('@/modules/admin/pages/TurnosPage.vue'),
      },
      {
        path: 'clientes',
        name: 'admin-clientes',
        component: () => import('@/modules/admin/pages/ClientesPage.vue'),
      },
      {
        path: 'servicios',
        name: 'admin-servicios',
        component: () => import('@/modules/admin/pages/ServiciosPage.vue'),
      },
      {
        path: 'profesionales',
        name: 'admin-profesionales',
        component: () => import('@/modules/admin/pages/ProfesionalesPage.vue'),
      },
      {
        path: 'configuracion',
        name: 'admin-config',
        component: () => import('@/modules/admin/pages/ConfigPage.vue'),
      },
      {
        path: 'horarios',
        name: 'admin-horarios',
        component: () => import('@/modules/admin/pages/HorariosPage.vue'),
      },
      {
        path: 'finanzas',
        name: 'admin-finanzas',
        component: () => import('@/modules/admin/pages/FinanzasPage.vue'),
      },
    ],
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/shared/components/common/NotFoundPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

// Navigation guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Cargar auth desde localStorage si no está cargado
  if (!authStore.isAuthenticated && localStorage.getItem('accessToken')) {
    authStore.loadFromStorage()
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirigir a login si no está autenticado
    next({ name: 'admin-login', query: { redirect: to.fullPath } })
  } else if (guestOnly && authStore.isAuthenticated) {
    // Redirigir al dashboard si ya está autenticado
    next({ name: 'admin-dashboard' })
  } else {
    next()
  }
})

export default router
