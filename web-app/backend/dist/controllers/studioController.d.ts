import { Request, Response } from 'express';
export declare class StudioController {
    private readonly workspaceDir;
    private readonly studioPort;
    constructor();
    getStudioUrl: (req: Request, res: Response) => Promise<void>;
    getExportDirectory: (req: Request, res: Response) => Promise<void>;
    openExportDirectory: (req: Request, res: Response) => Promise<void>;
    syncRoot: (req: Request, res: Response) => Promise<void>;
    rebuildCompositions: (req: Request, res: Response) => Promise<void>;
    cleanupBrokenImports: (req: Request, res: Response) => Promise<void>;
    private checkStudioStatus;
    private syncRootTsx;
    private rebuildRootTsx;
    private cleanupImports;
}
