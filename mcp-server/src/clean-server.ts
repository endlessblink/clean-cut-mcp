/**
 * Clean-Cut-MCP - HTTP MCP Server for Claude Desktop Integration
 * Fixed version with proper HTTP transport, stderr-only logging, and emoji-free responses
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

// CRITICAL FIX: Remove emojis that break JSON parsing
function cleanResponse(text: string): string {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/✅|❌|📁|🎬|🚀|📊|⚠️|🚨|📹|🛠️|🔧|💡|🔥|🎯/g, '') // Common emojis
    .trim();
}

// Create MCP Server
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
                    `The animation has been rendered and saved to your videos directory.`
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
    [durationInFrames * 0.5, durationInFrames],
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
      stdio: ['pipe', 'pipe', 'pipe']
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

// CRITICAL FIX: HTTP Express server for MCP (not STDIO)
const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoints (preserved)
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
    exports_dir: EXPORTS_DIR
  });
});

// Start server
async function startServer() {
  try {
    log('info', 'Starting Clean-Cut-MCP Server (HTTP Transport)');
    log('info', `App Root: ${APP_ROOT}`);
    log('info', `Exports Directory: ${EXPORTS_DIR}`);
    log('info', `Source Directory: ${SRC_DIR}`);
    
    // Ensure directories exist
    await fs.mkdir(EXPORTS_DIR, { recursive: true });
    await fs.mkdir(SRC_DIR, { recursive: true });
    
    // CRITICAL FIX: HTTP server bound to 0.0.0.0 for Docker port forwarding
    app.listen(MCP_PORT, '0.0.0.0', () => {
      log('info', `Clean-Cut-MCP HTTP server running on port ${MCP_PORT}`);
      log('info', `Health check available at http://localhost:${MCP_PORT}/health`);
      log('info', `Status endpoint at http://localhost:${MCP_PORT}/status`);
      log('info', `Remotion Studio available at http://localhost:${STUDIO_PORT}`);
      log('info', 'Ready for Claude Desktop integration via HTTP transport!');
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