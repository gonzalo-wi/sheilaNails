import { ref, computed } from 'vue'
import { statsService } from '@/modules/admin/services/mockApiService'
import type { FinanzasStats } from '@/shared/types'

export function useFinanzas() {
  const stats = ref<FinanzasStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ── Computed ───────────────────────────────────────────────────────────────

  const variacionMes = computed(() => {
    if (!stats.value) return 0
    const actual = stats.value.mes.ingresos
    const anterior = stats.value.mesAnterior.ingresos
    if (anterior === 0) return 0
    return Number(((actual - anterior) / anterior * 100).toFixed(1))
  })

  const maxIngresoDiario = computed(() => {
    if (!stats.value) return 1
    return Math.max(...stats.value.ingresosPorDia.map(d => d.ingresos), 1)
  })

  const maxIngresoMensual = computed(() => {
    if (!stats.value) return 1
    return Math.max(...stats.value.ingresosPorMes.map(m => m.ingresos), 1)
  })

  // ── Actions ────────────────────────────────────────────────────────────────

  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      stats.value = await statsService.getFinanzasStats()
    } catch (e) {
      error.value = 'Error al cargar estadísticas financieras'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    variacionMes,
    maxIngresoDiario,
    maxIngresoMensual,
    fetchStats,
  }
}
