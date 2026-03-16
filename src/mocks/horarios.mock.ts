import type { HorarioConfig } from '@/shared/types'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/** Genera franjas horarias cada 30 min entre apertura y cierre */
function generarFranjas(apertura: string, cierre: string, bloqueadas: string[] = []) {
  const franjas = []
  const [aH, aM] = apertura.split(':').map(Number) as [number, number]
  const [cH, cM] = cierre.split(':').map(Number) as [number, number]
  let minutos = aH * 60 + aM
  const maxMin = cH * 60 + cM

  while (minutos < maxMin) {
    const h = Math.floor(minutos / 60).toString().padStart(2, '0')
    const m = (minutos % 60).toString().padStart(2, '0')
    const hora = `${h}:${m}`
    franjas.push({ hora, disponible: !bloqueadas.includes(hora) })
    minutos += 30
  }
  return franjas
}

export const mockHorarios: HorarioConfig[] = [
  {
    dia: 0,
    diaNombre: DIAS[0]!,
    activo: false,
    horaApertura: '09:00',
    horaCierre: '18:00',
    duracionTurno: 60,
    franjas: [],
    bloqueos: [],
  },
  {
    dia: 1,
    diaNombre: DIAS[1]!,
    activo: true,
    horaApertura: '09:00',
    horaCierre: '19:00',
    duracionTurno: 60,
    franjas: generarFranjas('09:00', '19:00', ['13:00', '13:30']),
    bloqueos: [
      { id: 1, horaInicio: '13:00', horaFin: '14:00', motivo: 'Almuerzo', tipo: 'ALMUERZO' },
    ],
  },
  {
    dia: 2,
    diaNombre: DIAS[2]!,
    activo: true,
    horaApertura: '09:00',
    horaCierre: '19:00',
    duracionTurno: 60,
    franjas: generarFranjas('09:00', '19:00', ['13:00', '13:30']),
    bloqueos: [
      { id: 2, horaInicio: '13:00', horaFin: '14:00', motivo: 'Almuerzo', tipo: 'ALMUERZO' },
    ],
  },
  {
    dia: 3,
    diaNombre: DIAS[3]!,
    activo: true,
    horaApertura: '09:00',
    horaCierre: '19:00',
    duracionTurno: 60,
    franjas: generarFranjas('09:00', '19:00', ['13:00', '13:30']),
    bloqueos: [
      { id: 3, horaInicio: '13:00', horaFin: '14:00', motivo: 'Almuerzo', tipo: 'ALMUERZO' },
    ],
  },
  {
    dia: 4,
    diaNombre: DIAS[4]!,
    activo: true,
    horaApertura: '09:00',
    horaCierre: '19:00',
    duracionTurno: 60,
    franjas: generarFranjas('09:00', '19:00', ['13:00', '13:30']),
    bloqueos: [
      { id: 4, horaInicio: '13:00', horaFin: '14:00', motivo: 'Almuerzo', tipo: 'ALMUERZO' },
    ],
  },
  {
    dia: 5,
    diaNombre: DIAS[5]!,
    activo: true,
    horaApertura: '09:00',
    horaCierre: '20:00',
    duracionTurno: 60,
    franjas: generarFranjas('09:00', '20:00', ['13:30', '14:00']),
    bloqueos: [
      { id: 5, horaInicio: '13:30', horaFin: '14:30', motivo: 'Almuerzo', tipo: 'ALMUERZO' },
    ],
  },
  {
    dia: 6,
    diaNombre: DIAS[6]!,
    activo: true,
    horaApertura: '10:00',
    horaCierre: '16:00',
    duracionTurno: 60,
    franjas: generarFranjas('10:00', '16:00'),
    bloqueos: [],
  },
]
