/**
 * Color Grading Library for Remotion
 *
 * Cinematic color grading presets using CSS filters and overlays.
 * Professional film-quality looks: cinematic, vintage, dramatic, dreamy, neon.
 */

import React from 'remotion';

/**
 * Color grading configuration
 */
export interface ColorGradeConfig {
  filter?: string; // CSS filter string
  overlay?: string; // Background gradient overlay
  mixBlendMode?: string; // Blend mode for overlay
  opacity?: number; // Overlay opacity
}

/**
 * Apply color grading to an element
 */
export const applyColorGrade = (config: ColorGradeConfig): React.CSSProperties => {
  return {
    filter: config.filter,
    position: 'relative',
  };
};

/**
 * Create color grading overlay layer
 */
export const createColorGradeOverlay = (config: ColorGradeConfig): React.CSSProperties => {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: config.overlay,
    mixBlendMode: (config.mixBlendMode as any) || 'normal',
    opacity: config.opacity || 1,
    pointerEvents: 'none',
  };
};

/**
 * CINEMATIC PRESETS
 */

/**
 * Teal and Orange (Hollywood blockbuster look)
 */
export const cinematicTealOrange: ColorGradeConfig = {
  filter: 'saturate(1.2) contrast(1.1) brightness(1.05)',
  overlay: `
    linear-gradient(
      135deg,
      rgba(0, 150, 180, 0.15) 0%,
      rgba(255, 120, 50, 0.15) 100%
    )
  `,
  mixBlendMode: 'overlay',
  opacity: 0.7,
};

/**
 * Desaturated (Serious drama look)
 */
export const cinematicDesaturated: ColorGradeConfig = {
  filter: 'saturate(0.6) contrast(1.15) brightness(0.95)',
  overlay: `
    linear-gradient(
      to bottom,
      rgba(20, 30, 40, 0.2) 0%,
      rgba(10, 15, 20, 0.3) 100%
    )
  `,
  mixBlendMode: 'multiply',
  opacity: 0.8,
};

/**
 * High Contrast (Christopher Nolan style)
 */
export const cinematicHighContrast: ColorGradeConfig = {
  filter: 'contrast(1.3) saturate(0.9) brightness(1.05)',
  overlay: `
    radial-gradient(
      ellipse at center,
      transparent 40%,
      rgba(0, 0, 0, 0.4) 100%
    )
  `,
  mixBlendMode: 'normal',
  opacity: 1,
};

/**
 * Bleach Bypass (War film look)
 */
export const cinematicBleachBypass: ColorGradeConfig = {
  filter: 'saturate(0.4) contrast(1.4) brightness(1.1)',
  overlay: `
    linear-gradient(
      to bottom,
      rgba(200, 200, 180, 0.2) 0%,
      rgba(180, 180, 160, 0.2) 100%
    )
  `,
  mixBlendMode: 'overlay',
  opacity: 0.6,
};

/**
 * VINTAGE PRESETS
 */

/**
 * Warm Sepia (1970s photos)
 */
export const vintageWarmSepia: ColorGradeConfig = {
  filter: 'sepia(0.6) saturate(1.3) contrast(0.95) brightness(1.05)',
  overlay: `
    radial-gradient(
      ellipse at center,
      rgba(255, 220, 170, 0.15) 0%,
      rgba(200, 150, 100, 0.3) 100%
    )
  `,
  mixBlendMode: 'overlay',
  opacity: 0.8,
};

/**
 * Faded Film (1980s look)
 */
export const vintageFadedFilm: ColorGradeConfig = {
  filter: 'saturate(0.7) contrast(0.85) brightness(1.1)',
  overlay: `
    linear-gradient(
      to bottom,
      rgba(255, 230, 200, 0.2) 0%,
      rgba(230, 210, 190, 0.25) 100%
    )
  `,
  mixBlendMode: 'screen',
  opacity: 0.5,
};

/**
 * VHS Tape (Retro video)
 */
export const vintageVHS: ColorGradeConfig = {
  filter: 'saturate(1.5) contrast(0.9) brightness(0.95) hue-rotate(5deg)',
  overlay: `
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.03) 0px,
      transparent 2px,
      transparent 4px
    )
  `,
  mixBlendMode: 'normal',
  opacity: 1,
};

/**
 * Old Photograph (Early 1900s)
 */
