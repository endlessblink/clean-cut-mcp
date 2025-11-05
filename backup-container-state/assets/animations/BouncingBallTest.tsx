import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

interface BouncingBallTestProps {
  ballColor?: string;
  backgroundColor?: string;
  ballSize?: number;
  bounceHeight?: number;
}

export const BouncingBallTest: React.FC<BouncingBallTestProps> = ({
  ballColor = '#ff6b6b',
  backgroundColor = '#4ecdc4',
  ballSize = 60,
  bounceHeight = 200,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  
  // Create a bouncing animation that repeats every 60 frames (1 second at 60fps)
  const bounceProgress = (frame % (fps * 1)) / (fps * 1); // 1 second cycle
  
  // Use a sine wave for smooth bouncing motion
  const ballY = interpolate(
    bounceProgress,
    [0, 0.5, 1],
    [height - ballSize - 50, height - ballSize - 50 - bounceHeight, height - ballSize - 50],
    {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }
  );
  
  // Add horizontal movement across the screen
  const ballX = interpolate(
    frame,
    [0, durationInFrames],
    [ballSize, width - ballSize],
    {
      easing: Easing.bezier(0.42, 0, 0.58, 1),
    }
  );
  
  // Add a pulsing effect to make it more dynamic
  const scale = interpolate(
    bounceProgress,
    [0, 0.2, 0.8, 1],
    [1, 1.2, 1.2, 1],
    {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ground line */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        }}
      />
      
      {/* Bouncing ball */}
      <div
        style={{
          position: 'absolute',
          left: ballX - ballSize / 2,
          top: ballY - ballSize / 2,
          width: ballSize,
          height: ballSize,
          backgroundColor: ballColor,
          borderRadius: '50%',
          transform: `scale(${scale})`,
          boxShadow: `0 ${(height - ballY) * 0.1}px ${(height - ballY) * 0.2}px rgba(0, 0, 0, 0.2)`,
          transition: 'none',
        }}
      />
      
      {/* Title text */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 48,
          fontWeight: 'bold',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        Test Animation
      </div>
    </div>
  );
};