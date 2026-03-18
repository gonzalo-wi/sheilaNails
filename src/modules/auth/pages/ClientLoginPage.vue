<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClientAuthStore } from '../store/clientAuth'
import { Loader2, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const store = useClientAuthStore()

const form = ref({ email: '', password: '' })
const errors = ref({ email: '', password: '', general: '' })
const loading = ref(false)
const showPassword = ref(false)

function validate(): boolean {
  errors.value = { email: '', password: '', general: '' }
  let ok = true
  if (!form.value.email) {
    errors.value.email = 'El email es requerido'
    ok = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Email inválido'
    ok = false
  }
  if (!form.value.password) {
    errors.value.password = 'La contraseña es requerida'
    ok = false
  }
  return ok
}

async function handleLogin() {
  if (!validate()) return
  loading.value = true
  errors.value.general = ''
  try {
    await store.login({ email: form.value.email, password: form.value.password })
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (e: unknown) {
    const axiosError = e as { response?: { data?: { error?: string }; status?: number } }
    if (axiosError.response?.status === 401) {
      errors.value.general = 'Email o contraseña incorrectos'
    } else {
      errors.value.general = axiosError.response?.data?.error ?? 'Error al iniciar sesión'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen bg-neutral-950 flex items-center justify-center px-4 overflow-hidden">
    <!-- Orbes decorativos -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />

    <div class="relative w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-block">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-900 border border-neutral-800 shadow-lg mb-4 mx-auto overflow-hidden">
            <img src="@/assets/sheiLogo.png" alt="Nails Deni" class="w-full h-full object-cover" />
          </div>
        </RouterLink>
        <h1 class="text-2xl font-bold text-white tracking-tight">¡Hola de nuevo!</h1>
        <p class="text-neutral-500 text-sm mt-1">Iniciá sesión para reservar tu turno</p>
      </div>

      <!-- Card glass -->
      <div class="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1.5">Email</label>
            <input
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="tu@email.com"
              class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :class="errors.email ? 'border-red-500' : 'border-neutral-700'"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-400">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-sm font-medium text-neutral-300">Contraseña</label>
              <RouterLink
                :to="{ name: 'client-forgot' }"
                class="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </RouterLink>
            </div>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 pr-11 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="errors.password ? 'border-red-500' : 'border-neutral-700'"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="18" />
                <Eye v-else :size="18" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-red-400">{{ errors.password }}</p>
          </div>

          <!-- Error general -->
          <div
            v-if="errors.general"
            class="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400"
          >
            {{ errors.general }}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-primary-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" :size="18" class="animate-spin" />
            <span>{{ loading ? 'Ingresando...' : 'Iniciar sesión' }}</span>
          </button>
        </form>

        <!-- Demo credentials -->
        <div class="mt-5 pt-5 border-t border-neutral-800">
          <p class="text-[11px] text-neutral-600 text-center mb-1 uppercase tracking-wider font-medium">Demo</p>
          <p class="text-xs text-neutral-500 text-center">maria@example.com · pass123</p>
        </div>
      </div>

      <!-- Register link -->
      <p class="mt-6 text-center text-sm text-neutral-500">
        ¿No tenés cuenta?
        <RouterLink
          :to="{ name: 'client-register' }"
          class="text-primary-400 hover:text-primary-300 font-medium transition-colors ml-1"
        >
          Registrate gratis
        </RouterLink>
      </p>

      <div class="mt-4 text-center">
        <RouterLink to="/" class="text-neutral-600 hover:text-neutral-400 text-sm transition-colors">
          ← Volver al inicio
        </RouterLink>
      </div>
    </div>
  </div>
</template>
