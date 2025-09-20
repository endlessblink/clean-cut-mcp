// start.js - container entrypoint: initialize /workspace and run MCP + Remotion Studio
// CommonJS for maximum Node compatibility

const {spawn} = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const WORKSPACE = process.env.WORKSPACE_DIR || '/workspace';
const MCP_PORT = process.env.MCP_SERVER_PORT || '6961';
const STUDIO_PORT = process.env.REMOTION_STUDIO_PORT || '6960';

async function ensureDir(p) {
  await fsp.mkdir(p, {recursive: true}).catch(() => {});
}

async function fileExists(p) {
  try { await fsp.access(p); return true; } catch { return false; }
}

async function ensureWorkspaceInitialized() {
  await ensureDir(WORKSPACE);
  const pkgJsonPath = path.join(WORKSPACE, 'package.json');
  const outDir = path.join(WORKSPACE, 'out');
  const rootTsx = path.join(WORKSPACE, 'Root.tsx');
  const compTsx = path.join(WORKSPACE, 'Composition.tsx');
  const indexTs = path.join(WORKSPACE, 'index.ts');

  // Ensure export directory exists with proper permissions
  await ensureDir(outDir);

  // UNIFIED WORKSPACE: Migrate from /workspace/src if needed
  const srcDir = path.join(WORKSPACE, 'src');
  if (await fileExists(srcDir)) {
    console.error('[start.js] Migrating to unified workspace structure...');

    // Copy all component files from src to workspace root
    const srcFiles = await fsp.readdir(srcDir);
    for (const file of srcFiles) {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file === '.prettierrc' || file === 'remotion.config.ts' || file === 'tsconfig.json') {
        const srcPath = path.join(srcDir, file);
        const destPath = path.join(WORKSPACE, file);
        if (!(await fileExists(destPath))) {
          await fsp.copyFile(srcPath, destPath);
          console.error(`[start.js] Migrated: ${file}`);
        }
      }
    }
  }

  const needScaffold = !(await fileExists(pkgJsonPath));

  if (needScaffold) {
    const pkg = {
      name: 'claude-videos-workspace',
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        start: 'remotion studio',
        render: 'remotion render',
        upgrade: 'remotion upgrade',
        prettier: 'prettier',
        format: 'prettier --write .'
      },
      dependencies: {
        '@remotion/cli': '^4.0.0',
        '@remotion/player': '^4.0.0',
        'react': '^18.0.0',
        'react-dom': '^18.0.0',
        'remotion': '^4.0.0'
      },
      devDependencies: {
        'prettier': '^3.6.2'
      }
    };
    await fsp.writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2));

    await ensureDir(srcDir);
    const rootContent = `import {Composition} from 'remotion';
import {Comp} from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Comp}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};`;
    const compContent = `import {useCurrentFrame, AbsoluteFill, interpolate} from 'remotion';

export const Comp: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 80,
        backgroundColor: '#000',
        color: '#fff',
        opacity,
      }}
    >
      Welcome to Remotion
    </AbsoluteFill>
  );
};`;
    const indexContent = `import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';

registerRoot(RemotionRoot);`;

    // Only write Root.tsx if it doesn't exist (preserve existing comprehensive Root.tsx)
    if (!(await fileExists(rootTsx))) {
      await fsp.writeFile(rootTsx, rootContent);
    }

    // Only write Composition.tsx if it doesn't exist
    if (!(await fileExists(compTsx))) {
      await fsp.writeFile(compTsx, compContent);
    }

    // Only write index.ts if it doesn't exist
    if (!(await fileExists(indexTs))) {
      await fsp.writeFile(indexTs, indexContent);
    }
  }

  // Copy .prettierrc to workspace src directory for Remotion Studio
  const prettierrcSrc = path.join(srcDir, '.prettierrc');
  const prettierrcApp = '/app/.prettierrc';
  if (await fileExists(prettierrcApp) && !(await fileExists(prettierrcSrc))) {
    await fsp.copyFile(prettierrcApp, prettierrcSrc);
  }

  // CRITICAL: Copy .prettierrc from src to workspace root for Studio component deletion
  const prettierrcWorkspace = path.join(WORKSPACE, '.prettierrc');
  if (await fileExists(prettierrcSrc) && !(await fileExists(prettierrcWorkspace))) {
    await fsp.copyFile(prettierrcSrc, prettierrcWorkspace);
    console.error('[start.js] Copied .prettierrc for Remotion Studio deletion compatibility');
  }

  // Ensure dependencies are installed
  const nodeModules = path.join(WORKSPACE, 'node_modules');
  if (!(await fileExists(nodeModules))) {
    await run('npm', ['install'], {cwd: WORKSPACE});
  }

  // SAFE: Enhanced prettier binary verification for Remotion Studio
  await ensurePrettierBinary();

  // RESEARCH-VALIDATED: Startup auto-repair for broken imports (Docker volume mount solution)
  await cleanupBrokenImports();
}

