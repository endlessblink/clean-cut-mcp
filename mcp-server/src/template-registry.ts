/**
 * Template Registry System
 *
 * Loads, stores, and manages template metadata
 * Provides access to template library for selection algorithm
 */

import * as fs from 'fs';
import * as path from 'path';
import type { AnimationTemplate, TemplateCategory, TemplateRegistryEntry } from './template-types';

// Registry file location (environment-aware)
const REGISTRY_PATH = process.env.DOCKER_CONTAINER === 'true'
  ? '/workspace/src/patterns/metadata/template-registry.json'
  : path.join(__dirname, '../../clean-cut-workspace/src/patterns/metadata/template-registry.json');

/**
 * Load all templates from registry
 */
export function loadTemplateRegistry(): AnimationTemplate[] {
  try {
    if (!fs.existsSync(REGISTRY_PATH)) {
      console.warn('[template-registry] Registry file not found, returning empty array');
      return [];
    }

    const content = fs.readFileSync(REGISTRY_PATH, 'utf-8');
    const registry: TemplateRegistryEntry = JSON.parse(content);

    console.log(`[template-registry] Loaded ${registry.templates.length} templates (v${registry.version})`);
    return registry.templates;
  } catch (error) {
    console.error('[template-registry] Failed to load registry:', error.message);
    return [];
  }
}

/**
 * Save template registry
 */
export function saveTemplateRegistry(templates: AnimationTemplate[]): boolean {
  try {
    // Ensure directory exists
    const registryDir = path.dirname(REGISTRY_PATH);
    if (!fs.existsSync(registryDir)) {
      fs.mkdirSync(registryDir, { recursive: true });
    }

    // Count templates per category
    const categories = templates.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<TemplateCategory, number>);

    const registry: TemplateRegistryEntry = {
      templates,
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      categories: categories as any
    };

    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
    console.log(`[template-registry] Saved ${templates.length} templates`);
    return true;
  } catch (error) {
    console.error('[template-registry] Failed to save registry:', error.message);
    return false;
  }
}

/**
 * Add new template to registry
 */
export function addTemplate(template: AnimationTemplate): boolean {
  const templates = loadTemplateRegistry();

  // Check for duplicate ID
  if (templates.some(t => t.id === template.id)) {
    console.error(`[template-registry] Template with ID "${template.id}" already exists`);
    return false;
  }

  templates.push(template);
  return saveTemplateRegistry(templates);
}

/**
 * Update existing template
 */
export function updateTemplate(templateId: string, updates: Partial<AnimationTemplate>): boolean {
  const templates = loadTemplateRegistry();
  const index = templates.findIndex(t => t.id === templateId);

  if (index === -1) {
    console.error(`[template-registry] Template "${templateId}" not found`);
    return false;
  }

  templates[index] = { ...templates[index], ...updates };
  return saveTemplateRegistry(templates);
}

/**
 * Remove template from registry
 */
export function removeTemplate(templateId: string): boolean {
  const templates = loadTemplateRegistry();
  const filtered = templates.filter(t => t.id !== templateId);

  if (filtered.length === templates.length) {
    console.error(`[template-registry] Template "${templateId}" not found`);
    return false;
  }

  return saveTemplateRegistry(filtered);
}

/**
 * Get template statistics
 */
export function getTemplateStats(): {
  total: number;
  byCategory: Record<TemplateCategory, number>;
  byPlatform: Record<string, number>;
  byComplexity: Record<string, number>;
} {
  const templates = loadTemplateRegistry();

  const byCategory = templates.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<TemplateCategory, number>);

  const byPlatform = templates.reduce((acc, t) => {
    t.platforms.forEach(p => {
      acc[p] = (acc[p] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const byComplexity = templates.reduce((acc, t) => {
    acc[t.complexity] = (acc[t.complexity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: templates.length,
    byCategory,
    byPlatform,
    byComplexity
  };
}

/**
 * Initialize registry with empty structure (for first-time setup)
 */
export function initializeRegistry(): boolean {
  const emptyRegistry: TemplateRegistryEntry = {
    templates: [],
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    categories: {
      business: 0,
      social: 0,
      tech: 0,
      education: 0,
      creative: 0
    }
  };

  try {
    const registryDir = path.dirname(REGISTRY_PATH);
    if (!fs.existsSync(registryDir)) {
      fs.mkdirSync(registryDir, { recursive: true });
    }

    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(emptyRegistry, null, 2), 'utf-8');
    console.log('[template-registry] Initialized empty registry');
    return true;
  } catch (error) {
    console.error('[template-registry] Failed to initialize:', error.message);
    return false;
  }
}
