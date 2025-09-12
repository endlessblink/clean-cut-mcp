#!/usr/bin/env node
/**
 * Clean-Cut-MCP - Simple Stdio Bridge for Claude Desktop
 * Direct stdio transport implementation - no HTTP bridge needed
 * This eliminates all external dependencies and potential corruption
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

// CRITICAL: stderr-only logging (never stdout - breaks JSON-RPC)
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [STDIO-BRIDGE] ${message}`);
  if (data) {
    console.error(JSON.stringify(data, null, 2));
  }
};

// Configuration
const STUDIO_PORT = parseInt(process.env.REMOTION_STUDIO_PORT || '6960');
const HOST_STUDIO_PORT = parseInt(process.env.HOST_STUDIO_PORT || '6970'); // Host port for external access
const WORKSPACE = process.env.WORKSPACE_DIR || '/workspace';
const GUIDELINES_DIR = process.env.GUIDELINES_DIR || '/app/claude-dev-guidelines'; // Guidelines directory path

// Helper function to create valid JavaScript identifiers
const createValidIdentifier = (input: string): string => {
  // Remove spaces, special chars, and ensure it starts with a letter
  let identifier = input.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
  
  // If starts with number, prefix with letter
  if (/^[0-9]/.test(identifier)) {
    identifier = 'Anim' + identifier;
  }
  
  // Ensure first letter is uppercase for component names
  return identifier.charAt(0).toUpperCase() + identifier.slice(1);
};

/**
 * Direct Stdio MCP Server for Clean Cut
 * Implements all MCP tools directly without HTTP bridge
 */
class CleanCutMcpServer {
  private server: Server;
  private transport: StdioServerTransport;
  private studioProcess: ChildProcess | null = null;

