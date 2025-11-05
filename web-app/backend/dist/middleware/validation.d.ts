import { Request, Response, NextFunction } from 'express';
export declare const validateRequest: (validator: (data: any) => any) => (req: Request, res: Response, next: NextFunction) => void;
