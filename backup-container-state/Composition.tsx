import {useCurrentFrame, AbsoluteFill, interpolate} from 'remotion';

export const Comp: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 80,
        backgroundColor: '#000',
        color: '#fff',
        opacity,
      }}
    >
      Welcome to Remotion
    </AbsoluteFill>
  );
};