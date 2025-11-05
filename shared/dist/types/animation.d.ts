import { z } from 'zod';
export declare const AnimationParamsSchema: z.ZodObject<{
    componentName: z.ZodString;
    duration: z.ZodNumber;
    fps: z.ZodDefault<z.ZodNumber>;
    width: z.ZodDefault<z.ZodNumber>;
    height: z.ZodDefault<z.ZodNumber>;
    props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    componentName: string;
    duration: number;
    fps: number;
    width: number;
    height: number;
    props?: Record<string, any> | undefined;
}, {
    componentName: string;
    duration: number;
    fps?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
    props?: Record<string, any> | undefined;
}>;
export declare const CreateAnimationRequestSchema: z.ZodObject<{
    code: z.ZodString;
    componentName: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
    validate: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    componentName: string;
    code: string;
    validate: boolean;
    duration?: number | undefined;
}, {
    componentName: string;
    code: string;
    duration?: number | undefined;
    validate?: boolean | undefined;
}>;
export declare const EditAnimationRequestSchema: z.ZodObject<{
    componentName: z.ZodString;
    changes: z.ZodRecord<z.ZodString, z.ZodAny>;
    preview: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    componentName: string;
    changes: Record<string, any>;
    preview: boolean;
}, {
    componentName: string;
    changes: Record<string, any>;
    preview?: boolean | undefined;
}>;
export declare const AnimationTemplateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodString;
    code: z.ZodString;
    props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    duration: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    duration: number;
    code: string;
    id: string;
    name: string;
    description: string;
    category: string;
    props?: Record<string, any> | undefined;
}, {
    duration: number;
    code: string;
    id: string;
    name: string;
    description: string;
    category: string;
    props?: Record<string, any> | undefined;
}>;
export type AnimationParams = z.infer<typeof AnimationParamsSchema>;
export type CreateAnimationRequest = z.infer<typeof CreateAnimationRequestSchema>;
export type EditAnimationRequest = z.infer<typeof EditAnimationRequestSchema>;
export type AnimationTemplate = z.infer<typeof AnimationTemplateSchema>;
export interface AnimationComponent {
    name: string;
    duration: number;
    code: string;
    props?: Record<string, any>;
    lastModified: Date;
}
export interface ValidationResult {
    valid: boolean;
    violations: string[];
    warnings: string[];
    fixes?: string[];
}
export interface AnimationExport {
    componentName: string;
    videoPath: string;
    thumbnailPath?: string;
    duration: number;
    fileSize: number;
    createdAt: Date;
}
