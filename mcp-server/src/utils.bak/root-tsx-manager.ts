/**
 * Root.tsx Corruption Prevention & Auto-Repair System
 * Prevents duplicate imports, malformed compositions, and file corruption
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import writeFileAtomic from 'write-file-atomic';

interface ComponentEntry {
  name: string;
  path: string;
  duration: number;
  width: number;
  height: number;
}

export class RootTsxManager {
  private readonly rootTsxPath: string;
  private readonly componentsDir: string;

  constructor(projectPath: string) {
    this.rootTsxPath = path.join(projectPath, 'src', 'Root.tsx');
    this.componentsDir = path.join(projectPath, 'src', 'components');
  }

  /**
   * Auto-fix corrupted Root.tsx by scanning filesystem and regenerating clean content
   */
  async repairRootTsx(): Promise<{ success: boolean; message: string; componentsFound: number }> {
    try {
      // console.log('Analyzing Root.tsx for corruption...'); // DISABLED: Prevents JSON pollution
      
      // Scan existing components from filesystem (corruption-proof)
      const existingComponents = await this.scanExistingComponents();
      
      // Generate clean Root.tsx content
      const cleanContent = this.generateCleanRootTsx(existingComponents);
      
      // Atomic write to prevent corruption during write operation
      await this.atomicWrite(this.rootTsxPath, cleanContent);
      
      // console.log(`Root.tsx repaired with ${existingComponents.length} components`); // DISABLED: Prevents JSON pollution
      
      return {
        success: true,
        message: `Root.tsx automatically repaired with ${existingComponents.length} valid components`,
        componentsFound: existingComponents.length
      };
      
    } catch (error) {
      console.error('Root.tsx repair failed:', error);
      return {
        success: false,
        message: `Repair failed: ${(error as Error).message}`,
        componentsFound: 0
      };
    }
  }

  /**
   * Create component with validation and automatic Root.tsx management (prevents undefined errors)
   */
  async addComponentSafely(componentName: string, componentCode: string, options: Partial<ComponentEntry>): Promise<void> {
    // Ensure components directory exists
    await fs.mkdir(this.componentsDir, { recursive: true });
    
    // NEW: Pre-validate component code before saving
    if (!this.validateComponentCode(componentCode, componentName)) {
      throw new Error(`Component code validation failed for ${componentName}. Code must contain 'export default' and valid React component.`);
    }
    
    // Create the component file atomically
    const componentPath = path.join(this.componentsDir, `${componentName}.tsx`);
    await this.atomicWrite(componentPath, componentCode);
    
    // NEW: Validate the saved component file before updating Root.tsx
    const isValidFile = await this.validateComponent(componentPath);
    if (!isValidFile) {
      // Delete the invalid component file to prevent corruption
      await fs.unlink(componentPath).catch(() => {});
      throw new Error(`Component ${componentName} failed post-save validation. Component not added to Root.tsx.`);
    }
    
    // console.log(`Component ${componentName} validated and ready for Root.tsx`); // DISABLED: Prevents JSON pollution
    
    // Update Root.tsx only with validated component
    await this.updateRootTsxSafely(componentName, {
      name: componentName,
      path: `./components/${componentName}`,
      duration: options.duration || 90,
      width: options.width || 1920,
      height: options.height || 1080
    });
  }

  /**
   * Validate component code before saving to file (prevents undefined at source)
   */
  private validateComponentCode(code: string, componentName: string): boolean {
    // Must contain export default
    if (!code.includes('export default')) {
      console.warn(`Component ${componentName} missing 'export default' - will cause undefined error`);
      return false;
    }

    // Must contain React or Remotion imports
    const hasReactImport = code.includes("from 'react'") || code.includes('from "react"');
    const hasRemotionImport = code.includes("from 'remotion'") || code.includes('from "remotion"');
    
    if (!hasReactImport && !hasRemotionImport) {
      console.warn(`Component ${componentName} missing React/Remotion imports`);
      return false;
    }

    // Must contain function definition
    if (!code.includes('function ') && !code.includes(': React.FC') && !code.includes('= ()') && !code.includes('=> {')) {
      console.warn(`Component ${componentName} missing valid React component definition`);
      return false;
    }

    // Must actually contain the component name in the code
    if (!code.includes(componentName)) {
      console.warn(`Component ${componentName} name not found in code - possible mismatch`);
      return false;
    }

    return true;
  }

  /**
   * Safe Root.tsx updates with built-in deduplication
   */
  private async updateRootTsxSafely(newComponentName: string, options: ComponentEntry): Promise<void> {
    // Read current components from filesystem (handles corruption automatically)
    const existingComponents = await this.scanExistingComponents();
    
    // Add new component with automatic deduplication
    const updatedComponents = this.deduplicateComponents([
      ...existingComponents,
      options
    ]);
    
    // Generate clean content
    const cleanContent = this.generateCleanRootTsx(updatedComponents);
    
    // Atomic write to prevent corruption
    await this.atomicWrite(this.rootTsxPath, cleanContent);
    
    // console.log(`Root.tsx updated safely with component: ${newComponentName}`); // DISABLED: Prevents JSON pollution
  }

  /**
   * Validate that a component file exists and exports a valid React component
   */
  private async validateComponent(componentFilePath: string): Promise<boolean> {
    try {
      // Check file exists and is readable
      const stats = await fs.stat(componentFilePath);
      if (!stats.isFile() || stats.size === 0) {
        return false;
      }

      // Read and validate component code
      const code = await fs.readFile(componentFilePath, 'utf8');
      
      // Must contain 'export default' - this prevents undefined component errors
      if (!code.includes('export default')) {
        console.warn(`Component missing export default: ${componentFilePath}`);
        return false;
      }

      // Should contain React/Remotion imports (basic sanity check)
      const hasReactImport = code.includes("from 'react'") || code.includes('from "react"');
      const hasRemotionImport = code.includes("from 'remotion'") || code.includes('from "remotion"');
      
      if (!hasReactImport && !hasRemotionImport) {
        console.warn(`Component missing React/Remotion imports: ${componentFilePath}`);
        return false;
      }

      // Basic syntax validation - must contain component definition
      if (!code.includes('function ') && !code.includes(': React.FC') && !code.includes('= ()')) {
        console.warn(`Component missing valid function definition: ${componentFilePath}`);
        return false;
      }

      return true;
      
    } catch (error) {
      console.warn(`Component validation failed: ${componentFilePath} - ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Scan filesystem for actual components with validation (prevents undefined errors)
   */
  private async scanExistingComponents(): Promise<ComponentEntry[]> {
    const components: ComponentEntry[] = [];
    
    try {
      await fs.access(this.componentsDir);
      const files = await fs.readdir(this.componentsDir);
      
      for (const file of files) {
        if (file.endsWith('.tsx') && file !== 'index.tsx') {
          const componentName = file.replace('.tsx', '');
          const componentFilePath = path.join(this.componentsDir, file);
          
          // NEW: Validate component before adding to Root.tsx
          const isValid = await this.validateComponent(componentFilePath);
          
          if (isValid) {
            // Read component file to extract metadata
            const content = await fs.readFile(componentFilePath, 'utf8');
            
            components.push({
              name: componentName,
              path: `./components/${componentName}`,
              duration: this.extractDurationFromCode(content) || 90,
              width: 1920,
              height: 1080
            });
            
            // console.log(`Valid component found: ${componentName}`); // DISABLED: Prevents JSON pollution
          } else {
            console.warn(`Invalid component excluded: ${componentName} (prevents undefined errors)`);
          }
        }
      }
    } catch (error) {
      console.warn('Components directory not found, starting fresh');
    }
    
    // console.log(`Found ${components.length} valid, exportable components`); // DISABLED: Prevents JSON pollution
    return components;
  }

  /**
   * Remove duplicates based on component name (prevents accumulation)
   */
  private deduplicateComponents(components: ComponentEntry[]): ComponentEntry[] {
    const seen = new Set<string>();
    const deduplicated = components.filter(component => {
      if (seen.has(component.name)) {
        // console.log(`Removing duplicate component: ${component.name}`); // DISABLED: Prevents JSON pollution
        return false;
      }
      seen.add(component.name);
      return true;
    });
    
    // console.log(`Deduplicated: ${components.length} -> ${deduplicated.length} components`); // DISABLED: Prevents JSON pollution
    return deduplicated;
  }

  /**
   * Generate clean, valid Root.tsx content
   */
  private generateCleanRootTsx(components: ComponentEntry[]): string {
    // Generate imports (sorted for consistency)
    const sortedComponents = components.sort((a, b) => a.name.localeCompare(b.name));
    const imports = sortedComponents
      .map(comp => `import ${comp.name} from '${comp.path}';`)
      .join('\n');

    // Generate compositions (sorted for consistency)
    const compositions = sortedComponents
      .map(comp => `      <Composition
        id="${comp.name}"
        component={${comp.name}}
        durationInFrames={${comp.duration}}
        fps={30}
        width={${comp.width}}
        height={${comp.height}}
      />`)
      .join('\n');

    // Return clean, properly formatted Root.tsx
    return `import { Composition } from 'remotion';
${imports}

export const RemotionRoot: React.FC = () => {
  return (
    <>
${compositions}
    </>
  );
};
`;
  }

  /**
   * Atomic file write to prevent corruption during write operations
   */
  private async atomicWrite(filePath: string, content: string): Promise<void> {
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // Use atomic write to prevent file corruption
    return new Promise<void>((resolve, reject) => {
      writeFileAtomic(filePath, content, { encoding: 'utf8' }, (error: any) => {
        if (error) {
          reject(new Error(`Atomic write failed for ${filePath}: ${error.message}`));
        } else {
          // console.log(`Atomic write successful: ${filePath}`); // DISABLED: Prevents JSON pollution
          resolve();
        }
      });
    });
  }

  /**
   * Validate Root.tsx health and detect corruption patterns
   */
  async validateRootTsx(): Promise<{ isHealthy: boolean; issues: string[]; componentsFound: number }> {
    const issues: string[] = [];
    let componentsFound = 0;

    try {
      // Check if Root.tsx exists
      const rootExists = await fs.access(this.rootTsxPath).then(() => true).catch(() => false);
      if (!rootExists) {
        issues.push('Root.tsx file missing');
        return { isHealthy: false, issues, componentsFound };
      }

      // Read and analyze content
      const content = await fs.readFile(this.rootTsxPath, 'utf8');
      
      // Check for duplicate imports
      const importLines = content.match(/^import .* from ['"][^'"]*['"];$/gm) || [];
      const uniqueImports = new Set(importLines);
      if (importLines.length > uniqueImports.size) {
        issues.push(`${importLines.length - uniqueImports.size} duplicate import statements found`);
      }

      // Check for duplicate composition IDs
      const compositionIds = (content.match(/id=["']([^"']+)["']/g) || [])
        .map(match => match.match(/id=["']([^"']+)["']/)?.[1])
        .filter(Boolean);
      const uniqueIds = new Set(compositionIds);
      if (compositionIds.length > uniqueIds.size) {
        issues.push(`${compositionIds.length - uniqueIds.size} duplicate composition IDs found`);
      }

      // Check for malformed syntax
      if (content.includes('undefined') && content.includes('component={')) {
        issues.push('Undefined component references detected');
      }

      // Count actual filesystem components
      const fsComponents = await this.scanExistingComponents();
      componentsFound = fsComponents.length;

      // Check if Root.tsx has more compositions than filesystem components
      if (compositionIds.length > componentsFound * 2) {
        issues.push('Excessive composition entries compared to filesystem components');
      }

    } catch (error) {
      issues.push(`Validation error: ${(error as Error).message}`);
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      componentsFound
    };
  }

  /**
   * Extract duration from component code (basic regex approach)
   */
  private extractDurationFromCode(code: string): number | null {
    // Look for common duration patterns in component code
    const durationMatch = code.match(/durationInFrames[:\s=]+(\d+)/i);
    if (durationMatch) {
      return parseInt(durationMatch[1], 10);
    }

    // Default duration if not specified
    return null;
  }

  /**
   * Get Root.tsx file path for external access
   */
  getRootTsxPath(): string {
    return this.rootTsxPath;
  }

  /**
   * Get components directory path for external access
   */
  getComponentsDir(): string {
    return this.componentsDir;
  }
}