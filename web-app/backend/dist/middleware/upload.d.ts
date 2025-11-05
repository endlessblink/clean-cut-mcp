import { Request, Response } from 'express';
export declare const uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const handleUpload: (req: Request, res: Response, next: Function) => void;
