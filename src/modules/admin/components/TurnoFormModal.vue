<script setup lang="ts">
/**
 * TurnoFormModal.vue
 * Modal para crear / editar un turno.
 * Crear: formulario completo (clienta, servicio, fecha, hora, precio, seña, notas).
 * Editar: panel de info de solo lectura + campos editables (precio final, seña, notas).
 */
import { ref, watch, computed } from 'vue'
import { X, User, Scissors } from 'lucide-vue-next'
import type { Turno, EstadoTurno, Servicio, Cliente } from '@/shared/types'

const ESTADOS: { value: EstadoTurno; label: string }[] = [
  { value: 'PENDING',   label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'DONE',      label: 'Realizado' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'ABSENT',    label: 'Ausente' },
]

interface Props {
  modelValue: boolean
  turno?: Turno | null
  prefill?: Partial<Turno>
  servicios?: Servicio[]
  clientes?: Cliente[]
}

const props = withDefaults(defineProps<Props>(), {
  servicios: () => [],
  clientes: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'save': [data: Partial<Turno>]
}>()

// ── Form state ───────────────────────────────────────────────────────────────

const form = ref<Partial<Turno>>({})

function resetForm() {
  if (props.turno) {
    form.value = { ...props.turno }
  } else {
    form.value = {
      estado: 'PENDING' as EstadoTurno,
      extras: [],
      precioBase: 0,
      precioExtras: 0,
      extrasNota: '',
      precioTotalFinal: 0,
      montoSena: 0,
      senaCobrada: false,
      // Apply prefill (e.g. date/time from calendar click)
      ...props.prefill,
    }
  }
}

watch(() => props.modelValue, (v) => { if (v) resetForm() })

// ── Computed helpers ─────────────────────────────────────────────────────────

const isEdit = computed(() => !!props.turno)
const title  = computed(() => isEdit.value ? 'Editar turno' : 'Nuevo turno')

// When service changes (create mode), auto-populate price
function onServicioChange() {
  const svc = props.servicios.find(s => s.id === Number(form.value.servicioId))
  if (svc) {
    form.value.precioBase = svc.precio
    form.value.precioTotalFinal = svc.precio
    form.value.precioExtras = 0
    form.value.extrasNota = ''
    if (svc.requiereSena && !form.value.montoSena) {
      form.value.montoSena = svc.precioSena ?? 0
    }
    form.value.servicio = svc
  }
}

function onSubmit() {
  emit('save', { ...form.value })
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="emit('update:modelValue', false)"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
        >
          <div v-if="modelValue" class="bg-white rounded-2xl shadow-soft-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 class="font-display font-bold text-xl text-neutral-900">{{ title }}</h2>
              <button class="p-2 rounded-lg hover:bg-neutral-100" @click="emit('update:modelValue', false)">
                <X :size="20" />
              </button>
            </div>

            <!-- Form body -->
            <form class="flex-1 overflow-y-auto px-6 py-5 space-y-5" @submit.prevent="onSubmit">

              <!-- CREATE: clienta + servicio selects -->
              <template v-if="!isEdit">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-1">Clienta *</label>
                    <select v-model="form.clienteId" class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white" required>
                      <option value="">Seleccioná una clienta</option>
                      <option v-for="c in clientes" :key="c.id" :value="c.id">
                        {{ c.nombre }} {{ c.apellido }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-1">Servicio *</label>
                    <select v-model="form.servicioId" class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white" required @change="onServicioChange">
                      <option value="">Seleccioná un servicio</option>
                      <option v-for="s in servicios.filter(s => s.activo)" :key="s.id" :value="s.id">
                        {{ s.nombre }} ({{ s.duracion }}min)
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Fecha + Hora -->
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-1">Fecha *</label>
                    <input v-model="form.fecha" type="date" class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-1">Hora inicio *</label>
                    <input v-model="form.horaInicio" type="time" class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-1">Hora fin</label>
                    <input v-model="form.horaFin" type="time" class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                </div>
              </template>

              <!-- EDIT: panel de solo lectura con datos del turno -->
              <template v-else>
                <div class="bg-neutral-50 rounded-xl p-4 space-y-2 border border-neutral-200">
                  <div class="flex items-center gap-2">
                    <User :size="15" class="text-neutral-400 flex-shrink-0" />
                    <span class="font-semibold text-neutral-800">{{ form.cliente?.nombre }} {{ form.cliente?.apellido }}</span>
                    <span class="text-sm text-neutral-500 ml-1">{{ form.cliente?.email }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Scissors :size="15" class="text-neutral-400 flex-shrink-0" />
                    <span class="font-medium text-neutral-700">{{ form.servicio?.nombre }}</span>
                    <span v-if="form.servicio?.duracion" class="text-sm text-neutral-500">({{ form.servicio.duracion }} min)</span>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-neutral-600 pt-1">
                    <span>📅 {{ form.fecha }}</span>
                    <span>⏰ {{ form.horaInicio }}<template v-if="form.horaFin"> – {{ form.horaFin }}</template></span>
                  </div>
                </div>

                <!-- Estado (editable en modo edit) -->
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">Estado</label>
                  <select v-model="form.estado" class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white">
                    <option v-for="e in ESTADOS" :key="e.value" :value="e.value">{{ e.label }}</option>
                  </select>
                </div>
              </template>

              <!-- Pricing section -->
              <div class="bg-neutral-50 rounded-xl p-4 space-y-4">
                <p class="text-sm font-semibold text-neutral-700">Extras</p>

                <!-- Read-only base price -->
                <div class="flex items-center justify-between text-sm">
                  <span class="text-neutral-500">Precio base del servicio</span>
                  <span class="font-semibold text-neutral-800">${{ (form.precioBase ?? 0).toLocaleString('es-AR') }}</span>
                </div>

                <!-- Extras amount -->
                <div>
                  <label class="block text-xs font-medium text-neutral-600 mb-1">Monto extras ($)</label>
                  <div class="relative">
                    <span class="absolute left-3 top-2.5 text-sm text-neutral-400">$</span>
                    <input v-model.number="form.precioExtras" type="number" min="0" placeholder="0" class="w-full border border-neutral-300 rounded-lg pl-6 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white" />
                  </div>
                </div>

                <!-- Extras note -->
                <div>
                  <label class="block text-xs font-medium text-neutral-600 mb-1">Descripción del extra</label>
                  <input v-model="form.extrasNota" type="text" placeholder="Ej: Se agregó diseño con piedras" class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>

                <!-- Computed total -->
                <div class="flex items-center justify-between pt-2 border-t border-neutral-200">
                  <span class="text-sm font-semibold text-neutral-700">Total estimado</span>
                  <span class="text-base font-bold text-primary-700">${{ ((form.precioBase ?? 0) + (form.precioExtras ?? 0)).toLocaleString('es-AR') }}</span>
                </div>
              </div>

              <!-- Seña -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">Monto seña</label>
                  <div class="relative">
                    <span class="absolute left-3 top-2.5 text-sm text-neutral-400">$</span>
                    <input v-model.number="form.montoSena" type="number" min="0" class="w-full border border-neutral-300 rounded-lg pl-6 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                </div>
                <div class="flex items-end pb-1">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <div
                      :class="[
                        'w-10 h-6 rounded-full transition-colors relative',
                        form.senaCobrada ? 'bg-emerald-500' : 'bg-neutral-300',
                      ]"
                      @click="form.senaCobrada = !form.senaCobrada"
                    >
                      <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', form.senaCobrada ? 'translate-x-5' : 'translate-x-1']" />
                    </div>
                    <span class="text-sm text-neutral-700">Seña cobrada</span>
                  </label>
                </div>
              </div>

              <!-- Notas -->
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Notas / observaciones</label>
                <textarea v-model="form.notas" rows="2" placeholder="Ej: Pide color nude con croma..." class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none" />
              </div>
            </form>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100">
              <button type="button" class="btn btn-outline" @click="emit('update:modelValue', false)">Cancelar</button>
              <button type="button" class="btn btn-primary" @click="onSubmit">
                {{ isEdit ? 'Guardar cambios' : 'Crear turno' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
