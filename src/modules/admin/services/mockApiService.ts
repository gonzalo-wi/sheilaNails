/**
 * mockApiService.ts
 *
 * Fake async API that mirrors the real admin API contract.
 * All functions use the in-memory mock data and persist mutations
 * to localStorage so changes survive a page reload during development.
 *
 * When the real backend is ready, replace each function body with
 * the corresponding axios call from `@/modules/admin/api/index.ts`.
 */

import type {
  Turno,
  TurnoFilters,
  Cliente,
  ClienteFilters,
  Servicio,
  ServicioFilters,
  HorarioConfig,
  DashboardStats,
  FinanzasStats,
  EstadoTurno,
} from '@/shared/types'

import {
  mockTurnos,
  mockClientes,
  mockServicios,
  mockHorarios,
  mockDashboardStats,
  mockFinanzasStats,
} from '@/mocks'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DELAY = 250 // ms — simulates network latency

const delay = (ms = DELAY) => new Promise(resolve => setTimeout(resolve, ms))

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// ─── Turnos ──────────────────────────────────────────────────────────────────

const TURNOS_KEY = 'admin_turnos'

function getTurnosData(): Turno[] {
  return loadFromStorage<Turno>(TURNOS_KEY, mockTurnos)
}

export const turnosService = {
  async getAll(filters?: TurnoFilters): Promise<Turno[]> {
    await delay()
    let data = getTurnosData()

    if (filters?.busqueda) {
      const q = filters.busqueda.toLowerCase()
      data = data.filter(t =>
        t.cliente?.nombre?.toLowerCase().includes(q) ||
        t.cliente?.apellido?.toLowerCase().includes(q) ||
        t.cliente?.telefono?.includes(q) ||
        t.servicio?.nombre?.toLowerCase().includes(q),
      )
    }
    if (filters?.estado) data = data.filter(t => t.estado === filters.estado)
    if (filters?.profesionalId) data = data.filter(t => t.profesionalId === Number(filters.profesionalId))
    if (filters?.servicioId) data = data.filter(t => t.servicioId === Number(filters.servicioId))
    if (filters?.fechaDesde) data = data.filter(t => t.fecha >= filters.fechaDesde!)
    if (filters?.fechaHasta) data = data.filter(t => t.fecha <= filters.fechaHasta!)

    return [...data].sort((a, b) => `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`))
  },

  async getById(id: number): Promise<Turno | null> {
    await delay()
    return getTurnosData().find(t => t.id === id) ?? null
  },

  async create(data: Omit<Turno, 'id' | 'createdAt' | 'updatedAt'>): Promise<Turno> {
    await delay()
    const all = getTurnosData()
    const newId = Math.max(0, ...all.map(t => t.id)) + 1
    const turno: Turno = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveToStorage(TURNOS_KEY, [...all, turno])
    return turno
  },

  async update(id: number, patch: Partial<Turno>): Promise<Turno> {
    await delay()
    const all = getTurnosData()
    const idx = all.findIndex(t => t.id === id)
    if (idx === -1) throw new Error(`Turno ${id} no encontrado`)
    const updated = { ...all[idx]!, ...patch, updatedAt: new Date().toISOString() } as Turno
    all[idx] = updated
    return updated
  },

  async updateEstado(id: number, estado: EstadoTurno): Promise<Turno> {
    return turnosService.update(id, { estado })
  },

  async delete(id: number): Promise<void> {
    await delay()
    const all = getTurnosData().filter(t => t.id !== id)
    saveToStorage(TURNOS_KEY, all)
  },
}

// ─── Clientes ────────────────────────────────────────────────────────────────

const CLIENTES_KEY = 'admin_clientes'

function getClientesData(): Cliente[] {
  return loadFromStorage<Cliente>(CLIENTES_KEY, mockClientes)
}

