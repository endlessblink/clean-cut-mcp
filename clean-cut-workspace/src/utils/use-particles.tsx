/**
 * useParticles Hook
 *
 * Easy-to-use React hook for particle effects in Remotion animations
 */

import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useMemo } from 'react';
import {
  generateParticles,
  Particle,
  ParticleSystemConfig,
  renderParticle,
  createSparkles,
  createConfetti,
  createSmoke,
  createMagicTrails,
  createBubbles,
  createFireEmbers,
  createSnow,
  createEnergyField,
  addWobble,
  addPulse,
} from './particle-system';

/**
 * Particle effect types
 */
export type ParticleEffectType =
  | 'sparkles'
  | 'confetti'
  | 'smoke'
  | 'magic'
  | 'bubbles'
  | 'fire'
  | 'snow'
  | 'energy';

/**
 * Simple particle configuration
 */
export interface SimpleParticleConfig {
  type: ParticleEffectType;
  colors?: string[];
  position?: { x: number; y: number; width: number; height: number };
  seed?: number;
}

/**
 * useParticles - Generate particles for current frame
 *
 * @param config - Particle configuration
 * @returns Array of particles to render
 *
 * @example
 * const particles = useParticles({
 *   type: 'confetti',
 *   colors: ['#ff0000', '#00ff00', '#0000ff']
 * });
 *
 * {particles.map(p => renderParticle(p))}
 */
export const useParticles = (config: SimpleParticleConfig): Particle[] => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const spawnArea = config.position || {
    x: 0,
    y: 0,
    width,
    height,
  };

  const particles = useMemo(() => {
    let particleConfig: ParticleSystemConfig;

    switch (config.type) {
      case 'sparkles':
        particleConfig = createSparkles(spawnArea, config.colors);
        break;
      case 'confetti':
        particleConfig = createConfetti(spawnArea, config.colors);
        break;
      case 'smoke':
        particleConfig = createSmoke(spawnArea, config.colors);
        break;
      case 'magic':
        particleConfig = createMagicTrails(spawnArea, config.colors);
        break;
      case 'bubbles':
        particleConfig = createBubbles(spawnArea, config.colors);
        break;
      case 'fire':
        particleConfig = createFireEmbers(spawnArea, config.colors);
        break;
      case 'snow':
        particleConfig = createSnow(spawnArea, config.colors);
        break;
      case 'energy':
        particleConfig = createEnergyField(spawnArea, config.colors);
        break;
      default:
        particleConfig = createSparkles(spawnArea);
    }

    return generateParticles(frame, particleConfig, config.seed || 0);
  }, [frame, config.type, spawnArea, config.seed]);

  return particles;
};

/**
 * useCustomParticles - Custom particle system
 *
 * @param config - Full particle system configuration
 * @param seed - Random seed for reproducibility
 * @returns Array of particles
 */
export const useCustomParticles = (
  config: ParticleSystemConfig,
  seed: number = 0
): Particle[] => {
  const frame = useCurrentFrame();

  const particles = useMemo(() => {
    return generateParticles(frame, config, seed);
  }, [frame, config, seed]);

  return particles;
};

/**
 * useAnimatedParticles - Particles with additional animations (wobble, pulse)
 *
 * @param config - Particle configuration
 * @param animations - Additional animations to apply
 * @returns Animated particles
 */
export const useAnimatedParticles = (
  config: SimpleParticleConfig,
  animations?: {
    wobble?: { amplitude: number; frequency: number };
    pulse?: { intensity: number; speed: number };
  }
): Particle[] => {
  const frame = useCurrentFrame();
  const baseParticles = useParticles(config);

  const animatedParticles = useMemo(() => {
    return baseParticles.map((particle) => {
      let updatedParticle = { ...particle };

      if (animations?.wobble) {
        const { x, y } = addWobble(
          particle,
          frame,
          animations.wobble.amplitude,
          animations.wobble.frequency
        );
        updatedParticle.x = x;
        updatedParticle.y = y;
      }

      if (animations?.pulse) {
        updatedParticle.scale = addPulse(
          particle,
          frame,
          animations.pulse.intensity,
          animations.pulse.speed
        );
      }

      return updatedParticle;
    });
  }, [baseParticles, frame, animations]);

  return animatedParticles;
};

/**
 * useRenderedParticles - Get pre-rendered particle elements
 *
 * @param config - Particle configuration
 * @param renderOptions - Rendering options
 * @returns Array of React elements
 *
 * @example
 * const particleElements = useRenderedParticles({
 *   type: 'sparkles'
 * });
 *
 * <>{particleElements}</>
 */
export const useRenderedParticles = (
  config: SimpleParticleConfig,
  renderOptions?: {
    useBlur?: boolean;
    useGlow?: boolean;
  }
): JSX.Element[] => {
  const particles = useParticles(config);

  const elements = useMemo(() => {
    return particles.map((particle) =>
      renderParticle(
        particle,
        renderOptions?.useBlur || false,
        renderOptions?.useGlow !== false
      )
    );
  }, [particles, renderOptions]);

  return elements;
};

/**
 * Particle Layers - Multiple particle systems combined
 */
export interface ParticleLayer {
  type: ParticleEffectType;
  colors?: string[];
  position?: { x: number; y: number; width: number; height: number };
  seed?: number;
  zIndex?: number;
}

/**
 * useParticleLayers - Multiple particle systems at once
 *
 * @param layers - Array of particle layer configurations
 * @returns Combined particle elements
 *
 * @example
 * const particles = useParticleLayers([
 *   { type: 'sparkles', zIndex: 10 },
 *   { type: 'confetti', zIndex: 5 },
 * ]);
 */
export const useParticleLayers = (layers: ParticleLayer[]): JSX.Element[] => {
  const allElements: JSX.Element[] = [];

  layers.forEach((layer, layerIndex) => {
    const particles = useParticles({
      type: layer.type,
      colors: layer.colors,
      position: layer.position,
      seed: layer.seed || layerIndex * 1000,
    });

    const elements = particles.map((particle) => (
      <div
        key={`layer-${layerIndex}-particle-${particle.id}`}
        style={{
          position: 'absolute',
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          borderRadius: '50%',
          transform: `translate(-50%, -50%) rotate(${particle.rotation}deg) scale(${particle.scale})`,
          opacity: particle.opacity,
          pointerEvents: 'none',
          zIndex: layer.zIndex || 0,
          boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
        }}
      />
    ));

    allElements.push(...elements);
  });

  return allElements;
};

/**
 * Usage Examples:
 *
 * // 1. Simple sparkles
 * const sparkles = useParticles({ type: 'sparkles' });
 * {sparkles.map(p => renderParticle(p))}
 *
 * // 2. Custom colored confetti
 * const confetti = useParticles({
 *   type: 'confetti',
 *   colors: ['#ff0000', '#00ff00', '#0000ff']
 * });
 *
 * // 3. Localized particle effect
 * const localParticles = useParticles({
 *   type: 'magic',
 *   position: { x: 960, y: 540, width: 400, height: 400 }
 * });
 *
 * // 4. Pre-rendered particles (easiest)
 * const elements = useRenderedParticles({ type: 'fire' });
 * <>{elements}</>
 *
 * // 5. Animated particles with wobble
 * const wobbleParticles = useAnimatedParticles(
 *   { type: 'bubbles' },
 *   { wobble: { amplitude: 20, frequency: 0.1 } }
 * );
 *
 * // 6. Multiple particle layers
 * const layers = useParticleLayers([
 *   { type: 'snow', zIndex: 1 },
 *   { type: 'sparkles', zIndex: 10 },
 * ]);
 * <>{layers}</>
 */