import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/modules/admin/store/auth'
import router from '@/app/router'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor - adjunta token de autenticación
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor - maneja errores globales
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Si es 401 (no autorizado), logout y redirigir a login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const authStore = useAuthStore()

      // TODO: Si tenés refresh token, intentá renovar acá
      // const newToken = await authStore.refreshToken()
      // if (newToken) {
      //   return apiClient(originalRequest)
      // }

      // Si no hay refresh o falló, logout
      authStore.logout()
      router.push('/admin/login')
    }

    // Si es 403 (prohibido)
    if (error.response?.status === 403) {
      console.error('Acceso prohibido')
      // Mostrar notificación
    }

    // Si es 500 (error del servidor)
    if (error.response?.status >= 500) {
      console.error('Error del servidor:', error.response.data)
      // Mostrar notificación
    }

    return Promise.reject(error)
  }
)

export default apiClient
