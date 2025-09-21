import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

interface ParticleBurstProps {
  particleCount?: number;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  centerText?: string;
  animationSpeed?: number;
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  particleCount = 24,
  primaryColor = '#FF6B6B',
  secondaryColor = '#4ECDC4',
  backgroundColor = '#1A1A2E',
  centerText = 'BURST!',
  animationSpeed = 1,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  
  const adjustedFrame = frame * animationSpeed;
  
  // Center point
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Main burst animation timing
  const burstStart = 30;
  const burstPeak = 90;
  const fadeStart = 120;
  
  // Text scale animation
  const textScale = interpolate(
    adjustedFrame,
    [0, burstStart, burstPeak],
    [0, 0, 1.2],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0, 0, 0.58, 1),
    }
  );
  
  // Text opacity
  const textOpacity = interpolate(
    adjustedFrame,
    [0, burstStart, fadeStart, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Generate particles
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = interpolate(
      adjustedFrame,
      [burstStart, burstPeak, fadeStart],
      [0, 200, 300],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }
    );
    
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const opacity = interpolate(
      adjustedFrame,
      [burstStart, burstPeak, fadeStart, durationInFrames],
      [0, 1, 0.8, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );
    
    const scale = interpolate(
      adjustedFrame,
      [burstStart, burstPeak, fadeStart],
      [0.2, 1, 0.5],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.42, 0, 0.58, 1),
      }
    );
    
    // Alternate colors
    const color = i % 2 === 0 ? primaryColor : secondaryColor;
    
    return {
      x,
      y,
      opacity,
      scale,
      color,
      rotation: angle * (180 / Math.PI) + adjustedFrame * 2,
    };
  });
  
  // Background pulse
  const bgPulse = interpolate(
    adjustedFrame,
    [burstStart, burstPeak],
    [0, 0.3],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0, 0, 0.58, 1),
    }
  );
  
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: backgroundColor,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background pulse effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at center, ${primaryColor}${Math.floor(bgPulse * 255).toString(16).padStart(2, '0')} 0%, transparent 50%)`,
        }}
      />
      
      {/* Particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: particle.x - 8,
            top: particle.y - 8,
            width: 16,
            height: 16,
            backgroundColor: particle.color,
            borderRadius: '50%',
            opacity: particle.opacity,
            transform: `scale(${particle.scale}) rotate(${particle.rotation}deg)`,
            boxShadow: `0 0 20px ${particle.color}80`,
          }}
        />
      ))}
      
      {/* Center text */}
      <div
        style={{
          position: 'absolute',
          fontSize: 72,
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          transform: `scale(${textScale})`,
          opacity: textOpacity,
          textShadow: `0 0 20px ${primaryColor}, 0 0 40px ${secondaryColor}`,
          letterSpacing: '4px',
        }}
      >
        {centerText}
      </div>
      
      {/* Additional sparkle effects */}
      {Array.from({ length: 8 }).map((_, i) => {
        const sparkleDelay = i * 10;
        const sparkleOpacity = interpolate(
          adjustedFrame,
          [burstStart + sparkleDelay, burstPeak + sparkleDelay, fadeStart + sparkleDelay],
          [0, 1, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );
        
        const sparkleX = centerX + (Math.random() - 0.5) * 400;
        const sparkleY = centerY + (Math.random() - 0.5) * 400;
        
        return (
          <div
            key={`sparkle-${i}`}
            style={{
              position: 'absolute',
              left: sparkleX,
              top: sparkleY,
              width: 4,
              height: 4,
              backgroundColor: 'white',
              borderRadius: '50%',
              opacity: sparkleOpacity,
              boxShadow: '0 0 10px white',
            }}
          />
        );
      })}
    </div>
  );
};