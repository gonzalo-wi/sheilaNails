import { ref, computed } from 'vue'
import { appointmentsApi } from '@/modules/admin/api'
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

  const pendientes  = computed(() => turnos.value.filter(t => t.estado === 'PENDING'))
  const confirmados = computed(() => turnos.value.filter(t => t.estado === 'CONFIRMED'))
  const cancelados  = computed(() => turnos.value.filter(t => t.estado === 'CANCELLED'))

  // ── Actions ────────────────────────────────────────────────────────────────

  async function fetchAll(customFilters?: TurnoFilters) {
    loading.value = true
    error.value = null
    try {
      turnos.value = await appointmentsApi.getAll(customFilters ?? filters.value)
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
      selectedTurno.value = await appointmentsApi.getById(id)
    } finally {
      loading.value = false
    }
  }

  async function createTurno(data: Omit<Turno, 'id' | 'createdAt' | 'updatedAt'>): Promise<Turno> {
    // Admin create: uses POST /appointments with client role payload
    const payload = {
      client_id: data.clienteId,
      service_id: data.servicioId,
      professional_id: data.profesionalId || undefined,
      date: data.fecha,
      start_time: data.horaInicio,
      notes: data.notas,
    }
    const nuevo = await appointmentsApi.create(payload)
    turnos.value.push(nuevo)
    return nuevo
  }

  async function updateTurno(id: number, patch: Partial<Turno>): Promise<Turno> {
    const original = turnos.value.find(t => t.id === id)
    let updated: Turno | undefined

    // Only call updateFinalPrice if extras_amount or extras_note actually changed
    if (
      (patch.precioExtras !== undefined && patch.precioExtras !== original?.precioExtras) ||
      (patch.extrasNota !== undefined && patch.extrasNota !== original?.extrasNota)
    ) {
      updated = await appointmentsApi.updateFinalPrice(id, {
        extras_amount: patch.precioExtras ?? 0,
        extras_note: patch.extrasNota,
      })
    }

    // Only call registerDeposit if the deposit amount actually changed
    if (patch.montoSena !== undefined && patch.montoSena !== original?.montoSena) {
      updated = await appointmentsApi.registerDeposit(id, {
        deposit_amount: patch.montoSena,
      })
    }

    // Only change estado if it actually differs from the current stored value
    if (patch.estado !== undefined && patch.estado !== original?.estado) {
      await cambiarEstado(id, patch.estado)
      if (!updated) return selectedTurno.value ?? turnos.value.find(t => t.id === id)!
    }

    if (updated) {
      const idx = turnos.value.findIndex(t => t.id === id)
      if (idx !== -1) turnos.value[idx] = updated
      if (selectedTurno.value?.id === id) selectedTurno.value = updated
      return updated
    }

    return turnos.value.find(t => t.id === id)!
  }

  async function cambiarEstado(id: number, estado: EstadoTurno): Promise<void> {
    let updated: Turno
    if (estado === 'CONFIRMED') updated = await appointmentsApi.confirm(id)
    else if (estado === 'CANCELLED') updated = await appointmentsApi.cancel(id)
    else if (estado === 'DONE') updated = await appointmentsApi.complete(id)
    else updated = await appointmentsApi.getById(id) // fallback for other statuses

    const idx = turnos.value.findIndex(t => t.id === id)
    if (idx !== -1) turnos.value[idx] = updated
    if (selectedTurno.value?.id === id) selectedTurno.value = updated
  }

  async function eliminarTurno(id: number): Promise<void> {
    // No DELETE endpoint in API — cancel as the closest equivalent
    await appointmentsApi.cancel(id)
    const idx = turnos.value.findIndex(t => t.id === id)
    if (idx !== -1) turnos.value[idx]!.estado = 'CANCELLED'
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
