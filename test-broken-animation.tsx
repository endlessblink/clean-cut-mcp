import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface ValidationTestProps {
  color?: string;
  speed?: number;
}

export const ValidationTest: React.FC<ValidationTest Props> = ({
  color = '#ff6b6b',
  speed = 1
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rotation = (frame / fps) * 360 * speed;

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#1a1a2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 100,
        height: 100,
        backgroundColor: color,
        transform: `rotate(${rotation}deg)`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold'
      }}>
        VALIDATION
      </div>
    </div>
  );
};