import { Composition } from 'remotion';
import { Comp } from './Composition';
import { FloatingOrbs } from './FloatingOrbs';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Comp}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FloatingOrbs"
        component={FloatingOrbs}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};