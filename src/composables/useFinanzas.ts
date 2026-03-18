import { ref, computed } from 'vue'
import { dashboardApi } from '@/modules/admin/api'
import type { FinanzasStats, FinanzasPeriodo } from '@/shared/types'

const EMPTY_PERIODO: FinanzasPeriodo = {
  ingresos: 0,
  senas: 0,
  cancelaciones: 0,
  turnos: 0,
  ticketPromedio: 0,
}

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
      const metrics = await dashboardApi.getMetrics()

      // Derive today from ingresosUltimos7Dias
      const hoyEntry = metrics.ingresosUltimos7Dias.find(d => d.esHoy)
      const hoyIngresos = hoyEntry?.ingresos ?? metrics.ingresosDia
      const hoyTurnos = hoyEntry?.turnos ?? metrics.turnosHoy

      // Derive week from ingresosUltimos7Dias
      const semanaIngresos = metrics.ingresosUltimos7Dias.reduce((s, d) => s + d.ingresos, 0)
      const semanaTurnos = metrics.ingresosUltimos7Dias.reduce((s, d) => s + d.turnos, 0)

      stats.value = {
        hoy: {
          ingresos: hoyIngresos,
          senas: metrics.senasCobradas,
          cancelaciones: metrics.turnosCanceladosHoy,
          turnos: metrics.turnosHoy,
          ticketPromedio: hoyTurnos > 0 ? Math.round(hoyIngresos / hoyTurnos) : 0,
        },
        semana: {
          ingresos: semanaIngresos,
          senas: metrics.senasCobradas,
          cancelaciones: 0,
          turnos: metrics.turnosSemana,
          ticketPromedio: semanaTurnos > 0 ? Math.round(semanaIngresos / semanaTurnos) : 0,
        },
        mes: {
          ingresos: metrics.ingresosMes,
          senas: metrics.senasCobradas,
          cancelaciones: 0,
          turnos: 0,
          ticketPromedio: 0,
        },
        mesAnterior: { ...EMPTY_PERIODO },
        anio: {
          ingresos: metrics.ingresosMes,
          senas: metrics.senasCobradas,
          cancelaciones: 0,
          turnos: 0,
          ticketPromedio: 0,
        },
        ingresosPorDia: metrics.ingresosUltimos7Dias.map(d => ({
          fecha: d.fecha,
          etiqueta: d.etiqueta,
          ingresos: d.ingresos,
          turnos: d.turnos,
          esHoy: d.esHoy ?? false,
        })),
        ingresosPorMes: [],
        ingresosPorServicio: metrics.turnosPorServicio.map(s => ({
          servicio: s.servicio,
          ingresos: s.ingresos,
          cantidad: s.cantidad,
          ticket: s.cantidad > 0 ? Math.round(s.ingresos / s.cantidad) : 0,
        })),
        ingresosPorProfesional: [],
      } as FinanzasStats
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

