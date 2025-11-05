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
export declare const CreateProjectRequestSchema: {
    parse: (data: any) => CreateProjectRequest;
};
