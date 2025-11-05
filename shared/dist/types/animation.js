"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationTemplateSchema = exports.EditAnimationRequestSchema = exports.CreateAnimationRequestSchema = exports.AnimationParamsSchema = void 0;
const zod_1 = require("zod");
// Animation component schemas
exports.AnimationParamsSchema = zod_1.z.object({
    componentName: zod_1.z.string(),
    duration: zod_1.z.number().positive(),
    fps: zod_1.z.number().positive().default(30),
    width: zod_1.z.number().positive().default(1920),
    height: zod_1.z.number().positive().default(1080),
    props: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.CreateAnimationRequestSchema = zod_1.z.object({
    code: zod_1.z.string(),
    componentName: zod_1.z.string(),
    duration: zod_1.z.number().positive().optional(),
    validate: zod_1.z.boolean().default(true),
});
exports.EditAnimationRequestSchema = zod_1.z.object({
    componentName: zod_1.z.string(),
    changes: zod_1.z.record(zod_1.z.any()),
    preview: zod_1.z.boolean().default(false),
});
exports.AnimationTemplateSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    category: zod_1.z.string(),
    code: zod_1.z.string(),
    props: zod_1.z.record(zod_1.z.any()).optional(),
    duration: zod_1.z.number().positive(),
});
