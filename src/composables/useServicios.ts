import { ref, computed } from 'vue'
import { serviciosService } from '@/modules/admin/services/mockApiService'
import type { Servicio, ServicioFilters } from '@/shared/types'

export function useServicios() {
  const servicios = ref<Servicio[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedServicio = ref<Servicio | null>(null)

  const filters = ref<ServicioFilters>({ busqueda: '', categoria: '', activo: undefined })

  // ── Computed ───────────────────────────────────────────────────────────────

  const activos = computed(() => servicios.value.filter(s => s.activo))

  const categorias = computed(() => {
    const cats = new Set(servicios.value.map(s => s.categoria))
    return Array.from(cats).sort()
  })

  // ── Actions ────────────────────────────────────────────────────────────────

  async function fetchAll(customFilters?: ServicioFilters) {
    loading.value = true
    error.value = null
    try {
      servicios.value = await serviciosService.getAll(customFilters ?? filters.value)
    } catch (e) {
      error.value = 'Error al cargar servicios'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function createServicio(data: Omit<Servicio, 'id' | 'createdAt' | 'updatedAt'>): Promise<Servicio> {
    const nuevo = await serviciosService.create(data)
    servicios.value.push(nuevo)
    return nuevo
  }

  async function updateServicio(id: number, patch: Partial<Servicio>): Promise<Servicio> {
    const updated = await serviciosService.update(id, patch)
    const idx = servicios.value.findIndex(s => s.id === id)
    if (idx !== -1) servicios.value[idx] = updated
    if (selectedServicio.value?.id === id) selectedServicio.value = updated
    return updated
  }

  async function toggleActivo(id: number): Promise<void> {
    const updated = await serviciosService.toggleActivo(id)
    const idx = servicios.value.findIndex(s => s.id === id)
    if (idx !== -1) servicios.value[idx] = updated
  }

  async function eliminarServicio(id: number): Promise<void> {
    await serviciosService.delete(id)
    servicios.value = servicios.value.filter(s => s.id !== id)
    if (selectedServicio.value?.id === id) selectedServicio.value = null
  }

  function selectServicio(servicio: Servicio | null) {
    selectedServicio.value = servicio ? { ...servicio } : null
  }

  return {
    // State
    servicios,
    loading,
    error,
    selectedServicio,
    filters,
    // Computed
    activos,
    categorias,
    // Actions
    fetchAll,
    createServicio,
    updateServicio,
    toggleActivo,
    eliminarServicio,
    selectServicio,
  }
}
