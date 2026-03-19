import { format, subDays } from 'date-fns'
import apiClient from '@/app/axios'
import type {
  AppointmentResponse,
  ServiceResponse,
  WeeklyScheduleResponse,
  BlockedSlotResponse,
  AvailabilityResponse,
  DashboardMetricsResponse,
  CreateAppointmentRequest,
  FinalPriceRequest,
  DepositRequest,
  WeeklyScheduleUpdateItem,
  CreateBlockedSlotRequest,
  ClientResponse,
} from '@/shared/types/api'
import type {
  Turno,
  TurnoFilters,
  Servicio,
  HorarioConfig,
  EstadoTurno,
  DashboardStats,
  TurnosPorEstado,
  IngresoDiario,
  TopClienta,
  Cliente,
} from '@/shared/types'

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapCliente(c: ClientResponse): Cliente {
  return {
    id: c.id,
    nombre: c.first_name,
    apellido: c.last_name,
    email: c.email,
    telefono: c.phone,
    activo: c.active,
    cantidadTurnos: c.appointment_count ?? 0,
    totalGastado: c.total_spent ?? 0,
    esClienteFrecuente: (c.appointment_count ?? 0) >= 3,
  }
}

function mapAppointment(a: AppointmentResponse): Turno {
  return {
    id: a.id,
    clienteId: a.client_id,
    servicioId: a.service_id,
    profesionalId: a.professional_id ?? 0,
    fecha: a.date,
    horaInicio: a.start_time,
    horaFin: a.end_time,
    estado: a.status as EstadoTurno,
    precioBase: a.base_price,
    precioExtras: a.extras_amount,
    montoSena: a.deposit_amount,
    precioTotalFinal: a.final_price,
    extras: [],
    notas: a.notes ?? undefined,
    extrasNota: a.extras_note ?? undefined,
    senaCobrada: a.deposit_amount > 0,
  }
}

function mapService(s: ServiceResponse): Servicio {
  return {
    id: s.id,
    nombre: s.name,
    descripcion: s.description ?? '',
    duracion: s.duration_minutes,
    precio: s.base_price,
    precioSena: s.suggested_deposit ?? undefined,
    requiereSena: s.requires_deposit,
    color: s.color ?? undefined,
    activo: s.active,
  }
}

function mapWeeklySchedule(w: WeeklyScheduleResponse): HorarioConfig {
  return {
    id: w.id,
    dia: w.day_of_week,
    diaNombre: w.day_name,
    activo: w.enabled,
    horaApertura: w.opening_time,
    horaCierre: w.closing_time,
    duracionTurno: w.slot_duration_min,
    franjas: [],
    bloqueos: [],
  }
}

function mapServicioToPayload(s: Partial<Servicio>): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  if (s.nombre !== undefined) payload.name = s.nombre
  if (s.descripcion !== undefined) payload.description = s.descripcion
  if (s.duracion !== undefined) payload.duration_minutes = s.duracion
  if (s.precio !== undefined) payload.base_price = s.precio
  if (s.requiereSena !== undefined) payload.requires_deposit = s.requiereSena
  if (s.precioSena !== undefined) payload.suggested_deposit = s.precioSena
  if (s.color !== undefined) payload.color = s.color
  return payload
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   '#F59E0B',
  CONFIRMED: '#10B981',
  DONE:      '#3B82F6',
  CANCELLED: '#EF4444',
  ABSENT:    '#9CA3AF',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING:   'Pendiente',
  CONFIRMED: 'Confirmado',
  DONE:      'Realizado',
  CANCELLED: 'Cancelado',
  ABSENT:    'Ausente',
}

// ─── Appointments (Admin) ─────────────────────────────────────────────────────

/** Fetch all services + all clients and return lookup Maps for enriching appointments. */
async function fetchLookupMaps() {
  const [servicesData, clientsData] = await Promise.all([
    apiClient.get<ServiceResponse[]>('/services').then(r => r.data).catch(() => [] as ServiceResponse[]),
    apiClient.get<ClientResponse[]>('/clients').then(r => r.data).catch(() => [] as ClientResponse[]),
  ])
  return {
    serviceMap: new Map(servicesData.map(s => [s.id, mapService(s)])),
    clientMap: new Map(clientsData.map(c => [c.id, mapCliente(c)])),
  }
}

