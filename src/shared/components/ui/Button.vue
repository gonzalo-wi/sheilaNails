<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
})

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
}

const sizeClasses = {
  sm: 'btn-sm text-sm',
  md: 'text-base',
  lg: 'btn-lg text-lg',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'btn',
      variantClasses[variant],
      sizeClasses[size],
      { 'opacity-60 cursor-not-allowed': disabled || loading },
    ]"
  >
    <Loader2 v-if="loading" :size="18" class="animate-spin mr-2" />
    <slot />
  </button>
</template>
