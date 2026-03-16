<script setup lang="ts">
interface EmptyStateProps {
  title: string
  message?: string
  icon?: string
}

withDefaults(defineProps<EmptyStateProps>(), {
  message: '',
  icon: '',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div v-if="icon" class="text-7xl mb-6 opacity-50">{{ icon }}</div>
    <svg
      v-else
      class="w-20 h-20 text-neutral-700 mb-6 opacity-50"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
    <h3 class="text-xl font-semibold text-white mb-2">{{ title }}</h3>
    <p v-if="message" class="text-neutral-400 max-w-md leading-relaxed">{{ message }}</p>
    <div v-if="$slots.default" class="mt-6">
      <slot />
    </div>
  </div>
</template>
