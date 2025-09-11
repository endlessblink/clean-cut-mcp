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
  const srcDir = path.join(WORKSPACE, 'src');
  const rootTsx = path.join(srcDir, 'Root.tsx');
  const compTsx = path.join(srcDir, 'Composition.tsx');
  const indexTs = path.join(srcDir, 'index.ts');

  const needScaffold = !(await fileExists(pkgJsonPath)) || !(await fileExists(srcDir));

  if (needScaffold) {
    const pkg = {
      name: 'claude-videos-workspace',
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        start: 'remotion studio',
        render: 'remotion render',
        upgrade: 'remotion upgrade'
      },
      dependencies: {
        '@remotion/cli': '^4.0.0',
        '@remotion/player': '^4.0.0',
        'react': '^18.0.0',
        'react-dom': '^18.0.0',
        'remotion': '^4.0.0'
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

    await fsp.writeFile(rootTsx, rootContent);
    await fsp.writeFile(compTsx, compContent);
    await fsp.writeFile(indexTs, indexContent);
  }

  // Ensure dependencies are installed
  const nodeModules = path.join(WORKSPACE, 'node_modules');
  if (!(await fileExists(nodeModules))) {
    await run('npm', ['install'], {cwd: WORKSPACE});
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

    child.stdout.on('data', (d) => process.stdout.write(`[${command}] ${d}`));
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
  child.stdout.on('data', (d) => process.stdout.write(`[${command}] ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`[${command} ERR] ${d}`));
  return child;
}

async function main() {
  console.error(`[ENTRYPOINT] Initializing workspace at ${WORKSPACE} ...`);
  await ensureWorkspaceInitialized();

  console.error(`[ENTRYPOINT] Launching Remotion Studio on port ${STUDIO_PORT} ...`);
  const studio = spawnBackground('npx', ['remotion', 'studio', '--host', '0.0.0.0', '--port', String(STUDIO_PORT), '--root', WORKSPACE, '--no-open'], {
    cwd: WORKSPACE,
    env: {
      ...process.env,
      // Avoid trying to open a browser in the container
      BROWSER: 'none'
    }
  });

  console.error(`[ENTRYPOINT] Launching MCP HTTP server on port ${MCP_PORT} ...`);
  const mcp = spawnBackground('node', ['/app/mcp-server/dist/http-mcp-server.js'], {
    env: process.env
  });

  const shutdown = () => {
    console.error('[ENTRYPOINT] Shutting down ...');
    try { studio.kill('SIGTERM'); } catch {}
    try { mcp.kill('SIGTERM'); } catch {}
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep process alive as long as both children are running
  const wait = (child) => new Promise((res) => child.on('exit', res));
  await Promise.race([wait(studio), wait(mcp)]);
  console.error('[ENTRYPOINT] One of the child processes exited. Exiting container.');
  shutdown();
}

main().catch((err) => {
  console.error('[ENTRYPOINT] Fatal error:', err);
  process.exit(1);
});

