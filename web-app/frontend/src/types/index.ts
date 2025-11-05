// User authentication types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

// Project types
export interface Project {
  id: string
  name: string
  description?: string
  thumbnail?: string
  duration: number
  createdAt: string
  updatedAt: string
  userId: string
  settings: ProjectSettings
}

export interface ProjectSettings {
  resolution: {
    width: number
    height: number
  }
  frameRate: number
  quality: 'draft' | 'standard' | 'high'
}

// Video editor types
export interface VideoClip {
  id: string
  name: string
  duration: number
  startTime: number
  endTime: number
  track: 'video' | 'audio' | 'text' | 'effects'
  type: 'video' | 'image' | 'text' | 'audio'
  src: string
  thumbnail?: string
  volume?: number
  opacity?: number
  transform?: {
    x: number
    y: number
    scale: number
    rotation: number
  }
}

export interface TimelineTrack {
  id: string
  type: 'video' | 'audio' | 'text' | 'effects'
  name: string
  clips: VideoClip[]
  isLocked: boolean
  isMuted: boolean
  volume: number
}

export interface VideoProject {
  id: string
  name: string
  settings: ProjectSettings
  tracks: TimelineTrack[]
  duration: number
  currentTime: number
  zoom: number
}

// Template types
export interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  duration: number
  tags: string[]
  isPro: boolean
  createdAt: string
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}