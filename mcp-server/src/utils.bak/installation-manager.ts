/**
 * Universal Remotion Installation Manager
 * Handles cross-platform auto-installation and project setup
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { findExecutable, createInheritedEnvironment, createWindowsCompatibleSpawn, ExecutableLocation } from './executable-finder.js';

export interface InstallationResult {
  success: boolean;
  projectPath: string;
  error?: string;
  details?: string;
}

export class RemotionInstallationManager {
  private defaultProjectPath: string;
  
  constructor() {
    this.defaultProjectPath = path.join(os.homedir(), '.claude-videos', 'remotion-workspace');
  }
  
  /**
   * Setup Remotion environment with auto-installation
   */
  async setupRemotionEnvironment(customPath?: string): Promise<InstallationResult> {
    const projectDir = customPath || this.defaultProjectPath;
    
    try {
      // Ensure project directory exists
      await fs.ensureDir(projectDir);
      
      // Check if Remotion is already installed
      const packageJsonPath = path.join(projectDir, 'package.json');
      const isInstalled = await fs.pathExists(packageJsonPath);
      
      if (!isInstalled) {
        console.error('Remotion not found, installing...');
        await this.installRemotionProject(projectDir);
      }
      
      // Verify installation
      await this.verifyInstallation(projectDir);
      
      return {
        success: true,
        projectPath: projectDir
      };
      
    } catch (error) {
      return {
        success: false,
        projectPath: projectDir,
        error: error instanceof Error ? error.message : String(error),
        details: 'Failed to setup Remotion environment'
      };
    }
  }
  
  /**
   * Install new Remotion project with all dependencies
   */
  private async installRemotionProject(projectDir: string): Promise<void> {
    // Find npm executable
    const npmLocation = findExecutable('npm');
    
    // Create package.json with Remotion dependencies
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
        'build': 'remotion render',
        'upgrade': 'remotion upgrade'
      }
    };
    
    // Write package.json
    await fs.writeFile(
      path.join(projectDir, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create basic remotion.config.ts
    const remotionConfig = `import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
`;
    
    await fs.writeFile(
      path.join(projectDir, 'remotion.config.ts'),
      remotionConfig
    );
    
    // Create src directory and basic component
    const srcDir = path.join(projectDir, 'src');
    await fs.ensureDir(srcDir);
    
    // Install dependencies
    await this.runNpmInstall(npmLocation.fullPath, projectDir);
  }
  
  /**
   * Run npm install with proper environment and error handling
   */
  private async runNpmInstall(npmPath: string, projectDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // WINDOWS FIX: Apply cmd.exe wrapper for spaces-in-path
      const spawnConfig = createWindowsCompatibleSpawn(npmPath, ['install', '--silent']);
      
      const install = spawn(spawnConfig.command, spawnConfig.args, {
        cwd: projectDir,
        env: createInheritedEnvironment(),
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: spawnConfig.useShell,
        windowsVerbatimArguments: spawnConfig.windowsVerbatimArguments
      });
      
      let errorOutput = '';
      
      install.stderr.on('data', (data) => {
        errorOutput += data.toString();
        // Log to stderr for debugging without breaking MCP protocol
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
      
      // Timeout after 5 minutes
      setTimeout(() => {
        install.kill('SIGTERM');
        reject(new Error('npm install timeout after 5 minutes'));
      }, 300000);
    });
  }
  
  /**
   * Verify that Remotion is properly installed
   */
  private async verifyInstallation(projectDir: string): Promise<void> {
    const packageJsonPath = path.join(projectDir, 'package.json');
    const nodeModulesPath = path.join(projectDir, 'node_modules');
    const remotionPath = path.join(nodeModulesPath, '@remotion', 'cli');
    
    // Check package.json exists
    if (!await fs.pathExists(packageJsonPath)) {
      throw new Error('package.json not found after installation');
    }
    
    // Check node_modules exists
    if (!await fs.pathExists(nodeModulesPath)) {
      throw new Error('node_modules directory not found after installation');
    }
    
    // Check Remotion is installed
    if (!await fs.pathExists(remotionPath)) {
      throw new Error('@remotion/cli not found in node_modules');
    }
    
    // Try to run remotion version check
    try {
      const npxLocation = findExecutable('npx');
      await new Promise((resolve, reject) => {
        // WINDOWS FIX: Apply cmd.exe wrapper for spaces-in-path
        const spawnConfig = createWindowsCompatibleSpawn(npxLocation.fullPath, ['remotion', '--version']);
        
        const versionCheck = spawn(spawnConfig.command, spawnConfig.args, {
          cwd: projectDir,
          env: createInheritedEnvironment(),
          stdio: ['ignore', 'pipe', 'pipe'],
          shell: spawnConfig.useShell,
          windowsVerbatimArguments: spawnConfig.windowsVerbatimArguments
        });
        
        versionCheck.on('exit', (code) => {
          if (code === 0) {
            resolve(true);
          } else {
            reject(new Error('Remotion version check failed'));
          }
        });
        
        versionCheck.on('error', (error) => {
          reject(error);
        });
        
        // Quick timeout for version check
        setTimeout(() => {
          versionCheck.kill('SIGTERM');
          reject(new Error('Version check timeout'));
        }, 10000);
      });
    } catch (error) {
      throw new Error(`Remotion verification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Check if project is properly set up
   */
  async isProjectReady(projectPath?: string): Promise<boolean> {
    const targetPath = projectPath || this.defaultProjectPath;
    
    try {
      await this.verifyInstallation(targetPath);
      return true;
    } catch (error) {
      return false;
    }
  }
}
