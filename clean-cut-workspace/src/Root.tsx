import { Composition } from 'remotion';
import { Comp } from './Composition';
import { z } from 'zod';
import { GitHubProfileShowcaseEnhanced } from './assets/animations/GitHubProfileShowcaseEnhanced';
import { PacmanGameImproved } from './assets/animations/PacmanGameImproved';
import { RisingSunEnhanced } from './assets/animations/RisingSunEnhanced';
import { SeedreamGracefulTransitions } from './assets/animations/SeedreamGracefulTransitions';
import { SocialMediaFeed } from './assets/animations/SocialMediaFeed';

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
        id="GitHubProfileShowcaseEnhanced"
        component={GitHubProfileShowcaseEnhanced}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PacmanGameImproved"
        component={PacmanGameImproved}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RisingSunEnhanced"
        component={RisingSunEnhanced}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SeedreamGracefulTransitions"
        component={SeedreamGracefulTransitions}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SocialMediaFeed"
        component={SocialMediaFeed}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};