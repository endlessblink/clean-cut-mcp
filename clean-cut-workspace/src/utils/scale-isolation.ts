/**
 * Scale Isolation System
 *
 * Prevents compound scaling issues where parent scale × child scale = unexpected cropping
 *
 * Problem discovered:
 * - Shot 3 has scale 1.19x
 * - Code editor has scale 1.22x (breathe × zoom)
 * - Combined: 1.19 × 1.22 = 1.45x (CROPPED!)
 *
 * Solution: Enforce scale isolation with allowed transform types per level
 */

export type TransformLevel = 'shot' | 'element' | 'child';

export interface AllowedTransforms {
  scale: boolean;
  translateX: boolean;
  translateY: boolean;
  rotate: boolean;
}

/**
 * Transform Rules by Level
 *
 * Prevents compound scaling by allowing scale at ONLY ONE level
 */
export const TRANSFORM_RULES: Record<TransformLevel, AllowedTransforms> = {
  // Shot level: Handles ALL scale transformations
  shot: {
    scale: true,           // ✅ Camera zoom happens here
    translateX: true,      // ✅ Wipes/slides
    translateY: true,      // ✅ Vertical movement
    rotate: false          // ❌ Individual elements rotate, not shots
  },

  // Element level: Individual element motion (NO scale)
  element: {
    scale: false,          // ❌ NEVER scale at element level (compounds with shot)
    translateX: true,      // ✅ Individual element slides
    translateY: true,      // ✅ Float, breathing
    rotate: true           // ✅ Individual rotation OK
  },

  // Child level: Subtle effects only
  child: {
    scale: false,          // ❌ NEVER scale children
    translateX: false,     // ❌ Minimal transforms at this level
    translateY: true,      // ✅ Very subtle float only
    rotate: false          // ❌ No rotation at child level
  }
};

/**
 * Validate transform doesn't violate isolation rules
 */
export function validateTransform(
  level: TransformLevel,
  transformType: keyof AllowedTransforms
): { allowed: boolean; reason: string } {
  const allowed = TRANSFORM_RULES[level][transformType];

  if (!allowed) {
    const reasons = {
      scale: `Scale at ${level} level compounds with parent scale causing crop. Apply scale at 'shot' level only.`,
      translateX: `TranslateX not recommended at ${level} level.`,
      translateY: `TranslateY not recommended at ${level} level.`,
      rotate: `Rotate at ${level} level may compound with parent transforms.`
    };

    return {
      allowed: false,
      reason: reasons[transformType]
    };
  }

  return { allowed: true, reason: 'Transform allowed at this level' };
}

/**
 * Calculate compound scale through transform hierarchy
 */
export function calculateCompoundScale(transforms: Array<{ level: TransformLevel; scale: number }>): {
  totalScale: number;
  isSafe: boolean;
  recommendation: string;
} {
  let totalScale = 1.0;
  const scaleAtLevels: string[] = [];

  transforms.forEach(({ level, scale }) => {
    if (scale !== 1.0) {
      totalScale *= scale;
      scaleAtLevels.push(`${level}: ${scale.toFixed(2)}x`);
    }
  });

  const isSafe = scaleAtLevels.length <= 1;

  return {
    totalScale,
    isSafe,
    recommendation: isSafe
      ? '✅ Scale applied at single level only'
      : `❌ COMPOUND SCALE: ${scaleAtLevels.join(' × ')} = ${totalScale.toFixed(2)}x total. Apply scale at 'shot' level only.`
  };
}

/**
 * Enforce scale isolation (runtime check)
 */
export function enforceScaleIsolation(
  level: TransformLevel,
  style: React.CSSProperties
): React.CSSProperties {
  if (!style.transform) return style;

  const hasScale = /scale\(/.test(style.transform);

  if (hasScale && level !== 'shot') {
    console.warn(
      `⚠️ SCALE ISOLATION VIOLATION: Scale transform detected at '${level}' level. ` +
      `Move scale to 'shot' level to prevent compound scaling.`
    );

    // Remove scale from transform
    const cleanedTransform = style.transform.replace(/scale\([^)]+\)\s?/g, '').trim();

    return {
      ...style,
      transform: cleanedTransform || 'none'
    };
  }

  return style;
}

/**
 * Safe transform builder (enforces rules)
 */
export class SafeTransformBuilder {
  private level: TransformLevel;
  private transforms: string[] = [];

  constructor(level: TransformLevel) {
    this.level = level;
  }

  scale(value: number): this {
    const validation = validateTransform(this.level, 'scale');
    if (!validation.allowed) {
      console.error(validation.reason);
      return this;  // Skip this transform
    }
    this.transforms.push(`scale(${value})`);
    return this;
  }

  translateX(value: number): this {
    const validation = validateTransform(this.level, 'translateX');
    if (!validation.allowed) {
      console.error(validation.reason);
      return this;
    }
    this.transforms.push(`translateX(${value}px)`);
    return this;
  }

  translateY(value: number): this {
    const validation = validateTransform(this.level, 'translateY');
    if (!validation.allowed) {
      console.error(validation.reason);
      return this;
    }
    this.transforms.push(`translateY(${value}px)`);
    return this;
  }

  rotate(value: number): this {
    const validation = validateTransform(this.level, 'rotate');
    if (!validation.allowed) {
      console.error(validation.reason);
      return this;
    }
    this.transforms.push(`rotate(${value}deg)`);
    return this;
  }

  build(): string {
    return this.transforms.length > 0 ? this.transforms.join(' ') : 'none';
  }
}

/**
 * Usage Examples:
 *
 * // 1. Build safe transforms
 * const shotTransform = new SafeTransformBuilder('shot')
 *   .translateY(-100)
 *   .scale(1.5)
 *   .build();
 * // Result: "translateY(-100px) scale(1.5)"
 *
 * const elementTransform = new SafeTransformBuilder('element')
 *   .translateY(10)
 *   .scale(1.2)  // ❌ Logs error: "Scale at element level compounds..."
 *   .rotate(5)
 *   .build();
 * // Result: "translateY(10px) rotate(5deg)" (scale removed)
 *
 * // 2. Validate compound scale
 * const result = calculateCompoundScale([
 *   { level: 'shot', scale: 1.19 },
 *   { level: 'element', scale: 1.22 }
 * ]);
 * console.log(result.recommendation);
 * // "❌ COMPOUND SCALE: shot: 1.19x × element: 1.22x = 1.45x total"
 *
 * // 3. Enforce isolation at runtime
 * const safeStyle = enforceScaleIsolation('element', {
 *   transform: 'scale(1.5) translateY(10px)'
 * });
 * // Returns: { transform: 'translateY(10px)' } - scale removed with warning
 */
