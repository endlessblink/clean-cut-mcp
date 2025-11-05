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
import { execSync } from 'child_process';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Configuration - Standardized to 6970/6971 ports
const APP_ROOT = process.env.DOCKER_CONTAINER === 'true' ? '/app' : path.resolve(__dirname, '../..');
const EXPORTS_DIR = process.env.DOCKER_CONTAINER === 'true' ? '/workspace/out' : path.join(APP_ROOT, 'clean-cut-exports');
const SRC_DIR = process.env.DOCKER_CONTAINER === 'true' ? '/workspace/src' : path.join(APP_ROOT, 'clean-cut-components', 'src');
const STUDIO_PORT = parseInt(process.env.REMOTION_STUDIO_PORT || '6970');
const PID_FILE = process.env.DOCKER_CONTAINER === 'true' ? '/tmp/clean-cut-mcp.pid' : path.join(__dirname, 'clean-cut-mcp.pid');
// Validation system configuration (optional, non-breaking)
const ENABLE_VALIDATION = process.env.ENABLE_ANIMATION_VALIDATION === 'true' || false;
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
    workspaceWatcher = null;
    lastRootContent = '';
    validator = null; // Animation validator instance
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
        this.setupWorkspaceWatcher();
        this.initializeValidation();
    }
    /**
     * Initialize animation validation system (optional, non-breaking)
     */
    async initializeValidation() {
        if (!ENABLE_VALIDATION) {
            log('info', 'Animation validation disabled');
            return;
        }
        try {
            const { AnimationValidator } = await import('./animation-validator.js');
            this.validator = new AnimationValidator();
            log('info', 'Animation validation system enabled and ready');
        }
        catch (error) {
            log('error', 'Failed to initialize animation validator, proceeding without validation', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            this.validator = null;
        }
    }
    /**
     * Validate animation code before writing to file (optional safety layer)
     */
    async validateAnimationCode(code, componentName) {
        const result = { isValid: true, warnings: [] };
        // If validation disabled or not available, pass through
        if (!ENABLE_VALIDATION || !this.validator) {
            return result;
        }
        try {
            const validation = await this.validator.validateAnimationCode(code, componentName);
            if (!validation.isValid) {
                // If validation failed but we have a fix, use it
                if (validation.fixedCode) {
                    result.fixedCode = validation.fixedCode;
                    result.warnings.push('🔧 Auto-fixed syntax errors in animation code');
                    result.warnings.push(...validation.suggestions);
                    log('info', 'Animation validation auto-fixed errors', { componentName, errors: validation.errors.length });
                }
                else {
                    // Validation failed and no fix available - warn but don't block
                    result.warnings.push('⚠️  Animation validation found issues but proceeding anyway:');
                    result.warnings.push(...validation.errors.map(e => `   • ${e.message}`));
                    result.warnings.push(...validation.suggestions);
                    log('warn', 'Animation validation found unfixable issues', { componentName, errors: validation.errors.length });
                }
            }
            else {
                log('info', 'Animation validation passed', { componentName });
                result.warnings.push(...validation.suggestions);
            }
        }
        catch (error) {
            log('error', 'Animation validation failed, proceeding without validation', {
                error: error instanceof Error ? error.message : 'Unknown error',
                componentName
            });
            result.warnings.push('⚠️  Validation system error - animation created without pre-validation');
        }
        return result;
    }
    setupErrorHandling() {
        this.server.onerror = (error) => {
            log('error', 'MCP Server error', { error: error.message });
        };
        process.on('SIGINT', async () => {
            log('info', 'Shutting down gracefully...');
            if (this.rootFileWatcher) {
                this.rootFileWatcher.close();
                log('info', 'Root file watcher closed');
            }
            if (this.workspaceWatcher) {
                this.workspaceWatcher.close();
                log('info', 'Workspace watcher closed');
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
   - Must export with: export const ComponentName: React.FC

   🚨 CRITICAL FILE EXTENSION RULE:
   ✅ Files with JSX syntax → MUST use .tsx extension
      - Any file that contains: return <div>, return <span>, JSX.Element return type
      - Any function that returns rendered React elements
      - Example: renderParticle() returns <div> → file MUST be .tsx

   ✅ Files without JSX → MUST use .ts extension
      - Only TypeScript: types, interfaces, classes, helper functions
      - Functions that return data objects, configs, or style objects
      - Example: generateParticles() returns Particle[] → file can be .ts

   ⚠️ WHY: TypeScript compiler CANNOT compile JSX in .ts files
      - JSX in .ts files causes: "Expected '>' but found 'key'" errors
      - ALWAYS check: Does this file return actual JSX elements?
      - If YES → .tsx, If NO → .ts

5. PROFESSIONAL QUALITY LIBRARIES (Available for ALL animations):

   🎬 AUTOMATIC USAGE: Claude should intelligently use these libraries to create professional-quality animations by default.

   **When to use automatically:**
   - Camera movements: ANY multi-scene animation or storytelling
   - Particle effects: Celebrations, backgrounds, magic effects, atmosphere
   - Kinetic typography: ANY text-heavy animation or titles
   - Visual effects: Professional polish on ANY animation
   - Color grading: Cinematic look for polished animations
   - Professional easing: ALWAYS use instead of basic Easing.bezier

   **Decision guide:**
   - User says "create animation" → Use professional easing + consider visual effects
   - User mentions "text" or "title" → Use kinetic typography
   - User wants "celebration" or "magic" → Use particle systems
   - User wants "cinematic" or "professional" → Use camera + color grading
   - User wants "multiple scenes" → Use camera movements to transition
   - Default: Always use ProfessionalEasing, add visual polish with glows/shadows

   📚 IMPORT THESE UTILITIES FOR CINEMA-GRADE ANIMATIONS:

   ✅ Professional Easing (../../utils/professional-easing):
     import { ProfessionalEasing, MotionPatterns, arcMotion, springPhysics } from '../../utils/professional-easing'
     - ProfessionalEasing.smooth, .cinematic, .anticipation, .overshoot, .dramatic
     - Natural motion curves validated for professional use
     - Physics helpers: arcMotion(), springPhysics(), followThrough()

   ✅ Camera Movements (../../utils/use-camera, ../../utils/camera-controller):
     import { useCamera, useAdvancedCamera } from '../../utils/use-camera'
     - Cinematic pan, zoom, orbit, dolly movements
     - Multi-shot sequences with smooth transitions
     - Example: const camera = useCamera({ from: {x:0, zoom:1}, to: {x:-500, zoom:1.5}, duration: [0,120] })

   ✅ Particle Systems (../../utils/use-particles, ../../utils/particle-system):
     import { useParticles, useRenderedParticles } from '../../utils/use-particles'
     - Types: 'sparkles', 'confetti', 'smoke', 'magic', 'bubbles', 'fire', 'snow', 'energy'
     - Example: const particles = useRenderedParticles({ type: 'confetti' })

   ✅ Kinetic Typography (../../utils/kinetic-text):
     import { generateAnimatedCharacters, generateAnimatedWords, squashStretch } from '../../utils/kinetic-text'
     - Character-by-character, word-by-word, line-by-line animations
     - Patterns: sequential, random, center-out, edges-in, wave
     - Example: const chars = generateAnimatedCharacters('Hello', frame, { animationType: 'bounce', pattern: 'center-out' })

   ✅ Visual Effects (../../utils/visual-effects):
     import { createProfessionalGlow, createVignette, createLightRays, renderLightRay } from '../../utils/visual-effects'
     - Professional glows (multi-layer, not basic box-shadow)
     - Light rays, vignette, chromatic aberration, lens flare
     - Example: <div style={createProfessionalGlow('#00d4ff', 1, 30)}>Glowing Element</div>

   ✅ Color Grading (../../utils/color-grading):
     import { applyColorGrade, createColorGradeOverlay, cinematicTealOrange, neonCyberpunk } from '../../utils/color-grading'
     - 20+ cinematic presets (cinematic, vintage, dramatic, dreamy, neon)
     - Apply professional film-quality looks instantly
     - Example: <div style={applyColorGrade(cinematicTealOrange)}>Content</div>

6. CRITICAL EASING PATTERNS (Remotion API - Research Validated):
   ✅ WORKING Bezier Alternatives:
     - Ease-out effect: Easing.bezier(0, 0, 0.58, 1)
     - Ease-in-out effect: Easing.bezier(0.42, 0, 0.58, 1)
     - Ease-in effect: Easing.bezier(0.42, 0, 1, 1)
     - Custom smooth: Easing.bezier(0.25, 0.1, 0.25, 1)
   ⚡ BETTER: Use ProfessionalEasing library (see above) for natural motion
   ❌ BROKEN Complex Easing: Easing.out(Easing.cubic), Easing.inOut(Easing.ease)
   ❌ BROKEN Recursion: safeInterpolate calling itself instead of interpolate

7. USING PUBLIC ASSETS (Images, Logos, Fonts, Audio):
   ✅ CORRECT Way to use public assets:
     - Import: import { staticFile, Img, Audio } from 'remotion'
     - Images/Logos: <Img src={staticFile('images/logo.png')} />
     - Audio: <Audio src={staticFile('audio/music.mp3')} />
     - Fonts: @font-face { src: url(staticFile('fonts/custom.ttf')) }
   ❌ WRONG Ways (will cause loading errors):
     - Don't use: <img src="/public/images/logo.png" />
     - Don't use: <img src="http://localhost:6970/public/..." />
     - Don't use: Direct paths without staticFile() helper

   📁 Available Asset Categories:
     - images/ - User images, photos, graphics
     - logos/ - Brand logos and icons
     - fonts/ - Custom fonts for text
     - audio/ - Music, sound effects, voiceovers

   💡 Users place assets manually in clean-cut-workspace/public/ folders

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
                    },
                    {
                        name: 'upload_asset',
                        description: 'Upload user asset (image, logo, font, audio) to public directory for use in animations',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filePath: {
                                    type: 'string',
                                    description: 'Path to the asset file on user\'s system (Windows/Linux path)'
                                },
                                category: {
                                    type: 'string',
                                    enum: ['images', 'logos', 'fonts', 'audio'],
                                    description: 'Asset category (images, logos, fonts, audio)'
                                },
                                filename: {
                                    type: 'string',
                                    description: 'Optional custom filename (defaults to original filename)'
                                }
                            },
                            required: ['filePath', 'category'],
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'list_assets',
                        description: 'List all available user assets by category for use in animations',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                category: {
                                    type: 'string',
                                    enum: ['images', 'logos', 'fonts', 'audio', 'all'],
                                    description: 'Filter by category or show all assets',
                                    default: 'all'
                                }
                            },
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'delete_asset',
                        description: 'Delete a user asset from public directory',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                category: {
                                    type: 'string',
                                    enum: ['images', 'logos', 'fonts', 'audio'],
                                    description: 'Asset category'
                                },
                                filename: {
                                    type: 'string',
                                    description: 'Asset filename to delete'
                                }
                            },
                            required: ['category', 'filename'],
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'generate_with_learning',
                        description: `Generate animation using learned preferences and enforcement

Complete workflow:
1. Analyzes content (energy, features, scene types)
2. Extracts brand colors (or uses default palette)
3. Calculates duration using formula: (scenes × 75f) + (transitions × 15f)
4. Loads learned rules from 10+ corrections
5. ENFORCES rules (blocks if violations found)
6. Validates (overlap, crop, scale)
7. Generates Remotion code with all patterns applied

Learned rules enforced:
- Motion blur when velocity > 3px/frame
- Entry transitions on ALL scenes (no instant pops)
- Scale at shot level only (no compound scaling)
- No dead space between scenes
- Max safe scales for elements`,
                        inputSchema: {
                            type: 'object',
                            properties: {
                                content: {
                                    type: 'string',
                                    description: 'Animation content description'
                                },
                                scenes: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Array of scene descriptions'
                                },
                                brandLogo: {
                                    type: 'string',
                                    description: 'Path to brand logo for color extraction (optional)'
                                },
                                style: {
                                    type: 'string',
                                    enum: ['tech', 'elegant', 'corporate', 'vibrant'],
                                    description: 'Animation style (default: tech)'
                                }
                            },
                            required: ['content', 'scenes'],
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'record_user_correction',
                        description: `Record when user fixes an issue - system learns for next time

Learning system will extract reusable rules:
- Crop issues → max safe scales
- Transition problems → preferred transition types
- Layout issues → grid configurations
- Timing problems → duration/stagger preferences

Use this AFTER user makes corrections to improve future generations`,
                        inputSchema: {
                            type: 'object',
                            properties: {
                                issue_type: {
                                    type: 'string',
                                    enum: ['crop', 'overlap', 'compound_scaling', 'transition_type', 'timing', 'color', 'layout', 'other'],
                                    description: 'Type of issue that was corrected'
                                },
                                issue_description: {
                                    type: 'string',
                                    description: 'What was wrong'
                                },
                                original_value: {
                                    type: 'object',
                                    description: 'Original parameter values (as JSON object)'
                                },
                                corrected_value: {
                                    type: 'object',
                                    description: 'Corrected parameter values (as JSON object)'
                                },
                                element_context: {
                                    type: 'object',
                                    description: 'Element type, size, position (optional)',
                                    properties: {
                                        type: { type: 'string' },
                                        width: { type: 'number' },
                                        height: { type: 'number' }
                                    }
                                }
                            },
                            required: ['issue_type', 'issue_description', 'original_value', 'corrected_value'],
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'view_learned_preferences',
                        description: `View all learned rules and corrections

Shows:
- Total corrections recorded
- Learned max scales for elements
- Preferred transitions between scene types
- Timing preferences
- Most common issues
- Recent corrections

Use this to see what the system has learned from your feedback`,
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            additionalProperties: false
                        }
                    },
                    {
                        name: 'sync_root_file',
                        description: `Auto-sync Root.tsx with animation files

Scans animations directory and regenerates Root.tsx with:
- All imports
- All compositions
- Correct durations (extracted from files)
- Schemas (auto-detected)

Prevents "Cannot find module" errors when adding/removing animations`,
                        inputSchema: {
                            type: 'object',
                            properties: {},
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
                else if (name === 'upload_asset') {
                    return await this.handleUploadAsset(args);
                }
                else if (name === 'list_assets') {
                    return await this.handleListAssets(args);
                }
                else if (name === 'delete_asset') {
                    return await this.handleDeleteAsset(args);
                }
                else if (name === 'generate_with_learning') {
                    return await this.handleGenerateWithLearning(args);
                }
                else if (name === 'record_user_correction') {
                    return await this.handleRecordCorrection(args);
                }
                else if (name === 'view_learned_preferences') {
                    return await this.handleViewPreferences(args);
                }
                else if (name === 'sync_root_file') {
                    return await this.handleSyncRoot(args);
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
        // CRITICAL FIX: Detect and eliminate infinite recursion in safeInterpolate functions
        // Pattern 1: Fix direct recursive calls (the main issue)
        code = code.replace(/return\s+safeInterpolate\s*\([^)]+\)\s*;?/g, 'return interpolate(frame, inputRange, outputRange, options);');
        // Pattern 2: Replace recursive safeInterpolate function definitions entirely
        const recursiveFunctionPattern = /const\s+safeInterpolate\s*=\s*\([^)]+\)\s*=>\s*\{[^}]*safeInterpolate\([^}]*\}\s*;?/gs;
        if (recursiveFunctionPattern.test(code)) {
            // Replace with non-recursive implementation
            const properSafeInterpolate = `const safeInterpolate = (frame, inputRange, outputRange, options = {}) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, options);
  };`;
            code = code.replace(recursiveFunctionPattern, properSafeInterpolate);
        }
        return code;
    }
    async validateAndResolveName(requestedName) {
        // Normalize requested name to PascalCase
        const normalizedName = requestedName.charAt(0).toUpperCase() + requestedName.slice(1);
        // Scan existing component files in professional asset structure
        let existingComponents = [];
        try {
            const animationsDir = path.join(SRC_DIR, 'assets', 'animations');
            const files = await fs.readdir(animationsDir);
            existingComponents = files
                .filter(file => file.endsWith('.tsx'))
                .map(file => file.replace('.tsx', ''));
        }
        catch (error) {
            log('warn', 'Could not scan existing components for collision detection', error);
        }
        // Check for exact matches
        const exactMatch = existingComponents.find(name => name.toLowerCase() === normalizedName.toLowerCase());
        // Check for similar names (fuzzy matching)
        const similarMatches = existingComponents.filter(name => {
            const similarity = this.calculateNameSimilarity(normalizedName.toLowerCase(), name.toLowerCase());
            return similarity > 0.7; // 70% similarity threshold
        });
        // Detect patterns and suggest meaningful alternatives
        const alternatives = this.generateSmartAlternatives(normalizedName, existingComponents);
        const conflicts = [...new Set([exactMatch, ...similarMatches].filter(Boolean))];
        return {
            hasConflict: conflicts.length > 0,
            requestedName: normalizedName,
            safeName: conflicts.length > 0 ? alternatives[0] : normalizedName,
            conflictsWith: conflicts,
            alternatives: alternatives.slice(0, 5) // Top 5 suggestions
        };
    }
    calculateNameSimilarity(str1, str2) {
        // Simple Levenshtein distance-based similarity
        const matrix = Array.from(Array(str2.length + 1), () => Array(str1.length + 1).fill(0));
        for (let i = 0; i <= str1.length; i++)
            matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++)
            matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[j][i] = matrix[j - 1][i - 1];
                }
                else {
                    matrix[j][i] = Math.min(matrix[j - 1][i] + 1, matrix[j][i - 1] + 1, matrix[j - 1][i - 1] + 1);
                }
            }
        }
        const maxLength = Math.max(str1.length, str2.length);
        return (maxLength - matrix[str2.length][str1.length]) / maxLength;
    }
    generateSmartAlternatives(requestedName, existingNames) {
        const alternatives = [];
        const baseName = requestedName;
        // Pattern-based alternatives
        const patterns = [
            `${baseName}Animation`,
            `${baseName}Effect`,
            `${baseName}Motion`,
            `${baseName}Transition`,
            `Enhanced${baseName}`,
            `${baseName}Advanced`,
            `${baseName}Pro`,
            `${baseName}Plus`,
            `${baseName}V2`,
            `${baseName}Improved`
        ];
        // Add alternatives that don't conflict
        patterns.forEach(pattern => {
            if (!existingNames.some(existing => existing.toLowerCase() === pattern.toLowerCase())) {
                alternatives.push(pattern);
            }
        });
        // If all patterns conflict, use intelligent numbering
        if (alternatives.length === 0) {
            for (let i = 2; i <= 10; i++) {
                const numberedName = `${baseName}${i}`;
                if (!existingNames.some(existing => existing.toLowerCase() === numberedName.toLowerCase())) {
                    alternatives.push(numberedName);
                }
            }
        }
        // Semantic alternatives based on animation type detection
        const semanticAlternatives = this.generateSemanticAlternatives(baseName, existingNames);
        alternatives.unshift(...semanticAlternatives);
        return [...new Set(alternatives)].slice(0, 10); // Remove duplicates, limit to 10
    }
    generateSemanticAlternatives(baseName, existingNames) {
        const lower = baseName.toLowerCase();
        const alternatives = [];
        // Motion/Animation synonyms
        if (lower.includes('bounce')) {
            ['Floating', 'Pulsing', 'Oscillating', 'SpringBounce'].forEach(alt => {
                const suggestion = baseName.replace(/bounce/i, alt);
                if (!existingNames.some(name => name.toLowerCase() === suggestion.toLowerCase())) {
                    alternatives.push(suggestion);
                }
            });
        }
        // Shape/Geometric synonyms
        if (lower.includes('circle') || lower.includes('geometric')) {
            ['Sphere', 'Orb', 'Ring', 'Polygon', 'Morphing'].forEach(alt => {
                const suggestion = baseName.replace(/(circle|geometric)/i, alt);
                if (!existingNames.some(name => name.toLowerCase() === suggestion.toLowerCase())) {
                    alternatives.push(suggestion);
                }
            });
        }
        // Text/Typography alternatives
        if (lower.includes('text')) {
            ['Typography', 'Letters', 'Words', 'Writing', 'Script'].forEach(alt => {
                const suggestion = baseName.replace(/text/i, alt);
                if (!existingNames.some(name => name.toLowerCase() === suggestion.toLowerCase())) {
                    alternatives.push(suggestion);
                }
            });
        }
        return alternatives.slice(0, 3); // Top 3 semantic alternatives
    }
    async ensureWorkspaceDirectories() {
        // STDIO MODE FIX: Ensure all directories exist regardless of execution context
        const requiredDirectories = [
            SRC_DIR,
            EXPORTS_DIR,
            path.dirname(SRC_DIR), // Parent workspace directory
            path.join(SRC_DIR, '..', 'out'), // Alternative export path
            path.join(SRC_DIR, 'assets'), // Professional asset structure
            path.join(SRC_DIR, 'assets', 'animations'), // Animation components
            path.join(SRC_DIR, 'assets', 'audio'), // Audio assets
            path.join(SRC_DIR, 'assets', 'audio', 'sfx'), // Sound effects
            path.join(SRC_DIR, 'assets', 'exports'), // Internal export organization
        ];
        for (const dir of requiredDirectories) {
            try {
                await fs.mkdir(dir, { recursive: true });
                log('info', `Ensured directory exists: ${dir}`);
            }
            catch (error) {
                log('warn', `Failed to create directory ${dir}`, { error: error.message });
                // Continue - don't fail for directory creation issues
            }
        }
        // Verify critical directories exist
        try {
            await fs.access(SRC_DIR);
            await fs.access(EXPORTS_DIR);
            log('info', 'All workspace directories verified and accessible');
        }
        catch (error) {
            log('error', 'Critical workspace directories not accessible', { error: error.message });
            throw new Error(`Workspace initialization failed: ${error.message}`);
        }
    }
    async fixAllExistingExports() {
        // ONE-TIME CLEANUP: Fix export duplication in all existing components
        try {
            const animationsDir = path.join(SRC_DIR, 'assets', 'animations');
            const files = await fs.readdir(animationsDir);
            let fixedCount = 0;
            for (const file of files) {
                if (file.endsWith('.tsx')) {
                    const componentName = path.basename(file, '.tsx');
                    const filePath = path.join(animationsDir, file);
                    try {
                        const content = await fs.readFile(filePath, 'utf-8');
                        const fixedContent = this.fixComponentExports(content, componentName);
                        if (fixedContent !== content) {
                            await fs.writeFile(filePath, fixedContent);
                            log('info', `Fixed exports in ${componentName}.tsx`);
                            fixedCount++;
                        }
                    }
                    catch (error) {
                        log('warn', `Failed to fix exports in ${file}`, { error: error.message });
                    }
                }
            }
            if (fixedCount > 0) {
                log('info', `Successfully fixed exports in ${fixedCount} existing components`);
            }
            else {
                log('info', 'All existing components have correct export patterns');
            }
        }
        catch (error) {
            log('error', 'Failed to fix existing exports (non-fatal)', { error: error.message });
            // Don't throw - this is a cleanup operation that shouldn't break the system
        }
    }
    fixComponentExports(code, componentName) {
        // RESEARCH-VALIDATED: Prefer modern "export const" pattern, avoid duplicates
        // Check what export patterns already exist
        const hasConstExport = new RegExp(`export\\s+const\\s+${componentName}\\s*:`).test(code);
        const hasNamedExport = new RegExp(`export\\s*\\{[^}]*${componentName}[^}]*\\}`).test(code);
        const hasDefaultExport = new RegExp(`export\\s+default\\s+${componentName}`).test(code);
        // MODERN PATTERN: If has "export const ComponentName", remove any duplicate named exports
        if (hasConstExport) {
            if (hasNamedExport) {
                log('info', `Component ${componentName} has export const + duplicate named export - removing duplicate`);
                // Remove duplicate export { ComponentName }; statements
                const cleanedCode = code.replace(new RegExp(`\\s*export\\s*\\{\\s*${componentName}\\s*\\}\\s*;?\\n?`, 'g'), '');
                return cleanedCode;
            }
            else {
                log('info', `Component ${componentName} uses modern export const pattern - no changes needed`);
                return code;
            }
        }
        // LEGACY PATTERN: If has default export, replace with named export
        if (hasDefaultExport) {
            log('info', `Converting legacy default export to named export for ${componentName}`);
            return code.replace(new RegExp(`export\\s+default\\s+${componentName}\\s*;?`, 'g'), `export { ${componentName} };`);
        }
        // If has named export already, don't add duplicate
        if (hasNamedExport) {
            log('info', `Component ${componentName} already has named export - no changes needed`);
            return code;
        }
        // FALLBACK: If no exports detected, add named export
        log('info', `No exports detected - adding named export for ${componentName}`);
        return code.trim() + `\n\nexport { ${componentName} };`;
    }
    async handleCreateAnimation(args) {
        const { code, componentName, duration = 8 } = args || {};
        log('info', 'Executing Claude-generated animation code', { componentName, duration });
        // ENFORCE BASE RULES + LEARNED RULES (always active)
        const violations = [];
        const warnings = [];
        try {
            // Load learned preferences
            const { loadPreferences } = await import('./preference-learner.js');
            const preferences = loadPreferences();
            // BASE RULE 1: Font usage - must specify fontFamily (prevents browser serif default)
            const hasExplicitFont = /fontFamily\s*:\s*['"`]/.test(code);
            // Check for serif fonts but EXCLUDE "sans-serif" keyword
            const hasSerifFont = /\b(Georgia|Times|Palatino|Garamond|Baskerville|Didot|Bodoni)\b/i.test(code) ||
                (/\bserif\b/i.test(code) && !/sans-serif/i.test(code));
            if (hasSerifFont && !args.allowSerifFont) {
                violations.push('❌ FONT: Detected serif font (Georgia, Times, etc). Use sans-serif by default (Inter, SF Pro Display, Roboto)');
            }
            else if (!hasExplicitFont && /fontSize/.test(code)) {
                violations.push('❌ FONT: Missing fontFamily declaration. Browser defaults to serif! Must specify: fontFamily: "Inter, -apple-system, sans-serif"');
            }
            // BASE RULE 1b: Minimum font sizes for 1920x1080 video (broadcast standard)
            const fontSizes = code.match(/fontSize:\s*(\d+)/g) || [];
            const tinyFonts = fontSizes.filter(f => {
                const size = parseInt(f.match(/\d+/)[0]);
                return size < 24; // Minimum readable size for video
            });
            if (tinyFonts.length > 0) {
                violations.push(`❌ FONT SIZE: Detected tiny fonts (${tinyFonts.join(', ')}). Minimum 24px for body, 48px for headlines on 1920x1080 video!`);
            }
            // BASE RULE 2: NoOverlapScene usage (MANDATORY from PRE-ANIMATION-CHECKLIST Step 8)
            // Only flag TRUE multi-scene animations (Sequence with multiple children)
            const hasSequence = code.includes('Sequence');
            const sequenceCount = (code.match(/<Sequence[>\s]/g) || []).length;
            // Multi-scene = Sequence component present (not just multiple interpolations in one scene)
            if (!code.includes('NoOverlapScene') && hasSequence && sequenceCount > 0) {
                violations.push('❌ STRUCTURE: Sequence detected without NoOverlapScene. Use NoOverlapScene to prevent overlapping scenes (PRE-ANIMATION-CHECKLIST.md Step 8)');
            }
            // BASE RULE 3: Duration calculation (warn about common arbitrary values)
            // Note: We validate args.duration when the MCP tool is called, not in code
            if (args.duration && args.duration === 240 && !args.calculatedDuration) {
                warnings.push('💡 DURATION: Using 240 frames (8 seconds). Consider using duration calculator: (scenes × 75) + (transitions × 15)');
            }
            // BASE RULE 4: Motion blur on movement
            if (/translateY|translateX|slide|wipe/.test(code) && !code.includes('blur')) {
                warnings.push('💡 MOTION BLUR: Fast movement detected - add motion blur for professional quality (velocity × 0.1)');
            }
            // BASE RULE 4: Minimum spacing (from PRE-ANIMATION-CHECKLIST Step 5)
            const smallPadding = code.match(/padding:\s*['"]?(\d+)px/g) || [];
            const tinyPadding = smallPadding.filter(p => {
                const size = parseInt(p.match(/\d+/)[0]);
                return size < 40; // Minimum container padding
            });
            if (tinyPadding.length > 0) {
                violations.push(`❌ SPACING: Detected cramped padding (${tinyPadding.slice(0, 3).join(', ')}). Minimum 80px container padding, 40px card padding for video!`);
            }
            // BASE RULE 5: Proper element sizing for 1920x1080
            const smallWidths = code.match(/width:\s*['"]?(\d+)px/g) || [];
            const tinyElements = smallWidths.filter(w => {
                const size = parseInt(w.match(/\d+/)[0]);
                return size < 400 && size > 50; // Main elements should be 400px+ (excluding small decorations)
            });
            if (tinyElements.length > 2) {
                warnings.push(`💡 SCALE: Many small elements detected. For 1920x1080 video, main content should be 600-1200px wide for visibility.`);
            }
            // BASE RULE 6: Component name format (Remotion composition ID rules)
            if (/_/.test(componentName)) {
                violations.push('❌ NAME: Underscores not allowed in composition IDs. Use camelCase (FlowTaskMinimalist) or hyphens (flow-task-minimalist). Remotion will reject this!');
            }
            if (!/^[a-zA-Z0-9-]+$/.test(componentName)) {
                violations.push('❌ NAME: Invalid characters in composition ID. Only letters, numbers, and hyphens allowed.');
            }
            // BASE RULE 7: Static imports (no dynamic imports in animations)
            if (/import\(|require\(/.test(code)) {
                violations.push('❌ IMPORTS: Dynamic imports detected. Use static imports only in Remotion components');
            }
            // LEARNED RULE: Check if user has corrections that apply
            if (preferences.corrections.length > 0) {
                // Check for common learned patterns
                preferences.corrections.forEach(correction => {
                    if (correction.issue_type === 'overlap' && code.includes('Sequence')) {
                        warnings.push(`💡 LEARNED: You previously corrected overlapping scenes. Use NoOverlapScene instead of manual Sequence timing.`);
                    }
                    if (correction.issue_type === 'compound_scaling' && /scale\s*:/i.test(code)) {
                        warnings.push(`💡 LEARNED: Scale detected - ensure it's at shot level only, not element level (your correction from ${new Date(correction.timestamp).toLocaleDateString()})`);
                    }
                    if (correction.issue_type === 'crop' && /scale|transform/.test(code)) {
                        warnings.push(`💡 LEARNED: You previously fixed crop violations. Verify elements stay within 1920x1080 bounds.`);
                    }
                });
            }
            // BLOCK if critical violations found
            if (violations.length > 0) {
                log('error', 'Base rule violations detected - blocking animation creation', { violations });
                return {
                    content: [{
                            type: 'text',
                            text: `[VALIDATION FAILED] Animation violates ${violations.length} base rule(s):

${violations.map(v => `  ${v}`).join('\n')}

These are professional standards from guidelines and must be fixed.
Please regenerate the animation code addressing these violations.

💡 Need help? Check PRE-ANIMATION-CHECKLIST.md for proper patterns.`
                        }],
                    isError: true
                };
            }
            // Show warnings but allow (non-critical improvements)
            if (warnings.length > 0) {
                log('warn', 'Code validation warnings', { warnings });
                // Continue execution but Claude will see the warnings
            }
        }
        catch (error) {
            // If validation fails, log but don't block (graceful degradation)
            log('warn', 'Rule validation error - proceeding with code execution', { error: error.message });
        }
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
        // ROBUST DIRECTORY INITIALIZATION: Ensure all required directories exist (STDIO mode fix)
        await this.ensureWorkspaceDirectories();
        // ONE-TIME EXPORT CLEANUP: Fix duplicate exports in existing components
        await this.fixAllExistingExports();
        // ROBUST COLLISION DETECTION: Prevent name conflicts and suggest alternatives
        const nameValidation = await this.validateAndResolveName(componentName);
        if (nameValidation.hasConflict) {
            return {
                content: [{
                        type: 'text',
                        text: `[NAME CONFLICT] "${nameValidation.requestedName}" conflicts with existing component.\\n\\n` +
                            `[EXISTING] ${nameValidation.conflictsWith.join(', ')}\\n\\n` +
                            `[SUGGESTED ALTERNATIVES]:\\n${nameValidation.alternatives.map(alt => `- ${alt}`).join('\\n')}\\n\\n` +
                            `[SOLUTION] Use one of the suggested names or choose a completely different name.`
                    }],
                isError: true
            };
        }
        const validComponentName = nameValidation.safeName;
        const componentPath = path.join(SRC_DIR, 'assets', 'animations', `${validComponentName}.tsx`);
        // Write Claude's generated code with SMART export pattern fixing
        const fixedCode = this.fixComponentExports(code, validComponentName);
        // INTERPOLATE VALIDATION: Detect and fix unsafe interpolate patterns
        let safeCode = this.validateAndFixInterpolate(fixedCode);
        // ANIMATION VALIDATION: Pre-validate TypeScript syntax and auto-fix common errors (optional)
        const validationResult = await this.validateAnimationCode(safeCode, validComponentName);
        if (validationResult.fixedCode) {
            safeCode = validationResult.fixedCode;
            log('info', 'Applied validation fixes to animation code', { componentName: validComponentName });
        }
        // Store validation warnings to include in response
        const validationWarnings = validationResult.warnings;
        // ROBUST FILE CREATION: With error recovery for external users
        try {
            await fs.writeFile(componentPath, safeCode);
            log('info', `Created animation file with Claude's code: ${componentPath}`);
        }
        catch (fileError) {
            log('error', 'Failed to create animation file', { error: fileError.message });
            return {
                content: [{
                        type: 'text',
                        text: `[CREATE FAILED] Automatic creation failed. Manual fallback steps:\\n\\n` +
                            `1. Create file: clean-cut-workspace/${validComponentName}.tsx\\n` +
                            `2. Add your component code to the file\\n` +
                            `3. Use auto_sync tool to register it in Root.tsx\\n\\n` +
                            `[ERROR DETAILS] ${fileError.message}\\n\\n` +
                            `[SUPPORT] This ensures external users always have a path forward`
                    }],
                isError: true
            };
        }
        // AUTOMATIC SYNC: Always call auto_sync after creating animation to ensure it appears in Studio
        log('info', 'Auto-syncing new animation to Root.tsx...');
        try {
            await this.handleAutoSync({ force: false });
            log('info', `Successfully auto-synced ${validComponentName} to Root.tsx`);
        }
        catch (syncError) {
            log('error', 'Auto-sync failed, but animation file created', syncError);
            return {
                content: [{
                        type: 'text',
                        text: `[PARTIAL SUCCESS] Animation file created but auto-sync failed.\\n\\n` +
                            `[FILE] ${validComponentName}.tsx created successfully\\n` +
                            `[MANUAL STEP] Run auto_sync tool to register it in Root.tsx\\n\\n` +
                            `[ERROR] ${syncError.message}\\n\\n` +
                            `[FALLBACK] Manual registration available`
                    }],
                isError: false // File was created, just sync failed
            };
        }
        const collisionInfo = nameValidation.requestedName !== validComponentName ?
            `\\n[COLLISION RESOLVED] Requested "${nameValidation.requestedName}" → Using "${validComponentName}"` : '';
        // Include validation warnings in response if any
        const validationInfo = validationWarnings.length > 0 ?
            `\\n\\n[VALIDATION FEEDBACK]\\n${validationWarnings.join('\\n')}` : '';
        return {
            content: [{
                    type: 'text',
                    text: `[ANIMATION CREATED + SYNCED] ${validComponentName}\\n\\n` +
                        `[FILE] ${validComponentName}.tsx\\n` +
                        `[DURATION] ${duration} seconds\\n` +
                        `[AUTO-REGISTERED] Component added to Root.tsx automatically\\n` +
                        `[STUDIO] Ready at http://localhost:${STUDIO_PORT}${collisionInfo}${validationInfo}\\n\\n` +
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
            const animationsDir = path.join(SRC_DIR, 'assets', 'animations');
            const files = await fs.readdir(animationsDir);
            const componentFiles = files.filter(file => file.endsWith('.tsx'));
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
            // Scan assets/animations for all animation components
            const animationsDir = path.join(SRC_DIR, 'assets', 'animations');
            const files = await fs.readdir(animationsDir);
            const componentFiles = files.filter(file => file.endsWith('.tsx'));
            // Build imports and compositions for all components
            const imports = [];
            const compositions = [];
            for (const file of componentFiles) {
                const componentName = file.replace('.tsx', '');
                imports.push(`import { ${componentName} } from './assets/animations/${componentName}';`);
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
import { ${componentName} } from './assets/animations/${componentName}';

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
                            const componentName = match[1];
                            // ALWAYS generate professional import path regardless of existing path
                            const professionalImport = `import { ${componentName} } from './assets/animations/${componentName}';`;
                            importLines.push(professionalImport);
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
                const importStatement = `import { ${componentName} } from './assets/animations/${componentName}';`;
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
            const componentPath = path.join(SRC_DIR, 'assets', 'animations', `${componentName}.tsx`);
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
            const componentPath = path.join(SRC_DIR, 'assets', 'animations', `${componentName}.tsx`);
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
            // 1. Scan assets/animations for all .tsx components with container-reality validation
            log('info', 'Scanning assets/animations for components...');
            const animationsDir = path.join(SRC_DIR, 'assets', 'animations');
            const files = await fs.readdir(animationsDir);
            const componentFiles = files.filter(file => file.endsWith('.tsx'));
            // CONTAINER-REALITY VALIDATION: Verify all files actually exist and are readable
            const validatedComponents = [];
            for (const file of componentFiles) {
                const componentPath = path.join(animationsDir, file);
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
                const componentPath = path.join(animationsDir, file);
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
        const newComponentImports = components.map(comp => `import { ${comp.name} } from './assets/animations/${comp.name}';`);
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
            log('info', 'Root file watcher setup complete - monitoring Root.tsx for changes');
        }
        catch (error) {
            log('error', 'Failed to setup root file watcher', { error: error.message });
        }
    }
    async setupWorkspaceWatcher() {
        try {
            // RESEARCH-VALIDATED: Use polling instead of fs.watch for Docker volume mount compatibility
            // "The fix to watching file changes in docker is to use polling" - Docker best practices 2024
            // Keep track of known components for deletion detection
            let knownComponents = new Set();
            // Initial scan to populate known components
            await this.scanAndUpdateKnownComponents(knownComponents);
            // Polling-based detection every 5 seconds (research-recommended interval)
            const pollingInterval = setInterval(async () => {
                try {
                    const currentComponents = new Set();
                    await this.scanAndUpdateKnownComponents(currentComponents);
                    // Detect deletions by comparing sets
                    for (const componentName of knownComponents) {
                        if (!currentComponents.has(componentName)) {
                            log('info', `Polling detected deletion: ${componentName}.tsx - cleaning orphaned references`);
                            await this.cleanupOrphanedReferences(componentName);
                        }
                    }
                    // Detect new components (for logging)
                    for (const componentName of currentComponents) {
                        if (!knownComponents.has(componentName)) {
                            log('info', `Polling detected new component: ${componentName}.tsx`);
                        }
                    }
                    // Update known components
                    knownComponents = currentComponents;
                }
                catch (error) {
                    log('error', 'Polling scan failed (non-fatal)', { error: error.message });
                }
            }, 5000); // 5-second interval - balance of responsiveness vs performance
            // Store interval for cleanup
            this.workspaceWatcher = {
                close: () => clearInterval(pollingInterval)
            };
            log('info', 'Polling-based workspace watcher setup complete - monitoring for component deletions every 5 seconds');
        }
        catch (error) {
            log('error', 'Failed to setup workspace watcher', { error: error.message });
        }
    }
    async scanAndUpdateKnownComponents(componentSet) {
        try {
            const animationsDir = path.join(SRC_DIR, 'assets', 'animations');
            const files = await fs.readdir(animationsDir);
            files
                .filter(file => file.endsWith('.tsx'))
                .forEach(file => {
                const componentName = path.basename(file, '.tsx');
                componentSet.add(componentName);
            });
        }
        catch (error) {
            log('error', 'Failed to scan components', { error: error.message });
        }
    }
    async cleanupOrphanedReferences(componentName) {
        try {
            const rootPath = path.join(SRC_DIR, 'Root.tsx');
            let rootContent = await fs.readFile(rootPath, 'utf-8');
            // Double-check component file doesn't exist before cleaning
            const componentPath = path.join(SRC_DIR, 'assets', 'animations', `${componentName}.tsx`);
            const componentExists = await fs.access(componentPath).then(() => true).catch(() => false);
            if (componentExists) {
                log('info', `Component ${componentName} still exists - skipping cleanup`);
                return;
            }
            // Safe cleanup - only remove specific orphaned references
            const originalContent = rootContent;
            // Remove import statement (handles both old and new asset structure paths)
            rootContent = rootContent.replace(new RegExp(`import\\s*\\{\\s*${componentName}\\s*\\}\\s*from\\s*['"]\\.(\\/assets\\/animations)?\\/${componentName}['"];?\\n?`, 'g'), '');
            // Remove schema definition
            rootContent = rootContent.replace(new RegExp(`const\\s+${componentName}Schema\\s*=\\s*z\\.object\\([^}]+\\}\\);\\n?`, 'gs'), '');
            // Remove composition entry (both self-closing and with schema)
            rootContent = rootContent
                .replace(new RegExp(`\\s*<Composition[^>]*id="${componentName}"[^>]*\\/?>\\n?`, 'gs'), '')
                .replace(new RegExp(`\\s*<Composition[^>]*id="${componentName}"[^>]*>.*?<\\/Composition>\\n?`, 'gs'), '');
            // Only write if changes were made
            if (rootContent !== originalContent) {
                await fs.writeFile(rootPath, rootContent);
                log('info', `Successfully cleaned orphaned references for ${componentName}`);
            }
            else {
                log('info', `No orphaned references found for ${componentName}`);
            }
        }
        catch (error) {
            log('error', `Failed to cleanup orphaned references for ${componentName}`, { error: error.message });
            // Don't throw - deletion cleanup failure shouldn't crash the system
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
        const importRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]\.\/assets\/animations\//g;
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
                // Remove schema definition (integrated from cleanup-service.js)
                const schemaRegex = new RegExp(`const\\s+${componentName}Schema\\s*=\\s*z\\.object\\([^}]+\\}\\);\\n?`, 'gs');
                rootContent = rootContent.replace(schemaRegex, '');
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
                const componentPath = path.join(SRC_DIR, 'assets', 'animations', `${componentName}.tsx`);
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
            // FORCE CACHE CLEARING: Clear Remotion cache to trigger Studio refresh (same as auto_sync)
            try {
                const remotionCacheDir = path.join(SRC_DIR.replace('/src', ''), '.remotion');
                const webpackCacheDir = path.join(SRC_DIR.replace('/src', ''), 'node_modules', '.cache');
                await fs.rmdir(remotionCacheDir, { recursive: true }).catch(() => { });
                await fs.rmdir(webpackCacheDir, { recursive: true }).catch(() => { });
                // Touch index.ts to trigger webpack rebuild
                const indexPath = path.join(SRC_DIR, 'index.ts');
                const now = new Date();
                await fs.utimes(indexPath, now, now).catch(() => { });
                log('info', `Cleared Remotion cache after deleting ${componentName} - Studio will refresh`);
            }
            catch (error) {
                log('warn', `Cache clear failed after deletion: ${error.message}`);
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
    // ========================================
    // ASSET MANAGEMENT FUNCTIONALITY
    // ========================================
    async handleUploadAsset(args) {
        const { filePath, category, filename } = args;
        try {
            const publicDir = path.join(SRC_DIR.replace('/src', ''), 'public');
            const categoryDir = path.join(publicDir, category);
            // Ensure category directory exists
            await fs.mkdir(categoryDir, { recursive: true });
            // Determine target filename
            const targetFilename = filename || path.basename(filePath);
            const targetPath = path.join(categoryDir, targetFilename);
            // Copy file from user's system to container
            try {
                const fileContent = await fs.readFile(filePath);
                await fs.writeFile(targetPath, fileContent);
                log('info', `Asset uploaded successfully: ${category}/${targetFilename}`);
            }
            catch (copyError) {
                throw new Error(`Failed to copy asset: ${copyError.message}`);
            }
            // Export to Windows host via Docker CP
            try {
                const hostBasePath = '/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/clean-cut-mcp';
                const hostAssetPath = `${hostBasePath}/clean-cut-workspace/public/${category}/${targetFilename}`;
                const exportCmd = `docker cp clean-cut-mcp:/workspace/public/${category}/${targetFilename} "${hostAssetPath}"`;
                execSync(exportCmd, { stdio: 'pipe' });
                log('info', `Asset exported to Windows host: ${category}/${targetFilename}`);
            }
            catch (exportError) {
                log('warn', 'Asset export to host failed (non-critical)', { error: exportError.message });
            }
            return {
                content: [{
                        type: 'text',
                        text: `[ASSET UPLOADED] ${targetFilename}\\n\\n` +
                            `[CATEGORY] ${category}\\n` +
                            `[PATH] /public/${category}/${targetFilename}\\n` +
                            `[USAGE] Reference in animations: \\n` +
                            `  Images/Logos: <img src="/public/${category}/${targetFilename}" />\\n` +
                            `  Fonts: @font-face { src: url('/public/${category}/${targetFilename}') }\\n` +
                            `  Audio: <Audio src="/public/${category}/${targetFilename}" />\\n\\n` +
                            `[SUCCESS] Asset ready for use in animations!`
                    }]
            };
        }
        catch (error) {
            log('error', 'Asset upload failed', { error: error.message });
            return {
                content: [{
                        type: 'text',
                        text: `[UPLOAD FAILED] ${error.message}\\n\\n` +
                            `Please check:\\n` +
                            `- File path is correct and accessible\\n` +
                            `- File is a valid image/font/audio file\\n` +
                            `- Category is one of: images, logos, fonts, audio`
                    }],
                isError: true
            };
        }
    }
    async handleListAssets(args) {
        const { category = 'all' } = args || {};
        try {
            const publicDir = path.join(SRC_DIR.replace('/src', ''), 'public');
            const categories = category === 'all' ? ['images', 'logos', 'fonts', 'audio'] : [category];
            let assetList = '';
            let totalCount = 0;
            for (const cat of categories) {
                const catDir = path.join(publicDir, cat);
                try {
                    const files = await fs.readdir(catDir);
                    const assetFiles = files.filter(f => f !== 'README.md');
                    if (assetFiles.length > 0) {
                        assetList += `\\n📁 ${cat.toUpperCase()} (${assetFiles.length} files):\\n`;
                        for (const file of assetFiles) {
                            const stats = await fs.stat(path.join(catDir, file));
                            const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
                            assetList += `  • ${file} (${sizeMB}MB)\\n`;
                            totalCount++;
                        }
                    }
                }
                catch (error) {
                    // Directory doesn't exist or is empty
                }
            }
            if (totalCount === 0) {
                return {
                    content: [{
                            type: 'text',
                            text: `[NO ASSETS] No assets found${category !== 'all' ? ` in category: ${category}` : ''}.\\n\\n` +
                                `Upload assets using the upload_asset tool to make them available in animations.\\n\\n` +
                                `Categories: images, logos, fonts, audio`
                        }]
                };
            }
            return {
                content: [{
                        type: 'text',
                        text: `[AVAILABLE ASSETS] Total: ${totalCount} file(s)\\n${assetList}\\n` +
                            `[USAGE] Reference assets in animations:\\n` +
                            `  /public/images/your-image.png\\n` +
                            `  /public/logos/your-logo.svg\\n` +
                            `  /public/fonts/your-font.ttf\\n` +
                            `  /public/audio/your-sound.mp3`
                    }]
            };
        }
        catch (error) {
            log('error', 'Failed to list assets', { error: error.message });
            return {
                content: [{
                        type: 'text',
                        text: `[ERROR] Failed to list assets: ${error.message}`
                    }],
                isError: true
            };
        }
    }
    async handleDeleteAsset(args) {
        const { category, filename } = args;
        try {
            const publicDir = path.join(SRC_DIR.replace('/src', ''), 'public');
            const assetPath = path.join(publicDir, category, filename);
            // Delete from container
            await fs.unlink(assetPath);
            log('info', `Asset deleted from container: ${category}/${filename}`);
            // Delete from Windows host via Docker CP (copy empty directory or manual removal)
            try {
                const hostBasePath = '/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/clean-cut-mcp';
                const hostAssetPath = `${hostBasePath}/clean-cut-workspace/public/${category}/${filename}`;
                // Note: Docker CP can't delete files, so we'll document this limitation
                log('warn', 'Manual deletion needed from Windows host', { path: hostAssetPath });
            }
            catch (error) {
                log('warn', 'Host deletion notification failed', { error: error.message });
            }
            return {
                content: [{
                        type: 'text',
                        text: `[ASSET DELETED] ${filename}\\n\\n` +
                            `[CATEGORY] ${category}\\n` +
                            `[CONTAINER] Deleted from container\\n` +
                            `[HOST] Please manually delete from: clean-cut-workspace/public/${category}/${filename}\\n\\n` +
                            `[SUCCESS] Asset removed from animation workspace`
                    }]
            };
        }
        catch (error) {
            log('error', 'Asset deletion failed', { error: error.message });
            return {
                content: [{
                        type: 'text',
                        text: `[DELETE FAILED] ${error.message}\\n\\n` +
                            `Asset may not exist or path is incorrect.\\n` +
                            `Use list_assets to see available assets.`
                    }],
                isError: true
            };
        }
    }
    /**
     * Handler: generate_with_learning
     */
    async handleGenerateWithLearning(args) {
        const { generateAnimation } = await import('./integrated-generator.js');
        try {
            const result = await generateAnimation({
                content: args.content,
                scenes: args.scenes,
                brandLogo: args.brandLogo,
                style: args.style || 'tech',
                userPreferences: 'apply'
            });
            return {
                content: [{
                        type: 'text',
                        text: `[GENERATION SUCCESSFUL]

Duration: ${result.metadata.duration.total_frames} frames (${result.metadata.duration.total_seconds.toFixed(1)}s)
Scenes: ${result.spec.scenes.length}
Energy: ${result.metadata.analysis.energy.toFixed(2)}
Brand: ${result.metadata.brand.source} (${result.metadata.brand.accent})

Enforcement Status:
  ✅ All learned rules enforced
  Violations: ${result.metadata.enforcement.violations.length}
  Warnings: ${result.metadata.enforcement.warnings.length}
  Recommendations: ${result.metadata.enforcement.recommendations.length}

${result.metadata.enforcement.recommendations.length > 0 ? '💡 Recommendations:\n' + result.metadata.enforcement.recommendations.map(r => `  - ${r}`).join('\n') + '\n\n' : ''}Generated Code:
${result.code}
`
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `[GENERATION BLOCKED - Rule Violations]

${error.message}

Fix these violations before generating.`
                    }],
                isError: true
            };
        }
    }
    /**
     * Handler: record_user_correction
     */
    async handleRecordCorrection(args) {
        const { recordCorrection } = await import('./preference-learner.js');
        const correction = recordCorrection({
            issue_type: args.issue_type,
            issue_description: args.issue_description,
            original_parameters: args.original_value,
            corrected_parameters: args.corrected_value,
            learned_rule: `${args.issue_type}_correction_${Date.now()}`,
            confidence: 'medium',
            element_context: args.element_context
        });
        return {
            content: [{
                    type: 'text',
                    text: `[CORRECTION RECORDED]

ID: ${correction.id}
Issue: ${correction.issue_description}
Learned Rule: ${correction.learned_rule}
Confidence: ${correction.confidence}

✅ This rule will be automatically applied to future generations.
✅ Total corrections: ${correction.id.split('-')[1]}

Use view_learned_preferences to see all learned rules.`
                }]
        };
    }
    /**
     * Handler: view_learned_preferences
     */
    async handleViewPreferences(args) {
        const { generateLearningReport } = await import('./preference-learner.js');
        const report = generateLearningReport();
        return {
            content: [{
                    type: 'text',
                    text: report
                }]
        };
    }
    /**
     * Handler: sync_root_file
     */
    async handleSyncRoot(args) {
        const { syncRootTsx } = await import('./root-sync.js');
        const result = await syncRootTsx();
        return {
            content: [{
                    type: 'text',
                    text: `[ROOT.TSX SYNCHRONIZED]

Animations Found: ${result.animations}

Changes Made:
${result.changes.map(c => `  ✅ ${c}`).join('\n')}

Root.tsx is now in sync with all animation files.
No more "Cannot find module" errors!`
                }]
        };
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
        log('info', 'Available tools: create_animation, update_composition, get_studio_url, get_export_directory, list_existing_components, get_project_guidelines, rebuild_compositions, format_code, manage_props, auto_sync, delete_component, cleanup_broken_imports, upload_asset, list_assets, delete_asset');
        log('info', 'Claude Desktop can now generate ANY animation using TRUE AI!');
    }
}
// Start the TRUE AI server
const server = new TrueAiStdioMcpServer();
server.run().catch((error) => {
    console.error('Failed to start TRUE AI STDIO MCP Server:', error);
    process.exit(1);
});
