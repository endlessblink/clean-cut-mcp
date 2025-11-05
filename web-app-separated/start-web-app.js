#!/usr/bin/env node

// Web App Container Entrypoint
// Starts only Remotion Studio for visual interface

const {spawn} = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const http = require('http');

const WORKSPACE = process.env.WORKSPACE_DIR || '/workspace';
const STUDIO_PORT = process.env.REMOTION_STUDIO_PORT || '6970';

async function ensureDir(p) {
  await fsp.mkdir(p, {recursive: true}).catch(() => {});
}

async function fileExists(p) {
  try { await fsp.access(p); return true; } catch { return false; }
}

async function ensureWorkspaceStructure() {
  console.error('[Web App] Ensuring workspace structure exists...');

  await ensureDir(WORKSPACE);
  const srcDir = path.join(WORKSPACE, 'src');
  const outDir = path.join(WORKSPACE, 'out');

  // Ensure basic structure exists
  await ensureDir(srcDir);
  await ensureDir(outDir);

  // Check if package.json exists
  const pkgJsonPath = path.join(WORKSPACE, 'package.json');
  if (!await fileExists(pkgJsonPath)) {
    console.error('[Web App] Warning: package.json not found, Remotion may not work properly');
  }

  // Check if Root.tsx exists or can be created
  const rootTsx = path.join(srcDir, 'Root.tsx');
  if (!await fileExists(rootTsx)) {
    console.error('[Web App] Root.tsx not found, creating minimal Root.tsx');
    const minimalRoot = `import {Composition} from 'remotion';
import React from 'react';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="Empty"
				component={Empty}
				durationInFrames={30}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};

const Empty: React.FC = () => {
	return <div style={{width: '100%', height: '100%', backgroundColor: '#000'}} />;
};
`;
    await fsp.writeFile(rootTsx, minimalRoot);
  }

  console.error('[Web App] Workspace structure ready');
}

function startHealthCheckServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        status: 'healthy',
        service: 'web-app',
        timestamp: new Date().toISOString(),
        workspace: WORKSPACE,
        studio_port: STUDIO_PORT
      }));
    } else if (req.url === '/') {
      // Simple redirect to Remotion Studio health check
      res.writeHead(302, {'Location': `http://localhost:${STUDIO_PORT}/`});
      res.end();
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  // We won't actually start this server since Remotion Studio will use the main port
  // But we keep the function for potential health check endpoints
  return server;
}

function startRemotionStudio() {
  console.error('[Web App] Starting Remotion Studio...');

  const studioArgs = [
    'studio',
    '--port', STUDIO_PORT,
    '--bind-host', '0.0.0.0',
    WORKSPACE
  ];

  console.error(`[Web App] Command: npx remotion ${studioArgs.join(' ')}`);

  const studioProcess = spawn('npx', studioArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      DOCKER_CONTAINER: 'true',
      CONTAINER_ROLE: 'web-app',
      REMOTION_STUDIO_PORT: STUDIO_PORT,
      REMOTION_OUTPUT_DIR: path.join(WORKSPACE, 'out'),
      REMOTION_NON_INTERACTIVE: '1'
    }
  });

  studioProcess.on('error', (error) => {
    console.error(`[Web App] Failed to start Remotion Studio: ${error.message}`);
    process.exit(1);
  });

  studioProcess.on('exit', (code) => {
    console.error(`[Web App] Remotion Studio exited with code ${code}`);
    process.exit(code);
  });

  return studioProcess;
}

async function waitForMCPConnection() {
  console.error('[Web App] Checking MCP server availability...');

  const maxAttempts = 30;
  const delay = 2000; // 2 seconds

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const http = require('http');
      await new Promise((resolve, reject) => {
        const req = http.get(`http://mcp-server:6971/health`, (res) => {
          if (res.statusCode === 200) {
            console.error('[Web App] MCP server is available');
            resolve();
          } else {
            reject(new Error(`MCP server returned ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.setTimeout(5000, () => reject(new Error('Timeout')));
      });
      return; // Success, exit function
    } catch (error) {
      if (i === maxAttempts - 1) {
        console.error('[Web App] Warning: Could not connect to MCP server, continuing anyway');
        break;
      }
      console.error(`[Web App] MCP server not ready (attempt ${i + 1}/${maxAttempts}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function main() {
  console.error('[Web App] Clean-Cut-MCP Web App Container Starting...');
  console.error(`[Web App] Workspace: ${WORKSPACE}`);
  console.error(`[Web App] Studio Port: ${STUDIO_PORT}`);

  try {
    // Ensure workspace structure
    await ensureWorkspaceStructure();

    // Wait for MCP server to be ready (if running in separated mode)
    if (process.env.CONTAINER_ROLE === 'web-app') {
      await waitForMCPConnection();
    }

    // Start Remotion Studio
    const studioProcess = startRemotionStudio();

    // Graceful shutdown handling
    const shutdown = () => {
      console.error('[Web App] Shutting down...');
      studioProcess.kill('SIGTERM');
      setTimeout(() => {
        studioProcess.kill('SIGKILL');
        process.exit(0);
      }, 5000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    console.error('[Web App] Remotion Studio started successfully');

  } catch (error) {
    console.error(`[Web App] Startup failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(`[Web App] Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Start the web app
main();