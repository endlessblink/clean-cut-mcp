#!/usr/bin/env node

// Simple test script to trigger MCP auto-sync
const { spawn } = require('child_process');

const mcpProcess = spawn('node', ['/app/mcp-server/dist/clean-stdio-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send auto-sync command
const command = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "auto_sync",
    arguments: { force: true }
  }
};

mcpProcess.stdin.write(JSON.stringify(command) + '\n');
mcpProcess.stdin.end();

let output = '';
mcpProcess.stdout.on('data', (data) => {
  output += data.toString();
});

mcpProcess.stderr.on('data', (data) => {
  console.error('MCP Log:', data.toString());
});

mcpProcess.on('close', (code) => {
  console.log('Auto-sync result:', output);
  console.log('Exit code:', code);
});

setTimeout(() => {
  mcpProcess.kill();
  console.log('Timeout - killing process');
}, 8000);