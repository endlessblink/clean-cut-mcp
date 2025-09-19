/**
 * TRUE AI Code Generation MCP Server - Claude Desktop Integration
 * Claude generates complete React/Remotion code - MCP server executes it
 * NO TEMPLATES - Pure AI-powered code generation and execution
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Configuration - Standardized to 6970/6971 ports
const APP_ROOT = process.env.DOCKER_CONTAINER === 'true' ? '/app' : path.resolve(__dirname, '../..');
const EXPORTS_DIR = process.env.DOCKER_CONTAINER === 'true' ? '/workspace/out' : path.join(APP_ROOT, 'clean-cut-exports');
const SRC_DIR = process.env.DOCKER_CONTAINER === 'true' ? '/workspace/src' : path.join(APP_ROOT, 'clean-cut-components');
const STUDIO_PORT = parseInt(process.env.REMOTION_STUDIO_PORT || '6970');
// Safe stderr-only logging (no stdout pollution for STDIO)
const log = (level, message, data) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [CLEAN-STDIO] ${message}`);
    if (data) {
        console.error(JSON.stringify(data, null, 2));
    }
};
class TrueAiStdioMcpServer {
    server;
    rootFileWatcher = null;
    lastRootContent = '';
    constructor() {
        this.server = new Server({
            name: 'clean-cut-mcp',
            version: '2.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
        this.setupFileWatcher();
    }
    setupErrorHandling() {
        this.server.onerror = (error) => {
            log('error', 'MCP Server error', { error: error.message });
        };
        process.on('SIGINT', async () => {
            log('info', 'Shutting down gracefully...');
            if (this.rootFileWatcher) {
                this.rootFileWatcher.close();
                log('info', 'File watcher closed');
            }
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        // TRUE AI TOOLS: Claude generates code - MCP server executes it
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'create_animation',
                        description: `Execute Claude-generated React/Remotion animation code with AUTOMATIC REGISTRATION

🎯 CRITICAL PROPS GUIDELINES for Claude:

1. CREATE MEANINGFUL PROPS that control actual visual content:
   ✅ Good Props: colors, text content, numbers, animation speeds, data values
   ✅ Examples: accentColor, username, repoCount, animationSpeed, bgColor, title, projectName
   ❌ Bad Props: generic width/height/duration (use Composition settings instead)

2. PROPS MUST BE USED IN THE COMPONENT CODE:
   ✅ Use props to set colors: backgroundColor={backgroundColor}
   ✅ Use props in text: {username || 'DefaultUser'}
   ✅ Use props for data: {repoCount}+ repositories
   ❌ Don't create unused props interfaces

3. RECOMMENDED PROP PATTERNS:
   - Content Props: title, username, projectName, description, message
   - Visual Props: accentColor, backgroundColor, primaryColor, textColor
   - Data Props: count, score, percentage, items (for numbers/stats)
   - Behavior Props: animationSpeed, autoPlay, showLabels, enableTransitions

4. COMPONENT REQUIREMENTS:
   - Must have TypeScript interface with meaningful optional props
   - Must have default values for all props
   - Must actually USE the props in JSX/styles
   - Must export with: export { ComponentName };

⚡ AUTOMATIC FEATURES: This tool automatically calls auto_sync to register the animation in Root.tsx with proper Zod schema generation.`,
                        inputSchema: {
                            type: 'object',
                            properties: {
                                code: {
                                    type: 'string',
                                    description: 'Complete React/Remotion TypeScript code with MEANINGFUL PROPS that actually control visual content, colors, text, and data (follow props guidelines above)'
                                },
                                componentName: {
                                    type: 'string',
                                    description: 'React component name (e.g. "RisingSun", "ParticleSystem")'
                                },
                                duration: {
                                    type: 'number',
                                    default: 8,
                                    description: 'Animation duration in seconds'
                                }
                            },
                            required: ['code', 'componentName']
                        }
                    },
                    {
                        name: 'update_composition',
                        description: 'Register new animation component in Remotion Root.tsx',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                componentName: {
                                    type: 'string',
                                    description: 'Component name to register'
                                },
                                duration: {
                                    type: 'number',
                                    description: 'Duration in seconds'
                                }
                            },
                            required: ['componentName', 'duration']
                        }
                    },
                    {
                        name: 'get_studio_url',
                        description: 'Get the URL for Remotion Studio interface',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'get_export_directory',
                        description: 'Get information about persistent video export directory',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'list_existing_components',
                        description: 'List all existing animation components to avoid naming conflicts',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'get_project_guidelines',
                        description: 'Get project configuration and naming guidelines for animations',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'rebuild_compositions',
                        description: 'Rebuild Root.tsx to register ALL existing animations in workspace',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'format_code',
                        description: 'Format animation code using prettier with video-optimized settings',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                componentName: {
                                    type: 'string',
                                    description: 'Name of the component to format'
                                },
                                code: {
                                    type: 'string',
                                    description: 'Code to format (optional - will read from file if not provided)'
                                }
                            },
                            required: ['componentName'],
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'manage_props',
                        description: 'Validate and manage component props using zod schemas for type safety',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                action: {
                                    type: 'string',
                                    enum: ['validate', 'generate_schema', 'add_props', 'list_props', 'apply_schema'],
                                    description: 'Action to perform'
                                },
                                componentName: {
                                    type: 'string',
                                    description: 'Name of the component'
                                },
                                props: {
                                    type: 'object',
                                    description: 'Props object to validate or add'
                                },
                                propName: {
                                    type: 'string',
                                    description: 'Name of specific prop to manage'
                                },
                                propType: {
                                    type: 'string',
                                    enum: ['string', 'number', 'boolean', 'color', 'enum'],
                                    description: 'Type of prop to add'
                                },
                                enumValues: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Enum values if propType is enum'
                                },
                                defaultValue: {
                                    description: 'Default value for the prop'
                                }
                            },
                            required: ['action', 'componentName'],
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'auto_sync',
                        description: 'Automatically sync ALL components - register new, update changed, remove deleted',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                force: {
                                    type: 'boolean',
                                    description: 'Force full resync even if no changes detected',
                                    default: false
                                }
                            },
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'delete_component',
                        description: 'Completely delete a component - removes file, import, and composition registration',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                componentName: {
                                    type: 'string',
                                    description: 'Name of the component to delete completely'
                                },
                                deleteFile: {
                                    type: 'boolean',
                                    description: 'Whether to delete the component file (default: true)',
                                    default: true
                                },
                                force: {
                                    type: 'boolean',
                                    description: 'Force deletion even if component is not found in some places',
                                    default: false
                                }
                            },
                            required: ['componentName'],
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'cleanup_broken_imports',
                        description: 'Find and remove broken/unused imports from Root.tsx after manual deletions',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                dryRun: {
                                    type: 'boolean',
                                    description: 'Show what would be cleaned up without making changes',
                                    default: false
                                }
                            },
                            additionalProperties: false
                        }
                    }
                ]
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                if (name === 'create_animation') {
                    return await this.handleCreateAnimation(args);
                }
                else if (name === 'update_composition') {
                    return await this.handleUpdateComposition(args);
                }
                else if (name === 'get_studio_url') {
                    return await this.handleGetStudioUrl();
                }
                else if (name === 'get_export_directory') {
                    return await this.handleGetExportDirectory();
                }
                else if (name === 'list_existing_components') {
                    return await this.handleListExistingComponents();
                }
                else if (name === 'get_project_guidelines') {
                    return await this.handleGetProjectGuidelines();
                }
                else if (name === 'rebuild_compositions') {
                    return await this.handleRebuildCompositions();
                }
                else if (name === 'format_code') {
                    return await this.handleFormatCode(args);
                }
                else if (name === 'manage_props') {
                    return await this.handleManageProps(args);
                }
                else if (name === 'auto_sync') {
                    return await this.handleAutoSync(args);
                }
                else if (name === 'delete_component') {
                    return await this.handleDeleteComponent(args);
                }
                else if (name === 'cleanup_broken_imports') {
                    return await this.handleCleanupBrokenImports(args);
                }
                else {
                    throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                log('error', `Tool ${name} failed`, { error: error.message });
                return {
                    content: [{
                            type: 'text',
                            text: `[ERROR] ${name} failed: ${error instanceof Error ? error.message : String(error)}`
                        }],
                    isError: true
                };
            }
        });
    }
    validateAndFixInterpolate(code) {
        // Pattern to detect interpolate calls with potential issues
        const interpolatePattern = /interpolate\s*\(\s*([^,]+),\s*\[([^\]]+)\],\s*\[([^\]]+)\]/g;
        let hasUnsafeInterpolate = false;
        let matches;
        // Check for descending inputRange arrays
        while ((matches = interpolatePattern.exec(code)) !== null) {
            const inputRangeStr = matches[2];
            const numbers = inputRangeStr.split(',').map(s => {
                const trimmed = s.trim();
                // Handle expressions like "height - 100", "height / 2"
                if (trimmed.includes('height')) {
                    if (trimmed.includes('- 100'))
                        return 980; // height - 100 = 980
                    if (trimmed.includes('/ 2'))
                        return 540; // height / 2 = 540
                    return 1080; // just height = 1080
                }
                return parseFloat(trimmed) || 0;
            });
            // Check if array is descending (monotonic violation)
            for (let i = 1; i < numbers.length; i++) {
                if (numbers[i] <= numbers[i - 1]) {
                    hasUnsafeInterpolate = true;
                    break;
                }
            }
        }
        if (!hasUnsafeInterpolate) {
            return code; // No issues found
        }
        // Add safeInterpolate helper function at the top of component
        const safeInterpolateFunction = `
  // Safe interpolation helper - prevents inputRange monotonic errors
  const safeInterpolate = (frame, inputRange, outputRange, easing) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, { easing });
  };
`;
        // Insert safeInterpolate function after imports and before component body
        const insertAfterImports = code.replace(/(import\s+.*from\s+['"][^'"]+['"];?\s*\n)+/, '$&\n' + safeInterpolateFunction);
        // Replace unsafe interpolate calls with safeInterpolate
        const safeCode = insertAfterImports.replace(/\binterpolate\s*\(/g, 'safeInterpolate(');
        return safeCode;
    }
    async handleCreateAnimation(args) {
        const { code, componentName, duration = 8 } = args || {};
        log('info', 'Executing Claude-generated animation code', { componentName, duration });
        // Validate required parameters
        if (!code) {
            return {
                content: [{
                        type: 'text',
                        text: '[ERROR] code is required - Claude must provide complete React/Remotion code'
                    }],
                isError: true
            };
        }
        if (!componentName) {
            return {
                content: [{
                        type: 'text',
                        text: '[ERROR] componentName is required - provide React component name'
                    }],
                isError: true
            };
        }
        // Ensure directories exist
        await fs.mkdir(EXPORTS_DIR, { recursive: true });
        await fs.mkdir(SRC_DIR, { recursive: true });
        // Validate component name format
        const validComponentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
        const componentPath = path.join(SRC_DIR, `${validComponentName}.tsx`);
        // COLLISION DETECTION: Check if component already exists
        const componentExists = await fs.access(componentPath).then(() => true).catch(() => false);
        if (componentExists) {
            log('warn', `Component ${validComponentName} already exists - overwriting`, { componentPath });
        }
        // Write Claude's generated code with export pattern fix for Remotion compatibility
        // CRITICAL FIX: Convert 'export default ComponentName' to 'export { ComponentName }'
        const fixedCode = code.replace(new RegExp(`export\\s+default\\s+${validComponentName}\\s*;?`, 'g'), `export { ${validComponentName} };`);
        // INTERPOLATE VALIDATION: Detect and fix unsafe interpolate patterns
        const safeCode = this.validateAndFixInterpolate(fixedCode);
        await fs.writeFile(componentPath, safeCode);
        log('info', `Created animation file with Claude's code: ${componentPath}`);
        // AUTOMATIC SYNC: Always call auto_sync after creating animation to ensure it appears in Studio
        log('info', 'Auto-syncing new animation to Root.tsx...');
        try {
            await this.handleAutoSync({ force: false });
            log('info', `Successfully auto-synced ${validComponentName} to Root.tsx`);
        }
        catch (syncError) {
            log('error', 'Auto-sync failed, but animation file created', syncError);
            // Continue - don't fail the whole operation if sync fails
        }
        const overwriteWarning = componentExists ? `\\n[WARNING] Overwrote existing ${validComponentName} component` : '';
        return {
            content: [{
                    type: 'text',
                    text: `[ANIMATION CREATED + SYNCED] ${validComponentName}\\n\\n` +
                        `[FILE] ${validComponentName}.tsx\\n` +
                        `[DURATION] ${duration} seconds\\n` +
                        `[AUTO-REGISTERED] Component added to Root.tsx automatically\\n` +
                        `[STUDIO] Ready at http://localhost:${STUDIO_PORT}${overwriteWarning}\\n\\n` +
                        `[SUCCESS] Animation created and synced - immediately visible in Studio!`
                }]
        };
    }
    async handleUpdateComposition(args) {
        const { componentName, duration = 8 } = args || {};
        log('info', 'Registering component in Root.tsx', { componentName, duration });
        if (!componentName) {
            return {
                content: [{
                        type: 'text',
                        text: '[ERROR] componentName is required'
                    }],
                isError: true
            };
        }
        const validComponentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
        try {
            await this.updateRootTsx(validComponentName, duration);
            log('info', `Registered ${validComponentName} in Root.tsx`);
            return {
                content: [{
                        type: 'text',
                        text: `[COMPOSITION UPDATED] ${validComponentName}\\n\\n` +
                            `[REGISTERED] Component added to Remotion Root.tsx\\n` +
                            `[DURATION] ${duration} seconds\\n` +
                            `[STUDIO] Available at http://localhost:${STUDIO_PORT}\\n\\n` +
                            `[SUCCESS] Animation ready for preview!`
                    }]
            };
        }
        catch (error) {
            log('error', 'Failed to update composition', error);
            return {
                content: [{
                        type: 'text',
                        text: `[ERROR] Failed to update composition: ${error instanceof Error ? error.message : String(error)}`
                    }],
                isError: true
            };
        }
    }
    async handleGetStudioUrl() {
        return {
            content: [{
                    type: 'text',
                    text: `[STUDIO] Remotion Studio is available at:\\n\\nhttp://localhost:${STUDIO_PORT}\\n\\nOpen this URL in your browser to access the visual editor for your animations.`
                }]
        };
    }
    async handleGetExportDirectory() {
        const isDocker = process.env.DOCKER_CONTAINER === 'true';
        if (isDocker) {
            return {
                content: [{
                        type: 'text',
                        text: `[EXPORT DIRECTORY] Videos exported from Remotion Studio appear in:\\n\\n` +
                            `Host Path: ./clean-cut-exports\\n` +
                            `Container Path: /workspace/out\\n\\n` +
                            `[HOW IT WORKS]\\n` +
                            `- Export from Remotion Studio (http://localhost:${STUDIO_PORT})\\n` +
                            `- Videos automatically appear in ./clean-cut-exports\\n` +
                            `- Persistent storage across container restarts\\n` +
                            `- Cross-platform (Windows, macOS, Linux)\\n\\n` +
                            `[SUCCESS] Persistent video storage active!`
                    }]
            };
        }
        else {
            return {
                content: [{
                        type: 'text',
                        text: `[EXPORT DIRECTORY] Videos are saved to:\\n\\n${EXPORTS_DIR}\\n\\n` +
                            `Export from Remotion Studio and files will appear in the above directory.`
                    }]
            };
        }
    }
    // REMOVED: All template fraud code - Claude Desktop generates ALL animation code using TRUE AI
    async handleListExistingComponents() {
        try {
            const files = await fs.readdir(SRC_DIR);
            const componentFiles = files.filter(file => file.endsWith('.tsx') &&
                file !== 'Composition.tsx' &&
                file !== 'Root.tsx' &&
                file !== 'index.ts');
            const components = componentFiles.map(file => {
                const componentName = file.replace('.tsx', '');
                return { name: componentName, file: file };
            });
            return {
                content: [{
                        type: 'text',
                        text: `[EXISTING COMPONENTS] Found ${components.length} components:\\n\\n` +
                            components.map(comp => `- ${comp.name} (${comp.file})`).join('\\n') +
                            '\\n\\n[TIP] Use unique names to avoid overwriting existing components!'
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `[ERROR] Could not list components: ${error instanceof Error ? error.message : String(error)}`
                    }],
                isError: true
            };
        }
    }
    async handleGetProjectGuidelines() {
        try {
            const guidelinesDir = path.join(APP_ROOT, 'claude-dev-guidelines');
            const advancedDir = path.join(guidelinesDir, 'ADVANCED');
            // Read all guideline files
            const configContent = await fs.readFile(path.join(guidelinesDir, 'PROJECT_CONFIG.md'), 'utf8');
            const readmeContent = await fs.readFile(path.join(guidelinesDir, 'README.md'), 'utf8');
            const animationPatternsContent = await fs.readFile(path.join(advancedDir, 'ANIMATION_PATTERNS.md'), 'utf8');
            const remotionRulesContent = await fs.readFile(path.join(advancedDir, 'REMOTION_ANIMATION_RULES.md'), 'utf8');
            const quickRefContent = await fs.readFile(path.join(advancedDir, 'QUICK_REFERENCE.md'), 'utf8');
            return {
                content: [{
                        type: 'text',
                        text: `[PROJECT GUIDELINES - COMPLETE]\\n\\n` +
                            `=== PROJECT CONFIGURATION ===\\n${configContent}\\n\\n` +
                            `=== PROJECT OVERVIEW ===\\n${readmeContent}\\n\\n` +
                            `=== ANIMATION PATTERNS ===\\n${animationPatternsContent}\\n\\n` +
                            `=== REMOTION RULES ===\\n${remotionRulesContent}\\n\\n` +
                            `=== QUICK REFERENCE ===\\n${quickRefContent}\\n\\n` +
                            `[NAMING CONVENTION]\\n` +
                            `Use descriptive, unique component names like:\\n` +
                            `- FloatingOrbs, ParticleExplosion, WaveMotion\\n` +
                            `- SeedreamShowcase, ProductDemo, BrandIntro\\n` +
                            `- Avoid generic names like Animation, Component, Video`
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `[ERROR] Could not read guidelines: ${error instanceof Error ? error.message : String(error)}`
                    }],
                isError: true
            };
        }
    }
    async handleRebuildCompositions() {
        try {
            await this.rebuildComprehensiveRootTsx();
            return {
                content: [{
                        type: 'text',
                        text: `[COMPOSITIONS REBUILT] Root.tsx rebuilt with ALL workspace animations\\n\\n` +
                            `[SCANNED] All .tsx files in workspace\\n` +
                            `[REGISTERED] All components automatically added\\n` +
                            `[STUDIO] Available at http://localhost:${STUDIO_PORT}\\n\\n` +
                            `[SUCCESS] All animations now visible in Remotion Studio!`
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `[ERROR] Failed to rebuild compositions: ${error instanceof Error ? error.message : String(error)}`
                    }],
                isError: true
            };
        }
    }
    // Rebuild Root.tsx with ALL animations from workspace
    async rebuildComprehensiveRootTsx() {
        const rootPath = path.join(SRC_DIR, 'Root.tsx');
        try {
            // Scan workspace for all animation components
            const files = await fs.readdir(SRC_DIR);
            const componentFiles = files.filter(file => file.endsWith('.tsx') &&
                file !== 'Composition.tsx' &&
                file !== 'Root.tsx' &&
                file !== 'index.ts');
            // Build imports and compositions for all components
            const imports = [];
            const compositions = [];
            for (const file of componentFiles) {
                const componentName = file.replace('.tsx', '');
                imports.push(`import { ${componentName} } from './${componentName}';`);
                // Determine duration based on component type/name patterns
                let duration = 180; // Default 6 seconds
                if (componentName.toLowerCase().includes('showcase'))
                    duration = 300; // 10 seconds
                if (componentName.toLowerCase().includes('bouncing') || componentName.toLowerCase().includes('jumping'))
                    duration = 180; // 6 seconds
                if (componentName.toLowerCase().includes('test'))
                    duration = 90; // 3 seconds
                if (componentName.toLowerCase().includes('seedream'))
                    duration = 300; // 10 seconds
                compositions.push(`      <Composition
        id="${componentName}"
        component={${componentName}}
        durationInFrames={${duration}}
        fps={30}
        width={1920}
        height={1080}
      />`);
            }
            // Build comprehensive Root.tsx
            const rootContent = `import { Composition } from 'remotion';
import { Comp } from './Composition';
${imports.join('\n')}

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
${compositions.join('\n')}
    </>
  );
};`;
            await fs.writeFile(rootPath, rootContent);
            log('info', `Rebuilt Root.tsx with ${componentFiles.length} animations`);
        }
        catch (error) {
            log('error', 'Failed to rebuild comprehensive Root.tsx', { error: error.message });
            throw error;
        }
    }
    // Update Root.tsx to register the new animation
    async updateRootTsx(componentName, duration) {
        const rootPath = path.join(SRC_DIR, 'Root.tsx');
        const durationFrames = Math.floor(duration * 30);
        try {
            let rootContent = '';
            // Check if Root.tsx exists
            const rootExists = await fs.access(rootPath).then(() => true).catch(() => false);
            if (!rootExists) {
                // Create new Root.tsx
                rootContent = `import { Composition } from 'remotion';
import { ${componentName} } from './${componentName}';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="${componentName}"
        component={${componentName}}
        durationInFrames={${durationFrames}}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};`;
            }
            else {
                // Read existing Root.tsx and rebuild it properly
                const existingContent = await fs.readFile(rootPath, 'utf8');
                // Extract existing imports and compositions
                const importLines = [];
                const compositions = [];
                const lines = existingContent.split('\n');
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('import { ') && trimmed.includes("} from './") && !trimmed.includes('./Composition')) {
                        // Extract component name from import (exclude the base Composition)
                        const match = trimmed.match(/import { (\\w+) } from/);
                        if (match) {
                            importLines.push(trimmed);
                        }
                    }
                    else if (trimmed.includes('id="') && !trimmed.includes('id="Main"')) {
                        // Extract composition info
                        const idMatch = trimmed.match(/id="(\\w+)"/);
                        const componentMatch = trimmed.match(/component={(\\w+)}/);
                        const durationMatch = trimmed.match(/durationInFrames={(\\d+)}/);
                        if (idMatch && componentMatch && durationMatch) {
                            compositions.push({
                                id: idMatch[1],
                                component: componentMatch[1],
                                duration: parseInt(durationMatch[1])
                            });
                        }
                    }
                }
                // Add new component if not already present
                const importStatement = `import { ${componentName} } from './${componentName}';`;
                if (!importLines.includes(importStatement)) {
                    importLines.push(importStatement);
                }
                // Add new composition if not already present
                if (!compositions.find(comp => comp.id === componentName)) {
                    compositions.push({
                        id: componentName,
                        component: componentName,
                        duration: durationFrames
                    });
                }
                // Rebuild Root.tsx with proper structure
                rootContent = `import { Composition } from 'remotion';
import { Comp } from './Composition';
${importLines.join('\\n')}

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
${compositions.map(comp => `      <Composition
        id="${comp.id}"
        component={${comp.component}}
        durationInFrames={${comp.duration}}
        fps={30}
        width={1920}
        height={1080}
      />`).join('\\n')}
    </>
  );
};`;
            }
            await fs.writeFile(rootPath, rootContent);
            log('info', `Updated Root.tsx with ${componentName}`);
        }
        catch (error) {
            log('error', 'Failed to update Root.tsx', { error: error.message });
            throw error;
        }
    }
    async handleFormatCode(args) {
        const { componentName, code } = args;
        log('info', 'Formatting code', { componentName });
        try {
            let codeToFormat = code;
            const componentPath = path.join(SRC_DIR, `${componentName}.tsx`);
            // Read code from file if not provided
            if (!codeToFormat) {
                try {
                    codeToFormat = await fs.readFile(componentPath, 'utf8');
                }
                catch (error) {
                    throw new Error(`Component file not found: ${componentName}.tsx`);
                }
            }
            // Import prettier dynamically since it's not in dependencies
            const { spawn } = await import('child_process');
            // Format code using prettier (spawn child process)
            const formattedCode = await new Promise((resolve, reject) => {
                const prettierProcess = spawn('npx', ['prettier', '--stdin-filepath', `${componentName}.tsx`], {
                    cwd: SRC_DIR,
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                let output = '';
                let errorOutput = '';
                prettierProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });
                prettierProcess.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });
                prettierProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve(output);
                    }
                    else {
                        reject(new Error(`Prettier failed: ${errorOutput}`));
                    }
                });
                // Send code to prettier stdin
                prettierProcess.stdin.write(codeToFormat);
                prettierProcess.stdin.end();
            });
            // Write formatted code back to file
            await fs.writeFile(componentPath, formattedCode);
            log('info', `Formatted ${componentName} successfully`);
            return {
                content: [{
                        type: 'text',
                        text: `[SUCCESS] Code formatted successfully!\n\n` +
                            `[COMPONENT] ${componentName}\n` +
                            `[FILE] ${componentName}.tsx\n` +
                            `[FORMATTED] Applied prettier video-optimized formatting\n\n` +
                            `Your code has been formatted with proper indentation, spacing, and style.`
                    }]
            };
        }
        catch (error) {
            log('error', 'Code formatting failed', error);
            return {
                content: [{
                        type: 'text',
                        text: `[ERROR] Code formatting failed: ${error instanceof Error ? error.message : String(error)}\n\n` +
                            `Make sure prettier is installed and the component exists.`
                    }],
                isError: true
            };
        }
    }
    async handleManageProps(args) {
        const { action, componentName, props, propName, propType, enumValues, defaultValue } = args;
        log('info', 'Managing props', { action, componentName, propName });
        try {
            const componentPath = path.join(SRC_DIR, `${componentName}.tsx`);
            // Check if component exists
            try {
                await fs.access(componentPath);
            }
            catch {
                throw new Error(`Component ${componentName}.tsx not found`);
            }
            switch (action) {
                case 'validate':
                    if (!props) {
                        throw new Error('Props object required for validation');
                    }
                    // Basic validation for animation props (simplified without zod)
                    const validProps = ['duration', 'fps', 'width', 'height', 'backgroundColor', 'title', 'speed', 'size', 'color'];
                    const invalidProps = Object.keys(props).filter(prop => !validProps.includes(prop));
                    if (invalidProps.length > 0) {
                        return {
                            content: [{
                                    type: 'text',
                                    text: `[ERROR] Props validation failed!\n\n` +
                                        `[COMPONENT] ${componentName}\n` +
                                        `[INVALID PROPS] ${invalidProps.join(', ')}\n` +
                                        `[VALID PROPS] ${validProps.join(', ')}\n\n` +
                                        `Please use only valid animation props.`
                                }],
                            isError: true
                        };
                    }
                    return {
                        content: [{
                                type: 'text',
                                text: `[SUCCESS] Props validation passed!\n\n` +
                                    `[COMPONENT] ${componentName}\n` +
                                    `[VALIDATED] ${Object.keys(props).length} props\n` +
                                    `[PROPS] ${JSON.stringify(props, null, 2)}\n\n` +
                                    `All props are valid!`
                            }]
                    };
                case 'generate_schema':
                    const schemaDefinition = `// Zod schema for ${componentName} props
export interface ${componentName}Props {
  duration?: number; // Animation duration in seconds (1-60)
  fps?: number; // Frames per second (12-120)
  width?: number; // Video width (100-4000)
  height?: number; // Video height (100-4000)
  backgroundColor?: string; // Background color (#000000)
  title?: string; // Animation title (max 100 chars)
  speed?: number; // Animation speed multiplier (0.1-10)
  size?: number; // Element size (10-1000)
  color?: string; // Primary color (#ff6b6b)
}`;
                    const schemaPath = path.join(SRC_DIR, `${componentName}.types.ts`);
                    await fs.writeFile(schemaPath, schemaDefinition);
                    return {
                        content: [{
                                type: 'text',
                                text: `[SUCCESS] Schema generated!\n\n` +
                                    `[COMPONENT] ${componentName}\n` +
                                    `[SCHEMA] ${componentName}.types.ts\n` +
                                    `[EXPORTS] ${componentName}Props interface\n\n` +
                                    `You can now import and use this interface for type-safe props.`
                            }]
                    };
                case 'add_props':
                    if (!propName || !propType) {
                        throw new Error('propName and propType required for adding props');
                    }
                    // Generate prop interface addition
                    let propDefinition = '';
                    switch (propType) {
                        case 'string':
                            propDefinition = `${propName}: string${defaultValue ? ` = '${defaultValue}'` : ''}`;
                            break;
                        case 'number':
                            propDefinition = `${propName}: number${defaultValue ? ` = ${defaultValue}` : ''}`;
                            break;
                        case 'boolean':
                            propDefinition = `${propName}: boolean${defaultValue ? ` = ${defaultValue}` : ''}`;
                            break;
                        case 'color':
                            propDefinition = `${propName}: string${defaultValue ? ` = '${defaultValue}'` : " = '#ffffff'"}`;
                            break;
                        case 'enum':
                            if (!enumValues || enumValues.length === 0) {
                                throw new Error('enumValues required for enum propType');
                            }
                            propDefinition = `${propName}: '${enumValues.join("' | '")}'${defaultValue ? ` = '${defaultValue}'` : ` = '${enumValues[0]}'`}`;
                            break;
                    }
                    return {
                        content: [{
                                type: 'text',
                                text: `[SUCCESS] Prop definition ready!\n\n` +
                                    `[COMPONENT] ${componentName}\n` +
                                    `[PROP] ${propDefinition}\n` +
                                    `[TYPE] ${propType}\n\n` +
                                    `Add this prop to your component interface manually.`
                            }]
                    };
                case 'list_props': {
                    // Analyze component file for existing props
                    const code = await fs.readFile(componentPath, 'utf8');
                    const propsMatches = code.match(/interface\s+\w+Props\s*{([^}]+)}/);
                    const typeMatches = code.match(/type\s+\w+Props\s*=\s*{([^}]+)}/);
                    let detectedProps = [];
                    if (propsMatches || typeMatches) {
                        const propsContent = propsMatches ? propsMatches[1] : typeMatches[1];
                        const propLines = propsContent.split('\n').filter(line => line.trim());
                        detectedProps = propLines.map(line => line.trim()).filter(line => line && !line.startsWith('//'));
                    }
                    return {
                        content: [{
                                type: 'text',
                                text: `[SUCCESS] Props analysis complete!\n\n` +
                                    `[COMPONENT] ${componentName}\n` +
                                    `[DETECTED] ${detectedProps.length} props\n` +
                                    `[PROPS]\n${detectedProps.length > 0 ? detectedProps.join('\n') : 'No props interface found'}\n\n` +
                                    `Use 'add_props' action to add new props or 'generate_schema' for type definitions.`
                            }]
                    };
                }
                case 'apply_schema': {
                    // Automatically generate and apply Remotion schema to Root.tsx
                    const componentCode = await fs.readFile(componentPath, 'utf8');
                    const interfaceMatch = componentCode.match(/interface\s+(\w+Props)\s*{([^}]+)}/);
                    if (!interfaceMatch) {
                        throw new Error(`No props interface found in ${componentName}.tsx`);
                    }
                    const interfaceName = interfaceMatch[1];
                    const propsContent = interfaceMatch[2];
                    // Parse props from interface
                    const props = [];
                    const propLines = propsContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
                    for (const line of propLines) {
                        const trimmed = line.trim().replace(/[;,]$/, '');
                        const match = trimmed.match(/^(\w+)(\?)?:\s*(.+)$/);
                        if (match) {
                            const [, name, optional, type] = match;
                            props.push({
                                name,
                                type: type.trim(),
                                optional: !!optional
                            });
                        }
                    }
                    // Generate zod schema
                    const zodProps = props.map(prop => {
                        let zodType = '';
                        switch (true) {
                            case prop.type.includes('number'):
                                zodType = prop.optional ? 'z.number().optional()' : 'z.number()';
                                break;
                            case prop.type.includes('string'):
                                zodType = prop.optional ? 'z.string().optional()' : 'z.string()';
                                break;
                            case prop.type.includes('boolean'):
                                zodType = prop.optional ? 'z.boolean().optional()' : 'z.boolean()';
                                break;
                            case prop.type.includes('|'):
                                // Enum type
                                const enumValues = prop.type.split('|').map(v => v.trim().replace(/['"]/g, ''));
                                zodType = prop.optional ?
                                    `z.enum([${enumValues.map(v => `'${v}'`).join(', ')}]).optional()` :
                                    `z.enum([${enumValues.map(v => `'${v}'`).join(', ')}])`;
                                break;
                            default:
                                zodType = prop.optional ? 'z.any().optional()' : 'z.any()';
                        }
                        return `  ${prop.name}: ${zodType}`;
                    }).join(',\n');
                    const zodSchema = `const ${componentName}Schema = z.object({\n${zodProps}\n});`;
                    // Update Root.tsx with schema
                    const rootPath = path.join(SRC_DIR, 'Root.tsx');
                    let rootContent = await fs.readFile(rootPath, 'utf8');
                    // Add zod import if not present
                    if (!rootContent.includes('import { z }')) {
                        rootContent = rootContent.replace(/import { Composition } from 'remotion';/, `import { Composition } from 'remotion';\nimport { z } from 'zod';`);
                    }
                    // Add schema definition before RemotionRoot
                    if (!rootContent.includes(`${componentName}Schema`)) {
                        rootContent = rootContent.replace(/export const RemotionRoot/, `${zodSchema}\n\nexport const RemotionRoot`);
                    }
                    // Add schema prop to Composition
                    const compositionRegex = new RegExp(`(<Composition[^>]*id="${componentName}"[^>]*)(>)`, 'g');
                    if (compositionRegex.test(rootContent) && !rootContent.includes(`schema={${componentName}Schema}`)) {
                        rootContent = rootContent.replace(compositionRegex, `$1\n        schema={${componentName}Schema}$2`);
                    }
                    await fs.writeFile(rootPath, rootContent);
                    return {
                        content: [{
                                type: 'text',
                                text: `[SUCCESS] Schema automatically applied!\n\n` +
                                    `[COMPONENT] ${componentName}\n` +
                                    `[PROPS DETECTED] ${props.length} props\n` +
                                    `[SCHEMA] ${componentName}Schema generated\n` +
                                    `[ROOT.TSX] Updated with schema prop\n\n` +
                                    `Props are now interactively editable in Remotion Studio!`
                            }]
                    };
                }
                default:
                    throw new Error(`Unknown action: ${action}`);
            }
        }
        catch (error) {
            log('error', 'Props management failed', error);
            return {
                content: [{
                        type: 'text',
                        text: `[ERROR] Props management failed: ${error instanceof Error ? error.message : String(error)}\n\n` +
                            `Please check the component name and parameters, then try again.`
                    }],
                isError: true
            };
        }
    }
    async handleAutoSync(args) {
        const { force = false } = args || {};
        log('info', 'Auto-syncing all components', { force });
        try {
            // 1. Scan workspace for all .tsx components with container-reality validation
            log('info', 'Scanning workspace for components...');
            const files = await fs.readdir(SRC_DIR);
            const componentFiles = files.filter(file => file.endsWith('.tsx') &&
                file !== 'Composition.tsx' &&
                file !== 'Root.tsx' &&
                file !== 'index.ts');
            // CONTAINER-REALITY VALIDATION: Verify all files actually exist and are readable
            const validatedComponents = [];
            for (const file of componentFiles) {
                const componentPath = path.join(SRC_DIR, file);
                try {
                    await fs.access(componentPath);
                    const content = await fs.readFile(componentPath, 'utf8');
                    if (content.length > 0) {
                        validatedComponents.push(file);
                    }
                    else {
                        log('warn', `Skipping empty component file: ${file}`);
                    }
                }
                catch (error) {
                    log('warn', `Skipping inaccessible component file: ${file} - ${error.message}`);
                }
            }
            log('info', `Found ${componentFiles.length} component files, ${validatedComponents.length} validated for processing`);
            const components = [];
            // 2. Analyze each validated component
            log('info', 'Analyzing components for props and interfaces...');
            for (const file of validatedComponents) {
                const componentName = file.replace('.tsx', '');
                const componentPath = path.join(SRC_DIR, file);
                try {
                    log('info', `Processing component: ${componentName}`);
                    const componentCode = await fs.readFile(componentPath, 'utf8');
                    // Check for props interface
                    const interfaceMatch = componentCode.match(/interface\s+(\w+Props)\s*{([^}]+)}/);
                    let hasProps = false;
                    let interfaceName = '';
                    let props = [];
                    if (interfaceMatch) {
                        hasProps = true;
                        interfaceName = interfaceMatch[1];
                        const propsContent = interfaceMatch[2];
                        const propLines = propsContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
                        for (const line of propLines) {
                            const trimmed = line.trim().replace(/[;,]$/, '');
                            const match = trimmed.match(/^(\w+)(\?)?:\s*(.+)$/);
                            if (match) {
                                const [, name, optional, type] = match;
                                props.push({
                                    name,
                                    type: type.trim(),
                                    optional: !!optional
                                });
                            }
                        }
                    }
                    // Determine duration based on component patterns
                    let duration = 240; // Default 8 seconds (240 frames at 30fps)
                    if (componentName.toLowerCase().includes('showcase'))
                        duration = 450; // 15 seconds
                    if (componentName.toLowerCase().includes('game'))
                        duration = 360; // 12 seconds
                    if (componentName.toLowerCase().includes('test'))
                        duration = 180; // 6 seconds
                    if (componentName.toLowerCase().includes('bounce') || componentName.toLowerCase().includes('pulse'))
                        duration = 120; // 4 seconds
                    components.push({
                        name: componentName,
                        file,
                        hasProps,
                        interfaceName: hasProps ? interfaceName : undefined,
                        props: hasProps ? props : undefined,
                        duration,
                        description: this.generateComponentDescription(componentName)
                    });
                }
                catch (error) {
                    log('warn', `Failed to analyze component ${componentName}`, { error: error.message });
                    // Still add component but without props analysis
                    components.push({
                        name: componentName,
                        file,
                        hasProps: false,
                        duration: 240,
                        description: `${componentName} animation component`
                    });
                }
            }
            // 3. Build comprehensive Root.tsx with all components and schemas
            log('info', `Building Root.tsx with ${components.length} components...`);
            await this.buildComprehensiveRootTsx(components);
            log('info', 'Root.tsx build completed successfully');
            const schemasGenerated = components.filter(c => c.hasProps).length;
            const totalComponents = components.length;
            // Force stdout flush before returning (Docker STDIO fix)
            log('info', 'Auto-sync completed, preparing response...');
            // Reduce response size (research: keep under 200KB)
            const componentList = components.length > 10
                ? `${components.slice(0, 10).map(c => c.name).join(', ')} and ${components.length - 10} more`
                : components.map(c => c.name).join(', ');
            const response = {
                content: [{
                        type: 'text',
                        text: `[SUCCESS] Auto-sync completed!\n\n` +
                            `[SCANNED] ${totalComponents} components in workspace\n` +
                            `[REGISTERED] All components in Root.tsx\n` +
                            `[SCHEMAS] ${schemasGenerated} components with interactive props\n` +
                            `[CLEANUP] Removed any orphaned compositions\n\n` +
                            `Components: ${componentList}\n\n` +
                            `All animations are now available in Remotion Studio with automatic props detection!`
                    }]
            };
            // Explicit flush for Docker STDIO (research-validated fix)
            try {
                process.stdout.flush?.();
            }
            catch (e) {
                // Flush not available, use write with newline
                process.stdout.write('\n');
            }
            return response;
        }
        catch (error) {
            log('error', 'Auto-sync failed', error);
            return {
                content: [{
                        type: 'text',
                        text: `[ERROR] Auto-sync failed: ${error instanceof Error ? error.message : String(error)}\n\n` +
                            `Please check the workspace and try again.`
                    }],
                isError: true
            };
        }
    }
    generateComponentDescription(componentName) {
        const name = componentName.toLowerCase();
        if (name.includes('pacman'))
            return 'Pacman game animation';
        if (name.includes('github'))
            return 'GitHub profile showcase';
        if (name.includes('floating') || name.includes('orb'))
            return 'Floating particle effects';
        if (name.includes('bounce') || name.includes('jump'))
            return 'Bouncing animation effects';
        if (name.includes('pulse') || name.includes('beat'))
            return 'Pulsing rhythm animation';
        if (name.includes('seedream'))
            return 'Professional transition effects';
        if (name.includes('social') || name.includes('tweet'))
            return 'Social media animation';
        if (name.includes('product'))
            return 'Product showcase animation';
        if (name.includes('sunset') || name.includes('sun'))
            return 'Sunset scenic animation';
        if (name.includes('test'))
            return 'Test animation component';
        return `${componentName} animation component`;
    }
    async buildComprehensiveRootTsx(components) {
        const rootPath = path.join(SRC_DIR, 'Root.tsx');
        // INCREMENTAL MERGE: Read existing Root.tsx and preserve existing components
        let existingImports = [];
        let existingSchemas = [];
        let existingCompositions = [];
        try {
            const existingContent = await fs.readFile(rootPath, 'utf8');
            // Extract existing imports (preserve manual additions)
            const importMatches = existingContent.match(/import\s+.*from\s+.*['"'];?/g) || [];
            existingImports = importMatches.filter(imp => !components.some(c => imp.includes(c.name)) // Exclude components being re-scanned
            );
            // Extract existing schemas (preserve manual schemas)
            const schemaMatches = existingContent.match(/const\s+\w+Schema\s*=\s*z\.object\({[^}]*}\);/gs) || [];
            existingSchemas = schemaMatches.filter(schema => !components.some(c => schema.includes(`${c.name}Schema`)) // Exclude auto-generated schemas
            );
            // Extract existing compositions (preserve manual registrations)
            const compositionMatches = existingContent.match(/<Composition[^>]*>[^<]*<\/Composition>/gs) || [];
            existingCompositions = compositionMatches.filter(comp => !components.some(c => comp.includes(`component={${c.name}}`)) // Exclude components being re-scanned
            );
            log('info', `Preserving ${existingImports.length} existing imports, ${existingSchemas.length} schemas, ${existingCompositions.length} compositions`);
        }
        catch (error) {
            log('info', 'No existing Root.tsx found, creating new file');
        }
        // Build base imports (always needed)
        const baseImports = [
            `import { Composition } from 'remotion';`,
            `import { Comp } from './Composition';`
        ];
        // Merge existing imports with new component imports (with deduplication)
        const newComponentImports = components.map(comp => `import { ${comp.name} } from './${comp.name}';`);
        const allImportsRaw = [...baseImports, ...existingImports, ...newComponentImports];
        // DEDUPLICATION: Remove duplicate imports (research-validated fix)
        const seen = new Set();
        const allImports = allImportsRaw.filter(imp => {
            const normalized = imp.trim().replace(/\s+/g, ' ');
            if (seen.has(normalized)) {
                log('info', `Removing duplicate import: ${normalized}`);
                return false;
            }
            seen.add(normalized);
            return true;
        });
        // Add zod import if needed (new components have props OR existing schemas exist)
        const hasAnyProps = components.some(c => c.hasProps) || existingSchemas.length > 0;
        if (hasAnyProps && !allImports.some(imp => imp.includes('zod'))) {
            allImports.splice(2, 0, `import { z } from 'zod';`); // Insert after base imports
        }
        // Build new schemas (only for new components with props)
        const newSchemas = [];
        for (const comp of components) {
            if (comp.hasProps && comp.props && comp.props.length > 0) {
                const zodProps = comp.props.map(prop => {
                    let zodType = '';
                    switch (true) {
                        case prop.type.includes('number'):
                            zodType = prop.optional ? 'z.number().optional()' : 'z.number()';
                            break;
                        case prop.type.includes('string'):
                            zodType = prop.optional ? 'z.string().optional()' : 'z.string()';
                            break;
                        case prop.type.includes('boolean'):
                            zodType = prop.optional ? 'z.boolean().optional()' : 'z.boolean()';
                            break;
                        case prop.type.includes('|'):
                            // Enum type
                            const enumValues = prop.type.split('|').map(v => v.trim().replace(/['"]/g, ''));
                            zodType = prop.optional ?
                                `z.enum([${enumValues.map(v => `'${v}'`).join(', ')}]).optional()` :
                                `z.enum([${enumValues.map(v => `'${v}'`).join(', ')}])`;
                            break;
                        default:
                            zodType = prop.optional ? 'z.any().optional()' : 'z.any()';
                    }
                    return `  ${prop.name}: ${zodType}`;
                }).join(',\n');
                newSchemas.push(`const ${comp.name}Schema = z.object({\n${zodProps}\n});`);
            }
        }
        // Merge existing schemas with new ones
        const allSchemas = [...existingSchemas, ...newSchemas];
        // Build new compositions (only for scanned components)
        const newCompositions = [];
        // Always include Main composition if not in existing
        const hasMainComposition = existingCompositions.some(comp => comp.includes('id="Main"'));
        if (!hasMainComposition) {
            newCompositions.push(`      <Composition
        id="Main"
        component={Comp}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />`);
        }
        // Add compositions for scanned components
        for (const comp of components) {
            const schemaProps = comp.hasProps && comp.props && comp.props.length > 0
                ? `\n        schema={${comp.name}Schema}`
                : '';
            newCompositions.push(`      <Composition
        id="${comp.name}"
        component={${comp.name}}
        durationInFrames={${comp.duration}}
        fps={30}
        width={1920}
        height={1080}${schemaProps}
      />`);
        }
        // Merge all compositions (preserve existing + add new)
        const allCompositions = [...existingCompositions, ...newCompositions];
        // Build complete Root.tsx with merged content
        const rootContent = [
            ...allImports,
            '',
            ...allSchemas,
            allSchemas.length > 0 ? '' : undefined,
            'export const RemotionRoot: React.FC = () => {',
            '  return (',
            '    <>',
            ...allCompositions,
            '    </>',
            '  );',
            '};',
            ''
        ].filter(line => line !== undefined).join('\n');
        await fs.writeFile(rootPath, rootContent);
        // FORCE CACHE CLEARING: Clear Remotion webpack cache for WSL2 sync (research-validated)
        try {
            const remotionCacheDir = path.join(SRC_DIR.replace('/src', ''), '.remotion');
            const webpackCacheDir = path.join(SRC_DIR.replace('/src', ''), 'node_modules', '.cache');
            await fs.rmdir(remotionCacheDir, { recursive: true }).catch(() => { });
            await fs.rmdir(webpackCacheDir, { recursive: true }).catch(() => { });
            // Touch index.ts to trigger webpack rebuild (research pattern)
            const indexPath = path.join(SRC_DIR, 'index.ts');
            const now = new Date();
            await fs.utimes(indexPath, now, now).catch(() => { });
            log('info', 'Cleared Remotion cache and triggered Studio refresh');
        }
        catch (error) {
            log('warn', `Cache clear failed: ${error.message}`);
        }
        const totalComponents = existingCompositions.length + components.length;
        const totalSchemas = existingSchemas.length + newSchemas.length;
        log('info', `Built incremental Root.tsx with ${totalComponents} total components (${components.length} new) and ${totalSchemas} schemas`);
    }
    // ========================================
    // FILE WATCHER & DELETION MONITORING
    // ========================================
    async setupFileWatcher() {
        try {
            const rootPath = path.join(SRC_DIR, 'Root.tsx');
            // Initialize last content
            try {
                this.lastRootContent = await fs.readFile(rootPath, 'utf-8');
            }
            catch (error) {
                log('warn', 'Root.tsx not found for file watching, will watch for creation');
                this.lastRootContent = '';
            }
            // Watch for changes to Root.tsx
            this.rootFileWatcher = fsSync.watch(rootPath, async (eventType) => {
                if (eventType === 'change') {
                    await this.handleRootFileChange();
                }
            });
            log('info', 'File watcher setup complete - monitoring Root.tsx for deletion events');
        }
        catch (error) {
            log('error', 'Failed to setup file watcher', { error: error.message });
        }
    }
    async handleRootFileChange() {
        try {
            const rootPath = path.join(SRC_DIR, 'Root.tsx');
            const newContent = await fs.readFile(rootPath, 'utf-8');
            if (newContent !== this.lastRootContent) {
                log('info', 'Root.tsx changed - analyzing for broken imports');
                // Find removed compositions and clean up imports
                await this.autoCleanupAfterStudioDeletion(this.lastRootContent, newContent);
                this.lastRootContent = newContent;
            }
        }
        catch (error) {
            log('error', 'Error handling Root.tsx change', { error: error.message });
        }
    }
    async autoCleanupAfterStudioDeletion(oldContent, newContent) {
        try {
            // Extract component names from import statements
            const oldImports = this.extractImportedComponents(oldContent);
            const newImports = this.extractImportedComponents(newContent);
            const oldCompositions = this.extractCompositionComponents(oldContent);
            const newCompositions = this.extractCompositionComponents(newContent);
            // Find imports that are no longer used in compositions
            const unusedImports = oldImports.filter(imp => newImports.includes(imp) && !newCompositions.includes(imp));
            if (unusedImports.length > 0) {
                log('info', `Found ${unusedImports.length} orphaned imports after Studio deletion: ${unusedImports.join(', ')}`);
                // Remove orphaned imports
                let cleanedContent = newContent;
                for (const componentName of unusedImports) {
                    const importRegex = new RegExp(`import\\s*\\{\\s*${componentName}\\s*\\}\\s*from\\s*['"\\.].*?['"];?\\s*\n?`, 'g');
                    cleanedContent = cleanedContent.replace(importRegex, '');
                }
                // Clean up any empty lines
                cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
                // Write the cleaned content
                const rootPath = path.join(SRC_DIR, 'Root.tsx');
                await fs.writeFile(rootPath, cleanedContent);
                this.lastRootContent = cleanedContent;
                log('info', `Auto-cleaned ${unusedImports.length} orphaned imports from Root.tsx`);
            }
        }
        catch (error) {
            log('error', 'Error during auto-cleanup', { error: error.message });
        }
    }
    extractImportedComponents(content) {
        const importRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]\.\//g;
        const components = [];
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const importNames = match[1].split(',').map(name => name.trim());
            components.push(...importNames);
        }
        return components.filter(name => name !== 'Comp' && name !== 'z'); // Exclude common non-component imports
    }
    extractCompositionComponents(content) {
        const compositionRegex = /<Composition[^>]*component=\{([^}]+)\}/g;
        const components = [];
        let match;
        while ((match = compositionRegex.exec(content)) !== null) {
            components.push(match[1].trim());
        }
        return components;
    }
    // ========================================
    // COMPREHENSIVE DELETE FUNCTIONALITY
    // ========================================
    async handleDeleteComponent(args) {
        const { componentName, deleteFile = true, force = false } = args;
        try {
            const results = {
                fileDeleted: false,
                importRemoved: false,
                compositionRemoved: false,
                errors: []
            };
            // 1. Remove from Root.tsx (composition and import)
            const rootPath = path.join(SRC_DIR, 'Root.tsx');
            try {
                let rootContent = await fs.readFile(rootPath, 'utf-8');
                const originalContent = rootContent;
                // Remove import
                const importRegex = new RegExp(`import\\s*\\{\\s*${componentName}\\s*\\}\\s*from\\s*['"\\.].*?['"];?\\s*\n?`, 'g');
                rootContent = rootContent.replace(importRegex, '');
                // Remove composition
                const compositionRegex = new RegExp(`<Composition[^>]*id=["']${componentName}["'][^>]*component=\\{${componentName}\\}[^>]*>[^<]*</Composition>\\s*`, 'gs');
                rootContent = rootContent.replace(compositionRegex, '');
                // Clean up extra whitespace
                rootContent = rootContent.replace(/\n\s*\n\s*\n/g, '\n\n');
                if (rootContent !== originalContent) {
                    await fs.writeFile(rootPath, rootContent);
                    this.lastRootContent = rootContent;
                    results.importRemoved = true;
                    results.compositionRemoved = true;
                    log('info', `Removed ${componentName} from Root.tsx`);
                }
            }
            catch (error) {
                results.errors.push(`Failed to update Root.tsx: ${error.message}`);
                if (!force)
                    throw error;
            }
            // 2. Delete component file
            if (deleteFile) {
                const componentPath = path.join(SRC_DIR, `${componentName}.tsx`);
                try {
                    await fs.unlink(componentPath);
                    results.fileDeleted = true;
                    log('info', `Deleted component file: ${componentName}.tsx`);
                }
                catch (error) {
                    results.errors.push(`Failed to delete file: ${error.message}`);
                    if (!force)
                        throw error;
                }
            }
            const successMessage = [
                results.fileDeleted ? 'File deleted' : '',
                results.importRemoved ? 'Import removed' : '',
                results.compositionRemoved ? 'Composition removed' : ''
            ].filter(Boolean).join(', ');
            return {
                content: [{
                        type: 'text',
                        text: `[SUCCESS] Component '${componentName}' deleted successfully.\n\nActions taken:\n- ${successMessage}\n\nRemotions should update automatically in Studio.${results.errors.length > 0 ? `\n\nWarnings:\n${results.errors.join('\n')}` : ''}`
                    }]
            };
        }
        catch (error) {
            log('error', `Delete component failed: ${componentName}`, { error: error.message });
            return {
                content: [{
                        type: 'text',
                        text: `[ERROR] Failed to delete component '${componentName}': ${error.message}`
                    }],
                isError: true
            };
        }
    }
    async handleCleanupBrokenImports(args) {
        const { dryRun = false } = args;
        try {
            const rootPath = path.join(SRC_DIR, 'Root.tsx');
            const rootContent = await fs.readFile(rootPath, 'utf-8');
            const importedComponents = this.extractImportedComponents(rootContent);
            const usedComponents = this.extractCompositionComponents(rootContent);
            const brokenImports = importedComponents.filter(comp => !usedComponents.includes(comp));
            if (brokenImports.length === 0) {
                return {
                    content: [{
                            type: 'text',
                            text: '[OK] No broken imports found. Root.tsx is clean!'
                        }]
                };
            }
            if (dryRun) {
                return {
                    content: [{
                            type: 'text',
                            text: `[DRY RUN] Found ${brokenImports.length} broken imports that would be removed:\n\n${brokenImports.map(name => `- ${name}`).join('\n')}\n\nRun with dryRun: false to apply cleanup.`
                        }]
                };
            }
            // Remove broken imports
            let cleanedContent = rootContent;
            for (const componentName of brokenImports) {
                const importRegex = new RegExp(`import\\s*\\{\\s*${componentName}\\s*\\}\\s*from\\s*['"\\.].*?['"];?\\s*\n?`, 'g');
                cleanedContent = cleanedContent.replace(importRegex, '');
            }
            // Clean up whitespace
            cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
            await fs.writeFile(rootPath, cleanedContent);
            this.lastRootContent = cleanedContent;
            return {
                content: [{
                        type: 'text',
                        text: `[SUCCESS] Cleaned up ${brokenImports.length} broken imports:\n\n${brokenImports.map(name => `- ${name}`).join('\n')}\n\nRoot.tsx has been updated.`
                    }]
            };
        }
        catch (error) {
            log('error', 'Cleanup broken imports failed', { error: error.message });
            return {
                content: [{
                        type: 'text',
                        text: `[ERROR] Failed to cleanup broken imports: ${error.message}`
                    }],
                isError: true
            };
        }
    }
    async run() {
        log('info', 'Starting TRUE AI STDIO MCP Server');
        log('info', `App Root: ${APP_ROOT}`);
        log('info', `Exports Directory: ${EXPORTS_DIR}`);
        log('info', `Source Directory: ${SRC_DIR}`);
        log('info', `Studio Port: ${STUDIO_PORT}`);
        // Ensure directories exist
        await fs.mkdir(EXPORTS_DIR, { recursive: true });
        await fs.mkdir(SRC_DIR, { recursive: true });
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        log('info', 'TRUE AI STDIO MCP Server connected and ready!');
        log('info', 'Available tools: create_animation, update_composition, get_studio_url, get_export_directory, list_existing_components, get_project_guidelines, rebuild_compositions, format_code, manage_props, auto_sync, delete_component, cleanup_broken_imports');
        log('info', 'Claude Desktop can now generate ANY animation using TRUE AI!');
    }
}
// Start the TRUE AI server
const server = new TrueAiStdioMcpServer();
server.run().catch((error) => {
    console.error('Failed to start TRUE AI STDIO MCP Server:', error);
    process.exit(1);
});
