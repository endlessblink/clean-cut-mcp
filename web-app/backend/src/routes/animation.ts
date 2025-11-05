import { Router } from 'express';
import { AnimationController } from '../controllers/animationController';
import { validateRequest } from '../middleware/validation';
import { CreateAnimationRequestSchema, EditAnimationRequestSchema } from '@clean-cut/shared';

const router = Router();
const controller = new AnimationController();

// POST /api/animations/create - Create new animation (MCP: create_animation)
router.post('/create', validateRequest(CreateAnimationRequestSchema), controller.createAnimation);

// POST /api/animations/custom - Create custom animation from description (MCP: create_custom_animation)
router.post('/custom', controller.createCustomAnimation);

// GET /api/animations - List all animations (MCP: list_animations)
router.get('/', controller.listAnimations);

// GET /api/animations/:name - Read specific animation file (MCP: read_animation_file)
router.get('/:name', controller.readAnimation);

// PUT /api/animations/:name - Edit existing animation (MCP: edit_animation)
router.put('/:name', validateRequest(EditAnimationRequestSchema), controller.editAnimation);

// DELETE /api/animations/:name - Delete animation (MCP: delete_component)
router.delete('/:name', controller.deleteAnimation);

// POST /api/animations/format - Format animation code (MCP: format_code)
router.post('/format', controller.formatCode);

// POST /api/animations/validate-props - Validate component props (MCP: manage_props)
router.post('/validate-props', controller.validateProps);

// GET /api/animations/guidelines - Get animation guidelines (MCP: get_animation_guidelines)
router.get('/guidelines', controller.getAnimationGuidelines);

export { router as animationRoutes };