import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SessionUser } from '@/lib/types'

interface AuthState {
  token: string | null
  user: SessionUser | null
  setToken: (token: string | null) => void
  setUser: (user: SessionUser | null) => void
  setSession: (token: string, user: SessionUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'admin-auth' },
  ),
)
