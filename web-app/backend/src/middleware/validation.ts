import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@clean-cut/shared';

export const validateRequest = (validator: (data: any) => any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      validator(req.body);
      next();
    } catch (error) {
      console.error('Validation error:', error);

      const response: ApiResponse = {
        success: false,
        error: 'VALIDATION_FAILED',
        message: 'Request validation failed',
        data: {
          errors: error instanceof Error ? error.message : 'Invalid request data'
        }
      };

      res.status(400).json(response);
    }
  };
};