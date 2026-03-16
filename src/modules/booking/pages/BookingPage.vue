<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../store/booking'
import Button from '@/shared/components/ui/Button.vue'
import Input from '@/shared/components/ui/Input.vue'
import Loading from '@/shared/components/common/Loading.vue'
import EmptyState from '@/shared/components/common/EmptyState.vue'
import { Clock, User, Calendar, Check, ChevronRight, ChevronLeft } from 'lucide-vue-next'
import { format, addDays, startOfDay, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Servicio, Profesional, Disponibilidad } from '@/shared/types'

const router = useRouter()
const bookingStore = useBookingStore()

const servicios = ref<Servicio[]>([])
const profesionales = ref<Profesional[]>([])
const disponibilidad = ref<Disponibilidad | null>(null)
const loading = ref(false)
const loadingSlots = ref(false)

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
  { number: 2, title: 'Seleccioná profesional' },
  { number: 3, title: 'Fecha y hora' },
  { number: 4, title: 'Tus datos' },
]

const currentStepTitle = computed(() => {
  return stepTitles.find(s => s.number === bookingStore.currentStep)?.title || ''
})

onMounted(async () => {
  bookingStore.reset()
  await loadServicios()
  await loadProfesionales()
})

async function loadServicios() {
  loading.value = true
  try {
    // servicios.value = await publicApi.getServicios()
    // Mock data
    servicios.value = [
      { id: 1, nombre: 'Manicura Clásica', descripcion: 'Cuidado completo de manos', duracion: 45, precio: 3500, categoria: 'Manicura', activo: true, requiereSena: false },
      { id: 2, nombre: 'Manicura Semipermanente', descripcion: 'Esmaltado de larga duración', duracion: 60, precio: 5500, categoria: 'Manicura', activo: true, requiereSena: false },
      { id: 3, nombre: 'Uñas Esculpidas', descripcion: 'Extensión con gel o acrílico', duracion: 120, precio: 12000, categoria: 'Esculpidas', activo: true, requiereSena: true },
      { id: 4, nombre: 'Nail Art', descripcion: 'Diseños personalizados', duracion: 90, precio: 8000, categoria: 'Diseño', activo: true, requiereSena: false },
      { id: 5, nombre: 'Pedicura Spa', descripcion: 'Tratamiento completo de pies', duracion: 75, precio: 6500, categoria: 'Pedicura', activo: true, requiereSena: false },
    ]
  } catch (error) {
    console.error('Error al cargar servicios:', error)
  } finally {
    loading.value = false
  }
}

async function loadProfesionales() {
  try {
    // profesionales.value = await publicApi.getProfesionales()
    // Mock data
    profesionales.value = [
      { id: 1, nombre: 'Ana', apellido: 'García', email: 'ana@example.com', telefono: '1234567890', especialidades: ['Manicura', 'Diseño'], activo: true },
      { id: 2, nombre: 'Laura', apellido: 'Martínez', email: 'laura@example.com', telefono: '0987654321', especialidades: ['Esculpidas', 'Nail Art'], activo: true },
      { id: 3, nombre: 'Sofía', apellido: 'López', email: 'sofia@example.com', telefono: '1122334455', especialidades: ['Pedicura', 'Manicura'], activo: true },
    ]
  } catch (error) {
    console.error('Error al cargar profesionales:', error)
  }
}

async function loadDisponibilidad(fecha: Date) {
  if (!bookingStore.selectedServicio || !bookingStore.selectedProfesional) return

  loadingSlots.value = true
  try {
    const fechaStr = format(fecha, 'yyyy-MM-dd')
    // disponibilidad.value = await bookingApi.getDisponibilidad(
    //   bookingStore.selectedServicio.id,
    //   bookingStore.selectedProfesional.id,
    //   fechaStr
    // )
    
    // Mock data
    const slots = []
    for (let h = 9; h < 20; h++) {
      for (let m of [0, 30]) {
        const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        slots.push({
          hora,
          disponible: Math.random() > 0.3, // 70% disponible
        })
      }
    }
    disponibilidad.value = { fecha: fechaStr, slots }
  } catch (error) {
    console.error('Error al cargar disponibilidad:', error)
  } finally {
    loadingSlots.value = false
  }
}

function selectServicio(servicio: Servicio) {
  bookingStore.selectServicio(servicio)
  bookingStore.nextStep()
}

