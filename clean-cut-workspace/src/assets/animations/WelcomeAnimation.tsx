import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

interface WelcomeAnimationProps {
  title?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  animationSpeed?: number;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({
  title = "Welcome to Remotion",
  accentColor = "#3B82F6",
  backgroundColor = "#1F2937",
  textColor = "#FFFFFF",
  animationSpeed = 1
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Adjust timing based on animation speed
  const adjustedFrame = frame * animationSpeed;
  
  // Title animation - slides in from left
  const titleTranslateX = interpolate(
    adjustedFrame,
    [0, fps * 1.5],
    [-300, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateRight: 'clamp'
    }
  );
  
  // Title opacity fade in
  const titleOpacity = interpolate(
    adjustedFrame,
    [0, fps * 0.8],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Circles animation - scale and rotate
  const circleScale = interpolate(
    adjustedFrame,
    [fps * 0.5, fps * 2.5],
    [0, 1],
    {
      easing: Easing.out(Easing.back(1.5)),
      extrapolateRight: 'clamp'
    }
  );
  
  const circleRotation = interpolate(
    adjustedFrame,
    [fps * 1, durationInFrames],
    [0, 360],
    { extrapolateRight: 'clamp' }
  );
  
  // Subtitle animation - slides up from bottom
  const subtitleTranslateY = interpolate(
    adjustedFrame,
    [fps * 2, fps * 3.5],
    [100, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateRight: 'clamp'
    }
  );
  
  const subtitleOpacity = interpolate(
    adjustedFrame,
    [fps * 2, fps * 2.8],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Inter, Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background animated circles */}
      <div
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: `3px solid ${accentColor}40`,
          transform: `scale(${circleScale}) rotate(${circleRotation}deg)`,
          top: '20%',
          right: '15%'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          border: `2px solid ${accentColor}30`,
          transform: `scale(${circleScale * 0.8}) rotate(${-circleRotation * 0.7}deg)`,
          bottom: '25%',
          left: '10%'
        }}
      />
      
      {/* Main title */}
      <h1
        style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          color: textColor,
          margin: 0,
          textAlign: 'center',
          transform: `translateX(${titleTranslateX}px)`,
          opacity: titleOpacity,
          textShadow: `0 4px 20px ${accentColor}40`
        }}
      >
        {title}
      </h1>
      
      {/* Animated accent line */}
      <div
        style={{
          width: interpolate(
            adjustedFrame,
            [fps * 1.2, fps * 2.5],
            [0, 300],
            {
              easing: Easing.out(Easing.cubic),
              extrapolateRight: 'clamp'
            }
          ),
          height: '4px',
          backgroundColor: accentColor,
          marginTop: '2rem',
          borderRadius: '2px',
          boxShadow: `0 0 20px ${accentColor}60`
        }}
      />
      
      {/* Subtitle */}
      <p
        style={{
          fontSize: '1.5rem',
          color: `${textColor}CC`,
          marginTop: '2rem',
          textAlign: 'center',
          transform: `translateY(${subtitleTranslateY}px)`,
          opacity: subtitleOpacity,
          maxWidth: '600px',
          lineHeight: 1.6
        }}
      >
        Beautiful animations made simple with React and TypeScript
      </p>
      
      {/* Floating particles */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            backgroundColor: accentColor,
            borderRadius: '50%',
            opacity: interpolate(
              adjustedFrame,
              [fps * (2 + i * 0.2), fps * (3 + i * 0.2)],
              [0, 0.8],
              { extrapolateRight: 'clamp' }
            ),
            transform: `translate(${
              interpolate(
                adjustedFrame,
                [fps * 2, durationInFrames],
                [Math.random() * 100 - 50, Math.random() * 200 - 100],
                { extrapolateRight: 'clamp' }
              )
            }px, ${
              interpolate(
                adjustedFrame,
                [fps * 2, durationInFrames],
                [0, -200 - Math.random() * 100],
                { extrapolateRight: 'clamp' }
              )
            }px)`,
            left: `${20 + i * 15}%`,
            top: '60%'
          }}
        />
      ))}
    </div>
  );
};

