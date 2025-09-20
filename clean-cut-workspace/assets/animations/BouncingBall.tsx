import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';



  // Safe interpolation helper - prevents inputRange monotonic errors
  const safeInterpolate = (frame, inputRange, outputRange, options = {}) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, options);
  };
const BouncingBall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Create bouncing motion using sine wave
  const bounceHeight = safeInterpolate(
    Math.sin((frame / fps) * Math.PI * 4), // 4 bounces in 2 seconds
    [-1, 1],
    [300, 100] // Bounce between these Y positions
  );

  // Horizontal movement
  const ballX = safeInterpolate(
    frame,
    [0, durationInFrames],
    [100, 700] // Move from left to right
  );

  // Color transition
  const hue = safeInterpolate(
    frame,
    [0, durationInFrames],
    [0, 360] // Full color wheel rotation
  );

  // Scale effect on bounce
  const scale = safeInterpolate(
    Math.sin((frame / fps) * Math.PI * 4),
    [-1, 1],
    [0.8, 1.2] // Squash and stretch effect
  );

  // Shadow opacity based on height
  const shadowOpacity = safeInterpolate(
    bounceHeight,
    [100, 300],
    [0.8, 0.2] // Shadow fades as ball goes higher
  );

  // Shadow scale based on height
  const shadowScale = safeInterpolate(
    bounceHeight,
    [100, 300],
    [1.5, 0.8] // Shadow gets smaller as ball goes higher
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a2e',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
        }}
      />

      {/* Shadow */}
      <div
        style={{
          position: 'absolute',
          left: ballX - 25,
          top: 380,
          width: 50,
          height: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '50%',
          opacity: shadowOpacity,
          transform: `scaleX(${shadowScale})`,
          filter: 'blur(5px)',
        }}
      />

      {/* Bouncing ball */}
      <div
        style={{
          position: 'absolute',
          left: ballX - 25,
          top: bounceHeight - 25,
          width: 50,
          height: 50,
          backgroundColor: `hsl(${hue}, 100%, 60%)`,
          borderRadius: '50%',
          transform: `scale(${scale})`,
          boxShadow: `0 0 20px hsl(${hue}, 100%, 60%)`,
          background: `radial-gradient(circle at 30% 30%, hsl(${hue}, 100%, 80%), hsl(${hue}, 100%, 40%))`,
        }}
      />

      {/* Trailing particles */}
      {[...Array(5)].map((_, i) => {
        const delay = i * 3;
        const trailX = safeInterpolate(
          frame - delay,
          [0, durationInFrames],
          [100, 700]
        );
        const trailY = safeInterpolate(
          Math.sin(((frame - delay) / fps) * Math.PI * 4),
          [-1, 1],
          [300, 100]
        );
        const trailOpacity = Math.max(0, 1 - (i * 0.2));
        const trailSize = 10 - (i * 1.5);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: trailX - trailSize / 2,
              top: trailY - trailSize / 2,
              width: trailSize,
              height: trailSize,
              backgroundColor: `hsl(${hue - (i * 30)}, 100%, 60%)`,
              borderRadius: '50%',
              opacity: frame > delay ? trailOpacity : 0,
              filter: 'blur(1px)',
            }}
          />
        );
      })}
    </div>
  );
};

export { BouncingBall };