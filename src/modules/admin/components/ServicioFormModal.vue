<script setup lang="ts">
/**
 * ServicioFormModal.vue
 * Modal para crear / editar un servicio.
 */
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import type { Servicio } from '@/shared/types'

const COLORES_PRESET = ['#ec4899','#8b5cf6','#3b82f6','#10b981','#f59e0b','#f97316','#14b8a6','#6b7280']

interface Props {
  modelValue: boolean
  servicio?: Servicio | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'save': [data: Partial<Servicio>]
}>()

const form = ref<Partial<Servicio>>({})

function reset() {
  form.value = props.servicio
    ? { ...props.servicio }
    : {
        nombre: '', descripcion: '', duracion: 60, precio: 0,
        precioSena: 0, requiereSena: false,
        color: '#ec4899', activo: true,
      }
}

watch(() => props.modelValue, (v) => { if (v) reset() })

const isEdit = computed(() => !!props.servicio)

function onSubmit() {
  emit('save', { ...form.value })
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="modelValue" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="emit('update:modelValue', false)">
        <div class="bg-white rounded-2xl shadow-soft-xl w-full max-w-lg">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 class="font-display font-bold text-xl text-neutral-900">
              {{ isEdit ? 'Editar servicio' : 'Nuevo servicio' }}
            </h2>
            <button class="p-2 rounded-lg hover:bg-neutral-100" @click="emit('update:modelValue', false)">
              <X :size="20" />
            </button>
          </div>

          <!-- Body -->
          <form class="px-6 py-5 space-y-4" @submit.prevent="onSubmit">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nombre *</label>
              <input v-model="form.nombre" type="text" required placeholder="Ej: Semipermanente" class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
              <textarea v-model="form.descripcion" rows="2" placeholder="Descripción breve del servicio..." class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none" />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Duración (min) *</label>
              <input v-model.number="form.duracion" type="number" min="15" step="15" required class="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Precio base *</label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-sm text-neutral-400">$</span>
                  <input v-model.number="form.precio" type="number" min="0" required class="w-full border border-neutral-300 rounded-lg pl-6 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Monto seña sugerido</label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-sm text-neutral-400">$</span>
                  <input v-model.number="form.precioSena" type="number" min="0" class="w-full border border-neutral-300 rounded-lg pl-6 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
            </div>

            <!-- Color picker -->
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">Color de etiqueta</label>
              <div class="flex items-center gap-2">
                <button
                  v-for="color in COLORES_PRESET"
                  :key="color"
                  type="button"
                  :style="{ backgroundColor: color }"
                  :class="['w-7 h-7 rounded-full border-2 transition-all', form.color === color ? 'border-neutral-900 scale-110' : 'border-white shadow']"
                  @click="form.color = color"
                />
                <input v-model="form.color" type="color" class="w-7 h-7 rounded-full cursor-pointer border border-neutral-300" title="Color personalizado" />
              </div>
            </div>

            <!-- Toggles -->
            <div class="flex items-center gap-6">
              <label class="flex items-center gap-3 cursor-pointer">
                <div :class="['w-10 h-6 rounded-full transition-colors relative', form.requiereSena ? 'bg-primary-500' : 'bg-neutral-300']" @click="form.requiereSena = !form.requiereSena">
                  <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', form.requiereSena ? 'translate-x-5' : 'translate-x-1']" />
                </div>
                <span class="text-sm text-neutral-700">Requiere seña</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <div :class="['w-10 h-6 rounded-full transition-colors relative', form.activo ? 'bg-emerald-500' : 'bg-neutral-300']" @click="form.activo = !form.activo">
                  <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', form.activo ? 'translate-x-5' : 'translate-x-1']" />
                </div>
                <span class="text-sm text-neutral-700">Activo</span>
              </label>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100 mt-4">
              <button type="button" class="btn btn-outline" @click="emit('update:modelValue', false)">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                {{ isEdit ? 'Guardar cambios' : 'Crear servicio' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
