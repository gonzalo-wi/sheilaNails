<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../store/booking'
import Card from '@/shared/components/ui/Card.vue'
import Button from '@/shared/components/ui/Button.vue'
import { CheckCircle2, Calendar, Clock, Home } from 'lucide-vue-next'
import { format, parse } from 'date-fns'
import { es } from 'date-fns/locale'

const router = useRouter()
const bookingStore = useBookingStore()

const turno = computed(() => bookingStore.confirmedTurno)

const fechaFormateada = computed(() => {
  if (!turno.value?.fecha) return ''
  const date = parse(turno.value.fecha, 'yyyy-MM-dd', new Date())
  return format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })
})

function goHome() {
  bookingStore.reset()
  router.push('/')
}

// Si no hay turno confirmado, redirigir
if (!turno.value && !bookingStore.selectedServicio) {
  router.push('/turnos')
}
</script>

<template>
  <div class="container-custom max-w-3xl">
    <div class="text-center mb-8">
      <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-fade-in">
        <CheckCircle2 :size="60" class="text-green-600" />
      </div>
      <h1 class="text-4xl font-display font-bold text-white mb-2">
        ¡Turno confirmado!
      </h1>
      <p class="text-lg text-neutral-300">
        Te esperamos en Nails Deni
      </p>
    </div>

    <Card class="mb-6">
      <h2 class="text-2xl font-display font-semibold mb-6 text-center">
        Detalles de tu reserva
      </h2>

      <div class="space-y-4">
        <div class="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Calendar :size="20" class="text-primary-600" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-neutral-900 mb-1">Fecha y hora</h3>
            <p class="text-neutral-700 capitalize">{{ fechaFormateada }}</p>
            <p class="text-lg font-semibold text-primary-600">
              {{ turno?.horaInicio || bookingStore.selectedHora }}
            </p>
          </div>
        </div>

        <div class="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock :size="20" class="text-primary-600" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-neutral-900 mb-1">Servicio</h3>
            <p class="text-neutral-700">{{ turno?.servicio?.nombre || bookingStore.selectedServicio?.nombre }}</p>
            <p class="text-sm text-neutral-600">
              Duración: {{ turno?.servicio?.duracion || bookingStore.selectedServicio?.duracion }} minutos
            </p>
            <p class="text-lg font-semibold text-primary-600 mt-1">
              ${{ (turno?.precioTotalFinal || bookingStore.selectedServicio?.precio)?.toLocaleString('es-AR') }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
        <h3 class="font-semibold text-primary-900 mb-2">📧 Confirmación enviada</h3>
        <p class="text-sm text-primary-800">
          Te enviamos un email de confirmación a <strong>{{ bookingStore.clienteData.email }}</strong> con todos los detalles de tu turno.
        </p>
      </div>
    </Card>

    <Card class="mb-6">
      <h3 class="font-semibold mb-3">Información importante</h3>
      <ul class="space-y-2 text-sm text-neutral-600">
        <li class="flex items-start">
          <span class="mr-2">•</span>
          <span>Te recomendamos llegar 10 minutos antes de tu turno.</span>
        </li>
        <li class="flex items-start">
          <span class="mr-2">•</span>
          <span>Si necesitás cancelar o reprogramar, hacelo con al menos 24 horas de anticipación.</span>
        </li>
        <li class="flex items-start">
          <span class="mr-2">•</span>
          <span>Recordá traer medias si elegiste un servicio de pedicura.</span>
        </li>
        <li class="flex items-start">
          <span class="mr-2">•</span>
          <span>Aceptamos efectivo, débito, crédito y transferencias.</span>
        </li>
      </ul>

      <div class="mt-4 pt-4 border-t border-neutral-200">
        <h4 class="font-semibold mb-2 text-sm">¿Necesitás ayuda?</h4>
        <p class="text-sm text-neutral-600">
          Llamanos al <strong>+54 11 1234-5678</strong> o escribinos a <strong>info@nailsstudio.com</strong>
        </p>
      </div>
    </Card>

    <div class="text-center">
      <Button size="lg" @click="goHome">
        <Home :size="20" class="mr-2" />
        Volver al inicio
      </Button>
    </div>
  </div>
</template>
