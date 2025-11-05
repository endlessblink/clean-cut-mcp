"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudioController = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class StudioController {
    constructor() {
        this.getStudioUrl = async (req, res) => {
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
                });
            }
            catch (error) {
                console.error('Error getting studio URL:', error);
                res.status(500).json({
                    success: false,
                    error: 'STUDIO_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.getExportDirectory = async (req, res) => {
            try {
                const exportDir = path_1.default.join(this.workspaceDir, 'out');
                await fs_extra_1.default.ensureDir(exportDir);
                const files = await fs_extra_1.default.readdir(exportDir);
                const exports = await Promise.all(files
                    .filter(file => ['.mp4', '.mov', '.webm'].some(ext => file.endsWith(ext)))
                    .map(async (filename) => {
                    const filePath = path_1.default.join(exportDir, filename);
                    const stats = await fs_extra_1.default.stat(filePath);
                    return {
                        filename,
                        size: stats.size,
                        createdAt: stats.birthtime.toISOString(),
                        path: path_1.default.join(exportDir, filename)
                    };
                }));
                res.json({
                    success: true,
                    data: {
                        directory: exportDir,
                        exports
                    },
                    message: `Found ${exports.length} exported videos`
                });
            }
            catch (error) {
                console.error('Error getting export directory:', error);
                res.status(500).json({
                    success: false,
                    error: 'EXPORT_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.openExportDirectory = async (req, res) => {
            try {
                const exportDir = path_1.default.join(this.workspaceDir, 'out');
                await fs_extra_1.default.ensureDir(exportDir);
                // Open directory in system file manager
                const platform = process.platform;
                let command;
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
                });
            }
            catch (error) {
                console.error('Error opening export directory:', error);
                res.status(500).json({
                    success: false,
                    error: 'OPEN_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.syncRoot = async (req, res) => {
            try {
                const result = await this.syncRootTsx();
                res.json({
                    success: true,
                    data: result,
                    message: 'Root.tsx synchronized successfully'
                });
            }
            catch (error) {
                console.error('Error syncing Root.tsx:', error);
                res.status(500).json({
                    success: false,
                    error: 'SYNC_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.rebuildCompositions = async (req, res) => {
            try {
                const result = await this.rebuildRootTsx();
                res.json({
                    success: true,
                    data: result,
                    message: 'Compositions rebuilt successfully'
                });
            }
            catch (error) {
                console.error('Error rebuilding compositions:', error);
                res.status(500).json({
                    success: false,
                    error: 'REBUILD_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.cleanupBrokenImports = async (req, res) => {
            try {
                const result = await this.cleanupImports();
                res.json({
                    success: true,
                    data: result,
                    message: 'Broken imports cleaned up successfully'
                });
            }
            catch (error) {
                console.error('Error cleaning up imports:', error);
                res.status(500).json({
                    success: false,
                    error: 'CLEANUP_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.workspaceDir = process.env.CLEAN_CUT_WORKSPACE || path_1.default.join(process.cwd(), '../../clean-cut-workspace');
        this.studioPort = 6970;
    }
    async checkStudioStatus() {
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
            }
            catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    return 'stopped';
                }
                return 'stopped';
            }
        }
        catch {
            return 'stopped';
        }
    }
    async syncRootTsx() {
        const animationsDir = path_1.default.join(this.workspaceDir, 'src/assets/animations');
        const rootPath = path_1.default.join(this.workspaceDir, 'src/Root.tsx');
        await fs_extra_1.default.ensureDir(animationsDir);
        // Get all animation files
        const files = await fs_extra_1.default.readdir(animationsDir);
        const animations = files
            .filter(file => file.endsWith('.tsx'))
            .map(file => path_1.default.basename(file, '.tsx'));
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
        await fs_extra_1.default.writeFile(rootPath, rootContent, 'utf-8');
        return { animations };
    }
    async rebuildRootTsx() {
        const result = await this.syncRootTsx();
        return { rebuilt: true };
    }
    async cleanupImports() {
        const rootPath = path_1.default.join(this.workspaceDir, 'src/Root.tsx');
        const animationsDir = path_1.default.join(this.workspaceDir, 'src/assets/animations');
        if (!await fs_extra_1.default.pathExists(rootPath)) {
            return { removed: [] };
        }
        let rootContent = await fs_extra_1.default.readFile(rootPath, 'utf-8');
        const removed = [];
        // Get existing animations
        const files = await fs_extra_1.default.readdir(animationsDir);
        const existingAnimations = files
            .filter(file => file.endsWith('.tsx'))
            .map(file => path_1.default.basename(file, '.tsx'));
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
            await fs_extra_1.default.writeFile(rootPath, rootContent, 'utf-8');
        }
        return { removed };
    }
}
exports.StudioController = StudioController;
