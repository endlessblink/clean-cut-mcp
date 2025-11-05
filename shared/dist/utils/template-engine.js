"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateEngine = exports.TemplateEngine = void 0;
class TemplateEngine {
    constructor() {
        this.templates = new Map();
        this.initializeDefaultTemplates();
    }
    initializeDefaultTemplates() {
        // Basic animation templates
        this.addTemplate({
            id: 'bouncing-ball',
            name: 'Bouncing Ball',
            description: 'A colorful ball that bounces with physics',
            category: 'basic',
            code: this.generateBouncingBallCode(),
            duration: 5
        });
        this.addTemplate({
            id: 'sliding-text',
            name: 'Sliding Text',
            description: 'Text slides in from the left with smooth motion',
            category: 'text',
            code: this.generateSlidingTextCode(),
            duration: 4
        });
        this.addTemplate({
            id: 'rotating-logo',
            name: 'Rotating Logo',
            description: 'Logo rotates 360 degrees with scaling effect',
            category: 'logo',
            code: this.generateRotatingLogoCode(),
            duration: 6
        });
        this.addTemplate({
            id: 'fade-in-out',
            name: 'Fade In/Out',
            description: 'Smooth opacity transition in and out',
            category: 'basic',
            code: this.generateFadeInOutCode(),
            duration: 3
        });
    }
    generateBouncingBallCode() {
        return `
import { interpolate, spring } from 'remotion';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const BouncingBall = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bounce = spring({
    frame: frame % 90, // Reset every 3 seconds at 30fps
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
    generateSlidingTextCode() {
        return `
import { interpolate } from 'remotion';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const SlidingText = ({ text = 'Hello World' }) => {
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
        {text}
      </h1>
    </div>
  );
};
`.trim();
    }
    generateRotatingLogoCode() {
        return `
import { interpolate, spring } from 'remotion';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const RotatingLogo = ({ logoUrl, scale = 1.5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rotation = interpolate(frame, [0, 180], [0, 360], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const scaleValue = spring({
    frame,
    fps,
    config: { damping: 15 }
  });

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#0f172a',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div
        style={{
          width: 200,
          height: 200,
          backgroundImage: logoUrl ? \`url(\${logoUrl})\` : undefined,
          backgroundColor: logoUrl ? 'transparent' : '#3b82f6',
          borderRadius: '20px',
          transform: \`rotate(\${rotation}deg) scale(\${scaleValue * scale})\`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold'
        }}
      >
        {!logoUrl && 'LOGO'}
      </div>
    </div>
  );
};
`.trim();
    }
    generateFadeInOutCode() {
        return `
import { interpolate } from 'remotion';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const FadeInOut = ({ children }) => {
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
      {children || (
        <div style={{
          fontSize: 48,
          color: '#f0f6fc',
          textAlign: 'center'
        }}>
          Content Here
        </div>
      )}
    </div>
  );
};
`.trim();
    }
    addTemplate(template) {
        this.templates.set(template.id, template);
    }
    getTemplate(id) {
        return this.templates.get(id);
    }
    getTemplatesByCategory(category) {
        return Array.from(this.templates.values()).filter(template => template.category === category);
    }
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    searchTemplates(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.templates.values()).filter(template => template.name.toLowerCase().includes(lowerQuery) ||
            template.description.toLowerCase().includes(lowerQuery) ||
            template.category.toLowerCase().includes(lowerQuery));
    }
    generateCode(templateId, props = {}) {
        const template = this.getTemplate(templateId);
        if (!template)
            return null;
        let code = template.code;
        // Replace props in template code
        Object.entries(props).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            code = code.replace(new RegExp(placeholder, 'g'), String(value));
        });
        return code;
    }
}
exports.TemplateEngine = TemplateEngine;
// Singleton instance
exports.templateEngine = new TemplateEngine();
