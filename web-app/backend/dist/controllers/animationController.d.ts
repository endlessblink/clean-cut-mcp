import { Request, Response } from 'express';
export declare class AnimationController {
    private animationService;
    constructor();
    createAnimation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createCustomAnimation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listAnimations: (req: Request, res: Response) => Promise<void>;
    readAnimation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    editAnimation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteAnimation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    formatCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    validateProps: (req: Request, res: Response) => Promise<void>;
    getAnimationGuidelines: (req: Request, res: Response) => Promise<void>;
    private generateComponentName;
}
