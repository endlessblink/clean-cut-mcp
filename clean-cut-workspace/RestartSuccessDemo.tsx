import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';

export const RestartSuccessDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  const scale = spring({
    frame,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5,
    },
  });

  const rotation = interpolate(frame, [0, 120], [0, 360], {
    extrapolateRight: 'clamp',
  });

  const textOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0f0f23',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        fontSize: '4rem',
        fontWeight: 'bold',
        color: '#00ff88',
        textAlign: 'center',
        textShadow: '0 0 20px #00ff88',
        marginBottom: '2rem'
      }}>
        ✨ RESTART SUCCESS ✨
      </div>

      <div style={{
        opacity: textOpacity,
        fontSize: '2.5rem',
        color: '#ff6b6b',
        textAlign: 'center',
        fontWeight: 'bold',
        textShadow: '0 0 15px #ff6b6b'
      }}>
        All animations persisted!
        <br />
        Container restarted successfully!
      </div>
    </AbsoluteFill>
  );
};

export default RestartSuccessDemo;