// SAFE: Comprehensive prettier binary verification with multiple fallbacks
async function ensurePrettierBinary() {
  const binDir = path.join(WORKSPACE, 'node_modules', '.bin');
  const binPath = path.join(binDir, 'prettier');

  console.error('[start.js] Ensuring prettier binary for Remotion Studio deletion...');

  // Method 1: Try npm rebuild (safest approach)
  try {
    console.error('[start.js] Attempting npm rebuild to create prettier binary...');
    await run('npm', ['rebuild'], {cwd: WORKSPACE});

    if (await fileExists(binPath)) {
      // Verify it works
      const result = await testPrettierBinary(binPath);
      if (result) {
        console.error('[start.js] SUCCESS: npm rebuild created working prettier binary');
        return true;
      }
    }
  } catch (error) {
    console.error('[start.js] npm rebuild failed:', error.message);
  }

  // Method 2: Try npm install prettier specifically
  try {
    console.error('[start.js] Attempting direct prettier installation...');
    await run('npm', ['install', 'prettier@3.6.2', '--save-dev'], {cwd: WORKSPACE});

    if (await fileExists(binPath)) {
      const result = await testPrettierBinary(binPath);
      if (result) {
        console.error('[start.js] SUCCESS: npm install created working prettier binary');
        return true;
      }
    }
  } catch (error) {
    console.error('[start.js] npm install prettier failed:', error.message);
  }

  // Method 3: Create complete prettier package structure with npm recognition
  try {
    console.error('[start.js] Creating complete prettier package structure with npm recognition...');
    const prettierPkgDir = path.join(WORKSPACE, 'node_modules', 'prettier');

    // Create prettier package directory and copy from global installation
    await fsp.mkdir(prettierPkgDir, { recursive: true });
    await run('cp', ['-r', '/usr/local/lib/node_modules/prettier/.', prettierPkgDir], {});

    // Update package.json to properly declare prettier dependency
    const pkgJsonPath = path.join(WORKSPACE, 'package.json');
    if (await fileExists(pkgJsonPath)) {
      const pkg = JSON.parse(await fsp.readFile(pkgJsonPath, 'utf-8'));
      pkg.devDependencies = pkg.devDependencies || {};
      pkg.devDependencies.prettier = '^3.6.2';
      await fsp.writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2));
    }

    // Create binary symlink
    await fsp.mkdir(binDir, { recursive: true });
    await fsp.unlink(binPath).catch(() => {}); // Remove existing
    await fsp.symlink('../prettier/bin/prettier.cjs', binPath);

    // Force npm to recognize the package
    await run('npm', ['rebuild'], {cwd: WORKSPACE});

    // Verify npm recognizes prettier
    const npmCheck = await run('npm', ['ls', 'prettier'], {cwd: WORKSPACE}).catch(() => null);
    const result = await testPrettierBinary(binPath);

    if (result) {
      console.error('[start.js] SUCCESS: Complete prettier package with npm recognition created');
      return true;
    }
  } catch (error) {
    console.error('[start.js] Complete prettier package creation failed:', error.message);
  }

  // Method 4: Fallback to global prettier symlink (current working method)
  try {
    console.error('[start.js] Falling back to global prettier symlink...');
    await fsp.mkdir(binDir, { recursive: true });
    await fsp.unlink(binPath).catch(() => {}); // Remove existing
    await fsp.symlink('/usr/local/bin/prettier', binPath);

    const result = await testPrettierBinary(binPath);
    if (result) {
      console.error('[start.js] SUCCESS: Global prettier symlink created (fallback)');
      return true;
    }
  } catch (error) {
    console.error('[start.js] Global prettier symlink failed:', error.message);
  }

  console.error('[start.js] WARNING: All prettier setup methods failed - Remotion Studio deletion may not work');
  return false;
}

// SAFE: Test if prettier binary actually works
async function testPrettierBinary(binPath) {
  try {
    const result = await run('node', [binPath, '--version'], {cwd: WORKSPACE});
    return true;
  } catch (error) {
    console.error(`[start.js] Prettier test failed for ${binPath}:`, error.message);
    return false;
  }
}

function run(command, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      ...opts,
      env: {
        ...process.env,
        // Ensure non-interactive
        CI: 'true'
      }
    });

    child.stdout.on('data', (d) => process.stderr.write(`[${command}] ${d}`));
    child.stderr.on('data', (d) => process.stderr.write(`[${command} ERR] ${d}`));

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

