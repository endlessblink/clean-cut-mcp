"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRoutes = void 0;
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const validation_1 = require("../middleware/validation");
const shared_1 = require("@clean-cut/shared");
const router = (0, express_1.Router)();
exports.projectRoutes = router;
const controller = new projectController_1.ProjectController();
// GET /api/projects - List all projects
router.get('/', controller.listProjects);
// POST /api/projects - Create new project
router.post('/', (0, validation_1.validateRequest)(shared_1.CreateProjectRequestSchema), controller.createProject);
// GET /api/projects/:id - Get specific project
router.get('/:id', controller.getProject);
// PUT /api/projects/:id - Update project
router.put('/:id', controller.updateProject);
// DELETE /api/projects/:id - Delete project
router.delete('/:id', controller.deleteProject);
