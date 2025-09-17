import { Composition } from 'remotion';
import { Comp } from './Composition';
import { BouncingBall } from './BouncingBall';

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
        id="BouncingBall"
        component={BouncingBall}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};