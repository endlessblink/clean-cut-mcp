#!/usr/bin/env node
/**
 * Clean-Cut-MCP - Simple Stdio Bridge for Claude Desktop
 * Direct stdio transport implementation - no HTTP bridge needed
 * This eliminates all external dependencies and potential corruption
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import fs from 'fs/promises';
// CRITICAL: stderr-only logging (never stdout - breaks JSON-RPC)
const log = (message, data) => {
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
const createValidIdentifier = (input) => {
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
    server;
    transport;
    studioProcess = null;
    constructor() {
        this.transport = new StdioServerTransport();
        this.server = new Server({
            name: 'clean-cut-mcp',
            version: '1.0.0'
        }, {
            capabilities: {
                tools: {}
            }
        });
        this.setupTools();
    }
    setupTools() {
        // List tools handler using proper schema
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'create_animation',
                        description: 'Create a new Remotion animation component',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                    enum: ['bouncing-ball', 'sliding-text', 'rotating-object', 'fade-in-out'],
                                    description: 'Type of animation to create'
                                },
                                title: {
                                    type: 'string',
                                    description: 'Title for the animation (optional, defaults to type name)'
                                },
                                backgroundColor: {
                                    type: 'string',
                                    description: 'Background color (hex color code, defaults to #000)'
                                }
                            },
                            required: ['type']
                        }
                    },
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
                    }
                ]
            };
        });
        // Tool call handler using proper schema
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            if (name === 'create_animation') {
                try {
                    log('Creating animation - direct handler', { name, args });
                    const { type, title, backgroundColor } = args || {};
                    // Validate required type parameter
                    if (!type) {
                        return {
                            content: [{ type: 'text', text: '[ERROR] Animation type is required. Please specify one of: bouncing-ball, sliding-text, rotating-object, fade-in-out' }],
                            isError: true
                        };
                    }
                    const animationTitle = title || type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    const validComponentName = createValidIdentifier(animationTitle);
                    const component = this.generateAnimationComponent(type, validComponentName, backgroundColor || '#000', animationTitle);
                    const filename = `${validComponentName}Animation.tsx`;
                    await this.writeAnimationFile(filename, component);
                    await this.updateRootFile(validComponentName);
                    return {
                        content: [{
                                type: 'text',
                                text: `[SUCCESS] ${type} animation created!\n\n[COMPONENT] ${validComponentName}Animation\n[FILE] ${filename}\n[STUDIO] http://localhost:${HOST_STUDIO_PORT}\n\nYour animation is now available in Remotion Studio!`
                            }]
                    };
                }
                catch (error) {
                    log('Animation creation error', { error: error.message });
                    return {
                        content: [{ type: 'text', text: `[ERROR] Animation creation failed: ${error.message}` }],
                        isError: true
                    };
                }
            }
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
                }
                catch (error) {
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
                }
                catch (error) {
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
                    const guidelinesPath = path.join(GUIDELINES_DIR, filename);
                    log('Reading guidelines file', { filename, path: guidelinesPath });
                    const content = await fs.readFile(guidelinesPath, 'utf8');
                    return {
                        content: [{
                                type: 'text',
                                text: `[GUIDELINES: ${filename}]\n\n${content}`
                            }]
                    };
                }
                catch (error) {
                    log('Guidelines file error', { error: error.message });
                    return {
                        content: [{ type: 'text', text: `[ERROR] Failed to read guidelines file: ${error.message}` }],
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
    async writeAnimationFile(filename, content) {
        const filePath = path.join(WORKSPACE, 'src', filename);
        await fs.writeFile(filePath, content);
        log('Created animation file', { filename, path: filePath });
    }
    async updateRootFile(componentName) {
        const rootPath = path.join(WORKSPACE, 'src', 'Root.tsx');
        try {
            let rootContent = await fs.readFile(rootPath, 'utf8');
            // Add import statement
            const importStatement = `import {${componentName}Animation} from './${componentName}Animation';`;
            if (!rootContent.includes(importStatement)) {
                // Find the last import and insert after it
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
            // Add composition
            const compositionId = componentName.replace('Animation', '');
            const compositionElement = `      <Composition
        id="${compositionId}"
        component={${componentName}Animation}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />`;
            if (!rootContent.includes(`id="${compositionId}"`)) {
                // Insert before the closing </> 
                rootContent = rootContent.replace(/(\s+)<\/>/, `$1${compositionElement}
$1</>`);
            }
            await fs.writeFile(rootPath, rootContent);
            log('Updated Root.tsx', { componentName });
        }
        catch (error) {
            log('Failed to update Root.tsx', { error: error.message });
            throw error;
        }
    }
    generateAnimationComponent(type, componentName, backgroundColor, title) {
        switch (type) {
            case 'bouncing-ball':
                return `import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName}Animation: React.FC = () => {
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
};`;
            case 'sliding-text':
                return `import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName}Animation: React.FC = () => {
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
        transform: \`translateX(\$\{slideIn + slideOut\}px)\`,
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
};`;
            case 'rotating-object':
                return `import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName}Animation: React.FC = () => {
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
    [durationInFrames * 0.5, durationInFrames],
    [1.5, 0.5],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        transform: \`rotate(\$\{rotation\}deg) scale(\$\{scale\})\`,
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
};`;
            case 'fade-in-out':
                return `import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName}Animation: React.FC = () => {
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
};`;
            default:
                throw new Error(`Unsupported animation type: ${type}`);
        }
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
    cleanup() {
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
        }
        catch (error) {
            log('Error during cleanup', { error: error.message });
        }
    }
}
// Start the server with proper error handling per MCP best practices
async function main() {
    try {
        const server = new CleanCutMcpServer();
        await server.start();
        log('STDIO server completed normally');
    }
    catch (error) {
        log('Fatal error starting stdio server', { error: error.message, stack: error.stack });
        // Exit with error code for process manager to restart
        process.exit(1);
    }
}
// Graceful shutdown handling (per Node.js best practices)
const shutdown = (signal) => {
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
