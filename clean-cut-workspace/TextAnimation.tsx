import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

const TextAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Animation timings
  const titleStart = 0;
  const titleDuration = fps * 2;
  const subtitleStart = fps * 1.5;
  const subtitleDuration = fps * 2;
  const fadeOutStart = durationInFrames - fps * 1;

  // Title animations
  const titleOpacity = interpolate(
    frame,
    [titleStart, titleStart + 20, titleStart + titleDuration - 20, titleStart + titleDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const titleScale = interpolate(
    frame,
    [titleStart, titleStart + 30],
    [0.5, 1],
    { 
      extrapolateLeft: 'clamp', 
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.back(1.7))
    }
  );

  const titleY = interpolate(
    frame,
    [titleStart, titleStart + 40],
    [50, 0],
    { 
      extrapolateLeft: 'clamp', 
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.quad)
    }
  );

  // Subtitle animations
  const subtitleOpacity = interpolate(
    frame,
    [subtitleStart, subtitleStart + 20, subtitleStart + subtitleDuration - 20, subtitleStart + subtitleDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const subtitleX = interpolate(
    frame,
    [subtitleStart, subtitleStart + 30],
    [-100, 0],
    { 
      extrapolateLeft: 'clamp', 
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.quad)
    }
  );

  // Character animation for "Hello World!"
  const helloStart = fps * 3.5;
  const chars = "Hello World!".split('');
  
  // Global fade out
  const globalOpacity = interpolate(
    frame,
    [fadeOutStart, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        opacity: globalOpacity,
      }}
    >
      {/* Animated background elements */}
      <div
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          top: '20%',
          left: '10%',
          transform: `rotate(${frame * 0.5}deg)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          bottom: '20%',
          right: '15%',
          transform: `rotate(${-frame * 0.3}deg)`,
        }}
      />

      <div style={{ textAlign: 'center' }}>
        {/* Main Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px',
            opacity: titleOpacity,
            transform: `scale(${titleScale}) translateY(${titleY}px)`,
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          Welcome
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px',
            opacity: subtitleOpacity,
            transform: `translateX(${subtitleX}px)`,
          }}
        >
          to the world of animation
        </div>

        {/* Character-by-character animation */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#FFD700',
            letterSpacing: '2px',
          }}
        >
          {chars.map((char, index) => {
            const charStart = helloStart + index * 3;
            const charOpacity = interpolate(
              frame,
              [charStart, charStart + 10],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            
            const charY = interpolate(
              frame,
              [charStart, charStart + 15],
              [30, 0],
              { 
                extrapolateLeft: 'clamp', 
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.bounce)
              }
            );

            const charScale = interpolate(
              frame,
              [charStart, charStart + 8, charStart + 16],
              [0.5, 1.2, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            return (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  opacity: charOpacity,
                  transform: `translateY(${charY}px) scale(${charScale})`,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export { TextAnimation };