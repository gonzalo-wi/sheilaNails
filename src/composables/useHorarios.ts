import { ref } from 'vue'
import { horariosService } from '@/modules/admin/services/mockApiService'
import type { HorarioConfig, FranjaHoraria, BloqueoHorario } from '@/shared/types'

export function useHorarios() {
  const horarios = ref<HorarioConfig[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  // ── Actions ────────────────────────────────────────────────────────────────

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      horarios.value = await horariosService.getAll()
    } catch (e) {
      error.value = 'Error al cargar horarios'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  /** Activa / desactiva el día completo */
  async function toggleDia(dia: number): Promise<void> {
    saving.value = true
    try {
      const hd = horarios.value.find(h => h.dia === dia)
      if (!hd) return
      const updated = await horariosService.update(dia, { activo: !hd.activo })
      const idx = horarios.value.findIndex(h => h.dia === dia)
      if (idx !== -1) horarios.value[idx] = updated
    } finally {
      saving.value = false
    }
  }

  /** Actualiza apertura / cierre y regenera franjas */
  async function updateHorarioDia(dia: number, patch: Partial<HorarioConfig>): Promise<void> {
    saving.value = true
    try {
      const updated = await horariosService.update(dia, patch)
      const idx = horarios.value.findIndex(h => h.dia === dia)
      if (idx !== -1) horarios.value[idx] = updated
    } finally {
      saving.value = false
    }
  }

  /** Activa / desactiva una franja horaria específica */
  async function toggleFranja(dia: number, hora: string): Promise<void> {
    saving.value = true
    try {
      const hd = horarios.value.find(h => h.dia === dia)
      if (!hd) return
      const franjas: FranjaHoraria[] = hd.franjas.map(f =>
        f.hora === hora ? { ...f, disponible: !f.disponible } : f,
      )
      const updated = await horariosService.update(dia, { franjas })
      const idx = horarios.value.findIndex(h => h.dia === dia)
      if (idx !== -1) horarios.value[idx] = updated
    } finally {
      saving.value = false
    }
  }

  /** Agrega un bloqueo manual al día */
  async function addBloqueo(dia: number, bloqueo: Omit<BloqueoHorario, 'id'>): Promise<void> {
    saving.value = true
    try {
      const hd = horarios.value.find(h => h.dia === dia)
      if (!hd) return
      const newId = Math.max(0, ...hd.bloqueos.map(b => b.id)) + 1
      const updated = await horariosService.update(dia, {
        bloqueos: [...hd.bloqueos, { ...bloqueo, id: newId }],
      })
      const idx = horarios.value.findIndex(h => h.dia === dia)
      if (idx !== -1) horarios.value[idx] = updated
    } finally {
      saving.value = false
    }
  }

  /** Elimina un bloqueo */
  async function removeBloqueo(dia: number, bloqueoId: number): Promise<void> {
    saving.value = true
    try {
      const hd = horarios.value.find(h => h.dia === dia)
      if (!hd) return
      const updated = await horariosService.update(dia, {
        bloqueos: hd.bloqueos.filter(b => b.id !== bloqueoId),
      })
      const idx = horarios.value.findIndex(h => h.dia === dia)
      if (idx !== -1) horarios.value[idx] = updated
    } finally {
      saving.value = false
    }
  }

  async function resetDefaults(): Promise<void> {
    saving.value = true
    try {
      horarios.value = await horariosService.resetToDefaults()
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
