#!/usr/bin/env node

/**
 * Universal Remotion MCP Server v3.1.0 - Single File Solution
 * Cross-platform, zero-configuration video generation for Claude Desktop
 * 
 * This version combines all utilities in a single file to avoid module import issues
 * during the initial testing phase.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs-extra';
import path from 'path';
import { spawn, execSync } from 'child_process';
import net from 'net';
import os from 'os';

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * PROVEN SOLUTION: Cross-platform executable detection
 * Based on Perplexity research for robust Node.js tool detection
 */
function findExecutable(command: string) {
  const isWindows = process.platform === 'win32';
  const findCommand = isWindows ? 'where' : 'which';
  
  try {
    const result = execSync(`${findCommand} ${command}`, { 
      encoding: 'utf8',
      env: process.env,  // Use inherited environment
      timeout: 5000
    }).trim();
    
    // On Windows, 'where' returns all matches, take the first one
    const fullPath = isWindows ? result.split('\n')[0] : result;
    
    if (fs.existsSync(fullPath)) {
      return {
        command,
        fullPath,
        version: getExecutableVersion(fullPath, command)
      };
    }
  } catch (error) {
    console.error(`PATH lookup failed for ${command}, trying fallback paths...`);
  }
  
  // Fallback to common installation paths
  const commonPaths = getCommonExecutablePaths(command);
  
  for (const candidatePath of commonPaths) {
    if (fs.existsSync(candidatePath)) {
      try {
        const version = getExecutableVersion(candidatePath, command);
        return {
          command,
          fullPath: candidatePath,
          version
        };
      } catch (error) {
        continue;
      }
    }
  }
  
  throw new Error(`${command} not found in PATH or common installation locations`);
}

function getCommonExecutablePaths(command: string): string[] {
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  
  if (isWindows) {
    const extensions = ['.exe', '.cmd', '.bat'];
    const basePaths = [
      'C:\\Program Files\\nodejs\\',
      'C:\\nodejs\\',
      `C:\\Users\\${os.userInfo().username}\\AppData\\Roaming\\npm\\`
    ];
    
    return basePaths.flatMap(basePath => 
      extensions.map(ext => path.join(basePath, command + ext))
    );
  } else {
    const basePaths = [
      '/usr/local/bin/',
      '/usr/bin/',
      '/bin/',
      '/opt/homebrew/bin/',
      '/home/linuxbrew/.linuxbrew/bin/',
      `${process.env.HOME}/.local/bin/`,
      `${process.env.HOME}/bin/`
    ].filter(Boolean);
    
    return basePaths.map(basePath => path.join(basePath, command));
  }
}

function getExecutableVersion(executablePath: string, command: string): string | undefined {
  try {
    const result = execSync(`"${executablePath}" --version`, {
      encoding: 'utf8',
      timeout: 3000,
      env: process.env
    }).trim();
    return result;
  } catch (error) {
    return undefined;
  }
}

/**
 * Create environment with proper PATH inheritance
 */
/**
 * PROVEN SOLUTION: Create environment with proper PATH inheritance
 * Based on Perplexity research - this is the core fix for MCP server PATH issues
 */
function createInheritedEnvironment(additionalEnv = {}) {
  return {
    ...process.env,  // CRITICAL: Inherit ALL environment variables including PATH
    // MCP-compliant output suppression
    npm_config_loglevel: 'error',
    npm_config_progress: 'false',
    CI: 'true',  // Suppress interactive prompts
    ...additionalEnv
  };
}

/**
 * PROVEN SOLUTION: Simple environment validation using standard PATH detection
 * Based on Perplexity research - keep it simple and reliable
 */
