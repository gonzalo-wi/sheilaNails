<script setup lang="ts">
import { computed } from 'vue'
import type { EstadoTurno } from '@/shared/types'

interface Props {
  estado: EstadoTurno | string
  dot?: boolean
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), { dot: true, size: 'md' })

const config: Record<string, { label: string; classes: string; dotColor: string }> = {
  PENDING:   { label: 'Pendiente',  classes: 'bg-amber-100   text-amber-800',   dotColor: 'bg-amber-500'   },
  CONFIRMED: { label: 'Confirmado', classes: 'bg-emerald-100 text-emerald-800', dotColor: 'bg-emerald-500'  },
  DONE:      { label: 'Realizado',  classes: 'bg-blue-100    text-blue-800',    dotColor: 'bg-blue-500'    },
  CANCELLED: { label: 'Cancelado',  classes: 'bg-red-100     text-red-800',     dotColor: 'bg-red-500'     },
  ABSENT:    { label: 'Ausente',    classes: 'bg-neutral-100  text-neutral-600', dotColor: 'bg-neutral-400' },
}

const fallback = { label: 'Pendiente', classes: 'bg-amber-100 text-amber-800', dotColor: 'bg-amber-500' }
const current = computed(() => config[props.estado] ?? fallback)
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs',
      current.classes,
    ]"
  >
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', current.dotColor]" />
    {{ current.label }}
  </span>
</template>
