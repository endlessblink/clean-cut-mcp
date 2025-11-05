"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProjectRequestSchema = void 0;
// Zod schema for validation
exports.CreateProjectRequestSchema = {
    parse: (data) => {
        if (!data || typeof data.name !== 'string') {
            throw new Error('Project name is required and must be a string');
        }
        return {
            name: data.name,
            description: data.description,
            settings: data.settings
        };
    }
};
