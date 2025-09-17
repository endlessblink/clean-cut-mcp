import {Composition} from 'remotion';
import {Comp} from './Composition';
import {BouncingBall} from './BouncingBall';
import {BouncingBallRecreated} from './BouncingBallRecreated';
import {ConflictTest} from './ConflictTest';
import {FixedEditTest} from './FixedEditTest';
import {FloatingOrbs} from './FloatingOrbs';
import {JumpingBallShowcase} from './JumpingBallShowcase';
import {ProductShowcase} from './ProductShowcase';
import {RestartSuccessDemo} from './RestartSuccessDemo';
import {SeedreamAIShowcase} from './SeedreamAIShowcase';
import {SeedreamAIShowcaseFixed} from './SeedreamAIShowcaseFixed';
import {SeedreamCleanTransitions} from './SeedreamCleanTransitions';
import {SeedreamGracefulTransitions} from './SeedreamGracefulTransitions';
import {SeedreamOptimalTiming} from './SeedreamOptimalTiming';
import {SeedreamProfessional} from './SeedreamProfessional';
import {ShadowTest} from './ShadowTest';
import {SocialMediaFeed} from './SocialMediaFeed';
import {TestAnimation} from './TestAnimation';
import {TestBounce} from './TestBounce';
import {TextAnimation} from './TextAnimation';
import {TweetAnimation} from './TweetAnimation';

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
      <Composition
        id="BouncingBallRecreated"
        component={BouncingBallRecreated}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ConflictTest"
        component={ConflictTest}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FixedEditTest"
        component={FixedEditTest}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FloatingOrbs"
        component={FloatingOrbs}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="JumpingBallShowcase"
        component={JumpingBallShowcase}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ProductShowcase"
        component={ProductShowcase}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RestartSuccessDemo"
        component={RestartSuccessDemo}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SeedreamAIShowcase"
        component={SeedreamAIShowcase}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SeedreamAIShowcaseFixed"
        component={SeedreamAIShowcaseFixed}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SeedreamCleanTransitions"
        component={SeedreamCleanTransitions}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SeedreamGracefulTransitions"
        component={SeedreamGracefulTransitions}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SeedreamOptimalTiming"
        component={SeedreamOptimalTiming}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SeedreamProfessional"
        component={SeedreamProfessional}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ShadowTest"
        component={ShadowTest}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SocialMediaFeed"
        component={SocialMediaFeed}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TestAnimation"
        component={TestAnimation}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TestBounce"
        component={TestBounce}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TextAnimation"
        component={TextAnimation}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TweetAnimation"
        component={TweetAnimation}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};