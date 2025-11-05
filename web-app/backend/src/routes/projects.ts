import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { validateRequest } from '../middleware/validation';
import { CreateProjectRequestSchema } from '@clean-cut/shared';

const router = Router();
const controller = new ProjectController();

// GET /api/projects - List all projects
router.get('/', controller.listProjects);

// POST /api/projects - Create new project
router.post('/', validateRequest(CreateProjectRequestSchema), controller.createProject);

// GET /api/projects/:id - Get specific project
router.get('/:id', controller.getProject);

// PUT /api/projects/:id - Update project
router.put('/:id', controller.updateProject);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', controller.deleteProject);

export { router as projectRoutes };