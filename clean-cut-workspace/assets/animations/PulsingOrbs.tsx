import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

interface PulsingOrbsProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  orbCount?: number;
  pulseDuration?: number;
  title?: string;
  showRipples?: boolean;
}

export const PulsingOrbs: React.FC<PulsingOrbsProps> = ({
  primaryColor = '#FF6B6B',
  secondaryColor = '#4ECDC4',
  accentColor = '#45B7D1',
  orbCount = 5,
  pulseDuration = 2,
  title = 'Pulsing Orbs',
  showRipples = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Create multiple orbs with staggered animations
  const orbs = Array.from({ length: orbCount }, (_, index) => {
    const staggerDelay = index * 0.3;
    const progress = (frame - staggerDelay * fps) / (pulseDuration * fps);
    
    const scale = interpolate(
      progress % 1,
      [0, 0.5, 1],
      [0.5, 1.2, 0.5],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      }
    );

    const opacity = interpolate(
      progress % 1,
      [0, 0.3, 0.7, 1],
      [0.3, 1, 1, 0.3],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );

    const rotation = interpolate(
      frame,
      [0, fps * 6],
      [0, 360 + index * 72],
      {
        extrapolateRight: 'clamp',
      }
    );

    // Position orbs in a circle
    const angle = (index / orbCount) * 2 * Math.PI;
    const radius = Math.min(width, height) * 0.25;
    const x = width / 2 + Math.cos(angle) * radius;
    const y = height / 2 + Math.sin(angle) * radius;

    const orbColor = index % 3 === 0 ? primaryColor : index % 3 === 1 ? secondaryColor : accentColor;

    return (
      <div key={index}>
        {/* Main orb */}
        <div
          style={{
            position: 'absolute',
            left: x - 30,
            top: y - 30,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${orbColor}aa, ${orbColor})`,
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            opacity,
            boxShadow: `0 0 20px ${orbColor}66`,
          }}
        />
        
        {/* Ripple effect */}
        {showRipples && (
          <div
            style={{
              position: 'absolute',
              left: x - 40,
              top: y - 40,
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: `2px solid ${orbColor}44`,
              transform: `scale(${scale * 1.5})`,
              opacity: opacity * 0.5,
            }}
          />
        )}
      </div>
    );
  });

  // Title animation
  const titleOpacity = interpolate(
    frame,
    [0, fps * 0.5, fps * 5.5, fps * 6],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const titleScale = interpolate(
    frame,
    [0, fps * 0.5],
    [0.8, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.back(1.7)),
    }
  );

  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background particles */}
      {Array.from({ length: 20 }, (_, i) => {
        const particleProgress = (frame + i * 10) / (fps * 4);
        const particleY = interpolate(
          particleProgress % 1,
          [0, 1],
          [height + 10, -10],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        
        return (
          <div
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              left: (i * 37) % width,
              top: particleY,
              width: 2,
              height: 2,
              borderRadius: '50%',
              backgroundColor: accentColor,
              opacity: 0.3,
            }}
          />
        );
      })}

      {/* Orbs */}
      {orbs}

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.15,
          left: '50%',
          transform: `translateX(-50%) scale(${titleScale})`,
          opacity: titleOpacity,
          color: 'white',
          fontSize: Math.min(width, height) * 0.08,
          fontWeight: 'bold',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        {title}
      </div>
    </div>
  );
};