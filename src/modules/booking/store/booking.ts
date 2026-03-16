import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Servicio, Profesional, Turno } from '@/shared/types'
import apiClient from '@/app/axios'

export const useBookingStore = defineStore('booking', () => {
  // State
  const currentStep = ref(1)
  const selectedServicio = ref<Servicio | null>(null)
  const selectedProfesional = ref<Profesional | null>(null)
  const selectedFecha = ref<string>('')
  const selectedHora = ref<string>('')
  const clienteData = ref({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
  })
  const confirmedTurno = ref<Turno | null>(null)
  const loading = ref(false)

  // Getters
  const canContinue = computed(() => {
    switch (currentStep.value) {
      case 1:
        return !!selectedServicio.value
      case 2:
        return !!selectedProfesional.value
      case 3:
        return !!selectedFecha.value && !!selectedHora.value
      case 4:
        return (
          clienteData.value.nombre &&
          clienteData.value.apellido &&
          clienteData.value.email &&
          clienteData.value.telefono
        )
      default:
        return false
    }
  })

  const bookingSummary = computed(() => ({
    servicio: selectedServicio.value,
    profesional: selectedProfesional.value,
    fecha: selectedFecha.value,
    hora: selectedHora.value,
    cliente: clienteData.value,
  }))

  // Actions
  function nextStep() {
    if (canContinue.value && currentStep.value < 5) {
      currentStep.value++
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  function selectServicio(servicio: Servicio) {
    selectedServicio.value = servicio
  }

  function selectProfesional(profesional: Profesional) {
    selectedProfesional.value = profesional
  }

  function selectDateTime(fecha: string, hora: string) {
    selectedFecha.value = fecha
    selectedHora.value = hora
  }

  function updateClienteData(data: Partial<typeof clienteData.value>) {
    clienteData.value = { ...clienteData.value, ...data }
  }

  async function createTurno(): Promise<Turno> {
    if (!selectedServicio.value || !selectedProfesional.value) {
      throw new Error('Faltan datos del servicio o profesional')
    }

    loading.value = true
    try {
      const turnoData = {
        servicioId: selectedServicio.value.id,
        profesionalId: selectedProfesional.value.id,
        fecha: selectedFecha.value,
        horaInicio: selectedHora.value,
        cliente: clienteData.value,
      }

      const response = await apiClient.post<Turno>('/turnos', turnoData)
      confirmedTurno.value = response.data
      currentStep.value = 5
      return response.data
    } catch (error) {
      console.error('Error al crear turno:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function cancelTurno(turnoId: number): Promise<void> {
    loading.value = true
    try {
      await apiClient.patch(`/turnos/${turnoId}/cancelar`)
    } catch (error) {
      console.error('Error al cancelar turno:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function reset() {
    currentStep.value = 1
    selectedServicio.value = null
    selectedProfesional.value = null
    selectedFecha.value = ''
    selectedHora.value = ''
    clienteData.value = {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
    }
    confirmedTurno.value = null
  }

  return {
    // State
    currentStep,
    selectedServicio,
    selectedProfesional,
    selectedFecha,
    selectedHora,
    clienteData,
    confirmedTurno,
    loading,
    // Getters
    canContinue,
    bookingSummary,
    // Actions
    nextStep,
    prevStep,
    selectServicio,
    selectProfesional,
    selectDateTime,
    updateClienteData,
    createTurno,
    cancelTurno,
    reset,
  }
})
