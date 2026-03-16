# 💅 Nails Studio - Frontend Application

Sistema completo de gestión y reservas para un local de uñas. Aplicación profesional con arquitectura modular, desarrollada con Vue 3, TypeScript y las mejores prácticas de desarrollo frontend.

## 🚀 Stack Tecnológico

### Core
- **Vue 3** - Composition API con `<script setup>`
- **TypeScript** - Tipado estricto
- **Vite** - Build tool ultrarrápido
- **Vue Router** - Navegación con guards
- **Pinia** - State management

### UI/UX
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Vue Next** - Íconos profesionales
- **FullCalendar** - Calendario interactivo para agenda
- **date-fns** - Manipulación de fechas

### Networking & Validation
- **Axios** - Cliente HTTP con interceptors
- **Zod** - Esquemas de validación
- **VeeValidate** - Validación de formularios

### Code Quality
- **ESLint** - Linter con reglas estrictas
- **Prettier** - Formateador de código consistente
- **TypeScript** - Sin `any`, tipado completo

## 📁 Estructura del Proyecto

```
src/
├── app/                      # Configuración global de la app
│   ├── axios/               # Cliente HTTP y interceptors
│   └── router/              # Configuración de rutas y guards
├── modules/                 # Módulos funcionales
│   ├── public/              # Sitio público (landing)
│   │   ├── api/
│   │   ├── layouts/
│   │   └── pages/
│   ├── booking/             # Sistema de reserva de turnos
│   │   ├── api/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── store/           # Pinia store del booking flow
│   └── admin/               # Panel administrativo
│       ├── api/
│       ├── layouts/
│       ├── pages/
│       └── store/           # Auth store
└── shared/                  # Recursos compartidos
    ├── components/
    │   ├── ui/              # Design system (Button, Input, Card, etc.)
    │   └── common/          # Componentes comunes (Loading, Empty, etc.)
    ├── composables/         # Hooks reutilizables
    ├── styles/              # Estilos globales (Tailwind)
    ├── types/               # TypeScript types e interfaces
    └── utils/               # Utilidades y helpers
```

## 🎨 Características Principales

### 🌐 Sitio Público
- **Landing moderna** con diseño "beauty tech"
- Hero section con CTAs prominentes
- Catálogo de servicios con precios y duraciones
- Testimonios de clientes
- FAQ con preguntas frecuentes
- Sección de contacto y ubicación
- Diseño completamente responsive

### 📅 Sistema de Reservas
Flow de 4 pasos para reservar turnos:
1. **Selección de servicio** - Grid visual con precios y duración
2. **Elección de profesional** - Cards con especialidades
3. **Fecha y horario** - Calendario integrado con disponibilidad real time
4. **Datos del cliente** - Formulario validado + resumen de reserva
5. **Confirmación** - Pantalla de éxito con detalles y opciones

### 🔐 Panel Administrativo
- **Dashboard** con métricas clave (turnos, ingresos, ocupación)
- **Agenda/Calendario** - Vista mensual/semanal/diaria con FullCalendar
- **Gestión de turnos** - Tabla con filtros, búsqueda y export CSV
- **Clientes** - CRUD completo con historial
- **Servicios** - Gestión de catálogo
- **Profesionales** - Equipo y especialidades
- **Configuración** - Ajustes del sistema

Características del admin:
- Sidebar responsive con navegación intuitiva
- Cambio de estado de turnos en tiempo real
- Filtros avanzados y búsqueda
- Loading states y empty states
- Modal system para detalles y acciones

## 🔧 Instalación y Configuración

### Requisitos Previos
- Node.js >= 18
- npm >= 9

### Instalación

```bash
# Clonar el repositorio
cd nails-app

# Instalar dependencias
npm install --legacy-peer-deps

# Copiar archivo de configuración
copy .env.example .env
```

### Configuración del archivo `.env`

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# Application
VITE_APP_NAME=Nails Studio
VITE_APP_TIMEZONE=America/Argentina/Buenos_Aires
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo - Inicia servidor en http://localhost:5173
npm run dev

# Build para producción
npm run build

# Preview del build de producción
npm run preview

# Linting
npm run lint

