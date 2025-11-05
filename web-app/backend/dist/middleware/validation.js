"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (validator) => {
    return (req, res, next) => {
        try {
            validator(req.body);
            next();
        }
        catch (error) {
            console.error('Validation error:', error);
            const response = {
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
exports.validateRequest = validateRequest;
