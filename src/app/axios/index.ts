import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import router from '@/app/router'

// localStorage keys — must match each auth store
const ADMIN_TOKEN_KEY = 'accessToken'
const CLIENT_TOKEN_KEY = 'cliente_token'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor — attaches JWT (admin takes priority over client)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      localStorage.getItem(ADMIN_TOKEN_KEY) ??
      localStorage.getItem(CLIENT_TOKEN_KEY)

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => Promise.reject(error)
)

// Response interceptor — handles global error cases
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url ?? ''
      const isAdminRequest = url.includes('/auth/admin') || url.includes('/admin')
      const hasAdminToken = !!localStorage.getItem(ADMIN_TOKEN_KEY)
      // Only force-logout admin session — never touch the client token
      if (hasAdminToken || isAdminRequest) {
        localStorage.removeItem(ADMIN_TOKEN_KEY)
        router.push('/admin/login')
      }
    }

    if (error.response?.status === 403) {
      console.warn('[API] 403 Forbidden:', error.config?.url)
    }

    if (error.response?.status >= 500) {
      console.error('[API] Server error:', error.response.data)
    }

    return Promise.reject(error)
  }
)

export default apiClient
