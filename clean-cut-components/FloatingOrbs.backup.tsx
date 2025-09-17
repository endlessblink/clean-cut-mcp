import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

const FloatingOrbs: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Create multiple orbs with different properties
  const orbs = [
    { size: 80, color: '#FF6B6B', delay: 0, speed: 1 },
    { size: 60, color: '#4ECDC4', delay: 30, speed: 0.8 },
    { size: 100, color: '#45B7D1', delay: 60, speed: 1.2 },
    { size: 70, color: '#96CEB4', delay: 90, speed: 0.9 },
    { size: 90, color: '#FECA57', delay: 120, speed: 1.1 }
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e' }}>
      {orbs.map((orb, index) => {
        const adjustedFrame = Math.max(0, frame - orb.delay);
        
        // Floating animation
        const y = interpolate(
          adjustedFrame,
          [0, 90, 180],
          [600, 200, 100],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.4, 0.0, 0.2, 1)
          }
        );
        
        // Horizontal drift
        const x = interpolate(
          adjustedFrame * orb.speed,
          [0, 180],
          [Math.random() * 200 + 100, Math.random() * 200 + 500],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.inOut(Easing.sin)
          }
        );
        
        // Scale pulsing effect
        const scale = interpolate(
          (adjustedFrame * 2) % 60,
          [0, 30, 60],
          [1, 1.2, 1],
          {
            easing: Easing.inOut(Easing.sin)
          }
        );
        
        // Opacity fade in
        const opacity = interpolate(
          adjustedFrame,
          [0, 30],
          [0, 0.8],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          }
        );
        
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: orb.size,
              height: orb.size,
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${orb.color}ff, ${orb.color}aa, ${orb.color}44)`,
              transform: `scale(${scale})`,
              opacity: opacity,
              boxShadow: `0 0 ${orb.size / 2}px ${orb.color}66`,
              filter: 'blur(0.5px)'
            }}
          />
        );
      })}
      
      {/* Ambient particles */}
      {Array.from({ length: 20 }).map((_, i) => {
        const particleFrame = (frame + i * 10) % 180;
        const particleX = interpolate(
          particleFrame,
          [0, 180],
          [Math.random() * 1920, Math.random() * 1920],
          { easing: Easing.linear }
        );
        const particleY = interpolate(
          particleFrame,
          [0, 180],
          [Math.random() * 1080, Math.random() * 1080],
          { easing: Easing.linear }
        );
        
        return (
          <div
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              left: particleX,
              top: particleY,
              width: 2,
              height: 2,
              borderRadius: '50%',
              backgroundColor: '#ffffff44',
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export { FloatingOrbs };