import React from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  interpolate, 
  Easing 
} from 'remotion';

interface FloatingParticlesProps {
  particleCount?: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  animationSpeed?: number;
  pulseIntensity?: number;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  particleCount = 12,
  primaryColor = '#FF6B6B',
  secondaryColor = '#4ECDC4', 
  accentColor = '#45B7D1',
  backgroundColor = '#1a1a2e',
  animationSpeed = 1,
  pulseIntensity = 0.3
}) => {
  const frame = useCurrentFrame();
  
  // Create particles with unique properties
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const baseDelay = i * 8;
    const uniqueSeed = i * 137.508; // Golden angle for natural distribution
    
    // Floating motion - smooth sine waves
    const floatX = interpolate(
      frame,
      [0, 180],
      [0, Math.sin(uniqueSeed) * 200],
      {
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'extend'
      }
    );
    
    const floatY = interpolate(
      frame + baseDelay,
      [0, 150],
      [0, Math.cos(uniqueSeed * 1.3) * 150],
      {
        easing: Easing.bezier(0.42, 0, 0.58, 1),
        extrapolateLeft: 'clamp', 
        extrapolateRight: 'extend'
      }
    );
    
    // Pulsing scale animation
    const pulseScale = interpolate(
      (frame * animationSpeed + baseDelay) % 120,
      [0, 60, 120],
      [1, 1 + pulseIntensity, 1],
      {
        easing: Easing.bezier(0, 0, 0.58, 1)
      }
    );
    
    // Fade in animation
    const fadeIn = interpolate(
      frame - baseDelay,
      [0, 30],
      [0, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      }
    );
    
    // Color rotation between the three colors
    const colorPhase = ((frame * animationSpeed + baseDelay) / 40) % 3;
    let currentColor = primaryColor;
    if (colorPhase < 1) {
      currentColor = primaryColor;
    } else if (colorPhase < 2) {
      currentColor = secondaryColor;
    } else {
      currentColor = accentColor;
    }
    
    // Base position - distributed in a pleasing pattern
    const baseX = 400 + Math.sin(uniqueSeed) * 300;
    const baseY = 300 + Math.cos(uniqueSeed * 1.7) * 200;
    
    return {
      id: i,
      x: baseX + floatX,
      y: baseY + floatY,
      scale: pulseScale,
      opacity: fadeIn,
      color: currentColor,
      size: 20 + (i % 3) * 10 // Varying sizes
    };
  });

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Background gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${backgroundColor}00 0%, ${backgroundColor}80 100%)`,
        }}
      />
      
      {/* Render particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%',
            transform: `translate(-50%, -50%) scale(${particle.scale})`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size}px ${particle.color}40`,
            filter: 'blur(0.5px)',
          }}
        />
      ))}
      
      {/* Title overlay */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 48,
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          opacity: interpolate(
            frame,
            [60, 90],
            [0, 0.8],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp'
            }
          ),
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        Floating Dreams
      </div>
    </AbsoluteFill>
  );
};