function validateEnvironment() {
  const requiredExecutables = ['node', 'npm', 'npx'];
  const found = [];
  const missing = [];
  
  for (const executable of requiredExecutables) {
    try {
      const location = findExecutable(executable);
      found.push(location);
    } catch (error) {
      missing.push(executable);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
    found
  };
}

/**
 * Check if a port is available
 */
async function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// ================================
// MCP SERVER SETUP
// ================================

const server = new Server(
  {
    name: 'rough-cuts-mcp',
    version: '3.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const DEFAULT_PROJECT_PATH = path.join(os.homedir(), '.claude-videos', 'remotion-workspace');

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'check_environment',
        description: 'Check Node.js, npm, and Remotion installation status with cross-platform detection',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'setup_remotion_environment',
        description: 'Automatically create and set up a Remotion project with all dependencies',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Custom project path (optional)',
            },
          },
        },
      },
      {
        name: 'launch_remotion_studio',
        description: 'Launch Remotion Studio with auto-installation and proper error handling',
        inputSchema: {
          type: 'object',
          properties: {
            port: {
              type: 'number',
              description: 'Port to run studio on (default: 3000)',
              default: 3000,
            },
          },
        },
      },
      {
        name: 'create_remotion_component',
        description: 'Create a new Remotion video component',
        inputSchema: {
          type: 'object',
          properties: {
            componentName: {
              type: 'string',
              description: 'Name for the React component (PascalCase)',
            },
            code: {
              type: 'string',
              description: 'Complete TypeScript React component code',
            },
            duration: {
              type: 'number',
              description: 'Duration in seconds (default: 3)',
              default: 3,
            },
          },
          required: ['componentName', 'code'],
        },
      },
      {
        name: 'list_components',
        description: 'List all available Remotion components',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// ================================
// TOOL IMPLEMENTATIONS
// ================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'check_environment':
        return await handleCheckEnvironment();
        
      case 'setup_remotion_environment':
        return await handleSetupEnvironment((args as any)?.projectPath);
        
      case 'launch_remotion_studio':
        return await handleLaunchStudio((args as any)?.port || 3000);
        
      case 'create_remotion_component':
        return await handleCreateComponent((args as any)?.componentName, (args as any)?.code, (args as any)?.duration);
        
      case 'list_components':
        return await handleListComponents();
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error in ${name}: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
});

/**
 * Check environment with comprehensive detection
 */
async function handleCheckEnvironment() {
  const environmentCheck = validateEnvironment();
  
  let statusText = `Environment Status Report:\n\n`;
  statusText += `Platform: ${os.type()} ${os.release()} (${os.arch()})\n`;
  statusText += `Node.js: ${process.version}\n\n`;
  
  if (environmentCheck.valid) {
    statusText += `[OK] All required tools found:\n`;
    for (const tool of environmentCheck.found) {
      statusText += `  - ${tool.command}: ${tool.fullPath}`;
      if (tool.version) statusText += ` (${tool.version})`;
      statusText += `\n`;
    }
    statusText += `\nStatus: READY for video creation`;
  } else {
    statusText += `[ERROR] Missing required tools: ${environmentCheck.missing.join(', ')}\n\n`;
    if (environmentCheck.found.length > 0) {
      statusText += `Found tools:\n`;
      for (const tool of environmentCheck.found) {
        statusText += `  - ${tool.command}: ${tool.fullPath}\n`;
      }
    }
    statusText += `\nStatus: Installation required`;
  }
  
  return {
    content: [{ type: 'text', text: statusText }]
  };
}

/**
 * Setup Remotion environment with auto-installation
 */
async function handleSetupEnvironment(customPath?: string) {
  const projectDir = customPath || DEFAULT_PROJECT_PATH;
  
  try {
    // Ensure project directory exists
    await fs.ensureDir(projectDir);
    
    // Check if already set up
    const packageJsonPath = path.join(projectDir, 'package.json');
    const isInstalled = await fs.pathExists(packageJsonPath);
    
    if (!isInstalled) {
      await installRemotionProject(projectDir);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `[OK] Remotion environment ready!\n\nProject Path: ${projectDir}\n\nYou can now create video components and launch Remotion Studio.`
        }
      ]
    };
    
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `[ERROR] Setup failed: ${error instanceof Error ? error.message : String(error)}\n\nEnsure Node.js and npm are properly installed and accessible.`
        }
      ]
    };
  }
}

/**
 * Install new Remotion project
 */