export const vintageOldPhoto: ColorGradeConfig = {
  filter: 'sepia(0.9) contrast(1.1) brightness(1.15)',
  overlay: `
    radial-gradient(
      ellipse at center,
      rgba(255, 240, 220, 0) 30%,
      rgba(180, 140, 100, 0.4) 100%
    )
  `,
  mixBlendMode: 'multiply',
  opacity: 0.9,
};

/**
 * DRAMATIC PRESETS
 */

/**
 * High Drama (High contrast, deep shadows)
 */
export const dramaticHighDrama: ColorGradeConfig = {
  filter: 'contrast(1.5) saturate(1.2) brightness(0.9)',
  overlay: `
    radial-gradient(
      ellipse at center,
      transparent 20%,
      rgba(0, 0, 0, 0.6) 100%
    )
  `,
  mixBlendMode: 'normal',
  opacity: 1,
};

/**
 * Moody Blue (Thriller/mystery look)
 */
export const dramaticMoodyBlue: ColorGradeConfig = {
  filter: 'saturate(0.8) contrast(1.2) brightness(0.85) hue-rotate(10deg)',
  overlay: `
    linear-gradient(
      135deg,
      rgba(0, 50, 100, 0.3) 0%,
      rgba(20, 20, 40, 0.4) 100%
    )
  `,
  mixBlendMode: 'multiply',
  opacity: 0.8,
};

/**
 * Golden Hour (Warm sunset)
 */
export const dramaticGoldenHour: ColorGradeConfig = {
  filter: 'saturate(1.3) contrast(1.1) brightness(1.1)',
  overlay: `
    linear-gradient(
      to top,
      rgba(255, 150, 50, 0.3) 0%,
      rgba(255, 200, 100, 0.2) 50%,
      rgba(150, 180, 255, 0.1) 100%
    )
  `,
  mixBlendMode: 'overlay',
  opacity: 0.7,
};

/**
 * DREAMY PRESETS
 */

/**
 * Soft Pastels (Romantic/ethereal)
 */
export const dreamySoftPastels: ColorGradeConfig = {
  filter: 'saturate(1.4) contrast(0.85) brightness(1.15)',
  overlay: `
    radial-gradient(
      ellipse at center,
      rgba(255, 230, 240, 0.2) 0%,
      rgba(230, 240, 255, 0.25) 100%
    )
  `,
  mixBlendMode: 'screen',
  opacity: 0.6,
};

/**
 * Hazy Glow (Dreamy blur)
 */
export const dreamyHazyGlow: ColorGradeConfig = {
  filter: 'saturate(1.2) contrast(0.9) brightness(1.2) blur(0.5px)',
  overlay: `
    radial-gradient(
      ellipse at center,
      rgba(255, 255, 255, 0.15) 0%,
      transparent 70%
    )
  `,
  mixBlendMode: 'screen',
  opacity: 0.8,
};

/**
 * Fairy Tale (Magical/fantasy)
 */
export const dreamyFairyTale: ColorGradeConfig = {
  filter: 'saturate(1.5) contrast(0.95) brightness(1.1) hue-rotate(-5deg)',
  overlay: `
    radial-gradient(
      ellipse at 30% 30%,
      rgba(255, 200, 255, 0.2) 0%,
      rgba(200, 230, 255, 0.15) 50%,
      rgba(255, 255, 200, 0.1) 100%
    )
  `,
  mixBlendMode: 'screen',
  opacity: 0.7,
};

/**
 * NEON PRESETS
 */

/**
 * Cyberpunk (Vibrant neon)
 */
export const neonCyberpunk: ColorGradeConfig = {
  filter: 'saturate(1.8) contrast(1.3) brightness(1.1)',
  overlay: `
    linear-gradient(
      135deg,
      rgba(255, 0, 150, 0.2) 0%,
      rgba(0, 200, 255, 0.2) 50%,
      rgba(150, 0, 255, 0.2) 100%
    )
  `,
  mixBlendMode: 'screen',
  opacity: 0.5,
};

/**
 * Synthwave (80s retro neon)
 */
export const neonSynthwave: ColorGradeConfig = {
  filter: 'saturate(1.6) contrast(1.2) brightness(1.05) hue-rotate(-10deg)',
  overlay: `
    linear-gradient(
      to bottom,
      rgba(255, 0, 150, 0.15) 0%,
      rgba(100, 0, 200, 0.2) 50%,
      rgba(0, 200, 255, 0.15) 100%
    )
  `,
  mixBlendMode: 'overlay',
  opacity: 0.7,
};

