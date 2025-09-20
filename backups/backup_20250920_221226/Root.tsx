import { Composition } from 'remotion';
import { Comp } from './Composition';
import React from 'react';
import { z } from 'zod';
import { GitHubProfileMegaShowcase } from './assets/animations/GitHubProfileMegaShowcase';
import { GitHubProfileShowcaseEnhanced } from './assets/animations/GitHubProfileShowcaseEnhanced';
import { PacmanGameImproved } from './assets/animations/PacmanGameImproved';
import { PacmanMazeRunnerWithProps } from './assets/animations/PacmanMazeRunnerWithProps';
import { ProductShowcase } from './assets/animations/ProductShowcase';
import { SeedreamGracefulTransitions } from './assets/animations/SeedreamGracefulTransitions';
import { SocialMediaFeed } from './assets/animations/SocialMediaFeed';
import { SundownSerenity } from './assets/animations/SundownSerenity';
import { TweetAnimation } from './assets/animations/TweetAnimation';
import { WelcomeAnimation } from './assets/animations/WelcomeAnimation';
import { WelcomeDemo } from './assets/animations/WelcomeDemo';

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
        id="GitHubProfileMegaShowcase"
        component={GitHubProfileMegaShowcase}
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
        id="PacmanGameImproved"
        component={PacmanGameImproved}
        durationInFrames={360}
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
        id="WelcomeAnimation"
        component={WelcomeAnimation}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="WelcomeDemo"
        component={WelcomeDemo}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};