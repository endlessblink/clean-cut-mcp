/**
 * Remotion Studio Manager with proper process lifecycle and PATH handling
 * Based on Perplexity research for cross-platform reliability
 */

import { spawn, ChildProcess } from 'child_process';
import { findExecutable, createInheritedEnvironment } from './executable-finder.js';

export interface StudioLaunchResult {
  success: boolean;
  port?: number;
  pid?: number;
  url?: string;
  error?: string;
  troubleshooting?: string[];
}

export class RemotionStudioManager {
  private activeProcesses = new Map<number, ChildProcess>();
  private defaultPort = 3000;
  
  constructor() {
    // Handle graceful shutdown
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
    process.on('exit', () => this.cleanup());
  }
  
  /**
   * Launch Remotion Studio with comprehensive error handling
   */
  async launchStudio(projectPath: string, port: number = this.defaultPort): Promise<StudioLaunchResult> {
    try {
      // Find npx executable
      const npxLocation = findExecutable('npx');
      
      // Check if port is available
      const isPortAvailable = await this.checkPort(port);
      if (!isPortAvailable) {
        return {
          success: false,
          error: `Port ${port} is already in use`,
          troubleshooting: [
            `Stop other applications using port ${port}`,
            `Try a different port: launch_remotion_studio --port=3001`,
            `On Windows: netstat -ano | findstr :${port}`,
            `On macOS/Linux: lsof -ti:${port} | xargs kill -9`
          ]
        };
      }
      
      // Windows spaces-in-path fix: Use cmd.exe wrapper for Windows paths with spaces
      // Evidence-based approach: MCP community-proven solution for "Program Files" installations
      const isWindowsWithSpaces = process.platform === 'win32' && npxLocation.fullPath.includes(' ');
      const isWindowsCmdFile = process.platform === 'win32' && (npxLocation.fullPath.endsWith('.cmd') || npxLocation.fullPath.endsWith('.bat'));
      
      let command: string;
      let args: string[];
      let useShell: boolean;
      
      if (isWindowsWithSpaces && isWindowsCmdFile) {
        // Evidence-based Solution: cmd.exe wrapper approach (production-tested)
        // This handles "C:\Program Files\nodejs\npx.cmd" correctly
        command = 'cmd.exe';
        args = ['/c', `"${npxLocation.fullPath}"`, 'remotion', 'studio', `--port=${port}`, '--host=0.0.0.0'];
        useShell = false;  // Don't use shell when we're explicitly calling cmd.exe
      } else {
        // Standard approach for .exe files or paths without spaces
        command = npxLocation.fullPath;
        args = ['remotion', 'studio', `--port=${port}`, '--host=0.0.0.0'];
        useShell = process.platform === 'win32';
      }

      const studio = spawn(command, args, {
        cwd: projectPath,
        env: createInheritedEnvironment({
          // Additional studio-specific environment
          REMOTION_STUDIO_PORT: port.toString(),
          NODE_ENV: 'development'
        }),
        stdio: ['ignore', 'pipe', 'pipe'],  // Capture stdout/stderr
        shell: useShell,  // CRITICAL: Use cmd.exe wrapper or shell based on Windows path detection
        detached: false  // Keep attached for proper cleanup
      });
      
      // Debug logging for Windows path issues
      if (process.platform === 'win32') {
        console.error(`[STUDIO-DEBUG] Command: ${command}`);
        console.error(`[STUDIO-DEBUG] Args: ${JSON.stringify(args)}`);
        console.error(`[STUDIO-DEBUG] Shell: ${useShell}`);
        console.error(`[STUDIO-DEBUG] IsWindowsWithSpaces: ${isWindowsWithSpaces}`);
        console.error(`[STUDIO-DEBUG] IsWindowsCmdFile: ${isWindowsCmdFile}`);
        console.error(`[STUDIO-DEBUG] Using cmd.exe wrapper: ${command === 'cmd.exe'}`);
      }
      
      // Store process for cleanup
      this.activeProcesses.set(studio.pid!, studio);
      
      const result = await this.waitForStudioReady(studio, port);
      
      if (result.success) {
        return {
          success: true,
          port,
          pid: studio.pid,
          url: `http://localhost:${port}`
        };
      } else {
        // Cleanup failed process
        this.cleanupProcess(studio.pid!);
        return result;
      }
      
    } catch (error) {
      return this.handleLaunchError(error, port);
    }
  }
  