export const appointmentsApi = {
  async getAll(filters?: TurnoFilters): Promise<Turno[]> {
    const params: Record<string, string | number> = {}
    if (filters?.estado) params.status = filters.estado
    if (filters?.clienteId) params.client_id = filters.clienteId
    if (filters?.fechaDesde) params.date_from = filters.fechaDesde
    if (filters?.fechaHasta) params.date_to = filters.fechaHasta

    const [appointmentsData, { serviceMap, clientMap }] = await Promise.all([
      apiClient.get<AppointmentResponse[]>('/appointments', { params }).then(r => r.data),
      fetchLookupMaps(),
    ])
    return appointmentsData.map(a => ({
      ...mapAppointment(a),
      cliente: clientMap.get(a.client_id),
      servicio: serviceMap.get(a.service_id),
    }))
  },

  async getCalendar(from: string, to: string): Promise<Turno[]> {
    const [appointmentsData, { serviceMap, clientMap }] = await Promise.all([
      apiClient.get<AppointmentResponse[]>('/appointments/calendar', { params: { from, to } }).then(r => r.data),
      fetchLookupMaps(),
    ])
    return appointmentsData.map(a => ({
      ...mapAppointment(a),
      cliente: clientMap.get(a.client_id),
      servicio: serviceMap.get(a.service_id),
    }))
  },

  async getById(id: number): Promise<Turno> {
    const { data } = await apiClient.get<AppointmentResponse>(`/appointments/${id}`)
    const [svc, cliente] = await Promise.all([
      apiClient.get<ServiceResponse>(`/services/${data.service_id}`).then(r => mapService(r.data)).catch(() => undefined),
      apiClient.get<ClientResponse>(`/clients/${data.client_id}`).then(r => mapCliente(r.data)).catch(() => undefined),
    ])
    return { ...mapAppointment(data), servicio: svc, cliente }
  },

  async create(payload: CreateAppointmentRequest): Promise<Turno> {
    const { data } = await apiClient.post<AppointmentResponse>('/appointments', payload)
    return mapAppointment(data)
  },

  async confirm(id: number): Promise<Turno> {
    const { data } = await apiClient.patch<AppointmentResponse>(`/appointments/${id}/confirm`)
    return mapAppointment(data)
  },

  async cancel(id: number): Promise<Turno> {
    const { data } = await apiClient.patch<AppointmentResponse>(`/appointments/${id}/cancel`)
    return mapAppointment(data)
  },

  async complete(id: number): Promise<Turno> {
    const { data } = await apiClient.patch<AppointmentResponse>(`/appointments/${id}/complete`)
    return mapAppointment(data)
  },

  async updateFinalPrice(id: number, payload: FinalPriceRequest): Promise<Turno> {
    const { data } = await apiClient.patch<AppointmentResponse>(
      `/appointments/${id}/final-price`,
      payload,
    )
    return mapAppointment(data)
  },

  async registerDeposit(id: number, payload: DepositRequest): Promise<Turno> {
    const { data } = await apiClient.patch<AppointmentResponse>(
      `/appointments/${id}/deposit`,
      payload,
    )
    return mapAppointment(data)
  },
}

const PUBLIC_SERVICES_CACHE_KEY = 'public_services_cache'

// ─── Services (Admin) ─────────────────────────────────────────────────────────

