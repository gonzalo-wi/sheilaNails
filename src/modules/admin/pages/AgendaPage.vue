<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTurnos } from '@/composables/useTurnos'
import { useServicios } from '@/composables/useServicios'
import { useClientes } from '@/composables/useClientes'
import Loading from '@/shared/components/common/Loading.vue'
import TurnoDetailsDrawer from '../components/TurnoDetailsDrawer.vue'
import TurnoFormModal from '../components/TurnoFormModal.vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { format } from 'date-fns'
import type { Turno, EstadoTurno } from '@/shared/types'
import type { CalendarOptions } from '@fullcalendar/core'
import { Calendar, Plus, Filter, X } from 'lucide-vue-next'

const {
  turnos, loading, selectedTurno,
  fetchAll, selectTurno, cambiarEstado, createTurno, updateTurno
} = useTurnos()

const { servicios, fetchAll: fetchServicios } = useServicios()
const { clientes, fetchAll: fetchClientes } = useClientes()

const showDrawer = ref(false)
const showFormModal = ref(false)
const editingTurno = ref<Turno | null>(null)
const prefillData = ref<Partial<Turno>>({})
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
  select: handleCalendarSelect,
} as unknown as CalendarOptions))

function getEstadoColor(estado: EstadoTurno): { bg: string; border: string; text: string } {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    PENDING:   { bg: '#fbbf24', border: '#f59e0b', text: '#78350f' },
    CONFIRMED: { bg: '#10b981', border: '#059669', text: '#064e3b' },
    CANCELLED: { bg: '#ef4444', border: '#dc2626', text: '#7f1d1d' },
    DONE:      { bg: '#3b82f6', border: '#2563eb', text: '#fff' },
    ABSENT:    { bg: '#9ca3af', border: '#6b7280', text: '#fff' },
  }
  return colors[estado] ?? { bg: '#fbbf24', border: '#f59e0b', text: '#78350f' }
}

function handleEventClick(clickInfo: { event: { extendedProps: { turno: Turno } } }) {
  selectTurno(clickInfo.event.extendedProps.turno)
  showDrawer.value = true
}

function handleRebook(turno: Turno) {
  showDrawer.value = false
  prefillData.value = {
    fecha: turno.fecha,
    horaInicio: turno.horaInicio,
    horaFin: turno.horaFin,
    servicioId: turno.servicioId,
    precioBase: turno.precioBase,
  }
  editingTurno.value = null
  showFormModal.value = true
}

function handleCalendarSelect(selectInfo: { start: Date; end: Date }) {
  prefillData.value = {
    fecha: format(selectInfo.start, 'yyyy-MM-dd'),
    horaInicio: format(selectInfo.start, 'HH:mm'),
    horaFin: format(selectInfo.end, 'HH:mm'),
  }
  editingTurno.value = null
  showFormModal.value = true
}

function openCreate() {
  prefillData.value = {}
  editingTurno.value = null
  showFormModal.value = true
}

function openEdit(t: Turno) {
  prefillData.value = {}
  editingTurno.value = t
  showDrawer.value = false
  showFormModal.value = true
}

async function handleCambiarEstado(turnoId: number, estado: EstadoTurno) {
  await cambiarEstado(turnoId, estado)
  showDrawer.value = false
}

async function handleSave(data: Partial<Turno>) {
  try {
    if (editingTurno.value?.id) {
      await updateTurno(editingTurno.value.id, data)
    } else {
      await createTurno(data as Omit<Turno, 'id' | 'createdAt' | 'updatedAt'>)
    }
    showFormModal.value = false
    await fetchAll()
  } catch (e: unknown) {
    console.error('Error al guardar turno:', e)
    const msg = (e && typeof e === 'object' && 'response' in e)
      ? ((e as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error
          ?? (e as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message)
      : null
    alert(msg ?? 'Error al guardar el turno. Revisá los datos e intentá nuevamente.')
  }
}

onMounted(() => {
  fetchAll()
  fetchServicios()
  fetchClientes()
})
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
          <option value="PENDING">Pendiente</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="DONE">Realizado</option>
          <option value="CANCELLED">Cancelado</option>
          <option value="ABSENT">Ausente</option>
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
      <div v-for="[estado, color, label] in [
        ['PENDING',   '#fbbf24', 'Pendiente'],
        ['CONFIRMED', '#10b981', 'Confirmado'],
        ['DONE',      '#3b82f6', 'Realizado'],
        ['CANCELLED', '#ef4444', 'Cancelado'],
        ['ABSENT',    '#9ca3af', 'Ausente'],
      ]" :key="estado" class="flex items-center gap-1.5 text-xs text-neutral-600">
        <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: color as string }" />
        {{ label }}
      </div>
    </div>

    <!-- Detail Drawer -->
    <TurnoDetailsDrawer
      v-model="showDrawer"
      :turno="selectedTurno"
      @edit="openEdit"
      @cambiar-estado="handleCambiarEstado"
      @rebook="handleRebook"
    />

    <!-- Form Modal -->
    <TurnoFormModal
      v-model="showFormModal"
      :turno="editingTurno"
      :prefill="prefillData"
      :servicios="servicios"
      :clientes="clientes"
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