import { Composition } from 'remotion';
import { Comp } from './Composition';
import { z } from 'zod';
import { FloatingOrbs } from './FloatingOrbs';
import { GitHubProfileMegaShowcase } from './GitHubProfileMegaShowcase';
import { GitHubProfileShowcase } from './GitHubProfileShowcase';
import { GitHubProfileShowcaseEnhanced } from './GitHubProfileShowcaseEnhanced';
import { PacmanAnimation } from './PacmanAnimation';
import { PacmanGame } from './PacmanGame';
import { PacmanGameImproved } from './PacmanGameImproved';
import { PacmanMazeRunner } from './PacmanMazeRunner';
import { PacmanMazeRunnerWithProps } from './PacmanMazeRunnerWithProps';
import { ProductShowcase } from './ProductShowcase';
import { PulsingCircle } from './PulsingCircle';
import { SeedreamGracefulTransitions } from './SeedreamGracefulTransitions';
import { SocialMediaFeed } from './SocialMediaFeed';
import { SundownSerenity } from './SundownSerenity';
import { TweetAnimation } from './TweetAnimation';

const PacmanMazeRunnerWithPropsSchema = z.object({
  pacmanSpeed: z.number().optional(),
  pacmanColor: z.string().optional(),
  showGhosts: z.boolean().optional(),
  showDots: z.boolean().optional(),
  backgroundColor: z.string().optional(),
  gameTheme: z.enum(['classic', 'neon', 'retro', 'modern']).optional(),
  ghostSpeed: z.number().optional(),
  mazeScale: z.number().optional(),
  showUI: z.boolean().optional()
});

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
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GitHubProfileMegaShowcase"
        component={GitHubProfileMegaShowcase}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GitHubProfileShowcase"
        component={GitHubProfileShowcase}
        durationInFrames={450}
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
        id="PacmanAnimation"
        component={PacmanAnimation}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PacmanGame"
        component={PacmanGame}
        durationInFrames={360}
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
        id="PacmanMazeRunner"
        component={PacmanMazeRunner}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PacmanMazeRunnerWithProps"
        component={PacmanMazeRunnerWithProps}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={PacmanMazeRunnerWithPropsSchema}
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
        id="PulsingCircle"
        component={PulsingCircle}
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
      <Composition
        id="SundownSerenity"
        component={SundownSerenity}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TweetAnimation"
        component={TweetAnimation}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
