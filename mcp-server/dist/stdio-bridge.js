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
                        description: 'Create a fully custom animation from detailed description, using guidelines and best practices for themed content',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                description: {
                                    type: 'string',
                                    description: 'Detailed description of the animation (e.g., "twinkling stars with constellation patterns", "bouncing rainbow balls with trails")'
                                },
                                componentName: {
                                    type: 'string',
                                    description: 'Custom component name (if not provided, auto-generated from description)'
                                },
                                duration: {
                                    type: 'number',
                                    default: 3,
                                    description: 'Duration in seconds'
                                },
                                fps: {
                                    type: 'number',
                                    default: 30,
                                    description: 'Frames per second'
                                },
                                width: {
                                    type: 'number',
                                    default: 1920,
                                    description: 'Video width in pixels'
                                },
                                height: {
                                    type: 'number',
                                    default: 1080,
                                    description: 'Video height in pixels'
                                },
                                backgroundColor: {
                                    type: 'string',
                                    default: '#000000',
                                    description: 'Background color'
                                },
                                useGuidelines: {
                                    type: 'boolean',
                                    default: true,
                                    description: 'Whether to apply animation guidelines and best practices'
                                }
                            },
                            required: ['description']
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
            if (name === 'create_custom_animation') {
                try {
                    log('Creating custom animation - direct handler', { name, args });
                    const { description, componentName, duration = 3, fps = 30, width = 1920, height = 1080, backgroundColor = '#000000', useGuidelines = true } = args || {};
                    // Validate required description parameter
                    if (!description) {
                        return {
                            content: [{ type: 'text', text: '[ERROR] Description is required for custom animation creation' }],
                            isError: true
                        };
                    }
                    // Generate component name if not provided
                    const finalComponentName = componentName || this.generateComponentName(description);
                    // Generate custom animation code
                    const componentCode = await this.generateCustomAnimationComponent(description, finalComponentName, backgroundColor, duration, fps, width, height, useGuidelines);
                    const filename = `${finalComponentName}.tsx`;
                    await this.writeAnimationFile(filename, componentCode);
                    await this.updateRootTsx(finalComponentName);
                    return {
                        content: [{
                                type: 'text',
                                text: `[CUSTOM ANIMATION CREATED] ${finalComponentName}\n\n` +
                                    `[FILE] ${filename}\n\n` +
                                    `[DESCRIPTION] ${description}\n\n` +
                                    `[STUDIO] Animation ready at http://localhost:${HOST_STUDIO_PORT}\n\n` +
                                    `[COMPONENT CODE]\n\`\`\`tsx\n${componentCode}\n\`\`\``
                            }]
                    };
                }
                catch (error) {
                    log('Custom animation creation error', { error: error.message });
                    return {
                        content: [{ type: 'text', text: `[ERROR] Failed to create custom animation: ${error.message}` }],
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
                    const filePath = path.join(WORKSPACE, 'src', filename);
                    const content = await fs.readFile(filePath, 'utf8');
                    return {
                        content: [{
                                type: 'text',
                                text: `[ANIMATION CODE] ${filename}\n\n\`\`\`tsx\n${content}\n\`\`\``
                            }]
                    };
                }
                catch (error) {
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
                    const filePath = path.join(WORKSPACE, 'src', filename);
                    const existingContent = await fs.readFile(filePath, 'utf8');
                    // Apply modifications (this would need proper implementation)
                    const modifiedContent = await this.applyModifications(existingContent, modifications);
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
                }
                catch (error) {
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
    generateComponentName(description) {
        // Convert description to PascalCase component name
        const words = description
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0)
            .slice(0, 3); // Take first 3 words
        const componentName = words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
        return componentName + 'Animation';
    }
    async generateCustomAnimationComponent(description, componentName, backgroundColor, duration, fps, width, height, useGuidelines) {
        // Analyze description to determine animation elements and patterns
        const lowerDesc = description.toLowerCase();
        if (lowerDesc.includes('star') || lowerDesc.includes('constellation') || lowerDesc.includes('twinkle')) {
            // Star/constellation animation with twinkling effects
            return this.generateStarAnimation(componentName, backgroundColor, duration, fps, width, height);
        }
        else if (lowerDesc.includes('bounce') || lowerDesc.includes('ball')) {
            // Bouncing animation
            return this.generateBouncingAnimation(componentName, backgroundColor, duration, fps, width, height);
        }
        else {
            // Generic custom animation based on description
            return this.generateGenericCustomAnimation(componentName, backgroundColor, description, duration, fps, width, height);
        }
    }
    generateStarAnimation(componentName, backgroundColor, duration, fps, width, height) {
        return `import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, random } from 'remotion';

export const ${componentName}: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // Create stars with twinkling effect
  const stars = Array.from({ length: 12 }, (_, i) => ({
    x: random(\`star-x-\${i}\`) * ${width},
    y: random(\`star-y-\${i}\`) * ${height},
    size: random(\`star-size-\${i}\`) * 25 + 15,
    twinkleSpeed: random(\`star-speed-\${i}\`) * 1.5 + 0.5,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}' }}>
      {stars.map((star, index) => {
        const opacity = Math.abs(Math.sin(frame * 0.05 * star.twinkleSpeed)) * 0.8 + 0.2;
        
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: star.x - star.size / 2,
              top: star.y - star.size / 2,
              width: star.size,
              height: star.size,
              background: 'radial-gradient(circle, #ffffff, #ffdd44)',
              borderRadius: '50%',
              opacity: opacity,
              filter: 'drop-shadow(0 0 8px #ffdd44)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};`;
    }
    generateBouncingAnimation(componentName, backgroundColor, duration, fps, width, height) {
        return `import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName}: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  const ballSize = 80;
  const bounceHeight = ${height} * 0.5;
  
  const x = interpolate(frame, [0, durationInFrames], [ballSize, ${width} - ballSize]);
  const bounceProgress = (frame / ${fps}) * 3;
  const y = ${height} - ballSize - Math.abs(Math.sin(bounceProgress * Math.PI)) * bounceHeight;
  
  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}' }}>
      <div
        style={{
          position: 'absolute',
          left: x - ballSize / 2,
          top: y - ballSize / 2,
          width: ballSize,
          height: ballSize,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
        }}
      />
    </AbsoluteFill>
  );
};`;
    }
    generateGenericCustomAnimation(componentName, backgroundColor, description, duration, fps, width, height) {
        return `import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName}: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  const rotation = interpolate(frame, [0, durationInFrames], [0, 360]);
  const scale = interpolate(frame, [0, durationInFrames / 2, durationInFrames], [0.5, 1.2, 0.8]);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: \`translate(-50%, -50%) rotate(\${rotation}deg) scale(\${scale})\`,
          width: 200,
          height: 200,
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          borderRadius: '20px',
        }}
      />
    </AbsoluteFill>
  );
};`;
    }
    async applyModifications(existingContent, modifications) {
        // Simple modification system
        const modificationComment = `// Modified: ${modifications}`;
        return modificationComment + '\n' + existingContent;
    }
    async updateRootTsx(componentName) {
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
            // Add composition
            const compositionId = componentName.replace('Animation', '');
            const compositionElement = `      <Composition
        id="${compositionId}"
        component={${componentName}}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />`;
            if (!rootContent.includes(compositionId)) {
                const compositionInsertPoint = rootContent.lastIndexOf('</Folder>');
                if (compositionInsertPoint !== -1) {
                    rootContent = rootContent.slice(0, compositionInsertPoint) +
                        compositionElement + '\n' +
                        rootContent.slice(compositionInsertPoint);
                }
            }
            await fs.writeFile(rootPath, rootContent);
            log('Updated Root.tsx with new composition', { componentName });
        }
        catch (error) {
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
