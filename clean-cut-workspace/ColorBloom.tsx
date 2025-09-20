import React from 'react';
import {useCurrentFrame, interpolate, Sequence} from 'remotion';

interface ColorBloomProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  bloomCount?: number;
  title?: string;
}

export const ColorBloom: React.FC<ColorBloomProps> = ({
  primaryColor = '#FF6B6B',
  secondaryColor = '#4ECDC4',
  accentColor = '#45B7D1',
  bloomCount = 6,
  title = 'Color Bloom Test'
}) => {
  const frame = useCurrentFrame();
  
  const colors = [primaryColor, secondaryColor, accentColor, '#96CEB4', '#FECA57', '#FF9FF3'];
  
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          fontSize: 48,
          fontWeight: 'bold',
          color: '#ffffff',
          opacity: interpolate(frame, [0, 20, 100, 120], [0, 1, 1, 0]),
          transform: `translateY(${interpolate(frame, [0, 20], [20, 0])}px)`,
        }}
      >
        {title}
      </div>

      {/* Blooming circles */}
      {Array.from({length: bloomCount}).map((_, index) => {
        const startFrame = index * 8;
        const endFrame = startFrame + 40;
        
        const scale = interpolate(
          frame,
          [startFrame, startFrame + 15, endFrame - 10, endFrame],
          [0, 1.2, 1, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
        );
        
        const opacity = interpolate(
          frame,
          [startFrame, startFrame + 10, endFrame - 15, endFrame],
          [0, 0.8, 0.8, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
        );
        
        const rotation = interpolate(frame, [startFrame, endFrame], [0, 360]);
        
        const angle = (index / bloomCount) * Math.PI * 2;
        const radius = 120;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <Sequence key={index} from={startFrame} durationInFrames={endFrame - startFrame}>
            <div
              style={{
                position: 'absolute',
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: colors[index % colors.length],
                transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
                opacity,
                boxShadow: `0 0 30px ${colors[index % colors.length]}40`,
              }}
            />
          </Sequence>
        );
      })}
      
      {/* Center pulse */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          transform: `scale(${interpolate(frame, [0, 120], [1, 1.5], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          })})`,
          opacity: interpolate(frame, [0, 30, 90, 120], [0.3, 1, 1, 0.3]),
          boxShadow: '0 0 20px #ffffff80',
        }}
      />
    </div>
  );
};