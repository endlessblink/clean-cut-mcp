/**
 * Cross-platform executable finder with robust PATH resolution
 * Based on Perplexity research: Fixes ENOENT and PATH inheritance issues
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export interface ExecutableLocation {
  command: string;
  fullPath: string;
  version?: string;
}

/**
 * Find executable with proper Node.js path resolution 
 * FIXES: NPX cache path issue - uses process.execPath instead of 'where' command
 */
export function findExecutable(command: string): ExecutableLocation {
  const isWindows = process.platform === 'win32';
  
  // EVIDENCE-BASED FIX: Use process.execPath for Node.js tools instead of 'where' command
  // This prevents resolving to npm cache directories
  if (command === 'node') {
    return {
      command: 'node',
      fullPath: process.execPath,
      version: process.version
    };
  }
  
  if (command === 'npm' || command === 'npx') {
    // Calculate npm/npx path relative to Node.js installation
    const nodeDir = path.dirname(process.execPath);
    const npmCommand = command + (isWindows ? '.cmd' : '');
    const npmPath = path.join(nodeDir, npmCommand);
    
    // Verify this path exists before returning
    if (fs.existsSync(npmPath)) {
      return {
        command,
        fullPath: npmPath,
        version: getVersion(npmPath, command)
      };
    }
    
    // Fallback: try npm installation directory
    if (isWindows) {
      const globalNpmPath = path.join(nodeDir, 'node_modules', 'npm', 'bin', `${command}-cli.js`);
      if (fs.existsSync(globalNpmPath)) {
        return {
          command,
          fullPath: npmPath, // Still return the .cmd wrapper
          version: getVersion(npmPath, command)
        };
      }
    }
  }
  
  // For other commands, try PATH resolution with fallback protection
  try {
    const findCommand = isWindows ? 'where' : 'which';
    const result = execSync(`${findCommand} ${command}`, { 
      encoding: 'utf8',
      env: process.env,
      timeout: 5000
    }).trim();
    
    // On Windows, 'where' returns all matches - filter out npm cache paths
    let fullPath = isWindows ? result.split('\n')[0] : result;
    
    // FILTER OUT NPM CACHE PATHS - this was the root cause
    if (isWindows && fullPath.includes('npm-cache')) {
      const alternatives = result.split('\n').filter(p => !p.includes('npm-cache'));
      if (alternatives.length > 0) {
        fullPath = alternatives[0];
      }
    }
    
    // Verify the path exists and is executable
    if (fs.existsSync(fullPath)) {
      return {
        command,
        fullPath,
        version: getVersion(fullPath, command)
      };
    }
  } catch (error) {
    // PATH resolution failed, try common installation directories
    console.error(`PATH lookup failed for ${command}, trying fallback paths...`);
  }
  
  // Fallback to common installation paths
  const commonPaths = getCommonPaths(command);
  
  for (const candidatePath of commonPaths) {
    if (fs.existsSync(candidatePath)) {
      try {
        // Test if executable works
        const version = getVersion(candidatePath, command);
        return {
          command,
          fullPath: candidatePath,
          version
        };
      } catch (error) {
        // This path exists but doesn't work, continue
        continue;
      }
    }
  }
  
  throw new Error(`${command} not found in PATH or common installation locations. Please ensure ${command} is installed and accessible.`);
}


function getCommonPaths(command: string): string[] {
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  
  if (isWindows) {
    const extensions = ['.exe', '.cmd', '.bat'];
    const basePaths = [
      'C:\\Program Files\\nodejs\\',
      'C:\\nodejs\\',
      'C:\\Users\\' + os.userInfo().username + '\\AppData\\Roaming\\npm\\',
      process.env.APPDATA + '\\npm\\',
      process.env.LOCALAPPDATA + '\\npm\\'
    ].filter(Boolean);
    
    return basePaths.flatMap(basePath => 
      extensions.map(ext => path.join(basePath, command + ext))
    );
  } else {
    // macOS and Linux
    const basePaths = [
      '/usr/local/bin/',
      '/usr/bin/',
      '/bin/',
      '/opt/homebrew/bin/',  // macOS Homebrew on Apple Silicon
      '/home/linuxbrew/.linuxbrew/bin/',  // Linux Homebrew
      process.env.HOME + '/.local/bin/',
      process.env.HOME + '/bin/',
      ...(isMac ? ['/usr/local/bin/', '/opt/local/bin/'] : [])
    ].filter(Boolean);
    
    return basePaths.map(basePath => path.join(basePath, command));
  }
}

function getVersion(executablePath: string, command: string): string | undefined {
  try {
    // Use quoted paths to handle spaces in Windows Program Files
    const result = execSync(`"${executablePath}" --version`, {
      encoding: 'utf8',
      timeout: 3000,
      env: process.env
    }).trim();
    
    return result;
  } catch (error) {
    // Some executables might not support --version
    return undefined;
  }
}

/**
 * Create environment with proper PATH inheritance
 */
export function createInheritedEnvironment(additionalEnv: Record<string, string> = {}): Record<string, string> {
  return {
    ...process.env,  // Inherit all environment variables - CRITICAL for PATH
    npm_config_loglevel: 'error',  // Suppress npm noise
    npm_config_progress: 'false',  // Disable progress bars
    CI: 'true',  // Suppress interactive prompts
    ...additionalEnv
  };
}

/**
 * Windows-compatible spawn wrapper that handles spaces-in-path issues
 * EVIDENCE-BASED: Uses cmd.exe wrapper for Windows paths with spaces
 */
export function createWindowsCompatibleSpawn(executablePath: string, args: string[]): {
  command: string;
  args: string[];
  useShell: boolean;
  windowsVerbatimArguments: boolean;
} {
  const isWindows = process.platform === 'win32';
  const isWindowsWithSpaces = isWindows && executablePath.includes(' ');
  const isWindowsCmdFile = isWindows && (executablePath.endsWith('.cmd') || executablePath.endsWith('.bat'));
  
  if (isWindowsWithSpaces && isWindowsCmdFile) {
    // Evidence-based Solution: cmd.exe wrapper approach for Windows spaces-in-path
    return {
      command: 'cmd.exe',
      args: ['/c', `"${executablePath}"`, ...args],
      useShell: false,  // Don't use shell when we're explicitly calling cmd.exe
      windowsVerbatimArguments: true  // Critical for handling quoted paths with spaces
    };
  } else {
    // Standard approach for .exe files or paths without spaces
    return {
      command: executablePath,
      args: args,
      useShell: isWindows,
      windowsVerbatimArguments: isWindows  // Enable for all Windows spawn calls
    };
  }
}

/**
 * Validate that all required executables are available
 */
export function validateEnvironment(): { valid: boolean; missing: string[]; found: ExecutableLocation[] } {
  const requiredExecutables = ['node', 'npm', 'npx'];
  const found: ExecutableLocation[] = [];
  const missing: string[] = [];
  
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
