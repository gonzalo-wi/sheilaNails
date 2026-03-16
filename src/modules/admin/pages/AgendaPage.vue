<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTurnos } from '@/composables/useTurnos'
import Loading from '@/shared/components/common/Loading.vue'
import TurnoDetailsDrawer from '../components/TurnoDetailsDrawer.vue'
import TurnoFormModal from '../components/TurnoFormModal.vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import type { Turno, EstadoTurno } from '@/shared/types'
import type { CalendarOptions } from '@fullcalendar/core'
import { Calendar, Plus, Filter, X } from 'lucide-vue-next'

const {
  turnos, loading, selectedTurno,
  fetchAll, selectTurno, cambiarEstado
} = useTurnos()

const showDrawer = ref(false)
const showFormModal = ref(false)
const editingTurno = ref<Turno | null>(null)
const filtroProfesional = ref('')
const filtroEstado = ref<EstadoTurno | ''>('')
const showFilters = ref(false)

const profesionales = computed(() => {
  const all = turnos.value.map(t => t.profesional).filter(Boolean)
  return [...new Map(all.map(p => [p!.id, p!])).values()]
})

const turnosFiltrados = computed(() => {
  return turnos.value.filter(t => {
    if (filtroProfesional.value && t.profesionalId !== Number(filtroProfesional.value)) return false
    if (filtroEstado.value && t.estado !== filtroEstado.value) return false
    return true
  })
})

const calendarEvents = computed(() => {
  return turnosFiltrados.value.map(turno => ({
    id: turno.id.toString(),
    title: `${turno.servicio?.nombre || 'Servicio'} · ${turno.cliente?.nombre || 'Clienta'}`,
    start: `${turno.fecha}T${turno.horaInicio}`,
    end: `${turno.fecha}T${turno.horaFin}`,
    backgroundColor: getEstadoColor(turno.estado).bg,
    borderColor: getEstadoColor(turno.estado).border,
    textColor: getEstadoColor(turno.estado).text,
    extendedProps: { turno },
  }))
})

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  locale: esLocale,
  slotMinTime: '09:00:00',
  slotMaxTime: '20:00:00',
  allDaySlot: false,
  height: 'auto',
  events: calendarEvents.value,
  eventClick: handleEventClick,
  editable: false,
  selectable: true,
} as unknown as CalendarOptions))

function getEstadoColor(estado: EstadoTurno): { bg: string; border: string; text: string } {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    PENDIENTE:  { bg: '#fbbf24', border: '#f59e0b', text: '#78350f' },
    CONFIRMADO: { bg: '#10b981', border: '#059669', text: '#064e3b' },
    CANCELADO:  { bg: '#ef4444', border: '#dc2626', text: '#fff' },
    COMPLETADO: { bg: '#3b82f6', border: '#2563eb', text: '#fff' },
    NO_SHOW:    { bg: '#9ca3af', border: '#6b7280', text: '#fff' },
  }
  return colors[estado] ?? { bg: '#fbbf24', border: '#f59e0b', text: '#78350f' }
}

function handleEventClick(clickInfo: { event: { extendedProps: { turno: Turno } } }) {
  selectTurno(clickInfo.event.extendedProps.turno)
  showDrawer.value = true
}

function openCreate() {
  editingTurno.value = null
  showFormModal.value = true
}

function openEdit(t: Turno) {
  editingTurno.value = t
  showDrawer.value = false
  showFormModal.value = true
}

async function handleCambiarEstado(turnoId: number, estado: EstadoTurno) {
  await cambiarEstado(turnoId, estado)
  showDrawer.value = false
}

async function handleSave() {
  showFormModal.value = false
  await fetchAll()
}

onMounted(() => fetchAll())
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-neutral-900 flex items-center gap-2">
          <Calendar :size="22" class="text-primary-500" />
          Agenda
        </h1>
        <p class="text-neutral-500 text-sm mt-0.5">Vista de calendario · {{ turnosFiltrados.length }} turnos</p>
      </div>
      <div class="flex gap-2">
        <button
          class="btn btn-sm"
          :class="showFilters ? 'btn-primary' : 'btn-outline'"
          @click="showFilters = !showFilters"
        >
          <Filter :size="15" /> Filtros
        </button>
        <button class="btn btn-primary btn-sm" @click="openCreate">
          <Plus :size="15" /> Nuevo turno
        </button>
      </div>
    </div>

    <!-- Filters bar -->
    <div v-if="showFilters" class="bg-white rounded-xl shadow-soft p-4 mb-4 flex flex-wrap gap-3 items-end">
      <div>
        <label class="label text-xs">Profesional</label>
        <select v-model="filtroProfesional" class="input text-sm w-44">
          <option value="">Todas</option>
          <option v-for="p in profesionales" :key="p.id" :value="p.id">{{ p.nombre }} {{ p.apellido }}</option>
        </select>
      </div>
      <div>
        <label class="label text-xs">Estado</label>
        <select v-model="filtroEstado" class="input text-sm w-44">
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="CONFIRMADO">Confirmado</option>
          <option value="COMPLETADO">Completado</option>
          <option value="CANCELADO">Cancelado</option>
          <option value="NO_SHOW">No Show</option>
        </select>
      </div>
      <button
        v-if="filtroProfesional || filtroEstado"
        class="btn btn-ghost btn-sm text-neutral-500"
        @click="filtroProfesional = ''; filtroEstado = ''"
      >
        <X :size="14" /> Limpiar
      </button>
    </div>

    <Loading v-if="loading" />

    <div v-else class="bg-white rounded-xl shadow-soft p-4 sm:p-6">
      <FullCalendar :options="calendarOptions" />
    </div>

    <!-- Estado legend -->
    <div class="flex flex-wrap gap-3 mt-3 px-1">
      <div v-for="[estado, color] in [['PENDIENTE','#fbbf24'], ['CONFIRMADO','#10b981'], ['COMPLETADO','#3b82f6'], ['CANCELADO','#ef4444'], ['NO_SHOW','#9ca3af']]" :key="estado" class="flex items-center gap-1.5 text-xs text-neutral-600">
        <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: color as string }" />
        {{ estado }}
      </div>
    </div>

    <!-- Detail Drawer -->
    <TurnoDetailsDrawer
      v-model="showDrawer"
      :turno="selectedTurno"
      @edit="openEdit"
      @cambiar-estado="handleCambiarEstado"
    />

    <!-- Form Modal -->
    <TurnoFormModal
      v-model="showFormModal"
      :turno="editingTurno"
      @save="handleSave"
    />
  </div>
</template>

<style>
.fc { font-family: inherit; }
.fc .fc-button-primary { background-color: #ec4899; border-color: #ec4899; }
.fc .fc-button-primary:hover { background-color: #db2777; border-color: #db2777; }
.fc .fc-button-primary:not(:disabled):active,
.fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #be185d; border-color: #be185d; }
.fc-event { cursor: pointer; }
</style>