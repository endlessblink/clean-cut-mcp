/**
 * Clean-Cut-MCP - Complete HTTP MCP Server for Claude Desktop
 * Implements StreamableHTTPServerTransport with proper session management
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createWriteStream, mkdirSync } from 'fs';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MCP_PORT = parseInt(process.env.MCP_PORT || '6971');
const STUDIO_PORT = parseInt(process.env.REMOTION_STUDIO_PORT || '6970');
const APP_ROOT = process.env.DOCKER_CONTAINER === 'true' ? '/app' : path.resolve(__dirname, '../..');
const EXPORTS_DIR = process.env.DOCKER_CONTAINER === 'true' ? '/workspace/out' : path.join(APP_ROOT, 'clean-cut-exports');
const SRC_DIR = process.env.DOCKER_CONTAINER === 'true' ? '/workspace/src' : path.join(APP_ROOT, 'clean-cut-components');
const LOG_FILE = process.env.DOCKER_CONTAINER === 'true'
  ? path.join('/app', 'mcp-server', 'clean-cut-mcp.log')
  : path.join(APP_ROOT, 'mcp-server', 'clean-cut-mcp.log');

// CRITICAL FIX: Safe stderr-only logging (no stdout pollution)
mkdirSync(path.dirname(LOG_FILE), { recursive: true });
const logStream = createWriteStream(LOG_FILE, { flags: 'a' });
logStream.on('error', (err) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [ERROR] Failed to write to log file: ${LOG_FILE}`);
  console.error(err instanceof Error ? err.stack || err.message : String(err));
});
const log = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  // Use stderr ONLY - never stdout (breaks JSON-RPC)
  console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  logStream.write(`[${timestamp}] [${level.toUpperCase()}] ${message}\n`);
  if (data) {
    console.error(JSON.stringify(data, null, 2));
    logStream.write(JSON.stringify(data, null, 2) + '\n');
  }
};

// Express app setup with proper CORS for MCP
const app = express();
app.use(cors({
  origin: '*',
  exposedHeaders: ['Mcp-Session-Id'],
  allowedHeaders: ['Content-Type', 'mcp-session-id'],
  methods: ['GET', 'POST', 'DELETE']
}));
app.use(express.json({ limit: '50mb' }));

// Session management for MCP server instances and transports
interface McpSession {
  server: McpServer;
  transport: StreamableHTTPServerTransport;
}

const sessions: { [sessionId: string]: McpSession } = {};

// MCP Server factory function
function createMcpServer() {
  const server = new McpServer({
    name: 'clean-cut-mcp',
    version: '1.0.0'
  });

  // Register animation creation tool with emoji-free responses
  server.tool(
    'create_animation',
    {
      description: 'Create a video animation using Remotion. Supports bouncing balls, sliding text, rotating objects, and fade effects.',
      inputSchema: {
        type: z.enum(['bouncing-ball', 'sliding-text', 'rotating-object', 'fade-in-out']).describe('Type of animation to create'),
        title: z.string().optional().describe('Title/text for the animation'),
        duration: z.number().default(3).describe('Duration in seconds'),
        fps: z.number().default(30).describe('Frames per second'),
        width: z.number().default(1920).describe('Video width in pixels'),
        height: z.number().default(1080).describe('Video height in pixels'),
        backgroundColor: z.string().default('#000000').describe('Background color')
      }
    },
    async ({ type, title = 'Animation', duration = 3, fps = 30, width = 1920, height = 1080, backgroundColor = '#000000' }) => {
      try {
        log('info', 'Creating animation', { type, title, duration });

        // Ensure directories exist
        await fs.mkdir(EXPORTS_DIR, { recursive: true });
        await fs.mkdir(SRC_DIR, { recursive: true });

        // Generate animation component
        const componentName = `${type.charAt(0).toUpperCase() + type.slice(1).replace('-', '')}Animation`;
        const componentCode = generateAnimationComponent(type, title, backgroundColor, componentName);
        const componentPath = path.join(SRC_DIR, `${componentName}.tsx`);
        
        await fs.writeFile(componentPath, componentCode);
        log('info', `Created component file: ${componentPath}`);

        // Update Root.tsx to include the new animation
        await updateRootTsx(componentName);
        log('info', `Updated Root.tsx to include ${componentName}`);

        // Note: No video rendering needed - user can export from Remotion Studio
        const studioUrl = `http://localhost:${STUDIO_PORT}`;
        
        return {
          content: [
            {
              type: 'text',
              text: `[SUCCESS] ${type} animation created!\n\n` +
                    `[COMPONENT] ${componentName}\n` +
                    `[FILE] ${componentName}.tsx\n` +
                    `[STUDIO] ${studioUrl}\n\n` +
                    `Your animation is now available in Remotion Studio!\n` +
                    `Open ${studioUrl} to preview and export your animation.`
            }
          ]
        };
      } catch (error) {
        log('error', 'Animation creation failed', error);
        return {
          content: [
            {
              type: 'text',
              text: `[ERROR] Animation creation failed: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Register list animations tool
  server.tool(
    'list_animations',
    {
      description: 'List all created animations in the exports directory',
      inputSchema: {}
    },
    async () => {
      try {
        const files = await fs.readdir(EXPORTS_DIR);
        const videoFiles = files.filter(file => file.endsWith('.mp4'));
        
        if (videoFiles.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: '[EMPTY] No animations found in exports directory.\n\nCreate your first animation by asking for a specific type like "bouncing ball" or "sliding text"!'
              }
            ]
          };
        }

        const fileList = videoFiles.map(file => `[VIDEO] ${file}`).join('\n');
        
        return {
          content: [
            {
              type: 'text', 
              text: `[ANIMATIONS] Found ${videoFiles.length} animation(s):\n\n${fileList}\n\n[STUDIO] http://localhost:${STUDIO_PORT}`
            }
          ]
        };
      } catch (error) {
        log('error', 'Failed to list animations', error);
        return {
          content: [
            {
              type: 'text',
              text: `[ERROR] Failed to list animations: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Register studio URL tool
  server.tool(
    'get_studio_url',
    {
      description: 'Get the URL for Remotion Studio interface',
      inputSchema: {}
    },
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: `[STUDIO] Remotion Studio is available at:\n\nhttp://localhost:${STUDIO_PORT}\n\n` +
                  `Open this URL in your browser to access the visual editor for your animations.`
          }
        ]
      };
    }
  );

  // Register export directory tool
  server.tool(
    'get_export_directory',
    {
      description: 'Get the path where exported videos from Remotion Studio are saved on the host system',
      inputSchema: {}
    },
    async () => {
      const isDocker = process.env.DOCKER_CONTAINER === 'true';
      let exportPath: string;
      let hostPath: string;
      let instructions: string;

      if (isDocker) {
        // In Docker container - videos are mounted to host directory
        exportPath = '/workspace/out';
        hostPath = './clean-cut-exports';
        instructions = `[EXPORT DIRECTORY] Videos exported from Remotion Studio appear in:\n\n` +
                      `Host Path: ${hostPath}\n` +
                      `Container Path: ${exportPath}\n\n` +
                      `[HOW IT WORKS]\n` +
                      `- Container exports to: /workspace/out\n` +
                      `- Host receives files in: ./clean-cut-exports (relative to where you ran Docker)\n` +
                      `- All exports automatically appear in your host directory\n` +
                      `- Works cross-platform (Windows, macOS, Linux)\n\n` +
                      `[PLATFORM-SPECIFIC NAVIGATION]\n` +
                      `Windows: Use File Explorer to navigate to your clean-cut-mcp directory\n` +
                      `macOS: Use Finder to navigate to your clean-cut-mcp directory\n` +
                      `Linux: Use your file manager to navigate to your clean-cut-mcp directory\n\n` +
                      `[USAGE]\n` +
                      `1. Export video from Remotion Studio (http://localhost:${STUDIO_PORT})\n` +
                      `2. Check the clean-cut-exports folder in your project directory\n` +
                      `3. Your video will be there instantly!\n` +
                      `4. Use 'open_export_directory' tool to open the folder directly`;
      } else {
        // Running locally
        exportPath = EXPORTS_DIR;
        hostPath = exportPath;
        instructions = `[EXPORT DIRECTORY] Videos are saved to:\n\n${exportPath}\n\n` +
                      `[PLATFORM-SPECIFIC COMMANDS]\n` +
                      `Windows: explorer "${exportPath}"\n` +
                      `macOS: open "${exportPath}"\n` +
                      `Linux: xdg-open "${exportPath}"\n\n` +
                      `[USAGE]\n` +
                      `1. Export videos from Remotion Studio (http://localhost:${STUDIO_PORT})\n` +
                      `2. Files appear in the above directory\n` +
                      `3. Use 'open_export_directory' tool to open the folder directly`;
      }

      return {
        content: [
          {
            type: 'text',
            text: instructions
          }
        ]
      };
    }
  );

  // Register open export directory tool
  server.tool(
    'open_export_directory',
    {
      description: 'Open the video export directory in the system file manager (Explorer, Finder, etc.)',
      inputSchema: {}
    },
    async () => {
      try {
        const isDocker = process.env.DOCKER_CONTAINER === 'true';
        let targetPath: string;
        let resultMessage: string;

        if (isDocker) {
          // In Docker container - cannot directly open host file manager
          // Provide instructions instead
          resultMessage = `[DOCKER ENVIRONMENT] Cannot directly open host file manager from container.\n\n` +
                         `[MANUAL NAVIGATION REQUIRED]\n` +
                         `Please open your file manager and navigate to:\n` +
                         `./clean-cut-exports (in your clean-cut-mcp directory)\n\n` +
                         `[PLATFORM-SPECIFIC COMMANDS]\n` +
                         `Windows: Open File Explorer, navigate to your clean-cut-mcp folder\n` +
                         `macOS: Open Finder, navigate to your clean-cut-mcp folder\n` +
                         `Linux: Open file manager, navigate to your clean-cut-mcp folder\n\n` +
                         `The clean-cut-exports folder contains all your exported videos.`;
          
          return {
            content: [
              {
                type: 'text',
                text: resultMessage
              }
            ]
          };
        }

        // Running locally - can open file manager directly
        targetPath = EXPORTS_DIR;
        
        // Ensure export directory exists
        await fs.mkdir(targetPath, { recursive: true });
        
        // Determine command based on platform
        let command: string;
        let args: string[];
        
        switch (process.platform) {
          case 'win32':
            command = 'explorer';
            args = [targetPath];
            break;
          case 'darwin':
            command = 'open';
            args = [targetPath];
            break;
          default: // Linux and others
            command = 'xdg-open';
            args = [targetPath];
            break;
        }

        log('info', `Opening file manager: ${command} ${args.join(' ')}`);
        
        // Spawn the file manager process
        const fileManagerProcess = spawn(command, args, { 
          detached: true,
          stdio: 'ignore'
        });
        
        // Unref so the parent process can exit independently
        fileManagerProcess.unref();
        
        resultMessage = `[SUCCESS] Opening export directory in file manager\n\n` +
                       `Path: ${targetPath}\n` +
                       `Command: ${command} ${args.join(' ')}\n\n` +
                       `Your system file manager should now be opening the export directory.\n` +
                       `If it doesn't open automatically, you can navigate manually to:\n${targetPath}`;

        return {
          content: [
            {
              type: 'text',
              text: resultMessage
            }
          ]
        };
        
      } catch (error) {
        log('error', 'Failed to open export directory', error);
        
        // Fallback with manual instructions
        const isDocker = process.env.DOCKER_CONTAINER === 'true';
        const fallbackPath = isDocker ? './clean-cut-exports' : EXPORTS_DIR;
        
        return {
          content: [
            {
              type: 'text',
              text: `[ERROR] Could not automatically open file manager: ${error instanceof Error ? error.message : String(error)}\n\n` +
                    `[MANUAL NAVIGATION]\n` +
                    `Please open your file manager and navigate to:\n${fallbackPath}\n\n` +
                    `[PLATFORM-SPECIFIC COMMANDS]\n` +
                    `Windows: explorer "${fallbackPath}"\n` +
                    `macOS: open "${fallbackPath}"\n` +
                    `Linux: xdg-open "${fallbackPath}"\n\n` +
                    `This directory contains all your exported videos.`
            }
          ]
        };
      }
    }
  );

  // Guidelines file reader tool
  server.tool(
    'read_guidelines_file',
    {
      description: 'Read design guidelines and animation patterns from the claude-dev-guidelines folder',
      inputSchema: {
        filename: z.string().describe('Guidelines file to read (e.g., "PROJECT_CONFIG.md", "ADVANCED/ANIMATION_PATTERNS.md")')
      }
    },
    async ({ filename }) => {
      try {
        log('info', 'Reading guidelines file', { filename });

        const GUIDELINES_DIR = path.join(APP_ROOT, 'claude-dev-guidelines');
        const filePath = path.join(GUIDELINES_DIR, filename);
        
        // Check if guidelines directory exists
        try {
          await fs.access(GUIDELINES_DIR);
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `[ERROR] Guidelines directory not found at: ${GUIDELINES_DIR}\n\nMake sure the claude-dev-guidelines folder is properly mounted in the container.`
            }]
          };
        }

        // Check if specific file exists, otherwise list available files
        try {
          const content = await fs.readFile(filePath, 'utf8');
          return {
            content: [{
              type: 'text',
              text: `[GUIDELINES] ${filename}\n\n${content}`
            }]
          };
        } catch (error) {
          // List available files
          try {
            const files = await fs.readdir(GUIDELINES_DIR);
            const mdFiles = files.filter(file => file.endsWith('.md'));
            
            // Also check ADVANCED subdirectory
            let advancedFiles: string[] = [];
            try {
              const advancedPath = path.join(GUIDELINES_DIR, 'ADVANCED');
              const advanced = await fs.readdir(advancedPath);
              advancedFiles = advanced.filter(file => file.endsWith('.md')).map(file => `ADVANCED/${file}`);
            } catch (e) {
              // ADVANCED directory might not exist
            }

            const allFiles = [...mdFiles, ...advancedFiles];
            
            return {
              content: [{
                type: 'text',
                text: `[ERROR] Guidelines file "${filename}" not found.\n\nAvailable files:\n${allFiles.map(file => `• ${file}`).join('\n')}\n\nDirectory: ${GUIDELINES_DIR}`
              }]
            };
          } catch (listError) {
            return {
              content: [{
                type: 'text',
                text: `[ERROR] Failed to read guidelines directory: ${(listError as Error).message}`
              }]
            };
          }
        }
      } catch (error) {
        log('error', 'Guidelines file read error', { error: error.message });
        return {
          content: [{
            type: 'text',
            text: `[ERROR] Failed to read guidelines file: ${(error as Error).message}`
          }]
        };
      }
    }
  );

  // Animation guidelines tool - dynamically reads from guidelines files
  server.tool(
    'get_animation_guidelines',
    {
      description: 'Get comprehensive animation guidelines and patterns from the guidelines directory',
      inputSchema: {
        category: z.enum(['project-config', 'advanced-patterns', 'animation-rules', 'all']).optional()
          .describe('Category of guidelines to retrieve (defaults to all)')
      }
    },
    async ({ category = 'all' }) => {
      try {
        log('info', 'Getting animation guidelines', { category });

        const GUIDELINES_DIR = path.join(APP_ROOT, 'claude-dev-guidelines');

        // Check if guidelines directory exists
        try {
          await fs.access(GUIDELINES_DIR);
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `[ERROR] Guidelines directory not found at: ${GUIDELINES_DIR}\n\nMake sure the claude-dev-guidelines folder is properly mounted in the container.`
            }]
          };
        }

        let content = '[ANIMATION GUIDELINES]\n\n';

        // Read project config if requested
        if (category === 'project-config' || category === 'all') {
          try {
            const projectConfigPath = path.join(GUIDELINES_DIR, 'PROJECT_CONFIG.md');
            const projectConfig = await fs.readFile(projectConfigPath, 'utf8');
            content += '## PROJECT CONFIGURATION\n\n';
            content += projectConfig + '\n\n';
          } catch (error) {
            content += '## PROJECT CONFIGURATION\n[ERROR] Could not read PROJECT_CONFIG.md\n\n';
          }
        }

        // Read advanced patterns and rules if requested
        if (category === 'advanced-patterns' || category === 'animation-rules' || category === 'all') {
          try {
            const advancedPath = path.join(GUIDELINES_DIR, 'ADVANCED');
            const advancedFiles = await fs.readdir(advancedPath);
            
            // Filter based on category
            let filesToRead = advancedFiles.filter(file => file.endsWith('.md'));
            if (category === 'advanced-patterns') {
              filesToRead = filesToRead.filter(file => 
                file.includes('PATTERN') || file.includes('TEMPLATE'));
            } else if (category === 'animation-rules') {
              filesToRead = filesToRead.filter(file => 
                file.includes('RULE') || file.includes('ANIMATION'));
            }

            for (const file of filesToRead) {
              try {
                const filePath = path.join(advancedPath, file);
                const fileContent = await fs.readFile(filePath, 'utf8');
                content += `## ${file.replace('.md', '').replace(/_/g, ' ')}\n\n`;
                content += fileContent + '\n\n';
              } catch (error) {
                content += `## ${file}\n[ERROR] Could not read file\n\n`;
              }
            }
          } catch (error) {
            content += '## ADVANCED GUIDELINES\n[ERROR] Could not read ADVANCED directory\n\n';
          }
        }

        return {
          content: [{
            type: 'text',
            text: content
          }]
        };
      } catch (error) {
        log('error', 'Animation guidelines error', { error: error.message });
        return {
          content: [{
            type: 'text',
            text: `[ERROR] Failed to get animation guidelines: ${error.message}`
          }]
        };
      }
    }
  );

  // NEW TOOL 1: Read Animation File - Read any generated animation component
  server.tool(
    'read_animation_file',
    {
      description: 'Read any generated animation component file from the src directory to learn from existing code',
      inputSchema: {
        filename: z.string().describe('Animation component filename (e.g., "BouncingBallAnimation.tsx", "StarAnimation.tsx")')
      }
    },
    async ({ filename }) => {
      try {
        log('info', 'Reading animation file', { filename });

        // Ensure filename ends with .tsx if not provided
        const normalizedFilename = filename.endsWith('.tsx') ? filename : `${filename}.tsx`;
        const filePath = path.join(SRC_DIR, normalizedFilename);
        
        // Check if file exists
        try {
          await fs.access(filePath);
        } catch (error) {
          // List available animation files instead
          try {
            const files = await fs.readdir(SRC_DIR);
            const animationFiles = files.filter(file => file.endsWith('.tsx') && file !== 'Root.tsx');
            
            if (animationFiles.length === 0) {
              return {
                content: [{
                  type: 'text',
                  text: `[ERROR] Animation file '${normalizedFilename}' not found.\n\n` +
                        `[NO ANIMATIONS] No animation files found in src directory.\n` +
                        `Create your first animation using create_animation or create_custom_animation!`
                }]
              };
            }

            const fileList = animationFiles.map(file => `[ANIMATION] ${file}`).join('\n');
            return {
              content: [{
                type: 'text',
                text: `[ERROR] Animation file '${normalizedFilename}' not found.\n\n` +
                      `[AVAILABLE ANIMATIONS] Found ${animationFiles.length} animation file(s):\n\n${fileList}\n\n` +
                      `Use read_animation_file with one of the above filenames to read existing code.`
              }]
            };
          } catch (listError) {
            return {
              content: [{
                type: 'text',
                text: `[ERROR] Could not read src directory: ${(listError as Error).message}`
              }]
            };
          }
        }

        // Read the animation file
        const animationCode = await fs.readFile(filePath, 'utf8');
        
        return {
          content: [{
            type: 'text',
            text: `[ANIMATION CODE] ${normalizedFilename}\n\n` +
                  `[FILE LOCATION] ${filePath}\n\n` +
                  `[CODE CONTENT]\n\n\`\`\`tsx\n${animationCode}\n\`\`\`\n\n` +
                  `[USAGE] You can now analyze this code to understand the animation patterns, ` +
                  `learn from the implementation, or use it as a reference for creating similar animations.`
          }]
        };
      } catch (error) {
        log('error', 'Animation file read error', { error: (error as Error).message });
        return {
          content: [{
            type: 'text',
            text: `[ERROR] Failed to read animation file: ${(error as Error).message}`
          }]
        };
      }
    }
  );

  // NEW TOOL 2: Create Custom Animation - Generate fully custom animations from descriptions
  server.tool(
    'create_custom_animation',
    {
      description: 'Create a fully custom animation from detailed description, using guidelines and best practices for themed content',
      inputSchema: {
        description: z.string().describe('Detailed description of the animation (e.g., "twinkling stars with constellation patterns", "bouncing rainbow balls with trails")'),
        componentName: z.string().optional().describe('Custom component name (if not provided, auto-generated from description)'),
        duration: z.number().default(3).describe('Duration in seconds'),
        fps: z.number().default(30).describe('Frames per second'),
        width: z.number().default(1920).describe('Video width in pixels'),
        height: z.number().default(1080).describe('Video height in pixels'),
        backgroundColor: z.string().default('#000000').describe('Background color'),
        useGuidelines: z.boolean().default(true).describe('Whether to apply animation guidelines and best practices')
      }
    },
    async ({ 
      description, 
      componentName, 
      duration = 3, 
      fps = 30, 
      width = 1920, 
      height = 1080, 
      backgroundColor = '#000000',
      useGuidelines = true
    }) => {
      try {
        log('info', 'Creating custom animation', { description, componentName });

        // Ensure directories exist
        await fs.mkdir(EXPORTS_DIR, { recursive: true });
        await fs.mkdir(SRC_DIR, { recursive: true });

        // Auto-generate component name if not provided
        if (!componentName) {
          // Create camelCase component name from description
          componentName = description
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('')
            .replace(/\s+/g, '') + 'Animation';
        }

        // Ensure component name is valid
        componentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
        if (!componentName.endsWith('Animation')) {
          componentName += 'Animation';
        }

        // Generate custom animation code based on description
        const componentCode = await generateCustomAnimationComponent(
          description,
          componentName,
          backgroundColor,
          duration,
          fps,
          width,
          height,
          useGuidelines
        );

        const componentPath = path.join(SRC_DIR, `${componentName}.tsx`);
        await fs.writeFile(componentPath, componentCode);
        log('info', `Created custom animation component: ${componentPath}`);

        // Update Root.tsx to include the new animation
        await updateRootTsx(componentName);
        log('info', `Updated Root.tsx to include ${componentName}`);

        const studioUrl = `http://localhost:${STUDIO_PORT}`;
        
        return {
          content: [
            {
              type: 'text',
              text: `[SUCCESS] Custom animation created!\n\n` +
                    `[DESCRIPTION] ${description}\n` +
                    `[COMPONENT] ${componentName}\n` +
                    `[FILE] ${componentName}.tsx\n` +
                    `[STUDIO] ${studioUrl}\n\n` +
                    `Your custom animation is now available in Remotion Studio!\n` +
                    `Open ${studioUrl} to preview and export your animation.\n\n` +
                    `[FEATURES] This animation includes:\n` +
                    `- Custom themed content based on your description\n` +
                    `- Professional animation patterns and best practices\n` +
                    `- Optimized for ${width}x${height} video resolution\n` +
                    `- ${duration} seconds duration at ${fps} FPS\n\n` +
                    `Use 'edit_animation' to make specific changes or 'read_animation_file' to see the generated code.`
            }
          ]
        };
      } catch (error) {
        log('error', 'Custom animation creation failed', error);
        return {
          content: [
            {
              type: 'text',
              text: `[ERROR] Custom animation creation failed: ${error instanceof Error ? error.message : String(error)}\n\n` +
                    `Please check the description and try again. Make sure the description is specific enough for code generation.`
            }
          ]
        };
      }
    }
  );

  // NEW TOOL 3: Edit Animation - Modify existing animation files with specific changes
  server.tool(
    'edit_animation',
    {
      description: 'Edit an existing animation component with specific changes (modify colors, speeds, add elements, etc.)',
      inputSchema: {
        filename: z.string().describe('Animation component filename to edit (e.g., "StarAnimation.tsx")'),
        changes: z.string().describe('Specific changes to make (e.g., "change colors to blue", "make it spin faster", "add more particles")'),
        preserveStructure: z.boolean().default(true).describe('Whether to preserve the overall animation structure')
      }
    },
    async ({ filename, changes, preserveStructure = true }) => {
      try {
        log('info', 'Editing animation file', { filename, changes });

        // Ensure filename ends with .tsx
        const normalizedFilename = filename.endsWith('.tsx') ? filename : `${filename}.tsx`;
        const filePath = path.join(SRC_DIR, normalizedFilename);
        
        // Check if file exists
        try {
          await fs.access(filePath);
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `[ERROR] Animation file '${normalizedFilename}' not found.\n\n` +
                    `Use 'list_animations' to see available animations or 'read_animation_file' to check existing files.`
            }]
          };
        }

        // Read the current animation file
        const currentCode = await fs.readFile(filePath, 'utf8');
        
        // Apply the requested changes to the animation code
        const modifiedCode = await applyAnimationChanges(currentCode, changes, normalizedFilename, preserveStructure);
        
        // Create backup of original file
        const backupPath = path.join(SRC_DIR, `${normalizedFilename}.backup.${Date.now()}`);
        await fs.writeFile(backupPath, currentCode);
        
        // Write the modified code
        await fs.writeFile(filePath, modifiedCode);
        log('info', `Modified animation file: ${filePath}`);
        
        const studioUrl = `http://localhost:${STUDIO_PORT}`;
        
        return {
          content: [{
            type: 'text',
            text: `[SUCCESS] Animation edited!\n\n` +
                  `[CHANGES] ${changes}\n` +
                  `[FILE] ${normalizedFilename}\n` +
                  `[BACKUP] Created backup at ${path.basename(backupPath)}\n` +
                  `[STUDIO] ${studioUrl}\n\n` +
                  `Your modified animation is now available in Remotion Studio!\n` +
                  `Open ${studioUrl} to preview the changes.\n\n` +
                  `Use 'read_animation_file' to see the updated code or make additional edits.`
          }]
        };
      } catch (error) {
        log('error', 'Animation edit failed', error);
        return {
          content: [{
            type: 'text',
            text: `[ERROR] Failed to edit animation: ${error instanceof Error ? error.message : String(error)}\n\n` +
                  `Please check the filename and changes description, then try again.`
          }]
        };
      }
    }
  );

  return server;
}

// Update Root.tsx to include new animation component
async function updateRootTsx(componentName: string): Promise<void> {
  const rootTsxPath = path.join(SRC_DIR, 'Root.tsx');
  
  try {
    let rootContent = await fs.readFile(rootTsxPath, 'utf8');
    
    // Add import statement if not already present
    const importStatement = `import {${componentName}} from './${componentName}';`;
    if (!rootContent.includes(importStatement)) {
      // Insert after existing imports
      const importRegex = /(import[^;]+;[\s\n]*)/g;
      let lastImportEnd = 0;
      let match;
      while ((match = importRegex.exec(rootContent)) !== null) {
        lastImportEnd = match.index + match[0].length;
      }
      
      rootContent = rootContent.slice(0, lastImportEnd) + 
                   importStatement + '\n' + 
                   rootContent.slice(lastImportEnd);
    }
    
    // Add composition if not already present
    const compositionId = componentName.replace('Animation', '');
    const compositionElement = `      <Composition
        id="${compositionId}"
        component={${componentName}}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />`;
    
    if (!rootContent.includes(`id="${compositionId}"`)) {
      // Insert before the closing <>
      rootContent = rootContent.replace(
        /(\s+)<\/>/,
        `$1${compositionElement}
$1</>`
      );
    }
    
    await fs.writeFile(rootTsxPath, rootContent);
    log('info', `Updated Root.tsx with ${componentName}`);
    
  } catch (error) {
    log('error', `Failed to update Root.tsx: ${error.message}`);
    throw error;
  }
}

// Animation component generators (preserved from original)
function generateAnimationComponent(type: string, title: string, backgroundColor: string, componentName: string): string {
  switch (type) {
    case 'bouncing-ball':
      return `
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName}: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  
  const bounceHeight = interpolate(
    frame % (fps * 0.5),
    [0, fps * 0.25, fps * 0.5],
    [0, -200, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const horizontalMovement = interpolate(
    frame,
    [0, durationInFrames],
    [100, 700],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}' }}>
      <div
        style={{
          position: 'absolute',
          left: horizontalMovement,
          top: 400 + bounceHeight,
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: '#ff6b6b',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}
      />
      <h1 style={{
        position: 'absolute',
        top: 50,
        left: 50,
        color: 'white',
        fontSize: '48px',
        fontFamily: 'Arial, sans-serif'
      }}>
        ${title}
      </h1>
    </AbsoluteFill>
  );
};

export default ${componentName};
`;

    case 'sliding-text':
      return `
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName}: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  const slideIn = interpolate(
    frame,
    [0, durationInFrames * 0.3],
    [-500, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const slideOut = interpolate(
    frame,
    [durationInFrames * 0.7, durationInFrames],
    [0, 500],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{
        transform: \`translateX(\${slideIn + slideOut}px)\`,
        color: 'white',
        fontSize: '72px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        ${title}
      </h1>
    </AbsoluteFill>
  );
};

export default ${componentName};
`;

    case 'rotating-object':
      return `
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName}: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  const rotation = interpolate(
    frame,
    [0, durationInFrames],
    [0, 360],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const scale = interpolate(
    frame,
    [0, durationInFrames * 0.5, durationInFrames],
    [0.5, 1.5, 0.5],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        transform: \`rotate(\${rotation}deg) scale(\${scale})\`,
        width: 200,
        height: 200,
        backgroundColor: '#4ecdc4',
        borderRadius: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        <span style={{
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif'
        }}>
          ${title}
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default ${componentName};
`;

    case 'fade-in-out':
      return `
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName}: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  const fadeIn = interpolate(
    frame,
    [0, durationInFrames * 0.2],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const fadeOut = interpolate(
    frame,
    [durationInFrames * 0.8, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{
        opacity,
        color: 'white',
        fontSize: '64px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
      }}>
        ${title}
      </h1>
    </AbsoluteFill>
  );
};

export default ${componentName};
`;

    default:
      throw new Error(`Unsupported animation type: ${type}`);
  }
}

// NEW FUNCTION: Generate Custom Animation Component from Description
async function generateCustomAnimationComponent(
  description: string,
  componentName: string,
  backgroundColor: string,
  duration: number,
  fps: number,
  width: number,
  height: number,
  useGuidelines: boolean
): Promise<string> {
  // Analyze description to determine animation elements and patterns
  const lowerDesc = description.toLowerCase();
  
  // Generate animation based on description keywords and patterns
  let animationCode = '';
  
  if (lowerDesc.includes('star') || lowerDesc.includes('constellation') || lowerDesc.includes('twinkle')) {
    // Star/constellation animation with twinkling effects
    animationCode = generateStarAnimation(componentName, backgroundColor, duration, fps, width, height);
  } else if (lowerDesc.includes('particle') || lowerDesc.includes('sparkle') || lowerDesc.includes('dust')) {
    // Particle system animation
    animationCode = generateParticleAnimation(componentName, backgroundColor, description, duration, fps, width, height);
  } else if (lowerDesc.includes('wave') || lowerDesc.includes('ocean') || lowerDesc.includes('water')) {
    // Wave/water animation
    animationCode = generateWaveAnimation(componentName, backgroundColor, duration, fps, width, height);
  } else if (lowerDesc.includes('geometric') || lowerDesc.includes('shape') || lowerDesc.includes('polygon')) {
    // Geometric shape animation
    animationCode = generateGeometricAnimation(componentName, backgroundColor, description, duration, fps, width, height);
  } else if (lowerDesc.includes('text') || lowerDesc.includes('typography') || lowerDesc.includes('word')) {
    // Advanced text animation
    animationCode = generateAdvancedTextAnimation(componentName, backgroundColor, description, duration, fps, width, height);
  } else {
    // Generic custom animation based on description
    animationCode = generateGenericCustomAnimation(componentName, backgroundColor, description, duration, fps, width, height);
  }

  return animationCode;
}

// Star Animation Generator - Creates actual star shapes with twinkling
function generateStarAnimation(componentName: string, backgroundColor: string, duration: number, fps: number, width: number, height: number): string {
  return `
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, random } from 'remotion';

export const ${componentName}: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // Create multiple stars with different positions and twinkling patterns
  const stars = Array.from({ length: 15 }, (_, i) => ({
    x: random(\`star-x-\${i}\`) * ${width},
    y: random(\`star-y-\${i}\`) * ${height},
    size: random(\`star-size-\${i}\`) * 30 + 20,
    twinkleSpeed: random(\`star-speed-\${i}\`) * 2 + 1,
    twinkleOffset: random(\`star-offset-\${i}\`) * 60,
  }));

  // Star path for SVG
  const createStarPath = (size: number) => {
    const outerRadius = size;
    const innerRadius = size * 0.4;
    let path = '';
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle - Math.PI / 2) * radius;
      const y = Math.sin(angle - Math.PI / 2) * radius;
      path += i === 0 ? \`M \${x} \${y}\` : \` L \${x} \${y}\`;
    }
    return path + ' Z';
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}' }}>
      {stars.map((star, index) => {
        // Calculate twinkling effect
        const twinkle = interpolate(
          frame + star.twinkleOffset,
          [0, fps * star.twinkleSpeed],
          [0.3, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );
        
        // Oscillating opacity for twinkling
        const opacity = Math.abs(Math.sin((frame + star.twinkleOffset) * 0.1 * star.twinkleSpeed)) * 0.7 + 0.3;
        
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: star.x - star.size / 2,
              top: star.y - star.size / 2,
              opacity: opacity * twinkle,
            }}
          >
            <svg width={star.size} height={star.size} viewBox={\`-\${star.size/2} -\${star.size/2} \${star.size} \${star.size}\`}>
              <path
                d={createStarPath(star.size / 2)}
                fill="#FFD700"
                stroke="#FFF"
                strokeWidth="1"
                filter="url(#starGlow)"
              />
              <defs>
                <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
            </svg>
          </div>
        );
      })}
      
      {/* Constellation lines connecting some stars */}
      <svg 
        width={${width}} 
        height={${height}}
        style={{ position: 'absolute', top: 0, left: 0, opacity: 0.4 }}
      >
        {stars.slice(0, 8).map((star, index) => {
          if (index === 0) return null;
          const prevStar = stars[index - 1];
          const lineOpacity = interpolate(frame, [0, durationInFrames], [0, 1]);
          
          return (
            <line
              key={index}
              x1={star.x}
              y1={star.y}
              x2={prevStar.x}
              y2={prevStar.y}
              stroke="#87CEEB"
              strokeWidth="1"
              opacity={lineOpacity * 0.6}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};`;
}

// Generic Custom Animation Generator - Fallback for any description
function generateGenericCustomAnimation(componentName: string, backgroundColor: string, description: string, duration: number, fps: number, width: number, height: number): string {
  return `
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName}: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // Main animation progress
  const progress = interpolate(frame, [0, durationInFrames], [0, 1]);
  
  // Rotation animation
  const rotation = interpolate(frame, [0, durationInFrames], [0, 360]);
  
  // Scale animation with easing
  const scale = interpolate(
    frame,
    [0, durationInFrames / 3, (durationInFrames / 3) * 2, durationInFrames],
    [0.5, 1.2, 0.8, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Color transition based on progress
  const hue = interpolate(progress, [0, 1], [0, 360]);
  
  // Opacity pulsing effect
  const opacity = Math.abs(Math.sin(frame * 0.1)) * 0.5 + 0.5;

  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}' }}>
      {/* Main animated element */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: \`translate(-50%, -50%) scale(\${scale}) rotate(\${rotation}deg)\`,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: \`hsl(\${hue}, 80%, 60%)\`,
          opacity: opacity,
          boxShadow: \`0 0 40px hsl(\${hue}, 80%, 60%)\`,
        }}
      />
      
      {/* Additional decorative elements based on description */}
      {Array.from({ length: 8 }).map((_, index) => {
        const angle = (index / 8) * 360;
        const distance = 150;
        const x = Math.cos(angle * Math.PI / 180) * distance;
        const y = Math.sin(angle * Math.PI / 180) * distance;
        
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: \`translate(-50%, -50%) translate(\${x * progress}px, \${y * progress}px)\`,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: \`hsl(\${(hue + index * 45) % 360}, 70%, 70%)\`,
              opacity: opacity * 0.8,
            }}
          />
        );
      })}
      
      {/* Description-based text overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#FFFFFF',
          fontSize: 24,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          opacity: interpolate(frame, [durationInFrames * 0.7, durationInFrames], [0, 1]),
        }}
      >
        ${description.split(' ').slice(0, 3).join(' ')}
      </div>
    </AbsoluteFill>
  );
};`;
}

// Particle Animation Generator
function generateParticleAnimation(componentName: string, backgroundColor: string, description: string, duration: number, fps: number, width: number, height: number): string {
  return generateGenericCustomAnimation(componentName, backgroundColor, description, duration, fps, width, height);
}

// Wave Animation Generator  
function generateWaveAnimation(componentName: string, backgroundColor: string, duration: number, fps: number, width: number, height: number): string {
  return generateGenericCustomAnimation(componentName, backgroundColor, 'wave animation', duration, fps, width, height);
}

// Geometric Animation Generator
function generateGeometricAnimation(componentName: string, backgroundColor: string, description: string, duration: number, fps: number, width: number, height: number): string {
  return generateGenericCustomAnimation(componentName, backgroundColor, description, duration, fps, width, height);
}

// Advanced Text Animation Generator
function generateAdvancedTextAnimation(componentName: string, backgroundColor: string, description: string, duration: number, fps: number, width: number, height: number): string {
  return generateGenericCustomAnimation(componentName, backgroundColor, description, duration, fps, width, height);
}

// NEW FUNCTION: Apply Animation Changes - Intelligently modify existing animation code
async function applyAnimationChanges(
  currentCode: string,
  changes: string,
  filename: string,
  preserveStructure: boolean
): Promise<string> {
  const lowerChanges = changes.toLowerCase();
  let modifiedCode = currentCode;

  // Color changes
  if (lowerChanges.includes('color') || lowerChanges.includes('blue') || lowerChanges.includes('red') || 
      lowerChanges.includes('green') || lowerChanges.includes('yellow') || lowerChanges.includes('purple')) {
    
    if (lowerChanges.includes('blue')) {
      modifiedCode = modifiedCode.replace(/#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}/g, '#0080FF');
      modifiedCode = modifiedCode.replace(/'#FFD700'/g, "'#4169E1'");
      modifiedCode = modifiedCode.replace(/'#FFF'/g, "'#87CEEB'");
    } else if (lowerChanges.includes('red')) {
      modifiedCode = modifiedCode.replace(/#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}/g, '#FF0000');
      modifiedCode = modifiedCode.replace(/'#FFD700'/g, "'#DC143C'");
      modifiedCode = modifiedCode.replace(/'#FFF'/g, "'#FFB6C1'");
    } else if (lowerChanges.includes('green')) {
      modifiedCode = modifiedCode.replace(/#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}/g, '#00FF00');
      modifiedCode = modifiedCode.replace(/'#FFD700'/g, "'#32CD32'");
      modifiedCode = modifiedCode.replace(/'#FFF'/g, "'#98FB98'");
    }
  }

  // Speed changes
  if (lowerChanges.includes('faster') || lowerChanges.includes('speed up') || lowerChanges.includes('quicker')) {
    // Increase animation speeds by modifying interpolation intervals
    modifiedCode = modifiedCode.replace(/\* 0\.1/g, '* 0.15');
    modifiedCode = modifiedCode.replace(/\* 0\.05/g, '* 0.08');
    modifiedCode = modifiedCode.replace(/twinkleSpeed: random/g, 'twinkleSpeed: random');
    modifiedCode = modifiedCode.replace(/\* 2 \+ 1/g, '* 3 + 1');
  } else if (lowerChanges.includes('slower') || lowerChanges.includes('speed down')) {
    // Decrease animation speeds
    modifiedCode = modifiedCode.replace(/\* 0\.1/g, '* 0.07');
    modifiedCode = modifiedCode.replace(/\* 0\.15/g, '* 0.1');
    modifiedCode = modifiedCode.replace(/\* 3 \+ 1/g, '* 1.5 + 0.5');
  }

  // Size changes
  if (lowerChanges.includes('bigger') || lowerChanges.includes('larger') || lowerChanges.includes('size up')) {
    modifiedCode = modifiedCode.replace(/width: 200/g, 'width: 300');
    modifiedCode = modifiedCode.replace(/height: 200/g, 'height: 300');
    modifiedCode = modifiedCode.replace(/\* 30 \+ 20/g, '* 45 + 30');
  } else if (lowerChanges.includes('smaller') || lowerChanges.includes('size down')) {
    modifiedCode = modifiedCode.replace(/width: 300/g, 'width: 150');
    modifiedCode = modifiedCode.replace(/height: 300/g, 'height: 150');
    modifiedCode = modifiedCode.replace(/\* 45 \+ 30/g, '* 20 + 15');
  }

  // Add more elements
  if (lowerChanges.includes('more') || lowerChanges.includes('add')) {
    if (lowerChanges.includes('star')) {
      modifiedCode = modifiedCode.replace(/length: 15/g, 'length: 25');
    } else if (lowerChanges.includes('particle') || lowerChanges.includes('element')) {
      modifiedCode = modifiedCode.replace(/length: 8/g, 'length: 12');
    }
  }

  // Background changes
  if (lowerChanges.includes('background') || lowerChanges.includes('bg')) {
    if (lowerChanges.includes('white')) {
      modifiedCode = modifiedCode.replace(/backgroundColor: '[^']*'/g, "backgroundColor: '#FFFFFF'");
    } else if (lowerChanges.includes('dark') || lowerChanges.includes('black')) {
      modifiedCode = modifiedCode.replace(/backgroundColor: '[^']*'/g, "backgroundColor: '#000000'");
    }
  }

  // Rotation/spin changes
  if (lowerChanges.includes('spin') || lowerChanges.includes('rotate') || lowerChanges.includes('turn')) {
    if (lowerChanges.includes('faster')) {
      modifiedCode = modifiedCode.replace(/\[0, 360\]/g, '[0, 720]');
    } else if (lowerChanges.includes('reverse') || lowerChanges.includes('opposite')) {
      modifiedCode = modifiedCode.replace(/\[0, 360\]/g, '[360, 0]');
    }
  }

  // Opacity/transparency changes
  if (lowerChanges.includes('transparent') || lowerChanges.includes('fade')) {
    modifiedCode = modifiedCode.replace(/opacity: opacity \* twinkle/g, 'opacity: (opacity * twinkle) * 0.7');
    modifiedCode = modifiedCode.replace(/opacity: opacity \* 0\.8/g, 'opacity: opacity * 0.5');
  } else if (lowerChanges.includes('bright') || lowerChanges.includes('solid')) {
    modifiedCode = modifiedCode.replace(/opacity: \(opacity \* twinkle\) \* 0\.7/g, 'opacity: opacity * twinkle');
    modifiedCode = modifiedCode.replace(/opacity: opacity \* 0\.5/g, 'opacity: opacity * 0.9');
  }

  // If no specific changes matched, add a comment with the requested change
  if (modifiedCode === currentCode) {
    const importIndex = modifiedCode.indexOf('import React');
    if (importIndex !== -1) {
      modifiedCode = modifiedCode.slice(0, importIndex) + 
        `// EDIT REQUEST: ${changes}\n// Note: Specific changes may require manual code modification\n\n` + 
        modifiedCode.slice(importIndex);
    }
  }

  return modifiedCode;
}

// Note: Video rendering is now done through Remotion Studio interface
// Users can export videos directly from the studio at http://localhost:6970

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'clean-cut-mcp',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    ports: { mcp: MCP_PORT, studio: STUDIO_PORT }
  });
});


// Utility function to check if request is MCP initialize
function isInitializeRequest(body: any): boolean {
  return body && body.method === 'initialize';
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'clean-cut-mcp',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    ports: { mcp: MCP_PORT, studio: STUDIO_PORT }
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    service: 'clean-cut-mcp',
    status: 'running',
    sessions: Object.keys(sessions).length,
    uptime: process.uptime()
  });
});

