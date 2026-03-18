<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { Loader2, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ email: '', password: '', rememberMe: false })
const errors = ref({ email: '', password: '', general: '' })
const loading = ref(false)
const showPassword = ref(false)

function validateForm(): boolean {
  errors.value = { email: '', password: '', general: '' }
  let isValid = true
  if (!form.value.email) { errors.value.email = 'El email es requerido'; isValid = false }
  if (!form.value.password) { errors.value.password = 'La contraseña es requerida'; isValid = false }
  return isValid
}

async function handleLogin() {
  if (!validateForm()) return
  loading.value = true
  errors.value.general = ''
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    await authStore.login({ email: form.value.email, password: form.value.password })
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/admin/dashboard')
  } catch {
    errors.value.general = 'Credenciales inválidas. Por favor, intentá nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex">

    <!-- ── Panel izquierdo: logo como fondo (oculto en mobile) ── -->
    <div class="hidden lg:block lg:w-5/12 xl:w-1/2 relative overflow-hidden">
      <!-- Logo ocupa todo el panel -->
      <img src="@/assets/sheiLogo.png" alt="Nails Deni" class="absolute inset-0 w-full h-full object-cover" />
      <!-- Overlay degradado para que el texto sea legible -->
      <div class="absolute inset-0 bg-gradient-to-t from-neutral-950/30 via-transparent to-transparent" />
    </div>

    <!-- ── Panel derecho: formulario ── -->
    <div class="flex-1 relative flex items-center justify-center bg-neutral-950 px-6 py-12 overflow-hidden">
      <!-- Orbes decorativos -->
      <div class="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-600/15 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div class="relative w-full max-w-md animate-fade-in">

        <!-- Logo mobile -->
        <div class="flex lg:hidden items-center justify-center mb-8">
          <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-500/40">
            <img src="@/assets/sheiLogo.png" alt="Nails Deni" class="w-full h-full object-cover" />
          </div>
        </div>

        <!-- Encabezado -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-white tracking-tight">Panel de Administración</h1>
          <p class="text-neutral-400 text-sm mt-1.5">Ingresá para gestionar los turnos</p>
        </div>

        <!-- Card -->
        <div class="bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-neutral-800 p-8 space-y-5 shadow-2xl">

          <!-- Error general -->
          <div
            v-if="errors.general"
            class="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 animate-fade-in"
          >
            <AlertCircle :size="16" class="flex-shrink-0 mt-0.5" />
            <span>{{ errors.general }}</span>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">

            <!-- Email -->
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-neutral-300">Email</label>
              <div class="relative group">
                <Mail
                  :size="16"
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  :class="errors.email ? 'text-red-400' : 'text-neutral-500 group-focus-within:text-primary-400'"
                />
                <input
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  placeholder="admin@nailsdeni.com"
                  class="w-full pl-10 pr-4 py-3 bg-neutral-800/60 border rounded-xl text-sm text-white placeholder-neutral-600 outline-none transition-all duration-200 focus:bg-neutral-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  :class="errors.email ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : 'border-neutral-700'"
                />
              </div>
              <p v-if="errors.email" class="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle :size="12" /> {{ errors.email }}
              </p>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-neutral-300">Contraseña</label>
                <a href="/auth/forgot-password" class="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div class="relative group">
                <Lock
                  :size="16"
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  :class="errors.password ? 'text-red-400' : 'text-neutral-400 group-focus-within:text-primary-500'"
                />
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full pl-10 pr-11 py-3 bg-neutral-800/60 border rounded-xl text-sm text-white placeholder-neutral-600 outline-none transition-all duration-200 focus:bg-neutral-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  :class="errors.password ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : 'border-neutral-700'"
                />
                <button
                  type="button"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" :size="16" />
                  <Eye v-else :size="16" />
                </button>
              </div>
              <p v-if="errors.password" class="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle :size="12" /> {{ errors.password }}
              </p>
            </div>

            <!-- Recordarme -->
            <div class="flex items-center gap-2.5">
              <input
                id="remember"
                v-model="form.rememberMe"
                type="checkbox"
                class="w-4 h-4 rounded border-neutral-300 text-primary-500 accent-primary-500 cursor-pointer"
              />
              <label for="remember" class="text-sm text-neutral-400 cursor-pointer select-none">
                Recordarme
              </label>
            </div>

            <!-- Botón submit -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              :class="loading
                ? 'bg-primary-400'
                : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 hover:shadow-lg hover:shadow-primary-500/30 active:scale-[0.98]'"
            >
              <Loader2 v-if="loading" :size="17" class="animate-spin" />
              <span>{{ loading ? 'Ingresando...' : 'Ingresar' }}</span>
            </button>

          </form>
        </div>

        <!-- Volver al sitio -->
        <p class="mt-6 text-center text-sm text-neutral-600">
          <a href="/" class="hover:text-neutral-400 transition-colors">← Volver al sitio público</a>
        </p>

      </div>
    </div>

  </div>
</template>
