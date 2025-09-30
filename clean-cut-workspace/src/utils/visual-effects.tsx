/**
 * Visual Effects Library for Remotion
 *
 * Professional glows, shadows, light rays, vignette, chromatic aberration, film grain, and more.
 * All effects use CSS for GPU acceleration.
 */

import React from 'react';
import { interpolate } from 'remotion';
import { ProfessionalEasing } from './professional-easing';

/**
 * GLOW EFFECTS
 */

/**
 * Professional multi-layer glow (not basic box-shadow)
 */
export const createProfessionalGlow = (
  color: string,
  intensity: number = 1,
  size: number = 20
): React.CSSProperties => {
  const layers: string[] = [];

  // Multi-layer glow for depth
  for (let i = 1; i <= 5; i++) {
    const spread = size * i * 0.5;
    const alpha = (intensity * 0.4) / i;
    layers.push(`0 0 ${spread}px ${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
  }

  return {
    boxShadow: layers.join(', '),
    filter: `drop-shadow(0 0 ${size * 2}px ${color})`,
  };
};

/**
 * Animated pulsing glow
 */
export const createPulsingGlow = (
  color: string,
  frame: number,
  speed: number = 0.05,
  minIntensity: number = 0.5,
  maxIntensity: number = 1
): React.CSSProperties => {
  const intensity = interpolate(
    Math.sin(frame * speed),
    [-1, 1],
    [minIntensity, maxIntensity]
  );

  return createProfessionalGlow(color, intensity, 30);
};

/**
 * Neon glow effect
 */
export const createNeonGlow = (color: string): React.CSSProperties => {
  return {
    textShadow: `
      0 0 7px ${color},
      0 0 10px ${color},
      0 0 21px ${color},
      0 0 42px ${color},
      0 0 82px ${color},
      0 0 92px ${color},
      0 0 102px ${color},
      0 0 151px ${color}
    `,
  };
};

/**
 * SHADOW EFFECTS
 */

/**
 * Dynamic shadow with light source
 */
export const createDynamicShadow = (
  lightX: number,
  lightY: number,
  elementX: number,
  elementY: number,
  intensity: number = 1,
  blur: number = 20
): React.CSSProperties => {
  // Calculate shadow offset based on light position
  const offsetX = (elementX - lightX) * 0.1 * intensity;
  const offsetY = (elementY - lightY) * 0.1 * intensity;

  return {
    boxShadow: `${offsetX}px ${offsetY}px ${blur}px rgba(0, 0, 0, ${0.3 * intensity})`,
  };
};

/**
 * Realistic depth shadow (multiple layers)
 */
export const createDepthShadow = (
  elevation: number = 5,
  color: string = '#000000'
): React.CSSProperties => {
  const shadows: string[] = [];

  for (let i = 1; i <= elevation; i++) {
    const offsetY = i * 2;
    const blur = i * 4;
    const opacity = 0.2 / i;
    shadows.push(`0 ${offsetY}px ${blur}px ${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
  }

  return {
    boxShadow: shadows.join(', '),
  };
};

/**
 * Long shadow effect
 */
export const createLongShadow = (
  angle: number,
  length: number,
  color: string = '#000000',
  opacity: number = 0.3
): string => {
  const shadows: string[] = [];
  const angleRad = (angle * Math.PI) / 180;

  for (let i = 1; i <= length; i++) {
    const x = Math.cos(angleRad) * i;
    const y = Math.sin(angleRad) * i;
    const currentOpacity = opacity * (1 - i / length);
    shadows.push(`${x}px ${y}px 0 ${color}${Math.floor(currentOpacity * 255).toString(16).padStart(2, '0')}`);
  }

  return shadows.join(', ');
};

/**
 * LIGHT RAY EFFECTS
 */

/**
 * Volumetric light rays (god rays)
 */
export interface LightRay {
  id: number;
  angle: number;
  width: number;
  length: number;
  opacity: number;
  color: string;
}

export const createLightRays = (
  rayCount: number,
  centerX: number,
  centerY: number,
  color: string = '#ffffff',
  opacity: number = 0.3,
  spread: number = 360
): LightRay[] => {
  const rays: LightRay[] = [];
  const angleStep = spread / rayCount;

  for (let i = 0; i < rayCount; i++) {
    rays.push({
      id: i,
      angle: i * angleStep - spread / 2,
      width: 2 + Math.random() * 3,
      length: 400 + Math.random() * 200,
      opacity: opacity * (0.5 + Math.random() * 0.5),
      color,
    });
  }

  return rays;
};

/**
 * Render a light ray
 */
export const renderLightRay = (ray: LightRay, centerX: number, centerY: number): JSX.Element => {
  return (
    <div
      key={ray.id}
      style={{
        position: 'absolute',
        left: centerX,
        top: centerY,
        width: ray.width,
        height: ray.length,
        background: `linear-gradient(to bottom, ${ray.color}${Math.floor(ray.opacity * 255).toString(16).padStart(2, '0')}, transparent)`,
        transform: `rotate(${ray.angle}deg)`,
        transformOrigin: 'top center',
        pointerEvents: 'none',
        filter: 'blur(2px)',
      }}
    />
  );
};

/**
 * VIGNETTE EFFECTS
 */

/**
 * Cinematic edge darkening
 */
export const createVignette = (
  intensity: number = 0.5,
  spread: number = 0.7,
  color: string = '#000000'
): React.CSSProperties => {
  return {
    background: `radial-gradient(ellipse at center, transparent ${spread * 100}%, ${color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')} 100%)`,
    pointerEvents: 'none',
  };
};

/**
 * CHROMATIC ABERRATION
 */

/**
 * Color separation effect
 */
export const createChromaticAberration = (
  intensity: number = 5,
  angle: number = 0
): React.CSSProperties => {
  const angleRad = (angle * Math.PI) / 180;
  const offsetX = Math.cos(angleRad) * intensity;
  const offsetY = Math.sin(angleRad) * intensity;

  return {
    filter: `
      drop-shadow(${offsetX}px ${offsetY}px 0 rgba(255, 0, 0, 0.5))
      drop-shadow(${-offsetX}px ${-offsetY}px 0 rgba(0, 255, 255, 0.5))
    `,
  };
};

/**
 * FILM GRAIN
 */

/**
 * Subtle texture overlay
 */
export const createFilmGrain = (
  intensity: number = 0.1,
  size: number = 2
): React.CSSProperties => {
  // Generate noise pattern using CSS
  return {
    background: `
      repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, ${intensity}) 0px,
        transparent ${size}px,
        transparent ${size * 2}px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(255, 255, 255, ${intensity}) 0px,
        transparent ${size}px,
        transparent ${size * 2}px
      )
    `,
    mixBlendMode: 'overlay',
    pointerEvents: 'none',
    opacity: 0.5,
  };
};

/**
 * DEPTH OF FIELD (Blur)
 */

/**
 * Blur background/foreground for focus effect
 */
export const createDepthOfField = (
  blurAmount: number = 10,
  focusPoint: number = 0.5
): React.CSSProperties => {
  return {
    filter: `blur(${blurAmount}px)`,
    opacity: 0.7,
  };
};

/**
 * SPOTLIGHT EFFECT
 */

/**
 * Focused lighting effect
 */
export const createSpotlight = (
  centerX: number,
  centerY: number,
  radius: number = 300,
  intensity: number = 0.8,
  color: string = '#ffffff'
): React.CSSProperties => {
  return {
    background: `radial-gradient(
      circle at ${centerX}px ${centerY}px,
      ${color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')} 0%,
      transparent ${radius}px
    )`,
    mixBlendMode: 'screen',
    pointerEvents: 'none',
  };
};

/**
 * AMBIENT OCCLUSION
 */

/**
 * Realistic corner darkening
 */
export const createAmbientOcclusion = (
  intensity: number = 0.3
): React.CSSProperties => {
  return {
    boxShadow: `
      inset 0 0 100px rgba(0, 0, 0, ${intensity}),
      inset 0 0 50px rgba(0, 0, 0, ${intensity * 0.5})
    `,
  };
};

/**
 * PARALLAX DEPTH
 */

/**
 * Multi-layer depth simulation
 */
export const createParallaxLayer = (
  frame: number,
  depth: number,
  direction: 'horizontal' | 'vertical' = 'horizontal',
  speed: number = 1
): React.CSSProperties => {
  const offset = frame * speed * depth;

  return {
    transform:
      direction === 'horizontal'
        ? `translateX(${-offset}px)`
        : `translateY(${-offset}px)`,
  };
};

/**
 * GLOW ELEMENTS
 */

/**
 * Create glowing element (orb, particle, etc.)
 */
export const createGlowingElement = (
  color: string,
  size: number,
  intensity: number = 1
): React.CSSProperties => {
  return {
    width: size,
    height: size,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    ...createProfessionalGlow(color, intensity, size * 0.5),
  };
};

/**
 * LENS FLARE EFFECT
 */

/**
 * Create lens flare elements
 */
export interface LensFlare {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  type: 'circle' | 'hexagon' | 'star';
}

export const createLensFlare = (
  centerX: number,
  centerY: number,
  direction: { x: number; y: number },
  color: string = '#ffffff'
): LensFlare[] => {
  const flares: LensFlare[] = [];
  const flareCount = 6;

  for (let i = 0; i < flareCount; i++) {
    const distance = (i + 1) * 100;
    flares.push({
      id: i,
      x: centerX + direction.x * distance,
      y: centerY + direction.y * distance,
      size: 40 - i * 5,
      color,
      opacity: 0.7 - i * 0.1,
      type: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'hexagon' : 'star',
    });
  }

  return flares;
};

/**
 * Render lens flare element
 */
export const renderLensFlare = (flare: LensFlare): JSX.Element => {
  const clipPath =
    flare.type === 'hexagon'
      ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
      : flare.type === 'star'
      ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
      : undefined;

  return (
    <div
      key={flare.id}
      style={{
        position: 'absolute',
        left: flare.x,
        top: flare.y,
        width: flare.size,
        height: flare.size,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${flare.color}, transparent)`,
        opacity: flare.opacity,
        clipPath,
        pointerEvents: 'none',
        filter: 'blur(1px)',
      }}
    />
  );
};

/**
 * Usage Examples:
 *
 * // 1. Professional glow
 * <div style={createProfessionalGlow('#00d4ff', 1, 30)}>
 *   Glowing Element
 * </div>
 *
 * // 2. Pulsing glow
 * <div style={createPulsingGlow('#ff006e', frame, 0.1)}>
 *   Pulsing Text
 * </div>
 *
 * // 3. Neon text
 * <h1 style={createNeonGlow('#00ffff')}>NEON SIGN</h1>
 *
 * // 4. Dynamic shadow
 * <div style={createDynamicShadow(lightX, lightY, elementX, elementY)}>
 *   Shadow Element
 * </div>
 *
 * // 5. Light rays
 * const rays = createLightRays(12, 960, 540, '#ffaa00', 0.4);
 * {rays.map(ray => renderLightRay(ray, 960, 540))}
 *
 * // 6. Vignette overlay
 * <AbsoluteFill style={createVignette(0.6, 0.7)} />
 *
 * // 7. Chromatic aberration
 * <div style={createChromaticAberration(8, 45)}>
 *   Glitch Text
 * </div>
 *
 * // 8. Film grain
 * <AbsoluteFill style={createFilmGrain(0.15, 2)} />
 *
 * // 9. Spotlight
 * <AbsoluteFill style={createSpotlight(960, 540, 400, 0.8)} />
 *
 * // 10. Lens flare
 * const flares = createLensFlare(100, 100, { x: 1, y: 0.5 });
 * {flares.map(renderLensFlare)}
 */