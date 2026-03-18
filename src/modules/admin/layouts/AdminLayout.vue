<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Users,
  Sparkles,
  UserCircle2,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
  BarChart2,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, route: '/admin/dashboard' },
  { name: 'Agenda', icon: Calendar, route: '/admin/agenda' },
  { name: 'Turnos', icon: ClipboardList, route: '/admin/turnos' },
  { name: 'Clientes', icon: Users, route: '/admin/clientes' },
  { name: 'Servicios', icon: Sparkles, route: '/admin/servicios' },
  { name: 'Profesionales', icon: UserCircle2, route: '/admin/profesionales' },
  { name: 'Horarios', icon: Clock, route: '/admin/horarios' },
  { name: 'Finanzas', icon: BarChart2, route: '/admin/finanzas' },
  { name: 'Configuración', icon: Settings, route: '/admin/configuracion' },
]

const isActive = (routePath: string) => {
  return route.path === routePath
}

function handleLogout() {
  authStore.logout()
  router.push('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex">
    <!-- Sidebar (Desktop) -->
    <aside class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-neutral-900 text-white">
      <div class="flex items-center gap-3 h-16 px-4 border-b border-neutral-800">
        <img src="@/assets/sheiLogo.png" alt="Nails Deni" class="h-10 w-10 rounded-full object-cover border-2 border-primary-500/50" />
        <span class="font-bold text-white text-lg tracking-tight leading-tight">Nails Deni</span>
      </div>
      
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in menuItems"
          :key="item.route"
          :to="item.route"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
            isActive(item.route)
              ? 'bg-primary-600 text-white'
              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
          ]"
        >
          <component :is="item.icon" :size="20" />
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-neutral-800">
        <div class="flex items-center gap-3 px-4 py-3 mb-2 bg-neutral-800 rounded-lg">
          <div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
            <span class="text-sm font-semibold">S</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">Sheila</p>
            <p class="text-xs text-neutral-400 truncate">Administradora</p>
          </div>
        </div>
        <button
          class="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          @click="handleLogout"
        >
          <LogOut :size="20" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Sidebar -->
    <div
      v-if="sidebarOpen"
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="sidebarOpen = false"
    />
    
    <aside
      :class="[
        'lg:hidden fixed inset-y-0 left-0 w-64 bg-neutral-900 text-white z-50 transform transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex items-center justify-between h-16 px-4 border-b border-neutral-800">
        <img src="@/assets/sheiLogo.png" alt="Nails Deni" class="h-10 w-10 rounded-full object-cover border-2 border-primary-500/50" />
        <button @click="sidebarOpen = false">
          <X :size="24" />
        </button>
      </div>
      
      <nav class="px-4 py-6 space-y-1">
        <RouterLink
          v-for="item in menuItems"
          :key="item.route"
          :to="item.route"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
            isActive(item.route)
              ? 'bg-primary-600 text-white'
              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
          ]"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" :size="20" />
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800">
        <button
          class="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          @click="handleLogout"
        >
          <LogOut :size="20" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 lg:ml-64">
      <!-- Topbar -->
      <header class="bg-white shadow-sm sticky top-0 z-30">
        <div class="h-16 px-4 lg:px-8 flex items-center justify-between">
          <button class="lg:hidden" @click="sidebarOpen = true">
            <Menu :size="24" />
          </button>
          
          <div class="flex-1 lg:flex-none" />
          
          <div class="flex items-center gap-4">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-medium text-neutral-900">Bienvenida, Sheila 👋</p>
              <p class="text-xs text-neutral-500">Administradora</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
              S
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-4 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
