import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ClienteAuth, ClienteLoginCredentials, ClienteRegisterData } from '../types'
import { clientAuthApi } from '../api'

const TOKEN_KEY = 'cliente_token'
const USER_KEY = 'cliente_user'

export const useClientAuthStore = defineStore('clientAuth', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const user = ref<ClienteAuth | null>(null)
  const token = ref<string | null>(null)

  // ─── Getters ──────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)
  const clientId = computed(() => user.value?.id ?? null)
  const fullName = computed(() =>
    user.value?.nombre ? `${user.value.nombre} ${user.value.apellido}` : '',
  )
  const initials = computed(() => {
    if (!user.value?.nombre) return ''
    return `${user.value.nombre[0]}${user.value.apellido[0]}`.toUpperCase()
  })

  // ─── Private helpers ──────────────────────────────────────────────────────
  function _setSession(authToken: string, id: number, authUser?: ClienteAuth) {
    token.value = authToken
    // API only returns token + client_id; store a minimal placeholder
    user.value = authUser ?? {
      id,
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(TOKEN_KEY, authToken)
    if (authUser) localStorage.setItem(USER_KEY, JSON.stringify(authUser))
  }

  function _clearSession() {
    user.value = null
    token.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  // ─── Actions ──────────────────────────────────────────────────────────────
  async function login(credentials: ClienteLoginCredentials): Promise<void> {
    const response = await clientAuthApi.login(credentials)
    // The login endpoint only returns token + client_id; preserve the email
    // from the credentials so the booking step can display it.
    _setSession(response.token, response.client_id, {
      id: response.client_id,
      nombre: '',
      apellido: '',
      email: credentials.email,
      telefono: '',
      createdAt: new Date().toISOString(),
    })
  }

  async function register(data: ClienteRegisterData): Promise<void> {
    const response = await clientAuthApi.register(data)
    // We have the full user data from the registration form
    const authUser: ClienteAuth = {
      id: response.client_id,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      telefono: data.telefono ?? '',
      createdAt: new Date().toISOString(),
    }
    _setSession(response.token, response.client_id, authUser)
  }

  function logout() {
    _clearSession()
  }

  function loadFromStorage() {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedToken) {
      token.value = savedToken
      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser) as ClienteAuth
        } catch {
          _clearSession()
        }
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    clientId,
    fullName,
    initials,
    login,
    register,
    logout,
    loadFromStorage,
  }
})
