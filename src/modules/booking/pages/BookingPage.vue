<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../store/booking'
import { useClientAuthStore } from '@/modules/auth/store/clientAuth'
import AuthModal from '@/modules/auth/components/AuthModal.vue'
import Button from '@/shared/components/ui/Button.vue'
import Input from '@/shared/components/ui/Input.vue'
import Loading from '@/shared/components/common/Loading.vue'
import EmptyState from '@/shared/components/common/EmptyState.vue'
import { Clock, User, Calendar, Check, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-vue-next'
import { format, addDays, startOfDay, isSameDay, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Servicio, Disponibilidad } from '@/shared/types'
import { serviciosApi } from '@/modules/admin/api'
import { bookingApi } from '../api'

const router = useRouter()
const bookingStore = useBookingStore()
const clientAuthStore = useClientAuthStore()

const servicios = ref<Servicio[]>([])
const disponibilidad = ref<Disponibilidad | null>(null)
const loading = ref(false)
const loadingSlots = ref(false)
const bookingError = ref<string | null>(null)

// Auth modal
const showAuthModal = ref(false)

// Pre-fill client data from auth user whenever entering step 4
watch(() => bookingStore.currentStep, (step) => {
  if (step === 3 && clientAuthStore.isAuthenticated && clientAuthStore.user) {
    bookingStore.updateClienteData({
      nombre: clientAuthStore.user.nombre,
      apellido: clientAuthStore.user.apellido,
      email: clientAuthStore.user.email,
      telefono: clientAuthStore.user.telefono,
    })
  }
})

// Calendario
const selectedDate = ref<Date>(new Date())
const weekDays = computed(() => {
  const days = []
  const startDay = startOfDay(new Date())
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDay, i))
  }
  return days
})

// Validaciones
const formErrors = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
})

// Steps
const stepTitles = [
  { number: 1, title: 'Elegí tu servicio' },
  { number: 2, title: 'Fecha y hora' },
  { number: 3, title: 'Tus datos' },
]

const currentStepTitle = computed(() => {
  return stepTitles.find(s => s.number === bookingStore.currentStep)?.title || ''
})

onMounted(async () => {
  bookingStore.reset()
  await loadServicios()
})

async function loadServicios() {
  loading.value = true
  try {
    servicios.value = await serviciosApi.getAllPublic()
  } catch (error) {
    console.error('Error al cargar servicios:', error)
  } finally {
    loading.value = false
  }
}

async function loadDisponibilidad(fecha: Date) {
  if (!bookingStore.selectedServicio) return

  loadingSlots.value = true
  try {
    const fechaStr = format(fecha, 'yyyy-MM-dd')
    const result = await bookingApi.getAvailability(fechaStr, bookingStore.selectedServicio.duracion)
    disponibilidad.value = {
      fecha: fechaStr,
      slots: result.available_slots.map(s => ({ hora: s.start_time, disponible: true })),
    }
  } catch (error) {
    console.error('Error al cargar disponibilidad:', error)
    disponibilidad.value = null
  } finally {
    loadingSlots.value = false
  }
}

function selectServicio(servicio: Servicio) {
  bookingStore.selectServicio(servicio)
  bookingStore.nextStep()
  loadDisponibilidad(selectedDate.value)
}

async function selectDate(date: Date) {
  selectedDate.value = date
  await loadDisponibilidad(date)
}

function selectHora(hora: string) {
  const fechaStr = format(selectedDate.value, 'yyyy-MM-dd')
  bookingStore.selectDateTime(fechaStr, hora)
}

