import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';

export const BouncingBall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Simple bouncing motion using Math.sin for reliable animation
  const bounceY = Math.abs(Math.sin((frame / fps) * 3) * 100);

  const moveX = interpolate(frame, [0, durationInFrames], [200, 800], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  // Fade in effect
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  // Color cycling
  const hue = interpolate(frame, [0, durationInFrames], [0, 360], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated ball */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${hue + 60}, 80%, 70%))`,
          boxShadow: `0 10px 30px rgba(0, 0, 0, 0.3), 0 0 20px hsla(${hue}, 70%, 60%, 0.4)`,
          position: 'absolute',
          transform: `translateX(${moveX}px) translateY(${300 + bounceY}px)`,
          opacity,
          transition: 'none',
        }}
      />

      {/* Ground shadow */}
      <div
        style={{
          width: 60,
          height: 20,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.3), transparent)',
          position: 'absolute',
          transform: `translateX(${moveX}px) translateY(360px) scaleX(${1 - Math.abs(bounceY) / 200})`,
          opacity: opacity * 0.6,
          filter: 'blur(2px)',
        }}
      />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 48,
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          opacity,
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        Bouncing Ball Test
      </div>
    </AbsoluteFill>
  );
};