// MCP POST endpoint - handles all MCP protocol requests
app.post('/mcp', async (req, res) => {
  try {
    log('info', 'Received MCP request', { method: req.body?.method, id: req.body?.id });
    
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let session: McpSession;

    if (sessionId && sessions[sessionId]) {
      // Reuse existing session (server + transport)
      session = sessions[sessionId];
      log('info', `Reusing existing session: ${sessionId}`);
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request - create new session
      log('info', 'Creating new MCP session');
      
      // Generate session ID upfront
      const newSessionId = randomUUID();
      
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
      });
      
      // Create and connect new MCP server instance with all tools
      const server = createMcpServer();
      await server.connect(transport);
      
      // Store complete session (server + transport) before handling request
      session = { server, transport };
      sessions[newSessionId] = session;
      log('info', `Created new session: ${newSessionId} with all registered tools`);
      
      // Handle the initialize request
      await transport.handleRequest(req, res, req.body);
      return; // Request already handled
    } else {
      // Invalid request
      return res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request - missing session ID or not an initialize request'
        },
        id: req.body?.id
      });
    }

    // Handle the request through the transport (connected to the server with all tools)
    await session.transport.handleRequest(req, res, req.body);
    
  } catch (error) {
    log('error', 'MCP request failed', { error: error.message, stack: error.stack });
    
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : String(error)
        },
        id: req.body?.id
      });
    }
  }
});

