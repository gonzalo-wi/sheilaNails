# Guía de Desarrollo

## Estructura de Trabajo

### Agregar un Nuevo Módulo

1. Crear carpeta en `src/modules/{nombre-modulo}`
2. Estructura recomendada:
```
src/modules/mi-modulo/
├── api/
│   └── index.ts          # Llamadas a la API
├── store/
│   └── index.ts          # Pinia store (si es necesario)
├── layouts/
│   └── ModuloLayout.vue  # Layout específico
├── pages/
│   └── PaginaPrincipal.vue
└── components/           # Componentes específicos del módulo
```

3. Registrar rutas en `src/app/router/index.ts`

### Crear un Nuevo Componente UI

1. Crear archivo en `src/shared/components/ui/{NombreComponente}.vue`
2. Estructura básica:

```vue
<script setup lang="ts">
interface Props {
  // Props tipados
}

const props = withDefaults(defineProps<Props>(), {
  // Defaults
})

const emit = defineEmits<{
  // Eventos tipados
}>()
</script>

<template>
  <!-- Template -->
</template>
```

3. Exportar y usar en otros componentes

### Agregar un Endpoint de API

1. Abrir el archivo API correspondiente en `src/modules/{modulo}/api/index.ts`
2. Agregar función con tipado:

```typescript
export const miApi = {
  async getMiData(id: number): Promise<MiTipo> {
    const response = await apiClient.get<MiTipo>(`/mi-endpoint/${id}`)
    return response.data
  }
}
```

### Crear un Store de Pinia

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMiStore = defineStore('mi-store', () => {
  // State
  const data = ref<MiTipo[]>([])
  const loading = ref(false)

  // Getters
  const totalItems = computed(() => data.value.length)

  // Actions
  async function loadData() {
    loading.value = true
    try {
      data.value = await miApi.getData()
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    data,
    loading,
    // Getters
    totalItems,
    // Actions
    loadData,
  }
})
```

## Patrones Comunes

### Página con Listado y Filtros

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MiTipo } from '@/shared/types'

const items = ref<MiTipo[]>([])
const loading = ref(true)
const searchQuery = ref('')

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  return items.value.filter(/* lógica de filtrado */)
})

onMounted(async () => {
  await loadItems()
})

async function loadItems() {
  loading.value = true
  try {
    items.value = await api.getItems()
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Filtros -->
    <Card class="mb-6">
      <Input v-model="searchQuery" placeholder="Buscar..." />
    </Card>

    <!-- Loading State -->
    <Loading v-if="loading" />

    <!-- Empty State -->
    <EmptyState
      v-else-if="filteredItems.length === 0"
      title="Sin resultados"
    />

    <!-- Contenido -->
    <div v-else>
      <!-- Mostrar items -->
    </div>
  </div>
</template>
```

### Formulario con Validación

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'

const schema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
})

const form = ref({
  nombre: '',
  email: '',
})

const errors = ref({
  nombre: '',
  email: '',
})

function validate(): boolean {
  try {
    schema.parse(form.value)
    errors.value = { nombre: '', email: '' }
    return true
  } catch (err) {
    if (err instanceof z.ZodError) {
      err.errors.forEach((error) => {
        const field = error.path[0] as keyof typeof errors.value
        errors.value[field] = error.message
      })
    }
    return false
  }
}

