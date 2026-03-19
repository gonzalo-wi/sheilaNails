<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useClientAuthStore } from '@/modules/auth/store/clientAuth'
import { Menu, X, LogOut, User, CheckCircle, Calendar } from 'lucide-vue-next'

const mobileMenuOpen = ref(false)
const scrolled = ref(false)
const clientAuthStore = useClientAuthStore()

const isLoggedIn = computed(() => clientAuthStore.isAuthenticated)
const userFullName = computed(() => clientAuthStore.fullName)
const userInitials = computed(() => clientAuthStore.initials)

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

const showLogoutToast = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function logout() {
  clientAuthStore.logout()
  mobileMenuOpen.value = false
  showLogoutToast.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { showLogoutToast.value = false }, 3000)
}

const navLinks = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Trabajos', href: '#trabajos' },
  { label: 'Preguntas', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
]
</script>

<template>
  <div class="min-h-screen bg-neutral-950">

    <!-- ── Navbar ── -->
    <nav
      :class="[
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
          : 'bg-black/70 backdrop-blur-md border-b border-white/5',
      ]"
    >
      <div class="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 gap-8">

        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2.5 flex-shrink-0 group">
          <img
            src="@/assets/sheiLogo.png"
            alt="Nails Deni"
            class="h-9 w-9 rounded-full object-cover ring-2 ring-pink-500/40 group-hover:ring-pink-500/70 transition-all duration-300"
          />
          <span class="font-semibold text-white text-[15px] tracking-tight hidden sm:block">Nails Deni</span>
        </RouterLink>

        <!-- Desktop nav links (center) -->
        <ul class="hidden md:flex items-center gap-1 flex-1 justify-center">
          <li v-for="link in navLinks" :key="link.href">
            <a
              :href="link.href"
              class="relative px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-all duration-200 rounded-lg hover:bg-white/5 group"
            >
              {{ link.label }}
              <span class="absolute bottom-0 left-3 right-3 h-px bg-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
            </a>
          </li>
        </ul>

        <!-- Desktop actions (right) -->
        <div class="hidden md:flex items-center gap-2.5 flex-shrink-0">

          <!-- Logged in -->
          <template v-if="isLoggedIn">
            <RouterLink
              to="/turnos"
              class="flex items-center gap-1.5 text-sm font-medium bg-pink-500 hover:bg-pink-400 text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-[0_0_16px_rgba(236,72,153,0.4)]"
            >
              <Calendar :size="14" />
              Reservar turno
            </RouterLink>
            <div class="flex items-center gap-2 pl-3 border-l border-white/10">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-600 to-pink-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-pink-500/20">
                {{ userInitials || clientAuthStore.user?.email?.[0]?.toUpperCase() }}
              </div>
              <span class="text-sm text-neutral-300 max-w-[110px] truncate">{{ userFullName || clientAuthStore.user?.email }}</span>
              <button
                class="ml-1 p-1 text-neutral-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                title="Cerrar sesión"
                @click="logout"
              >
                <LogOut :size="15" />
              </button>
            </div>
          </template>

          <!-- Guest -->
          <template v-else>
            <RouterLink
              :to="{ name: 'client-login' }"
              class="flex items-center gap-1.5 text-sm font-medium text-neutral-300 hover:text-white px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-200"
            >
              <User :size="14" />
              Iniciar sesión
            </RouterLink>
            <RouterLink
              to="/turnos"
              class="flex items-center gap-1.5 text-sm font-medium bg-pink-500 hover:bg-pink-400 text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-[0_0_16px_rgba(236,72,153,0.4)]"
            >
              <Calendar :size="14" />
              Reservar turno
            </RouterLink>
          </template>
        </div>

        <!-- Mobile: CTA siempre visible + hamburguesa -->
        <div class="md:hidden flex items-center gap-2">
          <RouterLink
            to="/turnos"
            class="text-xs font-semibold bg-pink-500 hover:bg-pink-400 text-white px-3 py-1.5 rounded-lg transition-all"
          >
            Reservar
          </RouterLink>
          <button
            class="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <Transition mode="out-in"
              enter-active-class="transition-all duration-150"
              enter-from-class="opacity-0 rotate-90 scale-75"
              enter-to-class="opacity-100 rotate-0 scale-100"
              leave-active-class="transition-all duration-100"
              leave-from-class="opacity-100 rotate-0 scale-100"
              leave-to-class="opacity-0 -rotate-90 scale-75"
            >
              <Menu v-if="!mobileMenuOpen" :size="22" />
              <X v-else :size="22" />
            </Transition>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition-all duration-250 ease-out"
        enter-from-class="opacity-0 -translate-y-3"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-3"
      >
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl">
          <div class="max-w-7xl mx-auto px-6 py-5 space-y-1">
            <a
              v-for="link in navLinks"
              :key="link.href"
              :href="link.href"
              class="flex items-center text-sm text-neutral-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-all"
              @click="mobileMenuOpen = false"
            >
              {{ link.label }}
            </a>

            <div class="pt-4 mt-2 border-t border-white/5 space-y-2">
              <!-- Logged in -->
              <template v-if="isLoggedIn">
                <div class="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-600 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                      {{ userInitials || clientAuthStore.user?.email?.[0]?.toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <p v-if="userFullName" class="text-sm font-medium text-white truncate">{{ userFullName }}</p>
                      <p class="text-xs text-neutral-500 truncate">{{ clientAuthStore.user?.email }}</p>
                    </div>
                  </div>
                  <button
                    class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                    @click="logout"
                  >
                    <LogOut :size="14" />
                    Salir
                  </button>
                </div>
              </template>

              <!-- Guest -->
              <template v-else>
                <RouterLink
                  :to="{ name: 'client-login' }"
                  class="flex items-center justify-center gap-2 w-full text-sm font-medium text-neutral-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 py-2.5 rounded-xl transition-all"
                  @click="mobileMenuOpen = false"
                >
                  <User :size="15" />
                  Iniciar sesión
                </RouterLink>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- Spacer -->
    <div class="h-16" />

    <!-- Content -->
    <RouterView />

    <!-- Logout toast -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="showLogoutToast"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 bg-neutral-900 border border-white/10 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl whitespace-nowrap"
      >
        <CheckCircle :size="16" class="text-emerald-400 flex-shrink-0" />
        Sesión cerrada correctamente
      </div>
    </Transition>

  </div>
</template>
