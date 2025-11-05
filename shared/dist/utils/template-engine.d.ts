import { AnimationTemplate } from '../types/animation';
export declare class TemplateEngine {
    private templates;
    constructor();
    private initializeDefaultTemplates;
    private generateBouncingBallCode;
    private generateSlidingTextCode;
    private generateRotatingLogoCode;
    private generateFadeInOutCode;
    addTemplate(template: AnimationTemplate): void;
    getTemplate(id: string): AnimationTemplate | undefined;
    getTemplatesByCategory(category: string): AnimationTemplate[];
    getAllTemplates(): AnimationTemplate[];
    searchTemplates(query: string): AnimationTemplate[];
    generateCode(templateId: string, props?: Record<string, any>): string | null;
}
export declare const templateEngine: TemplateEngine;
