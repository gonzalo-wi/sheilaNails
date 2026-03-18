import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/app/axios'

const TOKEN_KEY = 'accessToken'
const ADMIN_ID_KEY = 'admin_id'

export const useAuthStore = defineStore('auth', () => {
  // ─── State ───────────────────────────────────────────────────────────────
  const adminId = ref<number | null>(null)
  const accessToken = ref<string | null>(null)

  // ─── Getters ─────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => !!adminId.value)

  // ─── Private helpers ─────────────────────────────────────────────────────
  function _setSession(token: string, id: number) {
    accessToken.value = token
    adminId.value = id
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(ADMIN_ID_KEY, String(id))
  }

  function _clearSession() {
    accessToken.value = null
    adminId.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_ID_KEY)
  }

  // ─── Actions ─────────────────────────────────────────────────────────────
  async function login(credentials: { email: string; password: string }): Promise<void> {
    const { data } = await apiClient.post<{ token: string; admin_id: number }>(
      '/auth/admin/login',
      credentials,
    )
    _setSession(data.token, data.admin_id)
  }

  function logout() {
    _clearSession()
  }

  function loadFromStorage() {
    const token = localStorage.getItem(TOKEN_KEY)
    const id = localStorage.getItem(ADMIN_ID_KEY)
    if (token && id) {
      accessToken.value = token
      adminId.value = Number(id)
    }
  }

  // Keep these aliases so legacy code that calls setAuth/clearAuth still works
  const setAuth = (token: string, id: number) => _setSession(token, id)
  const clearAuth = () => _clearSession()

  return {
    adminId,
    accessToken,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    loadFromStorage,
    setAuth,
    clearAuth,
  }
})
