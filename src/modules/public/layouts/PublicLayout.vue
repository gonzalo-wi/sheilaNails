<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'

const mobileMenuOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-neutral-950">
    <!-- Navbar Premium con Blur -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50">
      <div class="container-custom">
        <div class="flex justify-between items-center h-20">
          <RouterLink to="/" class="font-display text-2xl font-bold text-gradient">
            Nails Studio
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
            <RouterLink
              to="/turnos"
              class="btn btn-primary !py-2.5 !px-6 hover-glow"
            >
              Reservar turno
            </RouterLink>
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
            <RouterLink 
              to="/turnos" 
              class="btn btn-primary mt-4 block text-center"
              @click="mobileMenuOpen = false"
            >
              Reservar turno
            </RouterLink>
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