export const clientesService = {
  async getAll(filters?: ClienteFilters): Promise<Cliente[]> {
    await delay()
    let data = getClientesData()

    if (filters?.busqueda) {
      const q = filters.busqueda.toLowerCase()
      data = data.filter(
        c =>
          c.nombre.toLowerCase().includes(q) ||
          c.apellido.toLowerCase().includes(q) ||
          c.telefono.includes(q) ||
          c.email?.toLowerCase().includes(q),
      )
    }
    if (filters?.frecuente) data = data.filter(c => c.esClienteFrecuente)

    return [...data].sort((a, b) => a.apellido.localeCompare(b.apellido))
  },

  async getById(id: number): Promise<Cliente | null> {
    await delay()
    return getClientesData().find(c => c.id === id) ?? null
  },

  async create(data: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cliente> {
    await delay()
    const all = getClientesData()
    const newId = Math.max(0, ...all.map(c => c.id)) + 1
    const cliente: Cliente = {
      ...data,
      id: newId,
      cantidadTurnos: 0,
      totalGastado: 0,
      esClienteFrecuente: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveToStorage(CLIENTES_KEY, [...all, cliente])
    return cliente
  },

  async update(id: number, patch: Partial<Cliente>): Promise<Cliente> {
    await delay()
    const all = getClientesData()
    const idx = all.findIndex(c => c.id === id)
    if (idx === -1) throw new Error(`Cliente ${id} no encontrado`)
    const updated = { ...all[idx]!, ...patch, updatedAt: new Date().toISOString() } as Cliente
    all[idx] = updated
    return updated
  },

  async delete(id: number): Promise<void> {
    await delay()
    saveToStorage(CLIENTES_KEY, getClientesData().filter(c => c.id !== id))
  },

  /** Devuelve el historial de turnos de una clienta */
  async getTurnosCliente(clienteId: number): Promise<Turno[]> {
    await delay()
    return getTurnosData()
      .filter(t => t.clienteId === clienteId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
  },
}

// ─── Servicios ───────────────────────────────────────────────────────────────

const SERVICIOS_KEY = 'admin_servicios'

function getServiciosData(): Servicio[] {
  return loadFromStorage<Servicio>(SERVICIOS_KEY, mockServicios)
}

export const serviciosService = {
  async getAll(filters?: ServicioFilters): Promise<Servicio[]> {
    await delay()
    let data = getServiciosData()

    if (filters?.busqueda) {
      const q = filters.busqueda.toLowerCase()
      data = data.filter(
        s => s.nombre.toLowerCase().includes(q) || s.descripcion.toLowerCase().includes(q),
      )
    }
    if (filters?.categoria) data = data.filter(s => s.categoria === filters.categoria)
    if (filters?.activo !== undefined) data = data.filter(s => s.activo === filters.activo)

    return data
  },

  async getById(id: number): Promise<Servicio | null> {
    await delay()
    return getServiciosData().find(s => s.id === id) ?? null
  },

  async create(data: Omit<Servicio, 'id' | 'createdAt' | 'updatedAt'>): Promise<Servicio> {
    await delay()
    const all = getServiciosData()
    const newId = Math.max(0, ...all.map(s => s.id)) + 1
    const servicio: Servicio = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveToStorage(SERVICIOS_KEY, [...all, servicio])
    return servicio
  },

  async update(id: number, patch: Partial<Servicio>): Promise<Servicio> {
    await delay()
    const all = getServiciosData()
    const idx = all.findIndex(s => s.id === id)
    if (idx === -1) throw new Error(`Servicio ${id} no encontrado`)
    const updated = { ...all[idx]!, ...patch, updatedAt: new Date().toISOString() } as Servicio
    all[idx] = updated
    return updated
  },

  async delete(id: number): Promise<void> {
    await delay()
    saveToStorage(SERVICIOS_KEY, getServiciosData().filter(s => s.id !== id))
  },

  /** Activa / desactiva sin borrar */
  async toggleActivo(id: number): Promise<Servicio> {
    const s = getServiciosData().find(sv => sv.id === id)
    if (!s) throw new Error(`Servicio ${id} no encontrado`)
    return serviciosService.update(id, { activo: !s.activo })
  },
}

// ─── Horarios ────────────────────────────────────────────────────────────────

const HORARIOS_KEY = 'admin_horarios'

function getHorariosData(): HorarioConfig[] {
  return loadFromStorage<HorarioConfig>(HORARIOS_KEY, mockHorarios)
}

export const horariosService = {
  async getAll(): Promise<HorarioConfig[]> {
    await delay()
    return getHorariosData()
  },

  async update(dia: number, patch: Partial<HorarioConfig>): Promise<HorarioConfig> {
    await delay()
    const all = getHorariosData()
    const idx = all.findIndex(h => h.dia === dia)
    if (idx === -1) throw new Error(`Horario para día ${dia} no encontrado`)
    const updated = { ...all[idx]!, ...patch } as HorarioConfig
    all[idx] = updated
    return updated
  },

  async resetToDefaults(): Promise<HorarioConfig[]> {
    await delay()
    saveToStorage(HORARIOS_KEY, mockHorarios)
    return mockHorarios
  },
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    await delay()
    // Inject live turnos into proximosTurnos
    const turnosHoy = getTurnosData()
      .filter(t => t.fecha === '2026-03-15')
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    return { ...mockDashboardStats, proximosTurnos: turnosHoy }
  },

  async getFinanzasStats(): Promise<FinanzasStats> {
    await delay()
    return mockFinanzasStats
  },
}
