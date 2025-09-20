import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';

export const McpTestAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Simple fade and slide animation
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const slideY = interpolate(frame, [0, 20], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const scale = interpolate(frame, [20, 40], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${slideY}px) scale(${scale})`,
          textAlign: 'center',
          color: '#ffffff',
        }}
      >
        <h1
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            margin: '0 0 24px 0',
            color: '#22d3ee',
            textShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
          }}
        >
          MCP Test Success
        </h1>
        <p
          style={{
            fontSize: 24,
            margin: 0,
            color: '#94a3b8',
          }}
        >
          Animation created via MCP server
        </p>

        {/* Animated indicator */}
        <div
          style={{
            marginTop: 40,
            width: 100,
            height: 4,
            backgroundColor: '#22d3ee',
            borderRadius: 2,
            opacity: interpolate(frame, [40, 60], [0.3, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp'
            }),
            transform: `scaleX(${interpolate(frame, [40, 80], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp'
            })})`,
            transformOrigin: 'left',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};