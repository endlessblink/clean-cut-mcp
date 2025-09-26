import React from 'react';
import { 
  AbsoluteFill, 
  interpolate, 
  spring, 
  useCurrentFrame, 
  useVideoConfig 
} from 'remotion';

interface SimpleCircleProps {
  circleColor?: string;
  backgroundColor?: string;
  animationSpeed?: number;
  maxSize?: number;
}

export const SimpleCircle: React.FC<SimpleCircleProps> = ({
  circleColor = '#3b82f6',
  backgroundColor = '#0f172a',
  animationSpeed = 1,
  maxSize = 200
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Create smooth spring animation for scaling
  const scale = spring({
    frame: frame * animationSpeed,
    fps,
    config: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
  });
  
  // Create pulsing effect
  const pulse = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    [0.8, 1.2, 0.8],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Color animation from initial to lighter shade
  const colorOpacity = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    [0.8, 1, 0.8],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Rotation animation
  const rotation = interpolate(
    frame,
    [0, durationInFrames],
    [0, 360],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: maxSize,
          height: maxSize,
          borderRadius: '50%',
          backgroundColor: circleColor,
          transform: `scale(${scale * pulse}) rotate(${rotation}deg)`,
          opacity: colorOpacity,
          boxShadow: `0 0 ${maxSize * 0.5}px ${circleColor}40`,
          transition: 'all 0.3s ease',
        }}
      />
    </AbsoluteFill>
  );
};