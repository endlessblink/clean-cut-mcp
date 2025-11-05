import { Request, Response } from 'express';
export declare class AssetController {
    private readonly assetsDir;
    constructor();
    uploadAsset: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listAssets: (req: Request, res: Response) => Promise<void>;
    deleteAsset: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    private getMimeType;
}
