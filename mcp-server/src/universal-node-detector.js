const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const os = require('os');

/**
 * Universal Node.js executable detection for MCP servers
 * Eliminates false positive PATH detection issues across all platforms
 */
class UniversalNodeDetector {
    constructor(options = {}) {
        this.platform = os.platform();
        this.arch = os.arch();
        this.homedir = os.homedir();
        this.debug = options.debug || false;
        
        // Cache for detected executables to avoid repeated filesystem checks
        this.cache = new Map();
        this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
        
        this.log('Initialized Universal Node Detector for platform:', this.platform);
    }

    log(...args) {
        if (this.debug) {
            console.log('[UniversalNodeDetector]', ...args);
        }
    }

    /**
     * Get comprehensive fallback paths for Node.js installations
     * Based on extensive cross-platform research
     */
    getNodeFallbackPaths() {
        const paths = [];

        if (this.platform === 'win32') {
            // Windows installation paths - comprehensive coverage
            paths.push(
                // System installations
                'C:\\Program Files\\nodejs\\node.exe',
                'C:\\Program Files (x86)\\nodejs\\node.exe',
                
                // User installations
                path.join(this.homedir, 'AppData\\Roaming\\npm\\node.exe'),
                path.join(this.homedir, 'AppData\\Local\\Programs\\nodejs\\node.exe'),
                
                // Package manager installations
                'C:\\ProgramData\\chocolatey\\lib\\nodejs\\tools\\node.exe',
                'C:\\tools\\nodejs\\node.exe',
                
                // NVM for Windows
                path.join(this.homedir, 'AppData\\Roaming\\nvm'),
                'C:\\nvm',
                
                // Scoop installations
                path.join(this.homedir, 'scoop\\apps\\nodejs\\current\\node.exe'),
                
                // Winget installations
                path.join(this.homedir, 'AppData\\Local\\Microsoft\\WinGet\\Packages')
            );

        } else if (this.platform === 'darwin') {
            // macOS installation paths
            paths.push(
                // Homebrew Intel
                '/usr/local/bin/node',
                '/usr/local/Cellar/node',
                
                // Homebrew Apple Silicon (M1/M2/M3)
                '/opt/homebrew/bin/node',
                '/opt/homebrew/Cellar/node',
                
                // NVM installations
                path.join(this.homedir, '.nvm/versions/node'),
                path.join(this.homedir, '.nvm/current/bin/node'),
                
                // System installations
                '/usr/bin/node',
                '/usr/local/bin/node',
                '/opt/local/bin/node', // MacPorts
                
                // User installations
                path.join(this.homedir, '.local/bin/node')
            );

        } else {
            // Linux installation paths
            paths.push(
                // System package managers
                '/usr/bin/node',
                '/usr/local/bin/node',
                '/bin/node',
                
                // Snap installations
                '/snap/bin/node',
                '/snap/node/current/bin/node',
                '/var/lib/snapd/snap/bin/node',
                
                // User installations
                path.join(this.homedir, '.local/bin/node'),
                path.join(this.homedir, 'bin/node'),
                
                // NVM installations
                path.join(this.homedir, '.nvm/versions/node'),
                path.join(this.homedir, '.nvm/current/bin/node'),
                
                // Alternative locations
                '/opt/node/bin/node',
                '/opt/nodejs/bin/node'
            );
        }

        return paths;
    }

    /**
     * Get npm/npx fallback paths based on Node.js locations
     */
    getNpmFallbackPaths() {
        const nodePaths = this.getNodeFallbackPaths();
        const npmPaths = [];

        for (const nodePath of nodePaths) {
            const nodeDir = path.dirname(nodePath);
            
            if (this.platform === 'win32') {
                npmPaths.push(
                    path.join(nodeDir, 'npm.cmd'),
                    path.join(nodeDir, 'npx.cmd'),
                    path.join(nodeDir, 'npm.exe'),
                    path.join(nodeDir, 'npx.exe')
                );
            } else {
                npmPaths.push(
                    path.join(nodeDir, 'npm'),
                    path.join(nodeDir, 'npx')
                );
            }
        }

        // Add global npm locations
        if (this.platform === 'win32') {
            npmPaths.push(
                path.join(this.homedir, 'AppData\\Roaming\\npm\\npm.cmd'),
                path.join(this.homedir, 'AppData\\Roaming\\npm\\npx.cmd')
            );
        } else {
            npmPaths.push(
                '/usr/local/bin/npm',
                '/usr/local/bin/npx',
                '/usr/bin/npm',
                '/usr/bin/npx'
            );
        }

        return npmPaths;
    }

