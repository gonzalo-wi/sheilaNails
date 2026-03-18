<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClientAuthStore } from '../store/clientAuth'
import { Loader2, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const store = useClientAuthStore()

const form = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  password: '',
  confirmPassword: '',
})

const errors = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  password: '',
  confirmPassword: '',
  general: '',
})

const loading = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)

function validate(): boolean {
  errors.value = { nombre: '', apellido: '', email: '', telefono: '', password: '', confirmPassword: '', general: '' }
  let ok = true

  if (!form.value.nombre.trim()) { errors.value.nombre = 'El nombre es requerido'; ok = false }
  if (!form.value.apellido.trim()) { errors.value.apellido = 'El apellido es requerido'; ok = false }
  if (!form.value.email) {
    errors.value.email = 'El email es requerido'; ok = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Email inválido'; ok = false
  }
  if (!form.value.telefono.trim()) { errors.value.telefono = 'El teléfono es requerido'; ok = false }
  if (!form.value.password) {
    errors.value.password = 'La contraseña es requerida'; ok = false
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Mínimo 6 caracteres'; ok = false
  }
  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden'; ok = false
  }

  return ok
}

async function handleRegister() {
  if (!validate()) return
  loading.value = true
  errors.value.general = ''
  try {
    await store.register(form.value)
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (e: unknown) {
    const axiosError = e as { response?: { data?: { error?: string }; status?: number } }
    if (axiosError.response?.status === 409) {
      errors.value.email = 'Ya existe una cuenta con ese email'
    } else {
      errors.value.general = axiosError.response?.data?.error ?? 'Error al registrarse'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen bg-neutral-950 flex items-center justify-center px-4 py-12 overflow-hidden">
    <!-- Orbes decorativos -->
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />

    <div class="relative w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-block">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-900 border border-neutral-800 shadow-lg mb-4 mx-auto overflow-hidden">
            <img src="@/assets/sheiLogo.png" alt="Nails Deni" class="w-full h-full object-cover" />
          </div>
        </RouterLink>
        <h1 class="text-2xl font-bold text-white tracking-tight">Creá tu cuenta</h1>
        <p class="text-neutral-500 text-sm mt-1">Reservá turnos en pocos pasos</p>
      </div>

      <!-- Card glass -->
      <div class="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Nombre + Apellido -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-1.5">Nombre</label>
              <input
                v-model="form.nombre"
                type="text"
                autocomplete="given-name"
                placeholder="María"
                class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="errors.nombre ? 'border-red-500' : 'border-neutral-700'"
              />
              <p v-if="errors.nombre" class="mt-1 text-xs text-red-400">{{ errors.nombre }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-1.5">Apellido</label>
              <input
                v-model="form.apellido"
                type="text"
                autocomplete="family-name"
                placeholder="González"
                class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="errors.apellido ? 'border-red-500' : 'border-neutral-700'"
              />
              <p v-if="errors.apellido" class="mt-1 text-xs text-red-400">{{ errors.apellido }}</p>
            </div>
          </div>

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

          <!-- Teléfono -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1.5">Teléfono</label>
            <input
              v-model="form.telefono"
              type="tel"
              autocomplete="tel"
              placeholder="+54 11 1234-5678"
              class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :class="errors.telefono ? 'border-red-500' : 'border-neutral-700'"
            />
            <p v-if="errors.telefono" class="mt-1 text-xs text-red-400">{{ errors.telefono }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1.5">Contraseña</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Mínimo 6 caracteres"
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

          <!-- Confirmar Password -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1.5">Repetir contraseña</label>
            <div class="relative">
              <input
                v-model="form.confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 pr-11 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="errors.confirmPassword ? 'border-red-500' : 'border-neutral-700'"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                @click="showConfirm = !showConfirm"
              >
                <EyeOff v-if="showConfirm" :size="18" />
                <Eye v-else :size="18" />
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-400">{{ errors.confirmPassword }}</p>
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
            class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-primary-500/30 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            <Loader2 v-if="loading" :size="18" class="animate-spin" />
            <span>{{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}</span>
          </button>
        </form>
      </div>

      <!-- Login link -->
      <p class="mt-6 text-center text-sm text-neutral-500">
        ¿Ya tenés cuenta?
        <RouterLink
          :to="{ name: 'client-login' }"
          class="text-primary-400 hover:text-primary-300 font-medium transition-colors ml-1"
        >
          Iniciá sesión
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
