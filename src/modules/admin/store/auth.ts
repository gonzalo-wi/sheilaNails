import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Usuario, LoginCredentials, AuthResponse } from '@/shared/types'
import apiClient from '@/app/axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<Usuario | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.rol === 'ADMIN')
  const userFullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.nombre} ${user.value.apellido}`
  })

  // Actions
  function setAuth(authData: AuthResponse) {
    user.value = authData.user
    accessToken.value = authData.accessToken
    refreshToken.value = authData.refreshToken || null

    // Guardar en localStorage
    localStorage.setItem('accessToken', authData.accessToken)
    if (authData.refreshToken) {
      localStorage.setItem('refreshToken', authData.refreshToken)
    }
    localStorage.setItem('user', JSON.stringify(authData.user))
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      setAuth(response.data)
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    }
  }

  function logout() {
    clearAuth()
  }

  function loadFromStorage() {
    const token = localStorage.getItem('accessToken')
    const refresh = localStorage.getItem('refreshToken')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      accessToken.value = token
      refreshToken.value = refresh
      user.value = JSON.parse(userData)
    }
  }

  // TODO: Implementar cuando el backend tenga refresh token
  // async function refreshAccessToken(): Promise<string | null> {
  //   if (!refreshToken.value) return null
  //   
  //   try {
  //     const response = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
  //       refreshToken: refreshToken.value,
  //     })
  //     accessToken.value = response.data.accessToken
  //     localStorage.setItem('accessToken', response.data.accessToken)
  //     return response.data.accessToken
  //   } catch (error) {
  //     clearAuth()
  //     return null
  //   }
  // }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    // Getters
    isAuthenticated,
    isAdmin,
    userFullName,
    // Actions
    login,
    logout,
    loadFromStorage,
    setAuth,
    clearAuth,
  }
})