export const serviciosApi = {
  async getAll(activeOnly = true): Promise<Servicio[]> {
    const params = activeOnly ? undefined : { active: 'false' }
    const { data } = await apiClient.get<ServiceResponse[]>('/services', { params })
    const mapped = data.map(mapService)
    // Cache active services for public pages (no auth required fallback)
    if (activeOnly) {
      try { localStorage.setItem(PUBLIC_SERVICES_CACHE_KEY, JSON.stringify(mapped)) } catch {}
    }
    return mapped
  },

  /** Used by public/booking pages — falls back to localStorage cache on auth error */
  async getAllPublic(): Promise<Servicio[]> {
    try {
      return await serviciosApi.getAll(true)
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } }).response?.status
      if (status === 401 || status === 403) {
        const cached = localStorage.getItem(PUBLIC_SERVICES_CACHE_KEY)
        if (cached) return JSON.parse(cached) as Servicio[]
      }
      throw e
    }
  },

  async getById(id: number): Promise<Servicio> {
    const { data } = await apiClient.get<ServiceResponse>(`/services/${id}`)
    return mapService(data)
  },

  async create(servicio: Omit<Servicio, 'id' | 'createdAt' | 'updatedAt'>): Promise<Servicio> {
    const payload = {
      name: servicio.nombre,
      description: servicio.descripcion,
      duration_minutes: servicio.duracion,
      base_price: servicio.precio,
      requires_deposit: servicio.requiereSena,
      suggested_deposit: servicio.precioSena,
      color: servicio.color,
    }
    const { data } = await apiClient.post<ServiceResponse>('/services', payload)
    return mapService(data)
  },

  async update(id: number, patch: Partial<Servicio>): Promise<Servicio> {
    const { data } = await apiClient.patch<ServiceResponse>(
      `/services/${id}`,
      mapServicioToPayload(patch),
    )
    return mapService(data)
  },

  async toggle(id: number): Promise<Servicio> {
    const { data } = await apiClient.patch<ServiceResponse>(`/services/${id}/toggle`)
    return mapService(data)
  },
}

// ─── Schedule (Admin) ─────────────────────────────────────────────────────────

export const horariosApi = {
  async getWeekly(): Promise<HorarioConfig[]> {
    const { data } = await apiClient.get<WeeklyScheduleResponse[]>('/schedule/weekly')
    return data.map(mapWeeklySchedule)
  },

  async saveWeekly(schedule: WeeklyScheduleUpdateItem[]): Promise<HorarioConfig[]> {
    const { data } = await apiClient.put<WeeklyScheduleResponse[]>('/schedule/weekly', {
      schedule,
    })
    return data.map(mapWeeklySchedule)
  },

  async createBlockedSlot(payload: CreateBlockedSlotRequest): Promise<BlockedSlotResponse> {
    const { data } = await apiClient.post<BlockedSlotResponse>(
      '/schedule/blocked-slots',
      payload,
    )
    return data
  },

  async getAvailability(date: string, duration?: number): Promise<AvailabilityResponse> {
    const { data } = await apiClient.get<AvailabilityResponse>('/schedule/availability', {
      params: { date, ...(duration !== undefined && { duration }) },
    })
    return data
  },
}

// ─── Dashboard (Admin) ────────────────────────────────────────────────────────

