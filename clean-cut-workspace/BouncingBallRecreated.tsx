import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

export const BouncingBallRecreated: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Create bouncing animation
  const bounceHeight = interpolate(
    frame,
    [0, fps * 0.75, fps * 1.5, fps * 2.25, fps * 3, fps * 3.75, fps * 4.5, fps * 5.25, durationInFrames],
    [height - 100, 200, height - 100, 150, height - 100, 100, height - 100, 50, height - 100],
    {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Horizontal movement
  const horizontalPosition = interpolate(
    frame,
    [0, durationInFrames],
    [100, width - 100],
    {
      easing: Easing.inOut(Easing.cubic),
    }
  );

  // Color animation
  const hue = interpolate(
    frame,
    [0, durationInFrames],
    [0, 360],
    {
      extrapolateRight: 'clamp',
    }
  );

  // Scale animation for squash effect
  const scale = interpolate(
    bounceHeight,
    [height - 100, height / 2, 50],
    [0.8, 1, 1.2],
    {
      easing: Easing.out(Easing.quad),
    }
  );

  // Background gradient animation
  const bgOpacity = interpolate(
    frame,
    [0, fps, durationInFrames - fps, durationInFrames],
    [0, 1, 1, 0]
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(45deg, 
          hsla(${hue}, 70%, 90%, ${bgOpacity}), 
          hsla(${hue + 60}, 70%, 95%, ${bgOpacity}))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Animated title */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          fontSize: 48,
          fontWeight: 'bold',
          color: `hsl(${hue + 180}, 80%, 40%)`,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          opacity: interpolate(frame, [0, fps * 0.5, fps, durationInFrames - fps, durationInFrames], [0, 0, 1, 1, 0]),
          transform: `translateY(${interpolate(frame, [0, fps], [50, 0], {
            easing: Easing.out(Easing.back(2)),
          })}px)`,
        }}
      >
        Bouncing Fun!
      </div>

      {/* Shadow */}
      <div
        style={{
          position: 'absolute',
          left: horizontalPosition - 30,
          top: height - 80,
          width: 60,
          height: 20,
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.2)',
          filter: 'blur(8px)',
          transform: `scaleX(${interpolate(bounceHeight, [50, height - 100], [1.5, 0.5])})`,
        }}
      />

      {/* Bouncing ball */}
      <div
        style={{
          position: 'absolute',
          left: horizontalPosition - 25,
          top: bounceHeight - 25,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, 
            hsl(${hue}, 100%, 80%), 
            hsl(${hue}, 90%, 60%), 
            hsl(${hue}, 80%, 40%))`,
          transform: `scale(${scale})`,
          boxShadow: `0 0 20px hsla(${hue}, 100%, 60%, 0.5)`,
          border: `3px solid hsl(${hue}, 100%, 95%)`,
        }}
      />

      {/* Trailing particles */}
      {Array.from({ length: 5 }).map((_, i) => {
        const delay = i * 3;
        const particleFrame = Math.max(0, frame - delay);
        const particleOpacity = interpolate(
          particleFrame,
          [0, 10, 20],
          [1, 0.5, 0],
          { extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: interpolate(particleFrame, [0, durationInFrames], [100 - i * 10, width - 100 - i * 10], {
                easing: Easing.inOut(Easing.cubic),
              }) - 5,
              top: interpolate(
                particleFrame,
                [0, fps * 0.75, fps * 1.5, fps * 2.25, fps * 3, fps * 3.75, fps * 4.5, fps * 5.25, durationInFrames],
                [height - 100, 200, height - 100, 150, height - 100, 100, height - 100, 50, height - 100],
                {
                  easing: Easing.out(Easing.quad),
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }
              ) - 5,
              width: 10 - i * 1.5,
              height: 10 - i * 1.5,
              borderRadius: '50%',
              background: `hsl(${hue + i * 30}, 100%, 70%)`,
              opacity: particleOpacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};