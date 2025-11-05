/**
 * Particle System for Remotion Animations
 *
 * GPU-optimized particle effects: sparkles, confetti, smoke, magic trails, bubbles, fire embers
 * Uses CSS transforms for maximum performance
 */

import { interpolate, random } from 'remotion';
import { ProfessionalEasing } from './professional-easing';

/**
 * Single particle configuration
 */
export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  color: string;
  velocity: { x: number; y: number };
  lifetime: number;
  scale: number;
}

/**
 * Particle system configuration
 */
export interface ParticleSystemConfig {
  count: number; // Number of particles
  spawnArea: { x: number; y: number; width: number; height: number }; // Where particles spawn
  colors: string[]; // Color palette
  sizeRange: [number, number]; // Min/max particle size
  lifetimeRange: [number, number]; // Min/max frames particle lives
  velocityRange: { x: [number, number]; y: [number, number] }; // Velocity bounds
  gravity?: number; // Gravity strength (default 0)
  drag?: number; // Air resistance (0-1, default 0)
  rotationSpeed?: [number, number]; // Min/max rotation per frame
  fadeIn?: number; // Frames to fade in (default 0)
  fadeOut?: number; // Frames to fade out (default lifetime)
}

/**
 * Generate particles for current frame
 */
export const generateParticles = (
  frame: number,
  config: ParticleSystemConfig,
  seed: number = 0
): Particle[] => {
  const particles: Particle[] = [];

  for (let i = 0; i < config.count; i++) {
    const particleSeed = seed + i * 1000;

    // Spawn timing (stagger spawns)
    const spawnDelay = i * 2;
    const particleAge = frame - spawnDelay;

    // Random lifetime
    const lifetime = Math.floor(
      config.lifetimeRange[0] +
        random(particleSeed + 1) * (config.lifetimeRange[1] - config.lifetimeRange[0])
    );

    // Skip if particle hasn't spawned or is dead
    if (particleAge < 0 || particleAge > lifetime) {
      continue;
    }

    // Initial position
    const startX =
      config.spawnArea.x + random(particleSeed + 2) * config.spawnArea.width;
    const startY =
      config.spawnArea.y + random(particleSeed + 3) * config.spawnArea.height;

    // Initial velocity
    const velocityX =
      config.velocityRange.x[0] +
      random(particleSeed + 4) * (config.velocityRange.x[1] - config.velocityRange.x[0]);
    const velocityY =
      config.velocityRange.y[0] +
      random(particleSeed + 5) * (config.velocityRange.y[1] - config.velocityRange.y[0]);

    // Physics simulation
    const gravity = config.gravity || 0;
    const drag = config.drag || 0;

    const currentVelocityX = velocityX * (1 - drag * particleAge);
    const currentVelocityY = velocityY * (1 - drag * particleAge) + gravity * particleAge;

    const x = startX + currentVelocityX * particleAge;
    const y = startY + currentVelocityY * particleAge;

    // Size
    const size =
      config.sizeRange[0] +
      random(particleSeed + 6) * (config.sizeRange[1] - config.sizeRange[0]);

    // Rotation
    const rotationSpeed =
      (config.rotationSpeed?.[0] || 0) +
      random(particleSeed + 7) *
        ((config.rotationSpeed?.[1] || 0) - (config.rotationSpeed?.[0] || 0));
    const rotation = rotationSpeed * particleAge;

    // Opacity (fade in/out)
    const fadeIn = config.fadeIn || 0;
    const fadeOut = config.fadeOut || lifetime;

    let opacity = 1;
    if (particleAge < fadeIn) {
      opacity = particleAge / fadeIn;
    } else if (particleAge > lifetime - fadeOut) {
      opacity = (lifetime - particleAge) / fadeOut;
    }

    // Color
    const colorIndex = Math.floor(random(particleSeed + 8) * config.colors.length);
    const color = config.colors[colorIndex];

    // Scale animation (pulse)
    const scale = 1;

    particles.push({
      id: i,
      x,
      y,
      size,
      rotation,
      opacity,
      color,
      velocity: { x: currentVelocityX, y: currentVelocityY },
      lifetime,
      scale,
    });
  }

  return particles;
};

/**
 * PARTICLE PRESETS
 */

/**
 * Sparkles - Twinkling stars
 */
export const createSparkles = (
  spawnArea: { x: number; y: number; width: number; height: number },
  colors: string[] = ['#ffffff', '#fffacd', '#87ceeb']
): ParticleSystemConfig => ({
  count: 30,
  spawnArea,
  colors,
  sizeRange: [4, 12],
  lifetimeRange: [60, 120],
  velocityRange: { x: [-0.5, 0.5], y: [-0.5, 0.5] },
  gravity: 0,
  drag: 0.01,
  rotationSpeed: [-2, 2],
  fadeIn: 10,
  fadeOut: 20,
});

/**
 * Confetti - Falling celebration particles
 */
export const createConfetti = (
  spawnArea: { x: number; y: number; width: number; height: number },
  colors: string[] = ['#ff006e', '#8338ec', '#3a86ff', '#fb5607', '#ffbe0b']
): ParticleSystemConfig => ({
  count: 80,
  spawnArea,
  colors,
  sizeRange: [6, 16],
  lifetimeRange: [120, 240],
  velocityRange: { x: [-3, 3], y: [-5, -1] },
  gravity: 0.2,
  drag: 0.005,
  rotationSpeed: [-10, 10],
  fadeIn: 5,
  fadeOut: 30,
});

/**
 * Smoke - Organic diffusion
 */