function validateForm(): boolean {
  formErrors.value = { nombre: '', apellido: '', email: '', telefono: '' }
  let isValid = true

  // When authenticated with full profile, no extra validation needed
  if (clientAuthStore.isAuthenticated && clientAuthStore.user?.nombre) {
    return true
  }

  if (!bookingStore.clienteData.nombre) {
    formErrors.value.nombre = 'El nombre es requerido'
    isValid = false
  }
  if (!bookingStore.clienteData.apellido) {
    formErrors.value.apellido = 'El apellido es requerido'
    isValid = false
  }
  // Email is not shown as an editable field for authenticated users (we have it from login)
  if (!clientAuthStore.isAuthenticated) {
    if (!bookingStore.clienteData.email) {
      formErrors.value.email = 'El email es requerido'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingStore.clienteData.email)) {
      formErrors.value.email = 'Email inválido'
      isValid = false
    }
  }
  if (!clientAuthStore.user?.telefono && !bookingStore.clienteData.telefono) {
    formErrors.value.telefono = 'El teléfono es requerido'
    isValid = false
  }

  return isValid
}

async function confirmarReserva() {
  bookingError.value = null
  // Safety check: auth might have expired
  if (!clientAuthStore.isAuthenticated) {
    showAuthModal.value = true
    return
  }
  if (!validateForm()) return

  // Frontend guard: reject past dates
  if (bookingStore.selectedFecha && isBefore(new Date(bookingStore.selectedFecha + 'T00:00:00'), startOfDay(new Date()))) {
    bookingError.value = 'No se pueden agendar turnos en fechas pasadas. Por favor elegí otra fecha.'
    return
  }

  loading.value = true
  try {
    await bookingStore.createTurno()
    router.push('/turnos/exito')
  } catch (error: unknown) {
    console.error('Error al crear turno:', error)
    let msg = 'Hubo un error al crear tu turno. Por favor, intentá nuevamente.'
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosErr = error as { response?: { data?: { error?: string; message?: string } } }
      msg = axiosErr.response?.data?.error
        ?? axiosErr.response?.data?.message
        ?? msg
    }

    // If the error is about an existing appointment or a past date, go back to date picker
    const isDateConflict = /turno agendado|fecha pasada/i.test(msg)
    if (isDateConflict) {
      bookingStore.selectDateTime('', '')
      bookingStore.currentStep = 2
    }
    bookingError.value = isDateConflict
      ? `${msg} Por favor elegí otra fecha.`
      : msg
  } finally {
    loading.value = false
  }
}
/** Called when "Siguiente" is tapped at step 3 — checks auth before proceeding */
function handleNextFromStep2() {
  if (!clientAuthStore.isAuthenticated) {
    showAuthModal.value = true
    return
  }
  bookingStore.nextStep()
}

/** Called by AuthModal after successful login/register */
function onAuthenticated() {
  showAuthModal.value = false
  if (clientAuthStore.user) {
    bookingStore.updateClienteData({
      nombre: clientAuthStore.user.nombre,
      apellido: clientAuthStore.user.apellido,
      email: clientAuthStore.user.email,
      telefono: clientAuthStore.user.telefono,
    })
  }
  bookingStore.nextStep()
}
</script>

