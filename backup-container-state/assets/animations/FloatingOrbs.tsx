import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

interface FloatingOrbsProps {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  orbCount?: number;
  animationSpeed?: number;
}

export const FloatingOrbs: React.FC<FloatingOrbsProps> = ({
  primaryColor = '#6366f1',
  secondaryColor = '#ec4899',
  backgroundColor = '#0f172a',
  orbCount = 5,
  animationSpeed = 1
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  
  const progress = (frame * animationSpeed) / durationInFrames;
  
  const orbs = Array.from({ length: orbCount }, (_, i) => {
    const orbProgress = (progress + i * 0.2) % 1;
    
    const x = interpolate(
      orbProgress,
      [0, 0.25, 0.5, 0.75, 1],
      [
        width * 0.2,
        width * 0.8,
        width * 0.8,
        width * 0.2,
        width * 0.2
      ],
      {
        easing: Easing.bezier(0.42, 0, 0.58, 1)
      }
    );
    
    const y = interpolate(
      orbProgress,
      [0, 0.25, 0.5, 0.75, 1],
      [
        height * 0.3,
        height * 0.3,
        height * 0.7,
        height * 0.7,
        height * 0.3
      ],
      {
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      }
    );
    
    const scale = interpolate(
      orbProgress,
      [0, 0.5, 1],
      [0.8, 1.3, 0.8],
      {
        easing: Easing.bezier(0, 0, 0.58, 1)
      }
    );
    
    const opacity = interpolate(
      orbProgress,
      [0, 0.2, 0.8, 1],
      [0.3, 1, 1, 0.3],
      {
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      }
    );
    
    const rotation = interpolate(
      frame,
      [0, durationInFrames],
      [0, 360 * (i + 1)],
      {
        easing: Easing.bezier(0.42, 0, 0.58, 1)
      }
    );
    
    return {
      id: i,
      x,
      y,
      scale,
      opacity,
      rotation,
      color: i % 2 === 0 ? primaryColor : secondaryColor,
      size: 60 + (i * 20)
    };
  });
  
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 50% 50%, ${primaryColor}20 0%, transparent 70%)`,
          opacity: 0.6
        }}
      />
      
      {/* Floating orbs */}
      {orbs.map((orb) => (
        <div
          key={orb.id}
          style={{
            position: 'absolute',
            left: orb.x - orb.size / 2,
            top: orb.y - orb.size / 2,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${orb.color}ff, ${orb.color}80)`,
            transform: `scale(${orb.scale}) rotate(${orb.rotation}deg)`,
            opacity: orb.opacity,
            filter: 'blur(1px)',
            boxShadow: `0 0 ${orb.size}px ${orb.color}40`,
            transition: 'none'
          }}
        />
      ))}
      
      {/* Center pulse effect */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${secondaryColor}30, transparent)`,
          transform: `translate(-50%, -50%) scale(${interpolate(
            Math.sin(progress * Math.PI * 4),
            [-1, 1],
            [0.5, 1.2]
          )})`,
          opacity: 0.4
        }}
      />
    </div>
  );
};