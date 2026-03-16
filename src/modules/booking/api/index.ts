import apiClient from '@/app/axios'
import type { Disponibilidad, Turno } from '@/shared/types'

export const bookingApi = {
  // Disponibilidad
  async getDisponibilidad(
    servicioId: number,
    profesionalId: number,
    fecha: string
  ): Promise<Disponibilidad> {
    const response = await apiClient.get<Disponibilidad>('/disponibilidad', {
      params: { servicioId, profesionalId, fecha },
    })
    return response.data
  },

  // Turnos
  async createTurno(data: {
    servicioId: number
    profesionalId: number
    fecha: string
    horaInicio: string
    cliente: {
      nombre: string
      apellido: string
      email: string
      telefono: string
    }
  }): Promise<Turno> {
    const response = await apiClient.post<Turno>('/turnos', data)
    return response.data
  },

  async getTurnoById(id: number): Promise<Turno> {
    const response = await apiClient.get<Turno>(`/turnos/${id}`)
    return response.data
  },

  async cancelTurno(id: number): Promise<void> {
    await apiClient.patch(`/turnos/${id}/cancelar`)
  },
}
