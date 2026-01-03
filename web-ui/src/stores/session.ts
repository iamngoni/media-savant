import { create } from 'zustand'

export type Library = {
  Id: string
  Name: string
  CollectionType?: string
}

type SessionState = {
  isAuthenticated: boolean
  username?: string
  serverUrl?: string
  userId?: string
  libraries: Library[]
  setSession: (data: { username: string; serverUrl: string; userId: string }) => void
  setLibraries: (libraries: Library[]) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: false,
  libraries: [],
  setSession: (data) =>
    set({
      isAuthenticated: true,
      username: data.username,
      serverUrl: data.serverUrl,
      userId: data.userId,
    }),
  setLibraries: (libraries) => set({ libraries }),
  clearSession: () =>
    set({
      isAuthenticated: false,
      username: undefined,
      serverUrl: undefined,
      userId: undefined,
      libraries: [],
    }),
}))