export const createSmoke = (
  spawnArea: { x: number; y: number; width: number; height: number },
  colors: string[] = ['#ffffff20', '#f0f0f040', '#e0e0e030']
): ParticleSystemConfig => ({
  count: 20,
  spawnArea,
  colors,
  sizeRange: [40, 100],
  lifetimeRange: [90, 180],
  velocityRange: { x: [-1, 1], y: [-2, -0.5] },
  gravity: -0.02,
  drag: 0.02,
  rotationSpeed: [-0.5, 0.5],
  fadeIn: 20,
  fadeOut: 60,
});

/**
 * Magic Trails - Following cursor/object
 */
export const createMagicTrails = (
  spawnArea: { x: number; y: number; width: number; height: number },
  colors: string[] = ['#ff0080', '#ff00ff', '#8000ff', '#0080ff']
): ParticleSystemConfig => ({
  count: 40,
  spawnArea,
  colors,
  sizeRange: [4, 10],
  lifetimeRange: [30, 60],
  velocityRange: { x: [-2, 2], y: [-2, 2] },
  gravity: 0,
  drag: 0.05,
  rotationSpeed: [0, 0],
  fadeIn: 2,
  fadeOut: 15,
});

/**
 * Bubbles - Floating upward with wobble
 */
export const createBubbles = (
  spawnArea: { x: number; y: number; width: number; height: number },
  colors: string[] = ['#ffffff40', '#87ceeb60', '#add8e680']
): ParticleSystemConfig => ({
  count: 25,
  spawnArea,
  colors,
  sizeRange: [20, 60],
  lifetimeRange: [120, 240],
  velocityRange: { x: [-0.5, 0.5], y: [-1.5, -0.5] },
  gravity: -0.01,
  drag: 0.001,
  rotationSpeed: [0, 0],
  fadeIn: 10,
  fadeOut: 30,
});

/**
 * Fire Embers - Upward float with flicker
 */
export const createFireEmbers = (
  spawnArea: { x: number; y: number; width: number; height: number },
  colors: string[] = ['#ff6b00', '#ff0000', '#ffaa00', '#ff4400']
): ParticleSystemConfig => ({
  count: 50,
  spawnArea,
  colors,
  sizeRange: [3, 8],
  lifetimeRange: [60, 150],
  velocityRange: { x: [-0.5, 0.5], y: [-2, -0.5] },
  gravity: -0.05,
  drag: 0.01,
  rotationSpeed: [0, 0],
  fadeIn: 5,
  fadeOut: 25,
});

/**
 * Snow - Gentle falling
 */
export const createSnow = (
  spawnArea: { x: number; y: number; width: number; height: number },
  colors: string[] = ['#ffffff', '#f0f8ff', '#fffafa']
): ParticleSystemConfig => ({
  count: 60,
  spawnArea,
  colors,
  sizeRange: [4, 12],
  lifetimeRange: [180, 360],
  velocityRange: { x: [-0.5, 0.5], y: [0.5, 1.5] },
  gravity: 0.01,
  drag: 0.001,
  rotationSpeed: [-1, 1],
  fadeIn: 15,
  fadeOut: 30,
});

/**
 * Energy Field - Pulsing particles
 */
export const createEnergyField = (
  spawnArea: { x: number; y: number; width: number; height: number },
  colors: string[] = ['#00ffff', '#0080ff', '#00ff80', '#80ff00']
): ParticleSystemConfig => ({
  count: 100,
  spawnArea,
  colors,
  sizeRange: [2, 6],
  lifetimeRange: [90, 180],
  velocityRange: { x: [-1, 1], y: [-1, 1] },
  gravity: 0,
  drag: 0.02,
  rotationSpeed: [0, 0],
  fadeIn: 10,
  fadeOut: 20,
});

/**
 * Helper: Add wobble to particle position (for bubbles, smoke)
 */
export const addWobble = (
  particle: Particle,
  frame: number,
  amplitude: number = 10,
  frequency: number = 0.1
): { x: number; y: number } => {
  const wobbleX = Math.sin(frame * frequency + particle.id) * amplitude;
  const wobbleY = Math.cos(frame * frequency * 1.3 + particle.id) * amplitude;

  return {
    x: particle.x + wobbleX,
    y: particle.y + wobbleY,
  };
};

/**
 * Helper: Add pulse animation to particle scale
 */
export const addPulse = (
  particle: Particle,
  frame: number,
  intensity: number = 0.3,
  speed: number = 0.1
): number => {
  const pulse = 1 + Math.sin(frame * speed + particle.id) * intensity;
  return particle.scale * pulse;
};

/**
 * Render particle as React component
 */
export const renderParticle = (
  particle: Particle,
  useBlur: boolean = false,
  useGlow: boolean = true
): JSX.Element => {
  const styles: React.CSSProperties = {
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
  };

  if (useBlur) {
    styles.filter = 'blur(1px)';
  }

  if (useGlow) {
    styles.boxShadow = `0 0 ${particle.size * 2}px ${particle.color}`;
  }

  return <div key={particle.id} style={styles} />;
};

/**
 * Usage Examples:
 *
 * // 1. Generate sparkles
 * const sparkles = generateParticles(
 *   frame,
 *   createSparkles({ x: 0, y: 0, width: 1920, height: 1080 }),
 *   42 // seed for reproducibility
 * );
 *
 * // 2. Render particles
 * {sparkles.map(particle => renderParticle(particle, false, true))}
 *
 * // 3. Custom particle system
 * const customParticles = generateParticles(frame, {
 *   count: 50,
 *   spawnArea: { x: 960, y: 540, width: 200, height: 200 },
 *   colors: ['#ff0000', '#00ff00', '#0000ff'],
 *   sizeRange: [5, 15],
 *   lifetimeRange: [60, 120],
 *   velocityRange: { x: [-2, 2], y: [-3, 3] },
 *   gravity: 0.1,
 *   drag: 0.01
 * }, 123);
 */