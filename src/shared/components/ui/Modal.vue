<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface ModalProps {
  modelValue: boolean
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const props = withDefaults(defineProps<ModalProps>(), {
  modelValue: false,
  title: '',
  maxWidth: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}

function close() {
  emit('update:modelValue', false)
}

function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="overlay"
        @click="handleOverlayClick"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="modelValue"
            :class="['card w-full', maxWidthClasses[maxWidth]]"
          >
            <div v-if="title" class="flex items-center justify-between p-6 border-b border-neutral-200">
              <h3 class="text-xl font-semibold text-neutral-900">{{ title }}</h3>
              <button
                type="button"
                class="text-neutral-400 hover:text-primary-600 transition-all duration-200 hover:rotate-90 focus-ring rounded-lg p-1"
                @click="close"
              >
                <X :size="24" />
              </button>
            </div>
            <div class="p-6">
              <slot />
            </div>
            <div v-if="$slots.footer" class="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 bg-neutral-50">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
