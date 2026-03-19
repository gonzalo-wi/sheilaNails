import axios from 'axios'
import apiClient from '@/app/axios'
import { useClientAuthStore } from '@/modules/auth/store/clientAuth'
import type { AvailabilityResponse, AppointmentResponse, CreateAppointmentRequest } from '@/shared/types/api'
import type { Turno } from '@/shared/types'
import type { EstadoTurno } from '@/shared/types'

// Dedicated axios instance for client-role endpoints.
// Reads token from the Pinia store (in-memory) with localStorage as fallback,
// so it always uses the client token regardless of any admin session.
const CLIENT_TOKEN_KEY = 'cliente_token'
const clientApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})
clientApiClient.interceptors.request.use((config) => {
  // useClientAuthStore() is safe here: called at request time, Pinia is already active
  let token: string | null = null
  try {
    token = useClientAuthStore().token
  } catch {
    // Pinia not yet active (e.g. unit test env) — fall back to localStorage
  }
  if (!token) token = localStorage.getItem(CLIENT_TOKEN_KEY)
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
})

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
    senaCobrada: a.deposit_amount > 0,
  }
}

export const bookingApi = {
  /** GET /schedule/availability — public endpoint */
  async getAvailability(date: string, duration?: number): Promise<AvailabilityResponse> {
    const { data } = await apiClient.get<AvailabilityResponse>('/schedule/availability', {
      params: { date, ...(duration !== undefined && { duration }) },
    })
    return data
  },

  /** POST /appointments — requires client auth token */
  async createAppointment(payload: CreateAppointmentRequest): Promise<Turno> {
    const { data } = await clientApiClient.post<AppointmentResponse>('/appointments', payload)
    return mapAppointment(data)
  },

  /** GET /appointments/:id — requires client auth token */
  async getAppointmentById(id: number): Promise<Turno> {
    const { data } = await clientApiClient.get<AppointmentResponse>(`/appointments/${id}`)
    return mapAppointment(data)
  },

  /** GET /appointments — list client's own appointments */
  async getMyAppointments(status?: string): Promise<Turno[]> {
    const { data } = await clientApiClient.get<AppointmentResponse[]>('/appointments', {
      params: status ? { status } : undefined,
    })
    return data.map(mapAppointment)
  },

  /** PATCH /appointments/:id/cancel — client cancels own appointment */
  async cancelAppointment(id: number): Promise<Turno> {
    const { data } = await clientApiClient.patch<AppointmentResponse>(`/appointments/${id}/cancel`)
    return mapAppointment(data)
  },

  /** GET /appointments/next — next upcoming appointment for the logged-in client */
  async getNextAppointment(): Promise<Turno | null> {
    const { data } = await clientApiClient.get<{ next_appointment: AppointmentResponse | null }>('/appointments/next')
    return data.next_appointment ? mapAppointment(data.next_appointment) : null
  },
}

