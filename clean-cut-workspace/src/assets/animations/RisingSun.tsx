import React from 'react';
import { useCurrentFrame, interpolate, Easing, AbsoluteFill } from 'remotion';

interface RisingSunProps {
  sunColor?: string;
  skyGradientStart?: string;
  skyGradientEnd?: string;
  cloudColor?: string;
  animationSpeed?: number;
  title?: string;
}

export const RisingSun: React.FC<RisingSunProps> = ({
  sunColor = '#FFD700',
  skyGradientStart = '#87CEEB',
  skyGradientEnd = '#FFA500',
  cloudColor = '#FFFFFF',
  animationSpeed = 1,
  title = 'Good Morning!'
}) => {
  const frame = useCurrentFrame();
  const fps = 30;
  
  // Adjust timing based on animation speed
  const adjustedFrame = frame * animationSpeed;
  
  // Sun rising animation - starts from bottom and moves up
  const sunY = interpolate(
    adjustedFrame,
    [0, fps * 3],
    [600, 200],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0, 0, 0.58, 1)
    }
  );
  
  // Sun glow intensity
  const glowOpacity = interpolate(
    adjustedFrame,
    [0, fps * 2, fps * 4],
    [0, 0.8, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );
  
  // Cloud movement
  const cloud1X = interpolate(
    adjustedFrame,
    [0, fps * 6],
    [-200, 1200],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );
  
  const cloud2X = interpolate(
    adjustedFrame,
    [fps * 1, fps * 6],
    [-150, 1200],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );
  
  // Title fade in
  const titleOpacity = interpolate(
    adjustedFrame,
    [fps * 3, fps * 4.5],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );
  
  // Title scale animation
  const titleScale = interpolate(
    adjustedFrame,
    [fps * 3, fps * 4],
    [0.8, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    }
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${skyGradientStart} 0%, ${skyGradientEnd} 100%)`,
        overflow: 'hidden'
      }}
    >
      {/* Sun with glow effect */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: sunY,
          transform: 'translateX(-50%)',
          width: 120,
          height: 120,
          borderRadius: '50%',
          backgroundColor: sunColor,
          boxShadow: `0 0 ${60 * glowOpacity}px ${sunColor}`,
          opacity: glowOpacity
        }}
      />
      
      {/* Sun rays */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45) * (Math.PI / 180);
        const rayLength = 80;
        const rayX = Math.cos(angle) * rayLength;
        const rayY = Math.sin(angle) * rayLength;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: sunY + 60,
              width: 4,
              height: 40,
              backgroundColor: sunColor,
              transform: `translate(-50%, -50%) translate(${rayX}px, ${rayY}px) rotate(${i * 45}deg)`,
              opacity: glowOpacity * 0.7,
              borderRadius: '2px'
            }}
          />
        );
      })}
      
      {/* Clouds */}
      <div
        style={{
          position: 'absolute',
          left: cloud1X,
          top: 100,
          width: 120,
          height: 60,
          backgroundColor: cloudColor,
          borderRadius: '30px',
          opacity: 0.8
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: cloud1X + 40,
          top: 80,
          width: 80,
          height: 40,
          backgroundColor: cloudColor,
          borderRadius: '20px',
          opacity: 0.8
        }}
      />
      
      <div
        style={{
          position: 'absolute',
          left: cloud2X,
          top: 150,
          width: 100,
          height: 50,
          backgroundColor: cloudColor,
          borderRadius: '25px',
          opacity: 0.6
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: cloud2X + 30,
          top: 130,
          width: 70,
          height: 35,
          backgroundColor: cloudColor,
          borderRadius: '17px',
          opacity: 0.6
        }}
      />
      
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: '70%',
          left: '50%',
          transform: `translateX(-50%) scale(${titleScale})`,
          opacity: titleOpacity,
          textAlign: 'center'
        }}
      >
        <h1
          style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            margin: 0,
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {title}
        </h1>
      </div>
    </AbsoluteFill>
  );
};