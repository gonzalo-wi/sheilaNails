<script setup lang="ts">
interface LoadingProps {
  fullscreen?: boolean
  message?: string
}

withDefaults(defineProps<LoadingProps>(), {
  fullscreen: false,
  message: 'Cargando...',
})
</script>

<template>
  <div
    :class="[
      'flex flex-col items-center justify-center',
      fullscreen ? 'fixed inset-0 bg-neutral-950 z-50' : 'py-16',
    ]"
  >
    <div class="relative">
      <div class="w-16 h-16 border-4 border-neutral-800 border-t-primary-500 rounded-full animate-spin mb-6" />
      <div class="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-600/30 rounded-full animate-spin" style="animation-duration: 1.5s" />
    </div>
    <p class="text-neutral-400 font-medium">{{ message }}</p>
  </div>
</template>
