<script setup lang="ts">
import { ref } from 'vue'
import { clientAuthApi } from '../api'
import { Loader2, ArrowLeft, Check } from 'lucide-vue-next'

const email = ref('')
const emailError = ref('')
const loading = ref(false)
const sent = ref(false)

async function handleSubmit() {
  emailError.value = ''
  if (!email.value) {
    emailError.value = 'El email es requerido'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Email inválido'
    return
  }
  loading.value = true
  try {
    await clientAuthApi.forgotPassword(email.value)
    sent.value = true
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
        <h1 class="text-2xl font-bold text-white tracking-tight">Recuperar acceso</h1>
        <p class="text-neutral-500 text-sm mt-1">Te enviamos un enlace a tu email</p>
      </div>

      <!-- Card glass -->
      <div class="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <!-- Estado: enviado -->
        <div v-if="sent" class="text-center py-4">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-500/10 border border-success-500/30 mb-4">
            <Check :size="28" class="text-success-400" />
          </div>
          <h2 class="text-white font-semibold text-lg mb-2">¡Email enviado!</h2>
          <p class="text-neutral-400 text-sm mb-6 leading-relaxed">
            Si existe una cuenta con ese email, vas a recibir un enlace para restablecer tu contraseña.
          </p>
          <RouterLink
            :to="{ name: 'client-login' }"
            class="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            <ArrowLeft :size="16" />
            Volver al login
          </RouterLink>
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1.5">Email de tu cuenta</label>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="tu@email.com"
              class="w-full bg-neutral-800/60 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :class="emailError ? 'border-red-500' : 'border-neutral-700'"
            />
            <p v-if="emailError" class="mt-1 text-xs text-red-400">{{ emailError }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" :size="18" class="animate-spin" />
            <span>{{ loading ? 'Enviando...' : 'Enviar enlace' }}</span>
          </button>
        </form>
      </div>

      <div class="mt-6 text-center">
        <RouterLink
          :to="{ name: 'client-login' }"
          class="text-neutral-600 hover:text-neutral-400 text-sm transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft :size="14" />
          Volver al login
        </RouterLink>
      </div>
    </div>
  </div>
</template>
