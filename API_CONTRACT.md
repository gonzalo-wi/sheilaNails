# API Contract Documentation

Este documento detalla el contrato esperado entre el frontend y el backend.

## Base URL
```
http://localhost:8080/api
```

## Autenticación

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}

Response 200:
{
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "nombre": "Admin",
      "apellido": "Usuario",
      "rol": "ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Opcional
  },
  "success": true
}
```

### Refresh Token (Opcional)
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response 200:
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "success": true
}
```

## Endpoints Públicos

### Servicios

#### Listar Servicios
```http
GET /servicios

Response 200:
{
  "data": [
    {
      "id": 1,
      "nombre": "Manicura Clásica",
      "descripcion": "Cuidado completo de manos con esmaltado tradicional",
      "duracion": 45,
      "precio": 3500,
      "categoria": "Manicura",
      "imagen": "https://...",
      "activo": true,
      "createdAt": "2026-01-01T10:00:00Z",
      "updatedAt": "2026-01-01T10:00:00Z"
    }
  ],
  "success": true
}
```

#### Detalle de Servicio
```http
GET /servicios/{id}

Response 200:
{
  "data": {
    "id": 1,
    "nombre": "Manicura Clásica",
    "descripcion": "...",
    "duracion": 45,
    "precio": 3500,
    "categoria": "Manicura",
    "activo": true
  },
  "success": true
}
```

### Profesionales

#### Listar Profesionales
```http
GET /profesionales

Response 200:
{
  "data": [
    {
      "id": 1,
      "nombre": "Ana",
      "apellido": "García",
      "email": "ana@example.com",
      "telefono": "+54 11 1234-5678",
      "foto": "https://...",
      "especialidades": ["Manicura", "Nail Art"],
      "activo": true,
      "horarios": [
        {
          "dia": 1,
          "horaInicio": "09:00",
          "horaFin": "18:00",
          "activo": true
        }
      ]
    }
  ],
  "success": true
}
```

### Disponibilidad

#### Obtener Slots Disponibles
```http
GET /disponibilidad?servicioId=1&profesionalId=2&fecha=2026-02-25

Response 200:
{
  "data": {
    "fecha": "2026-02-25",
    "slots": [
      {
        "hora": "09:00",
        "disponible": true,
        "turnoId": null
      },
      {
        "hora": "09:30",
        "disponible": false,
        "turnoId": 123
      },
      {
        "hora": "10:00",
        "disponible": true,
        "turnoId": null
      }
    ]
  },
  "success": true
}
```

### Turnos (Público)

#### Crear Turno
```http
POST /turnos
Content-Type: application/json
Authorization: No requerido (público)

{
  "servicioId": 1,
  "profesionalId": 2,
  "fecha": "2026-02-25",
  "horaInicio": "10:00",
  "cliente": {
    "nombre": "María",
    "apellido": "López",
    "email": "maria@example.com",
    "telefono": "+54 11 1234-5678"
  }
}

Response 201:
{
  "data": {
    "id": 123,
    "servicioId": 1,
    "profesionalId": 2,
    "clienteId": 45, // Creado o encontrado
    "fecha": "2026-02-25",
    "horaInicio": "10:00",
    "horaFin": "10:45",
    "estado": "PENDIENTE",
    "precioFinal": 3500,
    "servicio": { ... },
    "profesional": { ... },
    "cliente": { ... },
    "createdAt": "2026-02-22T15:30:00Z"
  },
  "success": true,
  "message": "Turno creado exitosamente"
}
```

#### Cancelar Turno
```http
PATCH /turnos/{id}/cancelar

Response 200:
{
  "data": {
    "id": 123,
    "estado": "CANCELADO",
    ...
  },
  "success": true,
  "message": "Turno cancelado"
}
```

## Endpoints Administrativos

Todos los endpoints admin requieren autenticación:
```http
Authorization: Bearer {accessToken}
```

### Dashboard Stats
```http
GET /admin/dashboard/stats

Response 200:
{
  "data": {
    "turnosHoy": 12,
    "turnosSemana": 48,
    "turnosMes": 156,
    "ingresosMes": 890000,
    "clientesNuevos": 23,
    "tasaOcupacion": 78
  },
  "success": true
}
```

### Turnos

