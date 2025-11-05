import { z } from 'zod';

// Animation component schemas
export const AnimationParamsSchema = z.object({
  componentName: z.string(),
  duration: z.number().positive(),
  fps: z.number().positive().default(30),
  width: z.number().positive().default(1920),
  height: z.number().positive().default(1080),
  props: z.record(z.any()).optional(),
});

export const CreateAnimationRequestSchema = z.object({
  code: z.string(),
  componentName: z.string(),
  duration: z.number().positive().optional(),
  validate: z.boolean().default(true),
});

export const EditAnimationRequestSchema = z.object({
  componentName: z.string(),
  changes: z.record(z.any()),
  preview: z.boolean().default(false),
});

export const AnimationTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  code: z.string(),
  props: z.record(z.any()).optional(),
  duration: z.number().positive(),
});

// Types
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