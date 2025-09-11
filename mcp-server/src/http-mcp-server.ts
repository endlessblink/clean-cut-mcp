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
import { createWriteStream } from 'fs';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MCP_PORT = parseInt(process.env.MCP_PORT || '6961');
const STUDIO_PORT = parseInt(process.env.REMOTION_STUDIO_PORT || '6960');
const APP_ROOT = process.env.DOCKER_CONTAINER === 'true' ? '/app' : path.resolve(__dirname, '../..');
const EXPORTS_DIR = path.join(APP_ROOT, 'exports');
const SRC_DIR = path.join(APP_ROOT, 'src');

// CRITICAL FIX: Safe stderr-only logging (no stdout pollution)
const logStream = createWriteStream('clean-cut-mcp.log', { flags: 'a' });
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
      inputSchema: z.object({
        type: z.enum(['bouncing-ball', 'sliding-text', 'rotating-object', 'fade-in-out']).describe('Type of animation to create'),
        title: z.string().optional().describe('Title/text for the animation'),
        duration: z.number().default(3).describe('Duration in seconds'),
        fps: z.number().default(30).describe('Frames per second'),
        width: z.number().default(1920).describe('Video width in pixels'),
        height: z.number().default(1080).describe('Video height in pixels'),
        backgroundColor: z.string().default('#000000').describe('Background color')
      })
    },
    async ({ type, title = 'Animation', duration = 3, fps = 30, width = 1920, height = 1080, backgroundColor = '#000000' }) => {
      try {
        log('info', 'Creating animation', { type, title, duration });

        // Ensure directories exist
        await fs.mkdir(EXPORTS_DIR, { recursive: true });
        await fs.mkdir(SRC_DIR, { recursive: true });

        // Generate animation component
        const componentName = `${type}-${Date.now()}`;
        const componentCode = generateAnimationComponent(type, title, backgroundColor);
        const componentPath = path.join(SRC_DIR, `${componentName}.tsx`);
        
        await fs.writeFile(componentPath, componentCode);
        log('info', `Created component file: ${componentPath}`);

        // Render video
        const outputPath = path.join(EXPORTS_DIR, `${componentName}.mp4`);
        await renderVideo(componentName, outputPath, { duration, fps, width, height });

        // CRITICAL FIX: Emoji-free response
        return {
          content: [
            {
              type: 'text',
              text: `[SUCCESS] Animation created successfully!\n\n` +
                    `[FILE] ${componentName}.mp4\n` +
                    `[TYPE] ${type}\n` +
                    `[DURATION] ${duration}s\n` +
                    `[RESOLUTION] ${width}x${height}\n` +
                    `[STUDIO] http://localhost:${STUDIO_PORT}\n\n` +
                    `Animation ready at http://localhost:${STUDIO_PORT}`
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
      inputSchema: z.object({})
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
      inputSchema: z.object({})
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

  // Guidelines file reader tool
  server.tool(
    'read_guidelines_file',
    {
      description: 'Read design guidelines and animation patterns from the claude-dev-guidelines folder',
      inputSchema: z.object({
        filename: z.string().describe('Guidelines file to read (e.g., "PROJECT_CONFIG.md", "ADVANCED/ANIMATION_PATTERNS.md")')
      })
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
      inputSchema: z.object({
        category: z.enum(['project-config', 'advanced-patterns', 'animation-rules', 'all']).optional()
          .describe('Category of guidelines to retrieve (defaults to all)')
      })
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

  return server;
}

// Animation component generators (preserved from original)
function generateAnimationComponent(type: string, title: string, backgroundColor: string): string {
  switch (type) {
    case 'bouncing-ball':
      return `
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const BouncingBall: React.FC = () => {
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

export default BouncingBall;
`;

    case 'sliding-text':
      return `
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const SlidingText: React.FC = () => {
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

export default SlidingText;
`;

    case 'rotating-object':
      return `
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const RotatingObject: React.FC = () => {
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

export default RotatingObject;
`;

    case 'fade-in-out':
      return `
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const FadeInOut: React.FC = () => {
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

export default FadeInOut;
`;

    default:
      throw new Error(`Unsupported animation type: ${type}`);
  }
}

// Video rendering function (preserved from original)
async function renderVideo(
  componentName: string,
  outputPath: string,
  options: { duration: number; fps: number; width: number; height: number }
): Promise<void> {
  const { duration, fps, width, height } = options;
  const durationInFrames = Math.floor(duration * fps);

  return new Promise((resolve, reject) => {
    log('info', 'Starting video render', { componentName, outputPath, options });
    
    const renderProcess = spawn('npx', [
      'remotion', 'render',
      componentName,
      outputPath,
      '--frames', durationInFrames.toString(),
      '--width', width.toString(),
      '--height', height.toString(),
      '--fps', fps.toString(),
      '--codec', 'h264',
      '--overwrite'
    ], {
      cwd: APP_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32' // Windows compatibility
    });

    let stdout = '';
    let stderr = '';

    renderProcess.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    renderProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    renderProcess.on('close', (code) => {
      if (code === 0) {
        log('info', 'Video render completed successfully', { outputPath });
        resolve();
      } else {
        log('error', 'Video render failed', { code, stdout, stderr });
        reject(new Error(`Render process failed with code ${code}: ${stderr}`));
      }
    });

    renderProcess.on('error', (error) => {
      log('error', 'Render process error', error);
      reject(error);
    });
  });
}

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
      
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
      });
      
      // Create and connect new MCP server instance with all tools
      const server = createMcpServer();
      await server.connect(transport);
      
      // Handle the initialize request first to generate session ID
      await transport.handleRequest(req, res, req.body);
      
      // Store complete session (server + transport) after handling request
      const newSessionId = transport.sessionId;
      if (newSessionId) {
        session = { server, transport };
        sessions[newSessionId] = session;
        log('info', `Created new session: ${newSessionId} with all registered tools`);
        return; // Request already handled
      } else {
        throw new Error('Failed to generate session ID');
      }
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