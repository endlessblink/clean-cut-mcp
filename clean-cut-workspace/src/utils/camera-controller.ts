/**
 * Camera Controller for Remotion Animations
 *
 * Cinematic camera movements for professional storytelling.
 * Replace basic fades with camera transitions: pan, zoom, orbit, dolly.
 *
 * USER REQUESTED: "Can we also add camera to move between shots?"
 */

import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ProfessionalEasing } from './professional-easing';

/**
 * Camera Position in 3D space
 */
export interface CameraPosition {
  x: number; // Horizontal position (left/right pan)
  y: number; // Vertical position (up/down pan)
  zoom: number; // Zoom level (1 = normal, 2 = 2x zoom)
  rotate: number; // Rotation in degrees
  tilt: number; // Vertical tilt in degrees
}

/**
 * Camera animation keyframe
 */
export interface CameraKeyframe {
  frame: number; // Frame number for this keyframe
  position: Partial<CameraPosition>; // Camera position at this frame
  easing?: any; // Easing function (defaults to smooth)
  duration?: number; // Duration to next keyframe (optional)
}

/**
 * Camera animation configuration
 */
export interface CameraConfig {
  keyframes: CameraKeyframe[]; // Camera positions over time
  defaultEasing?: any; // Default easing for all movements
  enableSmoothing?: boolean; // Smooth between keyframes
}

/**
 * Camera Controller Class
 *
 * Manages camera movements and provides transform values
 */
export class CameraController {
  private config: CameraConfig;
  private defaultPosition: CameraPosition = {
    x: 0,
    y: 0,
    zoom: 1,
    rotate: 0,
    tilt: 0,
  };

  constructor(config: CameraConfig) {
    this.config = {
      ...config,
      defaultEasing: config.defaultEasing || ProfessionalEasing.cinematic,
      enableSmoothing: config.enableSmoothing !== false,
    };

    // Sort keyframes by frame number
    this.config.keyframes.sort((a, b) => a.frame - b.frame);
  }

