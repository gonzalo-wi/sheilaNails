<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFinanzas } from '@/composables/useFinanzas'
import Loading from '@/shared/components/common/Loading.vue'
import { DollarSign, TrendingUp, TrendingDown, BarChart2, Calendar } from 'lucide-vue-next'

const { stats, loading, variacionMes, maxIngresoDiario, fetchStats } = useFinanzas()

type Periodo = 'hoy' | 'semana' | 'mes' | 'anio'
const periodo = ref<Periodo>('mes')

const periodos: { key: Periodo; label: string }[] = [
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Este mes' },
  { key: 'anio', label: 'Este año' },
]

const resumen = computed(() => {
  if (!stats.value) return null
  return stats.value[periodo.value]
})

function formatCurrency(v: number) {
  return `$${v.toLocaleString('es-AR')}`
}

function pct(v: number, max: number) {
  if (!max) return 0
  return Math.round((v / max) * 100)
}

onMounted(() => fetchStats())
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-neutral-900 flex items-center gap-2">
          <BarChart2 :size="22" class="text-primary-500" />
          Finanzas
        </h1>
        <p class="text-neutral-500 text-sm mt-0.5">Reportes e ingresos del negocio</p>
      </div>
    </div>

    <Loading v-if="loading" />

    <template v-else-if="stats">

      <!-- Period selector -->
      <div class="flex gap-1 bg-neutral-100 p-1 rounded-xl w-fit mb-6">
        <button
          v-for="p in periodos"
          :key="p.key"
          class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
          :class="periodo === p.key ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'"
          @click="periodo = p.key"
        >
          {{ p.label }}
        </button>
      </div>

      <!-- KPI Cards -->
      <div v-if="resumen" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-soft p-5">
          <p class="text-xs text-neutral-400 font-medium mb-1">Ingresos</p>
          <p class="text-2xl font-bold text-neutral-900">{{ formatCurrency(resumen.ingresos) }}</p>
          <div v-if="periodo === 'mes'" class="flex items-center gap-1 mt-2 text-xs font-medium"
            :class="variacionMes >= 0 ? 'text-emerald-600' : 'text-danger-600'"
          >
            <TrendingUp v-if="variacionMes >= 0" :size="13" />
            <TrendingDown v-else :size="13" />
            {{ variacionMes >= 0 ? '+' : '' }}{{ variacionMes }}% vs mes anterior
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-soft p-5">
          <p class="text-xs text-neutral-400 font-medium mb-1">Señas cobradas</p>
          <p class="text-2xl font-bold text-neutral-900">{{ formatCurrency(resumen.senas) }}</p>
          <p class="text-xs text-neutral-400 mt-2">De {{ resumen.turnos }} turnos</p>
        </div>

        <div class="bg-white rounded-xl shadow-soft p-5">
          <p class="text-xs text-neutral-400 font-medium mb-1">Ticket promedio</p>
          <p class="text-2xl font-bold text-neutral-900">{{ formatCurrency(resumen.ticketPromedio) }}</p>
          <p class="text-xs text-neutral-400 mt-2">Por turno completado</p>
        </div>

        <div class="bg-white rounded-xl shadow-soft p-5">
          <p class="text-xs text-neutral-400 font-medium mb-1">Cancelaciones</p>
          <p class="text-2xl font-bold text-neutral-900">{{ resumen.cancelaciones }}</p>
          <p class="text-xs text-neutral-400 mt-2">turnos cancelados</p>
        </div>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        <!-- Ingresos por día -->
        <div class="bg-white rounded-xl shadow-soft p-5">
          <h2 class="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <Calendar :size="16" class="text-primary-500" /> Ingresos últimos 7 días
          </h2>
          <div v-if="stats.ingresosPorDia.length" class="space-y-2">
            <div v-for="d in stats.ingresosPorDia" :key="d.fecha" class="flex items-center gap-3">
              <span class="text-xs text-neutral-500 w-8 shrink-0 font-medium">{{ d.etiqueta }}</span>
              <div class="flex-1 bg-neutral-100 rounded-full h-3 overflow-hidden">
                <div
                  class="h-3 rounded-full transition-all duration-700"
                  :class="d.esHoy ? 'bg-primary-500' : 'bg-primary-300'"
                  :style="{ width: `${pct(d.ingresos, maxIngresoDiario)}%` }"
                />
              </div>
              <span class="text-xs font-semibold text-neutral-700 w-22 text-right shrink-0">{{ formatCurrency(d.ingresos) }}</span>
            </div>
          </div>
          <p v-else class="text-sm text-neutral-400 text-center py-6">Sin datos</p>
        </div>

        <!-- Semana vs Mes -->
        <div class="bg-white rounded-xl shadow-soft p-5">
          <h2 class="font-semibold text-neutral-800 mb-5 flex items-center gap-2">
            <TrendingUp :size="16" class="text-emerald-500" /> Semana vs Mes
          </h2>
          <div class="space-y-5">
            <div>
              <div class="flex justify-between mb-1.5">
                <span class="text-sm font-medium text-neutral-700">Esta semana</span>
                <span class="text-sm font-bold text-neutral-900">{{ formatCurrency(stats.semana.ingresos) }}</span>
              </div>
              <div class="w-full bg-neutral-100 rounded-full h-3">
                <div
                  class="h-3 rounded-full bg-primary-500 transition-all duration-700"
                  :style="{ width: `${pct(stats.semana.ingresos, stats.mes.ingresos)}%` }"
                />
              </div>
              <p class="text-xs text-neutral-400 mt-1">{{ pct(stats.semana.ingresos, stats.mes.ingresos) }}% del mes</p>
            </div>
            <div>
              <div class="flex justify-between mb-1.5">
                <span class="text-sm font-medium text-neutral-700">Este mes</span>
                <span class="text-sm font-bold text-neutral-900">{{ formatCurrency(stats.mes.ingresos) }}</span>
              </div>
              <div class="w-full bg-primary-100 rounded-full h-3" />
            </div>
            <div class="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-neutral-400">Señas cobradas</p>
                <p class="text-lg font-bold text-primary-700 mt-0.5">{{ formatCurrency(stats.mes.senas) }}</p>
              </div>
              <div>
                <p class="text-xs text-neutral-400">Turnos esta semana</p>
                <p class="text-lg font-bold text-neutral-900 mt-0.5">{{ stats.semana.turnos }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tables row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Por servicio -->
        <div class="bg-white rounded-xl shadow-soft p-5">
          <h2 class="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <DollarSign :size="16" class="text-emerald-500" /> Ingresos por servicio
          </h2>
          <div v-if="stats.ingresosPorServicio.length" class="space-y-3">
            <div v-for="(row, i) in stats.ingresosPorServicio" :key="row.servicio">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-5 h-5 rounded-full bg-neutral-100 text-xs font-bold text-neutral-400 flex items-center justify-center flex-shrink-0">{{ i + 1 }}</span>
                <span class="flex-1 text-sm font-medium text-neutral-800 truncate">{{ row.servicio }}</span>
                <span class="text-sm font-bold text-primary-700 shrink-0">{{ formatCurrency(row.ingresos) }}</span>
              </div>
              <div class="flex items-center gap-2 pl-7">
                <div class="flex-1 bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div
                    class="h-2 rounded-full bg-emerald-400 transition-all duration-700"
                    :style="{ width: `${pct(row.cantidad, stats.ingresosPorServicio[0]?.cantidad || 1)}%` }"
                  />
                </div>
                <span class="text-xs text-neutral-400 w-14 text-right shrink-0">{{ row.cantidad }} turnos</span>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-neutral-400 text-center py-4">Sin datos</p>
        </div>

        <!-- Servicios más solicitados (bar) -->
        <div class="bg-white rounded-xl shadow-soft p-5">
          <h2 class="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <BarChart2 :size="16" class="text-blue-500" /> Servicios más solicitados
          </h2>
          <div v-if="stats.ingresosPorServicio.length" class="flex items-end gap-3 h-36">
            <div
              v-for="row in stats.ingresosPorServicio.slice(0, 6)"
              :key="row.servicio"
              class="flex-1 flex flex-col items-center gap-1 min-w-0"
            >
              <span class="text-xs text-neutral-500 font-semibold">{{ row.cantidad }}</span>
              <div
                class="w-full rounded-t-lg bg-blue-400 transition-all duration-700 hover:bg-blue-500"
                :style="{ height: `${pct(row.cantidad, stats.ingresosPorServicio[0]?.cantidad || 1) * 0.9}px` }"
              />
              <span class="text-xs text-neutral-500 truncate w-full text-center" :title="row.servicio">
                {{ row.servicio.length > 8 ? row.servicio.slice(0, 7) + '…' : row.servicio }}
              </span>
            </div>
          </div>
          <p v-else class="text-sm text-neutral-400 text-center py-6">Sin datos</p>
        </div>

      </div>

      <!-- Comparison mes anterior (solo si hay datos reales) -->
      <div v-if="stats.mesAnterior.ingresos > 0" class="mt-4 bg-white rounded-xl shadow-soft p-5">
        <h2 class="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <TrendingUp :size="16" class="text-neutral-500" /> Comparativa mes actual vs. mes anterior
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p class="text-xs text-neutral-400 mb-1">Ingresos anteriores</p>
            <p class="font-bold text-neutral-700">{{ formatCurrency(stats.mesAnterior.ingresos) }}</p>
          </div>
          <div>
            <p class="text-xs text-neutral-400 mb-1">Ingresos actuales</p>
            <p class="font-bold text-neutral-900">{{ formatCurrency(stats.mes.ingresos) }}</p>
          </div>
          <div>
            <p class="text-xs text-neutral-400 mb-1">Variación</p>
            <p class="font-bold text-lg" :class="variacionMes >= 0 ? 'text-emerald-600' : 'text-danger-600'">
              {{ variacionMes >= 0 ? '+' : '' }}{{ variacionMes }}%
            </p>
          </div>
          <div>
            <p class="text-xs text-neutral-400 mb-1">Turnos anterior</p>
            <p class="font-bold text-neutral-700">{{ stats.mesAnterior.turnos }}</p>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>
