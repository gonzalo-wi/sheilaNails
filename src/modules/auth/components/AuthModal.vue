<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClientAuthStore } from '../store/clientAuth'
import { Loader2, Eye, EyeOff, X } from 'lucide-vue-next'

// v-model: controls visibility
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  authenticated: []
}>()

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const store = useClientAuthStore()
const activeTab = ref<'login' | 'register'>('login')

// ─── Login form ─────────────────────────────────────────────────────────────
const loginForm = ref({ email: '', password: '' })
const loginErrors = ref({ email: '', password: '', general: '' })
const loginLoading = ref(false)
const showLoginPassword = ref(false)

function validateLogin(): boolean {
  loginErrors.value = { email: '', password: '', general: '' }
  let ok = true
  if (!loginForm.value.email) {
    loginErrors.value.email = 'Requerido'; ok = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.value.email)) {
    loginErrors.value.email = 'Email inválido'; ok = false
  }
  if (!loginForm.value.password) { loginErrors.value.password = 'Requerido'; ok = false }
  return ok
}

async function handleLogin() {
  if (!validateLogin()) return
  loginLoading.value = true
  loginErrors.value.general = ''
  try {
    await store.login({ email: loginForm.value.email, password: loginForm.value.password })
    emit('authenticated')
  } catch (e: unknown) {
    loginErrors.value.general = e instanceof Error ? e.message : 'Error al iniciar sesión'
  } finally {
    loginLoading.value = false
  }
}

// ─── Register form ───────────────────────────────────────────────────────────
const registerForm = ref({
  nombre: '', apellido: '', email: '', telefono: '', password: '', confirmPassword: '',
})
const registerErrors = ref({
  nombre: '', apellido: '', email: '', telefono: '', password: '', confirmPassword: '', general: '',
})
const registerLoading = ref(false)
const showRegisterPassword = ref(false)

function validateRegister(): boolean {
  registerErrors.value = { nombre: '', apellido: '', email: '', telefono: '', password: '', confirmPassword: '', general: '' }
  let ok = true
  if (!registerForm.value.nombre.trim()) { registerErrors.value.nombre = 'Requerido'; ok = false }
  if (!registerForm.value.apellido.trim()) { registerErrors.value.apellido = 'Requerido'; ok = false }
  if (!registerForm.value.email) {
    registerErrors.value.email = 'Requerido'; ok = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email)) {
    registerErrors.value.email = 'Email inválido'; ok = false
  }
  if (!registerForm.value.telefono.trim()) { registerErrors.value.telefono = 'Requerido'; ok = false }
  if (!registerForm.value.password) {
    registerErrors.value.password = 'Requerido'; ok = false
  } else if (registerForm.value.password.length < 6) {
    registerErrors.value.password = 'Mínimo 6 caracteres'; ok = false
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerErrors.value.confirmPassword = 'No coinciden'; ok = false
  }
  return ok
}

async function handleRegister() {
  if (!validateRegister()) return
  registerLoading.value = true
  registerErrors.value.general = ''
  try {
    await store.register(registerForm.value)
    emit('authenticated')
  } catch (e: unknown) {
    registerErrors.value.general = e instanceof Error ? e.message : 'Error al registrarse'
  } finally {
    registerLoading.value = false
  }
}

