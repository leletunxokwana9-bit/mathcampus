import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/client'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Actions ──────────────────────────────────────────────
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (accessToken) => set({ accessToken }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // ── Register ─────────────────────────────────────────────
      register: async ({ name, email, password, role }) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/register', { name, email, password, role })
          set({
            user: data.user,
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed'
          set({ error: message, isLoading: false })
          return { success: false, message }
        }
      },

      // ── Login ────────────────────────────────────────────────
      login: async ({ email, password }) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({
            user: data.user,
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.message || 'Invalid credentials'
          set({ error: message, isLoading: false })
          return { success: false, message }
        }
      },

      // ── Logout ───────────────────────────────────────────────
      logout: async () => {
        try { await api.post('/auth/logout') } catch (_) {}
        delete api.defaults.headers.common['Authorization']
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      // ── Refresh token ────────────────────────────────────────
      refreshToken: async () => {
        try {
          const { data } = await api.post('/auth/refresh')
          set({ accessToken: data.accessToken })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
          return data.accessToken
        } catch {
          get().logout()
          return null
        }
      },

      // ── Hydrate token into axios on app start ─────────────────
      hydrate: () => {
        const token = get().accessToken
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      },
    }),
    {
      name: 'mathcampus-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
