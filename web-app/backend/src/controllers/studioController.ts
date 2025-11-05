import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs-extra';
import { ApiResponse } from '@clean-cut/shared';

const execAsync = promisify(exec);

export class StudioController {
  private readonly workspaceDir: string;
  private readonly studioPort: number;

  constructor() {
    this.workspaceDir = process.env.CLEAN_CUT_WORKSPACE || path.join(process.cwd(), '../../clean-cut-workspace');
    this.studioPort = 6970;
  }

  getStudioUrl = async (req: Request, res: Response) => {
    try {
      const url = `http://localhost:${this.studioPort}`;
      const status = await this.checkStudioStatus();

      res.json({
        success: true,
        data: {
          url,
          port: this.studioPort,
          status
        },
        message: `Remotion Studio ${status} on port ${this.studioPort}`
      } as ApiResponse);

    } catch (error) {
      console.error('Error getting studio URL:', error);
      res.status(500).json({
        success: false,
        error: 'STUDIO_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  getExportDirectory = async (req: Request, res: Response) => {
    try {
      const exportDir = path.join(this.workspaceDir, 'out');
      await fs.ensureDir(exportDir);

      const files = await fs.readdir(exportDir);
      const exports = await Promise.all(
        files
          .filter(file => ['.mp4', '.mov', '.webm'].some(ext => file.endsWith(ext)))
          .map(async (filename) => {
            const filePath = path.join(exportDir, filename);
            const stats = await fs.stat(filePath);

            return {
              filename,
              size: stats.size,
              createdAt: stats.birthtime.toISOString(),
              path: path.join(exportDir, filename)
            };
          })
      );

      res.json({
        success: true,
        data: {
          directory: exportDir,
          exports
        },
        message: `Found ${exports.length} exported videos`
      } as ApiResponse);

    } catch (error) {
      console.error('Error getting export directory:', error);
      res.status(500).json({
        success: false,
        error: 'EXPORT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  openExportDirectory = async (req: Request, res: Response) => {
    try {
      const exportDir = path.join(this.workspaceDir, 'out');
      await fs.ensureDir(exportDir);

      // Open directory in system file manager
      const platform = process.platform;
      let command: string;

      switch (platform) {
        case 'darwin':
          command = `open "${exportDir}"`;
          break;
        case 'win32':
          command = `explorer "${exportDir}"`;
          break;
        default:
          command = `xdg-open "${exportDir}"`;
          break;
      }

      await execAsync(command);

      res.json({
        success: true,
        data: { opened: exportDir },
        message: `Export directory opened`
      } as ApiResponse);

    } catch (error) {
      console.error('Error opening export directory:', error);
      res.status(500).json({
        success: false,
        error: 'OPEN_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  syncRoot = async (req: Request, res: Response) => {
    try {
      const result = await this.syncRootTsx();

      res.json({
        success: true,
        data: result,
        message: 'Root.tsx synchronized successfully'
      } as ApiResponse);

    } catch (error) {
      console.error('Error syncing Root.tsx:', error);
      res.status(500).json({
        success: false,
        error: 'SYNC_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  rebuildCompositions = async (req: Request, res: Response) => {
    try {
      const result = await this.rebuildRootTsx();

      res.json({
        success: true,
        data: result,
        message: 'Compositions rebuilt successfully'
      } as ApiResponse);

    } catch (error) {
      console.error('Error rebuilding compositions:', error);
      res.status(500).json({
        success: false,
        error: 'REBUILD_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  cleanupBrokenImports = async (req: Request, res: Response) => {
    try {
      const result = await this.cleanupImports();

      res.json({
        success: true,
        data: result,
        message: 'Broken imports cleaned up successfully'
      } as ApiResponse);

    } catch (error) {
      console.error('Error cleaning up imports:', error);
      res.status(500).json({
        success: false,
        error: 'CLEANUP_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  private async checkStudioStatus(): Promise<'running' | 'stopped' | 'error'> {
    try {
      // Check if Remotion Studio is running on the expected port
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      try {
        const response = await fetch(`http://localhost:${this.studioPort}`, {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response.ok ? 'running' : 'error';
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          return 'stopped';
        }
        return 'stopped';
      }

    } catch {
      return 'stopped';
    }
  }

  private async syncRootTsx(): Promise<{ animations: string[] }> {
    const animationsDir = path.join(this.workspaceDir, 'src/assets/animations');
    const rootPath = path.join(this.workspaceDir, 'src/Root.tsx');

    await fs.ensureDir(animationsDir);

    // Get all animation files
    const files = await fs.readdir(animationsDir);
    const animations = files
      .filter(file => file.endsWith('.tsx'))
      .map(file => path.basename(file, '.tsx'));

    // Generate new Root.tsx content
    let rootContent = `import { Composition } from 'remotion';\n`;

    // Add imports
    animations.forEach(animation => {
      rootContent += `import { ${animation} } from './assets/animations/${animation}';\n`;
    });

    rootContent += '\nexport const RemotionRoot: React.FC = () => {\n  return (\n    <>\n';

    // Add compositions
    animations.forEach(animation => {
      rootContent += `    <Composition
      id="${animation}Composition"
      component={${animation}}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />\n`;
    });

    rootContent += '    </>\n  );\n};\n';

    await fs.writeFile(rootPath, rootContent, 'utf-8');

    return { animations };
  }

  private async rebuildRootTsx(): Promise<{ rebuilt: boolean }> {
    const result = await this.syncRootTsx();
    return { rebuilt: true };
  }

  private async cleanupImports(): Promise<{ removed: string[] }> {
    const rootPath = path.join(this.workspaceDir, 'src/Root.tsx');
    const animationsDir = path.join(this.workspaceDir, 'src/assets/animations');

    if (!await fs.pathExists(rootPath)) {
      return { removed: [] };
    }

    let rootContent = await fs.readFile(rootPath, 'utf-8');
    const removed: string[] = [];

    // Get existing animations
    const files = await fs.readdir(animationsDir);
    const existingAnimations = files
      .filter(file => file.endsWith('.tsx'))
      .map(file => path.basename(file, '.tsx'));

    // Find and remove broken imports
    const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\/assets\/animations\/([^'"]+)['"];?/g;
    let match;

    while ((match = importRegex.exec(rootContent)) !== null) {
      const componentName = match[1].trim();
      const fileName = match[2].trim();

      if (!existingAnimations.includes(fileName)) {
        // Remove this import and its composition
        const importLine = match[0];
        rootContent = rootContent.replace(importLine, '');

        // Remove the composition entry
        const compositionRegex = new RegExp(`[\\s\\S]*?<Composition[^>]*${componentName}Composition[^>]*>[\\s\\S]*?</Composition>\\s*\\n?`, 'g');
        rootContent = rootContent.replace(compositionRegex, '');

        removed.push(componentName);
      }
    }

    if (removed.length > 0) {
      await fs.writeFile(rootPath, rootContent, 'utf-8');
    }

    return { removed };
  }
}