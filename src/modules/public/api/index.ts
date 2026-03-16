import apiClient from '@/app/axios'
import type { Servicio, Profesional } from '@/shared/types'

export const publicApi = {
  // Servicios
  async getServicios(): Promise<Servicio[]> {
    const response = await apiClient.get<Servicio[]>('/servicios')
    return response.data
  },

  async getServicioById(id: number): Promise<Servicio> {
    const response = await apiClient.get<Servicio>(`/servicios/${id}`)
    return response.data
  },

  // Profesionales
  async getProfesionales(): Promise<Profesional[]> {
    const response = await apiClient.get<Profesional[]>('/profesionales')
    return response.data
  },

  async getProfesionalById(id: number): Promise<Profesional> {
    const response = await apiClient.get<Profesional>(`/profesionales/${id}`)
    return response.data
  },
}
