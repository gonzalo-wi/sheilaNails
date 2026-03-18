// ─── Core API shapes ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── Enums ──────────────────────────────────────────────────────────────────

// Values match the backend API: PENDING | CONFIRMED | DONE | CANCELLED | ABSENT
export type EstadoTurno = 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED' | 'ABSENT'

// ─── Entities ───────────────────────────────────────────────────────────────

export interface Servicio {
  id: number
  nombre: string
  descripcion: string
  duracion: number          // en minutos
  precio: number            // precio base
  precioSena?: number       // monto sugerido de seña
  requiereSena: boolean
  color?: string            // hex color for visual label
  imagen?: string
  activo: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Profesional {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  foto?: string
  especialidades: string[]
  activo: boolean
  horarios?: HorarioTrabajo[]
  createdAt?: string
  updatedAt?: string
}

export interface HorarioTrabajo {
  dia: number       // 0-6 (domingo-sábado)
  horaInicio: string  // "09:00"
  horaFin: string     // "18:00"
  activo: boolean
}

export interface Cliente {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  fechaNacimiento?: string
  notas?: string
  // Computed / denormalized for admin display
  cantidadTurnos?: number
  totalGastado?: number
  ultimoTurno?: string
  esClienteFrecuente?: boolean
  createdAt?: string
  updatedAt?: string
}

/** Un extra o decoración que se puede agregar a un turno */
export interface TurnoExtra {
  id: number
  nombre: string
  precio: number
}

/** Turno extendido con campos admin (seña, extras, totales editables) */
export interface Turno {
  id: number
  servicioId: number
  servicio?: Servicio
  profesionalId: number
  profesional?: Profesional
  clienteId: number
  cliente?: Cliente
  fecha: string       // "2026-03-15"
  horaInicio: string  // "10:00"
  horaFin: string     // "11:30"
  estado: EstadoTurno
  notas?: string
  observacionesAdmin?: string

  // Pricing breakdown (admin-managed)
  precioBase: number         // service base price
  extras: TurnoExtra[]       // additional decorations/add-ons
  precioExtras: number       // sum of extras  (sent as extras_amount)
  extrasNota?: string        // extras_note: description of extras
  precioTotalFinal: number   // final_price returned by backend

  // Seña (deposit)
  montoSena: number
  senaCobrada: boolean

  createdAt?: string
  updatedAt?: string
}

// ─── Horarios Admin ─────────────────────────────────────────────────────────

/** Franja horaria dentro de un día de trabajo */
export interface FranjaHoraria {
  hora: string        // "09:00"
  disponible: boolean
}

/** Bloqueo manual (almuerzo, feriado, capacitación, etc.) */
export interface BloqueoHorario {
  id: number
  fecha?: string      // null = aplica todos los días de ese tipo
  horaInicio: string
  horaFin: string
  motivo: string
  tipo: 'ALMUERZO' | 'FERIADO' | 'CAPACITACION' | 'OTRO'
}

/** Configuración de horarios por día de la semana */
export interface HorarioConfig {
  id?: number
  dia: number         // 0=Domingo, 1=Lunes … 6=Sábado
  diaNombre: string
  activo: boolean
  horaApertura: string
  horaCierre: string
  duracionTurno: number   // minutos por turno
  franjas: FranjaHoraria[]
  bloqueos: BloqueoHorario[]
}

// ─── Dashboard Stats (extended) ─────────────────────────────────────────────

export interface DashboardStats {
  // Hoy
  turnosHoy: number
  ingresosDia: number
  senasCobradas: number
  turnosConfirmadosHoy: number
  turnosPendientesHoy: number
  turnosCanceladosHoy: number
  turnosRealizadosHoy: number

  // Semana / Mes
  turnosSemana: number
  ingresosSemana: number
  turnosMes: number
  ingresosMes: number

  // Ratios
  ticketPromedio: number
  tasaOcupacion: number
  tasaCancelacion: number
  clientesNuevos: number

  // Charts
  ingresosUltimos7Dias: IngresoDiario[]
  turnosPorEstado: TurnosPorEstado[]
  turnosPorServicio: TurnosPorServicio[]
  ocupacionPorHorario: OcupacionHorario[]

  // Quick lists
  proximosTurnos: Turno[]
  topClientas: TopClienta[]
}

export interface IngresoDiario {
  fecha: string
  etiqueta: string  // "Lun", "Mar", etc.
  ingresos: number
  turnos: number
  esHoy?: boolean
}

export interface TurnosPorEstado {
  estado: string
  etiqueta: string
  cantidad: number
  porcentaje: number
  color: string
}

export interface TurnosPorServicio {
  servicio: string
  cantidad: number
  ingresos: number
}

export interface OcupacionHorario {
  hora: string
  ocupacion: number   // percentage 0-100
}

export interface TopClienta {
  id: number
  nombre: string
  apellido: string
  cantidadTurnos: number
  totalGastado: number
}

// ─── Finanzas ───────────────────────────────────────────────────────────────

export interface FinanzasPeriodo {
  ingresos: number
  senas: number
  cancelaciones: number
  turnos: number
  ticketPromedio: number
}

export interface FinanzasStats {
  hoy: FinanzasPeriodo
  semana: FinanzasPeriodo
  mes: FinanzasPeriodo
  mesAnterior: FinanzasPeriodo
  anio: FinanzasPeriodo

  ingresosPorDia: IngresoDiario[]
  ingresosPorMes: IngresoMensual[]
  ingresosPorServicio: IngresoServicio[]
  ingresosPorProfesional: IngresoProfesional[]
}

export interface IngresoMensual {
  mes: string     // "Ene", "Feb", etc.
  etiqueta?: string
  anio: number
  ingresos: number
  turnos: number
  esActual?: boolean
}

export interface IngresoServicio {
  servicio: string
  ingresos: number
  cantidad: number
  ticket: number
}

export interface IngresoProfesional {
  nombre: string
  ingresos: number
  turnos: number
}

// ─── Auth ────────────────────────────────────────────────────────────────────

/** Admin login credentials */
export interface LoginCredentials {
  email: string
  password: string
}

/** Response from POST /auth/admin/login */
export interface AdminAuthResponse {
  token: string
  admin_id: number
}

// Kept for backward compatibility with any remaining usages
export interface AuthResponse {
  token: string
  admin_id: number
}

// ─── Booking Flow ────────────────────────────────────────────────────────────

export interface BookingState {
  step: number
  servicio?: Servicio
  profesional?: Profesional
  fecha?: string
  hora?: string
  cliente: {
    nombre: string
    apellido: string
    email: string
    telefono: string
  }
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface TurnoFilters {
  fechaDesde?: string
  fechaHasta?: string
  estado?: EstadoTurno | ''
  profesionalId?: number | ''
  servicioId?: number | ''
  clienteId?: number
  busqueda?: string
}

export interface ClienteFilters {
  busqueda?: string
  frecuente?: boolean
}

export interface ServicioFilters {
  activo?: boolean
  busqueda?: string
}

// ─── Disponibilidad ──────────────────────────────────────────────────────────

export interface Disponibilidad {
  fecha: string
  slots: Slot[]
}

export interface Slot {
  hora: string
  disponible: boolean
  turnoId?: number
}
