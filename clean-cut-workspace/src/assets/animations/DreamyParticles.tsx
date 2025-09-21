import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

interface DreamyParticlesProps {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  particleCount?: number;
  animationSpeed?: number;
}

export const DreamyParticles: React.FC<DreamyParticlesProps> = ({
  primaryColor = '#FF6B6B',
  secondaryColor = '#4ECDC4',
  backgroundColor = '#1A1A2E',
  particleCount = 5,
  animationSpeed = 1
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const baseOffset = (i * 60) / animationSpeed;
    const adjustedFrame = (frame + baseOffset) * animationSpeed;
    
    // Smooth floating motion
    const y = interpolate(
      adjustedFrame,
      [0, fps * 3, fps * 6],
      [height * 0.7, height * 0.3, height * 0.7],
      {
        easing: Easing.bezier(0.42, 0, 0.58, 1),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      }
    );
    
    const x = interpolate(
      adjustedFrame,
      [0, fps * 6],
      [width * 0.2 + (i * width * 0.15), width * 0.8 - (i * width * 0.1)],
      {
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      }
    );
    
    // Pulsing scale
    const scale = interpolate(
      (adjustedFrame + i * 20) % (fps * 2),
      [0, fps, fps * 2],
      [0.8, 1.2, 0.8],
      {
        easing: Easing.bezier(0.42, 0, 0.58, 1)
      }
    );
    
    // Opacity animation
    const opacity = interpolate(
      adjustedFrame,
      [0, fps * 1, fps * 5, fps * 6],
      [0, 1, 1, 0],
      {
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      }
    );
    
    return {
      x,
      y,
      scale,
      opacity,
      color: i % 2 === 0 ? primaryColor : secondaryColor,
      size: 60 + (i * 10)
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
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at center, transparent 0%, ${backgroundColor}99 70%)`,
          zIndex: 1
        }}
      />
      
      {/* Floating particles */}
      {particles.map((particle, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: particle.x - particle.size / 2,
            top: particle.y - particle.size / 2,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${particle.color}FF, ${particle.color}88, ${particle.color}33)`,
            transform: `scale(${particle.scale})`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size}px ${particle.color}44`,
            zIndex: 2
          }}
        />
      ))}
      
      {/* Central glow effect */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${primaryColor}22 0%, transparent 70%)`,
          opacity: interpolate(
            frame,
            [0, fps * 2, fps * 4, fps * 6],
            [0, 0.8, 0.8, 0],
            {
              easing: Easing.bezier(0.42, 0, 0.58, 1)
            }
          ),
          zIndex: 0
        }}
      />
    </div>
  );
};