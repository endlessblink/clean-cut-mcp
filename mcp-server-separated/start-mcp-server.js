#!/usr/bin/env node

// MCP Server Container Entrypoint
// Starts only the MCP server with animation management capabilities

const {spawn} = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const http = require('http');

const WORKSPACE = process.env.WORKSPACE_DIR || '/workspace';
const MCP_PORT = process.env.MCP_SERVER_PORT || '6971';
const STUDIO_PORT = process.env.REMOTION_STUDIO_PORT || '6970';

async function ensureDir(p) {
  await fsp.mkdir(p, {recursive: true}).catch(() => {});
}

async function fileExists(p) {
  try { await fsp.access(p); return true; } catch { return false; }
}

async function ensureWorkspaceInitialized() {
  console.error('[MCP Server] Initializing workspace structure...');

  await ensureDir(WORKSPACE);
  const srcDir = path.join(WORKSPACE, 'src');
  const assetsDir = path.join(srcDir, 'assets', 'animations');

  // Ensure directory structure exists for MCP operations
  await ensureDir(srcDir);
  await ensureDir(path.join(srcDir, 'assets'));
  await ensureDir(assetsDir);
  await ensureDir(path.join(srcDir, 'components'));
  await ensureDir(path.join(srcDir, 'utils'));
  await ensureDir(path.join(srcDir, 'patterns'));
  await ensureDir(path.join(srcDir, 'validated-params'));

  console.error('[MCP Server] Workspace structure ready');
}

function startHealthCheckServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        status: 'healthy',
        service: 'mcp-server',
        timestamp: new Date().toISOString(),
        workspace: WORKSPACE,
        ports: {
          mcp: MCP_PORT,
          studio: STUDIO_PORT
        }
      }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(MCP_PORT, '0.0.0.0', () => {
    console.error(`[MCP Server] Health check server listening on port ${MCP_PORT}`);
  });

  return server;
}

function startMCPServer() {
  console.error('[MCP Server] Starting MCP STDIO server...');

  // The MCP server runs as STDIO (as expected by Claude Desktop)
  // We'll use the existing clean-stdio-server
  const mcpServer = spawn('node', [
    path.join(__dirname, '../mcp-server/dist/clean-stdio-server.js')
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      DOCKER_CONTAINER: 'true',
      CONTAINER_ROLE: 'mcp-server',
      WORKSPACE_DIR: WORKSPACE,
      REMOTION_STUDIO_PORT: STUDIO_PORT
    }
  });

  mcpServer.on('error', (error) => {
    console.error(`[MCP Server] Failed to start: ${error.message}`);
    process.exit(1);
  });

  mcpServer.on('exit', (code) => {
    console.error(`[MCP Server] Exited with code ${code}`);
    process.exit(code);
  });

  return mcpServer;
}

async function main() {
  console.error('[MCP Server] Clean-Cut-MCP Server Container Starting...');
  console.error(`[MCP Server] Workspace: ${WORKSPACE}`);
  console.error(`[MCP Server] MCP Port: ${MCP_PORT}`);
  console.error(`[MCP Server] Studio Port: ${STUDIO_PORT}`);

  try {
    // Initialize workspace structure
    await ensureWorkspaceInitialized();

    // Start health check server (for container health checks)
    const healthServer = startHealthCheckServer();

    // Start MCP server (STDIO interface for Claude Desktop)
    const mcpServer = startMCPServer();

    // Graceful shutdown handling
    const shutdown = () => {
      console.error('[MCP Server] Shutting down...');
      healthServer.close();
      mcpServer.kill('SIGTERM');
      setTimeout(() => {
        mcpServer.kill('SIGKILL');
        process.exit(0);
      }, 5000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    console.error('[MCP Server] All services started successfully');

  } catch (error) {
    console.error(`[MCP Server] Startup failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(`[MCP Server] Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Start the server
main();