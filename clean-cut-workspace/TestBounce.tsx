import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

const TestBounce: React.FC = () => {
  const frame = useCurrentFrame();
  
  const bounce = interpolate(
    frame,
    [0, 30, 60],
    [0, -50, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 100,
          height: 100,
          marginLeft: -50,
          marginTop: -50,
          backgroundColor: '#ff6b6b',
          borderRadius: '50%',
          transform: `translateY(${bounce}px)`
        }}
      />
    </AbsoluteFill>
  );
};

export { TestBounce };