import { ref, computed } from 'vue'
import { turnosService } from '@/modules/admin/services/mockApiService'
import type { Turno, TurnoFilters, EstadoTurno } from '@/shared/types'

export function useTurnos() {
  const turnos = ref<Turno[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedTurno = ref<Turno | null>(null)

  // ── Filters state ──────────────────────────────────────────────────────────
  const filters = ref<TurnoFilters>({
    busqueda: '',
    estado: '',
    profesionalId: '',
    servicioId: '',
    fechaDesde: '',
    fechaHasta: '',
  })

  // ── Computed ───────────────────────────────────────────────────────────────

  const totalTurnos = computed(() => turnos.value.length)

  const turnoHoy = computed(() => {
    const hoy = new Date().toISOString().split('T')[0]
    return turnos.value.filter(t => t.fecha === hoy)
  })

  const pendientes = computed(() => turnos.value.filter(t => t.estado === 'PENDIENTE'))
  const confirmados = computed(() => turnos.value.filter(t => t.estado === 'CONFIRMADO'))
  const cancelados = computed(() => turnos.value.filter(t => t.estado === 'CANCELADO'))

  // ── Actions ────────────────────────────────────────────────────────────────

  async function fetchAll(customFilters?: TurnoFilters) {
    loading.value = true
    error.value = null
    try {
      turnos.value = await turnosService.getAll(customFilters ?? filters.value)
    } catch (e) {
      error.value = 'Error al cargar turnos'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number) {
    loading.value = true
    try {
      selectedTurno.value = await turnosService.getById(id)
    } finally {
      loading.value = false
    }
  }

  async function createTurno(data: Omit<Turno, 'id' | 'createdAt' | 'updatedAt'>): Promise<Turno> {
    const nuevo = await turnosService.create(data)
    turnos.value.push(nuevo)
    return nuevo
  }

  async function updateTurno(id: number, patch: Partial<Turno>): Promise<Turno> {
    const updated = await turnosService.update(id, patch)
    const idx = turnos.value.findIndex(t => t.id === id)
    if (idx !== -1) turnos.value[idx] = updated
    if (selectedTurno.value?.id === id) selectedTurno.value = updated
    return updated
  }

  async function cambiarEstado(id: number, estado: EstadoTurno): Promise<void> {
    await updateTurno(id, { estado })
  }

  async function eliminarTurno(id: number): Promise<void> {
    await turnosService.delete(id)
    turnos.value = turnos.value.filter(t => t.id !== id)
    if (selectedTurno.value?.id === id) selectedTurno.value = null
  }

  function selectTurno(turno: Turno | null) {
    selectedTurno.value = turno
  }

  function clearFilters() {
    filters.value = { busqueda: '', estado: '', profesionalId: '', servicioId: '', fechaDesde: '', fechaHasta: '' }
  }

  return {
    // State
    turnos,
    loading,
    error,
    selectedTurno,
    filters,
    // Computed
    totalTurnos,
    turnoHoy,
    pendientes,
    confirmados,
    cancelados,
    // Actions
    fetchAll,
    fetchById,
    createTurno,
    updateTurno,
    cambiarEstado,
    eliminarTurno,
    selectTurno,
    clearFilters,
  }
}