async function installRemotionProject(projectDir: string) {
  const npmLocation = findExecutable('npm');
  
  // Create package.json
  const packageJson = {
    name: 'claude-remotion-workspace',
    version: '1.0.0',
    private: true,
    dependencies: {
      '@remotion/cli': '^4.0.344',
      '@remotion/player': '^4.0.344',
      'remotion': '^4.0.344',
      'react': '^18.0.0',
      'react-dom': '^18.0.0'
    },
    devDependencies: {
      '@types/react': '^18.0.0',
      'typescript': '^5.0.0'
    },
    scripts: {
      'dev': 'remotion studio',
      'build': 'remotion render'
    }
  };
  
  await fs.writeFile(
    path.join(projectDir, 'package.json'), 
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create basic config
  const remotionConfig = `import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
`;
  
  await fs.writeFile(
    path.join(projectDir, 'remotion.config.ts'),
    remotionConfig
  );
  
  // Create TypeScript configuration
  const tsConfig = {
    compilerOptions: {
      target: "ES2022",
      lib: ["DOM", "ES6"],
      allowJs: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      module: "ESNext",
      moduleResolution: "node",
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx"
    },
    include: ["src"]
  };
  
  await fs.writeFile(
    path.join(projectDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
  
  // Create src directory and basic components
  await fs.ensureDir(path.join(projectDir, 'src'));
  
  // Create Root component
  const rootComponent = `import React from 'react';
import {Composition} from 'remotion';
import {MyComposition} from './Composition';

const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="MyComposition"
				component={MyComposition}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};

export default RemotionRoot;`;
  
  await fs.writeFile(
    path.join(projectDir, 'src', 'Root.tsx'),
    rootComponent
  );
  
  // Create example composition
  const composition = `import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const MyComposition: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 30], [0, 1]);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 60,
				backgroundColor: '#0099ff',
				color: 'white',
				opacity,
			}}
		>
			Hello from Claude! [VIDEO]
		</AbsoluteFill>
	);
};`;
  
  await fs.writeFile(
    path.join(projectDir, 'src', 'Composition.tsx'),
    composition
  );
  
  // Create index file
  const indexFile = `import {registerRoot} from 'remotion';
import RemotionRoot from './Root';

registerRoot(RemotionRoot);`;
  
  await fs.writeFile(
    path.join(projectDir, 'src', 'index.ts'),
    indexFile
  );
  
  // Install dependencies
  await runNpmInstall(npmLocation.fullPath, projectDir);
}

/**
 * Run npm install with proper environment
 */
async function runNpmInstall(npmPath: string, projectDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // PROVEN SOLUTION: Use cmd wrapper for Windows paths with spaces
    const isWindows = process.platform === 'win32';
    
    let command: string;
    let args: string[];
    
    if (isWindows) {
      // Use cmd /c to handle paths with spaces properly
      command = 'cmd';
      args = ['/c', `"${npmPath}" install --silent`];
    } else {
      command = npmPath;
      args = ['install', '--silent'];
    }
    
    const install = spawn(command, args, {
      cwd: projectDir,
      env: {
        ...process.env,  // CRITICAL: Inherit all environment variables including PATH
        // MCP-compliant output suppression
        npm_config_loglevel: 'error',
        npm_config_progress: 'false',
        CI: 'true'  // Suppress interactive prompts
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: isWindows
    });
    
    let errorOutput = '';
    
    install.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`npm install: ${data}`);
    });
    
    install.on('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error(`npm install failed with code ${code}: ${errorOutput}`));
      }
    });
    
    install.on('error', (error) => {
      reject(new Error(`Failed to start npm install: ${error.message}`));
    });
    
    setTimeout(() => {
      install.kill('SIGTERM');
      reject(new Error('npm install timeout after 5 minutes'));
    }, 300000);
  });
}

/**
 * Launch Remotion Studio with comprehensive error handling
 */