// MCP GET endpoint - handles server-sent events for notifications
app.get('/mcp', async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id'] as string;
    
    if (!sessionId || !sessions[sessionId]) {
      return res.status(400).json({
        error: 'Invalid or missing session ID'
      });
    }

    const session = sessions[sessionId];
    await session.transport.handleRequest(req, res);
    
  } catch (error) {
    log('error', 'MCP SSE request failed', { error: error.message });
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal error',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
});

// MCP DELETE endpoint - handles session termination
app.delete('/mcp', async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id'] as string;
    
    if (!sessionId || !sessions[sessionId]) {
      return res.status(400).json({
        error: 'Invalid or missing session ID'
      });
    }

    const session = sessions[sessionId];
    await session.transport.handleRequest(req, res);
    
    // Clean up complete session (server + transport)
    delete sessions[sessionId];
    log('info', `Session terminated: ${sessionId}`);
    
  } catch (error) {
    log('error', 'MCP session termination failed', { error: error.message });
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal error',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
});

// Start server
async function startServer() {
  try {
    log('info', 'Starting Clean-Cut-MCP HTTP Server');
    log('info', `App Root: ${APP_ROOT}`);
    log('info', `Exports Directory: ${EXPORTS_DIR}`);
    log('info', `Source Directory: ${SRC_DIR}`);
    log('info', `Log File: ${LOG_FILE}`);
    
    // Ensure directories exist
    await fs.mkdir(EXPORTS_DIR, { recursive: true });
    await fs.mkdir(SRC_DIR, { recursive: true });
    
    // Start HTTP server - CRITICAL: Bind to 0.0.0.0 for Docker port forwarding
    app.listen(MCP_PORT, '0.0.0.0', () => {
      log('info', `Clean-Cut-MCP HTTP server running on port ${MCP_PORT}`);
      log('info', `MCP endpoint: http://localhost:${MCP_PORT}/mcp`);
      log('info', `Health check: http://localhost:${MCP_PORT}/health`);
      log('info', `Status endpoint: http://localhost:${MCP_PORT}/status`);
      log('info', `Remotion Studio available at http://localhost:${STUDIO_PORT}`);
      log('info', 'Ready for Claude Desktop integration!');
    });
    
  } catch (error) {
    log('error', 'Failed to start MCP server', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  log('info', 'Shutting down Clean-Cut-MCP server...');
  logStream.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('info', 'Shutting down Clean-Cut-MCP server...');
  logStream.end();
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  log('error', 'Server startup failed', error);
  process.exit(1);
});
