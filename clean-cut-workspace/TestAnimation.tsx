import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

export const TestAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Simple rotation animation
  const rotation = interpolate(
    frame,
    [0, durationInFrames],
    [0, 360]
  );

  // Color change
  const hue = interpolate(
    frame,
    [0, durationInFrames],
    [0, 360]
  );

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(45deg, #1a1a1a, #2d2d2d)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `hsl(${hue}, 70%, 60%)`,
          transform: `rotate(${rotation}deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          fontWeight: 'bold',
          color: 'white',
        }}
      >
        TEST
      </div>
    </AbsoluteFill>
  );
};