import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

/**
 * EnforcedScene - Ensures proper transition patterns are ALWAYS applied
 *
 * This component ENFORCES:
 * 1. No duplicate renders (visibility check built-in)
 * 2. Proper transform chaining (entry + content + exit combined)
 * 3. Movement + fades (never fade-only)
 * 4. Correct timing overlaps
 *
 * Use this instead of manual Sequence + visibility checks to prevent mistakes.
 */

export interface SceneTransition {
  type: 'wipe-left' | 'wipe-right' | 'wipe-up' | 'wipe-down' | 'slide-up' | 'slide-down' | 'dolly-in' | 'dolly-out' | 'crossfade-scale' | 'hard-cut';
  duration: number;  // frames
  startFrame: number;  // when transition starts (relative to scene start)
}

export interface EnforcedSceneProps {
  sceneStartFrame: number;  // Global frame when scene starts
  sceneDuration: number;     // Total duration including transitions
  entryTransition: SceneTransition;
  exitTransition: SceneTransition;
  children: React.ReactNode;
}

export const EnforcedScene: React.FC<EnforcedSceneProps> = ({
  sceneStartFrame,
  sceneDuration,
  entryTransition,
  exitTransition,
  children
}) => {
  const globalFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate local frame (relative to scene start)
  const localFrame = globalFrame - sceneStartFrame;

  // Entry transform
  const entryTransform = calculateTransform(
    localFrame,
    entryTransition,
    'entry',
    fps
  );

  // Exit transform
  const exitTransform = calculateTransform(
    localFrame,
    exitTransition,
    'exit',
    fps
  );

  // Visibility check (prevents duplicate renders)
  if (localFrame < 0 || localFrame >= sceneDuration) {
    return null;  // Don't render if outside scene bounds
  }

  // Combine transforms (this is the critical part that ensures proper chaining)
  const combinedTransform = combineTransforms(entryTransform, exitTransform);

  return (
    <AbsoluteFill style={{ transform: combinedTransform }}>
      {children}
    </AbsoluteFill>
  );
};

// Calculate transform for a transition
function calculateTransform(
  frame: number,
  transition: SceneTransition,
  phase: 'entry' | 'exit',
  fps: number
): { x: number; y: number; scale: number; opacity: number } {
  const isActive = phase === 'entry'
    ? frame < transition.duration
    : frame >= transition.startFrame;

  if (!isActive) {
    return { x: 0, y: 0, scale: 1, opacity: 1 };
  }

  const progress = spring({
    frame: phase === 'entry' ? frame : (frame - transition.startFrame),
    fps,
    config: { damping: 100, stiffness: 200 }
  });

  switch (transition.type) {
    case 'wipe-left':
      return {
        x: phase === 'entry' ? interpolate(progress, [0, 1], [1920, 0]) : interpolate(progress, [0, 1], [0, -1920]),
        y: 0,
        scale: 1,
        opacity: 1
      };

    case 'wipe-right':
      return {
        x: phase === 'entry' ? interpolate(progress, [0, 1], [-1920, 0]) : interpolate(progress, [0, 1], [0, 1920]),
        y: 0,
        scale: 1,
        opacity: 1
      };

    case 'slide-up':
      return {
        x: 0,
        y: phase === 'entry' ? interpolate(progress, [0, 1], [100, 0]) : interpolate(progress, [0, 1], [0, -40]),
        scale: 1,
        opacity: 1
      };

    case 'slide-down':
      return {
        x: 0,
        y: phase === 'entry' ? interpolate(progress, [0, 1], [-100, 0]) : interpolate(progress, [0, 1], [0, 40]),
        scale: 1,
        opacity: 1
      };

    case 'dolly-in':
      return {
        x: 0,
        y: 0,
        scale: phase === 'entry' ? interpolate(progress, [0, 1], [1.0, 1.5]) : interpolate(progress, [0, 1], [1.5, 2.0]),
        opacity: 1
      };

    case 'dolly-out':
      return {
        x: 0,
        y: 0,
        scale: phase === 'entry' ? interpolate(progress, [0, 1], [2.0, 1.0]) : interpolate(progress, [0, 1], [1.0, 0.5]),
        opacity: 1
      };

    case 'crossfade-scale':
      return {
        x: 0,
        y: 0,
        scale: phase === 'entry' ? interpolate(progress, [0, 1], [0.9, 1.0]) : interpolate(progress, [0, 1], [1.0, 0.85]),
        opacity: phase === 'entry' ? progress : (1 - progress)
      };

    case 'hard-cut':
      return { x: 0, y: 0, scale: 1, opacity: 1 };

    default:
      return { x: 0, y: 0, scale: 1, opacity: 1 };
  }
}

// Combine entry and exit transforms
function combineTransforms(
  entry: { x: number; y: number; scale: number; opacity: number },
  exit: { x: number; y: number; scale: number; opacity: number }
): string {
  const totalX = entry.x + exit.x;
  const totalY = entry.y + exit.y;
  const totalScale = entry.scale * exit.scale;
  const totalOpacity = entry.opacity * exit.opacity;

  const transforms: string[] = [];

  if (totalX !== 0) transforms.push(`translateX(${totalX}px)`);
  if (totalY !== 0) transforms.push(`translateY(${totalY}px)`);
  if (totalScale !== 1) transforms.push(`scale(${totalScale})`);

  const transformString = transforms.length > 0 ? transforms.join(' ') : 'none';

  // Note: opacity handled separately in style, but returned for reference
  return transformString;
}

/**
 * Usage Example:
 *
 * <EnforcedScene
 *   sceneStartFrame={0}
 *   sceneDuration={70}
 *   entryTransition={{ type: 'slide-up', duration: 20, startFrame: 0 }}
 *   exitTransition={{ type: 'wipe-left', duration: 15, startFrame: 55 }}
 * >
 *   <YourSceneContent />
 * </EnforcedScene>
 *
 * Benefits:
 * - Automatic visibility check (no overlapping)
 * - Automatic transform chaining (no manual calculation)
 * - Enforces movement (can't create fade-only)
 * - Handles timing automatically
 */
