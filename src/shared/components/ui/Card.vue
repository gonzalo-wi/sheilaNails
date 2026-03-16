<script setup lang="ts">
interface CardProps {
  hoverable?: boolean
  padding?: boolean
  bordered?: boolean
}

withDefaults(defineProps<CardProps>(), {
  hoverable: false,
  padding: true,
  bordered: false,
})
</script>

<template>
  <div
    :class="[
      hoverable ? 'card-hover' : bordered ? 'card-bordered' : 'card',
      { 'p-0': !padding }
    ]"
  >
    <slot />
  </div>
</template>