export const dashboardApi = {
  async getMetrics(): Promise<DashboardStats> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')

    const [{ data }, appointmentsRaw, { serviceMap, clientMap }] = await Promise.all([
      apiClient.get<DashboardMetricsResponse>('/dashboard/metrics'),
      apiClient.get<AppointmentResponse[]>('/appointments', {
        params: { date_from: sevenDaysAgo, date_to: today },
      }).then(r => r.data).catch(() => [] as AppointmentResponse[]),
      fetchLookupMaps(),
    ])

    const byStatus: Record<string, number> = {
      CONFIRMED: data.month.confirmed,
      PENDING:   data.month.pending,
      CANCELLED: data.month.cancelled,
      DONE:      data.month.completed,
    }
    const totalByStatus = data.month.total || 1

    const turnosPorEstado: TurnosPorEstado[] = Object.entries(byStatus)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([status, count]) => ({
        estado: status,
        etiqueta: STATUS_LABELS[status] ?? status,
        cantidad: count,
        porcentaje: Math.round((count / totalByStatus) * 100),
        color: STATUS_COLORS[status] ?? '#9CA3AF',
      }))

    // ── ingresosUltimos7Dias ─────────────────────────────────────────────
    const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const dayBuckets = new Map<string, { ingresos: number; turnos: number }>()
    for (let i = 6; i >= 0; i--)
      dayBuckets.set(format(subDays(new Date(), i), 'yyyy-MM-dd'), { ingresos: 0, turnos: 0 })

    for (const a of appointmentsRaw) {
      if (dayBuckets.has(a.date) && a.status === 'DONE') {
        const b = dayBuckets.get(a.date)!
        b.ingresos += a.final_price
        b.turnos += 1
      }
    }
    // Use accurate API revenue for today
    if (dayBuckets.has(today)) dayBuckets.get(today)!.ingresos = data.today.revenue

    const ingresosUltimos7Dias: IngresoDiario[] = Array.from(dayBuckets.entries()).map(
      ([fecha, v]) => {
        const esHoy = fecha === today
        const d = new Date(fecha + 'T12:00:00')
        return { fecha, etiqueta: esHoy ? 'Hoy' : (DAYS[d.getDay()] ?? fecha.slice(8)), ingresos: v.ingresos, turnos: v.turnos, esHoy }
      },
    )

    // ── turnosPorServicio ────────────────────────────────────────────────
    const svcBuckets = new Map<number, { nombre: string; cantidad: number; ingresos: number }>()
    for (const a of appointmentsRaw) {
      const nombre = serviceMap.get(a.service_id)?.nombre ?? `Servicio #${a.service_id}`
      if (!svcBuckets.has(a.service_id)) svcBuckets.set(a.service_id, { nombre, cantidad: 0, ingresos: 0 })
      const b = svcBuckets.get(a.service_id)!
      b.cantidad += 1
      b.ingresos += a.final_price
    }
    const turnosPorServicio = Array.from(svcBuckets.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .map(v => ({ servicio: v.nombre, cantidad: v.cantidad, ingresos: v.ingresos }))

    // ── topClientas ──────────────────────────────────────────────────────
    const clientBuckets = new Map<number, TopClienta>()
    for (const a of appointmentsRaw) {
      const cli = clientMap.get(a.client_id)
      if (!clientBuckets.has(a.client_id))
        clientBuckets.set(a.client_id, {
          id: a.client_id,
          nombre: cli?.nombre ?? 'Cliente',
          apellido: cli?.apellido ?? '',
          cantidadTurnos: 0,
          totalGastado: 0,
        })
      const b = clientBuckets.get(a.client_id)!
      b.cantidadTurnos += 1
      b.totalGastado += a.final_price
    }
    const topClientas = Array.from(clientBuckets.values())
      .sort((a, b) => b.totalGastado - a.totalGastado)
      .slice(0, 5)

    // ── proximosTurnos (hoy pendientes/confirmados) ───────────────────────
    const proximosTurnos = appointmentsRaw
      .filter(a => a.date === today && ['PENDING', 'CONFIRMED'].includes(a.status))
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .slice(0, 8)
      .map(a => ({ ...mapAppointment(a), cliente: clientMap.get(a.client_id), servicio: serviceMap.get(a.service_id) }))

    // ── ocupacionPorHorario ───────────────────────────────────────────────
    const hourBuckets = new Map<string, number>()
    for (const a of appointmentsRaw) {
      const h = a.start_time.substring(0, 5)
      hourBuckets.set(h, (hourBuckets.get(h) ?? 0) + 1)
    }
    const maxHour = Math.max(...Array.from(hourBuckets.values()), 1)
    const ocupacionPorHorario = Array.from(hourBuckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hora, count]) => ({ hora, ocupacion: Math.round((count / maxHour) * 100) }))

    return {
      turnosHoy: data.today.total,
      ingresosDia: data.today.revenue,
      senasCobradas: data.today.deposits,
      turnosConfirmadosHoy: data.today.confirmed,
      turnosPendientesHoy: data.today.pending,
      turnosCanceladosHoy: data.today.cancelled,
      turnosRealizadosHoy: data.today.completed,

      turnosSemana: data.week.total,
      ingresosSemana: data.week.revenue,
      turnosMes: data.month.total,
      ingresosMes: data.month.revenue,

      ticketPromedio: data.month.completed > 0
        ? Math.round(data.month.revenue / data.month.completed)
        : 0,
      tasaOcupacion: 0,
      tasaCancelacion: data.month.total > 0
        ? Math.round((data.month.cancelled / data.month.total) * 100)
        : 0,
      clientesNuevos: 0,

      periodos: {
        today: data.today,
        week:  data.week,
        month: data.month,
        year:  data.year,
      },


      ingresosUltimos7Dias,
      turnosPorEstado,
      turnosPorServicio,
      ocupacionPorHorario,
      proximosTurnos,
      topClientas,
    }
  },
}

// ─── Clients (Admin) ─────────────────────────────────────────────────────────

export const clientesApi = {
  async getAll(): Promise<Cliente[]> {
    const { data } = await apiClient.get<ClientResponse[]>('/clients')
    return data.map(mapCliente)
  },

  async getById(id: number): Promise<Cliente> {
    const { data } = await apiClient.get<ClientResponse>(`/clients/${id}`)
    return mapCliente(data)
  },
}

