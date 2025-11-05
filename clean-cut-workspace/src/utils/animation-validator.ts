/**
 * Animation Validator - Comprehensive validation for motion graphics
 *
 * Inspired by After Effects 2025 automated layer staggering and GSAP collision detection
 * Provides frame-by-frame validation to catch overlaps, timing issues, and quality problems
 */

export interface SceneDefinition {
  name: string;
  startFrame: number;
  endFrame: number;
  exitType: string;
  exitDuration: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  frameReport: FrameReport[];
}

export interface ValidationError {
  type: 'overlap' | 'gap' | 'invalid-timing' | 'missing-exit';
  message: string;
  affectedFrames: number[];
  affectedScenes: string[];
}

export interface ValidationWarning {
  type: 'long-overlap' | 'short-scene' | 'rapid-transition';
  message: string;
  frames: number[];
}

export interface FrameReport {
  frame: number;
  activeScenes: string[];
  isValid: boolean;
  issue?: string;
}

/**
 * 1. OVERLAP DETECTION (After Effects-style)
 *
 * Validates that no more than 1 scene is fully visible at any frame
 */
export function validateNoOverlaps(scenes: SceneDefinition[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const frameReport: FrameReport[] = [];

  // Calculate total duration
  const totalFrames = Math.max(...scenes.map(s => s.endFrame));

  // Check every frame
  for (let frame = 0; frame <= totalFrames; frame++) {
    const activeScenes: string[] = [];
    const transitioningScenes: string[] = [];

    scenes.forEach(scene => {
      const isActive = frame >= scene.startFrame && frame < scene.endFrame;
      const isExiting = frame >= (scene.endFrame - scene.exitDuration) && frame < scene.endFrame;

      if (isActive) {
        if (isExiting) {
          transitioningScenes.push(scene.name);
        } else {
          activeScenes.push(scene.name);
        }
      }
    });

    // RULE: Only 1 fully active scene allowed (transitions can overlap briefly)
    const totalActive = activeScenes.length + transitioningScenes.length;

    if (activeScenes.length > 1) {
      // CRITICAL ERROR: Multiple scenes fully visible
      errors.push({
        type: 'overlap',
        message: `Frame ${frame}: ${activeScenes.length} scenes fully visible (${activeScenes.join(', ')})`,
        affectedFrames: [frame],
        affectedScenes: activeScenes
      });

      frameReport.push({
        frame,
        activeScenes: [...activeScenes, ...transitioningScenes],
        isValid: false,
        issue: 'OVERLAP'
      });
    } else if (transitioningScenes.length > 2) {
      // WARNING: Too many transitions overlapping
      warnings.push({
        type: 'long-overlap',
        message: `Frame ${frame}: ${transitioningScenes.length} scenes transitioning simultaneously`,
        frames: [frame]
      });

      frameReport.push({
        frame,
        activeScenes: transitioningScenes,
        isValid: true,
        issue: 'MANY_TRANSITIONS'
      });
    } else {
      frameReport.push({
        frame,
        activeScenes: [...activeScenes, ...transitioningScenes],
        isValid: true
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    frameReport
  };
}

/**
 * 2. TIMELINE GAP DETECTION (GSAP-style)
 *
 * Ensures no empty frames (dull moments)
 */
export function validateNoGaps(scenes: SceneDefinition[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const sorted = [...scenes].sort((a, b) => a.startFrame - b.startFrame);

  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = sorted[i].endFrame;
    const nextStart = sorted[i + 1].startFrame;

    if (nextStart > currentEnd) {
      const gapSize = nextStart - currentEnd;
      errors.push({
        type: 'gap',
        message: `Gap of ${gapSize} frames between "${sorted[i].name}" and "${sorted[i + 1].name}" (frames ${currentEnd}-${nextStart})`,
        affectedFrames: Array.from({ length: gapSize }, (_, i) => currentEnd + i),
        affectedScenes: [sorted[i].name, sorted[i + 1].name]
      });
    }
  }

  return errors;
}

/**
 * 3. TRANSITION TIMING VALIDATION (Professional standards)
 *
 * Validates transitions follow professional timing rules
 */
export function validateTransitionTiming(scenes: SceneDefinition[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  scenes.forEach(scene => {
    // Check transition duration
    if (scene.exitDuration < 10) {
      warnings.push({
        type: 'rapid-transition',
        message: `Scene "${scene.name}": Exit duration ${scene.exitDuration} frames is too fast (recommended: 15+ frames)`,
        frames: [scene.endFrame - scene.exitDuration, scene.endFrame]
      });
    }

    if (scene.exitDuration > 30) {
      warnings.push({
        type: 'rapid-transition',
        message: `Scene "${scene.name}": Exit duration ${scene.exitDuration} frames is too slow (recommended: 15-25 frames)`,
        frames: [scene.endFrame - scene.exitDuration, scene.endFrame]
      });
    }

    // Check scene duration
    const sceneDuration = scene.endFrame - scene.startFrame;
    if (sceneDuration < 30) {
      warnings.push({
        type: 'short-scene',
        message: `Scene "${scene.name}": Duration ${sceneDuration} frames is very short (recommended: 60+ frames)`,
        frames: [scene.startFrame, scene.endFrame]
      });
    }
  });

  return warnings;
}

/**
 * 4. SPATIAL COLLISION DETECTION (Game engine-style)
 *
 * Detects if elements overlap in visual space (not just time)
 */
export interface ElementBounds {
  scene: string;
  element: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function detectSpatialCollisions(
  frame: number,
  elements: ElementBounds[]
): Array<{ element1: string; element2: string; overlapArea: number }> {
  const collisions: Array<{ element1: string; element2: string; overlapArea: number }> = [];

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const rect1 = elements[i];
      const rect2 = elements[j];

      // AABB collision detection
      const overlapX = Math.max(
        0,
        Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - Math.max(rect1.x, rect2.x)
      );
      const overlapY = Math.max(
        0,
        Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - Math.max(rect1.y, rect2.y)
      );

      if (overlapX > 0 && overlapY > 0) {
        const overlapArea = overlapX * overlapY;
        collisions.push({
          element1: `${rect1.scene}/${rect1.element}`,
          element2: `${rect2.scene}/${rect2.element}`,
          overlapArea
        });
      }
    }
  }

  return collisions;
}

/**
 * 5. COMPREHENSIVE VALIDATION SUITE
 *
 * Combines all validation methods
 */
export function validateAnimation(scenes: SceneDefinition[]): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    frameReport: []
  };

  // 1. Check for overlapping scenes
  const overlapResult = validateNoOverlaps(scenes);
  result.errors.push(...overlapResult.errors);
  result.warnings.push(...overlapResult.warnings);
  result.frameReport = overlapResult.frameReport;

  // 2. Check for timeline gaps
  const gapErrors = validateNoGaps(scenes);
  result.errors.push(...gapErrors);

  // 3. Check transition timing
  const timingWarnings = validateTransitionTiming(scenes);
  result.warnings.push(...timingWarnings);

  // Update valid status
  result.valid = result.errors.length === 0;

  return result;
}

/**
 * 6. REPORT GENERATION (Human-readable)
 */
export function generateValidationReport(result: ValidationResult): string {
  let report = '# Animation Validation Report\n\n';

  if (result.valid) {
    report += '✅ **VALIDATION PASSED** - No critical errors detected\n\n';
  } else {
    report += `❌ **VALIDATION FAILED** - ${result.errors.length} error(s) found\n\n`;
  }

  // Errors
  if (result.errors.length > 0) {
    report += '## 🚨 CRITICAL ERRORS\n\n';
    result.errors.forEach((error, index) => {
      report += `### Error ${index + 1}: ${error.type.toUpperCase()}\n`;
      report += `**Message**: ${error.message}\n`;
      report += `**Affected Frames**: ${error.affectedFrames.join(', ')}\n`;
      report += `**Affected Scenes**: ${error.affectedScenes.join(', ')}\n\n`;
    });
  }

  // Warnings
  if (result.warnings.length > 0) {
    report += '## ⚠️ WARNINGS\n\n';
    result.warnings.forEach((warning, index) => {
      report += `${index + 1}. **${warning.type}**: ${warning.message}\n`;
    });
    report += '\n';
  }

  // Frame-by-frame summary
  report += '## 📊 FRAME-BY-FRAME ANALYSIS\n\n';

  const problemFrames = result.frameReport.filter(f => !f.isValid || f.issue);
  if (problemFrames.length > 0) {
    problemFrames.forEach(frame => {
      report += `- Frame ${frame.frame}: ${frame.activeScenes.join(', ')} ${frame.issue ? `(${frame.issue})` : ''}\n`;
    });
  } else {
    report += '✅ All frames valid - no overlaps detected\n';
  }

  return report;
}

/**
 * Usage Example:
 *
 * const scenes = [
 *   { name: 'Shot1', startFrame: 0, endFrame: 70, exitType: 'wipe-left', exitDuration: 15 },
 *   { name: 'Shot2', startFrame: 55, endFrame: 120, exitType: 'scale-out', exitDuration: 15 },
 *   { name: 'Shot3', startFrame: 120, endFrame: 185, exitType: 'hard-cut', exitDuration: 0 }
 * ];
 *
 * const result = validateAnimation(scenes);
 * console.log(generateValidationReport(result));
 *
 * if (!result.valid) {
 *   throw new Error('Animation has overlapping content!');
 * }
 */
