import { Composition } from 'remotion';
import { Comp } from './Composition';
import { z } from 'zod';
import { BouncingBall } from './BouncingBall';
import { ColorBloom } from './ColorBloom';
import { FloatingOrbs } from './FloatingOrbs';
import { FluidWave } from './FluidWave';
import { GeometricMorph } from './GeometricMorph';
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
import { QuickTestAnimation } from './QuickTestAnimation';
import { SeedreamGracefulTransitions } from './SeedreamGracefulTransitions';
import { SocialMediaFeed } from './SocialMediaFeed';
import { SundownSerenity } from './SundownSerenity';
import { TweetAnimation } from './TweetAnimation';
import { UniqueTextAnimation } from './UniqueTextAnimation';

const ColorBloomSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  bloomCount: z.number().optional(),
  title: z.string().optional(),
});
const FluidWaveSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  waveIntensity: z.number().optional(),
  flowSpeed: z.number().optional(),
  viscosity: z.number().optional(),
  temperature: z.number().optional(),
  title: z.string().optional(),
  showRipples: z.boolean().optional(),
  backgroundMode: z.enum(['dark', 'light', 'gradient']).optional(),
});
const GeometricMorphSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  morphSpeed: z.number().optional(),
  shapeComplexity: z.number().optional(),
  rotationSpeed: z.number().optional(),
  title: z.string().optional(),
  showParticles: z.boolean().optional(),
  particleCount: z.number().optional(),
});
const GitHubProfileShowcaseSchema = z.object({
  username: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  publicRepos: z.number().optional(),
  starsEarned: z.number().optional(),
  totalCommits: z.number().optional(),
  animationSpeed: z.number().optional(),
  projectName1: z.string().optional(),
  projectName2: z.string().optional(),
  projectName3: z.string().optional(),
});
const PacmanMazeRunnerWithPropsSchema = z.object({
  pacmanSpeed: z.number().optional(),
  pacmanColor: z.string().optional(),
  showGhosts: z.boolean().optional(),
  showDots: z.boolean().optional(),
  backgroundColor: z.string().optional(),
  gameTheme: z.enum(['classic', 'neon', 'retro', 'modern']).optional(),
  ghostSpeed: z.number().optional(),
  mazeScale: z.number().optional(),
  showUI: z.boolean().optional(),
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Main" component={Comp} durationInFrames={90} fps={30} width={1920} height={1080} />
      <Composition
        id="BouncingBall"
        component={BouncingBall}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ColorBloom"
        component={ColorBloom}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={ColorBloomSchema}
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
        id="FluidWave"
        component={FluidWave}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={FluidWaveSchema}
      />
      <Composition
        id="GeometricMorph"
        component={GeometricMorph}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={GeometricMorphSchema}
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
        schema={GitHubProfileShowcaseSchema}
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
      <Composition id="PacmanGame" component={PacmanGame} durationInFrames={360} fps={30} width={1920} height={1080} />
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
        id="QuickTestAnimation"
        component={QuickTestAnimation}
        durationInFrames={180}
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
      <Composition
        id="UniqueTextAnimation"
        component={UniqueTextAnimation}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
