// useAuth — composable for client-side authentication.
// Wraps the clientAuth store and adds router-aware helpers.
// Use this in components instead of importing the store directly.

import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClientAuthStore } from '../store/clientAuth'
import type { ClienteLoginCredentials, ClienteRegisterData } from '../types'

export function useAuth() {
  const store = useClientAuthStore()
  const router = useRouter()
  const route = useRoute()

  const isAuthenticated = computed(() => store.isAuthenticated)
  const user = computed(() => store.user)
  const fullName = computed(() => store.fullName)
  const initials = computed(() => store.initials)

  async function login(credentials: ClienteLoginCredentials): Promise<void> {
    await store.login(credentials)
  }

  async function register(data: ClienteRegisterData): Promise<void> {
    await store.register(data)
  }

  function logout() {
    store.logout()
    router.push('/')
  }

  /** Redirect to client login, preserving current path as `?redirect=` param */
  function redirectToLogin(redirectPath?: string) {
    const path = redirectPath ?? route.fullPath
    router.push({ name: 'client-login', query: { redirect: path } })
  }

  return {
    isAuthenticated,
    user,
    fullName,
    initials,
    login,
    register,
    logout,
    redirectToLogin,
  }
}
