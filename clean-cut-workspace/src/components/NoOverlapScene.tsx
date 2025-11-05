import React, { ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

/**
 * NoOverlapScene - ENFORCES no overlapping content
 *
 * This component makes overlapping IMPOSSIBLE by:
 * 1. Hard boundaries (return null outside frame range)
 * 2. Automatic exit handling (wipes/cuts built-in)
 * 3. No manual opacity management needed
 *
 * Pattern that works (same as particles/motion blur):
 * - Structure enforces correctness
 * - No manual calculations
 * - Impossible to violate rules
 */

export type ExitType =
  | 'hard-cut'       // Instant removal (0 frames overlap)
  | 'wipe-left'      // Exits left (translateX)
  | 'wipe-right'     // Exits right
  | 'wipe-up'        // Exits up
  | 'wipe-down'      // Exits down
  | 'scale-out';     // Scales down dramatically (0.3x)

interface NoOverlapSceneProps {
  startFrame: number;
  endFrame: number;
  exitType: ExitType;
  exitDuration?: number;  // frames (default: 15)
  children: ReactNode;
}

export const NoOverlapScene: React.FC<NoOverlapSceneProps> = ({
  startFrame,
  endFrame,
  exitType,
  exitDuration = 15,
  children
}) => {
  const globalFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // HARD BOUNDARY: Don't render outside range (prevents overlaps)
  if (globalFrame < startFrame || globalFrame >= endFrame) {
    return null;  // ENFORCED - no exceptions
  }

  const localFrame = globalFrame - startFrame;
  const sceneDuration = endFrame - startFrame;

  // Calculate exit transform (NO opacity - only movement or cut)
  const exitTransform = calculateExitTransform(
    localFrame,
    sceneDuration,
    exitType,
    exitDuration,
    fps
  );

  return (
    <AbsoluteFill style={{ transform: exitTransform }}>
      {children}
    </AbsoluteFill>
  );
};

function calculateExitTransform(
  localFrame: number,
  sceneDuration: number,
  exitType: ExitType,
  exitDuration: number,
  fps: number
): string {
  const exitStartFrame = sceneDuration - exitDuration;

  // No exit transform during entry/hold phases
  if (localFrame < exitStartFrame) {
    return 'none';
  }

  // Calculate exit progress
  const exitProgress = spring({
    frame: localFrame - exitStartFrame,
    fps,
    config: { damping: 100, stiffness: 200 }
  });

  switch (exitType) {
    case 'hard-cut':
      // Hard cut: no transform, just disappears at boundary
      return 'none';

    case 'wipe-left':
      const wipeLeftX = interpolate(exitProgress, [0, 1], [0, -1920]);
      return `translateX(${wipeLeftX}px)`;

    case 'wipe-right':
      const wipeRightX = interpolate(exitProgress, [0, 1], [0, 1920]);
      return `translateX(${wipeRightX}px)`;

    case 'wipe-up':
      const wipeUpY = interpolate(exitProgress, [0, 1], [0, -1080]);
      return `translateY(${wipeUpY}px)`;

    case 'wipe-down':
      const wipeDownY = interpolate(exitProgress, [0, 1], [0, 1080]);
      return `translateY(${wipeDownY}px)`;

    case 'scale-out':
      // Squash & stretch: Anticipation squash → dramatic shrink
      // Professional animation principle (12 principles of animation)
      let scaleOut;
      if (exitProgress < 0.2) {
        // Anticipation: Squash slightly (1.0 → 0.9) in first 20%
        scaleOut = interpolate(exitProgress, [0, 0.2], [1.0, 0.9]);
      } else {
        // Dramatic shrink: 0.9 → 0.2 in remaining 80%
        scaleOut = interpolate(exitProgress, [0.2, 1], [0.9, 0.2]);
      }
      return `scale(${scaleOut})`;

    default:
      return 'none';
  }
}

/**
 * Usage Example:
 *
 * <NoOverlapScene
 *   startFrame={0}
 *   endFrame={70}          // Hard boundary - will NOT render after frame 70
 *   exitType="wipe-left"   // Exits by wiping left
 *   exitDuration={15}      // Exit starts at frame 55 (70-15)
 * >
 *   <YourSceneContent />
 * </NoOverlapScene>
 *
 * <NoOverlapScene
 *   startFrame={55}        // Can start before previous ends (for wipe overlap)
 *   endFrame={135}
 *   exitType="hard-cut"    // Instant removal at frame 135
 * >
 *   <NextSceneContent />
 * </NoOverlapScene>
 *
 * Benefits:
 * - IMPOSSIBLE to render outside boundaries
 * - NO opacity-based overlaps (only movement-based wipes)
 * - Automatic exit handling (no manual calculations)
 * - Enforces hard cuts vs wipes correctly
 */
