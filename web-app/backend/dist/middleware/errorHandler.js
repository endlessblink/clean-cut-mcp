"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error('Unhandled error:', error);
    // Default error response
    let statusCode = 500;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    // Handle specific error types
    if (error.name === 'ValidationError') {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        message = error.message;
    }
    else if (error.name === 'NotFoundError') {
        statusCode = 404;
        errorCode = 'NOT_FOUND';
        message = error.message;
    }
    else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        errorCode = 'UNAUTHORIZED';
        message = 'Unauthorized access';
    }
    else if (error.name === 'ForbiddenError') {
        statusCode = 403;
        errorCode = 'FORBIDDEN';
        message = 'Access forbidden';
    }
    const response = {
        success: false,
        error: errorCode,
        message,
        data: process.env.NODE_ENV === 'development' ? {
            stack: error.stack,
            details: error.message
        } : undefined
    };
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
