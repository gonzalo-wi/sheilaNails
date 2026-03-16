import apiClient from '@/app/axios'
import type {
  Turno,
  TurnoFilters,
  Cliente,
  Servicio,
  Profesional,
  DashboardStats,
  PaginatedResponse,
  EstadoTurno,
} from '@/shared/types'

export const adminApi = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/admin/dashboard/stats')
    return response.data
  },

  // Turnos
  async getTurnos(filters?: TurnoFilters): Promise<Turno[]> {
    const response = await apiClient.get<Turno[]>('/admin/turnos', { params: filters })
    return response.data
  },

  async getTurnoById(id: number): Promise<Turno> {
    const response = await apiClient.get<Turno>(`/admin/turnos/${id}`)
    return response.data
  },

  async createTurno(data: Partial<Turno>): Promise<Turno> {
    const response = await apiClient.post<Turno>('/admin/turnos', data)
    return response.data
  },

  async updateTurno(id: number, data: Partial<Turno>): Promise<Turno> {
    const response = await apiClient.put<Turno>(`/admin/turnos/${id}`, data)
    return response.data
  },

  async updateTurnoEstado(id: number, estado: EstadoTurno): Promise<Turno> {
    const response = await apiClient.patch<Turno>(`/admin/turnos/${id}/estado`, { estado })
    return response.data
  },

  async deleteTurno(id: number): Promise<void> {
    await apiClient.delete(`/admin/turnos/${id}`)
  },

  async exportTurnos(filters?: TurnoFilters): Promise<Blob> {
    const response = await apiClient.get('/admin/turnos/export', {
      params: filters,
      responseType: 'blob',
    })
    return response.data
  },

  // Clientes
  async getClientes(page = 1, pageSize = 20): Promise<PaginatedResponse<Cliente>> {
    const response = await apiClient.get<PaginatedResponse<Cliente>>('/admin/clientes', {
      params: { page, pageSize },
    })
    return response.data
  },

  async getClienteById(id: number): Promise<Cliente> {
    const response = await apiClient.get<Cliente>(`/admin/clientes/${id}`)
    return response.data
  },

  async createCliente(data: Partial<Cliente>): Promise<Cliente> {
    const response = await apiClient.post<Cliente>('/admin/clientes', data)
    return response.data
  },

  async updateCliente(id: number, data: Partial<Cliente>): Promise<Cliente> {
    const response = await apiClient.put<Cliente>(`/admin/clientes/${id}`, data)
    return response.data
  },

  async deleteCliente(id: number): Promise<void> {
    await apiClient.delete(`/admin/clientes/${id}`)
  },

  // Servicios
  async getServicios(): Promise<Servicio[]> {
    const response = await apiClient.get<Servicio[]>('/admin/servicios')
    return response.data
  },

  async getServicioById(id: number): Promise<Servicio> {
    const response = await apiClient.get<Servicio>(`/admin/servicios/${id}`)
    return response.data
  },

  async createServicio(data: Partial<Servicio>): Promise<Servicio> {
    const response = await apiClient.post<Servicio>('/admin/servicios', data)
    return response.data
  },

  async updateServicio(id: number, data: Partial<Servicio>): Promise<Servicio> {
    const response = await apiClient.put<Servicio>(`/admin/servicios/${id}`, data)
    return response.data
  },

  async deleteServicio(id: number): Promise<void> {
    await apiClient.delete(`/admin/servicios/${id}`)
  },

  // Profesionales
  async getProfesionales(): Promise<Profesional[]> {
    const response = await apiClient.get<Profesional[]>('/admin/profesionales')
    return response.data
  },

  async getProfesionalById(id: number): Promise<Profesional> {
    const response = await apiClient.get<Profesional>(`/admin/profesionales/${id}`)
    return response.data
  },

  async createProfesional(data: Partial<Profesional>): Promise<Profesional> {
    const response = await apiClient.post<Profesional>('/admin/profesionales', data)
    return response.data
  },

  async updateProfesional(id: number, data: Partial<Profesional>): Promise<Profesional> {
    const response = await apiClient.put<Profesional>(`/admin/profesionales/${id}`, data)
    return response.data
  },

  async deleteProfesional(id: number): Promise<void> {
    await apiClient.delete(`/admin/profesionales/${id}`)
  },
}