function selectProfesional(profesional: Profesional) {
  bookingStore.selectProfesional(profesional)
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

  if (!bookingStore.clienteData.nombre) {
    formErrors.value.nombre = 'El nombre es requerido'
    isValid = false
  }
  if (!bookingStore.clienteData.apellido) {
    formErrors.value.apellido = 'El apellido es requerido'
    isValid = false
  }
  if (!bookingStore.clienteData.email) {
    formErrors.value.email = 'El email es requerido'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingStore.clienteData.email)) {
    formErrors.value.email = 'Email inválido'
    isValid = false
  }
  if (!bookingStore.clienteData.telefono) {
    formErrors.value.telefono = 'El teléfono es requerido'
    isValid = false
  }

  return isValid
}

async function confirmarReserva() {
  if (!validateForm()) return

  loading.value = true
  try {
    await bookingStore.createTurno()
    router.push('/turnos/exito')
  } catch (error) {
    console.error('Error al crear turno:', error)
    alert('Hubo un error al crear tu turno. Por favor, intentá nuevamente.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container-custom max-w-6xl">
    <!-- Progress Steps Premium -->
    <div class="mb-12">
      <div class="flex items-center justify-between max-w-4xl mx-auto relative">
        <!-- Background Line -->
        <div class="absolute left-0 right-0 top-5 h-0.5 bg-neutral-800">
          <div 
            class="h-full bg-gradient-to-r from-primary-600 to-primary-500 transition-all duration-500"
            :style="{ width: `${((bookingStore.currentStep - 1) / 3) * 100}%` }"
          />
        </div>

        <div
          v-for="step in stepTitles"
          :key="step.number"
          class="relative flex flex-col items-center"
        >
          <!-- Circle -->
          <div
            :class="[
              'w-11 h-11 rounded-full flex items-center justify-center font-semibold transition-all duration-300 relative z-10 border-2',
              bookingStore.currentStep === step.number
                ? 'bg-primary-600 text-white border-primary-600 scale-110 shadow-glow'
                : bookingStore.currentStep > step.number
                ? 'bg-success-600 text-white border-success-600'
                : 'bg-neutral-900 text-neutral-500 border-neutral-700',
            ]"
          >
            <Check v-if="bookingStore.currentStep > step.number" :size="20" />
            <span v-else>{{ step.number }}</span>
          </div>
          
          <!-- Label -->
          <span
            class="text-xs md:text-sm mt-3 font-medium text-center max-w-[100px] transition-colors"
            :class="bookingStore.currentStep >= step.number ? 'text-white' : 'text-neutral-600'"
          >
            {{ step.title }}
          </span>
        </div>
      </div>
      
      <h2 class="text-3xl font-display font-bold text-center mt-10 text-white">
        {{ currentStepTitle }}
      </h2>
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

      <!-- Step 2: Selección de profesional -->
      <div v-if="bookingStore.currentStep === 2">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            v-for="profesional in profesionales"
            :key="profesional.id"
            :class="[
              'card-hover cursor-pointer text-center bg-neutral-900/50 border transition-all duration-300',
              bookingStore.selectedProfesional?.id === profesional.id 
                ? 'border-primary-500 shadow-glow' 
                : 'border-neutral-800',
            ]"
            @click="selectProfesional(profesional)"
          >
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 mx-auto mb-4 flex items-center justify-center">
              <User :size="36" class="text-white" />
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">
              {{ profesional.nombre }} {{ profesional.apellido }}
            </h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <span 
                v-for="esp in profesional.especialidades" 
                :key="esp"
                class="px-2 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-medium"
              >
                {{ esp }}
              </span>
            </div>
            <div 
              v-if="bookingStore.selectedProfesional?.id === profesional.id"
              class="mt-4 px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-500 text-xs font-medium inline-flex items-center gap-1"
            >
              <Check :size="14" />
              Seleccionado
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Selección de fecha y hora -->
      <div v-if="bookingStore.currentStep === 3">
        <div class="card bg-neutral-900/50 border border-neutral-800">
          <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Calendar :size="20" class="text-primary-500" />
            Seleccioná un día
          </h3>
          <div class="grid grid-cols-7 gap-3 mb-8">
            <button
              v-for="day in weekDays"
              :key="day.toString()"
              :class="[
                'p-4 rounded-xl border-2 transition-all text-center',
                isSameDay(day, selectedDate)
                  ? 'border-primary-500 bg-primary-500/10 shadow-glow'
                  : 'border-neutral-700 hover:border-primary-500/50 bg-neutral-800/50',
              ]"
              @click="selectDate(day)"
            >
              <div class="text-xs text-neutral-500 mb-1 uppercase">
                {{ format(day, 'EEE', { locale: es }) }}
              </div>
              <div 
                class="text-xl font-bold mb-1"
                :class="isSameDay(day, selectedDate) ? 'text-primary-500' : 'text-white'"
              >
                {{ format(day, 'd') }}
              </div>
              <div class="text-xs text-neutral-600 uppercase">
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
                'p-3 rounded-lg font-medium transition-all text-center text-sm border-2',
                bookingStore.selectedHora === slot.hora
                  ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-glow'
                  : slot.disponible
                  ? 'border-neutral-700 bg-neutral-800/50 text-white hover:border-primary-500/50'
                  : 'border-neutral-800 bg-neutral-900/30 text-neutral-700 cursor-not-allowed opacity-50',
              ]"
              @click="selectHora(slot.hora)"
            >
              {{ slot.hora }}
            </button>
          </div>
        </div>

        <div class="mt-6 flex justify-between">
          <Button variant="outline" class="!text-white !border-neutral-700 hover:!bg-neutral-800" @click="bookingStore.prevStep">
            <ChevronLeft :size="20" class="mr-1" />
            Anterior
          </Button>
          <Button :disabled="!bookingStore.selectedHora" class="hover-glow" @click="bookingStore.nextStep">
            Siguiente
            <ChevronRight :size="20" class="ml-1" />
          </Button>
        </div>
      </div>

      <!-- Step 4: Datos del cliente -->
      <div v-if="bookingStore.currentStep === 4">
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Formulario -->
          <div class="card bg-neutral-900/50 border border-neutral-800">
            <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User :size="20" class="text-primary-500" />
              Tus datos
            </h3>
            <div class="space-y-5">
              <Input
                v-model="bookingStore.clienteData.nombre"
                label="Nombre"
                placeholder="Tu nombre"
                required
                :error="formErrors.nombre"
              />
              <Input
                v-model="bookingStore.clienteData.apellido"
                label="Apellido"
                placeholder="Tu apellido"
                required
                :error="formErrors.apellido"
              />
              <Input
                v-model="bookingStore.clienteData.email"
                type="email"
                label="Email"
                placeholder="tu@email.com"
                required
                :error="formErrors.email"
              />
              <Input
                v-model="bookingStore.clienteData.telefono"
                type="tel"
                label="Teléfono"
                placeholder="+54 11 1234-5678"
                required
                :error="formErrors.telefono"
              />
            </div>
          </div>

          <!-- Resumen -->
          <div class="card bg-gradient-to-br from-neutral-900/80 to-neutral-900/50 border border-neutral-700">
            <h3 class="text-lg font-semibold text-white mb-6">Resumen de tu turno</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-start pb-3 border-b border-neutral-800">
                <span class="text-neutral-400 text-sm">Servicio</span>
                <span class="font-semibold text-white text-right">{{ bookingStore.selectedServicio?.nombre }}</span>
              </div>
              <div class="flex justify-between items-start pb-3 border-b border-neutral-800">
                <span class="text-neutral-400 text-sm">Profesional</span>
                <span class="font-semibold text-white">
                  {{ bookingStore.selectedProfesional?.nombre }} {{ bookingStore.selectedProfesional?.apellido }}
                </span>
              </div>
              <div class="flex justify-between items-start pb-3 border-b border-neutral-800">
                <span class="text-neutral-400 text-sm">Fecha</span>
                <span class="font-semibold text-white">{{ bookingStore.selectedFecha }}</span>
              </div>
              <div class="flex justify-between items-start pb-3 border-b border-neutral-800">
                <span class="text-neutral-400 text-sm">Hora</span>
                <span class="font-semibold text-white">{{ bookingStore.selectedHora }}</span>
              </div>
              <div class="flex justify-between items-start pb-3 border-b border-neutral-800">
                <span class="text-neutral-400 text-sm">Duración</span>
                <span class="font-semibold text-white">{{ bookingStore.selectedServicio?.duracion }} min</span>
              </div>
              
              <!-- Total destacado -->
              <div class="pt-6 mt-6 border-t-2 border-primary-500/20">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-semibold text-white">Total</span>
                  <div class="text-right">
                    <div class="text-3xl font-bold text-gradient">
                      ${{ (bookingStore.selectedServicio?.precio || 0) / 1000 }}k
                    </div>
                    <div class="text-xs text-neutral-500">ARS {{ bookingStore.selectedServicio?.precio.toLocaleString('es-AR') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-between">
          <Button variant="outline" class="!text-white !border-neutral-700 hover:!bg-neutral-800" @click="bookingStore.prevStep">
            <ChevronLeft :size="20" class="mr-1" />
            Anterior
          </Button>
          <Button :loading="loading" class="hover-glow" @click="confirmarReserva">
            Confirmar reserva
            <Check :size="20" class="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
