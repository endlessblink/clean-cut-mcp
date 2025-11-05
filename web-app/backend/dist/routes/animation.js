"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.animationRoutes = void 0;
const express_1 = require("express");
const animationController_1 = require("../controllers/animationController");
const validation_1 = require("../middleware/validation");
const shared_1 = require("@clean-cut/shared");
const router = (0, express_1.Router)();
exports.animationRoutes = router;
const controller = new animationController_1.AnimationController();
// POST /api/animations/create - Create new animation (MCP: create_animation)
router.post('/create', (0, validation_1.validateRequest)(shared_1.CreateAnimationRequestSchema), controller.createAnimation);
// POST /api/animations/custom - Create custom animation from description (MCP: create_custom_animation)
router.post('/custom', controller.createCustomAnimation);
// GET /api/animations - List all animations (MCP: list_animations)
router.get('/', controller.listAnimations);
// GET /api/animations/:name - Read specific animation file (MCP: read_animation_file)
router.get('/:name', controller.readAnimation);
// PUT /api/animations/:name - Edit existing animation (MCP: edit_animation)
router.put('/:name', (0, validation_1.validateRequest)(shared_1.EditAnimationRequestSchema), controller.editAnimation);
// DELETE /api/animations/:name - Delete animation (MCP: delete_component)
router.delete('/:name', controller.deleteAnimation);
// POST /api/animations/format - Format animation code (MCP: format_code)
router.post('/format', controller.formatCode);
// POST /api/animations/validate-props - Validate component props (MCP: manage_props)
router.post('/validate-props', controller.validateProps);
// GET /api/animations/guidelines - Get animation guidelines (MCP: get_animation_guidelines)
router.get('/guidelines', controller.getAnimationGuidelines);
