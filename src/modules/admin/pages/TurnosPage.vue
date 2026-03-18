<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTurnos } from '@/composables/useTurnos'
import { serviciosApi, clientesApi } from '@/modules/admin/api'
import Loading from '@/shared/components/common/Loading.vue'
import EmptyState from '@/shared/components/common/EmptyState.vue'
import TurnoStatusBadge from '../components/TurnoStatusBadge.vue'
import TurnoDetailsDrawer from '../components/TurnoDetailsDrawer.vue'
import TurnoFormModal from '../components/TurnoFormModal.vue'
import {
  Search, Plus, Calendar, Filter, X, ChevronLeft, ChevronRight,
  Eye, Edit, CheckCircle, XCircle, Check
} from 'lucide-vue-next'
import type { Turno, EstadoTurno, Servicio, Cliente } from '@/shared/types'

const {
  turnos, loading,
  selectedTurno, filters,
  totalTurnos, pendientes, confirmados,
  fetchAll, cambiarEstado, createTurno, updateTurno, selectTurno, clearFilters
} = useTurnos()

// Lists for the create/edit modal
const servicios = ref<Servicio[]>([])
const clientes  = ref<Cliente[]>([])

async function loadModalData() {
  try {
    ;[servicios.value, clientes.value] = await Promise.all([
      serviciosApi.getAll(false),
      clientesApi.getAll(),
    ])
  } catch (e) {
    console.error('Error al cargar datos para el modal:', e)
  }
}

// Local state
const searchQuery = ref('')
const selectedEstado = ref<EstadoTurno | ''>('')
const selectedFechaDesde = ref('')
const selectedFechaHasta = ref('')
const showFilters = ref(false)
const showDrawer = ref(false)
const showFormModal = ref(false)
const editingTurno = ref<Turno | null>(null)
const page = ref(1)
const perPage = 15

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.busqueda = val || undefined
    fetchAll()
    page.value = 1
  }, 350)
})

watch(selectedEstado, (val) => {
  filters.value.estado = (val as EstadoTurno) || undefined
  fetchAll()
  page.value = 1
})

watch([selectedFechaDesde, selectedFechaHasta], ([desde, hasta]) => {
  filters.value.fechaDesde = desde || undefined
  filters.value.fechaHasta = hasta || undefined
  fetchAll()
  page.value = 1
})