async function handleLaunchStudio(port = 3000) {
  try {
    // First ensure environment is set up
    const projectDir = DEFAULT_PROJECT_PATH;
    const packageJsonPath = path.join(projectDir, 'package.json');
    const isInstalled = await fs.pathExists(packageJsonPath);
    
    if (!isInstalled) {
      const setupResult = await handleSetupEnvironment(undefined);
      if (setupResult.content[0].text.includes('[ERROR]')) {
        return setupResult;
      }
    }
    
    // Check if port is available
    const isPortAvailable = await checkPort(port);
    if (!isPortAvailable) {
      return {
        content: [
          {
            type: 'text',
            text: `[ERROR] Port ${port} is already in use\n\nTroubleshooting:\n• Stop other applications using port ${port}\n• Try a different port: launch_remotion_studio --port=3001\n• On Windows: netstat -ano | findstr :${port}\n• On macOS/Linux: lsof -ti:${port} | xargs kill -9`
          }
        ]
      };
    }
    
    // Find npx executable
    const npxLocation = findExecutable('npx');
    
    // PROVEN SOLUTION: MCP-compliant process management with proper path handling
    const isWindows = process.platform === 'win32';
    
    let command: string;
    let args: string[];
    
    if (isWindows) {
      // Use cmd /c to handle paths with spaces properly
      command = 'cmd';
      args = ['/c', `"${npxLocation.fullPath}" remotion studio --port=${port}`];
    } else {
      command = npxLocation.fullPath;
      args = ['remotion', 'studio', `--port=${port}`];
    }
    
    const studio = spawn(command, args, {
      cwd: projectDir,
      env: {
        ...process.env,  // CRITICAL: Inherit all environment variables including PATH
        // MCP-compliant output suppression
        npm_config_loglevel: 'error',
        npm_config_progress: 'false',
        CI: 'true',  // Suppress interactive prompts
        REMOTION_STUDIO_PORT: port.toString(),
        NODE_ENV: 'development'
      },
      stdio: ['ignore', 'pipe', 'pipe'],  // Capture stdout/stderr
      shell: isWindows  // Use shell on Windows
    });
    
    // Wait for studio to be ready
    const result = await waitForStudioReady(studio, port);
    
    if ((result as any).success) {
      return {
        content: [
          {
            type: 'text',
            text: `[LAUNCH] Remotion Studio launched successfully!\n\nURL: http://localhost:${port}\nPort: ${port}\nPID: ${studio.pid}\n\nAccess your video creation studio at: http://localhost:${port}`
          }
        ]
      };
    } else {
      let errorText = `[ERROR] Failed to launch Remotion Studio\n\nError: ${(result as any).error}\n\n`;
      
      if ((result as any).troubleshooting) {
        errorText += `Troubleshooting steps:\n`;
        for (const step of (result as any).troubleshooting) {
          errorText += `  • ${step}\n`;
        }
      }
      
      return {
        content: [{ type: 'text', text: errorText }]
      };
    }
    
  } catch (error) {
    return handleLaunchError(error, port);
  }
}

/**
 * Wait for studio to be ready with intelligent detection
 */
