export declare class AnimationService {
    private readonly workspaceDir;
    private readonly animationsDir;
    constructor();
    createAnimation({ code, componentName, duration }: {
        code: string;
        componentName: string;
        duration: number;
    }): Promise<{
        componentName: string;
        filePath: string;
        code: string;
    }>;
    listAnimations(): Promise<Array<{
        name: string;
        duration: number;
        lastModified: string;
        thumbnail?: string;
    }>>;
    readAnimation(name: string): Promise<{
        name: string;
        code: string;
        lastModified: string;
    } | null>;
    editAnimation(name: string, changes: Record<string, any>, preview?: boolean): Promise<{
        name: string;
        code: string;
        changes: Record<string, any>;
    }>;
    deleteAnimation(name: string): Promise<void>;
    formatCode(code: string): Promise<string>;
    validateProps(componentName: string, props: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
    }>;
    getAnimationGuidelines(): Promise<{
        rules: string[];
        bestPractices: string[];
        examples: string[];
    }>;
    private formatCodeString;
    private updateRootTsx;
    private removeFromRootTsx;
    private extractDurationFromCode;
}
