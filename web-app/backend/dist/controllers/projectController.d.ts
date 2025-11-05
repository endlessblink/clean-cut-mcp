import { Request, Response } from 'express';
export declare class ProjectController {
    private readonly projectsDir;
    constructor();
    listProjects: (req: Request, res: Response) => Promise<void>;
    createProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
