// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Animation API endpoints
export interface CreateAnimationResponse {
  componentName: string;
  code: string;
  validation: {
    valid: boolean;
    violations: string[];
    warnings: string[];
  };
  filePath: string;
}

export interface ListAnimationsResponse {
  animations: Array<{
    name: string;
    duration: number;
    lastModified: string;
    thumbnail?: string;
  }>;
}

export interface GetStudioUrlResponse {
  url: string;
  port: number;
  status: 'running' | 'stopped' | 'error';
}

// Asset management
export interface AssetUploadResponse {
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface AssetInfo {
  filename: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

// Project management
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  animations: string[];
  assets: string[];
  settings: ProjectSettings;
}

export interface ProjectSettings {
  defaultDuration: number;
  defaultFps: number;
  defaultResolution: {
    width: number;
    height: number;
  };
  theme: 'tech' | 'corporate' | 'creative' | 'minimal';
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
}

// Zod schema for validation
export const CreateProjectRequestSchema = {
  parse: (data: any): CreateProjectRequest => {
    if (!data || typeof data.name !== 'string') {
      throw new Error('Project name is required and must be a string');
    }
    return {
      name: data.name,
      description: data.description,
      settings: data.settings
    };
  }
};