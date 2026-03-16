<script setup lang="ts">
/**
 * TurnoDetailsDrawer.vue
 * Slide-over drawer que muestra el detalle completo de un turno.
 * Emite eventos para cambiar estado, editar y cerrar.
 */
import { computed } from 'vue'
import { X, Phone, Clock, Edit2, CheckCircle, XCircle, Star } from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import TurnoStatusBadge from './TurnoStatusBadge.vue'
import type { Turno, EstadoTurno } from '@/shared/types'

interface Props {
  turno: Turno | null
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'edit': [turno: Turno]
  'cambiar-estado': [id: number, estado: EstadoTurno]
}>()

function close() { emit('update:modelValue', false) }

const fechaFormateada = computed(() => {
  if (!props.turno) return ''
  return format(parseISO(props.turno.fecha), "EEEE d 'de' MMMM yyyy", { locale: es })
})

const totalConExtras = computed(() => props.turno?.precioTotalFinal ?? 0)

const pendienteDeCobro = computed(() => {
  if (!props.turno) return 0
  const sena = props.turno.senaCobrada ? props.turno.montoSena : 0
  return Math.max(0, totalConExtras.value - sena)
})

function onCambiarEstado(estado: EstadoTurno) {
  if (!props.turno) return
  emit('cambiar-estado', props.turno.id, estado)
}
</script>

<template>
  <!-- Overlay -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 bg-black/40 z-40" @click="close" />
    </Transition>

    <!-- Drawer panel -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="modelValue && turno"
        class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-soft-xl z-50 flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white">
          <div class="flex items-center gap-3">
            <h2 class="font-display font-bold text-lg text-neutral-900">Detalle del turno</h2>
            <TurnoStatusBadge :estado="turno.estado" />
          </div>
          <button class="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500" @click="close">
            <X :size="20" />
          </button>
        </div>

        <!-- Body scrollable -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <!-- Clienta -->
          <section class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400">Clienta</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-bold text-primary-700">
                  {{ turno.cliente?.nombre?.charAt(0) }}{{ turno.cliente?.apellido?.charAt(0) }}
                </span>
              </div>
              <div>
                <p class="font-semibold text-neutral-900">{{ turno.cliente?.nombre }} {{ turno.cliente?.apellido }}</p>
                <p class="text-sm text-neutral-500 flex items-center gap-1">
                  <Phone :size="12" /> {{ turno.cliente?.telefono }}
                </p>
              </div>
            </div>
          </section>

          <hr class="border-neutral-100" />

          <!-- Fecha y hora -->
          <section class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Fecha</p>
              <p class="text-sm font-medium text-neutral-800 capitalize">{{ fechaFormateada }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Horario</p>
              <p class="text-sm font-medium text-neutral-800 flex items-center gap-1">
                <Clock :size="14" class="text-neutral-400" />
                {{ turno.horaInicio }} – {{ turno.horaFin }}
              </p>
            </div>
          </section>

          <hr class="border-neutral-100" />

          <!-- Servicio y profesional -->
          <section class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Servicio</p>
              <div class="flex items-center gap-2">
                <span
                  v-if="turno.servicio?.color"
                  class="w-3 h-3 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: turno.servicio.color }"
                />
                <p class="text-sm font-medium text-neutral-800">{{ turno.servicio?.nombre }}</p>
              </div>
              <p class="text-xs text-neutral-400 mt-0.5">{{ turno.servicio?.duracion }} min</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Profesional</p>
              <p class="text-sm font-medium text-neutral-800">
                {{ turno.profesional?.nombre }} {{ turno.profesional?.apellido }}
              </p>
            </div>
          </section>

          <hr class="border-neutral-100" />

          <!-- Pricing breakdown -->
          <section>
            <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Detalle de precios</p>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-neutral-600">Precio base</span>
                <span class="font-medium">${{ turno.precioBase.toLocaleString('es-AR') }}</span>
              </div>

              <template v-if="turno.extras.length">
                <div v-for="extra in turno.extras" :key="extra.id" class="flex justify-between text-sm">
                  <span class="text-neutral-500 pl-3">+ {{ extra.nombre }}</span>
                  <span class="text-neutral-600">+${{ extra.precio.toLocaleString('es-AR') }}</span>
                </div>
              </template>

              <div v-if="turno.precioExtras > 0" class="flex justify-between text-sm text-neutral-500">
                <span>Subtotal extras</span>
                <span>${{ turno.precioExtras.toLocaleString('es-AR') }}</span>
              </div>

              <hr class="border-dashed border-neutral-200" />

              <div class="flex justify-between text-base font-bold">
                <span class="text-neutral-900">Total final</span>
                <span class="text-primary-700">${{ totalConExtras.toLocaleString('es-AR') }}</span>
              </div>
            </div>
          </section>

          <!-- Seña -->
          <section class="rounded-xl p-4 bg-neutral-50 border border-neutral-100">
            <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Seña</p>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-neutral-600">Monto seña</span>
              <span class="font-medium">${{ turno.montoSena.toLocaleString('es-AR') }}</span>
            </div>
            <div class="flex justify-between text-sm mb-3">
              <span class="text-neutral-600">Estado seña</span>
              <span
                :class="[
                  'font-medium text-xs px-2 py-0.5 rounded-full',
                  turno.senaCobrada ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                ]"
              >
                {{ turno.senaCobrada ? 'Cobrada ✓' : 'Pendiente' }}
              </span>
            </div>
            <div class="flex justify-between text-sm font-semibold border-t border-neutral-200 pt-2 mt-2">
              <span class="text-neutral-700">Pendiente de cobro</span>
              <span class="text-primary-700">${{ pendienteDeCobro.toLocaleString('es-AR') }}</span>
            </div>
          </section>

          <!-- Notas -->
          <section v-if="turno.notas || turno.observacionesAdmin">
            <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Notas</p>
            <p v-if="turno.notas" class="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-3 mb-2">
              {{ turno.notas }}
            </p>
            <p v-if="turno.observacionesAdmin" class="text-sm text-neutral-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <span class="font-medium text-amber-800">Admin: </span>{{ turno.observacionesAdmin }}
            </p>
          </section>
        </div>

        <!-- Footer actions -->
        <div class="px-6 py-4 border-t border-neutral-100 bg-neutral-50 space-y-3">
          <!-- Primary actions -->
          <div class="grid grid-cols-2 gap-2">
            <button
              v-if="turno.estado === 'PENDIENTE'"
              class="btn btn-primary btn-sm"
              @click="onCambiarEstado('CONFIRMADO' as EstadoTurno)"
            >
              <CheckCircle :size="16" /> Confirmar
            </button>
            <button
              v-if="turno.estado === 'CONFIRMADO'"
              class="btn bg-blue-600 text-white hover:bg-blue-700 btn-sm"
              @click="onCambiarEstado('COMPLETADO' as EstadoTurno)"
            >
              <Star :size="16" /> Marcar realizado
            </button>
            <button
              v-if="['PENDIENTE','CONFIRMADO'].includes(turno.estado)"
              class="btn btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50"
              @click="onCambiarEstado('CANCELADO' as EstadoTurno)"
            >
              <XCircle :size="16" /> Cancelar
            </button>
            <button
              class="btn btn-outline btn-sm"
              @click="emit('edit', turno)"
            >
              <Edit2 :size="16" /> Editar
            </button>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