  /**
   * Wait for studio to be ready with intelligent detection
   */
  private async waitForStudioReady(studio: ChildProcess, port: number): Promise<StudioLaunchResult> {
    return new Promise((resolve) => {
      let output = '';
      let errorOutput = '';
      let resolved = false;
      
      const cleanup = () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
      };
      
      studio.stdout?.on('data', (data) => {
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
      
      studio.stderr?.on('data', (data) => {
        errorOutput += data.toString();
        const errorStr = data.toString();
        
        // Log to stderr for debugging without breaking MCP protocol
        console.error(`Remotion Studio stderr: ${errorStr}`);
        
        // Check for specific error patterns
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
      
      studio.on('error', (error) => {
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
      
      studio.on('exit', (code, signal) => {
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
   * Check if a port is available
   */
  private async checkPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const net = require('net');
      const server = net.createServer();
      
      server.listen(port, () => {
        server.close(() => resolve(true));
      });
      
      server.on('error', () => {
        resolve(false);
      });
    });
  }
  
  /**
   * Handle launch errors with helpful messages
   */
  private handleLaunchError(error: any, port: number): StudioLaunchResult {
    if (error.code === 'ENOENT') {
      return {
        success: false,
        error: 'Node.js, npm, or npx not found',
        troubleshooting: [
          'Ensure Node.js is installed and added to your system PATH',
          'Restart your terminal or IDE after installing Node.js',
          'Visit https://nodejs.org for installation instructions',
          'Try running: node --version && npm --version && npx --version'
        ]
      };
    }
    
    if (error.message?.includes('spawn') && error.message?.includes('ENOENT')) {
      return {
        success: false,
        error: 'Unable to spawn Remotion Studio process',
        troubleshooting: [
          'PATH environment variable issue detected',
          'Restart Claude Desktop after installing Node.js',
          'Ensure npx is accessible from command line',
          'Try restarting your computer if recently installed Node.js'
        ]
      };
    }
    
    // Specific handling for Windows spaces-in-path issues
    if (error.message?.includes('not recognized') || error.message?.includes('Program')) {
      return {
        success: false,
        error: 'Windows path parsing error - likely spaces in Node.js installation path',
        troubleshooting: [
          'This error occurs when Node.js is installed in "C:\\Program Files\\nodejs\\"',
          'The Windows spawn() call is not properly handling spaces in the path',
          'Check the [STUDIO-DEBUG] output above for command details',
          'This should be fixed in the latest MCP server version - please report if still occurs'
        ]
      };
    }
    
    return {
      success: false,
      error: `Unexpected error: ${error.message}`,
      troubleshooting: [
        'Check the console output for more details',
        'Ensure Remotion project is properly set up',
        'Try manual installation: npm install && npx remotion studio',
        'Report this issue if problem persists'
      ]
    };
  }
  
  /**
   * Cleanup a specific process
   */
  private cleanupProcess(pid: number): void {
    const process = this.activeProcesses.get(pid);
    if (process) {
      try {
        // Graceful shutdown sequence
        process.kill('SIGTERM');
        
        // Force kill after 5 seconds if not terminated
        setTimeout(() => {
          if (!process.killed) {
            process.kill('SIGKILL');
          }
        }, 5000);
        
      } catch (error) {
        console.error(`Failed to cleanup process ${pid}:`, error);
      } finally {
        this.activeProcesses.delete(pid);
      }
    }
  }
  
  /**
   * Cleanup all active processes
   */
  async cleanup(): Promise<void> {
    const cleanupPromises = Array.from(this.activeProcesses.entries()).map(([pid, process]) => {
      return new Promise<void>((resolve) => {
        try {
          process.kill('SIGTERM');
          
          const timeout = setTimeout(() => {
            try {
              process.kill('SIGKILL');
            } catch (error) {
              // Process might already be dead
            }
            resolve();
          }, 5000);
          
          process.on('exit', () => {
            clearTimeout(timeout);
            resolve();
          });
          
        } catch (error) {
          resolve(); // Continue cleanup even if this process fails
        }
      });
    });
    
    await Promise.all(cleanupPromises);
    this.activeProcesses.clear();
  }
  
  /**
   * Get status of active studio processes
   */
  getActiveStudios(): Array<{ pid: number; port?: number }> {
    return Array.from(this.activeProcesses.keys()).map(pid => ({ pid }));
  }
}
