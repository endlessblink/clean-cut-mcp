/**
 * Template System - Type Definitions
 *
 * Defines metadata schema for 50-template library system
 * Used by selection algorithm to match user prompts to templates
 */

export type TemplateCategory = 'business' | 'social' | 'tech' | 'education' | 'creative';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';
export type Complexity = 'simple' | 'moderate' | 'complex';
export type CharacterCount = 'none' | 'minimal' | 'multiple';
export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'facebook';

/**
 * Complete template metadata
 * Used for storage and selection algorithm
 */
export interface AnimationTemplate {
  // Identity
  id: string;                    // e.g., 'product-showcase'
  name: string;                  // e.g., 'Product Showcase'
  category: TemplateCategory;
  description: string;           // User-facing description

  // Matching data (for selection algorithm)
  keywords: string[];            // ['product', 'feature', 'showcase', 'saas', 'demo']

  // Technical specifications
  defaultDuration: number;       // frames (e.g., 450 = 15 seconds at 30fps)
  aspectRatio: AspectRatio;
  complexity: Complexity;        // Affects render time

  // Content characteristics (30% of selection score)
  textHeavy: boolean;            // true = lots of text, false = visual-focused
  dataVisualization: boolean;    // true = charts/graphs/numbers
  characterCount: CharacterCount; // Animated characters/people

  // Style attributes (10% of selection score)
  energy: number;                // 1-10 (1=calm/slow, 10=fast/energetic)
  professional: number;          // 1-10 (1=playful/fun, 10=corporate/serious)
  colorfulness: number;          // 1-10 (1=monochrome, 10=vibrant/rainbow)

  // Platform optimization (20% of selection score)
  platforms: Platform[];         // Which platforms this template works best for

  // Customization interface
  requiredFields: string[];      // Fields user MUST provide
  optionalFields: string[];      // Fields user CAN override
  exampleData: Record<string, any>; // Example values for preview

  // Component reference
  componentPath: string;         // Relative path to .tsx file

  // Metadata
  createdAt: string;
  version: string;               // Template version (for updates)
  author: string;
}

/**
 * User request analysis result
 * Extracted from natural language prompt
 */
export interface UserRequest {
  originalPrompt: string;
  keywords: string[];
  platform?: Platform;
  aspectRatio?: AspectRatio;
  duration?: number;             // Requested duration in frames
  energy: number;                // Detected energy level (1-10)
  hasData: boolean;              // Contains numbers/charts/stats
  professional: number;          // Detected professionalism level (1-10)
}

/**
 * Template match result with score and explanation
 */
export interface TemplateMatch {
  template: AnimationTemplate;
  score: number;                 // 0-1 confidence score
  reason: string;                // Human-readable explanation
  matchedKeywords: string[];     // Which keywords matched
  warnings?: string[];           // Potential mismatches
}

/**
 * Template customization data
 * User provides this to instantiate template
 */
export interface TemplateCustomization {
  templateId: string;

  // Required fields (varies by template)
  data: Record<string, any>;     // e.g., { title: "MyApp", features: [...] }

  // Optional overrides
  overrides?: {
    colors?: {
      primary?: string;
      accent?: string;
      background?: string;
    };
    fonts?: {
      heading?: string;
      body?: string;
    };
    timing?: {
      duration?: number;
      transitionSpeed?: number;
    };
  };
}

/**
 * Template registry entry
 * Stored in template-registry.json
 */
export interface TemplateRegistryEntry {
  templates: AnimationTemplate[];
  version: string;
  lastUpdated: string;
  categories: {
    [K in TemplateCategory]: number; // Count per category
  };
}
