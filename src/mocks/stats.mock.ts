import type { DashboardStats, FinanzasStats } from '@/shared/types'

// ─── Dashboard stats ─────────────────────────────────────────────────────────

export const mockDashboardStats: DashboardStats = {
  // Hoy
  turnosHoy: 6,
  ingresosDia: 52000,
  senasCobradas: 14500,
  turnosConfirmadosHoy: 4,
  turnosPendientesHoy: 2,
  turnosCanceladosHoy: 0,

  // Semana
  turnosSemana: 32,
  ingresosSemana: 248000,

  // Mes
  turnosMes: 124,
  ingresosMes: 1080000,

  // Ratios
  ticketPromedio: 8709,
  tasaOcupacion: 81,
  tasaCancelacion: 6,
  clientesNuevos: 8,

  // Ingresos últimos 7 días (para el mini gráfico del dashboard)
  ingresosUltimos7Dias: [
    { fecha: '2026-03-09', etiqueta: 'Lun', ingresos: 32000, turnos: 5 },
    { fecha: '2026-03-10', etiqueta: 'Mar', ingresos: 41500, turnos: 6 },
    { fecha: '2026-03-11', etiqueta: 'Mié', ingresos: 28000, turnos: 4 },
    { fecha: '2026-03-12', etiqueta: 'Jue', ingresos: 55000, turnos: 7 },
    { fecha: '2026-03-13', etiqueta: 'Vie', ingresos: 63000, turnos: 8 },
    { fecha: '2026-03-14', etiqueta: 'Sáb', ingresos: 48000, turnos: 6 },
    { fecha: '2026-03-15', etiqueta: 'Hoy', ingresos: 52000, turnos: 6 },
  ],

  // Turnos por estado
  turnosPorEstado: [
    { estado: 'CONFIRMADO', etiqueta: 'Confirmados', cantidad: 68, porcentaje: 55, color: '#10b981' },
    { estado: 'COMPLETADO', etiqueta: 'Realizados',  cantidad: 42, porcentaje: 34, color: '#3b82f6' },
    { estado: 'PENDIENTE',  etiqueta: 'Pendientes',  cantidad: 8,  porcentaje: 6,  color: '#f59e0b' },
    { estado: 'CANCELADO',  etiqueta: 'Cancelados',  cantidad: 4,  porcentaje: 3,  color: '#ef4444' },
    { estado: 'NO_SHOW',    etiqueta: 'No show',     cantidad: 2,  porcentaje: 2,  color: '#6b7280' },
  ],

  // Turnos por servicio (top 5)
  turnosPorServicio: [
    { servicio: 'Esculpidas en Gel', cantidad: 31, ingresos: 434000 },
    { servicio: 'Semipermanente',    cantidad: 27, ingresos: 175500 },
    { servicio: 'Kapping con Deco',  cantidad: 22, ingresos: 264000 },
    { servicio: 'Capping',           cantidad: 19, ingresos: 180500 },
    { servicio: 'Nail Art Premium',  cantidad: 11, ingresos: 198000 },
  ],

  // Franjas más demandadas
  ocupacionPorHorario: [
    { hora: '09:00', ocupacion: 75 },
    { hora: '10:00', ocupacion: 90 },
    { hora: '11:00', ocupacion: 95 },
    { hora: '12:00', ocupacion: 70 },
    { hora: '13:00', ocupacion: 20 },
    { hora: '14:00', ocupacion: 85 },
    { hora: '15:00', ocupacion: 88 },
    { hora: '16:00', ocupacion: 80 },
    { hora: '17:00', ocupacion: 60 },
    { hora: '18:00', ocupacion: 40 },
  ],

  // Próximos turnos del día (para el panel "Hoy")
  proximosTurnos: [], // Se populan desde mockTurnos en el composable

  // Top clientas
  topClientas: [
    { id: 10, nombre: 'Belén',     apellido: 'Torres',     cantidadTurnos: 28, totalGastado: 490000 },
    { id: 4,  nombre: 'Valentina', apellido: 'Martínez',   cantidadTurnos: 22, totalGastado: 301000 },
    { id: 1,  nombre: 'María',     apellido: 'López',      cantidadTurnos: 18, totalGastado: 218000 },
    { id: 6,  nombre: 'Florencia', apellido: 'Díaz',       cantidadTurnos: 15, totalGastado: 182000 },
    { id: 2,  nombre: 'Sofía',     apellido: 'Rodríguez',  cantidadTurnos: 12, totalGastado: 163000 },
  ],
}

// ─── Finanzas stats ────────────────────────────────────────────────────────

export const mockFinanzasStats: FinanzasStats = {
  hoy: { ingresos: 52000, senas: 14500, cancelaciones: 0, turnos: 6, ticketPromedio: 8667 },
  semana: { ingresos: 248000, senas: 52000, cancelaciones: 1, turnos: 32, ticketPromedio: 7750 },
  mes: { ingresos: 1080000, senas: 198000, cancelaciones: 7, turnos: 124, ticketPromedio: 8710 },
  mesAnterior: { ingresos: 920000, senas: 170000, cancelaciones: 9, turnos: 108, ticketPromedio: 8519 },
  anio: { ingresos: 5640000, senas: 960000, cancelaciones: 48, turnos: 642, ticketPromedio: 8785 },

  ingresosPorDia: [
    { fecha: '2026-03-09', etiqueta: 'Lun', ingresos: 32000, turnos: 5 },
    { fecha: '2026-03-10', etiqueta: 'Mar', ingresos: 41500, turnos: 6 },
    { fecha: '2026-03-11', etiqueta: 'Mié', ingresos: 28000, turnos: 4 },
    { fecha: '2026-03-12', etiqueta: 'Jue', ingresos: 55000, turnos: 7 },
    { fecha: '2026-03-13', etiqueta: 'Vie', ingresos: 63000, turnos: 8 },
    { fecha: '2026-03-14', etiqueta: 'Sáb', ingresos: 48000, turnos: 6 },
    { fecha: '2026-03-15', etiqueta: 'Hoy', ingresos: 52000, turnos: 6 },
  ],

  ingresosPorMes: [
    { mes: 'Sep', anio: 2025, ingresos: 410000, turnos: 52 },
    { mes: 'Oct', anio: 2025, ingresos: 480000, turnos: 58 },
    { mes: 'Nov', anio: 2025, ingresos: 560000, turnos: 67 },
    { mes: 'Dic', anio: 2025, ingresos: 720000, turnos: 84 },
    { mes: 'Ene', anio: 2026, ingresos: 680000, turnos: 79 },
    { mes: 'Feb', anio: 2026, ingresos: 920000, turnos: 108 },
    { mes: 'Mar', anio: 2026, ingresos: 1080000, turnos: 124 },
  ],

  ingresosPorServicio: [
    { servicio: 'Esculpidas en Gel', ingresos: 434000, cantidad: 31, ticket: 14000 },
    { servicio: 'Nail Art Premium',  ingresos: 198000, cantidad: 11, ticket: 18000 },
    { servicio: 'Kapping con Deco',  ingresos: 264000, cantidad: 22, ticket: 12000 },
    { servicio: 'Capping',           ingresos: 180500, cantidad: 19, ticket: 9500 },
    { servicio: 'Semipermanente',    ingresos: 175500, cantidad: 27, ticket: 6500 },
  ],

  ingresosPorProfesional: [
    { nombre: 'Ana García',     ingresos: 480000, turnos: 48 },
    { nombre: 'Laura Martínez', ingresos: 320000, turnos: 42 },
    { nombre: 'Romina Vega',    ingresos: 280000, turnos: 34 },
  ],
}
