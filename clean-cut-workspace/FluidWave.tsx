import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface FluidWaveProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  waveIntensity?: number;
  flowSpeed?: number;
  viscosity?: number;
  temperature?: number;
  title?: string;
  showRipples?: boolean;
  backgroundMode?: 'dark' | 'light' | 'gradient';
}

export const FluidWave: React.FC<FluidWaveProps> = ({
  primaryColor = '#ff3366',
  secondaryColor = '#33ff66', 
  accentColor = '#3366ff',
  waveIntensity = 1,
  flowSpeed = 1,
  viscosity = 0.8,
  temperature = 50,
  title = 'LIQUID MOTION',
  showRipples = true,
  backgroundMode = 'dark'
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  const progress = frame / durationInFrames;
  const animatedFrame = frame * flowSpeed;

  // Background styles based on mode
  const backgrounds = {
    dark: '#0d1117',
    light: '#f6f8fa',
    gradient: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20, ${accentColor}20)`
  };

  // Generate fluid blob path using bezier curves
  const createFluidPath = (centerX: number, centerY: number, size: number, phase: number) => {
    const points = 8;
    const baseRadius = size;
    let path = '';
    
    const coords: Array<{x: number, y: number}> = [];
    
    for (let i = 0; i <= points; i++) {
      const angle = (i * 2 * Math.PI / points);
      const noise1 = Math.sin(angle * 3 + phase) * 20;
      const noise2 = Math.cos(angle * 2 + phase * 0.7) * 30;
      const noise3 = Math.sin(angle * 4 + phase * 1.3) * 15;
      
      const radius = baseRadius + (noise1 + noise2 + noise3) * waveIntensity;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      coords.push({ x, y });
    }
    
    // Create smooth bezier path
    path = `M ${coords[0].x} ${coords[0].y}`;
    
    for (let i = 0; i < points; i++) {
      const current = coords[i];
      const next = coords[(i + 1) % points];
      const cp1x = current.x + (next.x - current.x) * 0.3;
      const cp1y = current.y + (next.y - current.y) * 0.3;
      const cp2x = next.x - (next.x - current.x) * 0.3;
      const cp2y = next.y - (next.y - current.y) * 0.3;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    path += ' Z';
    
    return path;
  };

  // Main fluid phases
  const phase1 = animatedFrame * 0.03;
  const phase2 = animatedFrame * 0.025;
  const phase3 = animatedFrame * 0.04;

  // Dynamic positioning
  const centerX = 960 + Math.sin(phase1) * 100;
  const centerY = 540 + Math.cos(phase1 * 0.7) * 80;

  // Size pulsing based on temperature
  const tempMultiplier = interpolate(temperature, [0, 100], [0.5, 1.5]);
  const mainSize = 200 * tempMultiplier * (1 + Math.sin(phase1) * 0.3);

  // Color temperature mapping
  const tempColor = interpolate(temperature, [0, 50, 100], [accentColor, primaryColor, secondaryColor]);

  // Ripple effects
  const ripples = showRipples ? Array.from({ length: 6 }, (_, i) => ({
    phase: (animatedFrame + i * 40) * 0.02,
    delay: i * 0.5,
    size: interpolate((animatedFrame + i * 30) % 180, [0, 90, 180], [0, 300, 600])
  })) : [];

  // Particle system for bubbles
  const bubbles = Array.from({ length: 12 }, (_, i) => {
    const bubblePhase = (animatedFrame + i * 25) * 0.02;
    const floatHeight = interpolate(bubblePhase % (Math.PI * 2), [0, Math.PI * 2], [-200, -800]);
    const sway = Math.sin(bubblePhase * 2) * 50;
    
    return {
      x: 200 + (i * 140) + sway,
      y: 600 + floatHeight,
      size: interpolate(i % 4, [0, 3], [8, 24]),
      opacity: interpolate(Math.abs(floatHeight), [200, 800], [0.8, 0.1])
    };
  });

  // Title wave effect
  const titleWave = interpolate(Math.sin(animatedFrame * 0.05), [-1, 1], [-20, 20]);
  const titleOpacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ background: backgrounds[backgroundMode] }}>
      
      {/* Subtle animated background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at ${centerX * 0.5}px ${centerY * 0.5}px, 
          ${primaryColor}08 0%, 
          transparent 60%)`,
        transform: `scale(${1 + Math.sin(phase1) * 0.1})`,
      }} />

      {/* Ripple effects */}
      {showRipples && (
        <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 1920 1080">
          {ripples.map((ripple, i) => (
            <circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={ripple.size}
              fill="none"
              stroke={i % 2 === 0 ? primaryColor : secondaryColor}
              strokeWidth="2"
              opacity={interpolate(ripple.size, [0, 200, 600], [0, 0.6, 0])}
              strokeDasharray="5,10"
            />
          ))}
        </svg>
      )}

      {/* Main fluid shape */}
      <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 1920 1080">
        <defs>
          <radialGradient id="fluidGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor={tempColor} stopOpacity="0.9" />
            <stop offset="40%" stopColor={primaryColor} stopOpacity="0.7" />
            <stop offset="70%" stopColor={secondaryColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.3" />
          </radialGradient>
          
          <filter id="fluidGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="viscosity" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={`${(1 - viscosity) * 10}`} result="blur"/>
            <feColorMatrix in="blur" mode="saturate" values="1.5"/>
          </filter>
        </defs>

        {/* Secondary fluid layer */}
        <path
          d={createFluidPath(centerX + 50, centerY - 30, mainSize * 0.7, phase2)}
          fill={secondaryColor}
          opacity="0.4"
          filter="url(#viscosity)"
          transform={`rotate(${animatedFrame * 0.2} ${centerX} ${centerY})`}
        />

        {/* Main fluid blob */}
        <path
          d={createFluidPath(centerX, centerY, mainSize, phase1)}
          fill="url(#fluidGradient)"
          filter="url(#fluidGlow)"
          style={{ mixBlendMode: 'screen' }}
        />

        {/* Tertiary small blob */}
        <path
          d={createFluidPath(centerX - 40, centerY + 40, mainSize * 0.4, phase3)}
          fill={accentColor}
          opacity="0.6"
          filter="url(#viscosity)"
          transform={`rotate(${-animatedFrame * 0.3} ${centerX} ${centerY})`}
        />
      </svg>

      {/* Floating bubbles */}
      {bubbles.map((bubble, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: bubble.x - bubble.size / 2,
            top: bubble.y - bubble.size / 2,
            width: bubble.size,
            height: bubble.size,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, 
              rgba(255,255,255,0.8), 
              ${i % 3 === 0 ? primaryColor : i % 3 === 1 ? secondaryColor : accentColor}60)`,
            opacity: bubble.opacity,
            filter: 'blur(0.5px)',
            border: `1px solid ${primaryColor}40`,
          }}
        />
      ))}

      {/* Animated title */}
      <div style={{
        position: 'absolute',
        bottom: 150,
        left: '50%',
        transform: `translateX(-50%) translateY(${titleWave}px)`,
        opacity: titleOpacity,
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: '800',
          fontFamily: 'system-ui, sans-serif',
          background: `linear-gradient(45deg, 
            ${primaryColor}, 
            ${tempColor}, 
            ${secondaryColor})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          {title}
        </h1>
      </div>

      {/* Surface tension lines */}
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} viewBox="0 0 1920 1080">
        {Array.from({ length: 4 }, (_, i) => (
          <path
            key={i}
            d={`M ${200 + i * 400} ${400 + Math.sin(phase1 + i) * 100} 
                Q ${600 + i * 400} ${300 + Math.cos(phase1 + i) * 80} 
                  ${800 + i * 400} ${500 + Math.sin(phase1 + i + 1) * 120}`}
            fill="none"
            stroke={i % 2 === 0 ? primaryColor : secondaryColor}
            strokeWidth="1"
            opacity="0.3"
            strokeDasharray="3,6"
          />
        ))}
      </svg>

    </AbsoluteFill>
  );
};