#### Listar Turnos con Filtros
```http
GET /admin/turnos?fechaDesde=2026-02-01&fechaHasta=2026-02-29&estado=CONFIRMADO&profesionalId=1

Response 200:
{
  "data": [
    {
      "id": 1,
      "servicioId": 1,
      "servicio": { ... },
      "profesionalId": 1,
      "profesional": { ... },
      "clienteId": 10,
      "cliente": { ... },
      "fecha": "2026-02-24",
      "horaInicio": "10:00",
      "horaFin": "11:00",
      "estado": "CONFIRMADO",
      "notas": "Cliente prefiere esmalte mate",
      "precioFinal": 3500,
      "createdAt": "2026-02-20T10:00:00Z",
      "updatedAt": "2026-02-21T14:30:00Z"
    }
  ],
  "success": true
}
```

#### Actualizar Estado
```http
PATCH /admin/turnos/{id}/estado
Content-Type: application/json

{
  "estado": "COMPLETADO"
}

Response 200:
{
  "data": {
    "id": 1,
    "estado": "COMPLETADO",
    ...
  },
  "success": true
}
```

#### Exportar Turnos
```http
GET /admin/turnos/export?fechaDesde=2026-02-01&fechaHasta=2026-02-29

Response 200:
Content-Type: text/csv
Content-Disposition: attachment; filename="turnos-2026-02-22.csv"

id,fecha,hora,cliente,servicio,profesional,estado,precio
1,2026-02-24,10:00,María López,Manicura Clásica,Ana García,CONFIRMADO,3500
...
```

### Clientes

#### Listar Clientes (Paginado)
```http
GET /admin/clientes?page=1&pageSize=20

Response 200:
{
  "data": [
    {
      "id": 1,
      "nombre": "María",
      "apellido": "López",
      "email": "maria@example.com",
      "telefono": "+54 11 1234-5678",
      "fechaNacimiento": "1990-05-15",
      "notas": "Alérgica al acetona",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-02-10T15:00:00Z"
    }
  ],
  "total": 156,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}
```

#### Crear/Actualizar/Eliminar Cliente
```http
POST /admin/clientes
PUT /admin/clientes/{id}
DELETE /admin/clientes/{id}
```

### Servicios Admin

```http
GET /admin/servicios
POST /admin/servicios
PUT /admin/servicios/{id}
DELETE /admin/servicios/{id}
```

### Profesionales Admin

```http
GET /admin/profesionales
POST /admin/profesionales
PUT /admin/profesionales/{id}
DELETE /admin/profesionales/{id}
```

## Estados de Turno

```typescript
enum EstadoTurno {
  PENDIENTE = 'PENDIENTE',       // Reserva creada, sin confirmar
  CONFIRMADO = 'CONFIRMADO',     // Confirmada por admin/cliente
  COMPLETADO = 'COMPLETADO',     // Servicio realizado
  CANCELADO = 'CANCELADO',       // Cancelado antes de realizarse
  NO_SHOW = 'NO_SHOW'            // Cliente no se presentó
}
```

## Códigos de Error

```http
400 Bad Request - Datos inválidos
{
  "error": "El email es requerido",
  "success": false
}

401 Unauthorized - No autenticado
{
  "error": "Token inválido o expirado",
  "success": false
}

403 Forbidden - Sin permisos
{
  "error": "No tenés permisos para esta acción",
  "success": false
}

404 Not Found - Recurso no encontrado
{
  "error": "Turno no encontrado",
  "success": false
}

409 Conflict - Conflicto de estado
{
  "error": "El horario ya no está disponible",
  "success": false
}

500 Internal Server Error - Error del servidor
{
  "error": "Error interno del servidor",
  "success": false
}
```

## Notas de Implementación

1. **Timezone**: Todas las fechas/horas deben estar en UTC. El frontend maneja la conversión a `America/Argentina/Buenos_Aires`.

2. **Validación**: El backend debe validar:
   - Que los horarios solicitados estén dentro del horario de trabajo del profesional
   - Que no haya overlapping de turnos
   - Que los datos del cliente sean válidos

3. **Relaciones**: Incluir objetos relacionados cuando sea posible (`servicio`, `profesional`, `cliente` dentro de `turno`).

4. **Paginación**: Usar el formato estándar con `page`, `pageSize`, `total`, `totalPages`.

5. **Filtros**: Soportar query params opcionales para filtrado y búsqueda.
