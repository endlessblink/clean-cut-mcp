import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const FixedEditTest: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  return (
    <AbsoluteFill style={{
      backgroundColor: '#000000',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{
        color: 'white',
        fontSize: '4rem',
        opacity
      }}>
        Test Text
      </h1>
    </AbsoluteFill>
  );
};

export default FixedEditTest;