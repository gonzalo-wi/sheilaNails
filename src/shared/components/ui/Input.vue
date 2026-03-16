<script setup lang="ts">
interface InputProps {
  modelValue: string | number
  type?: string
  placeholder?: string
  label?: string
  error?: string
  helperText?: string
  disabled?: boolean
  required?: boolean
}

withDefaults(defineProps<InputProps>(), {
  type: 'text',
  placeholder: '',
  label: '',
  error: '',
  helperText: '',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="label">
      {{ label }}
      <span v-if="required" class="text-danger-500 ml-0.5">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="['input', { 'input-error': error }]"
      @input="handleInput"
    />
    <p v-if="error" class="mt-2 text-sm text-danger-600">
      {{ error }}
    </p>
    <p v-else-if="helperText" class="mt-2 text-sm text-neutral-500">
      {{ helperText }}
    </p>
  </div>
</template>
