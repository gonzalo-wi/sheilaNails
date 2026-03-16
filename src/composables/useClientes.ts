import { ref, computed } from 'vue'
import { clientesService } from '@/modules/admin/services/mockApiService'
import type { Cliente, ClienteFilters, Turno } from '@/shared/types'

export function useClientes() {
  const clientes = ref<Cliente[]>([])
  const historial = ref<Turno[]>([])
  const loading = ref(false)
  const loadingHistorial = ref(false)
  const error = ref<string | null>(null)
  const selectedCliente = ref<Cliente | null>(null)

  const filters = ref<ClienteFilters>({ busqueda: '', frecuente: undefined })

  // ── Computed ───────────────────────────────────────────────────────────────

  const frecuentes = computed(() => clientes.value.filter(c => c.esClienteFrecuente))

  const topPorGasto = computed(() =>
    [...clientes.value].sort((a, b) => (b.totalGastado ?? 0) - (a.totalGastado ?? 0)).slice(0, 5),
  )

  // ── Actions ────────────────────────────────────────────────────────────────

  async function fetchAll(customFilters?: ClienteFilters) {
    loading.value = true
    error.value = null
    try {
      clientes.value = await clientesService.getAll(customFilters ?? filters.value)
    } catch (e) {
      error.value = 'Error al cargar clientes'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number) {
    loading.value = true
    try {
      selectedCliente.value = await clientesService.getById(id)
    } finally {
      loading.value = false
    }
  }

  async function fetchHistorial(clienteId: number) {
    loadingHistorial.value = true
    try {
      historial.value = await clientesService.getTurnosCliente(clienteId)
    } finally {
      loadingHistorial.value = false
    }
  }

  async function createCliente(data: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cliente> {
    const nuevo = await clientesService.create(data)
    clientes.value.push(nuevo)
    return nuevo
  }

  async function updateCliente(id: number, patch: Partial<Cliente>): Promise<Cliente> {
    const updated = await clientesService.update(id, patch)
    const idx = clientes.value.findIndex(c => c.id === id)
    if (idx !== -1) clientes.value[idx] = updated
    if (selectedCliente.value?.id === id) selectedCliente.value = updated
    return updated
  }

  async function eliminarCliente(id: number): Promise<void> {
    await clientesService.delete(id)
    clientes.value = clientes.value.filter(c => c.id !== id)
    if (selectedCliente.value?.id === id) selectedCliente.value = null
  }

  function selectCliente(cliente: Cliente | null) {
    selectedCliente.value = cliente
    historial.value = []
  }

  return {
    // State
    clientes,
    historial,
    loading,
    loadingHistorial,
    error,
    selectedCliente,
    filters,
    // Computed
    frecuentes,
    topPorGasto,
    // Actions
    fetchAll,
    fetchById,
    fetchHistorial,
    createCliente,
    updateCliente,
    eliminarCliente,
    selectCliente,
  }
}
