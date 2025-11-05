import { apiClient } from './api'
import { User, LoginCredentials, RegisterData, ApiResponse } from '@/types'

interface LoginResponse {
  user: User
  token: string
}

interface RegisterResponse {
  user: User
  token: string
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post('/api/auth/login', credentials)
  },

  register: async (data: RegisterData): Promise<ApiResponse<RegisterResponse>> => {
    return apiClient.post('/api/auth/register', data)
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiClient.get('/api/auth/me')
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    return apiClient.post('/api/auth/refresh')
  },

  logout: async (): Promise<ApiResponse> => {
    return apiClient.post('/api/auth/logout')
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    return apiClient.post('/api/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse> => {
    return apiClient.post('/api/auth/reset-password', { token, password })
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiClient.put('/api/auth/profile', data)
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    return apiClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    })
  }
}