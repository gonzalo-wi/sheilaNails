<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useClientAuthStore } from '@/modules/auth/store/clientAuth'
import { Menu, X, LogOut, User } from 'lucide-vue-next'

const mobileMenuOpen = ref(false)
const clientAuthStore = useClientAuthStore()

const isLoggedIn = computed(() => clientAuthStore.isAuthenticated)
const userFullName = computed(() => clientAuthStore.fullName)
const userInitials = computed(() => clientAuthStore.initials)

function logout() {
  clientAuthStore.logout()
  mobileMenuOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950">
    <!-- Navbar Premium con Blur -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50">
      <div class="container-custom">
        <div class="flex justify-between items-center h-20">
          <RouterLink to="/" class="flex items-center gap-3">
            <img src="@/assets/sheiLogo.png" alt="Nails Deni" class="h-12 w-12 rounded-full object-cover border-2 border-primary-500/50" />
            <span class="hidden md:block font-display font-bold text-white text-xl tracking-tight">Nails Deni</span>
          </RouterLink>

          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center space-x-8">
            <a 
              href="#servicios" 
              class="text-neutral-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Servicios
            </a>
            <a 
              href="#faq" 
              class="text-neutral-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              FAQ
            </a>
            <a 
              href="#contacto" 
              class="text-neutral-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Contacto
            </a>

            <!-- Session state: logged in -->
            <div v-if="isLoggedIn" class="flex items-center gap-3">
              <RouterLink
                to="/turnos"
                class="btn btn-primary !py-2.5 !px-5 hover-glow text-sm"
              >
                Reservar turno
              </RouterLink>
              <div class="flex items-center gap-2 pl-3 border-l border-neutral-800">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {{ userInitials }}
                </div>
                <span class="text-sm text-neutral-300 max-w-[120px] truncate">{{ userFullName }}</span>
                <button
                  class="ml-1 text-neutral-500 hover:text-red-400 transition-colors"
                  title="Cerrar sesión"
                  @click="logout"
                >
                  <LogOut :size="16" />
                </button>
              </div>
            </div>

            <!-- Session state: guest -->
            <div v-else class="flex items-center gap-3">
              <RouterLink
                :to="{ name: 'client-login' }"
                class="text-neutral-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <User :size="16" />
                Iniciar sesión
              </RouterLink>
              <RouterLink
                to="/turnos"
                class="btn btn-primary !py-2.5 !px-5 hover-glow text-sm"
              >
                Reservar turno
              </RouterLink>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <button
            class="md:hidden text-neutral-300 hover:text-white focus-ring rounded-lg p-2"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <Menu v-if="!mobileMenuOpen" :size="24" />
            <X v-else :size="24" />
          </button>
        </div>

        <!-- Mobile Menu -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="mobileMenuOpen" class="md:hidden py-6 space-y-1 border-t border-neutral-800/50">
            <a 
              href="#servicios" 
              class="block text-neutral-300 hover:text-white hover:bg-neutral-800/50 py-3 px-4 rounded-lg transition-all"
              @click="mobileMenuOpen = false"
            >
              Servicios
            </a>
            <a 
              href="#faq" 
              class="block text-neutral-300 hover:text-white hover:bg-neutral-800/50 py-3 px-4 rounded-lg transition-all"
              @click="mobileMenuOpen = false"
            >
              FAQ
            </a>
            <a 
              href="#contacto" 
              class="block text-neutral-300 hover:text-white hover:bg-neutral-800/50 py-3 px-4 rounded-lg transition-all"
              @click="mobileMenuOpen = false"
            >
              Contacto
            </a>

            <div class="pt-4 space-y-2">
              <RouterLink
                to="/turnos"
                class="btn btn-primary block text-center"
                @click="mobileMenuOpen = false"
              >
                Reservar turno
              </RouterLink>

              <!-- Logged in: user info + logout -->
              <div v-if="isLoggedIn" class="flex items-center justify-between px-1 pt-3 border-t border-neutral-800">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white text-xs font-bold">
                    {{ userInitials }}
                  </div>
                  <span class="text-sm text-neutral-300 truncate max-w-[160px]">{{ userFullName }}</span>
                </div>
                <button
                  class="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-red-400 transition-colors"
                  @click="logout"
                >
                  <LogOut :size="16" />
                  Salir
                </button>
              </div>

              <!-- Guest: login + register links -->
              <div v-else class="flex gap-2 pt-3 border-t border-neutral-800">
                <RouterLink
                  :to="{ name: 'client-login' }"
                  class="flex-1 text-center py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-600 text-sm font-medium transition-all"
                  @click="mobileMenuOpen = false"
                >
                  Iniciar sesión
                </RouterLink>
                <RouterLink
                  :to="{ name: 'client-register' }"
                  class="flex-1 text-center py-2.5 rounded-xl bg-primary-500/10 border border-primary-500/30 text-primary-400 hover:bg-primary-500/20 text-sm font-medium transition-all"
                  @click="mobileMenuOpen = false"
                >
                  Registrarse
                </RouterLink>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </nav>

    <!-- Spacer para el navbar fixed -->
    <div class="h-20" />

    <!-- Content -->
    <RouterView />
  </div>
</template>
