/**
 * Root.tsx Auto-Sync System
 *
 * Automatically synchronizes Root.tsx with animation files
 * Prevents "Cannot find module" errors when adding/removing animations
 */
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Scan animations directory and return metadata
 */
export async function scanAnimations(animationsDir = process.env.DOCKER_CONTAINER === 'true'
    ? '/workspace/src/assets/animations'
    : path.join(__dirname, '../../clean-cut-workspace/src/assets/animations')) {
    const files = await glob('*.tsx', { cwd: animationsDir });
    const animations = [];
    for (const file of files) {
        const name = path.basename(file, '.tsx');
        const filePath = path.join(animationsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        // Extract duration from file content or use default
        const duration = extractDuration(content) || 240;
        // Check if schema is needed (has props interface)
        const hasSchema = /interface.*Props/.test(content);
        animations.push({
            name,
            path: filePath,
            duration,
            hasSchema,
            schemaFields: hasSchema ? extractSchemaFields(content) : undefined
        });
    }
    return animations.sort((a, b) => a.name.localeCompare(b.name));
}
/**
 * Extract duration from animation file
 */
function extractDuration(content) {
    // Look for duration in comments
    const durationMatch = content.match(/Duration:\s*(\d+)\s*frames/);
    if (durationMatch) {
        return parseInt(durationMatch[1]);
    }
    // Look for calculateSceneBasedDuration
    const calcMatch = content.match(/calculateSceneBasedDuration\((\d+)\)/);
    if (calcMatch) {
        const sceneCount = parseInt(calcMatch[1]);
        return (sceneCount * 75) + ((sceneCount - 1) * 15); // Formula
    }
    return null;
}
/**
 * Extract schema fields from props interface
 */
function extractSchemaFields(content) {
    const propsMatch = content.match(/interface\s+\w+Props\s*{([^}]+)}/);
    if (!propsMatch)
        return [];
    const fields = propsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'))
        .map(line => line.split(':')[0].trim().replace('?', ''));
    return fields;
}
/**
 * Generate Root.tsx content
 */
export function generateRootTsx(animations) {
    // Generate imports
    const imports = animations
        .map(anim => `import { ${anim.name} } from './assets/animations/${anim.name}';`)
        .join('\n');
    // Generate schemas
    const schemas = animations
        .filter(anim => anim.hasSchema)
        .map(anim => {
        const fields = anim.schemaFields?.map(field => `  ${field}: z.string().optional()`).join(',\n') || '';
        return `const ${anim.name}Schema = z.object({\n${fields}\n});`;
    })
        .join('\n\n');
    // Generate compositions
    const compositions = animations
        .map(anim => `
      <Composition
        id="${anim.name}"
        component={${anim.name}}
        durationInFrames={${anim.duration}}
        fps={30}
        width={1920}
        height={1080}${anim.hasSchema ? `\n        schema={${anim.name}Schema}` : ''}
      />`)
        .join('');
    return `import { Composition } from 'remotion';
import { Comp } from './Composition';
import { z } from 'zod';
${imports}

${schemas ? schemas + '\n\n' : ''}export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Comp}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />${compositions}
    </>
  );
};
`;
}
/**
 * Sync Root.tsx with animation files
 */
export async function syncRootTsx(animationsDir, rootPath) {
    const defaultRoot = process.env.DOCKER_CONTAINER === 'true'
        ? '/workspace/src/Root.tsx'
        : path.join(__dirname, '../../clean-cut-workspace/src/Root.tsx');
    const targetPath = rootPath || defaultRoot;
    const changes = [];
    // 1. Scan animations
    const animations = await scanAnimations(animationsDir);
    changes.push(`Scanned ${animations.length} animations`);
    // 2. Generate new Root.tsx
    const newContent = generateRootTsx(animations);
    // 3. Check if changed
    const oldContent = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf-8') : '';
    if (newContent === oldContent) {
        changes.push('No changes needed');
        return { synced: true, animations: animations.length, changes };
    }
    // 4. Write Root.tsx
    fs.writeFileSync(targetPath, newContent, 'utf-8');
    changes.push(`Updated Root.tsx with ${animations.length} animations`);
    return {
        synced: true,
        animations: animations.length,
        changes
    };
}
/**
 * Watch animations directory and auto-sync on changes
 */
export function watchAndSync(animationsDir, rootPath) {
    const defaultAnimations = process.env.DOCKER_CONTAINER === 'true'
        ? '/workspace/src/assets/animations'
        : path.join(__dirname, '../../clean-cut-workspace/src/assets/animations');
    const watchPath = animationsDir || defaultAnimations;
    console.log(`👀 Watching ${watchPath} for changes...`);
    fs.watch(watchPath, { recursive: false }, async (eventType, filename) => {
        if (filename && filename.endsWith('.tsx')) {
            console.log(`📝 Detected change: ${filename}`);
            const result = await syncRootTsx(animationsDir, rootPath);
            console.log(`✅ Synced: ${result.changes.join(', ')}`);
        }
    });
}
/**
 * Usage:
 *
 * // Manual sync (call after adding/removing animations)
 * await syncRootTsx();
 *
 * // Auto-watch mode (for development)
 * watchAndSync();
 *
 * // CLI usage:
 * npx tsx src/root-sync.ts
 */
// CLI mode
if (import.meta.url === `file://${process.argv[1]}`) {
    syncRootTsx().then(result => {
        console.log('✅ Root.tsx synced:');
        result.changes.forEach(change => console.log(`  - ${change}`));
    });
}
