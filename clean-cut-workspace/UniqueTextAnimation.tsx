import React from 'react';


  // Safe interpolation helper - prevents inputRange monotonic errors
  const safeInterpolate = (frame, inputRange, outputRange, easing) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return safeInterpolate(frame, inputRange, outputRange, { easing });
  };
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
} from 'remotion';

const UniqueTextAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Main text content
  const mainText = "UNIQUE";
  const subText = "TEXT ANIMATION";
  
  // Split text into individual characters for animation
  const mainChars = mainText.split('');
  const subChars = subText.split('');

  // Background gradient animation
  const gradientRotation = safeInterpolate(
    frame,
    [0, durationInFrames],
    [0, 360],
    { extrapolateRight: 'clamp' }
  );

  // Particle system for background
  const particles = Array.from({ length: 20 }, (_, i) => {
    const delay = i * 5;
    const x = safeInterpolate(
      frame,
      [delay, delay + 60],
      [Math.random() * 100, Math.random() * 100],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const y = safeInterpolate(
      frame,
      [delay, delay + 120],
      [Math.random() * 100, Math.random() * 100],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const opacity = safeInterpolate(
      frame,
      [delay, delay + 30, delay + 90, delay + 120],
      [0, 1, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    return { x, y, opacity, delay };
  });

  return (
    <AbsoluteFill
      style={{
        background: `conic-gradient(from ${gradientRotation}deg, #667eea 0deg, #764ba2 120deg, #f093fb 240deg, #f5576c 360deg)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial Black, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Animated particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            opacity: particle.opacity,
          }}
        />
      ))}

      {/* Main text with character-by-character animation */}
      <div style={{ display: 'flex', marginBottom: '30px' }}>
        {mainChars.map((char, i) => {
          const charDelay = i * 8;
          const scale = spring({
            frame: frame - charDelay,
            fps,
            config: { damping: 12, stiffness: 150 },
          });
          
          const rotation = safeInterpolate(
            frame,
            [charDelay, charDelay + 60],
            [0, 360],
            { easing: Easing.elastic(1), extrapolateRight: 'clamp' }
          );
          
          const colorShift = safeInterpolate(
            frame,
            [charDelay, charDelay + 120],
            [0, 360],
            { extrapolateRight: 'clamp' }
          );

          return (
            <span
              key={i}
              style={{
                fontSize: '120px',
                fontWeight: '900',
                color: `hsl(${colorShift}, 80%, 90%)`,
                textShadow: '4px 4px 8px rgba(0, 0, 0, 0.5)',
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                display: 'inline-block',
                margin: '0 5px',
                WebkitTextStroke: '2px rgba(255, 255, 255, 0.3)',
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Subtitle with wave effect */}
      <div style={{ display: 'flex' }}>
        {subChars.map((char, i) => {
          const waveOffset = i * 15;
          const yOffset = Math.sin((frame + waveOffset) * 0.15) * 20;
          const opacity = safeInterpolate(
            frame,
            [60 + i * 4, 80 + i * 4],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <span
              key={i}
              style={{
                fontSize: char === ' ' ? '40px' : '40px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.95)',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
                transform: `translateY(${yOffset}px)`,
                display: 'inline-block',
                margin: char === ' ' ? '0 15px' : '0 2px',
                opacity,
                letterSpacing: '3px',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </div>

      {/* Pulsing border effect */}
      <div
        style={{
          position: 'absolute',
          width: '90%',
          height: '90%',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
          opacity: safeInterpolate(
            frame,
            [0, 30, 60, 90],
            [0, 1, 0, 1],
            { extrapolateRight: 'clamp' }
          ),
          transform: `scale(${1 + Math.sin(frame * 0.1) * 0.02})`,
        }}
      />
    </AbsoluteFill>
  );
};

export { UniqueTextAnimation };