"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeGenerator = exports.CodeGenerator = void 0;
const base_animation_rules_1 = require("../validation/base-animation-rules");
const template_engine_1 = require("./template-engine");
class CodeGenerator {
    /**
     * Generate animation code from natural language description
     */
    generateFromDescription(description, options = {}) {
        const lowerDesc = description.toLowerCase();
        // Detect animation type from keywords
        if (lowerDesc.includes('bounce') || lowerDesc.includes('ball')) {
            return template_engine_1.templateEngine.generateCode('bouncing-ball', options.props) || this.generateBasicBounce(options);
        }
        if (lowerDesc.includes('slide') || lowerDesc.includes('text')) {
            return template_engine_1.templateEngine.generateCode('sliding-text', {
                text: this.extractTextFromDescription(description),
                ...options.props
            }) || this.generateBasicSlide(options);
        }
        if (lowerDesc.includes('rotate') || lowerDesc.includes('logo') || lowerDesc.includes('spin')) {
            return template_engine_1.templateEngine.generateCode('rotating-logo', options.props) || this.generateBasicRotate(options);
        }
        if (lowerDesc.includes('fade') || lowerDesc.includes('opacity')) {
            return template_engine_1.templateEngine.generateCode('fade-in-out', options.props) || this.generateBasicFade(options);
        }
        // Default to a simple fade animation
        return this.generateBasicFade(options);
    }
    /**
     * Extract text content from description for text animations
     */
    extractTextFromDescription(description) {
        // Look for quoted text or specific phrases
        const quotedText = description.match(/["']([^"']+)["']/);
        if (quotedText) {
            return quotedText[1];
        }
        // Look for common text indicators
        const textIndicators = ['text:', 'says:', 'display:', 'show:'];
        for (const indicator of textIndicators) {
            const index = description.toLowerCase().indexOf(indicator);
            if (index !== -1) {
                const after = description.slice(index + indicator.length).trim();
                return after.split(' ')[0] || 'Hello World';
            }
        }
        return 'Hello World';
    }
    /**
     * Generate basic bouncing ball animation
     */
    generateBasicBounce(options) {
        const componentName = options.componentName || 'BouncingBall';
        const duration = options.duration || 5;
        return `
import { interpolate, spring } from 'remotion';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName} = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bounce = spring({
    frame: frame % 90,
    fps,
    config: { damping: 20 }
  });

  const y = interpolate(bounce, [0, 1], [200, 100]);

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#0a0a0a',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div
        style={{
          width: 80,
          height: 80,
          backgroundColor: '#10b981',
          borderRadius: '50%',
          transform: \`translateY(\${y}px)\`,
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
        }}
      />
    </div>
  );
};
`.trim();
    }
    /**
     * Generate basic sliding text animation
     */
    generateBasicSlide(options) {
        const componentName = options.componentName || 'SlidingText';
        const duration = options.duration || 4;
        return `
import { interpolate } from 'remotion';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName} = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const entry = interpolate(frame, [0, 30], [-500, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const exit = interpolate(frame, [durationInFrames - 30, durationInFrames], [0, 500], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const x = entry + exit;

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#1a1a1a',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 80
    }}>
      <h1
        style={{
          fontSize: 72,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#f0f6fc',
          fontWeight: 'bold',
          textAlign: 'center',
          transform: \`translateX(\${x}px)\`,
          letterSpacing: '-0.02em'
        }}
      >
        Hello World
      </h1>
    </div>
  );
};
`.trim();
    }
    /**
     * Generate basic rotating animation
     */
    generateBasicRotate(options) {
        const componentName = options.componentName || 'RotatingElement';
        const duration = options.duration || 6;
        return `
import { interpolate } from 'remotion';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName} = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const rotation = interpolate(frame, [0, durationInFrames], [0, 360], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const scale = 1 + Math.sin((frame / durationInFrames) * Math.PI * 2) * 0.2;

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#0f172a',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div
        style={{
          width: 150,
          height: 150,
          backgroundColor: '#3b82f6',
          borderRadius: '20px',
          transform: \`rotate(\${rotation}deg) scale(\${scale})\`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold'
        }}
      >
        Content
      </div>
    </div>
  );
};
`.trim();
    }
    /**
     * Generate basic fade animation
     */
    generateBasicFade(options) {
        const componentName = options.componentName || 'FadeInOut';
        const duration = options.duration || 3;
        return `
import { interpolate } from 'remotion';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName} = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 30, durationInFrames - 30, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#18181b',
      justifyContent: 'center',
      alignItems: 'center',
      opacity
    }}>
      <div style={{
        fontSize: 48,
        color: '#f0f6fc',
        textAlign: 'center'
      }}>
        Hello World
      </div>
    </div>
  );
};
`.trim();
    }
    /**
     * Validate generated code against base rules
     */
    validateCode(code) {
        // For now, do basic syntax and structure validation
        // In a full implementation, this would use TypeScript AST parsing
        const violations = [];
        const warnings = [];
        // Check for required imports
        if (!code.includes('import') && !code.includes('from "remotion"')) {
            violations.push('Missing Remotion imports');
        }
        // Check for component export
        if (!code.includes('export const') && !code.includes('export default')) {
            violations.push('Missing component export');
        }
        // Check for useCurrentFrame hook (most animations need this)
        if (!code.includes('useCurrentFrame')) {
            warnings.push('Animation does not use useCurrentFrame hook - may be static');
        }
        // Check for return statement
        if (!code.includes('return') && !code.includes('return (')) {
            violations.push('Component must return JSX');
        }
        // Check for basic style properties
        if (!code.includes('style')) {
            warnings.push('Component does not include any styling');
        }
        // Apply base animation rules
        const baseValidation = (0, base_animation_rules_1.enforceBaseRules)({
            font: code.includes('fontFamily') ? 'system-ui' : undefined,
            scenes: [{
                    component: code.includes('NoOverlapScene') ? 'NoOverlapScene' : 'div',
                    continuous_motion: code.includes('useCurrentFrame')
                }]
        });
        violations.push(...baseValidation.violations);
        return {
            valid: violations.length === 0,
            violations,
            warnings
        };
    }
}
exports.CodeGenerator = CodeGenerator;
// Singleton instance
exports.codeGenerator = new CodeGenerator();
