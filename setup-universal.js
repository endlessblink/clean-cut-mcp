#!/usr/bin/env node

/**
 * Clean-Cut-MCP Universal Setup Script
 * Automatically configures Claude Desktop for cross-platform compatibility
 * Called by npm postinstall hook and as standalone installer
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execSync } = require('child_process');

// ANSI colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m', 
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getClaudeConfigPath() {
  switch (process.platform) {
    case 'win32':
      return path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    default:
      return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
  }
}

async function checkDockerInstallation() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    log('green', '✅ Docker found');
    return true;
  } catch (error) {
    log('red', '❌ Docker not found or not running');
    log('yellow', '   Install Docker Desktop: https://docs.docker.com/desktop/');
    return false;
  }
}

async function buildDockerImage() {
  log('blue', '🔨 Building Docker image...');
  
  try {
    // Check if image already exists
    try {
      execSync('docker inspect clean-cut-mcp >/dev/null 2>&1', { stdio: 'ignore' });
      log('green', '✅ Docker image clean-cut-mcp already exists');
      return true;
    } catch {
      // Image doesn't exist, need to build
    }

    // Build the image
    const buildProcess = spawn('docker', ['build', '-t', 'clean-cut-mcp', '.'], {
      stdio: 'inherit',
      cwd: __dirname
    });

    return new Promise((resolve) => {
      buildProcess.on('close', (code) => {
        if (code === 0) {
          log('green', '✅ Docker image built successfully');
          resolve(true);
        } else {
          log('red', '❌ Docker build failed');
          log('yellow', '   Try running: docker build -t clean-cut-mcp .');
          resolve(false);
        }
      });

      buildProcess.on('error', (error) => {
        log('red', `❌ Docker build error: ${error.message}`);
        resolve(false);
      });
    });

  } catch (error) {
    log('red', `❌ Docker build failed: ${error.message}`);
    return false;
  }
}

async function configureClaudeDesktop() {
  const configPath = getClaudeConfigPath();
  const configDir = path.dirname(configPath);

  log('blue', '⚙️  Configuring Claude Desktop...');

  // Ensure config directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    log('green', `✅ Created config directory: ${configDir}`);
  }

  // Create backup if config exists
  if (fs.existsSync(configPath)) {
    const backupPath = `${configPath}.backup-${Date.now()}`;
    fs.copyFileSync(configPath, backupPath);
    log('green', `✅ Backed up existing config to: ${backupPath}`);
  }

  // Read existing config or create new one
  let config;
  try {
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(configContent);
    } else {
      config = {};
    }
  } catch (error) {
    log('yellow', '⚠️  Existing config invalid, creating new one');
    config = {};
  }

  // Ensure mcpServers object exists
  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  // Configure clean-cut-mcp server
  config.mcpServers['clean-cut-mcp'] = {
    command: process.platform === 'win32' ? 'powershell.exe' : 'sh',
    args: process.platform === 'win32' ? [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass', 
      '-Command',
      '& { $body = [System.Console]::In.ReadToEnd(); Invoke-RestMethod -Uri "http://localhost:6961/mcp" -Method POST -Body $body -ContentType "application/json" }'
    ] : [
      '-c',
      'curl -X POST -H "Content-Type: application/json" -d @- http://localhost:6961/mcp'
    ]
  };

  // Write config
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    log('green', '✅ Claude Desktop configured successfully');
    log('cyan', `   Config location: ${configPath}`);
    return true;
  } catch (error) {
    log('red', `❌ Failed to write config: ${error.message}`);
    return false;
  }
}

async function startContainer() {
  log('blue', '🚀 Starting Clean-Cut-MCP container...');

  try {
    // Stop and remove existing container
    try {
      execSync('docker stop clean-cut-mcp 2>/dev/null', { stdio: 'ignore' });
      execSync('docker rm clean-cut-mcp 2>/dev/null', { stdio: 'ignore' });
    } catch {
      // Container doesn't exist, that's fine
    }

    // Start new container
    const dockerArgs = [
      'run', '-d',
      '--name', 'clean-cut-mcp',
      '--restart', 'unless-stopped',
      '-p', '6960:6960',
      '-p', '6961:6961'
    ];

    // Add host mapping for universal compatibility
    if (process.platform === 'win32') {
      dockerArgs.push('--add-host', 'host.docker.internal:host-gateway');
    }

    dockerArgs.push('clean-cut-mcp');

    execSync(`docker ${dockerArgs.join(' ')}`, { stdio: 'ignore' });
    
    // Wait a moment for container to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check if container is running
    const containerStatus = execSync('docker ps --format "table {{.Names}}\\t{{.Status}}" | grep clean-cut-mcp', { encoding: 'utf8' }).trim();
    
    if (containerStatus.includes('Up')) {
      log('green', '✅ Container started successfully');
      log('cyan', '   MCP Server: http://localhost:6961/mcp');
      log('cyan', '   Remotion Studio: http://localhost:6960');
      return true;
    } else {
      log('red', '❌ Container failed to start');
      return false;
    }

  } catch (error) {
    log('red', `❌ Container startup failed: ${error.message}`);
    log('yellow', '   Try running: docker run -d --name clean-cut-mcp -p 6960:6960 -p 6961:6961 clean-cut-mcp');
    return false;
  }
}

async function validateInstallation() {
  log('blue', '🧪 Validating installation...');

  try {
    // Test MCP server health
    const { execSync } = require('child_process');
    
    // Wait for services to be ready
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    try {
      if (process.platform === 'win32') {
        execSync('powershell -Command "Invoke-RestMethod -Uri http://localhost:6961/health -TimeoutSec 5"', { stdio: 'ignore' });
      } else {
        execSync('curl -f http://localhost:6961/health', { stdio: 'ignore' });
      }
      log('green', '✅ MCP server health check passed');
    } catch {
      log('yellow', '⚠️  MCP server health check failed (may still be starting)');
    }

    try {
      if (process.platform === 'win32') {
        execSync('powershell -Command "Invoke-WebRequest -Uri http://localhost:6960 -TimeoutSec 5"', { stdio: 'ignore' });
      } else {
        execSync('curl -f http://localhost:6960', { stdio: 'ignore' });
      }
      log('green', '✅ Remotion Studio accessible');
    } catch {
      log('yellow', '⚠️  Remotion Studio not yet accessible (may still be starting)');
    }

    return true;

  } catch (error) {
    log('red', `❌ Validation failed: ${error.message}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isUninstall = args.includes('--uninstall');

  log('cyan', '🎬 Clean-Cut-MCP Universal Setup');
  log('cyan', '================================');

  if (isUninstall) {
    log('yellow', '🗑️  Uninstalling Clean-Cut-MCP...');
    
    // Stop and remove container
    try {
      execSync('docker stop clean-cut-mcp 2>/dev/null && docker rm clean-cut-mcp 2>/dev/null', { stdio: 'ignore' });
      log('green', '✅ Container removed');
    } catch {
      log('yellow', '⚠️  No container to remove');
    }

    // Remove Docker image
    try {
      execSync('docker rmi clean-cut-mcp 2>/dev/null', { stdio: 'ignore' });
      log('green', '✅ Docker image removed');
    } catch {
      log('yellow', '⚠️  No image to remove');
    }

    log('green', '✅ Uninstall completed');
    return;
  }

  // Standard installation
  let success = true;

  // Step 1: Check Docker
  if (!await checkDockerInstallation()) {
    success = false;
  }

  // Step 2: Build Docker image
  if (success && !await buildDockerImage()) {
    success = false;
  }

  // Step 3: Configure Claude Desktop
  if (success && !await configureClaudeDesktop()) {
    success = false;
  }

  // Step 4: Start container
  if (success && !await startContainer()) {
    success = false;
  }

  // Step 5: Validate installation
  if (success) {
    await validateInstallation();
  }

  // Final status
  if (success) {
    log('green', '\n🎉 Installation completed successfully!');
    log('cyan', '\n📋 Next steps:');
    log('cyan', '   1. Restart Claude Desktop');
    log('cyan', '   2. Ask Claude: "Create a bouncing ball animation"');
    log('cyan', '   3. Expect: "Animation ready at http://localhost:6960"');
    log('cyan', '\n🔗 Links:');
    log('cyan', '   • Remotion Studio: http://localhost:6960');
    log('cyan', '   • MCP Server: http://localhost:6961/health');
  } else {
    log('red', '\n❌ Installation failed');
    log('yellow', '\n🔧 Troubleshooting:');
    log('yellow', '   1. Ensure Docker Desktop is running');
    log('yellow', '   2. Try restarting your computer');
    log('yellow', '   3. Run: npm run setup-universal');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('yellow', '\n⚠️  Installation interrupted');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log('red', `\n💥 Fatal error: ${error.message}`);
  process.exit(1);
});

// Run the setup
main().catch((error) => {
  log('red', `💥 Setup failed: ${error.message}`);
  process.exit(1);
});