<script setup lang="ts">
import Card from '@/shared/components/ui/Card.vue'
import { UserCircle2 } from 'lucide-vue-next'
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-display font-bold text-neutral-900 flex items-center">
        <UserCircle2 :size="32" class="mr-3 text-primary-600" />
        Profesionales
      </h1>
      <p class="text-neutral-600 mt-1">Equipo de trabajo y especialidades</p>
    </div>

    <Card>
      <div class="text-center py-12">
        <UserCircle2 :size="64" class="text-neutral-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-neutral-900 mb-2">Módulo en desarrollo</h3>
        <p class="text-neutral-600">
          Gestión completa del equipo: datos personales, especialidades, horarios de trabajo
          y disponibilidad.
        </p>
      </div>
    </Card>
  </div>
</template>
