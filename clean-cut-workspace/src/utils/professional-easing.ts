/**
 * Professional Easing Library for Remotion Animations
 *
 * Provides natural motion curves with anticipation, follow-through, and professional polish.
 * All easing functions use Remotion's native Easing.bezier() for maximum compatibility.
 */

import { Easing } from 'remotion';

/**
 * Professional Easing Curves
 *
 * Research-validated bezier curves that create natural, professional motion.
 * Each curve is optimized for specific animation types.
 */
export const ProfessionalEasing = {
  /**
   * SMOOTH CURVES - Buttery smooth transitions
   */

  // Ultra-smooth ease in/out - perfect for most animations
  smooth: Easing.bezier(0.45, 0.05, 0.55, 0.95),

  // Gentle ease out - natural deceleration
  gentleOut: Easing.bezier(0, 0, 0.58, 1),

  // Gentle ease in - natural acceleration
  gentleIn: Easing.bezier(0.42, 0, 1, 1),

  // Standard ease in/out - reliable default
  standard: Easing.bezier(0.42, 0, 0.58, 1),

  /**
   * NATURAL PHYSICS - Mimics real-world motion
   */

  // Anticipation - pulls back before moving (like jumping)
  anticipation: Easing.bezier(0.36, 0, 0.66, -0.56),

  // Overshoot - exceeds target then settles (bouncy feel)
  overshoot: Easing.bezier(0.34, 1.56, 0.64, 1),

  // Strong overshoot - more pronounced bounce
  strongOvershoot: Easing.bezier(0.68, -0.55, 0.27, 1.55),

  // Elastic - multiple bounces (spring-like)
  elastic: Easing.bezier(0.68, -0.55, 0.27, 1.55),

  /**
   * DRAMATIC CURVES - Exaggerated motion for emphasis
   */

  // Dramatic entrance - strong acceleration
  dramatic: Easing.bezier(0.68, -0.55, 0.27, 1.55),

  // Power in - forceful acceleration
  powerIn: Easing.bezier(0.66, 0, 1, 1),

  // Power out - forceful deceleration
  powerOut: Easing.bezier(0, 0, 0.34, 1),

  // Power in/out - forceful both ways
  powerInOut: Easing.bezier(0.66, 0, 0.34, 1),

  /**
   * CINEMATIC CURVES - Film-quality motion
   */

  // Cinematic ease - professional film feel
  cinematic: Easing.bezier(0.25, 0.1, 0.25, 1),

  // Slow start - builds momentum gradually
  slowStart: Easing.bezier(0.5, 0, 0.5, 1),

  // Slow end - comes to rest gracefully
  slowEnd: Easing.bezier(0, 0, 0.5, 1),

  /**
   * SPECIAL EFFECTS - Unique motion patterns
   */

  // Snap - instant acceleration, gradual deceleration
  snap: Easing.bezier(0.95, 0.05, 0.8, 0.04),

  // Float - weightless drift
  float: Easing.bezier(0.25, 0.46, 0.45, 0.94),

  // Mechanical - precise, robot-like
  mechanical: Easing.bezier(0.5, 0, 0.5, 1),
};

/**
 * Motion Pattern Helpers
 *
 * Common animation patterns using professional easing curves
 */
export const MotionPatterns = {
  /**
   * Entrance pattern - element appearing naturally
   */
  entrance: {
    opacity: ProfessionalEasing.gentleOut,
    scale: ProfessionalEasing.overshoot,
    position: ProfessionalEasing.anticipation,
  },

  /**
   * Exit pattern - element disappearing gracefully
   */
  exit: {
    opacity: ProfessionalEasing.gentleIn,
    scale: ProfessionalEasing.standard,
    position: ProfessionalEasing.powerIn,
  },

  /**
   * Hover pattern - interactive feedback
   */
  hover: {
    scale: ProfessionalEasing.snap,
    shadow: ProfessionalEasing.gentleOut,
  },

  /**
   * Float pattern - weightless drift
   */
  float: {
    position: ProfessionalEasing.float,
  },

  /**
   * Bounce pattern - spring-like bounce
   */
  bounce: {
    position: ProfessionalEasing.elastic,
    scale: ProfessionalEasing.strongOvershoot,
  },
};

/**
 * Advanced Motion Utilities
 */

/**
 * Calculate arc-based motion (natural curved movement)
 *
 * @param progress - 0 to 1 animation progress
 * @param startX - Starting X position
 * @param endX - Ending X position
 * @param height - Arc height (positive = up, negative = down)
 * @returns { x, y } coordinates for arc motion
 */
export const arcMotion = (
  progress: number,
  startX: number,
  endX: number,
  height: number
): { x: number; y: number } => {
  const x = startX + (endX - startX) * progress;

  // Parabolic arc formula
  const y = height * Math.sin(progress * Math.PI);

  return { x, y };
};

/**
 * Calculate spring physics (damped harmonic motion)
 *
 * @param progress - 0 to 1 animation progress
 * @param stiffness - Spring stiffness (0.1 to 1, default 0.5)
 * @param damping - Spring damping (0.1 to 1, default 0.7)
 * @returns Spring value (can overshoot beyond 1)
 */