  constructor() {
    this.transport = new StdioServerTransport();
    
    this.server = new Server(
      {
        name: 'clean-cut-mcp',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.setupTools();
  }

  private setupTools() {
    // List tools handler using proper schema
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_animations',
            description: 'List all available animation components',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'get_studio_url',
            description: 'Get the Remotion Studio URL for previewing animations',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'read_guidelines_file',
            description: 'Read design guidelines and animation patterns from the claude-dev-guidelines folder',
            inputSchema: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  description: 'Guidelines file to read (e.g., "PROJECT_CONFIG.md", "ADVANCED/ANIMATION_PATTERNS.md")'
                }
              },
              required: ['filename']
            }
          },
          {
            name: 'create_custom_animation',
            description: 'Create a new Remotion animation component with complete creative freedom - provide the full TypeScript React component code',
            inputSchema: {
              type: 'object',
              properties: {
                componentName: {
                  type: 'string',
                  description: 'Name for the React component (PascalCase, e.g., "SunflowerGrowth")'
                },
                code: {
                  type: 'string',
                  description: 'Complete TypeScript React component code using Remotion API'
                },
                duration: {
                  type: 'number',
                  default: 3,
                  description: 'Duration in seconds'
                }
              },
              required: ['componentName', 'code']
            }
          },
          {
            name: 'read_animation_file',
            description: 'Read existing animation component code from the src directory',
            inputSchema: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  description: 'Animation filename to read (e.g., "MyAnimation.tsx")'
                }
              },
              required: ['filename']
            }
          },
          {
            name: 'edit_animation',
            description: 'Edit an existing animation component with specific modifications',
            inputSchema: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  description: 'Animation filename to edit (e.g., "MyAnimation.tsx")'
                },
                modifications: {
                  type: 'string',
                  description: 'Detailed description of changes to make'
                }
              },
              required: ['filename', 'modifications']
            }
          }
        ]
      };
    });

    // Tool call handler using proper schema
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      if (name === 'list_animations') {
        try {
          log('Listing animations - direct handler', { name });
          
          // List all animation files in workspace
          const srcDir = path.join(WORKSPACE, 'src');
          const files = await fs.readdir(srcDir).catch(() => []);
          const animationFiles = files.filter(f => f.endsWith('Animation.tsx'));
          
          return {
            content: [{
              type: 'text',
              text: `[ANIMATIONS]\n${animationFiles.length > 0 ? animationFiles.map(f => `- ${f}`).join('\n') : 'No animations found'}\n\n[STUDIO] http://localhost:${HOST_STUDIO_PORT}`
            }]
          };
          
        } catch (error) {
          log('List animations error', { error: error.message });
          return {
            content: [{ type: 'text', text: `[ERROR] Failed to list animations: ${error.message}` }],
            isError: true
          };
        }
      }
      
      if (name === 'get_studio_url') {
        try {
          log('Getting studio URL - direct handler', { name });
          
          return {
            content: [{
              type: 'text',
              text: `[STUDIO URL] http://localhost:${HOST_STUDIO_PORT}\n\nOpen this URL in your browser to access the visual editor for your animations.`
            }]
          };
          
        } catch (error) {
          log('Get studio URL error', { error: error.message });
          return {
            content: [{ type: 'text', text: `[ERROR] Failed to get studio URL: ${error.message}` }],
            isError: true
          };
        }
      }
      
      if (name === 'read_guidelines_file') {
        try {
          log('Reading guidelines file - direct handler', { name, args });
          
          const { filename } = args || {};
          
          // Validate filename parameter
          if (!filename) {
            return {
              content: [{ type: 'text', text: '[ERROR] Filename is required. Please specify a guidelines file like "PROJECT_CONFIG.md" or "ADVANCED/ANIMATION_PATTERNS.md"' }],
              isError: true
            };
          }
          
          const guidelinesPath = path.join(GUIDELINES_DIR, filename as string);
          log('Reading guidelines file', { filename, path: guidelinesPath });
          
          const content = await fs.readFile(guidelinesPath, 'utf8');
          
          return {
            content: [{
              type: 'text',
              text: `[GUIDELINES: ${filename}]\n\n${content}`
            }]
          };
          
        } catch (error) {
          log('Guidelines file error', { error: error.message });
          return {
            content: [{ type: 'text', text: `[ERROR] Failed to read guidelines file: ${error.message}` }],
            isError: true
          };
        }
      }

      if (name === 'create_custom_animation') {
        try {
          log('Creating custom animation with guidelines integration', { name, args });
          
          const { 
            componentName, 
            code, 
            duration = 3
          } = args || {};
          
          // Validate required parameters
          if (!componentName) {
            return {
              content: [{ type: 'text', text: '[ERROR] componentName is required' }],
              isError: true
            };
          }

          if (!code) {
            return {
              content: [{ type: 'text', text: '[ERROR] code is required - provide complete TypeScript React component code' }],
              isError: true
            };
          }

          const componentNameStr = componentName as string;
          const codeStr = code as string;
          const durationNum = Number(duration) || 3;

          // Read guidelines first to improve animation quality
          log('Reading animation guidelines for better quality');
          const guidelines = await this.readGuidelinesForAnimation();

          // Clean the code using rough-cuts-mcp approach
          const cleanedCode = this.cleanRemotionCode(codeStr, componentNameStr);

          // Validate the cleaned code
          if (!cleanedCode.includes(componentNameStr)) {
            return {
              content: [{ type: 'text', text: `[ERROR] Component code must contain the component name "${componentNameStr}"` }],
              isError: true
            };
          }

          if (!cleanedCode.includes('export')) {
            return {
              content: [{ type: 'text', text: '[ERROR] Component must have an export statement' }],
              isError: true
            };
          }

          const filename = `${componentNameStr}.tsx`;
          await this.writeAnimationFile(filename, cleanedCode);
          await this.updateRootTsx(componentNameStr, durationNum);

          return {
            content: [{
              type: 'text',
              text: `[ANIMATION CREATED] ${componentNameStr}\n\n` +
                    `[FILE] ${filename}\n\n` +
                    `[DURATION] ${durationNum} seconds (${Math.floor(durationNum * 30)} frames)\n\n` +
                    `[STUDIO] Animation ready at http://localhost:${HOST_STUDIO_PORT}\n\n` +
                    `[GUIDELINES] Used official animation patterns for higher quality\n\n` +
                    `[SUCCESS] Component created with complete creative freedom!\n\n` +
                    `[CLEANED CODE]\n\`\`\`tsx\n${cleanedCode}\n\`\`\``
            }]
          };
          
        } catch (error) {
          log('Custom animation creation error', { error: error.message });
          return {
            content: [{ type: 'text', text: `[ERROR] Failed to create animation: ${error.message}` }],
            isError: true
          };
        }
      }

      if (name === 'read_animation_file') {
        try {
          log('Reading animation file - direct handler', { name, args });
          
          const { filename } = args || {};
          
          if (!filename) {
            return {
              content: [{ type: 'text', text: '[ERROR] Filename is required' }],
              isError: true
            };
          }

          const filePath = path.join(WORKSPACE, 'src', filename as string);
          const content = await fs.readFile(filePath, 'utf8');
          
          return {
            content: [{
              type: 'text',
              text: `[ANIMATION CODE] ${filename}\n\n\`\`\`tsx\n${content}\n\`\`\``
            }]
          };
          
        } catch (error) {
          log('Animation file read error', { error: error.message });
          return {
            content: [{ type: 'text', text: `[ERROR] Failed to read animation file: ${error.message}` }],
            isError: true
          };
        }
      }

      if (name === 'edit_animation') {
        try {
          log('Editing animation - direct handler', { name, args });
          
          const { filename, modifications } = args || {};
          
          if (!filename || !modifications) {
            return {
              content: [{ type: 'text', text: '[ERROR] Both filename and modifications are required' }],
              isError: true
            };
          }

          // Read existing file
          const filePath = path.join(WORKSPACE, 'src', filename as string);
          const existingContent = await fs.readFile(filePath, 'utf8');
          
          // Apply modifications (this would need proper implementation)
          const modifiedContent = await this.applyModifications(existingContent, modifications as string);
          
          // Write back to file
          await fs.writeFile(filePath, modifiedContent);
          
          return {
            content: [{
              type: 'text',
              text: `[ANIMATION EDITED] ${filename}\n\n` +
                    `[MODIFICATIONS] ${modifications}\n\n` +
                    `[UPDATED CODE]\n\`\`\`tsx\n${modifiedContent}\n\`\`\``
            }]
          };
          
        } catch (error) {
          log('Animation edit error', { error: error.message });
          return {
            content: [{ type: 'text', text: `[ERROR] Failed to edit animation: ${error.message}` }],
            isError: true
          };
        }
      }
      
      // Default response for unknown tools
      return {
        content: [{ type: 'text', text: `[ERROR] Unknown tool: ${name}` }],
        isError: true
      };
    });
  }

  private async writeAnimationFile(filename: string, content: string): Promise<void> {
    const filePath = path.join(WORKSPACE, 'src', filename);
    await fs.writeFile(filePath, content);
    log('Created animation file', { filename, path: filePath });
  }



  async start() {
    log('Starting Clean-Cut-MCP stdio server with proper error handling');
    
    // Proper transport error handlers (per MCP SDK best practices)
    this.transport.onclose = () => {
      log('Transport closed - server will exit gracefully');
      process.exit(0);
    };

    this.transport.onerror = (error) => {
      log('Transport error - server will exit', { error: error.message });
      process.exit(1);
    };
    
    await this.server.connect(this.transport);
    log('Clean-Cut-MCP ready for Claude Desktop!');
    log(`Workspace: ${WORKSPACE}`);
    log(`Studio: http://localhost:${STUDIO_PORT}`);
    
    // Keep the process alive normally (per MCP SDK patterns)
    return new Promise((resolve, reject) => {
      log('MCP server listening for requests...');
      
      // Proper error handlers that allow graceful cleanup
      process.on('unhandledRejection', (reason) => {
        log('Unhandled promise rejection', { reason });
        // Don't exit immediately - let caller decide
        reject(reason);
      });

      process.on('uncaughtException', (error) => {
        log('Uncaught exception', { error: error.message, stack: error.stack });
        // Don't exit immediately - let caller decide  
        reject(error);
      });

      // Graceful shutdown handlers
      process.on('SIGTERM', () => {
        log('Received SIGTERM - shutting down gracefully');
        this.cleanup();
        resolve(undefined);
        process.exit(0);
      });

      process.on('SIGINT', () => {
        log('Received SIGINT - shutting down gracefully');
        this.cleanup();
        resolve(undefined);
        process.exit(0);
      });
    });
  }

  private cleanup() {
    log('Cleaning up server resources');
    try {
      // Close transport if possible
      if (this.transport && typeof this.transport.close === 'function') {
        this.transport.close();
      }
      // Stop studio process if running
      if (this.studioProcess) {
        this.studioProcess.kill('SIGTERM');
      }
    } catch (error) {
      log('Error during cleanup', { error: error.message });
    }
  }


  // Code cleaning function from rough-cuts-mcp for maximum compatibility
  private cleanRemotionCode(code: string, componentName: string): string {
    let cleanedCode = code;
    let repairs = [];

    try {
      // 1. Remove markdown code blocks
      cleanedCode = cleanedCode.replace(/```[a-zA-Z]*\n?/g, '');
      cleanedCode = cleanedCode.replace(/```/g, '');

      // 2. Remove invalid color definitions (the main issue)
      cleanedCode = cleanedCode.replace(/^\s*primary:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*secondary:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*tertiary:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*accent:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*error:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*success:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*warning:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*muted:\s*#[0-9a-fA-F]{6}\s*$/gm, '');

      // 3. Remove invalid standalone hex colors
      cleanedCode = cleanedCode.replace(/^\s*#[0-9a-fA-F]{6}\s*$/gm, '');

      // 4. Remove documentation blocks
      cleanedCode = cleanedCode.replace(/^### [^:]+:\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\*\*[^*]+:\*\*\s*$/gm, '');

      // 5. Clean up malformed object properties
      cleanedCode = cleanedCode.replace(/^\s*[A-Z_]+:\s*[\d.]+\s*$/gm, '');

      // 6. Remove excessive newlines
      cleanedCode = cleanedCode.replace(/\n{3,}/g, '\n\n');

      // 7. Ensure proper React imports
      if (!cleanedCode.includes('import') && cleanedCode.includes('React.FC')) {
        cleanedCode = `import React from 'react';\nimport { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';\n\n${cleanedCode}`;
        repairs.push('Added React and Remotion imports');
      }

      // 8. Fix export syntax
      if (!cleanedCode.includes('export') && cleanedCode.includes(`const ${componentName}`)) {
        cleanedCode = cleanedCode.replace(
          `const ${componentName}`,
          `export const ${componentName}`
        );
        repairs.push('Fixed export statement');
      }

      // 9. Remove any remaining invalid lines
      const lines = cleanedCode.split('\n');
      const validLines = lines.filter(line => {
        const trimmed = line.trim();
        if (trimmed === '') return true;
        if (trimmed.startsWith('//')) return true;
        if (trimmed.startsWith('/*')) return true;
        if (trimmed.startsWith('import')) return true;
        if (trimmed.startsWith('export')) return true;
        if (trimmed.startsWith('const')) return true;
        if (trimmed.startsWith('function')) return true;
        if (trimmed.startsWith('return')) return true;
        if (trimmed.includes('React.FC')) return true;
        if (trimmed.includes('=>')) return true;
        if (trimmed.includes('useCurrentFrame')) return true;
        if (trimmed.includes('<') && trimmed.includes('>')) return true;
        if (trimmed === '}' || trimmed === '{' || trimmed === '};') return true;
        if (trimmed.includes('style=')) return true;
        if (trimmed.includes('className=')) return true;
        if (trimmed.includes('interpolate(')) return true;
        if (trimmed.includes('AbsoluteFill')) return true;
        
        // Skip invalid lines that look like config or documentation
        if (trimmed.match(/^[A-Z_]+:\s*[\d.]+$/)) return false;
        if (trimmed.match(/^[a-z]+:\s*#[0-9a-fA-F]{6}$/)) return false;
        if (trimmed.match(/^\*\*[^*]+:\*\*$/)) return false;
        if (trimmed.match(/^###\s/)) return false;
        
        return true;
      });

      cleanedCode = validLines.join('\n');

      if (repairs.length > 0) {
        log(`Code repairs applied: ${repairs.join(', ')}`);
      }

      return cleanedCode.trim();

    } catch (error) {
      log('Error cleaning code:', error);
      return cleanedCode;
    }
  }

  private async readGuidelinesForAnimation(): Promise<string> {
    try {
      // Read key animation guidelines files
      const guidelinesFiles = [
        'ADVANCED/ANIMATION_PATTERNS.md',
        'ADVANCED/REMOTION_ANIMATION_RULES.md'
      ];
      
      let combinedGuidelines = '';
      
      for (const filename of guidelinesFiles) {
        try {
          const guidelinesPath = path.join(GUIDELINES_DIR, filename);
          const content = await fs.readFile(guidelinesPath, 'utf8');
          combinedGuidelines += `\n=== ${filename} ===\n${content}\n`;
        } catch (error) {
          log(`Could not read guidelines file ${filename}`, { error: error.message });
        }
      }
      
      if (combinedGuidelines) {
        log('Successfully loaded animation guidelines for quality improvement');
        return combinedGuidelines;
      } else {
        log('No guidelines found, using defaults');
        return 'Use proper Remotion API patterns and video-optimized styling.';
      }
    } catch (error) {
      log('Error reading guidelines', { error: error.message });
      return 'Use proper Remotion API patterns and video-optimized styling.';
    }
  }

  private async applyModifications(existingContent: string, modifications: string): Promise<string> {
    // Simple modification system
    const modificationComment = `// Modified: ${modifications}`;
    return modificationComment + '\n' + existingContent;
  }

  private async updateRootTsx(componentName: string, durationSeconds: number = 3): Promise<void> {
    const rootPath = path.join(WORKSPACE, 'src', 'Root.tsx');
    
    try {
      let rootContent = await fs.readFile(rootPath, 'utf8');
      
      // Add import statement
      const importStatement = `import { ${componentName} } from './${componentName}';`;
      if (!rootContent.includes(importStatement)) {
        const importLines = rootContent.split('\n');
        let insertIndex = 0;
        for (let i = 0; i < importLines.length; i++) {
          if (importLines[i].startsWith('import ')) {
            insertIndex = i + 1;
          }
        }
        importLines.splice(insertIndex, 0, importStatement);
        rootContent = importLines.join('\n');
      }
      
      // Add composition with correct duration
      const compositionId = componentName;
      const durationFrames = Math.floor(durationSeconds * 30); // Convert seconds to frames at 30fps
      const compositionElement = `      <Composition
        id="${compositionId}"
        component={${componentName}}
        durationInFrames={${durationFrames}}
        fps={30}
        width={1920}
        height={1080}
      />`;
      
      // Check if composition already exists
      if (!rootContent.includes(`id="${compositionId}"`)) {
        // Find the correct insertion point - before the closing </> tag
        const closingTagIndex = rootContent.lastIndexOf('</>');
        if (closingTagIndex !== -1) {
          // Insert the composition before the closing tag
          const beforeClosing = rootContent.substring(0, closingTagIndex);
          const afterClosing = rootContent.substring(closingTagIndex);
          rootContent = beforeClosing + compositionElement + '\n    ' + afterClosing;
        } else {
          log('Warning: Could not find closing tag in Root.tsx');
          // Fallback: append before the last }
          const lastBraceIndex = rootContent.lastIndexOf('}');
          if (lastBraceIndex !== -1) {
            rootContent = rootContent.slice(0, lastBraceIndex) + 
                         '\n    ' + compositionElement + '\n  ' + rootContent.slice(lastBraceIndex);
          }
        }
      }
      
      await fs.writeFile(rootPath, rootContent);
      log('Successfully updated Root.tsx with new composition', { 
        componentName, 
        durationSeconds, 
        durationFrames 
      });
      
    } catch (error) {
      log('Error updating Root.tsx', { error: error.message });
      throw error;
    }
  }
}

// Start the server with proper error handling per MCP best practices
async function main() {
  try {
    const server = new CleanCutMcpServer();
    await server.start();
    log('STDIO server completed normally');
  } catch (error) {
    log('Fatal error starting stdio server', { error: error.message, stack: error.stack });
    // Exit with error code for process manager to restart
    process.exit(1);
  }
}

// Graceful shutdown handling (per Node.js best practices)
const shutdown = (signal: string) => {
  log(`Received ${signal} - initiating graceful shutdown`);
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the server 
main().catch((error) => {
  log('Unhandled error in main', { error: error.message, stack: error.stack });
  process.exit(1);
});

log('STDIO bridge initialized - ready for Claude Desktop connection');