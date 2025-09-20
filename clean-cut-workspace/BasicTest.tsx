import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

interface BasicTestProps {
  backgroundColor?: string;
  circleColor?: string;
  animationSpeed?: number;
  title?: string;
}

const BasicTest: React.FC<BasicTestProps> = ({
  backgroundColor = '#1a1a2e',
  circleColor = '#ff6b6b',
  animationSpeed = 1,
  title = 'Basic Test Animation'
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Animate circle size
  const circleScale = interpolate(
    frame * animationSpeed,
    [0, durationInFrames / 2, durationInFrames],
    [0.5, 1.5, 0.5],
    {
      easing: Easing.inOut(Easing.ease),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Animate circle rotation
  const rotation = interpolate(
    frame * animationSpeed,
    [0, durationInFrames],
    [0, 360],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Animate color hue
  const hueRotation = interpolate(
    frame * animationSpeed,
    [0, durationInFrames],
    [0, 360],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Animate title opacity
  const titleOpacity = interpolate(
    frame * animationSpeed,
    [0, 30, durationInFrames - 30, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
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
      }}
    >
      {/* Animated Title */}
      <h1
        style={{
          fontSize: '48px',
          color: 'white',
          marginBottom: '50px',
          opacity: titleOpacity,
          textAlign: 'center',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        {title}
      </h1>
      
      {/* Animated Circle */}
      <div
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          backgroundColor: circleColor,
          transform: `scale(${circleScale}) rotate(${rotation}deg)`,
          filter: `hue-rotate(${hueRotation}deg)`,
          boxShadow: '0 0 50px rgba(255, 107, 107, 0.5)',
          transition: 'all 0.1s ease-out',
        }}
      />
      
      {/* Small animated dots around the circle */}
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const dotRotation = rotation + (index * 60);
        const dotDistance = 150;
        const dotX = Math.cos((dotRotation * Math.PI) / 180) * dotDistance;
        const dotY = Math.sin((dotRotation * Math.PI) / 180) * dotDistance;
        
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'white',
              transform: `translate(${dotX}px, ${dotY}px)`,
              opacity: 0.8,
            }}
          />
        );
      })}
    </div>
  );
};

export { BasicTest };