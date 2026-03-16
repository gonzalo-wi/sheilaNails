import { ref, computed } from 'vue'
import { statsService } from '@/modules/admin/services/mockApiService'
import type { DashboardStats } from '@/shared/types'

export function useDashboard() {
  const stats = ref<DashboardStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ── Computed ───────────────────────────────────────────────────────────────

  /** Variación porcentual ingresos mes vs mes anterior */
  const variacionIngresos = computed(() => {
    // Placeholder — real comparison would use FinanzasStats
    return +17.4
  })

  const resumenHoy = computed(() => {
    if (!stats.value) return null
    return {
      total: stats.value.turnosHoy,
      confirmados: stats.value.turnosConfirmadosHoy,
      pendientes: stats.value.turnosPendientesHoy,
      cancelados: stats.value.turnosCanceladosHoy,
      ingresos: stats.value.ingresosDia,
      senas: stats.value.senasCobradas,
    }
  })

  // ── Actions ────────────────────────────────────────────────────────────────

  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      stats.value = await statsService.getDashboardStats()
    } catch (e) {
      error.value = 'Error al cargar estadísticas'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    variacionIngresos,
    resumenHoy,
    fetchStats,
  }
}
