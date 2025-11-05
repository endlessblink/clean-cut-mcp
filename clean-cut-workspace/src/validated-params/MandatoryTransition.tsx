import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

/**
 * MandatoryTransition - Enforces "Movement + Fades" rule
 *
 * This component PREVENTS fade-only transitions by requiring a movement type.
 * Implements the guideline: "Never fade-only transitions"
 *
 * Every transition MUST include movement (wipe, slide, zoom, or cut).
 */

export type TransitionType =
  | 'wipe-left'      // Old exits left, new enters from right
  | 'wipe-right'     // Old exits right, new enters from left
  | 'wipe-up'        // Old exits up, new enters from bottom
  | 'wipe-down'      // Old exits down, new enters from top
  | 'slide-up'       // Slides up (translateY)
  | 'slide-down'     // Slides down
  | 'dolly-in'       // Zoom in (scale increase)
  | 'dolly-out'      // Zoom out (scale decrease)
  | 'crossfade-scale'// Fade with scale change
  | 'hard-cut';      // Instant (no transition)

interface MandatoryTransitionProps {
  type: TransitionType;  // REQUIRED - can't create transition without specifying type
  direction: 'in' | 'out';
  children: React.ReactNode;
  duration?: number;  // Default: 15 frames
}

export const MandatoryTransition: React.FC<MandatoryTransitionProps> = ({
  type,
  direction,
  children,
  duration = 15
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Calculate transition progress
  const startFrame = direction === 'out' ? durationInFrames - duration : 0;
  const progress = spring({
    frame: direction === 'in' ? frame : Math.max(0, frame - startFrame),
    fps,
    config: { damping: 100, stiffness: 200 }
  });

  // Get transform based on transition type (ALWAYS includes movement)
  const transform = getTransformForType(type, direction, progress);

  return (
    <AbsoluteFill style={{ transform }}>
      {children}
    </AbsoluteFill>
  );
};

// Helper function that maps transition types to transforms
function getTransformForType(
  type: TransitionType,
  direction: 'in' | 'out',
  progress: number
): string {
  switch (type) {
    case 'wipe-left':
      const wipeLeftX = interpolate(
        progress,
        [0, 1],
        direction === 'in' ? [1920, 0] : [0, -1920]
      );
      return `translateX(${wipeLeftX}px)`;

    case 'wipe-right':
      const wipeRightX = interpolate(
        progress,
        [0, 1],
        direction === 'in' ? [-1920, 0] : [0, 1920]
      );
      return `translateX(${wipeRightX}px)`;

    case 'wipe-up':
      const wipeUpY = interpolate(
        progress,
        [0, 1],
        direction === 'in' ? [1080, 0] : [0, -1080]
      );
      return `translateY(${wipeUpY}px)`;

    case 'wipe-down':
      const wipeDownY = interpolate(
        progress,
        [0, 1],
        direction === 'in' ? [-1080, 0] : [0, 1080]
      );
      return `translateY(${wipeDownY}px)`;

    case 'slide-up':
      const slideY = interpolate(
        progress,
        [0, 1],
        direction === 'in' ? [40, 0] : [0, -40]
      );
      return `translateY(${slideY}px)`;

    case 'slide-down':
      const slideDownY = interpolate(
        progress,
        [0, 1],
        direction === 'in' ? [-40, 0] : [0, 40]
      );
      return `translateY(${slideDownY}px)`;

    case 'dolly-in':
      const dollyInScale = interpolate(
        progress,
        [0, 1],
        direction === 'in' ? [1.0, 1.5] : [1.5, 1.0]
      );
      return `scale(${dollyInScale})`;

    case 'dolly-out':
      const dollyOutScale = interpolate(
        progress,
        [0, 1],
        direction === 'in' ? [2.0, 1.0] : [1.0, 2.0]
      );
      return `scale(${dollyOutScale})`;

    case 'crossfade-scale':
      const crossScale = interpolate(
        progress,
        [0, 1],
        direction === 'in' ? [0.9, 1.0] : [1.0, 0.85]
      );
      const crossOpacity = direction === 'in' ? progress : 1 - progress;
      return `scale(${crossScale}) opacity(${crossOpacity})`;

    case 'hard-cut':
      // Hard cut: no transition, instant
      return 'none';

    default:
      // Fallback: horizontal wipe (NEVER fade-only)
      const fallbackX = interpolate(
        progress,
        [0, 1],
        direction === 'in' ? [1920, 0] : [0, -1920]
      );
      return `translateX(${fallbackX}px)`;
  }
}

/**
 * Usage example - ENFORCES transition type selection:
 *
 * <Sequence from={0} durationInFrames={85}>
 *   <MandatoryTransition type="slide-up" direction="in">
 *     <Scene1 />
 *   </MandatoryTransition>
 * </Sequence>
 *
 * <Sequence from={70} durationInFrames={80}>
 *   <MandatoryTransition type="wipe-left" direction="in">
 *     <Scene2 />
 *   </MandatoryTransition>
 * </Sequence>
 *
 * Note: Cannot create transition without specifying type
 * Note: Fade-only is NOT an option (enforces guidelines)
 */
