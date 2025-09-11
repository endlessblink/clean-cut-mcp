#!/usr/bin/env node
/**
 * Clean-Cut-MCP - Simple Stdio Bridge for Claude Desktop
 * Direct stdio transport implementation - no HTTP bridge needed
 * This eliminates all external dependencies and potential corruption
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
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
        this.server = new McpServer({
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
        // Animation creation tool
        this.server.registerTool('create_animation', {
            description: 'Create a new animation component with specified type and properties',
            inputSchema: {
                type: z.enum(['bouncing-ball', 'sliding-text', 'rotating-object', 'fade-in-out'])
                    .describe('Type of animation to create'),
                title: z.string().optional().describe('Custom title for the animation'),
                backgroundColor: z.string().optional().describe('Background color (CSS color)')
            }
        }, async (request) => {
            try {
                const { type, title, backgroundColor } = request;
                log('Creating animation', { type, title, backgroundColor });
                const animationTitle = title || type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                const validComponentName = createValidIdentifier(animationTitle);
                const component = this.generateAnimationComponent(type, validComponentName, backgroundColor || '#000', animationTitle);
                const filename = `${validComponentName}Animation.tsx`;
                const filePath = path.join(WORKSPACE, 'src', filename);
                await fs.writeFile(filePath, component);
                await this.updateRootTsx(validComponentName, filename);
                return {
                    content: [{
                            type: 'text',
                            text: `[OK] Animation created successfully!\n\n` +
                                `**Type:** ${type}\n` +
                                `**Title:** ${animationTitle}\n` +
                                `**File:** ${filename}\n\n` +
                                `[STUDIO] Open Remotion Studio: http://localhost:${HOST_STUDIO_PORT}`
                        }]
                };
            }
            catch (error) {
                log('Animation creation error', { error: error.message });
                throw error;
            }
        });
        // Studio URL tool
        this.server.registerTool('get_studio_url', {
            description: 'Get the URL for Remotion Studio interface',
            inputSchema: {}
        }, async () => {
            return {
                content: [{
                        type: 'text',
                        text: `[STUDIO] Remotion Studio is available at:\n\nhttp://localhost:${HOST_STUDIO_PORT}\n\n` +
                            `Open this URL in your browser to access the visual editor for your animations.`
                    }]
            };
        });
        // Guidelines file reader tool
        this.server.registerTool('read_guidelines_file', {
            description: 'Read design guidelines and animation patterns from the claude-dev-guidelines folder',
            inputSchema: {
                filename: z.string().describe('Guidelines file to read (e.g., "PROJECT_CONFIG.md", "ADVANCED/ANIMATION_PATTERNS.md")')
            }
        }, async (request) => {
            try {
                const { filename } = request;
                log('Reading guidelines file', { filename });
                const filePath = path.join(GUIDELINES_DIR, filename);
                // Check if guidelines directory exists
                try {
                    await fs.access(GUIDELINES_DIR);
                }
                catch (error) {
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
                }
                catch (error) {
                    // List available files
                    try {
                        const files = await fs.readdir(GUIDELINES_DIR);
                        const mdFiles = files.filter(file => file.endsWith('.md'));
                        // Also check ADVANCED subdirectory
                        let advancedFiles = [];
                        try {
                            const advancedPath = path.join(GUIDELINES_DIR, 'ADVANCED');
                            const advanced = await fs.readdir(advancedPath);
                            advancedFiles = advanced.filter(file => file.endsWith('.md')).map(file => `ADVANCED/${file}`);
                        }
                        catch (e) {
                            // ADVANCED directory might not exist
                        }
                        const allFiles = [...mdFiles, ...advancedFiles];
                        return {
                            content: [{
                                    type: 'text',
                                    text: `[ERROR] Guidelines file "${filename}" not found.\n\nAvailable files:\n${allFiles.map(file => `• ${file}`).join('\n')}\n\nDirectory: ${GUIDELINES_DIR}`
                                }]
                        };
                    }
                    catch (listError) {
                        return {
                            content: [{
                                    type: 'text',
                                    text: `[ERROR] Failed to read guidelines directory: ${listError.message}`
                                }]
                        };
                    }
                }
            }
            catch (error) {
                log('Guidelines file read error', { error: error.message });
                return {
                    content: [{
                            type: 'text',
                            text: `[ERROR] Failed to read guidelines file: ${error.message}`
                        }]
                };
            }
        });
        // Animation guidelines tool - dynamically reads from guidelines files
        this.server.registerTool('get_animation_guidelines', {
            description: 'Get comprehensive animation guidelines and patterns from the guidelines directory',
            inputSchema: {
                category: z.enum(['project-config', 'advanced-patterns', 'animation-rules', 'all']).optional()
                    .describe('Category of guidelines to retrieve (defaults to all)')
            }
        }, async (request) => {
            try {
                const { category = 'all' } = request;
                log('Getting animation guidelines', { category });
                // Check if guidelines directory exists
                try {
                    await fs.access(GUIDELINES_DIR);
                }
                catch (error) {
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
                    }
                    catch (error) {
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
                            filesToRead = filesToRead.filter(file => file.includes('PATTERN') || file.includes('TEMPLATE'));
                        }
                        else if (category === 'animation-rules') {
                            filesToRead = filesToRead.filter(file => file.includes('RULE') || file.includes('ANIMATION'));
                        }
                        for (const file of filesToRead) {
                            try {
                                const filePath = path.join(advancedPath, file);
                                const fileContent = await fs.readFile(filePath, 'utf8');
                                content += `## ${file.replace('.md', '').replace(/_/g, ' ')}\n\n`;
                                content += fileContent + '\n\n';
                            }
                            catch (error) {
                                content += `## ${file}\n[ERROR] Could not read file\n\n`;
                            }
                        }
                    }
                    catch (error) {
                        content += '## ADVANCED GUIDELINES\n[ERROR] Could not read ADVANCED directory\n\n';
                    }
                }
                return {
                    content: [{
                            type: 'text',
                            text: content
                        }]
                };
            }
            catch (error) {
                log('Animation guidelines error', { error: error.message });
                return {
                    content: [{
                            type: 'text',
                            text: `[ERROR] Failed to get animation guidelines: ${error.message}`
                        }]
                };
            }
        });
        // List animations tool
        this.server.registerTool('list_animations', {
            description: 'List all available animation components in the workspace',
            inputSchema: {}
        }, async () => {
            try {
                const srcDir = path.join(WORKSPACE, 'src');
                const files = await fs.readdir(srcDir);
                const animationFiles = files.filter(file => file.endsWith('Animation.tsx'));
                if (animationFiles.length === 0) {
                    return {
                        content: [{
                                type: 'text',
                                text: '[EMPTY] No animations found.\n\nCreate your first animation using the `create_animation` tool!'
                            }]
                    };
                }
                const animations = animationFiles.map(file => `• ${file.replace('.tsx', '')}`).join('\n');
                return {
                    content: [{
                            type: 'text',
                            text: `[LIST] Available animations:\n\n${animations}\n\n` +
                                `[STUDIO] View them at: http://localhost:${HOST_STUDIO_PORT}`
                        }]
                };
            }
            catch (error) {
                log('List animations error', { error: error.message });
                return {
                    content: [{
                            type: 'text',
                            text: '[ERROR] Error listing animations: ' + error.message
                        }]
                };
            }
        });
    }
    generateAnimationComponent(type, componentName, backgroundColor, displayTitle) {
        const components = {
            'bouncing-ball': `import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const ${componentName}Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bounceHeight = spring({
    frame,
    fps,
    config: { damping: 6 }
  });

  const ballY = interpolate(bounceHeight, [0, 1], [300, 50]);

  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: ballY,
          width: 100,
          height: 100,
          backgroundColor: '#ff6b6b',
          borderRadius: '50%',
          transform: 'translateX(-50%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}
      />
    </AbsoluteFill>
  );
};`,
            'sliding-text': `import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';

export const ${componentName}Animation: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const textX = interpolate(frame, [0, 60], [-300, width / 2]);

  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          position: 'absolute',
          left: textX,
          fontSize: 80,
          fontWeight: 'bold',
          color: '#fff',
          transform: 'translateX(-50%)',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}
      >
${displayTitle || componentName}
      </div>
    </AbsoluteFill>
  );
};`,
            'rotating-object': `import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const ${componentName}Animation: React.FC = () => {
  const frame = useCurrentFrame();
  
  const rotation = interpolate(frame, [0, 120], [0, 360]);

  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          width: 200,
          height: 200,
          backgroundColor: '#4ecdc4',
          transform: \`rotate(\${rotation}deg)\`,
          borderRadius: 20,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
      />
    </AbsoluteFill>
  );
};`,
            'fade-in-out': `import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const ${componentName}Animation: React.FC = () => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame,
    [0, 30, 90, 120],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '${backgroundColor}', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          fontSize: 100,
          fontWeight: 'bold',
          color: '#fff',
          opacity,
          textShadow: '3px 3px 6px rgba(0,0,0,0.5)'
        }}
      >
${displayTitle || componentName}
      </div>
    </AbsoluteFill>
  );
};`
        };
        return components[type] || components['bouncing-ball'];
    }
    async updateRootTsx(componentName, filename) {
        const rootPath = path.join(WORKSPACE, 'src', 'Root.tsx');
        const importName = `${componentName}Animation`;
        try {
            let rootContent = await fs.readFile(rootPath, 'utf8');
            // Add import if not present
            if (!rootContent.includes(`import { ${importName} }`)) {
                const importLine = `import { ${importName} } from './${filename.replace('.tsx', '')}';`;
                rootContent = importLine + '\n' + rootContent;
            }
            // Add composition if not present
            if (!rootContent.includes(`id="${componentName}"`)) {
                const compositionLine = `      <Composition
        id="${componentName}"
        component={${importName}}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />`;
                // Insert before the closing fragment or closing tag
                if (rootContent.includes('</Folder>')) {
                    rootContent = rootContent.replace('</Folder>', `${compositionLine}\n    </Folder>`);
                }
                else if (rootContent.includes('    </>')) {
                    rootContent = rootContent.replace('    </>', `${compositionLine}\n    </>`);
                }
            }
            await fs.writeFile(rootPath, rootContent);
            log('Root.tsx updated successfully', { componentName });
        }
        catch (error) {
            log('Root.tsx update error', { error: error.message });
            throw new Error(`Failed to update Root.tsx: ${error.message}`);
        }
    }
    async start() {
        log('Starting Clean-Cut-MCP stdio server');
        // Add error handlers before connecting
        this.transport.onclose = () => {
            log('Transport closed - shutting down gracefully');
            process.exit(0);
        };
        this.transport.onerror = (error) => {
            log('Transport error', { error: error.message });
            process.exit(1);
        };
        await this.server.connect(this.transport);
        log('Clean-Cut-MCP ready for Claude Desktop!');
        log(`Workspace: ${WORKSPACE}`);
        log(`Studio: http://localhost:${STUDIO_PORT}`);
        // Keep the process alive to handle incoming requests
        return new Promise((resolve, reject) => {
            log('MCP server listening for requests...');
            // Add process error handlers
            process.on('unhandledRejection', (reason) => {
                log('Unhandled promise rejection', { reason });
                reject(reason);
            });
            process.on('uncaughtException', (error) => {
                log('Uncaught exception', { error: error.message, stack: error.stack });
                reject(error);
            });
        });
    }
}
// Start the server
async function main() {
    try {
        const server = new CleanCutMcpServer();
        await server.start();
    }
    catch (error) {
        log('Fatal error starting stdio server', { error: error.message, stack: error.stack });
        process.exit(1);
    }
}
// Handle shutdown gracefully
process.on('SIGINT', () => {
    log('Received SIGINT, shutting down');
    process.exit(0);
});
process.on('SIGTERM', () => {
    log('Received SIGTERM, shutting down');
    process.exit(0);
});
// Start the server immediately (more reliable than import.meta.url check)
main().catch((error) => {
    log('Unhandled error in main', { error: error.message, stack: error.stack });
    process.exit(1);
});
