<script setup lang="ts">
/**
 * ClienteDetailsDrawer.vue
 * Slide-over con detalle completo de una clienta + historial de turnos.
 */
import { computed, watch } from 'vue'
import { X, Phone, Mail, Calendar, Star } from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import TurnoStatusBadge from './TurnoStatusBadge.vue'
import type { Cliente, Turno } from '@/shared/types'

interface Props {
  modelValue: boolean
  cliente: Cliente | null
  historial: Turno[]
  loadingHistorial?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'load-historial': [clienteId: number]
  'edit': [cliente: Cliente]
}>()

watch(() => props.modelValue, (open) => {
  if (open && props.cliente) emit('load-historial', props.cliente.id)
})

function close() { emit('update:modelValue', false) }

const inicialesAvatar = computed(() => {
  if (!props.cliente) return ''
  return `${props.cliente.nombre.charAt(0)}${props.cliente.apellido.charAt(0)}`
})

function formatFecha(fecha: string) {
  try {
    return format(parseISO(fecha), "d MMM yyyy", { locale: es })
  } catch {
    return fecha
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="modelValue" class="fixed inset-0 bg-black/40 z-40" @click="close" />
    </Transition>

    <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-x-full" enter-to-class="translate-x-0" leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-x-0" leave-to-class="translate-x-full">
      <aside v-if="modelValue && cliente" class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-soft-xl z-50 flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 class="font-display font-bold text-lg text-neutral-900">Perfil de clienta</h2>
          <button class="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500" @click="close"><X :size="20" /></button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <!-- Profile header -->
          <div class="px-6 py-5 bg-gradient-to-br from-primary-50 to-white border-b border-neutral-100">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
                <span class="text-xl font-bold text-primary-800">{{ inicialesAvatar }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-xl font-bold text-neutral-900">{{ cliente.nombre }} {{ cliente.apellido }}</h3>
                  <span v-if="cliente.esClienteFrecuente" class="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    <Star :size="10" class="fill-amber-500 text-amber-500" /> VIP
                  </span>
                </div>
                <p v-if="cliente.telefono" class="text-sm text-neutral-500 flex items-center gap-1.5 mt-1">
                  <Phone :size="12" /> {{ cliente.telefono }}
                </p>
                <p v-if="cliente.email" class="text-sm text-neutral-500 flex items-center gap-1.5">
                  <Mail :size="12" /> {{ cliente.email }}
                </p>
              </div>
            </div>

            <!-- Quick stats -->
            <div class="grid grid-cols-3 gap-3 mt-4">
              <div class="bg-white rounded-xl p-3 text-center shadow-soft">
                <p class="text-xs text-neutral-500 mb-0.5">Turnos</p>
                <p class="text-lg font-bold text-neutral-900">{{ cliente.cantidadTurnos ?? 0 }}</p>
              </div>
              <div class="bg-white rounded-xl p-3 text-center shadow-soft">
                <p class="text-xs text-neutral-500 mb-0.5">Total gastado</p>
                <p class="text-sm font-bold text-primary-700">${{ (cliente.totalGastado ?? 0).toLocaleString('es-AR') }}</p>
              </div>
              <div class="bg-white rounded-xl p-3 text-center shadow-soft">
                <p class="text-xs text-neutral-500 mb-0.5">Último turno</p>
                <p class="text-xs font-medium text-neutral-700">{{ cliente.ultimoTurno ? formatFecha(cliente.ultimoTurno) : '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="cliente.notas" class="px-6 py-4 border-b border-neutral-100">
            <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Notas</p>
            <p class="text-sm text-neutral-700 bg-amber-50 border border-amber-200 rounded-lg p-3">{{ cliente.notas }}</p>
          </div>

          <!-- Historial -->
          <div class="px-6 py-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Historial de turnos</p>

            <div v-if="loadingHistorial" class="space-y-2">
              <div v-for="i in 3" :key="i" class="h-16 bg-neutral-100 rounded-xl animate-pulse" />
            </div>

            <div v-else-if="historial.length === 0" class="text-center py-8 text-neutral-500 text-sm">
              Sin historial de turnos
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="t in historial"
                :key="t.id"
                class="border border-neutral-100 rounded-xl p-3 hover:bg-neutral-50 transition-colors"
              >
                <div class="flex items-start justify-between mb-1">
                  <div>
                    <p class="text-sm font-medium text-neutral-800">{{ t.servicio?.nombre }}</p>
                    <p class="text-xs text-neutral-400 flex items-center gap-1">
                      <Calendar :size="11" /> {{ formatFecha(t.fecha) }} · {{ t.horaInicio }}
                    </p>
                  </div>
                  <TurnoStatusBadge :estado="t.estado" size="sm" :dot="false" />
                </div>
                <div class="flex items-center justify-between text-xs mt-1">
                  <span class="text-neutral-500">{{ t.profesional?.nombre }} {{ t.profesional?.apellido }}</span>
                  <span class="font-semibold text-neutral-700">${{ t.precioTotalFinal.toLocaleString('es-AR') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-neutral-100">
          <button class="btn btn-outline w-full" @click="emit('edit', cliente)">Editar perfil</button>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
