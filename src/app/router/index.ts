import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/modules/admin/store/auth'
import { useClientAuthStore } from '@/modules/auth/store/clientAuth'

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
  // Client auth routes (standalone pages, no layout wrapper)
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        name: 'client-login',
        component: () => import('@/modules/auth/pages/ClientLoginPage.vue'),
        meta: { clientGuestOnly: true },
      },
      {
        path: 'registro',
        name: 'client-register',
        component: () => import('@/modules/auth/pages/ClientRegisterPage.vue'),
        meta: { clientGuestOnly: true },
      },
      {
        path: 'recuperar',
        name: 'client-forgot',
        component: () => import('@/modules/auth/pages/ForgotPasswordPage.vue'),
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
  const clientAuthStore = useClientAuthStore()

  // Restore sessions from localStorage if not already loaded
  if (!authStore.isAuthenticated && localStorage.getItem('accessToken')) {
    authStore.loadFromStorage()
  }
  if (!clientAuthStore.isAuthenticated && localStorage.getItem('cliente_token')) {
    clientAuthStore.loadFromStorage()
  }

  const requiresAdminAuth = to.matched.some(r => r.meta.requiresAuth)
  const adminGuestOnly = to.matched.some(r => r.meta.guestOnly)
  const clientGuestOnly = to.matched.some(r => r.meta.clientGuestOnly)

  if (requiresAdminAuth && !authStore.isAuthenticated) {
    next({ name: 'admin-login', query: { redirect: to.fullPath } })
  } else if (adminGuestOnly && authStore.isAuthenticated) {
    next({ name: 'admin-dashboard' })
  } else if (clientGuestOnly && clientAuthStore.isAuthenticated) {
    // Already logged in — send to home instead of showing login/register
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
