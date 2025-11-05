"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationService = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const prettier_1 = __importDefault(require("prettier"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class AnimationService {
    constructor() {
        // Use the same workspace as MCP for compatibility
        this.workspaceDir = process.env.CLEAN_CUT_WORKSPACE || path_1.default.join(process.cwd(), '../../clean-cut-workspace');
        this.animationsDir = path_1.default.join(this.workspaceDir, 'src/assets/animations');
    }
    async createAnimation({ code, componentName, duration }) {
        await fs_extra_1.default.ensureDir(this.animationsDir);
        const fileName = `${componentName}.tsx`;
        const filePath = path_1.default.join(this.animationsDir, fileName);
        // Check if file already exists
        if (await fs_extra_1.default.pathExists(filePath)) {
            throw new Error(`Animation '${componentName}' already exists`);
        }
        // Format and save the code
        const formattedCode = await this.formatCodeString(code);
        await fs_extra_1.default.writeFile(filePath, formattedCode, 'utf-8');
        // Update Root.tsx to include the new animation
        await this.updateRootTsx(componentName);
        return {
            componentName,
            filePath,
            code: formattedCode
        };
    }
    async listAnimations() {
        try {
            await fs_extra_1.default.ensureDir(this.animationsDir);
            const files = await fs_extra_1.default.readdir(this.animationsDir);
            const animations = await Promise.all(files
                .filter(file => file.endsWith('.tsx'))
                .map(async (file) => {
                const filePath = path_1.default.join(this.animationsDir, file);
                const stats = await fs_extra_1.default.stat(filePath);
                const componentName = path_1.default.basename(file, '.tsx');
                return {
                    name: componentName,
                    duration: this.extractDurationFromCode(await fs_extra_1.default.readFile(filePath, 'utf-8')),
                    lastModified: stats.mtime.toISOString(),
                    thumbnail: `/api/animations/${componentName}/thumbnail`
                };
            }));
            return animations;
        }
        catch (error) {
            console.error('Error listing animations:', error);
            return [];
        }
    }
    async readAnimation(name) {
        try {
            const filePath = path_1.default.join(this.animationsDir, `${name}.tsx`);
            if (!await fs_extra_1.default.pathExists(filePath)) {
                return null;
            }
            const code = await fs_extra_1.default.readFile(filePath, 'utf-8');
            const stats = await fs_extra_1.default.stat(filePath);
            return {
                name,
                code,
                lastModified: stats.mtime.toISOString()
            };
        }
        catch (error) {
            console.error('Error reading animation:', error);
            return null;
        }
    }
    async editAnimation(name, changes, preview = false) {
        const filePath = path_1.default.join(this.animationsDir, `${name}.tsx`);
        if (!await fs_extra_1.default.pathExists(filePath)) {
            throw new Error(`Animation '${name}' not found`);
        }
        let currentCode = await fs_extra_1.default.readFile(filePath, 'utf-8');
        // Apply changes (this is a simplified implementation)
        // In a full implementation, this would use AST manipulation
        Object.entries(changes).forEach(([key, value]) => {
            const regex = new RegExp(`const\\s+${key}\\s*=\\s*[^;]+;`, 'g');
            currentCode = currentCode.replace(regex, `const ${key} = ${JSON.stringify(value)};`);
        });
        const formattedCode = await this.formatCodeString(currentCode);
        if (!preview) {
            await fs_extra_1.default.writeFile(filePath, formattedCode, 'utf-8');
        }
        return {
            name,
            code: formattedCode,
            changes
        };
    }
    async deleteAnimation(name) {
        const filePath = path_1.default.join(this.animationsDir, `${name}.tsx`);
        if (!await fs_extra_1.default.pathExists(filePath)) {
            throw new Error(`Animation '${name}' not found`);
        }
        await fs_extra_1.default.remove(filePath);
        // Update Root.tsx to remove the animation
        await this.removeFromRootTsx(name);
    }
    async formatCode(code) {
        return this.formatCodeString(code);
    }
    async validateProps(componentName, props) {
        // Basic props validation - in a full implementation this would use Zod schemas
        const errors = [];
        const warnings = [];
        const filePath = path_1.default.join(this.animationsDir, `${componentName}.tsx`);
        if (!await fs_extra_1.default.pathExists(filePath)) {
            errors.push(`Component '${componentName}' not found`);
            return { valid: false, errors, warnings };
        }
        const code = await fs_extra_1.default.readFile(filePath, 'utf-8');
        // Check for prop usage
        Object.keys(props).forEach(prop => {
            if (!code.includes(prop)) {
                warnings.push(`Prop '${prop}' is not used in component`);
            }
        });
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    async getAnimationGuidelines() {
        return {
            rules: [
                'Always use NoOverlapScene component for professional layouts',
                'Ensure continuous motion - no static holds',
                'Use minimum font sizes: 48px for headlines, 24px for body text',
                'Apply motion blur for fast movements (>3px/frame)',
                'Scale at shot level only, not element level',
                'Use calculated duration: (scenes × 75) + (transitions × 15) frames'
            ],
            bestPractices: [
                'Test animations at different frame rates',
                'Use proper typography hierarchy',
                'Maintain consistent spacing (minimum 80px padding)',
                'Ensure accessibility with contrast ratios > 7:1',
                'Preview on multiple screen sizes'
            ],
            examples: [
                'Sliding text with smooth entry/exit transitions',
                'Bouncing ball with physics simulation',
                'Rotating logo with scale effects',
                'Fade transitions with opacity changes'
            ]
        };
    }
    async formatCodeString(code) {
        try {
            return await prettier_1.default.format(code, {
                parser: 'typescript',
                semi: true,
                singleQuote: true,
                tabWidth: 2,
                trailingComma: 'none',
                jsxSingleQuote: false,
                jsxBracketSameLine: false
            });
        }
        catch (error) {
            console.warn('Prettier formatting failed:', error);
            return code; // Return original code if formatting fails
        }
    }
    async updateRootTsx(componentName) {
        const rootPath = path_1.default.join(this.workspaceDir, 'src/Root.tsx');
        let rootContent = '';
        if (await fs_extra_1.default.pathExists(rootPath)) {
            rootContent = await fs_extra_1.default.readFile(rootPath, 'utf-8');
        }
        else {
            // Create basic Root.tsx if it doesn't exist
            rootContent = `import { Composition } from 'remotion';

export const RemotionRoot: React.FC = () => {
  return (
    <>
    </>
  );
};
`;
        }
        // Add import and composition entry
        if (!rootContent.includes(`import { ${componentName} }`)) {
            rootContent = rootContent.replace('import { Composition } from', `import { ${componentName} } from './assets/animations/${componentName}';\nimport { Composition } from`);
        }
        // Add composition entry
        if (!rootContent.includes(`${componentName}Composition`)) {
            const compositionEntry = `
    <Composition
      id="${componentName}Composition"
      component={${componentName}}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />`;
            rootContent = rootContent.replace('</>', `${compositionEntry}\n    </>`);
        }
        await fs_extra_1.default.writeFile(rootPath, rootContent, 'utf-8');
    }
    async removeFromRootTsx(componentName) {
        const rootPath = path_1.default.join(this.workspaceDir, 'src/Root.tsx');
        if (!await fs_extra_1.default.pathExists(rootPath)) {
            return;
        }
        let rootContent = await fs_extra_1.default.readFile(rootPath, 'utf-8');
        // Remove import
        rootContent = rootContent.replace(new RegExp(`import\\s*{\\s*${componentName}\\s*}[^;]*;?\\s*\\n?`, 'g'), '');
        // Remove composition entry
        rootContent = rootContent.replace(new RegExp(`[\\s\\S]*?<Composition[^>]*${componentName}Composition[^>]*>[\\s\\S]*?</Composition>\\s*\\n?`, 'g'), '');
        await fs_extra_1.default.writeFile(rootPath, rootContent, 'utf-8');
    }
    extractDurationFromCode(code) {
        // Try to extract duration from the code
        const durationMatch = code.match(/durationInFrames[\\s]*=[\\s]*(\\d+)/);
        if (durationMatch) {
            return parseInt(durationMatch[1], 10) / 30; // Convert frames to seconds
        }
        // Try to extract from Composition component
        const compositionMatch = code.match(/durationInFrames[\\s]*=[\\s]*{?(\\d+)}?/);
        if (compositionMatch) {
            return parseInt(compositionMatch[1], 10) / 30;
        }
        return 5; // Default duration
    }
}
exports.AnimationService = AnimationService;