// Paginated
const paginatedTurnos = computed(() => {
  const start = (page.value - 1) * perPage
  return turnos.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.ceil(turnos.value.length / perPage))

const hasActiveFilters = computed(() =>
  !!searchQuery.value || !!selectedEstado.value || !!selectedFechaDesde.value || !!selectedFechaHasta.value
)

function formatFecha(fecha: string) {
  try {
    return format(parseISO(fecha), "dd MMM yyyy", { locale: es })
  } catch {
    return fecha
  }
}

function formatCurrency(v: number) {
  return `$${v.toLocaleString('es-AR')}`
}

function openDetail(t: Turno) {
  selectTurno(t)
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

async function handleSave(data: Partial<Turno>) {
  showFormModal.value = false
  try {
    if (editingTurno.value) {
      await updateTurno(editingTurno.value.id, data)
    } else {
      await createTurno(data as Omit<Turno, 'id'>)
    }
    await fetchAll()
  } catch (e) {
    console.error('Error al guardar turno:', e)
    alert('Error al guardar el turno. Por favor, intentá de nuevo.')
  }
}

function limpiarFiltros() {
  searchQuery.value = ''
  selectedEstado.value = ''
  selectedFechaDesde.value = ''
  selectedFechaHasta.value = ''
  clearFilters()
  fetchAll()
  page.value = 1
}

onMounted(() => {
  fetchAll()
  loadModalData()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-neutral-900">Turnos</h1>
        <p class="text-neutral-500 text-sm mt-0.5">Gestión completa de reservas</p>
      </div>
      <div class="flex gap-2">
        <RouterLink to="/admin/agenda" class="btn btn-outline btn-sm">
          <Calendar :size="16" /> Calendario
        </RouterLink>
        <button class="btn btn-primary btn-sm" @click="openCreate">
          <Plus :size="16" /> Nuevo turno
        </button>
      </div>
    </div>

    <!-- Summary pills -->
    <div class="flex flex-wrap gap-2 mb-5">
      <button
        class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
        :class="selectedEstado === '' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'"
        @click="selectedEstado = ''"
      >
        Todos ({{ totalTurnos }})
      </button>
      <button
        class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
        :class="selectedEstado === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'"
        @click="selectedEstado = selectedEstado === 'PENDING' ? '' : 'PENDING'"
      >
        Pendientes ({{ pendientes.length }})
      </button>
      <button
        class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
        :class="selectedEstado === 'CONFIRMED' ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'"
        @click="selectedEstado = selectedEstado === 'CONFIRMED' ? '' : 'CONFIRMED'"
      >
        Confirmados ({{ confirmados.length }})
      </button>
    </div>

    <!-- Search + filters bar -->
    <div class="bg-white rounded-xl shadow-soft p-4 mb-5 space-y-3">
      <div class="flex gap-2">
        <div class="relative flex-1">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por clienta, servicio, profesional..."
            class="input pl-9 text-sm"
          />
          <button v-if="searchQuery" class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600" @click="searchQuery = ''">
            <X :size="14" />
          </button>
        </div>
        <button
          class="btn btn-sm"
          :class="showFilters ? 'btn-primary' : 'btn-outline'"
          @click="showFilters = !showFilters"
        >
          <Filter :size="16" /> Filtros
        </button>
        <button v-if="hasActiveFilters" class="btn btn-ghost btn-sm text-danger-600" @click="limpiarFiltros">
          <X :size="16" /> Limpiar
        </button>
      </div>

      <!-- Extended filters -->
      <div v-if="showFilters" class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-100">
        <div>
          <label class="label">Estado</label>
          <select v-model="selectedEstado" class="input">
            <option value="">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="DONE">Realizado</option>
            <option value="CANCELLED">Cancelado</option>
            <option value="ABSENT">Ausente</option>
          </select>
        </div>
        <div>
          <label class="label">Fecha desde</label>
          <input v-model="selectedFechaDesde" type="date" class="input" />
        </div>
        <div>
          <label class="label">Fecha hasta</label>
          <input v-model="selectedFechaHasta" type="date" class="input" />
        </div>
      </div>
    </div>

    <Loading v-if="loading" />

    <EmptyState
      v-else-if="turnos.length === 0"
      title="Sin turnos"
      :message="hasActiveFilters ? 'No hay turnos que coincidan con los filtros.' : 'Todavía no hay turnos registrados.'"
    />

    <!-- Table -->
    <div v-else class="bg-white rounded-xl shadow-soft overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Clienta</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Servicio</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Fecha</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Total</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Estado</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr
              v-for="t in paginatedTurnos"
              :key="t.id"
              class="hover:bg-neutral-50 transition-colors cursor-pointer"
              @click="openDetail(t)"
            >
              <td class="px-4 py-3">
                <p class="font-medium text-neutral-900">{{ t.cliente?.nombre }} {{ t.cliente?.apellido }}</p>
                <p class="text-xs text-neutral-400">{{ t.cliente?.telefono }}</p>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <p class="text-neutral-800">{{ t.servicio?.nombre }}</p>
                <p class="text-xs text-neutral-400">{{ t.servicio?.duracion }} min</p>
              </td>
              <td class="px-4 py-3">
                <p class="font-medium text-neutral-800">{{ formatFecha(t.fecha) }}</p>
                <p class="text-xs text-neutral-500">{{ t.horaInicio }}</p>
              </td>
              <td class="px-4 py-3 text-right hidden sm:table-cell">
                <p class="font-semibold text-neutral-900">{{ formatCurrency(t.precioTotalFinal) }}</p>
                <p v-if="t.senaCobrada" class="text-xs text-emerald-600">Seña ✓</p>
              </td>
              <td class="px-4 py-3">
                <TurnoStatusBadge :estado="t.estado" size="sm" />
              </td>
              <td class="px-4 py-3 text-right" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                    title="Ver detalle"
                    @click="openDetail(t)"
                  >
                    <Eye :size="15" />
                  </button>
                  <button
                    class="p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    title="Editar"
                    @click="openEdit(t)"
                  >
                    <Edit :size="15" />
                  </button>
                  <button
                    v-if="t.estado === 'PENDING'"
                    class="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Confirmar"
                    @click="handleCambiarEstado(t.id, 'CONFIRMED')"
                  >
                    <CheckCircle :size="15" />
                  </button>
                  <button
                    v-if="t.estado === 'CONFIRMED'"
                    class="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Completar"
                    @click="handleCambiarEstado(t.id, 'DONE')"
                  >
                    <Check :size="15" />
                  </button>
                  <button
                    v-if="['PENDING', 'CONFIRMED'].includes(t.estado)"
                    class="p-1.5 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                    title="Cancelar"
                    @click="handleCambiarEstado(t.id, 'CANCELLED')"
                  >
                    <XCircle :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-4 py-3 border-t border-neutral-100 flex items-center justify-between text-sm">
        <span class="text-neutral-500">
          Mostrando {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, turnos.length) }} de {{ turnos.length }}
        </span>
        <div class="flex items-center gap-1">
          <button
            :disabled="page <= 1"
            class="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-40 transition-colors"
            @click="page--"
          >
            <ChevronLeft :size="16" />
          </button>
          <span class="px-2 font-medium text-neutral-700">{{ page }} / {{ totalPages }}</span>
          <button
            :disabled="page >= totalPages"
            class="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-40 transition-colors"
            @click="page++"
          >
            <ChevronRight :size="16" />
          </button>
        </div>
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
      :servicios="servicios"
      :clientes="clientes"
      @save="handleSave"
    />
  </div>
</template>