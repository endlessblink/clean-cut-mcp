import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import path from 'path';
import { ApiResponse, CreateProjectRequest, Project } from '@clean-cut/shared';

export class ProjectController {
  private readonly projectsDir: string;

  constructor() {
    this.projectsDir = path.join(process.cwd(), 'projects');
    fs.ensureDirSync(this.projectsDir);
  }

  listProjects = async (req: Request, res: Response) => {
    try {
      const files = await fs.readdir(this.projectsDir);
      const projects = await Promise.all(
        files
          .filter(file => file.endsWith('.json'))
          .map(async (filename) => {
            const filePath = path.join(this.projectsDir, filename);
            const content = await fs.readJson(filePath);
            return content as Project;
          })
      );

      res.json({
        success: true,
        data: projects,
        message: `Found ${projects.length} projects`
      } as ApiResponse);

    } catch (error) {
      console.error('Error listing projects:', error);
      res.status(500).json({
        success: false,
        error: 'LIST_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  createProject = async (req: Request, res: Response) => {
    try {
      const { name, description, settings } = req.body as CreateProjectRequest;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_NAME',
          message: 'Project name is required'
        } as ApiResponse);
      }

      const project: Project = {
        id: uuidv4(),
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

      const filePath = path.join(this.projectsDir, `${project.id}.json`);
      await fs.writeJson(filePath, project, { spaces: 2 });

      res.json({
        success: true,
        data: project,
        message: `Project '${name}' created successfully`
      } as ApiResponse);

    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({
        success: false,
        error: 'CREATE_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  getProject = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const filePath = path.join(this.projectsDir, `${id}.json`);

      if (!await fs.pathExists(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'PROJECT_NOT_FOUND',
          message: `Project with id '${id}' not found`
        } as ApiResponse);
      }

      const project = await fs.readJson(filePath) as Project;

      res.json({
        success: true,
        data: project,
        message: `Project '${project.name}' retrieved successfully`
      } as ApiResponse);

    } catch (error) {
      console.error('Error getting project:', error);
      res.status(500).json({
        success: false,
        error: 'GET_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  updateProject = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const filePath = path.join(this.projectsDir, `${id}.json`);

      if (!await fs.pathExists(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'PROJECT_NOT_FOUND',
          message: `Project with id '${id}' not found`
        } as ApiResponse);
      }

      const project = await fs.readJson(filePath) as Project;
      const updatedProject = {
        ...project,
        ...updates,
        id, // Preserve original ID
        updatedAt: new Date().toISOString()
      };

      await fs.writeJson(filePath, updatedProject, { spaces: 2 });

      res.json({
        success: true,
        data: updatedProject,
        message: `Project '${updatedProject.name}' updated successfully`
      } as ApiResponse);

    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  deleteProject = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const filePath = path.join(this.projectsDir, `${id}.json`);

      if (!await fs.pathExists(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'PROJECT_NOT_FOUND',
          message: `Project with id '${id}' not found`
        } as ApiResponse);
      }

      await fs.remove(filePath);

      res.json({
        success: true,
        data: { deleted: id },
        message: `Project deleted successfully`
      } as ApiResponse);

    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({
        success: false,
        error: 'DELETE_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };
}