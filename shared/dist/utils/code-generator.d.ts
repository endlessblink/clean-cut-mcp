import { ValidationResult } from '../types/animation';
export declare class CodeGenerator {
    /**
     * Generate animation code from natural language description
     */
    generateFromDescription(description: string, options?: {
        duration?: number;
        componentName?: string;
        props?: Record<string, any>;
    }): string;
    /**
     * Extract text content from description for text animations
     */
    private extractTextFromDescription;
    /**
     * Generate basic bouncing ball animation
     */
    private generateBasicBounce;
    /**
     * Generate basic sliding text animation
     */
    private generateBasicSlide;
    /**
     * Generate basic rotating animation
     */
    private generateBasicRotate;
    /**
     * Generate basic fade animation
     */
    private generateBasicFade;
    /**
     * Validate generated code against base rules
     */
    validateCode(code: string): ValidationResult;
}
export declare const codeGenerator: CodeGenerator;