# Formateo de código
npm run format
```

## 🔌 Integración con Backend

### Endpoints Esperados

El frontend asume los siguientes endpoints REST:

#### Auth
- `POST /auth/login` - Login de admin
- `POST /auth/refresh` - Refresh token (opcional)

#### Servicios (Público)
- `GET /servicios` - Lista de servicios activos
- `GET /servicios/:id` - Detalle de servicio

#### Profesionales (Público)
- `GET /profesionales` - Lista de profesionales activos
- `GET /profesionales/:id` - Detalle de profesional

#### Disponibilidad
- `GET /disponibilidad?servicioId={id}&profesionalId={id}&fecha={YYYY-MM-DD}`
  ```json
  {
    "fecha": "2026-02-25",
    "slots": [
      { "hora": "09:00", "disponible": true },
      { "hora": "09:30", "disponible": false }
    ]
  }
  ```

#### Turnos (Público)
- `POST /turnos` - Crear nuevo turno
- `PATCH /turnos/:id/cancelar` - Cancelar turno

#### Admin - Turnos
- `GET /admin/turnos` - Lista con filtros
- `GET /admin/turnos/:id` - Detalle
- `POST /admin/turnos` - Crear
- `PUT /admin/turnos/:id` - Actualizar
- `PATCH /admin/turnos/:id/estado` - Cambiar estado
- `DELETE /admin/turnos/:id` - Eliminar
- `GET /admin/turnos/export` - Export CSV

#### Admin - CRUD Genérico
Mismo patrón para `/admin/clientes`, `/admin/servicios`, `/admin/profesionales`:
- `GET /admin/{resource}` - Listado
- `GET /admin/{resource}/:id` - Detalle
- `POST /admin/{resource}` - Crear
- `PUT /admin/{resource}/:id` - Actualizar
- `DELETE /admin/{resource}/:id` - Eliminar

### Formato de Respuestas

```typescript
// Respuesta exitosa
{
  "data": {...},
  "message": "Operación exitosa",
  "success": true
}

// Respuesta con paginación
{
  "data": [...],
  "total": 150,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}

// Error
{
  "error": "Mensaje de error",
  "success": false
}
```

## 🎯 Detalles de Implementación

### Autenticación
- JWT guardado en `localStorage`
- Interceptor de Axios agrega token automáticamente
- Logout automático en 401
- Navigation guard protege rutas admin

### State Management
- **Auth Store**: Gestiona usuario, tokens y login/logout
- **Booking Store**: Maneja el flow completo de reserva paso a paso

### Validación
- Validación en tiempo real con VeeValidate
- Esquemas de validación con Zod
- Mensajes de error contextuales

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Sidebar colapsable en mobile
- Tablas con scroll horizontal en pantallas pequeñas

### Accesibilidad
- Labels en todos los inputs
- Contraste adecuado (WCAG AA)
- Focus states visibles
- Navegación por teclado

## 🎨 Design System

### Colors
- **Primary**: Rosa (#ec4899) - Accent principal
- **Neutral**: Grises neutros para texto y fondos
- **Semantic**: Verde (success), Amarillo (warning), Rojo (error)

### Componentes UI
- `Button` - Variants: primary, secondary, outline, ghost
- `Input` - Con label, error states y validación
- `Card` - Contenedor con sombras suaves
- `Badge` - Estados visuales (pendiente, confirmado, etc.)
- `Modal` - Diálogos con backdrop y animaciones
- `Loading` - Spinner con mensaje
- `EmptyState` - Estado vacío consistente

## 🧪 Modo Mock/Demo

El proyecto incluye datos mock para desarrollo sin backend:
- Servicios de ejemplo
- Profesionales de prueba
- Turnos simulados
- Estados de disponibilidad

Para conectar con backend real, descomentar las llamadas a API en cada componente.

## 📝 Notas de Desarrollo

### TypeScript
- Tipado estricto activado
- No se permite `any`
- Todos los props y emits tipados
- Interfaces compartidas en `/shared/types`

### Estilos
- Utility-first con Tailwind
- Clases custom en `@layer components`
- Evitar CSS inline salvo excepciones
- Animaciones con Tailwind o transitions

### Convenciones
- Componentes en PascalCase
- Composables con prefijo `use`
- Constantes en UPPER_SNAKE_CASE
- Nombres descriptivos en español

## 🚧 Roadmap y Mejoras Futuras

- [ ] Implementar refresh token automático
- [ ] Notificaciones con Sonner
- [ ] Upload de imágenes (servicios, profesionales)
- [ ] Drag & drop en calendario
- [ ] Exportación a PDF
- [ ] Dashboard con gráficos (Chart.js)
- [ ] PWA (Progressive Web App)
- [ ] i18n (multiidioma)
- [ ] Tests unitarios (Vitest)
- [ ] Tests E2E (Playwright)

## 👥 Autor

Proyecto generado por GitHub Copilot con arquitectura limpia y mejores prácticas de Vue 3 + TypeScript.

## 📄 Licencia

MIT License - Uso libre para proyectos personales y comerciales.

---

**¿Necesitás ayuda?** Revisá la documentación de Vue 3 y TypeScript, o consultá los comentarios en el código fuente.
