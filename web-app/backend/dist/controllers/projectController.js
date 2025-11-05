"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const uuid_1 = require("uuid");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class ProjectController {
    constructor() {
        this.listProjects = async (req, res) => {
            try {
                const files = await fs_extra_1.default.readdir(this.projectsDir);
                const projects = await Promise.all(files
                    .filter(file => file.endsWith('.json'))
                    .map(async (filename) => {
                    const filePath = path_1.default.join(this.projectsDir, filename);
                    const content = await fs_extra_1.default.readJson(filePath);
                    return content;
                }));
                res.json({
                    success: true,
                    data: projects,
                    message: `Found ${projects.length} projects`
                });
            }
            catch (error) {
                console.error('Error listing projects:', error);
                res.status(500).json({
                    success: false,
                    error: 'LIST_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.createProject = async (req, res) => {
            try {
                const { name, description, settings } = req.body;
                if (!name) {
                    return res.status(400).json({
                        success: false,
                        error: 'MISSING_NAME',
                        message: 'Project name is required'
                    });
                }
                const project = {
                    id: (0, uuid_1.v4)(),
                    name,
                    description,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    animations: [],
                    assets: [],
                    settings: {
                        defaultDuration: 5,
                        defaultFps: 30,
                        defaultResolution: { width: 1920, height: 1080 },
                        theme: 'tech',
                        ...settings
                    }
                };
                const filePath = path_1.default.join(this.projectsDir, `${project.id}.json`);
                await fs_extra_1.default.writeJson(filePath, project, { spaces: 2 });
                res.json({
                    success: true,
                    data: project,
                    message: `Project '${name}' created successfully`
                });
            }
            catch (error) {
                console.error('Error creating project:', error);
                res.status(500).json({
                    success: false,
                    error: 'CREATE_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.getProject = async (req, res) => {
            try {
                const { id } = req.params;
                const filePath = path_1.default.join(this.projectsDir, `${id}.json`);
                if (!await fs_extra_1.default.pathExists(filePath)) {
                    return res.status(404).json({
                        success: false,
                        error: 'PROJECT_NOT_FOUND',
                        message: `Project with id '${id}' not found`
                    });
                }
                const project = await fs_extra_1.default.readJson(filePath);
                res.json({
                    success: true,
                    data: project,
                    message: `Project '${project.name}' retrieved successfully`
                });
            }
            catch (error) {
                console.error('Error getting project:', error);
                res.status(500).json({
                    success: false,
                    error: 'GET_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.updateProject = async (req, res) => {
            try {
                const { id } = req.params;
                const updates = req.body;
                const filePath = path_1.default.join(this.projectsDir, `${id}.json`);
                if (!await fs_extra_1.default.pathExists(filePath)) {
                    return res.status(404).json({
                        success: false,
                        error: 'PROJECT_NOT_FOUND',
                        message: `Project with id '${id}' not found`
                    });
                }
                const project = await fs_extra_1.default.readJson(filePath);
                const updatedProject = {
                    ...project,
                    ...updates,
                    id, // Preserve original ID
                    updatedAt: new Date().toISOString()
                };
                await fs_extra_1.default.writeJson(filePath, updatedProject, { spaces: 2 });
                res.json({
                    success: true,
                    data: updatedProject,
                    message: `Project '${updatedProject.name}' updated successfully`
                });
            }
            catch (error) {
                console.error('Error updating project:', error);
                res.status(500).json({
                    success: false,
                    error: 'UPDATE_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.deleteProject = async (req, res) => {
            try {
                const { id } = req.params;
                const filePath = path_1.default.join(this.projectsDir, `${id}.json`);
                if (!await fs_extra_1.default.pathExists(filePath)) {
                    return res.status(404).json({
                        success: false,
                        error: 'PROJECT_NOT_FOUND',
                        message: `Project with id '${id}' not found`
                    });
                }
                await fs_extra_1.default.remove(filePath);
                res.json({
                    success: true,
                    data: { deleted: id },
                    message: `Project deleted successfully`
                });
            }
            catch (error) {
                console.error('Error deleting project:', error);
                res.status(500).json({
                    success: false,
                    error: 'DELETE_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.projectsDir = path_1.default.join(process.cwd(), 'projects');
        fs_extra_1.default.ensureDirSync(this.projectsDir);
    }
}
exports.ProjectController = ProjectController;
