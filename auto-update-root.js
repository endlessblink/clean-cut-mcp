#!/usr/bin/env node
/**
 * Auto-Update Root.tsx Generator
 * Scans workspace for animation components and regenerates Root.tsx
 * Can be called by MCP tools to maintain automatic registration
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_SRC = process.env.DOCKER_CONTAINER === 'true' ? '/workspace/src' : './clean-cut-workspace';
const ROOT_FILE = path.join(WORKSPACE_SRC, 'Root.tsx');

// Smart duration assignment based on component name patterns
const getDurationForComponent = (name) => {
  const nameLC = name.toLowerCase();

  if (nameLC.includes('showcase') || nameLC.includes('demo')) return 450; // 15 seconds
  if (nameLC.includes('social') || nameLC.includes('feed')) return 600;   // 20 seconds
  if (nameLC.includes('tweet') || nameLC.includes('text')) return 300;    // 10 seconds
  if (nameLC.includes('floating') || nameLC.includes('orb')) return 300;  // 10 seconds
  if (nameLC.includes('transition') || nameLC.includes('graceful')) return 900; // 30 seconds
  if (nameLC.includes('github') || nameLC.includes('profile')) return 480; // 16 seconds
  if (nameLC.includes('particle') || nameLC.includes('effect')) return 360; // 12 seconds

  // Default duration for unknown component types
  return 360; // 12 seconds
};

// Generate component description based on name
const getComponentDescription = (name) => {
  const nameLC = name.toLowerCase();

  if (nameLC.includes('github')) return 'GitHub profile showcase animation';
  if (nameLC.includes('product')) return 'Product presentation animation';
  if (nameLC.includes('social')) return 'Social media feed animation';
  if (nameLC.includes('tweet')) return 'Twitter-style text animation';
  if (nameLC.includes('floating')) return 'Floating orb particle effects';
  if (nameLC.includes('transition')) return 'Professional transition effects';
  if (nameLC.includes('showcase')) return 'Showcase presentation animation';
  if (nameLC.includes('particle')) return 'Particle effect animation';

  return `${name} animation component`;
};

// Discover all animation components
const discoverComponents = () => {
  try {
    const files = fs.readdirSync(WORKSPACE_SRC);

    const components = files
      .filter(file => {
        // Include .tsx files but exclude system files
        return file.endsWith('.tsx') &&
               !['Root.tsx', 'Composition.tsx', 'index.ts'].includes(file);
      })
      .map(file => {
        const name = file.replace('.tsx', '');
        return {
          name,
          component: name,
          duration: getDurationForComponent(name),
          description: getComponentDescription(name)
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    console.error(`[AUTO-UPDATE] Found ${components.length} animation components:`,
      components.map(c => c.name).join(', '));

    return components;
  } catch (error) {
    console.error('[AUTO-UPDATE] Error discovering components:', error);
    return [];
  }
};

// Generate Root.tsx content
const generateRootTsx = (components) => {
  const imports = components
    .map(comp => `import {${comp.name}} from '.assets/animations/${comp.name}';`)
    .join('\n');

  const registry = components
    .map(comp => `  {
    name: '${comp.name}',
    component: ${comp.name},
    duration: ${comp.duration},
    description: '${comp.description}'
  }`)
    .join(',\n');

  return `import React from 'react';
import {Composition} from 'remotion';
import {Comp} from './Composition';

// AUTO-GENERATED IMPORTS - Updated by MCP tools
${imports}

// Component Registry - Automatically maintained
const COMPONENT_REGISTRY = [
${registry}
];

export const RemotionRoot: React.FC = () => {
  // Log registered components for debugging
  console.error(\`[AUTO-REGISTRY] Registered \${COMPONENT_REGISTRY.length} animations:\`,
    COMPONENT_REGISTRY.map(c => c.name).join(', '));

  return (
    <>
      {/* Main composition */}
      <Composition
        id="Main"
        component={Comp}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Auto-registered components */}
      {COMPONENT_REGISTRY.map((comp) => (
        <Composition
          key={comp.name}
          id={comp.name}
          component={comp.component}
          durationInFrames={comp.duration}
          fps={30}
          width={1920}
          height={1080}
        />
      ))}
    </>
  );
};`;
};

// Main function
const updateRootTsx = () => {
  try {
    console.error('[AUTO-UPDATE] Scanning for animation components...');
    const components = discoverComponents();

    console.error('[AUTO-UPDATE] Generating new Root.tsx...');
    const rootContent = generateRootTsx(components);

    console.error('[AUTO-UPDATE] Writing Root.tsx...');
    fs.writeFileSync(ROOT_FILE, rootContent, 'utf8');

    console.error(`[AUTO-UPDATE] ✅ Successfully updated Root.tsx with ${components.length} components`);
    return { success: true, componentCount: components.length, components: components.map(c => c.name) };
  } catch (error) {
    console.error('[AUTO-UPDATE] ❌ Error updating Root.tsx:', error);
    return { success: false, error: error.message };
  }
};

// Run if called directly
if (require.main === module) {
  updateRootTsx();
}

module.exports = { updateRootTsx, discoverComponents, generateRootTsx };