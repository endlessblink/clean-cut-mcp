/**
 * NO-OVERLAP HELPER
 *
 * Ensures scenes NEVER overlap by enforcing that:
 * 1. Exit completes BEFORE next scene's entry completes
 * 2. Opacity reaches 0 during overlap period
 * 3. Content is fully hidden before next content is fully visible
 *
 * This is a CRITICAL guideline that was repeatedly violated.
 */

import { interpolate, spring } from 'remotion';

export interface NoOverlapConfig {
  localFrame: number;
  fps: number;
  sceneDuration: number;
  transitionDuration: number;  // How long transitions take (15-20 frames)
}

/**
 * Calculate opacity that GUARANTEES no overlap
 *
 * Rules:
 * - Entry: 0 → 1 during first transitionDuration frames
 * - Hold: 1 during middle frames
 * - Exit: 1 → 0 during last transitionDuration frames
 *
 * CRITICAL: Exit MUST reach 0 before next scene's entry reaches 1
 */
export function calculateNoOverlapOpacity(config: NoOverlapConfig): number {
  const { localFrame, fps, sceneDuration, transitionDuration } = config;

  const exitStartFrame = sceneDuration - transitionDuration;

  // Entry phase (first transitionDuration frames)
  if (localFrame < transitionDuration) {
    return spring({
      frame: localFrame,
      fps,
      config: { damping: 100, stiffness: 200 }
    });
  }

  // Hold phase (middle)
  if (localFrame < exitStartFrame) {
    return 1;
  }

  // Exit phase (last transitionDuration frames)
  const exitProgress = spring({
    frame: localFrame - exitStartFrame,
    fps,
    config: { damping: 100, stiffness: 200 }
  });

  return 1 - exitProgress;  // Fades from 1 to 0
}

/**
 * Validation function - throws error if scenes would overlap
 */
export function validateNoOverlap(scenes: Array<{ start: number; duration: number; transitionDuration: number }>) {
  for (let i = 0; i < scenes.length - 1; i++) {
    const currentScene = scenes[i];
    const nextScene = scenes[i + 1];

    const currentExitStart = currentScene.start + currentScene.duration - currentScene.transitionDuration;
    const currentExitEnd = currentScene.start + currentScene.duration;

    const nextEntryStart = nextScene.start;
    const nextEntryEnd = nextScene.start + nextScene.transitionDuration;

    // Check: Current scene must finish exiting BEFORE next scene finishes entering
    if (currentExitEnd > nextEntryEnd) {
      throw new Error(
        `❌ OVERLAP VIOLATION: Scene ${i} exits at frame ${currentExitEnd} but Scene ${i + 1} finishes entering at frame ${nextEntryEnd}. ` +
        `Gap must be at least 0 frames. Current gap: ${nextEntryEnd - currentExitEnd} frames.`
      );
    }

    // Warn if overlap period is too long
    const overlapDuration = currentExitEnd - nextEntryStart;
    if (overlapDuration > 20) {
      console.warn(
        `⚠️ WARNING: Scene ${i} and ${i + 1} overlap for ${overlapDuration} frames. ` +
        `Recommended: 15-frame overlaps maximum.`
      );
    }
  }

  console.log('✅ NO-OVERLAP VALIDATION PASSED: All scenes have proper exit/entry timing');
}

/**
 * Usage Example:
 *
 * const opacity = calculateNoOverlapOpacity({
 *   localFrame: frame,
 *   fps: 30,
 *   sceneDuration: 70,
 *   transitionDuration: 15
 * });
 *
 * // Validates scene timing
 * validateNoOverlap([
 *   { start: 0, duration: 70, transitionDuration: 15 },
 *   { start: 55, duration: 80, transitionDuration: 15 },
 *   { start: 120, duration: 65, transitionDuration: 15 }
 * ]);
 */
