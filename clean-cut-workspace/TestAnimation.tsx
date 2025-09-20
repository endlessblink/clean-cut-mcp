import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

export const TestAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Safe interpolation with bounds checking
  const safeInterpolate = (frame: number, inputRange: [number, number], outputRange: [number, number], easing?: any) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, { easing });
  };

  // Animation values
  const opacity = safeInterpolate(frame, [0, 30], [0, 1], Easing.out(Easing.cubic));
  const scale = safeInterpolate(frame, [0, 30], [0.8, 1], Easing.out(Easing.cubic));
  const rotate = safeInterpolate(frame, [30, 120], [0, 360], Easing.inOut(Easing.cubic));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale}) rotate(${rotate}deg)`,
          width: 200,
          height: 200,
          backgroundColor: '#3b82f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold',
        }}
      >
        TEST
      </div>
    </AbsoluteFill>
  );
};