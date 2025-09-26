import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

interface StarBurstTestProps {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  starCount?: number;
  spinSpeed?: number;
  pulseIntensity?: number;
}

export const StarBurstTest: React.FC<StarBurstTestProps> = ({
  primaryColor = '#FFD700',
  secondaryColor = '#FF6B35',
  backgroundColor = '#1a1a2e',
  starCount = 8,
  spinSpeed = 1,
  pulseIntensity = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progress = frame / durationInFrames;
  
  // Smooth entrance animation
  const entranceProgress = interpolate(
    frame,
    [0, fps * 0.5],
    [0, 1],
    {
      easing: Easing.bezier(0, 0, 0.58, 1),
      extrapolateRight: 'clamp',
    }
  );

  // Spinning animation
  const rotation = interpolate(
    frame,
    [0, durationInFrames],
    [0, 360 * spinSpeed * 2],
    {
      extrapolateRight: 'extend',
    }
  );

  // Pulsing scale animation
  const pulseScale = 1 + Math.sin((frame / fps) * Math.PI * 4) * pulseIntensity * 0.2;

  // Color shift animation
  const colorShift = interpolate(
    frame,
    [0, durationInFrames],
    [0, 360],
    {
      extrapolateRight: 'extend',
    }
  );

  const createStar = (index: number, size: number, opacity: number, delay: number = 0) => {
    const angle = (360 / starCount) * index;
    const delayedProgress = Math.max(0, entranceProgress - delay);
    const starScale = delayedProgress * pulseScale * size;
    
    return (
      <div
        key={`star-${index}-${size}`}
        style={{
          position: 'absolute',
          width: 60,
          height: 60,
          left: '50%',
          top: '50%',
          transform: `
            translate(-50%, -50%)
            rotate(${angle + rotation}deg)
            translateY(-${120 + size * 20}px)
            scale(${starScale})
          `,
          opacity: opacity * delayedProgress,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            filter: `hue-rotate(${colorShift * (index / starCount)}deg) drop-shadow(0 0 10px currentColor)`,
            animation: 'none',
          }}
        />
      </div>
    );
  };

  // Create particles
  const particles = Array.from({ length: 20 }, (_, i) => {
    const particleAngle = (360 / 20) * i;
    const particleDistance = 200 + Math.sin((frame + i * 10) / 10) * 50;
    const particleOpacity = interpolate(
      Math.sin((frame + i * 5) / 15),
      [-1, 1],
      [0.1, 0.8]
    );
    
    return (
      <div
        key={`particle-${i}`}
        style={{
          position: 'absolute',
          width: 4,
          height: 4,
          left: '50%',
          top: '50%',
          backgroundColor: primaryColor,
          borderRadius: '50%',
          transform: `
            translate(-50%, -50%)
            rotate(${particleAngle + rotation * 0.5}deg)
            translateY(-${particleDistance}px)
            scale(${entranceProgress})
          `,
          opacity: particleOpacity * entranceProgress,
          boxShadow: `0 0 10px ${primaryColor}`,
        }}
      />
    );
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle, transparent 0%, ${backgroundColor}dd 70%)`,
          transform: `rotate(${rotation * 0.1}deg)`,
        }}
      />
      
      {/* Particles */}
      {particles}
      
      {/* Main star layers */}
      {Array.from({ length: starCount }, (_, i) => createStar(i, 1, 1, 0))}
      {Array.from({ length: starCount }, (_, i) => createStar(i, 0.7, 0.7, 0.1))}
      {Array.from({ length: starCount }, (_, i) => createStar(i, 0.4, 0.5, 0.2))}
      
      {/* Center glow */}
      <div
        style={{
          position: 'absolute',
          width: 100 * entranceProgress * pulseScale,
          height: 100 * entranceProgress * pulseScale,
          backgroundColor: primaryColor,
          borderRadius: '50%',
          opacity: 0.3,
          filter: 'blur(20px)',
          transform: `rotate(${rotation}deg)`,
        }}
      />
      
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: `translateX(-50%) scale(${entranceProgress})`,
          fontSize: 36,
          fontWeight: 'bold',
          color: primaryColor,
          textShadow: `0 0 20px ${primaryColor}`,
          fontFamily: 'Arial, sans-serif',
          opacity: entranceProgress,
        }}
      >
        STAR BURST
      </div>
    </div>
  );
};