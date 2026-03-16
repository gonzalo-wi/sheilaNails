<script setup lang="ts">
interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  dot?: boolean
}

withDefaults(defineProps<BadgeProps>(), {
  variant: 'neutral',
  dot: false,
})

const variantClasses = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  neutral: 'badge-neutral',
}
</script>

<template>
  <span :class="['badge', variantClasses[variant]]">
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
    <slot />
  </span>
</template>
