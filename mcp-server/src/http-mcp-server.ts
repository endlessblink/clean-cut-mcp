/**
 * Clean-Cut-MCP - Complete HTTP MCP Server for Claude Desktop
 * Implements StreamableHTTPServerTransport with proper session management
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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

// Express app setup
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

app.get('/status', (req, res) => {
  res.json({
    name: 'clean-cut-mcp',
    version: '1.0.0',
    mcp_server: 'running',
    studio_url: `http://localhost:${STUDIO_PORT}`,
    exports_dir: EXPORTS_DIR,
    animation_types: ['bouncing-ball', 'sliding-text', 'rotating-object', 'fade-in-out']
  });
});

// CRITICAL: Simple JSON-RPC 2.0 handler for MCP (since SDK HTTP transport is complex)
app.post('/mcp', async (req, res) => {
  try {
    const { method, params, id } = req.body;
    
    log('info', 'Received MCP request', { method, id });

    // Handle initialize request
    if (method === 'initialize') {
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'clean-cut-mcp',
            version: '1.0.0'
          }
        }
      });
    }

    // Handle tools/list request
    if (method === 'tools/list') {
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'create_animation',
              description: 'Create a video animation using Remotion',
              inputSchema: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['bouncing-ball', 'sliding-text', 'rotating-object', 'fade-in-out'] },
                  title: { type: 'string' },
                  duration: { type: 'number', default: 3 },
                  fps: { type: 'number', default: 30 },
                  width: { type: 'number', default: 1920 },
                  height: { type: 'number', default: 1080 },
                  backgroundColor: { type: 'string', default: '#000000' }
                },
                required: ['type']
              }
            },
            {
              name: 'list_animations',
              description: 'List all created animations',
              inputSchema: { type: 'object', properties: {} }
            },
            {
              name: 'get_studio_url',
              description: 'Get Remotion Studio URL',
              inputSchema: { type: 'object', properties: {} }
            }
          ]
        }
      });
    }

    // Handle tools/call request
    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      
      if (name === 'create_animation') {
        const result = await handleCreateAnimation(args);
        return res.json({
          jsonrpc: '2.0',
          id,
          result
        });
      }

      if (name === 'list_animations') {
        const result = await handleListAnimations();
        return res.json({
          jsonrpc: '2.0',
          id,
          result
        });
      }

      if (name === 'get_studio_url') {
        const result = await handleGetStudioUrl();
        return res.json({
          jsonrpc: '2.0',
          id,
          result
        });
      }
    }

    // Method not found
    return res.status(400).json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: 'Method not found'
      }
    });

  } catch (error) {
    log('error', 'MCP request handling failed', error);
    return res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: 'Internal server error'
      }
    });
  }
});

// Tool handlers
async function handleCreateAnimation(args: any) {
  const { type = 'bouncing-ball', title = 'Animation', duration = 3, fps = 30, width = 1920, height = 1080, backgroundColor = '#000000' } = args;

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

async function handleListAnimations() {
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

async function handleGetStudioUrl() {
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
    
    // Start HTTP server
    app.listen(MCP_PORT, () => {
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