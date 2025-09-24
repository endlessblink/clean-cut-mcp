/**
 * Animation Code Validator - Pre-validation and Error Recovery System
 * Prevents syntax errors before webpack compilation using TypeScript AST analysis
 */

import { Project, SyntaxKind, Node, ts } from 'ts-morph';
import path from 'path';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  fixedCode?: string;
  suggestions: string[];
}

export interface ValidationError {
  type: 'syntax' | 'import' | 'type' | 'component';
  message: string;
  line?: number;
  column?: number;
  fixable: boolean;
  autoFix?: string;
}

export class AnimationValidator {
  private project: Project;

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        jsx: ts.JsxEmit.React,
        strict: false, // Be permissive during validation
        noEmit: true
      }
    });
  }

  /**
   * Validate React/Remotion animation component code
   */
  async validateAnimationCode(code: string, componentName: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      suggestions: []
    };

    try {
      // Create temporary source file for AST analysis
      const fileName = `${componentName}.tsx`;
      const sourceFile = this.project.createSourceFile(fileName, code, { overwrite: true });

      // Run validation checks
      await this.checkSyntaxErrors(sourceFile, result);
      await this.checkReactComponent(sourceFile, result, componentName);
      await this.checkRemotionImports(sourceFile, result);
      await this.checkTypeScriptTypes(sourceFile, result, componentName);

      // Attempt auto-fixes if errors found
      if (result.errors.length > 0) {
        const fixedCode = this.attemptAutoFixes(code, result.errors, componentName);
        if (fixedCode) {
          result.fixedCode = fixedCode;
          // Re-validate fixed code
          const revalidation = await this.validateAnimationCode(fixedCode, componentName);
          if (revalidation.isValid) {
            result.isValid = true;
            result.suggestions.push('✅ Auto-fixed syntax errors successfully');
          }
        }
      } else {
        result.isValid = true;
      }

      // Cleanup
      this.project.removeSourceFile(sourceFile);

    } catch (error) {
      result.errors.push({
        type: 'syntax',
        message: `Critical syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fixable: false
      });
    }

    return result;
  }

  /**
   * Check for syntax errors using TypeScript compiler diagnostics
   */
  private async checkSyntaxErrors(sourceFile: any, result: ValidationResult): Promise<void> {
    const diagnostics = sourceFile.getPreEmitDiagnostics();

    for (const diagnostic of diagnostics) {
      const message = diagnostic.getMessageText();
      const messageStr = typeof message === 'string' ? message : message.getMessageText();

      // Skip non-critical warnings
      if (this.shouldIgnoreDiagnostic(messageStr)) {
        continue;
      }

      const start = diagnostic.getStart();
      let line: number | undefined;
      let column: number | undefined;

      if (start !== undefined) {
        const lineAndColumn = sourceFile.getLineAndColumnAtPos(start);
        line = lineAndColumn.line;
        column = lineAndColumn.column;
      }

      result.errors.push({
        type: 'syntax',
        message: messageStr,
        line,
        column,
        fixable: this.isFixableSyntaxError(messageStr)
      });
    }
  }

  /**
   * Check React component structure and export
   */
  private async checkReactComponent(sourceFile: any, result: ValidationResult, componentName: string): Promise<void> {
    // Find React component export
    const exportedFunctions = sourceFile.getExportedDeclarations().get(componentName);

    if (!exportedFunctions || exportedFunctions.length === 0) {
      result.errors.push({
        type: 'component',
        message: `No exported component found with name "${componentName}"`,
        fixable: true,
        autoFix: `Add: export const ${componentName}: React.FC = () => { ... };`
      });
      return;
    }

    // Check for React.FC type annotation
    const componentDeclaration = exportedFunctions[0];
    const typeAnnotation = componentDeclaration.getTypeNode?.()?.getText();

    if (!typeAnnotation || !typeAnnotation.includes('React.FC')) {
      result.suggestions.push(`💡 Consider adding React.FC type annotation: React.FC<${componentName}Props>`);
    }

    // Check for common type annotation errors
    if (typeAnnotation && typeAnnotation.includes(' Props>')) {
      result.errors.push({
        type: 'type',
        message: `Type annotation has space in "Props": found "${typeAnnotation}"`,
        fixable: true,
        autoFix: typeAnnotation.replace(/ Props>/g, 'Props>')
      });
    }
  }

  /**
   * Check required Remotion imports
   */
  private async checkRemotionImports(sourceFile: any, result: ValidationResult): Promise<void> {
    const imports = sourceFile.getImportDeclarations();
    let hasReactImport = false;
    let hasRemotionImports = false;

    for (const importDecl of imports) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();

      if (moduleSpecifier === 'react') {
        hasReactImport = true;
      } else if (moduleSpecifier === 'remotion') {
        hasRemotionImports = true;
      }
    }

    if (!hasReactImport) {
      result.errors.push({
        type: 'import',
        message: 'Missing React import',
        fixable: true,
        autoFix: "import React from 'react';"
      });
    }

    if (!hasRemotionImports) {
      result.suggestions.push("💡 Consider adding Remotion imports: useCurrentFrame, useVideoConfig");
    }
  }

  /**
   * Check TypeScript type definitions and interfaces
   */
  private async checkTypeScriptTypes(sourceFile: any, result: ValidationResult, componentName: string): Promise<void> {
    const interfaces = sourceFile.getInterfaces();
    const expectedInterfaceName = `${componentName}Props`;

    let hasPropsInterface = false;

    for (const interfaceDecl of interfaces) {
      const name = interfaceDecl.getName();
      if (name === expectedInterfaceName) {
        hasPropsInterface = true;

        // Check if interface has at least one property
        const properties = interfaceDecl.getProperties();
        if (properties.length === 0) {
          result.suggestions.push(`💡 Props interface "${name}" is empty. Consider adding meaningful props.`);
        }
      }
    }

    if (!hasPropsInterface && !this.isSimpleComponent(sourceFile)) {
      result.suggestions.push(`💡 Consider defining props interface: interface ${expectedInterfaceName} { ... }`);
    }
  }

  /**
   * Attempt automatic fixes for common errors
   */
  private attemptAutoFixes(code: string, errors: ValidationError[], componentName: string): string | null {
    let fixedCode = code;
    let hasChanges = false;

    for (const error of errors) {
      if (!error.fixable || !error.autoFix) continue;

      switch (error.type) {
        case 'import':
          if (error.message.includes('Missing React import')) {
            fixedCode = "import React from 'react';\n" + fixedCode;
            hasChanges = true;
          }
          break;

        case 'type':
          if (error.message.includes('space in "Props"') && error.autoFix) {
            fixedCode = fixedCode.replace(/ Props>/g, 'Props>');
            hasChanges = true;
          }
          break;

        case 'component':
          // More complex fixes could be implemented here
          break;
      }
    }

    return hasChanges ? fixedCode : null;
  }

  /**
   * Check if diagnostic should be ignored (non-critical warnings)
   */
  private shouldIgnoreDiagnostic(message: string): boolean {
    const ignorePatterns = [
      'Cannot find module', // We're not resolving actual imports
      'is declared but never used', // Common in code generation
      'Property does not exist on type', // We're being permissive
    ];

    return ignorePatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Check if syntax error is potentially fixable
   */
  private isFixableSyntaxError(message: string): boolean {
    const fixablePatterns = [
      'Expected ">" but found',
      'Expected "," but found',
      'Unexpected token',
      'Missing semicolon',
    ];

    return fixablePatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Check if component is simple (no props needed)
   */
  private isSimpleComponent(sourceFile: any): boolean {
    // Look for parameter destructuring in component function
    const functions = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
    const variables = sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration);

    for (const func of functions) {
      const params = func.getParameters();
      if (params.length > 0) return false;
    }

    for (const variable of variables) {
      const init = variable.getInitializer();
      if (init && Node.isArrowFunction(init)) {
        const params = init.getParameters();
        if (params.length > 0) return false;
      }
    }

    return true;
  }

  /**
   * Quick syntax check without full validation (for performance)
   */
  async quickSyntaxCheck(code: string): Promise<boolean> {
    try {
      const sourceFile = this.project.createSourceFile('temp.tsx', code, { overwrite: true });
      const diagnostics = sourceFile.getPreEmitDiagnostics();
      this.project.removeSourceFile(sourceFile);

      // Only check for critical syntax errors
      return !diagnostics.some(d => {
        const msg = d.getMessageText();
        const msgStr = typeof msg === 'string' ? msg : msg.getMessageText();
        return !this.shouldIgnoreDiagnostic(msgStr);
      });
    } catch {
      return false;
    }
  }
}