function close() {
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="close" />

        <!-- Modal card -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
          appear
        >
          <div class="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
            <!-- Modal header -->
            <div class="flex items-center justify-between px-6 pt-6">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full overflow-hidden border border-neutral-700 flex-shrink-0">
                  <img src="@/assets/sheiLogo.png" alt="Nails Deni" class="w-full h-full object-cover" />
                </div>
                <div>
                  <p class="text-white font-semibold text-sm leading-tight">Para reservar tu turno</p>
                  <p class="text-neutral-500 text-xs">necesitás iniciar sesión o registrarte</p>
                </div>
              </div>
              <button @click="close" class="text-neutral-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-neutral-800">
                <X :size="20" />
              </button>
            </div>

            <!-- Tabs -->
            <div class="flex px-6 mt-5 border-b border-neutral-800">
              <button
                v-for="tab in [{ key: 'login', label: 'Iniciar sesión' }, { key: 'register', label: 'Registrarse' }]"
                :key="tab.key"
                class="pb-3 px-4 text-sm font-medium border-b-2 transition-all duration-200"
                :class="
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
                "
                @click="activeTab = tab.key as 'login' | 'register'"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- Tab content -->
            <div class="px-6 py-6 max-h-[65vh] overflow-y-auto">
              <!-- ── LOGIN TAB ── -->
              <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-300 mb-1.5">Email</label>
                  <input
                    v-model="loginForm.email"
                    type="email"
                    autocomplete="email"
                    placeholder="tu@email.com"
                    class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    :class="loginErrors.email ? 'border-red-500' : 'border-neutral-700'"
                  />
                  <p v-if="loginErrors.email" class="mt-1 text-xs text-red-400">{{ loginErrors.email }}</p>
                </div>

                <div>
                  <div class="flex justify-between items-center mb-1.5">
                    <label class="block text-sm font-medium text-neutral-300">Contraseña</label>
                    <RouterLink
                      :to="{ name: 'client-forgot' }"
                      class="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                      @click="close"
                    >
                      ¿Olvidaste la contraseña?
                    </RouterLink>
                  </div>
                  <div class="relative">
                    <input
                      v-model="loginForm.password"
                      :type="showLoginPassword ? 'text' : 'password'"
                      autocomplete="current-password"
                      placeholder="••••••••"
                      class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 pr-11 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      :class="loginErrors.password ? 'border-red-500' : 'border-neutral-700'"
                    />
                    <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors" @click="showLoginPassword = !showLoginPassword">
                      <EyeOff v-if="showLoginPassword" :size="18" />
                      <Eye v-else :size="18" />
                    </button>
                  </div>
                  <p v-if="loginErrors.password" class="mt-1 text-xs text-red-400">{{ loginErrors.password }}</p>
                </div>

                <div v-if="loginErrors.general" class="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                  {{ loginErrors.general }}
                </div>

                <button
                  type="submit"
                  :disabled="loginLoading"
                  class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Loader2 v-if="loginLoading" :size="18" class="animate-spin" />
                  <span>{{ loginLoading ? 'Ingresando...' : 'Iniciar sesión' }}</span>
                </button>

                <p class="text-center text-xs text-neutral-600 pt-1">
                  Demo: maria@example.com · pass123
                </p>
              </form>

              <!-- ── REGISTER TAB ── -->
              <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-neutral-300 mb-1.5">Nombre</label>
                    <input
                      v-model="registerForm.nombre"
                      type="text"
                      autocomplete="given-name"
                      placeholder="María"
                      class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      :class="registerErrors.nombre ? 'border-red-500' : 'border-neutral-700'"
                    />
                    <p v-if="registerErrors.nombre" class="mt-1 text-xs text-red-400">{{ registerErrors.nombre }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-neutral-300 mb-1.5">Apellido</label>
                    <input
                      v-model="registerForm.apellido"
                      type="text"
                      autocomplete="family-name"
                      placeholder="González"
                      class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      :class="registerErrors.apellido ? 'border-red-500' : 'border-neutral-700'"
                    />
                    <p v-if="registerErrors.apellido" class="mt-1 text-xs text-red-400">{{ registerErrors.apellido }}</p>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-300 mb-1.5">Email</label>
                  <input
                    v-model="registerForm.email"
                    type="email"
                    autocomplete="email"
                    placeholder="tu@email.com"
                    class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    :class="registerErrors.email ? 'border-red-500' : 'border-neutral-700'"
                  />
                  <p v-if="registerErrors.email" class="mt-1 text-xs text-red-400">{{ registerErrors.email }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-300 mb-1.5">Teléfono</label>
                  <input
                    v-model="registerForm.telefono"
                    type="tel"
                    autocomplete="tel"
                    placeholder="+54 11 1234-5678"
                    class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    :class="registerErrors.telefono ? 'border-red-500' : 'border-neutral-700'"
                  />
                  <p v-if="registerErrors.telefono" class="mt-1 text-xs text-red-400">{{ registerErrors.telefono }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-300 mb-1.5">Contraseña</label>
                  <div class="relative">
                    <input
                      v-model="registerForm.password"
                      :type="showRegisterPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 pr-11 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      :class="registerErrors.password ? 'border-red-500' : 'border-neutral-700'"
                    />
                    <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors" @click="showRegisterPassword = !showRegisterPassword">
                      <EyeOff v-if="showRegisterPassword" :size="18" />
                      <Eye v-else :size="18" />
                    </button>
                  </div>
                  <p v-if="registerErrors.password" class="mt-1 text-xs text-red-400">{{ registerErrors.password }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-300 mb-1.5">Repetir contraseña</label>
                  <input
                    v-model="registerForm.confirmPassword"
                    type="password"
                    autocomplete="new-password"
                    placeholder="••••••••"
                    class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    :class="registerErrors.confirmPassword ? 'border-red-500' : 'border-neutral-700'"
                  />
                  <p v-if="registerErrors.confirmPassword" class="mt-1 text-xs text-red-400">{{ registerErrors.confirmPassword }}</p>
                </div>

                <div v-if="registerErrors.general" class="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                  {{ registerErrors.general }}
                </div>

                <button
                  type="submit"
                  :disabled="registerLoading"
                  class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Loader2 v-if="registerLoading" :size="18" class="animate-spin" />
                  <span>{{ registerLoading ? 'Creando cuenta...' : 'Crear cuenta' }}</span>
                </button>
              </form>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
