<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFinanzas } from '@/composables/useFinanzas'
import Loading from '@/shared/components/common/Loading.vue'
import { DollarSign, TrendingUp, TrendingDown, BarChart2, Calendar, Users } from 'lucide-vue-next'

const { stats, loading, variacionMes, maxIngresoDiario, maxIngresoMensual, fetchStats } = useFinanzas()

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
            <Calendar :size="16" class="text-primary-500" /> Ingresos diarios (últimos 7 días)
          </h2>
          <div class="space-y-2">
            <div v-for="d in stats.ingresosPorDia" :key="d.fecha" class="flex items-center gap-3">
              <span class="text-xs text-neutral-500 w-8 shrink-0">{{ d.etiqueta }}</span>
              <div class="flex-1 bg-neutral-100 rounded-full h-3 overflow-hidden">
                <div
                  class="h-3 rounded-full transition-all duration-700"
                  :class="d.esHoy ? 'bg-primary-500' : 'bg-primary-200'"
                  :style="{ width: `${pct(d.ingresos, maxIngresoDiario)}%` }"
                />
              </div>
              <span class="text-xs font-medium text-neutral-700 w-20 text-right shrink-0">{{ formatCurrency(d.ingresos) }}</span>
            </div>
          </div>
        </div>

        <!-- Ingresos por mes -->
        <div class="bg-white rounded-xl shadow-soft p-5">
          <h2 class="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <BarChart2 :size="16" class="text-blue-500" /> Ingresos por mes
          </h2>
          <div class="flex items-end gap-2 h-28">
            <div v-for="m in stats.ingresosPorMes" :key="m.mes" class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs text-neutral-400 font-medium">${{ Math.round(m.ingresos / 1000) }}k</span>
              <div
                class="w-full rounded-t-lg transition-all duration-700"
                :class="m.esActual ? 'bg-primary-500' : 'bg-primary-200'"
                :style="{ height: `${pct(m.ingresos, maxIngresoMensual) * 0.8}px` }"
              />
              <span class="text-xs text-neutral-500">{{ m.etiqueta }}</span>
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
            <div v-for="(row, i) in stats.ingresosPorServicio" :key="row.servicio" class="flex items-center gap-3">
              <span class="w-5 h-5 rounded-full bg-neutral-100 text-xs font-bold text-neutral-400 flex items-center justify-center flex-shrink-0">
                {{ i + 1 }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-neutral-800 truncate">{{ row.servicio }}</p>
                <p class="text-xs text-neutral-400">{{ row.cantidad }} turnos</p>
              </div>
              <span class="text-sm font-bold text-primary-700 shrink-0">{{ formatCurrency(row.ingresos) }}</span>
            </div>
          </div>
          <p v-else class="text-sm text-neutral-400 text-center py-4">Sin datos</p>
        </div>

        <!-- Por profesional -->
        <div class="bg-white rounded-xl shadow-soft p-5">
          <h2 class="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <Users :size="16" class="text-purple-500" /> Ingresos por profesional
          </h2>
          <div v-if="stats.ingresosPorProfesional.length" class="space-y-4">
            <div v-for="pro in stats.ingresosPorProfesional" :key="pro.nombre" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span class="font-medium text-neutral-800">{{ pro.nombre }}</span>
                <span class="font-bold text-primary-700">{{ formatCurrency(pro.ingresos) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-neutral-100 rounded-full h-2">
                  <div
                    class="h-2 bg-purple-400 rounded-full transition-all duration-700"
                    :style="{ width: `${pct(pro.ingresos, stats.ingresosPorProfesional[0]?.ingresos || 1)}%` }"
                  />
                </div>
                <span class="text-xs text-neutral-400 shrink-0">{{ pro.turnos }} turnos</span>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-neutral-400 text-center py-4">Sin datos</p>
        </div>

      </div>

      <!-- Comparison mes anterior -->
      <div v-if="stats.mesAnterior" class="mt-4 bg-white rounded-xl shadow-soft p-5">
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
