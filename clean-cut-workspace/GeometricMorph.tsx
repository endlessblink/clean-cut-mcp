import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface GeometricMorphProps {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  morphSpeed?: number;
  shapeComplexity?: number;
  rotationSpeed?: number;
  title?: string;
  showParticles?: boolean;
  particleCount?: number;
}

export const GeometricMorph: React.FC<GeometricMorphProps> = ({
  primaryColor = '#00d4ff',
  secondaryColor = '#ff006b',
  backgroundColor = '#0a0a0a',
  morphSpeed = 1,
  shapeComplexity = 6,
  rotationSpeed = 0.5,
  title = 'GEOMETRIC FLUX',
  showParticles = true,
  particleCount = 20
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  const progress = frame / durationInFrames;
  const animatedFrame = frame * morphSpeed;

  // Create dynamic polygon points
  const createPolygon = (sides: number, size: number, offset: number) => {
    const points: string[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI / sides) + offset;
      const dynamicSize = size + Math.sin(animatedFrame * 0.05 + i) * 30;
      const x = 960 + Math.cos(angle) * dynamicSize;
      const y = 540 + Math.sin(angle) * dynamicSize;
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  // Morphing between different shapes
  const morphPhase = (animatedFrame * 0.01) % 4;
  let currentSides = shapeComplexity;
  if (morphPhase > 1 && morphPhase <= 2) currentSides = Math.max(3, shapeComplexity - 2);
  else if (morphPhase > 2 && morphPhase <= 3) currentSides = shapeComplexity + 2;

  // Rotation and scaling
  const rotation = animatedFrame * rotationSpeed;
  const mainScale = interpolate(Math.sin(animatedFrame * 0.03), [-1, 1], [0.7, 1.3]);
  
  // Color transitions
  const colorMix = interpolate(Math.sin(animatedFrame * 0.04), [-1, 1], [0, 1]);
  const currentPrimary = interpolateColor(primaryColor, secondaryColor, colorMix);

  // Generate particles
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i * 2 * Math.PI / particleCount) + (animatedFrame * 0.02);
    const distance = 300 + Math.sin(animatedFrame * 0.03 + i) * 100;
    const size = interpolate(i % 4, [0, 3], [2, 8]);
    
    return {
      x: 960 + Math.cos(angle) * distance,
      y: 540 + Math.sin(angle) * distance,
      size,
      opacity: interpolate(Math.sin(animatedFrame * 0.05 + i * 0.5), [-1, 1], [0.3, 1])
    };
  });

  // Title animation
  const titleY = interpolate(progress, [0, 0.3, 0.7, 1], [100, 0, 0, -100]);
  const titleOpacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      
      {/* Background grid effect */}
      <svg 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          opacity: 0.1,
          transform: `rotate(${rotation * 0.1}deg)`
        }}
        viewBox="0 0 1920 1080"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={primaryColor} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Main morphing shapes */}
      <svg 
        style={{ position: 'absolute', inset: 0 }}
        viewBox="0 0 1920 1080"
      >
        <defs>
          <linearGradient id="shapeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
            <stop offset="50%" stopColor={currentPrimary} stopOpacity="0.6" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer morphing shape */}
        <polygon
          points={createPolygon(currentSides, 200, rotation * Math.PI / 180)}
          fill="none"
          stroke={primaryColor}
          strokeWidth="3"
          transform={`scale(${mainScale})`}
          style={{
            filter: 'url(#glow)',
            transformOrigin: '960px 540px'
          }}
        />

        {/* Inner morphing shape */}
        <polygon
          points={createPolygon(Math.max(3, currentSides - 1), 120, -rotation * Math.PI / 180)}
          fill="url(#shapeGradient)"
          transform={`scale(${mainScale * 0.7})`}
          style={{
            transformOrigin: '960px 540px',
            mixBlendMode: 'screen'
          }}
        />

        {/* Center core */}
        <circle
          cx="960"
          cy="540"
          r={30 + Math.sin(animatedFrame * 0.08) * 15}
          fill={secondaryColor}
          transform={`scale(${mainScale})`}
          style={{
            filter: 'url(#glow)',
            transformOrigin: '960px 540px'
          }}
        />
      </svg>

      {/* Floating particles */}
      {showParticles && particles.map((particle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: particle.x - particle.size / 2,
            top: particle.y - particle.size / 2,
            width: particle.size,
            height: particle.size,
            backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
            borderRadius: '50%',
            opacity: particle.opacity,
            filter: 'blur(0.5px)',
            boxShadow: `0 0 ${particle.size * 2}px currentColor`,
          }}
        />
      ))}

      {/* Animated title */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, calc(-50% + ${titleY}px))`,
        opacity: titleOpacity,
        textAlign: 'center',
        zIndex: 10,
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '900',
          fontFamily: 'system-ui, sans-serif',
          background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})`,
          backgroundSize: '200% 100%',
          backgroundPosition: `${interpolate(animatedFrame, [0, fps * 2], [0, 200])}% 0`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          {title}
        </h1>
      </div>

      {/* Energy waves */}
      <svg 
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        viewBox="0 0 1920 1080"
      >
        {[1, 2, 3].map((wave, i) => (
          <circle
            key={i}
            cx="960"
            cy="540"
            r={interpolate((animatedFrame + i * 30) % 120, [0, 120], [0, 600])}
            fill="none"
            stroke={i % 2 === 0 ? primaryColor : secondaryColor}
            strokeWidth="2"
            opacity={interpolate((animatedFrame + i * 30) % 120, [0, 60, 120], [0.8, 0.2, 0])}
          />
        ))}
      </svg>

    </AbsoluteFill>
  );
};

// Helper function to interpolate colors
function interpolateColor(color1: string, color2: string, factor: number): string {
  // Simple color interpolation - in a real implementation you'd want more sophisticated color mixing
  return factor < 0.5 ? color1 : color2;
}