<template>
  <div class="container-custom max-w-6xl px-4">
    <!-- Progress Steps: desktop full / mobile compact -->
    <div class="mb-6 md:mb-12">

      <!-- Mobile: progress bar + label -->
      <div class="md:hidden">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-xs text-neutral-500 font-medium">Paso {{ bookingStore.currentStep }} de {{ stepTitles.length }}</span>
          <div class="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500"
              :style="{ width: `${(bookingStore.currentStep / stepTitles.length) * 100}%` }"
            />
          </div>
          <div class="flex gap-1">
            <div
              v-for="step in stepTitles"
              :key="step.number"
              :class="[
                'w-2 h-2 rounded-full transition-all duration-300',
                bookingStore.currentStep > step.number ? 'bg-success-500'
                : bookingStore.currentStep === step.number ? 'bg-primary-500 scale-125'
                : 'bg-neutral-700'
              ]"
            />
          </div>
        </div>
        <h2 class="text-2xl font-display font-bold text-white">{{ currentStepTitle }}</h2>
      </div>

      <!-- Desktop: full stepper -->
      <div class="hidden md:block">
        <div class="flex items-center justify-between max-w-4xl mx-auto relative">
          <div class="absolute left-0 right-0 top-5 h-0.5 bg-neutral-800">
            <div
              class="h-full bg-gradient-to-r from-primary-600 to-primary-500 transition-all duration-500"
              :style="{ width: `${((bookingStore.currentStep - 1) / (stepTitles.length - 1)) * 100}%` }"
            />
          </div>
          <div v-for="step in stepTitles" :key="step.number" class="relative flex flex-col items-center">
            <div
              :class="[
                'w-11 h-11 rounded-full flex items-center justify-center font-semibold transition-all duration-300 relative z-10 border-2',
                bookingStore.currentStep === step.number ? 'bg-primary-600 text-white border-primary-600 scale-110 shadow-glow'
                : bookingStore.currentStep > step.number ? 'bg-success-600 text-white border-success-600'
                : 'bg-neutral-900 text-neutral-500 border-neutral-700',
              ]"
            >
              <Check v-if="bookingStore.currentStep > step.number" :size="20" />
              <span v-else>{{ step.number }}</span>
            </div>
            <span
              class="text-xs md:text-sm mt-3 font-medium text-center max-w-[100px] transition-colors"
              :class="bookingStore.currentStep >= step.number ? 'text-white' : 'text-neutral-600'"
            >
              {{ step.title }}
            </span>
          </div>
        </div>
        <h2 class="text-3xl font-display font-bold text-center mt-10 text-white">{{ currentStepTitle }}</h2>
      </div>
    </div>

    <!-- Step content -->
    <div class="max-w-4xl mx-auto">
      <!-- Step 1: Selección de servicio -->
      <div v-if="bookingStore.currentStep === 1">
        <Loading v-if="loading" message="Cargando servicios..." />
        <EmptyState
          v-else-if="servicios.length === 0"
          title="No hay servicios disponibles"
          message="No hay servicios disponibles en este momento."
        />
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            v-for="servicio in servicios"
            :key="servicio.id"
            :class="[
              'card-hover cursor-pointer transition-all duration-300 bg-neutral-900/50 border',
              bookingStore.selectedServicio?.id === servicio.id 
                ? 'border-primary-500 shadow-glow' 
                : 'border-neutral-800',
            ]"
            @click="selectServicio(servicio)"
          >
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-xl font-semibold text-white">{{ servicio.nombre }}</h3>
              <div class="text-right">
                <div class="text-2xl font-bold text-gradient">${{ (servicio.precio / 1000).toFixed(1) }}k</div>
                <div class="text-xs text-neutral-500">ARS</div>
              </div>
            </div>
            <p class="text-neutral-400 text-sm mb-4 leading-relaxed">{{ servicio.descripcion }}</p>
            <div class="flex items-center justify-between pt-4 border-t border-neutral-800">
              <div class="flex items-center text-sm text-neutral-500">
                <Clock :size="16" class="mr-2 text-primary-500" />
                {{ servicio.duracion }} min
              </div>
              <div 
                v-if="bookingStore.selectedServicio?.id === servicio.id"
                class="px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-xs font-medium flex items-center gap-1"
              >
                <Check :size="14" />
                Seleccionado
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Fecha y hora -->
      <div v-if="bookingStore.currentStep === 2">
        <div class="card bg-neutral-900/50 border border-neutral-800">
          <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Calendar :size="20" class="text-primary-500" />
            Seleccioná un día
          </h3>
          <div class="grid grid-cols-7 gap-1 md:gap-3 mb-6 md:mb-8">
            <button
              v-for="day in weekDays"
              :key="day.toString()"
              :class="[
                'py-2 md:p-4 rounded-xl border-2 transition-all text-center',
                isSameDay(day, selectedDate)
                  ? 'border-primary-500 bg-primary-500/10 shadow-glow'
                  : 'border-neutral-700 hover:border-primary-500/50 bg-neutral-800/50',
              ]"
              @click="selectDate(day)"
            >
              <div class="text-[10px] md:text-xs text-neutral-500 mb-0.5 uppercase">
                {{ format(day, 'EEE', { locale: es }) }}
              </div>
              <div
                class="text-base md:text-xl font-bold mb-0.5"
                :class="isSameDay(day, selectedDate) ? 'text-primary-500' : 'text-white'"
              >
                {{ format(day, 'd') }}
              </div>
              <div class="text-[10px] md:text-xs text-neutral-600 uppercase">
                {{ format(day, 'MMM', { locale: es }) }}
              </div>
            </button>
          </div>

          <div class="divider mb-6" />

          <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Clock :size="20" class="text-primary-500" />
            Seleccioná un horario
          </h3>
          <Loading v-if="loadingSlots" message="Cargando horarios..." />
          <div v-else-if="disponibilidad" class="grid grid-cols-3 md:grid-cols-6 gap-2">
            <button
              v-for="slot in disponibilidad.slots"
              :key="slot.hora"
              :disabled="!slot.disponible"
              :class="[
                'py-2.5 md:p-3 rounded-lg font-medium transition-all text-center text-sm border-2',
                bookingStore.selectedHora === slot.hora
                  ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-glow'
                  : slot.disponible
                  ? 'border-neutral-700 bg-neutral-800/50 text-white hover:border-primary-500/50'
                  : 'border-neutral-800 bg-neutral-900/30 text-neutral-700 cursor-not-allowed opacity-40',
              ]"
              @click="selectHora(slot.hora)"
            >
              {{ slot.hora }}
            </button>
          </div>
        </div>

        <div class="mt-6 flex justify-between">
          <Button variant="outline" class="!text-white !border-neutral-700 hover:!bg-neutral-800 !px-3 !py-2 !text-sm md:!px-6 md:!py-3 md:!text-base" @click="bookingStore.prevStep">
            <ChevronLeft :size="16" class="mr-1" />
            Anterior
          </Button>
          <Button :disabled="!bookingStore.selectedHora" class="hover-glow !px-3 !py-2 !text-sm md:!px-6 md:!py-3 md:!text-base" @click="handleNextFromStep2">
            Siguiente
            <ChevronRight :size="16" class="ml-1" />
          </Button>
        </div>
      </div>

      <!-- Step 3: Datos del cliente -->
      <div v-if="bookingStore.currentStep === 3">
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Formulario (solo para usuarios no autenticados) -->
          <div v-if="!clientAuthStore.isAuthenticated" class="card bg-neutral-900/50 border border-neutral-800">
            <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User :size="20" class="text-primary-500" />
              Tus datos
            </h3>
            <div class="space-y-5">
              <Input v-model="bookingStore.clienteData.nombre" label="Nombre" placeholder="Tu nombre" required :error="formErrors.nombre" />
              <Input v-model="bookingStore.clienteData.apellido" label="Apellido" placeholder="Tu apellido" required :error="formErrors.apellido" />
              <Input v-model="bookingStore.clienteData.email" type="email" label="Email" placeholder="tu@email.com" required :error="formErrors.email" />
              <Input v-model="bookingStore.clienteData.telefono" type="tel" label="Teléfono" placeholder="+54 11 1234-5678" required :error="formErrors.telefono" />
            </div>
          </div>

          <!-- Usuario autenticado: tarjeta identidad -->
          <div v-else class="card bg-neutral-900/50 border border-neutral-800">
            <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User :size="20" class="text-primary-500" />
              Tus datos
            </h3>
            <div class="flex items-center gap-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 mb-4">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {{ clientAuthStore.initials || clientAuthStore.user?.email?.[0]?.toUpperCase() || '?' }}
              </div>
              <div class="min-w-0">
                <p v-if="clientAuthStore.fullName" class="font-semibold text-white">{{ clientAuthStore.fullName }}</p>
                <p class="text-sm text-neutral-400 truncate">{{ clientAuthStore.user?.email }}</p>
                <p v-if="clientAuthStore.user?.telefono" class="text-sm text-neutral-400">{{ clientAuthStore.user?.telefono }}</p>
              </div>
            </div>
            <!-- Si no tenemos nombre, pedimos que complete los datos -->
            <template v-if="!clientAuthStore.user?.nombre">
              <p class="text-xs text-neutral-500 mb-4">Completá tu nombre para la reserva:</p>
              <div class="space-y-4">
                <Input v-model="bookingStore.clienteData.nombre" label="Nombre" placeholder="Tu nombre" required :error="formErrors.nombre" />
                <Input v-model="bookingStore.clienteData.apellido" label="Apellido" placeholder="Tu apellido" required :error="formErrors.apellido" />
                <Input v-if="!clientAuthStore.user?.telefono" v-model="bookingStore.clienteData.telefono" type="tel" label="Teléfono" placeholder="+54 11 1234-5678" required :error="formErrors.telefono" />
              </div>
            </template>
          </div>

          <!-- Resumen -->
          <div class="rounded-xl border border-neutral-700 bg-neutral-900 p-6 flex flex-col gap-0">
            <h3 class="text-base font-semibold text-white mb-5 tracking-wide uppercase text-xs text-primary-400">Resumen de tu turno</h3>

            <div class="flex justify-between items-center py-3 border-b border-neutral-800">
              <span class="text-sm text-neutral-400">Servicio</span>
              <span class="text-sm font-semibold text-white text-right max-w-[55%] leading-snug">{{ bookingStore.selectedServicio?.nombre }}</span>
            </div>
            <div class="flex justify-between items-center py-3 border-b border-neutral-800">
              <span class="text-sm text-neutral-400">Fecha</span>
              <span class="text-sm font-semibold text-white">{{ bookingStore.selectedFecha }}</span>
            </div>
            <div class="flex justify-between items-center py-3 border-b border-neutral-800">
              <span class="text-sm text-neutral-400">Hora</span>
              <span class="text-sm font-semibold text-white">{{ bookingStore.selectedHora }}</span>
            </div>
            <div class="flex justify-between items-center py-3 border-b border-neutral-800">
              <span class="text-sm text-neutral-400">Duración</span>
              <span class="text-sm font-semibold text-white">{{ bookingStore.selectedServicio?.duracion }} min</span>
            </div>

            <!-- Total -->
            <div class="mt-5 rounded-lg bg-primary-500/10 border border-primary-500/20 px-4 py-4 flex justify-between items-center">
              <span class="text-base font-semibold text-white">Total</span>
              <div class="text-right">
                <div class="text-2xl font-bold text-gradient leading-none">
                  ${{ ((bookingStore.selectedServicio?.precio || 0) / 1000).toFixed(bookingStore.selectedServicio?.precio && bookingStore.selectedServicio.precio % 1000 !== 0 ? 1 : 0) }}k
                </div>
                <div class="text-xs text-neutral-500 mt-0.5">ARS {{ bookingStore.selectedServicio?.precio.toLocaleString('es-AR') }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-between">
          <Button variant="outline" class="!text-white !border-neutral-700 hover:!bg-neutral-800 !px-3 !py-2 !text-sm md:!px-6 md:!py-3 md:!text-base" @click="bookingStore.prevStep">
            <ChevronLeft :size="16" class="mr-1" />
            Anterior
          </Button>
          <Button :loading="loading" class="hover-glow !px-3 !py-2 !text-sm md:!px-6 md:!py-3 md:!text-base" @click="confirmarReserva">
            Confirmar reserva
            <Check :size="16" class="ml-1" />
          </Button>
        </div>

        <!-- Error banner -->
        <div v-if="bookingError" class="mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <AlertCircle :size="18" class="text-red-400 mt-0.5 shrink-0" />
          <p class="text-sm text-red-300">{{ bookingError }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Auth modal: shown when client tries to proceed without being logged in -->
  <AuthModal v-model="showAuthModal" @authenticated="onAuthenticated" />
</template>