export const springPhysics = (
  progress: number,
  stiffness: number = 0.5,
  damping: number = 0.7
): number => {
  // Damped harmonic oscillator formula
  const omega = Math.sqrt(stiffness);
  const zeta = damping;

  if (zeta < 1) {
    // Underdamped (bouncy)
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * omega * progress) *
           Math.cos(omegaD * progress);
  } else if (zeta === 1) {
    // Critically damped (no bounce)
    return 1 - Math.exp(-omega * progress) * (1 + omega * progress);
  } else {
    // Overdamped (slow settle)
    return 1 - Math.exp(-omega * progress);
  }
};

/**
 * Calculate momentum-based motion (realistic weight)
 *
 * @param progress - 0 to 1 animation progress
 * @param mass - Object mass (0.1 to 2, default 1)
 * @param force - Applied force (0.1 to 2, default 1)
 * @returns Position based on F=ma physics
 */
export const momentumMotion = (
  progress: number,
  mass: number = 1,
  force: number = 1
): number => {
  const acceleration = force / mass;

  // Simple physics: s = 0.5 * a * t^2 (normalized to 0-1)
  return Math.min(1, 0.5 * acceleration * progress * progress);
};

/**
 * Follow-through animation (overshooting with gradual settle)
 *
 * @param progress - 0 to 1 animation progress
 * @param overshootAmount - How far to overshoot (0.1 to 0.5)
 * @returns Value with overshoot (can exceed 1 temporarily)
 */
export const followThrough = (
  progress: number,
  overshootAmount: number = 0.2
): number => {
  if (progress < 0.7) {
    // Main motion (accelerating)
    return progress / 0.7;
  } else {
    // Follow-through (overshoot and settle)
    const followProgress = (progress - 0.7) / 0.3;
    const overshoot = 1 + overshootAmount * Math.sin(followProgress * Math.PI);
    return overshoot;
  }
};

/**
 * Anticipation animation (pull back before forward motion)
 *
 * @param progress - 0 to 1 animation progress
 * @param anticipationAmount - How much to pull back (0.1 to 0.5)
 * @returns Value with anticipation (negative during windup)
 */
export const anticipationMotion = (
  progress: number,
  anticipationAmount: number = 0.2
): number => {
  if (progress < 0.3) {
    // Anticipation (pull back)
    const anticipationProgress = progress / 0.3;
    return -anticipationAmount * Math.sin(anticipationProgress * Math.PI);
  } else {
    // Main motion (forward)
    const mainProgress = (progress - 0.3) / 0.7;
    return mainProgress;
  }
};

/**
 * Wave motion (sinusoidal oscillation)
 *
 * @param progress - 0 to 1 animation progress
 * @param frequency - Number of complete waves
 * @param amplitude - Wave height (0 to 1)
 * @returns Oscillating value (-amplitude to +amplitude)
 */
export const waveMotion = (
  progress: number,
  frequency: number = 1,
  amplitude: number = 1
): number => {
  return amplitude * Math.sin(progress * frequency * Math.PI * 2);
};

/**
 * Easing Presets for Common Scenarios
 */
export const EasingPresets = {
  // UI element entrance
  fadeIn: ProfessionalEasing.gentleOut,
  slideIn: ProfessionalEasing.overshoot,
  scaleIn: ProfessionalEasing.strongOvershoot,

  // UI element exit
  fadeOut: ProfessionalEasing.gentleIn,
  slideOut: ProfessionalEasing.powerIn,
  scaleOut: ProfessionalEasing.standard,

  // Text animations
  textReveal: ProfessionalEasing.cinematic,
  textBounce: ProfessionalEasing.elastic,

  // Camera movements
  cameraPan: ProfessionalEasing.smooth,
  cameraZoom: ProfessionalEasing.cinematic,

  // Particle effects
  particleFloat: ProfessionalEasing.float,
  particleFall: ProfessionalEasing.gentleIn,

  // Interactive elements
  buttonHover: ProfessionalEasing.snap,
  buttonClick: ProfessionalEasing.powerOut,

  // Page transitions
  pageEnter: ProfessionalEasing.dramatic,
  pageExit: ProfessionalEasing.powerIn,
};

/**
 * Usage Examples:
 *
 * // Basic usage with interpolate
 * const opacity = interpolate(
 *   frame,
 *   [0, 30],
 *   [0, 1],
 *   { easing: ProfessionalEasing.smooth }
 * );
 *
 * // Arc motion (curved movement)
 * const { x, y } = arcMotion(progress, 0, 1920, 200);
 *
 * // Spring physics (bouncy)
 * const springValue = springPhysics(progress, 0.5, 0.6);
 * const position = springValue * 1920;
 *
 * // Follow-through (overshoot)
 * const scale = followThrough(progress, 0.2);
 *
 * // Anticipation (wind-up)
 * const anticipate = anticipationMotion(progress, 0.3);
 * const translateX = anticipate * 200;
 */