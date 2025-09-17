import { Composition } from 'remotion';
import { Comp } from './Composition';
import { TestAnimation } from './TestAnimation';

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
        id="TestAnimation"
        component={TestAnimation}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};