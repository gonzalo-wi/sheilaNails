import { ref, computed } from 'vue'
import { serviciosApi } from '@/modules/admin/api'
import type { Servicio, ServicioFilters } from '@/shared/types'

export function useServicios() {
  const servicios = ref<Servicio[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedServicio = ref<Servicio | null>(null)

  const filters = ref<ServicioFilters>({ busqueda: '', activo: undefined })

  // ── Computed ───────────────────────────────────────────────────────────────

  const activos = computed(() => servicios.value.filter(s => s.activo))

  // ── Actions ────────────────────────────────────────────────────────────────

  async function fetchAll(customFilters?: ServicioFilters) {
    loading.value = true
    error.value = null
    try {
      // Pass activeOnly = false to include inactive services when the filter allows it
      const activeOnly = customFilters?.activo !== false && filters.value.activo !== false
      servicios.value = await serviciosApi.getAll(activeOnly)
    } catch (e) {
      error.value = 'Error al cargar servicios'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function createServicio(data: Omit<Servicio, 'id' | 'createdAt' | 'updatedAt'>): Promise<Servicio> {
    const nuevo = await serviciosApi.create(data)
    servicios.value.push(nuevo)
    return nuevo
  }

  async function updateServicio(id: number, patch: Partial<Servicio>): Promise<Servicio> {
    const updated = await serviciosApi.update(id, patch)
    const idx = servicios.value.findIndex(s => s.id === id)
    if (idx !== -1) servicios.value[idx] = updated
    if (selectedServicio.value?.id === id) selectedServicio.value = updated
    return updated
  }

  async function toggleActivo(id: number): Promise<void> {
    const updated = await serviciosApi.toggle(id)
    const idx = servicios.value.findIndex(s => s.id === id)
    if (idx !== -1) servicios.value[idx] = updated
  }

  async function eliminarServicio(id: number): Promise<void> {
    // No DELETE in API — deactivate via toggle as the closest equivalent
    await toggleActivo(id)
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
    // Actions
    fetchAll,
    createServicio,
    updateServicio,
    toggleActivo,
    eliminarServicio,
    selectServicio,
  }
}
