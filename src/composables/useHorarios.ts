import { ref } from 'vue'
import { horariosApi } from '@/modules/admin/api'
import type { HorarioConfig, BloqueoHorario } from '@/shared/types'
import type { WeeklyScheduleUpdateItem } from '@/shared/types/api'

export function useHorarios() {
  const horarios = ref<HorarioConfig[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────

  function toApiSchedule(h: HorarioConfig): WeeklyScheduleUpdateItem {
    return {
      day_of_week: h.dia,
      enabled: h.activo,
      opening_time: h.horaApertura,
      closing_time: h.horaCierre,
      slot_duration_min: h.duracionTurno,
    }
  }

  async function _saveAllHorarios(): Promise<void> {
    saving.value = true
    try {
      const updated = await horariosApi.saveWeekly(horarios.value.map(toApiSchedule))
      // Preserve local bloqueos that are not in the API response
      horarios.value = updated.map((h, i) => ({
        ...h,
        bloqueos: horarios.value[i]?.bloqueos ?? [],
        franjas: horarios.value[i]?.franjas ?? [],
      }))
    } finally {
      saving.value = false
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      horarios.value = await horariosApi.getWeekly()
    } catch (e) {
      error.value = 'Error al cargar horarios'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  /** Toggles a day on/off and persists to API */
  async function toggleDia(dia: number): Promise<void> {
    const hd = horarios.value.find(h => h.dia === dia)
    if (!hd) return
    hd.activo = !hd.activo
    await _saveAllHorarios()
  }

  /** Updates hours/duration for a day and persists to API */
  async function updateHorarioDia(dia: number, patch: Partial<HorarioConfig>): Promise<void> {
    const idx = horarios.value.findIndex(h => h.dia === dia)
    if (idx === -1) return
    horarios.value[idx] = { ...horarios.value[idx]!, ...patch }
    await _saveAllHorarios()
  }

  /**
   * Individual slot toggling is not supported by the API.
   * Changes are tracked in local state only.
   */
  async function toggleFranja(dia: number, hora: string): Promise<void> {
    const hd = horarios.value.find(h => h.dia === dia)
    if (!hd) return
    hd.franjas = hd.franjas.map(f =>
      f.hora === hora ? { ...f, disponible: !f.disponible } : f,
    )
  }

  /**
   * Blocked slots are managed locally (the API's POST /schedule/blocked-slots
   * requires a specific date, which the weekly scheduler form does not collect).
   * Use horariosApi.createBlockedSlot() when a date-specific form is available.
   */
  async function addBloqueo(dia: number, bloqueo: Omit<BloqueoHorario, 'id'>): Promise<void> {
    const hd = horarios.value.find(h => h.dia === dia)
    if (!hd) return
    const newId = (Math.max(0, ...hd.bloqueos.map(b => b.id)) + 1)
    hd.bloqueos = [...hd.bloqueos, { ...bloqueo, id: newId }]
  }

  async function removeBloqueo(dia: number, bloqueoId: number): Promise<void> {
    const hd = horarios.value.find(h => h.dia === dia)
    if (!hd) return
    hd.bloqueos = hd.bloqueos.filter(b => b.id !== bloqueoId)
  }

  async function resetDefaults(): Promise<void> {
    saving.value = true
    try {
      const defaults: WeeklyScheduleUpdateItem[] = [
        { day_of_week: 0, enabled: false, opening_time: '09:00', closing_time: '18:00', slot_duration_min: 30 },
        { day_of_week: 1, enabled: true,  opening_time: '09:00', closing_time: '18:00', slot_duration_min: 30 },
        { day_of_week: 2, enabled: true,  opening_time: '09:00', closing_time: '18:00', slot_duration_min: 30 },
        { day_of_week: 3, enabled: true,  opening_time: '09:00', closing_time: '18:00', slot_duration_min: 30 },
        { day_of_week: 4, enabled: true,  opening_time: '09:00', closing_time: '18:00', slot_duration_min: 30 },
        { day_of_week: 5, enabled: true,  opening_time: '09:00', closing_time: '18:00', slot_duration_min: 30 },
        { day_of_week: 6, enabled: false, opening_time: '09:00', closing_time: '13:00', slot_duration_min: 30 },
      ]
      horarios.value = await horariosApi.saveWeekly(defaults)
    } finally {
      saving.value = false
    }
  }

  return {
    horarios,
    loading,
    saving,
    error,
    fetchAll,
    toggleDia,
    updateHorarioDia,
    toggleFranja,
    addBloqueo,
    removeBloqueo,
    resetDefaults,
  }
}
