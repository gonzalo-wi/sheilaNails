<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '@/shared/components/ui/Button.vue'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-primary-600">404</h1>
      <h2 class="text-3xl font-semibold text-neutral-900 mt-4">Página no encontrada</h2>
      <p class="text-neutral-600 mt-2 mb-8">
        La página que estás buscando no existe o fue movida.
      </p>
      <Button @click="goHome">Volver al inicio</Button>
    </div>
  </div>
</template>
