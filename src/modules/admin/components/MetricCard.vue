<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  subvalue?: string
  /** Tailwind bg class for the icon area e.g. "bg-primary-100" */
  iconBg?: string
  /** Tailwind text class for the icon e.g. "text-primary-600" */
  iconColor?: string
  trend?: number          // positive = up, negative = down, undefined = no trend
  trendLabel?: string
}

defineProps<Props>()
</script>

<template>
  <div class="bg-white rounded-xl shadow-soft p-5 flex flex-col gap-3">
    <!-- Top row: label + icon -->
    <div class="flex items-start justify-between">
      <p class="text-sm font-medium text-neutral-500 leading-tight">{{ label }}</p>
      <div
        v-if="$slots.icon"
        :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg ?? 'bg-primary-100']"
      >
        <slot name="icon" />
      </div>
    </div>

    <!-- Value -->
    <div>
      <p class="text-2xl font-bold text-neutral-900 leading-none">{{ value }}</p>
      <p v-if="subvalue" class="text-xs text-neutral-500 mt-1">{{ subvalue }}</p>
    </div>

    <!-- Trend -->
    <div v-if="trend !== undefined" class="flex items-center gap-1.5 text-xs font-medium">
      <span
        :class="[
          'flex items-center gap-0.5',
          trend >= 0 ? 'text-emerald-600' : 'text-red-500',
        ]"
      >
        <svg v-if="trend >= 0" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
        {{ Math.abs(trend) }}%
      </span>
      <span class="text-neutral-400">{{ trendLabel ?? 'vs mes anterior' }}</span>
    </div>
  </div>
</template>
