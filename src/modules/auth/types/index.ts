// ─── Client Auth Types ───────────────────────────────────────────────────────

export interface ClienteAuth {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  createdAt: string
}

export interface ClienteLoginCredentials {
  email: string
  password: string
}

export interface ClienteRegisterData {
  nombre: string
  apellido: string
  email: string
  telefono: string
  password: string
  confirmPassword: string
}

export interface ClienteAuthResponse {
  token: string
  client_id: number
}
