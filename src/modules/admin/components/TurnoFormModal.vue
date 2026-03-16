<script setup lang="ts">
/**
 * TurnoFormModal.vue
 * Modal para crear / editar un turno.
 * Incluye: clienta, servicio, profesional, fecha, hora,
 *          precio base, extras, seña, observaciones.
 */
import { ref, watch, computed } from 'vue'
import { Plus, Trash2, X } from 'lucide-vue-next'
import type { Turno, EstadoTurno } from '@/shared/types'
import { mockServicios } from '@/mocks/servicios.mock'
import { mockClientes } from '@/mocks/clientes.mock'

const PROFESIONALES = [
  { id: 1, nombre: 'Ana García' },
  { id: 2, nombre: 'Laura Martínez' },
  { id: 3, nombre: 'Romina Vega' },
]

const ESTADOS: EstadoTurno[] = ['PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO', 'NO_SHOW']

interface Props {
  modelValue: boolean
  turno?: Turno | null   // null = modo crear
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'save': [data: Partial<Turno>]
}>()

// ── Form state ───────────────────────────────────────────────────────────────

const form = ref<Partial<Turno>>({})
const newExtraNombre = ref('')
const newExtraPrecio = ref<number | ''>('')

function resetForm() {
  if (props.turno) {
    form.value = {
      ...props.turno,
      extras: props.turno.extras ? [...props.turno.extras] : [],
    }
  } else {
    form.value = {
      estado: 'PENDIENTE' as EstadoTurno,
      extras: [],
      precioBase: 0,
      precioExtras: 0,
      precioTotalFinal: 0,
      montoSena: 0,
      senaCobrada: false,
    }
  }
  newExtraNombre.value = ''
  newExtraPrecio.value = ''
}

watch(() => props.modelValue, (v) => { if (v) resetForm() })

// ── Computed helpers ─────────────────────────────────────────────────────────

const isEdit = computed(() => !!props.turno)
const title = computed(() => isEdit.value ? 'Editar turno' : 'Nuevo turno')

const sumExtras = computed(() =>
  (form.value.extras ?? []).reduce((acc, e) => acc + e.precio, 0),
)

// auto-update precioExtras and total when extras change
watch(sumExtras, (val) => {
  if (!form.value) return
  form.value.precioExtras = val
  form.value.precioTotalFinal = (form.value.precioBase ?? 0) + val
})

// When service changes, update precioBase
function onServicioChange() {
  const svc = mockServicios.find(s => s.id === Number(form.value.servicioId))
  if (svc) {
    form.value.precioBase = svc.precio
    form.value.precioTotalFinal = svc.precio + sumExtras.value
    if (svc.requiereSena && !form.value.montoSena) {
      form.value.montoSena = svc.precioSena ?? 0
    }
    // Populate nested object for display
    form.value.servicio = svc
  }
}

function addExtra() {
  if (!newExtraNombre.value || !newExtraPrecio.value) return
  const extras = form.value.extras ?? []
  const newId = Math.max(0, ...extras.map(e => e.id)) + 1
  extras.push({ id: newId, nombre: newExtraNombre.value, precio: Number(newExtraPrecio.value) })
  form.value.extras = extras
  newExtraNombre.value = ''
  newExtraPrecio.value = ''
}

function removeExtra(id: number) {
  form.value.extras = (form.value.extras ?? []).filter(e => e.id !== id)
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

              <!-- Row: Clienta + Estado -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">Clienta *</label>
                  <select v-model="form.clienteId" class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white" required>
                    <option value="">Seleccioná una clienta</option>
                    <option v-for="c in mockClientes" :key="c.id" :value="c.id">
                      {{ c.nombre }} {{ c.apellido }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">Estado</label>
                  <select v-model="form.estado" class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white">
                    <option v-for="e in ESTADOS" :key="e" :value="e">{{ e }}</option>
                  </select>
                </div>
              </div>

              <!-- Row: Servicio + Profesional -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">Servicio *</label>
                  <select v-model="form.servicioId" class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white" required @change="onServicioChange">
                    <option value="">Seleccioná un servicio</option>
                    <option v-for="s in mockServicios.filter(s => s.activo)" :key="s.id" :value="s.id">
                      {{ s.nombre }} ({{ s.duracion }}min)
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">Profesional *</label>
                  <select v-model="form.profesionalId" class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white" required>
                    <option value="">Seleccioná una profesional</option>
                    <option v-for="p in PROFESIONALES" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                  </select>
                </div>
              </div>

              <!-- Row: Fecha + Hora inicio / fin -->
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
                  <label class="block text-sm font-medium text-neutral-700 mb-1">Hora fin *</label>
                  <input v-model="form.horaFin" type="time" class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
                </div>
              </div>

              <!-- Pricing section -->
              <div class="bg-neutral-50 rounded-xl p-4 space-y-3">
                <p class="text-sm font-semibold text-neutral-700">Precios</p>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-neutral-600 mb-1">Precio base *</label>
                    <div class="relative">
                      <span class="absolute left-3 top-2.5 text-sm text-neutral-400">$</span>
                      <input v-model.number="form.precioBase" type="number" min="0" class="w-full border border-neutral-300 rounded-lg pl-6 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white" required />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-neutral-600 mb-1">Total final (editable)</label>
                    <div class="relative">
                      <span class="absolute left-3 top-2.5 text-sm text-neutral-400">$</span>
                      <input v-model.number="form.precioTotalFinal" type="number" min="0" class="w-full border border-neutral-300 rounded-lg pl-6 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white font-bold text-primary-700" />
                    </div>
                  </div>
                </div>

                <!-- Extras -->
                <div>
                  <p class="text-xs font-medium text-neutral-600 mb-2">Extras / decoraciones</p>
                  <div v-if="form.extras?.length" class="space-y-1 mb-2">
                    <div v-for="e in form.extras" :key="e.id" class="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm">
                      <span>{{ e.nombre }}</span>
                      <div class="flex items-center gap-3">
                        <span class="font-medium text-neutral-700">+${{ e.precio.toLocaleString('es-AR') }}</span>
                        <button type="button" class="text-red-400 hover:text-red-600" @click="removeExtra(e.id)">
                          <Trash2 :size="14" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <input v-model="newExtraNombre" placeholder="Nombre extra" class="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    <div class="relative w-28">
                      <span class="absolute left-3 top-2 text-sm text-neutral-400">$</span>
                      <input v-model.number="newExtraPrecio" type="number" min="0" placeholder="Precio" class="w-full border border-neutral-300 rounded-lg pl-6 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <button type="button" class="btn btn-outline btn-sm px-3" @click="addExtra">
                      <Plus :size="16" />
                    </button>
                  </div>
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
