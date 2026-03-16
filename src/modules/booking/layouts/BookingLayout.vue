<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-neutral-950">
    <!-- Header Premium -->
    <header class="bg-neutral-900/50 backdrop-blur-xl border-b border-neutral-800/50 sticky top-0 z-40">
      <div class="container-custom py-6">
        <div class="flex items-center justify-between">
          <RouterLink 
            to="/" 
            class="flex items-center text-neutral-400 hover:text-white transition-all duration-200 focus-ring rounded-lg px-3 py-2 -ml-3"
          >
            <ArrowLeft :size="20" class="mr-2" />
            <span class="font-medium">Volver</span>
          </RouterLink>
          <RouterLink to="/" class="font-display text-2xl font-bold text-gradient">
            Nails Studio
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="py-12">
      <RouterView />
    </main>

    <!-- Footer Simple -->
    <footer class="py-8 border-t border-neutral-800/50">
      <div class="container-custom">
        <p class="text-center text-neutral-500 text-sm">
          © 2024 Nails Studio. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  </div>
</template>
