import { create } from 'zustand'

type SessionState = {
  isAuthenticated: boolean
  username?: string
  serverUrl?: string
  userId?: string
  setSession: (data: { username: string; serverUrl: string; userId: string }) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: false,
  setSession: (data) =>
    set({
      isAuthenticated: true,
      username: data.username,
      serverUrl: data.serverUrl,
      userId: data.userId,
    }),
  clearSession: () =>
    set({ isAuthenticated: false, username: undefined, serverUrl: undefined, userId: undefined }),
}))
