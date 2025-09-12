import { Composition } from 'remotion';
import { Comp } from './Composition';
import { SeedreamOptimalTiming } from './SeedreamOptimalTiming';

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
        id="SeedreamOptimalTiming"
        component={SeedreamOptimalTiming}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};