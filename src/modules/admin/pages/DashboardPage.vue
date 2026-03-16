<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Calendar, TrendingUp, DollarSign, Users, Clock,
  CheckCircle, Star, ArrowRight,
  BarChart2, Sparkles,
} from 'lucide-vue-next'
import MetricCard from '../components/MetricCard.vue'
import TurnoStatusBadge from '../components/TurnoStatusBadge.vue'
import Loading from '@/shared/components/common/Loading.vue'
import { useDashboard } from '@/composables/useDashboard'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const { stats, loading, resumenHoy, variacionIngresos, fetchStats } = useDashboard()

onMounted(fetchStats)

const fechaHoy = computed(() =>
  format(new Date(), "EEEE d 'de' MMMM", { locale: es }),
)

function formatCurrency(v: number) {
  return `$${v.toLocaleString('es-AR')}`
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-neutral-900 flex items-center gap-2">
          <Sparkles :size="24" class="text-primary-500" />
          Dashboard
        </h1>
        <p class="text-neutral-500 text-sm mt-1 capitalize">{{ fechaHoy }}</p>
      </div>
      <RouterLink to="/admin/turnos" class="btn btn-primary btn-sm self-start">
        <Calendar :size="16" /> Nuevo turno
      </RouterLink>
    </div>

    <Loading v-if="loading" />

    <template v-else-if="stats">

      <!-- ── Panel "Hoy" ──────────────────────────────────────────────── -->
      <div class="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl p-5 mb-6 text-white">
        <p class="text-primary-200 text-sm font-medium mb-4 flex items-center gap-2">
          <Clock :size="14" /> Resumen de hoy
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="bg-white/10 rounded-xl p-3 text-center">
            <p class="text-2xl font-bold">{{ resumenHoy?.total }}</p>
            <p class="text-xs text-primary-200">Turnos</p>
          </div>
          <div class="bg-white/10 rounded-xl p-3 text-center">
            <p class="text-2xl font-bold">{{ resumenHoy?.confirmados }}</p>
            <p class="text-xs text-primary-200">Confirmados</p>
          </div>
          <div class="bg-white/10 rounded-xl p-3 text-center">
            <p class="text-2xl font-bold">{{ resumenHoy?.pendientes }}</p>
            <p class="text-xs text-primary-200">Pendientes</p>
          </div>
          <div class="bg-white/10 rounded-xl p-3 text-center">
            <p class="text-2xl font-bold">{{ resumenHoy?.cancelados }}</p>
            <p class="text-xs text-primary-200">Cancelados</p>
          </div>
          <div class="bg-white/10 rounded-xl p-3 text-center col-span-1">
            <p class="text-xl font-bold">${{ (resumenHoy?.ingresos ?? 0).toLocaleString('es-AR') }}</p>
            <p class="text-xs text-primary-200">Ingresos</p>
          </div>
          <div class="bg-white/10 rounded-xl p-3 text-center col-span-1">
            <p class="text-xl font-bold">${{ (resumenHoy?.senas ?? 0).toLocaleString('es-AR') }}</p>
            <p class="text-xs text-primary-200">Señas cobradas</p>
          </div>
        </div>
      </div>

      <!-- ── KPI Cards ────────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Turnos esta semana"
          :value="stats.turnosSemana"
          :subvalue="`${stats.turnosMes} en el mes`"
          icon-bg="bg-blue-100"
        >
          <template #icon><Calendar :size="20" class="text-blue-600" /></template>
        </MetricCard>

        <MetricCard
          label="Ingresos del mes"
          :value="formatCurrency(stats.ingresosMes)"
          :subvalue="`Ticket promedio: ${formatCurrency(stats.ticketPromedio)}`"
          icon-bg="bg-emerald-100"
          :trend="variacionIngresos"
        >
          <template #icon><DollarSign :size="20" class="text-emerald-600" /></template>
        </MetricCard>

        <MetricCard
          label="Ocupación del mes"
          :value="`${stats.tasaOcupacion}%`"
          :subvalue="`Cancelación: ${stats.tasaCancelacion}%`"
          icon-bg="bg-primary-100"
        >
          <template #icon><BarChart2 :size="20" class="text-primary-600" /></template>
        </MetricCard>

        <MetricCard
          label="Clientas nuevas"
          :value="stats.clientesNuevos"
          subvalue="Este mes"
          icon-bg="bg-purple-100"
        >
          <template #icon><Users :size="20" class="text-purple-600" /></template>
        </MetricCard>
      </div>

      <!-- ── Charts row ───────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        <!-- Ingresos últimos 7 días (bar chart SVG) -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-soft p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-neutral-800 flex items-center gap-2">
              <TrendingUp :size="18" class="text-primary-500" /> Ingresos últimos 7 días
            </h2>
            <RouterLink to="/admin/finanzas" class="text-xs text-primary-600 hover:underline flex items-center gap-1">
              Ver reportes <ArrowRight :size="12" />
            </RouterLink>
          </div>
          <div class="flex items-end gap-2 h-32">
            <template v-for="dia in stats.ingresosUltimos7Dias" :key="dia.fecha">
              <div class="flex-1 flex flex-col items-center gap-1">
                <span class="text-xs text-neutral-400 font-medium">${{ (dia.ingresos / 1000).toFixed(0) }}k</span>
                <div
                  class="w-full rounded-t-lg transition-all duration-500"
                  :class="dia.etiqueta === 'Hoy' ? 'bg-primary-500' : 'bg-primary-200'"
                  :style="{ height: `${(dia.ingresos / Math.max(...stats.ingresosUltimos7Dias.map(d => d.ingresos))) * 80}px` }"
                />
                <span class="text-xs text-neutral-500">{{ dia.etiqueta }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Turnos por estado (donut-style) -->
        <div class="bg-white rounded-xl shadow-soft p-5">
          <h2 class="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <CheckCircle :size="18" class="text-emerald-500" /> Turnos por estado
          </h2>
          <div class="space-y-2.5">
            <div v-for="item in stats.turnosPorEstado" :key="item.estado">
              <div class="flex justify-between text-xs text-neutral-600 mb-1">
                <span class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: item.color }" />
                  {{ item.etiqueta }}
                </span>
                <span class="font-medium">{{ item.cantidad }} ({{ item.porcentaje }}%)</span>
              </div>
              <div class="w-full bg-neutral-100 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-700"
                  :style="{ width: `${item.porcentaje}%`, backgroundColor: item.color }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Bottom row ──────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- Servicios más solicitados -->
        <div class="bg-white rounded-xl shadow-soft p-5">
          <h2 class="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <Star :size="18" class="text-amber-500" /> Top servicios
          </h2>
          <div class="space-y-3">
            <div v-for="(item, idx) in stats.turnosPorServicio.slice(0, 5)" :key="item.servicio" class="flex items-center gap-3">
              <span class="w-6 h-6 rounded-full bg-neutral-100 text-xs font-bold text-neutral-500 flex items-center justify-center flex-shrink-0">
                {{ idx + 1 }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-neutral-800 truncate">{{ item.servicio }}</p>
                <p class="text-xs text-neutral-400">{{ item.cantidad }} turnos</p>
              </div>
              <span class="text-xs font-semibold text-neutral-700 shrink-0">${{ (item.ingresos / 1000).toFixed(0) }}k</span>
            </div>
          </div>
        </div>

        <!-- Ocupación por horario -->
        <div class="bg-white rounded-xl shadow-soft p-5">
          <h2 class="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <Clock :size="18" class="text-blue-500" /> Horarios más demandados
          </h2>
          <div class="space-y-2">
            <div v-for="slot in stats.ocupacionPorHorario" :key="slot.hora" class="flex items-center gap-2">
              <span class="text-xs text-neutral-500 w-12 shrink-0">{{ slot.hora }}</span>
              <div class="flex-1 bg-neutral-100 rounded-full h-2.5">
                <div
                  class="h-2.5 rounded-full transition-all duration-700"
                  :class="slot.ocupacion > 80 ? 'bg-primary-500' : slot.ocupacion > 50 ? 'bg-primary-300' : 'bg-neutral-300'"
                  :style="{ width: `${slot.ocupacion}%` }"
                />
              </div>
              <span class="text-xs font-medium text-neutral-600 w-8 text-right shrink-0">{{ slot.ocupacion }}%</span>
            </div>
          </div>
        </div>

        <!-- Top clientas + Quick access -->
        <div class="space-y-4">
          <!-- Top clientas -->
          <div class="bg-white rounded-xl shadow-soft p-5">
            <div class="flex items-center justify-between mb-3">
              <h2 class="font-semibold text-neutral-800 flex items-center gap-2">
                <Users :size="18" class="text-purple-500" /> Top clientas
              </h2>
              <RouterLink to="/admin/clientes" class="text-xs text-primary-600 hover:underline">Ver todas</RouterLink>
            </div>
            <div class="space-y-2">
              <div v-for="clienta in stats.topClientas" :key="clienta.id" class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-bold text-primary-700">{{ clienta.nombre.charAt(0) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-neutral-800 truncate">{{ clienta.nombre }} {{ clienta.apellido }}</p>
                  <p class="text-xs text-neutral-400">{{ clienta.cantidadTurnos }} turnos</p>
                </div>
                <span class="text-xs font-bold text-primary-700 shrink-0">${{ (clienta.totalGastado / 1000).toFixed(0) }}k</span>
              </div>
            </div>
          </div>

          <!-- Accesos rápidos -->
          <div class="bg-white rounded-xl shadow-soft p-5">
            <h2 class="font-semibold text-neutral-800 mb-3">Accesos rápidos</h2>
            <div class="grid grid-cols-2 gap-2">
              <RouterLink to="/admin/agenda" class="flex flex-col items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center">
                <Calendar :size="20" class="text-blue-600 mb-1" />
                <span class="text-xs font-medium text-blue-800">Calendario</span>
              </RouterLink>
              <RouterLink to="/admin/turnos" class="flex flex-col items-center p-3 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors text-center">
                <CheckCircle :size="20" class="text-primary-600 mb-1" />
                <span class="text-xs font-medium text-primary-800">Turnos</span>
              </RouterLink>
              <RouterLink to="/admin/finanzas" class="flex flex-col items-center p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-center">
                <DollarSign :size="20" class="text-emerald-600 mb-1" />
                <span class="text-xs font-medium text-emerald-800">Finanzas</span>
              </RouterLink>
              <RouterLink to="/admin/horarios" class="flex flex-col items-center p-3 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors text-center">
                <Clock :size="20" class="text-amber-600 mb-1" />
                <span class="text-xs font-medium text-amber-800">Horarios</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Próximos turnos del día ──────────────────────────────────── -->
      <div v-if="stats.proximosTurnos.length" class="mt-4 bg-white rounded-xl shadow-soft p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-neutral-800 flex items-center gap-2">
            <Calendar :size="18" class="text-primary-500" /> Turnos de hoy
          </h2>
          <RouterLink to="/admin/turnos" class="text-xs text-primary-600 hover:underline flex items-center gap-1">
            Ver todos <ArrowRight :size="12" />
          </RouterLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-neutral-400 uppercase border-b border-neutral-100">
                <th class="text-left pb-2 font-medium">Hora</th>
                <th class="text-left pb-2 font-medium">Clienta</th>
                <th class="text-left pb-2 font-medium hidden sm:table-cell">Servicio</th>
                <th class="text-left pb-2 font-medium hidden md:table-cell">Profesional</th>
                <th class="text-right pb-2 font-medium">Total</th>
                <th class="text-right pb-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-50">
              <tr v-for="t in stats.proximosTurnos" :key="t.id" class="py-2 hover:bg-neutral-50">
                <td class="py-2 pr-3 font-medium text-neutral-700">{{ t.horaInicio }}</td>
                <td class="py-2 pr-3">
                  <p class="font-medium text-neutral-800">{{ t.cliente?.nombre }} {{ t.cliente?.apellido }}</p>
                </td>
                <td class="py-2 pr-3 hidden sm:table-cell text-neutral-600">{{ t.servicio?.nombre }}</td>
                <td class="py-2 pr-3 hidden md:table-cell text-neutral-500 text-xs">{{ t.profesional?.nombre }}</td>
                <td class="py-2 pr-3 text-right font-semibold text-neutral-800">${{ t.precioTotalFinal.toLocaleString('es-AR') }}</td>
                <td class="py-2 text-right">
                  <TurnoStatusBadge :estado="t.estado" size="sm" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>
  </div>
</template>
