import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

interface MorphingShapesProps {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  title?: string;
  animationSpeed?: number;
}

export const MorphingShapes: React.FC<MorphingShapesProps> = ({
  primaryColor = '#FF6B6B',
  secondaryColor = '#4ECDC4', 
  backgroundColor = '#1A1A2E',
  title = 'Morphing Shapes',
  animationSpeed = 1
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  const adjustedFrame = frame * animationSpeed;
  
  // Create smooth cycling animation
  const cycle = (adjustedFrame / fps) % 4; // 4 second cycle
  
  // Smooth easing for morphing
  const morphProgress = interpolate(
    cycle,
    [0, 1, 2, 3, 4],
    [0, 1, 0, 1, 0],
    {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    }
  );
  
  // Scale animation
  const scale = interpolate(
    morphProgress,
    [0, 0.5, 1],
    [1, 1.3, 1],
    {
      easing: Easing.bezier(0.42, 0, 0.58, 1)
    }
  );
  
  // Rotation animation
  const rotation = interpolate(
    adjustedFrame,
    [0, fps * 4],
    [0, 360],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'extend'
    }
  );
  
  // Color transition
  const colorMix = interpolate(
    morphProgress,
    [0, 1],
    [0, 1]
  );
  
  // Border radius morphing (circle to square)
  const borderRadius = interpolate(
    morphProgress,
    [0, 1],
    [50, 10],
    {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    }
  );
  
  // Title opacity animation
  const titleOpacity = interpolate(
    adjustedFrame,
    [0, fps * 0.5, fps * 1, durationInFrames - fps * 0.5, durationInFrames],
    [0, 1, 1, 1, 0],
    {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    }
  );
  
  // Title position
  const titleY = interpolate(
    adjustedFrame,
    [0, fps * 0.8],
    [100, 0],
    {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    }
  );

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden'
      }}
    >
      {/* Background particles */}
      {[...Array(6)].map((_, i) => {
        const particleDelay = i * 0.3;
        const particleFrame = Math.max(0, adjustedFrame - particleDelay * fps);
        const particleOpacity = interpolate(
          particleFrame,
          [0, fps * 0.5, fps * 3, fps * 3.5],
          [0, 0.3, 0.3, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        
        const particleY = interpolate(
          particleFrame,
          [0, fps * 4],
          [600, -100],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${15 + i * 15}%`,
              top: particleY,
              width: 20,
              height: 20,
              backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
              borderRadius: '50%',
              opacity: particleOpacity,
            }}
          />
        );
      })}
      
      {/* Main morphing shape */}
      <div
        style={{
          width: 200,
          height: 200,
          background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
          borderRadius: `${borderRadius}%`,
          transform: `scale(${scale}) rotate(${rotation}deg)`,
          boxShadow: `0 0 50px rgba(255, 107, 107, ${0.3 + morphProgress * 0.4})`,
          transition: 'all 0.1s ease-out',
        }}
      />
      
      {/* Secondary shape */}
      <div
        style={{
          position: 'absolute',
          width: 100,
          height: 100,
          background: `linear-gradient(-45deg, ${secondaryColor}, ${primaryColor})`,
          borderRadius: `${100 - borderRadius}%`,
          transform: `scale(${1.2 - scale * 0.2}) rotate(${-rotation * 0.7}deg) translate(150px, -100px)`,
          opacity: 0.7,
          boxShadow: `0 0 30px rgba(78, 205, 196, ${0.2 + (1 - morphProgress) * 0.3})`,
        }}
      />
      
      {/* Title */}
      <h1
        style={{
          position: 'absolute',
          bottom: 150,
          fontSize: 48,
          fontWeight: 'bold',
          color: 'white',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          letterSpacing: '2px',
        }}
      >
        {title}
      </h1>
    </div>
  );
};