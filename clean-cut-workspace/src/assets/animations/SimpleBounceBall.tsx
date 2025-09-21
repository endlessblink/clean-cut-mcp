import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from 'remotion';

interface SimpleBounceBallProps {
  ballColor?: string;
  backgroundColor?: string;
  bounceHeight?: number;
}

export const SimpleBounceBall: React.FC<SimpleBounceBallProps> = ({
  ballColor = '#ff6b6b',
  backgroundColor = '#4ecdc4',
  bounceHeight = 200
}) => {
  const frame = useCurrentFrame();
  
  // Create a bouncing motion that repeats every 30 frames (1 second at 30fps)
  const bounceProgress = (frame % 30) / 30;
  
  // Use a sine wave for smooth bouncing motion
  const y = interpolate(
    bounceProgress,
    [0, 0.5, 1],
    [0, bounceHeight, 0],
    {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    }
  );
  
  // Add some horizontal drift
  const x = interpolate(
    frame,
    [0, 90], // 3 seconds at 30fps
    [0, 100],
    {
      easing: Easing.bezier(0.42, 0, 0.58, 1)
    }
  );
  
  // Scale effect on bounce
  const scale = interpolate(
    bounceProgress,
    [0, 0.5, 1],
    [1, 0.8, 1],
    {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    }
  );

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <div
        style={{
          position: 'absolute',
          left: `${50 + x}%`,
          top: `${70 - (y / 3)}%`,
          width: 60,
          height: 60,
          backgroundColor: ballColor,
          borderRadius: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}
      />
    </AbsoluteFill>
  );
};