    /**
     * Universal executable detection using multiple strategies
     * This eliminates the PATH environment dependency issue
     */
    async detectExecutable(name, customPaths = []) {
        const cacheKey = `${name}_${customPaths.join(':')}`;
        const cached = this.cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            this.log('Using cached result for', name);
            return cached.result;
        }

        // Multiple detection strategies - most reliable first
        const strategies = [
            () => this.findInFallbackPaths(name, customPaths), // Most reliable
            () => this.findInPath(name),                        // Traditional PATH
            () => this.findWithSystemCommand(name),             // which/where
            () => this.findInVersionManagers(name)              // nvm, etc.
        ];

        for (const strategy of strategies) {
            try {
                const result = await strategy();
                if (result && await this.verifyExecutable(result, name)) {
                    this.cache.set(cacheKey, { result, timestamp: Date.now() });
                    this.log(`Found ${name} at: ${result}`);
                    return result;
                }
            } catch (error) {
                this.log(`Strategy failed for ${name}:`, error.message);
            }
        }

        throw new Error(`Executable '${name}' not found on system. Please ensure Node.js is installed.`);
    }

    /**
     * Find executable in comprehensive fallback paths
     * This is the primary strategy that bypasses PATH issues
     */
    async findInFallbackPaths(name, customPaths = []) {
        let fallbackPaths = [];

        if (name === 'node') {
            fallbackPaths = this.getNodeFallbackPaths();
        } else if (name === 'npm' || name === 'npx') {
            fallbackPaths = this.getNpmFallbackPaths().filter(p => 
                p.includes(name) || p.endsWith(name) || p.endsWith(`${name}.cmd`)
            );
        }

        // Prepend custom paths for priority
        fallbackPaths = [...customPaths, ...fallbackPaths];

        for (const fallbackPath of fallbackPaths) {
            // Handle directory paths - look for executables inside
            if (await this.isDirectory(fallbackPath)) {
                const candidates = this.getExecutableCandidates(name, fallbackPath);
                for (const candidate of candidates) {
                    if (await this.fileExists(candidate)) {
                        return candidate;
                    }
                }

                // For version managers, check subdirectories
                if (fallbackPath.includes('nvm') || fallbackPath.includes('versions')) {
                    const versionPath = await this.findInVersionManager(name, fallbackPath);
                    if (versionPath) return versionPath;
                }
            } else if (await this.fileExists(fallbackPath)) {
                return fallbackPath;
            }
        }

        return null;
    }

    /**
     * Find executable in PATH environment variable
     * Fallback strategy when direct detection fails
     */
    async findInPath(name) {
        const pathEnv = process.env.PATH || process.env.Path || '';
        const pathSeparator = this.platform === 'win32' ? ';' : ':';
        const paths = pathEnv.split(pathSeparator).filter(p => p);

        for (const dir of paths) {
            const candidates = this.getExecutableCandidates(name, dir);
            for (const candidate of candidates) {
                if (await this.fileExists(candidate)) {
                    return candidate;
                }
            }
        }

        return null;
    }

    /**
     * Find executable using system commands (which/where)
     */
    async findWithSystemCommand(name) {
        const command = this.platform === 'win32' ? 'where' : 'which';
        
        try {
            const result = spawnSync(command, [name], { 
                encoding: 'utf8',
                timeout: 5000,
                shell: this.platform === 'win32'
            });

            if (result.status === 0 && result.stdout) {
                const paths = result.stdout.trim().split('\n');
                return paths[0]; // Return first match
            }
        } catch (error) {
            this.log(`${command} command failed:`, error.message);
        }

        return null;
    }

    /**
     * Find executables in version manager directories
     */
    async findInVersionManagers(name) {
        const versionManagerPaths = [
            path.join(this.homedir, '.nvm/versions/node'),
            path.join(this.homedir, '.nvm/current/bin'),
            ...(this.platform === 'win32' ? [
                path.join(this.homedir, 'AppData\\Roaming\\nvm'),
                'C:\\nvm'
            ] : [])
        ];

        for (const basePath of versionManagerPaths) {
            if (await this.isDirectory(basePath)) {
                const result = await this.findInVersionManager(name, basePath);
                if (result) return result;
            }
        }

        return null;
    }

    /**
     * Find executable in version manager directory structure
     */
    async findInVersionManager(name, basePath) {
        try {
            const entries = await fs.promises.readdir(basePath, { withFileTypes: true });

            // Look for version directories (e.g., v18.17.0, v20.5.1)
            const versionDirs = entries
                .filter(entry => entry.isDirectory() && /^v?\d+/.test(entry.name))
                .sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true })); // Latest first

            for (const versionDir of versionDirs) {
                const versionPath = path.join(basePath, versionDir.name);
                const binPath = path.join(versionPath, 'bin');

                if (await this.isDirectory(binPath)) {
                    const candidates = this.getExecutableCandidates(name, binPath);
                    for (const candidate of candidates) {
                        if (await this.fileExists(candidate)) {
                            return candidate;
                        }
                    }
                }
            }
        } catch (error) {
            this.log('Error reading version manager directory:', error.message);
        }

        return null;
    }

    /**
     * Get possible executable names for a command
     */
    getExecutableCandidates(name, dir) {
        const candidates = [];

        if (this.platform === 'win32') {
            candidates.push(
                path.join(dir, `${name}.exe`),
                path.join(dir, `${name}.cmd`),
                path.join(dir, `${name}.bat`),
                path.join(dir, name)
            );
        } else {
            candidates.push(path.join(dir, name));
        }

        return candidates;
    }

    /**
     * Verify that an executable is valid and working
     */
    async verifyExecutable(executablePath, name) {
        try {
            // Check file permissions
            if (!await this.hasExecutePermission(executablePath)) {
                return false;
            }

            // Test execution with timeout
            const testArgs = this.getTestArgs(name);
            const result = spawnSync(executablePath, testArgs, {
                timeout: 10000,
                stdio: 'pipe'
            });

            return result.status === 0;

        } catch (error) {
            this.log('Executable verification failed:', error.message);
            return false;
        }
    }

    /**
     * Get test arguments for different executables
     */
    getTestArgs(name) {
        const testArgs = {
            'node': ['--version'],
            'npm': ['--version'],
            'npx': ['--version']
        };

        return testArgs[name] || ['--version'];
    }

    /**
     * Check if file has execute permission
     */
    async hasExecutePermission(filePath) {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK | fs.constants.X_OK);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if file exists
     */
    async fileExists(filePath) {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if path is a directory
     */
    async isDirectory(dirPath) {
        try {
            const stat = await fs.promises.stat(dirPath);
            return stat.isDirectory();
        } catch {
            return false;
        }
    }

    /**
     * Create environment with proper PATH inheritance
     * Solves the environment context mismatch issue
     */
    createUnifiedEnvironment(additionalPaths = []) {
        // Start with current process environment
        const env = { ...process.env };
        
        // Get all detected Node.js paths for enhancement
        const nodePaths = this.getNodeFallbackPaths()
            .map(p => path.dirname(p))
            .filter((dir, index, array) => array.indexOf(dir) === index); // Remove duplicates

        // Merge all paths
        const currentPath = env.PATH || env.Path || '';
        const pathSeparator = this.platform === 'win32' ? ';' : ':';
        
        const allPaths = [
            ...additionalPaths,
            ...nodePaths,
            ...currentPath.split(pathSeparator)
        ].filter((path, index, array) => 
            path && array.indexOf(path) === index // Remove duplicates and empty paths
        );

        // Set unified PATH
        env.PATH = allPaths.join(pathSeparator);
        
        // Ensure npm configuration doesn't interfere
        env.npm_config_loglevel = 'error';
        env.CI = 'true';

        this.log('Created unified environment with enhanced PATH');
        return env;
    }

    /**
     * Get comprehensive Node.js installation info
     * This replaces the problematic check_environment function
     */
    async getNodeInstallationInfo() {
        const results = {
            platform: this.platform,
            arch: this.arch,
            executables: {}
        };

        const executables = ['node', 'npm', 'npx'];
        
        for (const exe of executables) {
            try {
                const executablePath = await this.detectExecutable(exe);
                const version = await this.getVersion(executablePath);
                
                results.executables[exe] = {
                    path: executablePath,
                    version: version,
                    found: true
                };
                
            } catch (error) {
                results.executables[exe] = {
                    path: null,
                    version: null,
                    found: false,
                    error: error.message
                };
            }
        }

        return results;
    }

    /**
     * Get version of an executable
     */
    async getVersion(executablePath) {
        try {
            const result = spawnSync(executablePath, ['--version'], {
                encoding: 'utf8',
                timeout: 5000
            });

            if (result.status === 0 && result.stdout) {
                return result.stdout.trim().replace(/^v/, '');
            }
        } catch (error) {
            this.log('Failed to get version:', error.message);
        }

        return null;
    }
}

module.exports = { UniversalNodeDetector };
