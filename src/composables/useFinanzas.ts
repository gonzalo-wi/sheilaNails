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

      const p = metrics.periodos

      stats.value = {
        hoy: {
          ingresos: p?.today.revenue ?? metrics.ingresosDia,
          senas: p?.today.deposits ?? 0,
          cancelaciones: p?.today.cancelled ?? metrics.turnosCanceladosHoy,
          turnos: p?.today.total ?? metrics.turnosHoy,
          ticketPromedio: (p?.today.completed ?? metrics.turnosRealizadosHoy) > 0
            ? Math.round((p?.today.revenue ?? metrics.ingresosDia) / (p?.today.completed ?? metrics.turnosRealizadosHoy))
            : 0,
        },
        semana: {
          ingresos: p?.week.revenue ?? metrics.ingresosSemana,
          senas: p?.week.deposits ?? 0,
          cancelaciones: p?.week.cancelled ?? 0,
          turnos: p?.week.total ?? metrics.turnosSemana,
          ticketPromedio: (p?.week.completed ?? 0) > 0
            ? Math.round((p?.week.revenue ?? 0) / p!.week.completed)
            : 0,
        },
        mes: {
          ingresos: p?.month.revenue ?? metrics.ingresosMes,
          senas: p?.month.deposits ?? metrics.senasCobradas,
          cancelaciones: p?.month.cancelled ?? 0,
          turnos: p?.month.total ?? metrics.turnosMes,
          ticketPromedio: (p?.month.completed ?? 0) > 0
            ? Math.round((p?.month.revenue ?? 0) / p!.month.completed)
            : 0,
        },
        mesAnterior: { ...EMPTY_PERIODO },
        anio: {
          ingresos: p?.year.revenue ?? metrics.ingresosMes,
          senas: p?.year.deposits ?? metrics.senasCobradas,
          cancelaciones: p?.year.cancelled ?? 0,
          turnos: p?.year.total ?? 0,
          ticketPromedio: (p?.year.completed ?? 0) > 0
            ? Math.round((p?.year.revenue ?? 0) / p!.year.completed)
            : 0,
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

