import { ref, computed } from 'vue'
import { appointmentsApi, clientesApi } from '@/modules/admin/api'
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
      let data = await clientesApi.getAll()
      const q = (customFilters ?? filters.value).busqueda?.toLowerCase()
      if (q) {
        data = data.filter(
          c =>
            c.nombre.toLowerCase().includes(q) ||
            c.apellido.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.telefono?.includes(q),
        )
      }
      clientes.value = [...data].sort((a, b) => a.apellido.localeCompare(b.apellido))
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
      selectedCliente.value = await clientesApi.getById(id)
    } catch {
      selectedCliente.value = null
    } finally {
      loading.value = false
    }
  }

  /** Fetches the client's appointment history from the real API */
  async function fetchHistorial(clienteId: number) {
    loadingHistorial.value = true
    try {
      historial.value = await appointmentsApi.getAll({ clienteId })
    } catch {
      historial.value = []
    } finally {
      loadingHistorial.value = false
    }
  }

  async function createCliente(data: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cliente> {
    // No POST /clients endpoint — clients are created via registration
    throw new Error('La creación de clientes se realiza por el flujo de registro.')
    return data as Cliente
  }

  async function updateCliente(id: number, patch: Partial<Cliente>): Promise<Cliente> {
    const idx = clientes.value.findIndex(c => c.id === id)
    if (idx !== -1) clientes.value[idx] = { ...clientes.value[idx]!, ...patch }
    if (selectedCliente.value?.id === id) selectedCliente.value = clientes.value[idx] ?? null
    return clientes.value[idx]!
  }

  async function eliminarCliente(id: number): Promise<void> {
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