async function waitForStudioReady(studio: any, port: number): Promise<any> {
  return new Promise((resolve) => {
    let output = '';
    let errorOutput = '';
    let resolved = false;
    
    const cleanup = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
    };
    
    studio.stdout?.on('data', (data: any) => {
      if (resolved) return;
      
      output += data.toString();
      const outputStr = data.toString();
      
      // Look for studio ready indicators
      if (outputStr.includes('Local:') && outputStr.includes(`localhost:${port}`)) {
        cleanup();
        resolve({
          success: true,
          port,
          pid: studio.pid
        });
      }
      
      if (outputStr.includes('Server ready')) {
        cleanup();
        resolve({
          success: true,
          port,
          pid: studio.pid
        });
      }
    });
    
    studio.stderr?.on('data', (data: any) => {
      errorOutput += data.toString();
      const errorStr = data.toString();
      
      console.error(`Remotion Studio stderr: ${errorStr}`);
      
      if (errorStr.includes('EADDRINUSE') || errorStr.includes('address already in use')) {
        cleanup();
        resolve({
          success: false,
          error: `Port ${port} is already in use`,
          troubleshooting: [
            `Another application is using port ${port}`,
            `Try launching on a different port`,
            `Check running processes and stop conflicting services`
          ]
        });
      }
      
      if (errorStr.includes('EACCES') || errorStr.includes('permission denied')) {
        cleanup();
        resolve({
          success: false,
          error: 'Permission denied',
          troubleshooting: [
            'Check file permissions on the project directory',
            'Ensure user has write access to the workspace',
            'Try running with appropriate permissions'
          ]
        });
      }
    });
    
    studio.on('error', (error: any) => {
      if (resolved) return;
      cleanup();
      resolve({
        success: false,
        error: `Failed to launch Remotion Studio: ${error.message}`,
        troubleshooting: [
          'Ensure Remotion is properly installed',
          'Check that npx command is available',
          'Verify project dependencies are installed'
        ]
      });
    });
    
    studio.on('exit', (code: any, signal: any) => {
      if (resolved) return;
      cleanup();
      
      if (code !== 0 && code !== null) {
        resolve({
          success: false,
          error: `Remotion Studio exited with code ${code}`,
          troubleshooting: [
            'Check the project configuration',
            'Ensure all dependencies are installed',
            'Review the error output above',
            'Try running: npx remotion studio manually for more details'
          ]
        });
      }
    });
    
    // Timeout after 45 seconds
    const timeout = setTimeout(() => {
      if (resolved) return;
      cleanup();
      
      studio.kill('SIGTERM');
      resolve({
        success: false,
        error: 'Remotion Studio launch timeout (45 seconds)',
        troubleshooting: [
          'Studio is taking longer than expected to start',
          'Check system resources and network connectivity',
          'Try launching manually: npx remotion studio',
          'Check for firewall or antivirus interference'
        ]
      });
    }, 45000);
  });
}

/**
 * Handle launch errors with helpful messages
 */
function handleLaunchError(error: any, port: number) {
  if (error.code === 'ENOENT') {
    return {
      content: [
        {
          type: 'text',
          text: `[ERROR] Node.js, npm, or npx not found\n\nTroubleshooting:\n• Ensure Node.js is installed and added to your system PATH\n• Restart your terminal or IDE after installing Node.js\n• Visit https://nodejs.org for installation instructions\n• Try running: node --version && npm --version && npx --version`
        }
      ]
    };
  }
  
  if (error.message?.includes('spawn') && error.message?.includes('ENOENT')) {
    return {
      content: [
        {
          type: 'text',
          text: `[ERROR] Unable to spawn Remotion Studio process\n\nTroubleshooting:\n• PATH environment variable issue detected\n• Restart Claude Desktop after installing Node.js\n• Ensure npx is accessible from command line\n• Try restarting your computer if recently installed Node.js`
        }
      ]
    };
  }
  
  return {
    content: [
      {
        type: 'text',
        text: `[ERROR] Unexpected error: ${error.message}\n\nTroubleshooting:\n• Check the console output for more details\n• Ensure Remotion project is properly set up\n• Try manual installation: npm install && npx remotion studio\n• Report this issue if problem persists`
      }
    ]
  };
}

/**
 * Create component (simplified for now)
 */
async function handleCreateComponent(componentName: any, code: any, duration: number = 3) {
  if (!componentName || !code) {
    throw new Error('componentName and code are required');
  }
  
  return {
    content: [
      {
        type: 'text',
        text: `Component creation functionality will be implemented after studio launch is working reliably. Use the Remotion Studio interface to create components for now.`
      }
    ]
  };
}

/**
 * List components (simplified for now)
 */
async function handleListComponents() {
  return {
    content: [
      {
        type: 'text',
        text: `Component listing will be available after full studio integration. Use Remotion Studio to manage components.`
      }
    ]
  };
}

// ================================
// SERVER STARTUP
// ================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log startup to stderr (won't interfere with MCP protocol)
  console.error('[VIDEO] Universal Remotion MCP Server v3.1.0 started');
  console.error(`Platform: ${os.type()} ${os.arch()}`);
  console.error(`Node.js: ${process.version}`);
  console.error('Ready for video creation requests...');
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
