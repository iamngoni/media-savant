import { apiFetch } from './api'

export type SessionInfo = {
  session_id: string
  user_id: string
  username: string
  server_url: string
}

export async function fetchSession() {
  return apiFetch<{ success: boolean; data?: SessionInfo }>(`/auth/me`)
}

export async function login(payload: {
  server_url: string
  username: string
  password: string
  device_id?: string
}) {
  return apiFetch<{ success: boolean; data?: SessionInfo; error?: string }>(`/auth/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function logout() {
  return apiFetch(`/auth/logout`, { method: 'POST' })
}

export async function validateServer(server_url: string) {
  return apiFetch(`/setup/validate`, {
    method: 'POST',
    body: JSON.stringify({ server_url }),
  })
}
