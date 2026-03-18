import apiClient from '@/app/axios'
import type {
  ClienteLoginCredentials,
  ClienteRegisterData,
  ClienteAuthResponse,
} from '../types'

export const clientAuthApi = {
  async login(credentials: ClienteLoginCredentials): Promise<ClienteAuthResponse> {
    const { data } = await apiClient.post<ClienteAuthResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    })
    return data
  },

  async register(payload: ClienteRegisterData): Promise<ClienteAuthResponse> {
    const { data } = await apiClient.post<ClienteAuthResponse>('/auth/register', {
      first_name: payload.nombre,
      last_name: payload.apellido,
      email: payload.email,
      phone: payload.telefono,
      password: payload.password,
    })
    return data
  },

  // Endpoint not yet available in the backend API
  async forgotPassword(_email: string): Promise<void> {
    console.warn('[Auth] forgotPassword endpoint not yet available')
  },
}
