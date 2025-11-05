import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginCredentials, RegisterData } from '@/types'
import { authService } from '@/services/authService'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authService.login(credentials)

          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isLoading: false,
              error: null
            })
          } else {
            set({
              user: null,
              token: null,
              isLoading: false,
              error: response.error || 'Login failed'
            })
          }
        } catch (error) {
          set({
            user: null,
            token: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed'
          })
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authService.register(data)

          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isLoading: false,
              error: null
            })
          } else {
            set({
              user: null,
              token: null,
              isLoading: false,
              error: response.error || 'Registration failed'
            })
          }
        } catch (error) {
          set({
            user: null,
            token: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed'
          })
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isLoading: false,
          error: null
        })
      },

      checkAuth: async () => {
        const { token } = get()

        if (!token) {
          set({ user: null, token: null, isLoading: false })
          return
        }

        set({ isLoading: true })

        try {
          const response = await authService.getCurrentUser()

          if (response.success && response.data) {
            set({
              user: response.data,
              isLoading: false,
              error: null
            })
          } else {
            set({
              user: null,
              token: null,
              isLoading: false,
              error: 'Session expired'
            })
          }
        } catch (error) {
          set({
            user: null,
            token: null,
            isLoading: false,
            error: 'Session expired'
          })
        }
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token
      })
    }
  )
)