import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface SimpleTestProps {
  title?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  animationSpeed?: number;
}

const SimpleTest: React.FC<SimpleTestProps> = ({
  title = 'Simple Test',
  primaryColor = '#3b82f6',
  secondaryColor = '#ef4444',
  backgroundColor = '#1f2937',
  animationSpeed = 1
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Title animation - slides in from left
  const titleProgress = spring({
    frame: frame * animationSpeed,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
      mass: 0.5
    }
  });

  const titleX = interpolate(
    titleProgress,
    [0, 1],
    [-200, 0]
  );

  // Circle animation - grows and rotates
  const circleScale = interpolate(
    frame * animationSpeed,
    [0, fps * 1.5, fps * 3],
    [0, 1, 0.8],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const circleRotation = interpolate(
    frame * animationSpeed,
    [0, durationInFrames],
    [0, 360]
  );

  // Rectangle wave animation
  const waveOffset = interpolate(
    frame * animationSpeed,
    [0, durationInFrames],
    [0, Math.PI * 4]
  );

  // Fade in/out for entire composition
  const opacity = interpolate(
    frame * animationSpeed,
    [0, fps * 0.5, durationInFrames - fps * 0.5, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        flex: 1,
        backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        height: '100%',
        opacity
      }}
    >
      {/* Background animated rectangles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 60 + i * 20,
            height: 60 + i * 20,
            backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
            opacity: 0.1 + (i * 0.05),
            transform: `translate(-50%, -50%) rotate(${circleRotation + i * 45}deg) scale(${circleScale})`,
            borderRadius: '8px'
          }}
        />
      ))}

      {/* Main circle */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 150,
          height: 150,
          backgroundColor: primaryColor,
          borderRadius: '50%',
          transform: `translate(-50%, -50%) scale(${circleScale}) rotate(${circleRotation}deg)`,
          boxShadow: `0 0 30px ${primaryColor}66`
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 80,
            height: 80,
            backgroundColor: secondaryColor,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>

      {/* Wave elements */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px'
      }}>
        {[...Array(20)].map((_, i) => {
          const barHeight = 30 + 25 * Math.sin(waveOffset + i * 0.3);
          return (
            <div
              key={i}
              style={{
                width: 8,
                height: barHeight,
                backgroundColor: primaryColor,
                opacity: 0.7,
                borderRadius: '4px',
                transform: `scaleY(${Math.max(0.2, barHeight / 55)})`
              }}
            />
          );
        })}
      </div>

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: `translateX(calc(-50% + ${titleX}px))`,
          fontSize: 48,
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {title}
      </div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => {
        const particleY = interpolate(
          (frame * animationSpeed + i * 20) % (fps * 3),
          [0, fps * 3],
          [height + 20, -20]
        );
        const particleX = width / 2 + 100 * Math.sin((frame * animationSpeed + i * 30) * 0.02);
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: particleX,
              top: particleY,
              width: 6,
              height: 6,
              backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
              borderRadius: '50%',
              opacity: 0.6
            }}
          />
        );
      })}
    </div>
  );
};

export { SimpleTest };