<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useServicios } from '@/composables/useServicios'
import Loading from '@/shared/components/common/Loading.vue'
import EmptyState from '@/shared/components/common/EmptyState.vue'
import ServicioFormModal from '../components/ServicioFormModal.vue'
import { Search, Plus, X, Edit, ToggleLeft, ToggleRight, Trash2 } from 'lucide-vue-next'
import type { Servicio } from '@/shared/types'

const {
  servicios, loading,
  activos,
  fetchAll, toggleActivo, eliminarServicio,
  createServicio, updateServicio
} = useServicios()

const searchQuery = ref('')
const showFormModal = ref(false)
const editingServicio = ref<Servicio | null>(null)

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchAll(), 350)
})

const filtered = computed(() => {
  let list = servicios.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((s: typeof servicios.value[0]) => s.nombre.toLowerCase().includes(q) || s.descripcion?.toLowerCase().includes(q))
  }
  return list
})

function openCreate() {
  editingServicio.value = null
  showFormModal.value = true
}

function openEdit(s: Servicio) {
  editingServicio.value = s
  showFormModal.value = true
}

async function handleToggle(id: number) {
  await toggleActivo(id)
}

async function handleEliminar(s: Servicio) {
  if (!confirm(`¿Eliminar el servicio "${s.nombre}"? Esta acción no se puede deshacer.`)) return
  await eliminarServicio(s.id)
}

async function handleSave(data: Partial<Servicio>) {
  try {
    if (editingServicio.value) {
      await updateServicio(editingServicio.value.id, data)
    } else {
      await createServicio(data as Omit<Servicio, 'id' | 'createdAt' | 'updatedAt'>)
    }
    showFormModal.value = false
    await fetchAll()
  } catch (e) {
    console.error('Error al guardar servicio', e)
  }
}

onMounted(() => fetchAll())
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-neutral-900">Servicios</h1>
        <p class="text-neutral-500 text-sm mt-0.5">Catálogo de servicios y precios · {{ activos.length }} activos</p>
      </div>
      <button class="btn btn-primary btn-sm self-start" @click="openCreate">
        <Plus :size="16" /> Nuevo servicio
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-soft p-4 mb-5 flex flex-wrap gap-3 items-center">
      <div class="relative flex-1 min-w-52">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar servicio..."
          class="input pl-9 text-sm"
        />
        <button v-if="searchQuery" class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" @click="searchQuery = ''">
          <X :size="14" />
        </button>
      </div>

    </div>

    <Loading v-if="loading" />

    <EmptyState
      v-else-if="filtered.length === 0"
      title="Sin servicios"
      message="No hay servicios que coincidan con la búsqueda."
    />

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="s in filtered"
        :key="s.id"
        class="bg-white rounded-xl shadow-soft p-5 flex flex-col gap-3 transition-all hover:shadow-soft-md"
        :class="{ 'opacity-60': !s.activo }"
      >
        <!-- Top row -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-10 h-10 rounded-xl flex-shrink-0 shadow-sm" :style="{ backgroundColor: s.color || '#f9a8d4' }" />
            <div class="min-w-0">
              <p class="font-semibold text-neutral-900 truncate">{{ s.nombre }}</p>
            </div>
          </div>
          <button
            class="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
            :title="s.activo ? 'Desactivar' : 'Activar'"
            @click="handleToggle(s.id)"
          >
            <ToggleRight v-if="s.activo" :size="22" class="text-emerald-500" />
            <ToggleLeft v-else :size="22" />
          </button>
        </div>

        <!-- Description -->
        <p v-if="s.descripcion" class="text-sm text-neutral-500 line-clamp-2">{{ s.descripcion }}</p>

        <!-- Info grid -->
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="bg-neutral-50 rounded-lg p-2">
            <p class="text-xs text-neutral-400">Duración</p>
            <p class="font-semibold text-neutral-800">{{ s.duracion }} min</p>
          </div>
          <div class="bg-neutral-50 rounded-lg p-2">
            <p class="text-xs text-neutral-400">Precio</p>
            <p class="font-semibold text-neutral-800">${{ s.precio.toLocaleString('es-AR') }}</p>
          </div>
          <div v-if="s.requiereSena" class="bg-primary-50 rounded-lg p-2 col-span-2">
            <p class="text-xs text-primary-500">Seña requerida</p>
            <p class="font-semibold text-primary-700">${{ (s.precioSena || 0).toLocaleString('es-AR') }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-1 border-t border-neutral-100">
          <button class="flex-1 btn btn-outline btn-sm" @click="openEdit(s)">
            <Edit :size="14" /> Editar
          </button>
          <button
            class="p-2 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
            title="Eliminar"
            @click="handleEliminar(s)"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <ServicioFormModal
      v-model="showFormModal"
      :servicio="editingServicio"
      @save="handleSave"
    />
  </div>
</template>