  /**
   * Get camera position at specific frame
   */
  getPositionAtFrame(frame: number): CameraPosition {
    const keyframes = this.config.keyframes;

    // Before first keyframe
    if (frame <= keyframes[0].frame) {
      return {
        ...this.defaultPosition,
        ...keyframes[0].position,
      };
    }

    // After last keyframe
    if (frame >= keyframes[keyframes.length - 1].frame) {
      return {
        ...this.defaultPosition,
        ...keyframes[keyframes.length - 1].position,
      };
    }

    // Find surrounding keyframes
    let beforeKeyframe = keyframes[0];
    let afterKeyframe = keyframes[1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (frame >= keyframes[i].frame && frame <= keyframes[i + 1].frame) {
        beforeKeyframe = keyframes[i];
        afterKeyframe = keyframes[i + 1];
        break;
      }
    }

    // Interpolate between keyframes
    const startFrame = beforeKeyframe.frame;
    const endFrame = afterKeyframe.frame;
    const easing = beforeKeyframe.easing || this.config.defaultEasing;

    const progress = interpolate(
      frame,
      [startFrame, endFrame],
      [0, 1],
      { easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Merge positions with interpolation
    const startPos = { ...this.defaultPosition, ...beforeKeyframe.position };
    const endPos = { ...this.defaultPosition, ...afterKeyframe.position };

    return {
      x: startPos.x + (endPos.x - startPos.x) * progress,
      y: startPos.y + (endPos.y - startPos.y) * progress,
      zoom: startPos.zoom + (endPos.zoom - startPos.zoom) * progress,
      rotate: startPos.rotate + (endPos.rotate - startPos.rotate) * progress,
      tilt: startPos.tilt + (endPos.tilt - startPos.tilt) * progress,
    };
  }

  /**
   * Get CSS transform string for camera position
   */
  getTransform(position: CameraPosition): string {
    const transforms: string[] = [];

    // Apply transformations in correct order
    if (position.x !== 0 || position.y !== 0) {
      transforms.push(`translate(${-position.x}px, ${-position.y}px)`);
    }

    if (position.zoom !== 1) {
      transforms.push(`scale(${position.zoom})`);
    }

    if (position.rotate !== 0) {
      transforms.push(`rotate(${position.rotate}deg)`);
    }

    if (position.tilt !== 0) {
      transforms.push(`rotateX(${position.tilt}deg)`);
    }

    return transforms.join(' ');
  }

  /**
   * Get camera transform at specific frame
   */
  getTransformAtFrame(frame: number): string {
    const position = this.getPositionAtFrame(frame);
    return this.getTransform(position);
  }
}

/**
 * Camera Movement Presets
 *
 * Common cinematic camera movements for quick use
 */

/**
 * Pan camera horizontally (left to right or right to left)
 */
export const createPanMovement = (
  startFrame: number,
  endFrame: number,
  startX: number,
  endX: number,
  easing = ProfessionalEasing.cameraPan
): CameraConfig => ({
  keyframes: [
    { frame: startFrame, position: { x: startX }, easing },
    { frame: endFrame, position: { x: endX } },
  ],
});

/**
 * Zoom camera (push in or pull out)
 */
export const createZoomMovement = (
  startFrame: number,
  endFrame: number,
  startZoom: number,
  endZoom: number,
  easing = ProfessionalEasing.cameraZoom
): CameraConfig => ({
  keyframes: [
    { frame: startFrame, position: { zoom: startZoom }, easing },
    { frame: endFrame, position: { zoom: endZoom } },
  ],
});

/**
 * Dolly movement (forward/backward with zoom and position)
 */
export const createDollyMovement = (
  startFrame: number,
  endFrame: number,
  startZoom: number,
  endZoom: number,
  startY: number = 0,
  endY: number = 0,
  easing = ProfessionalEasing.cinematic
): CameraConfig => ({
  keyframes: [
    { frame: startFrame, position: { zoom: startZoom, y: startY }, easing },
    { frame: endFrame, position: { zoom: endZoom, y: endY } },
  ],
});

/**
 * Orbit movement (circular camera movement around subject)
 */
export const createOrbitMovement = (
  startFrame: number,
  endFrame: number,
  radius: number,
  startAngle: number = 0,
  endAngle: number = 360,
  centerX: number = 0,
  centerY: number = 0,
  easing = ProfessionalEasing.smooth
): CameraConfig => {
  const keyframes: CameraKeyframe[] = [];
  const steps = 8; // Number of keyframes for smooth orbit

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const frame = startFrame + (endFrame - startFrame) * progress;
    const angle = startAngle + (endAngle - startAngle) * progress;
    const angleRad = (angle * Math.PI) / 180;

    keyframes.push({
      frame,
      position: {
        x: centerX + Math.cos(angleRad) * radius,
        y: centerY + Math.sin(angleRad) * radius,
        rotate: angle,
      },
      easing,
    });
  }

  return { keyframes };
};

/**
 * Multi-shot sequence (camera moves between multiple positions)
 */
export const createMultiShotSequence = (
  shots: Array<{
    startFrame: number;
    duration: number;
    position: Partial<CameraPosition>;
    easing?: any;
  }>
): CameraConfig => {
  const keyframes: CameraKeyframe[] = [];

  shots.forEach((shot) => {
    keyframes.push({
      frame: shot.startFrame,
      position: shot.position,
      easing: shot.easing || ProfessionalEasing.cinematic,
    });

    keyframes.push({
      frame: shot.startFrame + shot.duration,
      position: shot.position,
    });
  });

  return { keyframes };
};

/**
 * Ken Burns effect (slow zoom and pan on static image)
 */
export const createKenBurnsEffect = (
  startFrame: number,
  endFrame: number,
  startZoom: number = 1,
  endZoom: number = 1.2,
  startX: number = 0,
  endX: number = -100,
  startY: number = 0,
  endY: number = -50
): CameraConfig => ({
  keyframes: [
    {
      frame: startFrame,
      position: { zoom: startZoom, x: startX, y: startY },
      easing: ProfessionalEasing.smooth,
    },
    {
      frame: endFrame,
      position: { zoom: endZoom, x: endX, y: endY },
    },
  ],
});

/**
 * Reveal movement (zoom out to reveal full scene)
 */
export const createRevealMovement = (
  startFrame: number,
  endFrame: number,
  startZoom: number = 3,
  endZoom: number = 1,
  easing = ProfessionalEasing.dramatic
): CameraConfig => ({
  keyframes: [
    { frame: startFrame, position: { zoom: startZoom }, easing },
    { frame: endFrame, position: { zoom: endZoom } },
  ],
});

/**
 * Handheld shake (subtle camera shake for realism)
 */
export const createHandheldShake = (
  frame: number,
  intensity: number = 2,
  frequency: number = 0.5
): { x: number; y: number } => {
  const shake = {
    x: Math.sin(frame * frequency) * intensity,
    y: Math.cos(frame * frequency * 1.3) * intensity,
  };

  return shake;
};

/**
 * Usage Examples:
 *
 * // Basic pan
 * const camera = new CameraController(
 *   createPanMovement(0, 120, 0, -500)
 * );
 * const transform = camera.getTransformAtFrame(frame);
 *
 * // Zoom into detail
 * const zoomCamera = new CameraController(
 *   createZoomMovement(0, 60, 1, 2.5)
 * );
 *
 * // Orbit around subject
 * const orbitCamera = new CameraController(
 *   createOrbitMovement(0, 240, 300, 0, 360)
 * );
 *
 * // Multi-shot sequence
 * const sequenceCamera = new CameraController(
 *   createMultiShotSequence([
 *     { startFrame: 0, duration: 60, position: { x: 0, zoom: 1 } },
 *     { startFrame: 60, duration: 60, position: { x: -500, zoom: 1.5 } },
 *     { startFrame: 120, duration: 60, position: { x: 0, zoom: 1 } },
 *   ])
 * );
 *
 * // Apply to component
 * <div style={{ transform: camera.getTransformAtFrame(frame) }}>
 *   Content
 * </div>
 */