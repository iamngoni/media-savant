export const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || 'Request failed')
  }

  return res.json() as Promise<T>
}
