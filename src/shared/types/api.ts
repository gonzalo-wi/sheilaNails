/**
 * Raw API response / request DTOs — match backend contract exactly.
 * Do NOT import UI domain types here; let the service layer do the mapping.
 */

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminLoginResponse {
  token: string
  admin_id: number
}

export interface ClientLoginRequest {
  email: string
  password: string
}

export interface ClientRegisterRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  password: string
}

export interface ClientAuthResponse {
  token: string
  client_id: number
}

// ─── Services ────────────────────────────────────────────────────────────────

export interface ServiceResponse {
  id: number
  name: string
  description: string
  duration_minutes: number
  base_price: number
  requires_deposit: boolean
  suggested_deposit: number | null
  color: string | null
  active: boolean
}

export interface CreateServiceRequest {
  name: string
  description?: string
  duration_minutes: number
  base_price: number
  requires_deposit?: boolean
  suggested_deposit?: number
  color?: string
}

export type UpdateServiceRequest = Partial<CreateServiceRequest>

// ─── Clients ─────────────────────────────────────────────────────────────────

export interface ClientResponse {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  active: boolean
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED' | 'ABSENT'

export interface AppointmentResponse {
  id: number
  client_id: number
  service_id: number
  professional_id: number | null
  date: string           // "YYYY-MM-DD"
  start_time: string     // "HH:MM"
  end_time: string       // "HH:MM"
  base_price: number
  extras_amount: number
  deposit_amount: number
  final_price: number
  status: AppointmentStatus
  notes: string | null
  extras_note: string | null
}

export interface CreateAppointmentRequest {
  client_id: number
  service_id: number
  professional_id?: number
  date: string
  start_time: string
  notes?: string
}

export interface FinalPriceRequest {
  extras_amount: number
  extras_note?: string
}

export interface DepositRequest {
  deposit_amount: number
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export interface WeeklyScheduleResponse {
  id: number
  day_of_week: number    // 0=Sun … 6=Sat
  day_name: string
  enabled: boolean
  opening_time: string   // "HH:MM"
  closing_time: string   // "HH:MM"
  slot_duration_min: number
}

export interface WeeklyScheduleUpdateItem {
  day_of_week: number
  enabled: boolean
  opening_time: string
  closing_time: string
  slot_duration_min: number
}

export interface BlockedSlotResponse {
  id: number
  date: string
  start_time: string
  end_time: string
  reason: string | null
  permanent: boolean
}

export interface CreateBlockedSlotRequest {
  date: string
  start_time: string
  end_time: string
  reason?: string
  permanent?: boolean
}

export interface AvailabilityResponse {
  date: string
  opening_time: string
  closing_time: string
  available_slots: { start_time: string; end_time: string }[]
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardMetricsResponse {
  today_appointments: number
  week_appointments: number
  today_revenue: number
  month_revenue: number
  appointments_by_status: Record<string, number>
  total_deposits: number
}
