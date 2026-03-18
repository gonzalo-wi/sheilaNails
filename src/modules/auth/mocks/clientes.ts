// Mock client accounts — passwords stored as plain text for mock purposes only.
// In production, this file is replaced by real API calls from src/modules/auth/api/index.ts

export interface MockCliente {
  id: number
  nombre: string
  apellido: string
  email: string
  password: string
  telefono: string
  createdAt: string
}

export const mockClientes: MockCliente[] = [
  {
    id: 1,
    nombre: 'María',
    apellido: 'González',
    email: 'maria@example.com',
    password: 'pass123',
    telefono: '1122334455',
    createdAt: '2025-01-15',
  },
  {
    id: 2,
    nombre: 'Carolina',
    apellido: 'Pérez',
    email: 'caro@example.com',
    password: 'pass123',
    telefono: '2233445566',
    createdAt: '2025-02-10',
  },
  {
    id: 3,
    nombre: 'Valentina',
    apellido: 'Sánchez',
    email: 'vale@example.com',
    password: 'pass123',
    telefono: '3344556677',
    createdAt: '2025-03-01',
  },
]
