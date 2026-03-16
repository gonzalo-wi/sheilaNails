<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHorarios } from '@/composables/useHorarios'
import Loading from '@/shared/components/common/Loading.vue'
import { Clock, RotateCcw, Save, Plus, Trash2, Lock } from 'lucide-vue-next'
import type { BloqueoHorario } from '@/shared/types'

const {
  horarios, loading, saving,
  fetchAll, toggleDia, updateHorarioDia, toggleFranja, addBloqueo, removeBloqueo, resetDefaults
} = useHorarios()

const showBloqueoForm = ref<number | null>(null) // dia index
const nuevoBloqueo = ref({ horaInicio: '12:00', horaFin: '13:00', motivo: 'Almuerzo', tipo: 'ALMUERZO' as BloqueoHorario['tipo'] })

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const TIPOS_BLOQUEO: BloqueoHorario['tipo'][] = ['ALMUERZO', 'FERIADO', 'CAPACITACION', 'OTRO']

function colorTipoBloqueo(tipo: BloqueoHorario['tipo']) {
  const m: Record<string, string> = {
    ALMUERZO: 'bg-amber-100 text-amber-700',
    FERIADO: 'bg-red-100 text-red-700',
    CAPACITACION: 'bg-blue-100 text-blue-700',
    OTRO: 'bg-neutral-100 text-neutral-700',
  }
  return m[tipo] || m['OTRO']
}

async function handleAddBloqueo(diaIndex: number) {
  await addBloqueo(diaIndex, { ...nuevoBloqueo.value })
  showBloqueoForm.value = null
  nuevoBloqueo.value = { horaInicio: '12:00', horaFin: '13:00', motivo: 'Almuerzo', tipo: 'ALMUERZO' }
}

async function handleReset() {
  if (!confirm('¿Restablecer todos los horarios a los valores por defecto? Se perderán los cambios.')) return
  await resetDefaults()
}

onMounted(() => fetchAll())
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-neutral-900 flex items-center gap-2">
          <Clock :size="22" class="text-primary-500" />
          Horarios
        </h1>
        <p class="text-neutral-500 text-sm mt-0.5">Configuración de disponibilidad semanal</p>
      </div>
      <button class="btn btn-ghost btn-sm text-neutral-500 self-start" @click="handleReset">
        <RotateCcw :size="15" /> Restablecer por defecto
      </button>
    </div>

    <Loading v-if="loading" />

    <div v-else class="space-y-4">
      <div
        v-for="(horario, idx) in horarios"
        :key="horario.dia"
        class="bg-white rounded-xl shadow-soft overflow-hidden"
      >
        <!-- Day header -->
        <div class="flex items-center justify-between p-4 border-b border-neutral-100">
          <div class="flex items-center gap-3">
            <!-- Toggle switch -->
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              :class="horario.activo ? 'bg-primary-500' : 'bg-neutral-200'"
              @click="toggleDia(idx)"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                :class="horario.activo ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
            <div>
              <p class="font-semibold text-neutral-900">{{ DIAS[horario.dia] }}</p>
              <p v-if="!horario.activo" class="text-xs text-neutral-400">Cerrado</p>
              <p v-else class="text-xs text-neutral-500">{{ horario.horaApertura }} – {{ horario.horaCierre }}</p>
            </div>
          </div>

          <!-- Hours inputs when active -->
          <div v-if="horario.activo" class="flex items-center gap-2 text-sm">
            <div class="flex items-center gap-1.5">
              <label class="text-xs text-neutral-400">Apertura</label>
              <input
                :value="horario.horaApertura"
                type="time"
                class="input py-1 w-28 text-sm"
                @change="updateHorarioDia(idx, { horaApertura: ($event.target as HTMLInputElement).value })"
              />
            </div>
            <span class="text-neutral-300">—</span>
            <div class="flex items-center gap-1.5">
              <label class="text-xs text-neutral-400">Cierre</label>
              <input
                :value="horario.horaCierre"
                type="time"
                class="input py-1 w-28 text-sm"
                @change="updateHorarioDia(idx, { horaCierre: ($event.target as HTMLInputElement).value })"
              />
            </div>
          </div>
        </div>

        <!-- Slots grid -->
        <div v-if="horario.activo" class="p-4">
          <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Franjas horarias</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="franja in horario.franjas"
              :key="franja.hora"
              class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border"
              :class="franja.disponible
                ? 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'
                : 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-200 line-through'"
              @click="toggleFranja(horario.dia, franja.hora)"
            >
              {{ franja.hora }}
            </button>
          </div>

          <!-- Bloqueos -->
          <div class="mt-4 space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Bloqueos</p>
              <button
                class="text-xs text-primary-600 hover:underline flex items-center gap-1"
                @click="showBloqueoForm = showBloqueoForm === idx ? null : idx"
              >
                <Plus :size="12" /> Agregar
              </button>
            </div>

            <div v-for="(b, bi) in horario.bloqueos" :key="bi" class="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-2">
              <div class="flex items-center gap-2">
                <Lock :size="13" class="text-neutral-400" />
                <span class="text-sm text-neutral-700">{{ b.horaInicio }} – {{ b.horaFin }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full" :class="colorTipoBloqueo(b.tipo)">{{ b.motivo }}</span>
              </div>
              <button class="text-neutral-300 hover:text-danger-500 transition-colors" @click="removeBloqueo(idx, bi)">
                <Trash2 :size="14" />
              </button>
            </div>

            <!-- Add bloqueo form -->
            <div v-if="showBloqueoForm === idx" class="bg-primary-50 rounded-xl p-3 space-y-3 border border-primary-100">
              <p class="text-xs font-semibold text-primary-700">Nuevo bloqueo</p>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="label text-xs">Desde</label>
                  <input v-model="nuevoBloqueo.horaInicio" type="time" class="input text-sm py-1" />
                </div>
                <div>
                  <label class="label text-xs">Hasta</label>
                  <input v-model="nuevoBloqueo.horaFin" type="time" class="input text-sm py-1" />
                </div>
                <div>
                  <label class="label text-xs">Tipo</label>
                  <select v-model="nuevoBloqueo.tipo" class="input text-sm py-1">
                    <option v-for="t in TIPOS_BLOQUEO" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                <div>
                  <label class="label text-xs">Motivo</label>
                  <input v-model="nuevoBloqueo.motivo" type="text" placeholder="Ej: Almuerzo" class="input text-sm py-1" />
                </div>
              </div>
              <div class="flex gap-2 justify-end">
                <button class="btn btn-ghost btn-sm" @click="showBloqueoForm = null">Cancelar</button>
                <button class="btn btn-primary btn-sm" :disabled="saving" @click="handleAddBloqueo(idx)">
                  <Save :size="13" /> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