function spawnBackground(command, args, opts = {}) {
  const child = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts
  });
  child.stdout.on('data', (d) => process.stderr.write(`[${command}] ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`[${command} ERR] ${d}`));
  return child;
}

async function main() {
  console.error(`[ENTRYPOINT] Initializing workspace at ${WORKSPACE} ...`);
  await ensureWorkspaceInitialized();

  // Clear Remotion cache for fresh bundle (WSL2 sync fix)
  console.error(`[ENTRYPOINT] Clearing Remotion cache for WSL2 compatibility...`);
  try {
    await fsp.rmdir(path.join(WORKSPACE, '.remotion'), {recursive: true}).catch(() => {});
    await fsp.rmdir(path.join(WORKSPACE, 'node_modules', '.cache'), {recursive: true}).catch(() => {});
    console.error(`[ENTRYPOINT] Remotion cache cleared`);
  } catch (error) {
    console.error(`[ENTRYPOINT] Cache clear warning: ${error.message}`);
  }

  console.error(`[ENTRYPOINT] Launching Remotion Studio on port ${STUDIO_PORT} ...`);
  const studio = spawnBackground('npx', ['remotion', 'studio', '--host', '0.0.0.0', '--port', String(STUDIO_PORT), '--root', WORKSPACE, '--no-open'], {
    cwd: WORKSPACE,
    env: {
      ...process.env,
      // Avoid trying to open a browser in the container
      BROWSER: 'none',
      // WSL2 Docker file watching fix (research-validated)
      CHOKIDAR_USEPOLLING: 'true',
      // Pass Chrome stability flags for video rendering
      REMOTION_CHROME_FLAGS: process.env.CHROME_FLAGS
    }
  });

  console.error(`[ENTRYPOINT] Launching Remotion Studio on port ${STUDIO_PORT} ...`);
  // Note: STDIO MCP server starts on demand via Docker exec, not as background process

  const shutdown = () => {
    console.error('[ENTRYPOINT] Shutting down ...');
    try { studio.kill('SIGTERM'); } catch {}
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep process alive as long as studio is running
  const wait = (child) => new Promise((res) => child.on('exit', res));
  await wait(studio);
  console.error('[ENTRYPOINT] Remotion Studio exited. Exiting container.');
  shutdown();
}

// RESEARCH-VALIDATED: Startup auto-repair for Docker volume mount deletion persistence
async function cleanupBrokenImports() {
  try {
    const srcDir = path.join(WORKSPACE, 'src');
    const rootPath = path.join(srcDir, 'Root.tsx');

    if (!(await fileExists(rootPath))) {
      console.error('[start.js] Root.tsx not found - skipping cleanup');
      return;
    }

    console.error('[start.js] Scanning for broken imports (Docker volume mount solution)...');

    let rootContent = await fsp.readFile(rootPath, 'utf-8');
    const originalContent = rootContent;
    let cleanupCount = 0;

    // Find all import statements and check if component files exist
    const importPattern = /import\s*\{\s*(\w+)\s*\}\s*from\s*['"]\.\//g;
    let match;
    const brokenImports = [];

    while ((match = importPattern.exec(rootContent)) !== null) {
      const componentName = match[1];

      // Skip system components
      if (componentName === 'Comp' || componentName === 'z') continue;

      const componentPath = path.join(srcDir, `${componentName}.tsx`);

      if (!(await fileExists(componentPath))) {
        brokenImports.push(componentName);
        console.error(`[start.js] Found broken import: ${componentName} (file missing)`);
      }
    }

    // Clean up each broken import
    for (const componentName of brokenImports) {
      // Remove import statement
      rootContent = rootContent.replace(
        new RegExp(`import\\s*\\{\\s*${componentName}\\s*\\}\\s*from\\s*['"]\\.\\/${componentName}['"];?\\n?`, 'g'),
        ''
      );

      // Remove schema definition
      rootContent = rootContent.replace(
        new RegExp(`const\\s+${componentName}Schema\\s*=\\s*z\\.object\\([^}]+\\}\\);\\n?`, 'gs'),
        ''
      );

      // Remove composition entries
      rootContent = rootContent
        .replace(new RegExp(`\\s*<Composition[^>]*id="${componentName}"[^>]*\\/?>\\n?`, 'gs'), '')
        .replace(new RegExp(`\\s*<Composition[^>]*id="${componentName}"[^>]*>.*?<\\/Composition>\\n?`, 'gs'), '');

      cleanupCount++;
    }

    // Only write if changes were made
    if (rootContent !== originalContent) {
      await fsp.writeFile(rootPath, rootContent);
      console.error(`[start.js] SUCCESS: Cleaned ${cleanupCount} broken imports - Studio will start clean`);
    } else {
      console.error('[start.js] No broken imports found - Root.tsx is clean');
    }
  } catch (error) {
    console.error('[start.js] Cleanup failed (non-fatal):', error.message);
    // Don't throw - startup should continue even if cleanup fails
  }
}

main().catch((err) => {
  console.error('[ENTRYPOINT] Fatal error:', err);
  process.exit(1);
});

