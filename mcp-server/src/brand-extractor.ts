/**
 * Brand Asset Extractor
 *
 * Extracts color palettes from brand logos/images
 * Uses simple dominant color extraction (no ML needed)
 */

import * as fs from 'fs';
import * as path from 'path';

export interface BrandPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  source: 'extracted' | 'default';
  extraction_method: string;
}

export interface ColorExtractionResult {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  area: number;  // Percentage of image
}

/**
 * Extract brand palette from logo (will use extract-colors when available)
 */
export async function extractBrandPalette(
  logoPath: string,
  fallbackStyle: string = 'tech'
): Promise<BrandPalette> {

  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.warn(`Logo not found: ${logoPath}, using default ${fallbackStyle} palette`);
    return getDefaultPalette(fallbackStyle);
  }

  try {
    // TODO: Implement with extract-colors package when installed
    // For now, return default palette
    // const extractColors = require('extract-colors');
    // const colors = await extractColors(logoPath);

    console.log(`Brand extraction not yet implemented, using default ${fallbackStyle} palette`);
    return getDefaultPalette(fallbackStyle);

  } catch (error) {
    console.error('Brand extraction failed:', error);
    return getDefaultPalette(fallbackStyle);
  }
}

/**
 * Get default palette based on style
 */
export function getDefaultPalette(style: string): BrandPalette {
  const palettes: Record<string, BrandPalette> = {
    tech: {
      primary: '#0a0a0a',      // Dark background
      secondary: '#1a1a1a',    // Slightly lighter
      accent: '#10b981',       // Green accent (validated from Remotion trailer)
      background: '#0a0a0a',
      text: '#f0f6fc',
      source: 'default',
      extraction_method: 'predefined_tech_palette'
    },

    elegant: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      accent: '#a78bfa',       // Purple accent
      background: '#ffffff',
      text: '#1a1a1a',
      source: 'default',
      extraction_method: 'predefined_elegant_palette'
    },

    corporate: {
      primary: '#1e293b',      // Navy
      secondary: '#334155',
      accent: '#3b82f6',       // Blue accent
      background: '#1e293b',
      text: '#f1f5f9',
      source: 'default',
      extraction_method: 'predefined_corporate_palette'
    },

    vibrant: {
      primary: '#000000',
      secondary: '#1a1a1a',
      accent: '#f59e0b',       // Orange accent
      background: '#000000',
      text: '#ffffff',
      source: 'default',
      extraction_method: 'predefined_vibrant_palette'
    }
  };

  return palettes[style] || palettes.tech;
}

/**
 * Map extracted colors to animation color roles
 */
export function mapColorsToRoles(extractedColors: ColorExtractionResult[]): BrandPalette {
  if (extractedColors.length === 0) {
    return getDefaultPalette('tech');
  }

  // Sort by area (most prominent first)
  const sorted = [...extractedColors].sort((a, b) => b.area - a.area);

  // Heuristic mapping
  const primary = sorted[0];  // Most prominent = primary
  const secondary = sorted[1] || primary;  // Second most = secondary
  const accent = sorted[2] || findMostSaturatedColor(extractedColors);  // Accent = most saturated

  // Determine if dark or light theme based on primary color lightness
  const isDark = primary.hsl.l < 50;

  return {
    primary: primary.hex,
    secondary: secondary.hex,
    accent: accent.hex,
    background: primary.hex,
    text: isDark ? '#f0f6fc' : '#1a1a1a',  // Contrast with background
    source: 'extracted',
    extraction_method: 'dominant_color_analysis'
  };
}

/**
 * Find most saturated color (good for accents)
 */
function findMostSaturatedColor(colors: ColorExtractionResult[]): ColorExtractionResult {
  return colors.reduce((mostSaturated, color) =>
    color.hsl.s > mostSaturated.hsl.s ? color : mostSaturated
  , colors[0]);
}

/**
 * Validate palette has sufficient contrast
 */
export function validatePaletteContrast(palette: BrandPalette): {
  valid: boolean;
  contrastRatio: number;
  recommendation: string;
} {
  const contrastRatio = calculateContrastRatio(palette.text, palette.background);

  // WCAG AAA requires 7:1 for normal text
  const valid = contrastRatio >= 7.0;

  return {
    valid,
    contrastRatio,
    recommendation: valid
      ? '✅ Sufficient contrast (WCAG AAA compliant)'
      : `❌ Insufficient contrast (${contrastRatio.toFixed(2)}:1, need 7:1). Adjust text or background color.`
  };
}

/**
 * Calculate WCAG contrast ratio
 */
function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(hexToRgb(color1));
  const lum2 = getLuminance(hexToRgb(color2));

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Usage Example:
 *
 * // 1. Extract from logo
 * const palette = await extractBrandPalette('./assets/logo.png', 'tech');
 * console.log(`Primary: ${palette.primary}, Accent: ${palette.accent}`);
 *
 * // 2. Validate contrast
 * const contrastCheck = validatePaletteContrast(palette);
 * console.log(contrastCheck.recommendation);
 *
 * // 3. Get default palette
 * const techPalette = getDefaultPalette('tech');
 * // Returns validated tech palette from Remotion trailer analysis
 *
 * // 4. Map extracted colors to roles
 * const extractedColors = [
 *   { hex: '#10b981', rgb: {...}, hsl: {...}, area: 0.4 },
 *   { hex: '#0a0a0a', rgb: {...}, hsl: {...}, area: 0.6 }
 * ];
 * const mapped = mapColorsToRoles(extractedColors);
 */
