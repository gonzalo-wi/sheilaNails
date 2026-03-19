import { ref, computed } from 'vue'
import { dashboardApi } from '@/modules/admin/api'
import type { DashboardStats } from '@/shared/types'

export function useDashboard() {
  const stats = ref<DashboardStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ── Computed ───────────────────────────────────────────────────────────────

  /** Variación porcentual ingresos semana sobre el mes */
  const variacionIngresos = computed(() => {
    if (!stats.value) return 0
    const mes = stats.value.ingresosMes
    const semana = stats.value.ingresosSemana
    if (!mes) return 0
    return Number(((semana / mes) * 100).toFixed(1))
  })

  const resumenHoy = computed(() => {
    if (!stats.value) return null
    return {
      total: stats.value.turnosHoy,
      confirmados: stats.value.turnosConfirmadosHoy,
      pendientes: stats.value.turnosPendientesHoy,
      cancelados: stats.value.turnosCanceladosHoy,
      realizados: stats.value.turnosRealizadosHoy,
      ingresos: stats.value.ingresosDia,
      senas: stats.value.senasCobradas,
    }
  })

  // ── Actions ────────────────────────────────────────────────────────────────

  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      stats.value = await dashboardApi.getMetrics()
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
