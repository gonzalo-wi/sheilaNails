<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useClientes } from '@/composables/useClientes'
import Loading from '@/shared/components/common/Loading.vue'
import EmptyState from '@/shared/components/common/EmptyState.vue'
import ClienteDetailsDrawer from '../components/ClienteDetailsDrawer.vue'
import { Search, X, Star, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { Cliente } from '@/shared/types'

const {
  clientes, historial, loading, loadingHistorial,
  selectedCliente, frecuentes,
  fetchAll, fetchHistorial, selectCliente
} = useClientes()

const searchQuery = ref('')
const showSoloFrecuentes = ref(false)
const showDrawer = ref(false)
const page = ref(1)
const perPage = 20

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { fetchAll(); page.value = 1 }, 350)
})

const filtered = computed(() => {
  let list = clientes.value
  if (showSoloFrecuentes.value) {
    list = list.filter(c => c.esClienteFrecuente)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c =>
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(q) ||
      c.telefono.includes(q) ||
      c.email?.toLowerCase().includes(q)
    )
  }
  return list
})

const paginated = computed(() => {
  const start = (page.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.ceil(filtered.value.length / perPage))

function formatFecha(fecha?: string) {
  if (!fecha) return '—'
  try { return format(parseISO(fecha), "dd MMM yyyy", { locale: es }) } catch { return fecha }
}

function getInitials(c: Cliente) {
  return `${c.nombre.charAt(0)}${c.apellido.charAt(0)}`.toUpperCase()
}

async function openDetail(c: Cliente) {
  selectCliente(c)
  showDrawer.value = true
  await fetchHistorial(c.id)
}

onMounted(() => fetchAll())
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-neutral-900">Clientas</h1>
        <p class="text-neutral-500 text-sm mt-0.5">Base de datos de clientas · {{ clientes.length }} registradas</p>
      </div>
      <div class="flex gap-2">
        <button
          class="btn btn-sm"
          :class="showSoloFrecuentes ? 'btn-primary' : 'btn-outline'"
          @click="showSoloFrecuentes = !showSoloFrecuentes"
        >
          <Star :size="14" /> Frecuentes ({{ frecuentes.length }})
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="bg-white rounded-xl shadow-soft p-4 mb-5 flex gap-3">
      <div class="relative flex-1">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input v-model="searchQuery" type="text" placeholder="Buscar por nombre, teléfono o email..." class="input pl-9 text-sm" />
        <button v-if="searchQuery" class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" @click="searchQuery = ''">
          <X :size="14" />
        </button>
      </div>
    </div>

    <Loading v-if="loading" />

    <EmptyState
      v-else-if="filtered.length === 0"
      title="Sin clientas"
      message="No se encontraron clientas con los filtros aplicados."
    />

    <!-- Table -->
    <div v-else class="bg-white rounded-xl shadow-soft overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Clienta</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Contacto</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">Turnos</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">Gastado</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wide">VIP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr
              v-for="c in paginated"
              :key="c.id"
              class="hover:bg-neutral-50 transition-colors cursor-pointer"
              @click="openDetail(c)"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-bold text-primary-700">{{ getInitials(c) }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-neutral-900">{{ c.nombre }} {{ c.apellido }}</p>
                    <p class="text-xs text-neutral-400 sm:hidden">{{ c.telefono }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <p class="text-neutral-700 flex items-center gap-1.5">
                  <Phone :size="12" class="text-neutral-400" /> {{ c.telefono }}
                </p>
                <p v-if="c.email" class="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                  <Mail :size="12" /> {{ c.email }}
                </p>
              </td>
              <td class="px-4 py-3 text-right hidden md:table-cell font-semibold text-neutral-800">
                {{ c.cantidadTurnos }}
              </td>
              <td class="px-4 py-3 text-right hidden md:table-cell font-semibold text-primary-700">
                ${{ (c.totalGastado || 0).toLocaleString('es-AR') }}
              </td>
              <td class="px-4 py-3 text-center">
                <Star v-if="c.esClienteFrecuente" :size="16" class="text-amber-400 fill-amber-400 mx-auto" />
                <span v-else class="text-neutral-200">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-4 py-3 border-t border-neutral-100 flex items-center justify-between text-sm">
        <span class="text-neutral-500">{{ filtered.length }} clientas</span>
        <div class="flex items-center gap-1">
          <button :disabled="page <= 1" class="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-40" @click="page--">
            <ChevronLeft :size="16" />
          </button>
          <span class="px-2 font-medium text-neutral-700">{{ page }} / {{ totalPages }}</span>
          <button :disabled="page >= totalPages" class="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-40" @click="page++">
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Drawer -->
    <ClienteDetailsDrawer
      v-model="showDrawer"
      :cliente="selectedCliente"
      :historial="historial"
      :loading-historial="loadingHistorial"
      @load-historial="fetchHistorial"
    />
  </div>
</template>
