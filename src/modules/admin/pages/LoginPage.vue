<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import Card from '@/shared/components/ui/Card.vue'
import Button from '@/shared/components/ui/Button.vue'
import Input from '@/shared/components/ui/Input.vue'
import { Lock } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
})

const errors = ref({
  email: '',
  password: '',
  general: '',
})

const loading = ref(false)

function validateForm(): boolean {
  errors.value = { email: '', password: '', general: '' }
  let isValid = true

  if (!form.value.email) {
    errors.value.email = 'El email es requerido'
    isValid = false
  }
  if (!form.value.password) {
    errors.value.password = 'La contraseña es requerida'
    isValid = false
  }

  return isValid
}

async function handleLogin() {
  if (!validateForm()) return

  loading.value = true
  errors.value.general = ''

  try {
    await authStore.login({
      email: form.value.email,
      password: form.value.password,
    })
    
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/admin/dashboard')
  } catch (error) {
    console.error('Error en login:', error)
    errors.value.general = 'Credenciales inválidas. Por favor, intentá nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock :size="32" class="text-white" />
        </div>
        <h1 class="text-3xl font-display font-bold text-neutral-900 mb-2">
          Panel Administrativo
        </h1>
        <p class="text-neutral-600">Nails Studio</p>
      </div>

      <Card>
        <form @submit.prevent="handleLogin">
          <div class="space-y-4">
            <Input
              v-model="form.email"
              type="email"
              label="Email"
              placeholder="admin@nailsstudio.com"
              required
              :error="errors.email"
            />
            
            <Input
              v-model="form.password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              required
              :error="errors.password"
            />

            <div v-if="errors.general" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {{ errors.general }}
            </div>

            <Button type="submit" class="w-full" :loading="loading">
              Iniciar sesión
            </Button>
          </div>
        </form>

        <div class="mt-6 p-4 bg-neutral-50 rounded-lg">
          <p class="text-xs text-neutral-600 text-center mb-2">
            <strong>Demo credentials:</strong>
          </p>
          <p class="text-xs text-neutral-500 text-center">
            Email: admin@example.com<br />
            Password: admin123
          </p>
        </div>
      </Card>

      <div class="mt-6 text-center">
        <a href="/" class="text-neutral-600 hover:text-primary-600 text-sm transition-colors">
          ← Volver al sitio público
        </a>
      </div>
    </div>
  </div>
</template>
