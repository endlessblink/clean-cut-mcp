import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const PulsingCircle: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Create a pulsing scale effect that completes one full cycle in 30 frames (1 second)
  const scale = interpolate(
    frame,
    [0, 15, 30],
    [0.8, 1.3, 0.8],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Create a color shift effect
  const hue = interpolate(
    frame,
    [0, 30],
    [240, 320],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Create an opacity pulse
  const opacity = interpolate(
    frame,
    [0, 15, 30],
    [0.7, 1, 0.7],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1a1a1a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `linear-gradient(45deg, hsl(${hue}, 70%, 60%), hsl(${hue + 30}, 80%, 70%))`,
          transform: `scale(${scale})`,
          opacity,
          boxShadow: `0 0 ${scale * 20}px hsla(${hue}, 70%, 60%, 0.5)`,
          transition: 'none',
        }}
      />
    </AbsoluteFill>
  );
};