<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-neutral-950">
    <!-- Header Premium -->
    <header class="bg-neutral-900/50 backdrop-blur-xl border-b border-neutral-800/50 sticky top-0 z-40">
      <div class="container-custom py-3 md:py-5">
        <div class="flex items-center justify-between">
          <RouterLink 
            to="/" 
            class="flex items-center text-neutral-400 hover:text-white transition-all duration-200 focus-ring rounded-lg px-2 py-1.5 -ml-2"
          >
            <ArrowLeft :size="18" class="mr-1.5" />
            <span class="font-medium text-sm">Volver</span>
          </RouterLink>
          <RouterLink to="/" class="flex items-center">
            <img src="@/assets/sheiLogo.png" alt="Nails Deni" class="h-10 w-10 rounded-full object-cover border-2 border-primary-500/50" />
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="py-6 md:py-12">
      <RouterView />
    </main>

    <!-- Footer Simple -->
    <footer class="py-8 border-t border-neutral-800/50">
      <div class="container-custom">
        <p class="text-center text-neutral-500 text-sm">
          © 2026 Nails Deni by Denisse Gimenez. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  </div>
</template>
