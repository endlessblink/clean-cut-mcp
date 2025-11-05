/**
 * useCamera Hook
 *
 * Easy-to-use React hook for camera movements in Remotion animations
 */

import { useCurrentFrame } from 'remotion';
import { CameraController, CameraConfig, CameraPosition } from './camera-controller';
import { useMemo } from 'react';

/**
 * Simple camera movement configuration
 */
export interface SimpleCameraConfig {
  from: Partial<CameraPosition>;
  to: Partial<CameraPosition>;
  duration: [number, number]; // [startFrame, endFrame]
  easing?: any;
}

/**
 * useCamera - Simple camera movements
 *
 * @param config - Camera movement configuration
 * @returns Camera transform string and position
 *
 * @example
 * const camera = useCamera({
 *   from: { x: 0, zoom: 1 },
 *   to: { x: -500, zoom: 1.5 },
 *   duration: [0, 120]
 * });
 *
 * <div style={{ transform: camera.transform }}>Content</div>
 */
export const useCamera = (config: SimpleCameraConfig) => {
  const frame = useCurrentFrame();

  const camera = useMemo(() => {
    const cameraConfig: CameraConfig = {
      keyframes: [
        {
          frame: config.duration[0],
          position: config.from,
          easing: config.easing,
        },
        {
          frame: config.duration[1],
          position: config.to,
        },
      ],
    };

    return new CameraController(cameraConfig);
  }, [config]);

  const position = camera.getPositionAtFrame(frame);
  const transform = camera.getTransform(position);

  return {
    transform,
    position,
    x: position.x,
    y: position.y,
    zoom: position.zoom,
    rotate: position.rotate,
    tilt: position.tilt,
  };
};

/**
 * useAdvancedCamera - Complex camera movements with keyframes
 *
 * @param config - Full camera configuration with keyframes
 * @returns Camera transform string and position
 *
 * @example
 * const camera = useAdvancedCamera({
 *   keyframes: [
 *     { frame: 0, position: { x: 0, zoom: 1 } },
 *     { frame: 60, position: { x: -300, zoom: 1.5 } },
 *     { frame: 120, position: { x: -600, zoom: 1 } },
 *   ]
 * });
 */
export const useAdvancedCamera = (config: CameraConfig) => {
  const frame = useCurrentFrame();

  const camera = useMemo(() => {
    return new CameraController(config);
  }, [config]);

  const position = camera.getPositionAtFrame(frame);
  const transform = camera.getTransform(position);

  return {
    transform,
    position,
    x: position.x,
    y: position.y,
    zoom: position.zoom,
    rotate: position.rotate,
    tilt: position.tilt,
  };
};

/**
 * useCameraTransform - Get only the transform string (most common use case)
 *
 * @param config - Simple camera configuration
 * @returns CSS transform string
 *
 * @example
 * const transform = useCameraTransform({
 *   from: { x: 0 },
 *   to: { x: -500 },
 *   duration: [0, 120]
 * });
 *
 * <div style={{ transform }}>Content</div>
 */
export const useCameraTransform = (config: SimpleCameraConfig): string => {
  const { transform } = useCamera(config);
  return transform;
};

/**
 * Usage Examples:
 *
 * // 1. Basic pan
 * const camera = useCamera({
 *   from: { x: 0 },
 *   to: { x: -500 },
 *   duration: [0, 120]
 * });
 *
 * // 2. Zoom with pan
 * const zoomCamera = useCamera({
 *   from: { x: 0, zoom: 1 },
 *   to: { x: -300, zoom: 2 },
 *   duration: [30, 150]
 * });
 *
 * // 3. Multi-position sequence
 * const sequenceCamera = useAdvancedCamera({
 *   keyframes: [
 *     { frame: 0, position: { x: 0, y: 0, zoom: 1 } },
 *     { frame: 60, position: { x: -400, y: 0, zoom: 1.5 } },
 *     { frame: 120, position: { x: -400, y: -200, zoom: 2 } },
 *     { frame: 180, position: { x: 0, y: 0, zoom: 1 } },
 *   ]
 * });
 *
 * // 4. Simple transform only
 * const transform = useCameraTransform({
 *   from: { zoom: 1 },
 *   to: { zoom: 1.5 },
 *   duration: [0, 90]
 * });
 *
 * // Apply to your animation
 * <AbsoluteFill style={{ transform: camera.transform }}>
 *   Your content here
 * </AbsoluteFill>
 */