/**
 * Electric Dreams (Bright neon)
 */
export const neonElectricDreams: ColorGradeConfig = {
  filter: 'saturate(2) contrast(1.4) brightness(1.15)',
  overlay: `
    radial-gradient(
      ellipse at 50% 50%,
      rgba(0, 255, 255, 0.2) 0%,
      rgba(255, 0, 255, 0.2) 50%,
      rgba(255, 255, 0, 0.1) 100%
    )
  `,
  mixBlendMode: 'screen',
  opacity: 0.6,
};

/**
 * SPECIAL PRESETS
 */

/**
 * Matrix (Green monochrome)
 */
export const specialMatrix: ColorGradeConfig = {
  filter: 'saturate(0) contrast(1.3) brightness(0.9) hue-rotate(90deg)',
  overlay: `
    linear-gradient(
      to bottom,
      rgba(0, 255, 0, 0.1) 0%,
      rgba(0, 150, 0, 0.2) 100%
    )
  `,
  mixBlendMode: 'screen',
  opacity: 0.8,
};

/**
 * Black and White (Classic)
 */
export const specialBlackWhite: ColorGradeConfig = {
  filter: 'grayscale(1) contrast(1.2) brightness(1.05)',
  overlay: `
    radial-gradient(
      ellipse at center,
      transparent 50%,
      rgba(0, 0, 0, 0.3) 100%
    )
  `,
  mixBlendMode: 'normal',
  opacity: 1,
};

/**
 * Film Noir (Classic noir)
 */
export const specialFilmNoir: ColorGradeConfig = {
  filter: 'grayscale(1) contrast(1.8) brightness(0.85)',
  overlay: `
    radial-gradient(
      ellipse at 30% 30%,
      transparent 20%,
      rgba(0, 0, 0, 0.7) 100%
    )
  `,
  mixBlendMode: 'normal',
  opacity: 1,
};

/**
 * Infrared (Heat vision)
 */
export const specialInfrared: ColorGradeConfig = {
  filter: 'saturate(2) contrast(1.3) brightness(1.1) hue-rotate(180deg) invert(0.1)',
  overlay: `
    linear-gradient(
      to bottom,
      rgba(255, 0, 100, 0.2) 0%,
      rgba(150, 0, 200, 0.25) 100%
    )
  `,
  mixBlendMode: 'screen',
  opacity: 0.6,
};

/**
 * All presets collection
 */
export const colorGradePresets = {
  // Cinematic
  cinematicTealOrange,
  cinematicDesaturated,
  cinematicHighContrast,
  cinematicBleachBypass,

  // Vintage
  vintageWarmSepia,
  vintageFadedFilm,
  vintageVHS,
  vintageOldPhoto,

  // Dramatic
  dramaticHighDrama,
  dramaticMoodyBlue,
  dramaticGoldenHour,

  // Dreamy
  dreamySoftPastels,
  dreamyHazyGlow,
  dreamyFairyTale,

  // Neon
  neonCyberpunk,
  neonSynthwave,
  neonElectricDreams,

  // Special
  specialMatrix,
  specialBlackWhite,
  specialFilmNoir,
  specialInfrared,
};

/**
 * Usage Examples:
 *
 * // 1. Apply color grade to container
 * <div style={applyColorGrade(cinematicTealOrange)}>
 *   Your content
 * </div>
 *
 * // 2. Add overlay layer
 * <AbsoluteFill style={createColorGradeOverlay(vintageWarmSepia)} />
 *
 * // 3. Complete setup
 * <AbsoluteFill style={applyColorGrade(neonCyberpunk)}>
 *   <AbsoluteFill style={createColorGradeOverlay(neonCyberpunk)} />
 *   Your animated content
 * </AbsoluteFill>
 *
 * // 4. Custom color grade
 * const customGrade: ColorGradeConfig = {
 *   filter: 'saturate(1.3) contrast(1.1)',
 *   overlay: 'linear-gradient(to right, rgba(255,0,0,0.2), rgba(0,0,255,0.2))',
 *   mixBlendMode: 'overlay',
 *   opacity: 0.5
 * };
 */