async function handleSubmit() {
  if (!validate()) return
  
  try {
    await api.submit(form.value)
    // Success
  } catch (error) {
    // Error handling
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <Input
      v-model="form.nombre"
      label="Nombre"
      :error="errors.nombre"
    />
    <Input
      v-model="form.email"
      type="email"
      label="Email"
      :error="errors.email"
    />
    <Button type="submit">Enviar</Button>
  </form>
</template>
```

### Modal con Detalle/Acción

```vue
<script setup lang="ts">
import { ref } from 'vue'

const showModal = ref(false)
const selectedItem = ref<MiTipo | null>(null)

function openModal(item: MiTipo) {
  selectedItem.value = item
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedItem.value = null
}

async function handleAction() {
  if (!selectedItem.value) return
  
  try {
    await api.doAction(selectedItem.value.id)
    closeModal()
    // Recargar datos
  } catch (error) {
    // Error
  }
}
</script>

<template>
  <div>
    <!-- Trigger -->
    <Button @click="openModal(item)">Ver detalle</Button>

    <!-- Modal -->
    <Modal v-model="showModal" title="Detalle">
      <div v-if="selectedItem">
        <!-- Contenido del modal -->
      </div>
      
      <template #footer>
        <Button @click="handleAction">Acción</Button>
        <Button variant="outline" @click="closeModal">Cancelar</Button>
      </template>
    </Modal>
  </div>
</template>
```

## Buenas Prácticas

### TypeScript
- ✅ Siempre tipar props y emits
- ✅ Usar interfaces compartidas de `/shared/types`
- ✅ Evitar `any`, usar `unknown` si es necesario
- ❌ No usar `@ts-ignore` sin justificación
- ✅ Tipar respuestas de API

### Vue
- ✅ Usar Composition API con `<script setup>`
- ✅ Preferir `ref` para primitivos, `reactive` para objetos complejos
- ✅ Computed para valores derivados
- ✅ Watchers solo cuando sea necesario
- ❌ No mutar props directamente

### Estilos
- ✅ Usar clases de Tailwind
- ✅ Crear clases custom en `@layer components` si se repiten
- ✅ Mantener componentes sin estado de estilo (usar props)
- ❌ Evitar estilos inline salvo dinámicos
- ✅ Mobile-first (sm, md, lg, xl)

### Performance
- ✅ Lazy load de rutas con `() => import()`
- ✅ Computed memoizados
- ✅ v-show para toggles frecuentes, v-if para condicionales
- ✅ Keys en v-for
- ✅ Virtual scrolling para listas largas (considerar)

### Accesibilidad
- ✅ Labels en todos los inputs
- ✅ Alt text en imágenes
- ✅ Contraste adecuado
- ✅ Focus states visibles
- ✅ Anuncios con aria-live para cambios dinámicos

### Seguridad
- ❌ No guardar información sensible en localStorage
- ✅ Sanitizar inputs del usuario
- ✅ Tokens en headers, no en URLs
- ✅ HTTPS en producción

## Debugging

### Vue DevTools
1. Instalar extensión de browser
2. Ver componentes, state, router
3. Timeline de eventos

### Console Logging
```typescript
// Development only
if (import.meta.env.DEV) {
  console.log('Debug:', data)
}
```

### Network
- Ver llamadas en Network tab
- Verificar headers (Authorization)
- Revisar payloads y responses

## Testing

### Componentes
```typescript
import { mount } from '@vue/test-utils'
import MiComponente from './MiComponente.vue'

describe('MiComponente', () => {
  it('renderiza correctamente', () => {
    const wrapper = mount(MiComponente, {
      props: { /* props */ }
    })
    
    expect(wrapper.text()).toContain('Texto esperado')
  })
})
```

### API Calls (Mock)
```typescript
import { vi } from 'vitest'

vi.mock('@/app/axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: mockData }))
  }
}))
```

## Build y Deploy

### Build para Producción
```bash
npm run build

# Output en /dist
# Archivos optimizados, minified, tree-shaken
```

### Variables de Entorno
```bash
# .env.production
VITE_API_BASE_URL=https://api.produccion.com/api
```

### Deploy
- Servir contenido de `/dist`
- Configurar fallback a `index.html` para SPA routing
- HTTPS obligatorio
- Gzip/Brotli compression

## Checklist Pre-Commit

- [ ] No hay errores de TypeScript
- [ ] No hay warnings de ESLint
- [ ] Código formateado con Prettier
- [ ] Props y emits tipados
- [ ] Loading y empty states implementados
- [ ] Responsive en mobile
- [ ] Accesibilidad básica (labels, contraste)
- [ ] No hay console.logs en código final
- [ ] Nombres descriptivos en español

## Recursos

- [Vue 3 Docs](https://vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [FullCalendar](https://fullcalendar.io/docs)

## Soporte

Para dudas o problemas:
1. Revisar documentación inline en el código
2. Consultar este archivo y el README
3. Buscar en docs oficiales
4. Crear issue en el repositorio
