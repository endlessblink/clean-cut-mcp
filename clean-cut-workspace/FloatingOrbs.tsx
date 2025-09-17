import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

const FloatingOrbs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Create multiple orbs with different properties
  const orbs = [
    { size: 120, color: '#FF6B6B', delay: 0, speed: 1 },
    { size: 80, color: '#4ECDC4', delay: 30, speed: 0.8 },
    { size: 100, color: '#45B7D1', delay: 60, speed: 1.2 },
    { size: 60, color: '#96CEB4', delay: 90, speed: 0.9 },
    { size: 140, color: '#FFEAA7', delay: 20, speed: 0.7 }
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#2D3436' }}>
      {orbs.map((orb, index) => {
        const adjustedFrame = Math.max(0, frame - orb.delay);
        
        // Floating animation
        const floatY = interpolate(
          adjustedFrame,
          [0, fps * 2, fps * 4, fps * 6],
          [0, -30, 30, 0],
          {
            extrapolateRight: 'clamp',
            easing: (t) => 0.5 * (1 + Math.sin(2 * Math.PI * t - Math.PI / 2))
          }
        );
        
        // Horizontal drift
        const driftX = interpolate(
          adjustedFrame,
          [0, fps * 3, fps * 6],
          [0, 50 * Math.sin(index), -30 * Math.cos(index)],
          {
            extrapolateRight: 'clamp',
            easing: (t) => t * t * (3 - 2 * t)
          }
        );
        
        // Scale pulsing effect
        const scale = interpolate(
          adjustedFrame,
          [0, fps * 1.5, fps * 3],
          [0, 1.1, 1],
          {
            extrapolateRight: 'clamp',
            easing: (t) => 1 - Math.pow(1 - t, 3)
          }
        );
        
        // Opacity fade in
        const opacity = interpolate(
          adjustedFrame,
          [0, fps * 0.5],
          [0, 0.8],
          {
            extrapolateRight: 'clamp'
          }
        );
        
        // Position based on index
        const baseX = 200 + (index * 250);
        const baseY = 300 + Math.sin(index) * 100;
        
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: baseX + driftX,
              top: baseY + floatY,
              width: orb.size,
              height: orb.size,
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${orb.color}CC, ${orb.color}44)`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
              boxShadow: `0 0 ${orb.size / 2}px ${orb.color}44`,
              filter: 'blur(0.5px)'
            }}
          />
        );
      })}
      
      {/* Ambient particles */}
      {Array.from({ length: 15 }).map((_, i) => {
        const particleFrame = Math.max(0, frame - i * 10);
        const particleY = interpolate(
          particleFrame,
          [0, durationInFrames],
          [Math.random() * 800, Math.random() * 800 - 100],
          { extrapolateRight: 'clamp' }
        );
        
        const particleOpacity = interpolate(
          particleFrame,
          [0, fps, durationInFrames - fps, durationInFrames],
          [0, 0.3, 0.3, 0],
          { extrapolateRight: 'clamp' }
        );
        
        return (
          <div
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              left: Math.random() * 1200,
              top: particleY,
              width: 3,
              height: 3,
              borderRadius: '50%',
              backgroundColor: '#DDD',
              opacity: particleOpacity,
              transform: 'translate(-50%, -50%)'
            }}
          />
        );
      })}
      
      {/* Title text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#FFF',
          fontSize: 48,
          fontWeight: 'bold',
          textAlign: 'center',
          opacity: interpolate(frame, [fps * 2, fps * 3], [0, 1], {
            extrapolateRight: 'clamp'
          }),
          textShadow: '0 0 20px rgba(255,255,255,0.3)'
        }}
      >
        Floating Dreams
      </div>
    </AbsoluteFill>
  );
};

export { FloatingOrbs };