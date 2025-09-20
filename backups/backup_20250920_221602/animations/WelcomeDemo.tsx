import React from 'react';
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

interface WelcomeDemoProps {
  title?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  animationSpeed?: number;
}

export const WelcomeDemo: React.FC<WelcomeDemoProps> = ({
  title = 'Welcome to Remotion',
  accentColor = '#ff6b6b',
  backgroundColor = '#1a1a2e',
  textColor = '#ffffff',
  animationSpeed = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Adjust timing based on animation speed
  const adjustedFrame = frame * animationSpeed;

  // Background circles animation
  const circle1Scale = spring({
    frame: adjustedFrame,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5,
    },
  });

  const circle2Scale = spring({
    frame: adjustedFrame - 20,
    fps,
    config: {
      damping: 80,
      stiffness: 150,
      mass: 0.8,
    },
  });

  const circle3Scale = spring({
    frame: adjustedFrame - 40,
    fps,
    config: {
      damping: 60,
      stiffness: 100,
      mass: 1,
    },
  });

  // Text animations
  const titleOpacity = interpolate(
    adjustedFrame,
    [30, 60],
    [0, 1],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const titleY = interpolate(
    adjustedFrame,
    [30, 60],
    [50, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Subtitle animation
  const subtitleOpacity = interpolate(
    adjustedFrame,
    [60, 90],
    [0, 1],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const subtitleY = interpolate(
    adjustedFrame,
    [60, 90],
    [30, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Floating animation for circles
  const floatOffset = Math.sin((adjustedFrame / fps) * 2) * 10;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}cc 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, Arial, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Background animated circles */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          backgroundColor: `${accentColor}20`,
          transform: `scale(${circle1Scale}) translateY(${floatOffset}px)`,
        }}
      />
      
      <div
        style={{
          position: 'absolute',
          top: '60%',
          right: '20%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          backgroundColor: `${accentColor}15`,
          transform: `scale(${circle2Scale}) translateY(${-floatOffset}px)`,
        }}
      />
      
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '70%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: `${accentColor}25`,
          transform: `scale(${circle3Scale}) translateY(${floatOffset * 0.5}px)`,
        }}
      />

      {/* Main content */}
      <div
        style={{
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        {/* Main title */}
        <h1
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: textColor,
            margin: 0,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textShadow: `0 4px 20px ${accentColor}40`,
            letterSpacing: '-2px',
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 32,
            color: `${textColor}80`,
            margin: '20px 0 0 0',
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            fontWeight: 300,
            letterSpacing: '1px',
          }}
        >
          Beautiful animations made simple
        </p>

        {/* Accent line */}
        <div
          style={{
            width: interpolate(adjustedFrame, [90, 120], [0, 200], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            height: 4,
            backgroundColor: accentColor,
            margin: '30px auto',
            borderRadius: 2,
            boxShadow: `0 0 20px ${accentColor}60`,
          }}
        />
      </div>

      {/* Particles effect */}
      {[...Array(5)].map((_, i) => {
        const particleDelay = i * 15;
        const particleOpacity = interpolate(
          adjustedFrame - particleDelay,
          [0, 30, 120, 150],
          [0, 1, 1, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );

        const particleY = interpolate(
          adjustedFrame - particleDelay,
          [0, 150],
          [600, -100],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${20 + i * 15}%`,
              top: particleY,
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: accentColor,
              opacity: particleOpacity,
              boxShadow: `0 0 10px ${accentColor}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};