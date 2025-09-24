import { Composition } from 'remotion';
import { Comp } from './Composition';
import { z } from 'zod';
import { BouncingBall } from './assets/animations/BouncingBall';
import { GitHubProfileShowcaseEnhanced } from './assets/animations/GitHubProfileShowcaseEnhanced';
import { McpTestAnimation } from './assets/animations/McpTestAnimation';
import { MorphingShapes } from './assets/animations/MorphingShapes';
import { PacmanGameImproved } from './assets/animations/PacmanGameImproved';
import { PacmanMazeRunnerWithProps } from './assets/animations/PacmanMazeRunnerWithProps';
import { ParticleBurst } from './assets/animations/ParticleBurst';
import { ProductShowcase } from './assets/animations/ProductShowcase';
import { PulseCircle } from './assets/animations/PulseCircle';
import { PulsingOrb } from './assets/animations/PulsingOrb';
import { PulsingSphere } from './assets/animations/PulsingSphere';
import { QuickFlash } from './assets/animations/QuickFlash';
import { RefreshTest } from './assets/animations/RefreshTest';
import { RisingSun } from './assets/animations/RisingSun';
import { RisingSunEnhanced } from './assets/animations/RisingSunEnhanced';
import { SecondTest } from './assets/animations/SecondTest';
import { SeedreamGracefulTransitions } from './assets/animations/SeedreamGracefulTransitions';
import { SimpleBounceBall } from './assets/animations/SimpleBounceBall';
import { SocialMediaFeed } from './assets/animations/SocialMediaFeed';
import { SpinningStar } from './assets/animations/SpinningStar';
import { SundownSerenity } from './assets/animations/SundownSerenity';
import { TweetAnimation } from './assets/animations/TweetAnimation';
import { WelcomeAnimation } from './assets/animations/WelcomeAnimation';
import { WelcomeDemo } from './assets/animations/WelcomeDemo';
import { Zzzz } from './assets/animations/Zzzz';

const MorphingShapesSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  title: z.string().optional(),
  animationSpeed: z.number().optional()
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
  showUI: z.boolean().optional()
});
const ParticleBurstSchema = z.object({
  particleCount: z.number().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  centerText: z.string().optional(),
  animationSpeed: z.number().optional()
});
const PulseCircleSchema = z.object({
  backgroundColor: z.string().optional(),
  circleColor: z.string().optional(),
  pulseColor: z.string().optional(),
  title: z.string().optional(),
  size: z.number().optional()
});
const PulsingOrbSchema = z.object({
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  pulseSpeed: z.number().optional()
});
const PulsingSphereSchema = z.object({
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  title: z.string().optional(),
  pulseIntensity: z.number().optional()
});
const QuickFlashSchema = z.object({
  backgroundColor: z.string().optional(),
  accentColor: z.string().optional(),
  text: z.string().optional(),
  intensity: z.number().optional()
});
const RisingSunSchema = z.object({
  sunColor: z.string().optional(),
  skyGradientStart: z.string().optional(),
  skyGradientEnd: z.string().optional(),
  cloudColor: z.string().optional(),
  animationSpeed: z.number().optional(),
  title: z.string().optional()
});
const RisingSunEnhancedSchema = z.object({
  sunColor: z.string().optional(),
  sunSize: z.number().optional(),
  sunGlowIntensity: z.number().optional(),
  sunStartY: z.number().optional(),
  sunEndY: z.number().optional(),
  sunGlowColor: z.string().optional(),
  skyGradientStart: z.string().optional(),
  skyGradientEnd: z.string().optional(),
  skyGradientMidpoint: z.string().optional(),
  useThreeColorGradient: z.boolean().optional(),
  cloudColor: z.string().optional(),
  cloudOpacity: z.number().optional(),
  cloudSpeed: z.number().optional(),
  showClouds: z.boolean().optional(),
  cloudCount: z.number().optional(),
  cloudSize: z.number().optional(),
  showSunRays: z.boolean().optional(),
  rayCount: z.number().optional(),
  rayLength: z.number().optional(),
  rayColor: z.string().optional(),
  rayOpacity: z.number().optional(),
  rayRotationSpeed: z.number().optional(),
  rayWidth: z.number().optional(),
  title: z.string().optional(),
  titleColor: z.string().optional(),
  titleSize: z.number().optional(),
  titleDelay: z.number().optional(),
  titleFadeSpeed: z.number().optional(),
  subtitle: z.string().optional(),
  subtitleColor: z.string().optional(),
  subtitleSize: z.number().optional(),
  subtitleDelay: z.number().optional(),
  titleShadow: z.boolean().optional(),
  animationSpeed: z.number().optional(),
  sunRiseDelay: z.number().optional(),
  sunRiseDuration: z.number().optional(),
  glowDelay: z.number().optional(),
  glowDuration: z.number().optional(),
  showGradientShift: z.boolean().optional(),
  backgroundParticles: z.boolean().optional(),
  particleColor: z.string().optional(),
  particleCount: z.number().optional(),
  particleSize: z.number().optional(),
  particleSpeed: z.number().optional(),
  sunBounce: z.boolean().optional(),
  cloudFloat: z.boolean().optional(),
  titlePulse: z.boolean().optional(),
  rayPulse: z.boolean().optional(),
  sunBorderColor: z.string().optional(),
  sunBorderWidth: z.number().optional(),
  cloudShadow: z.boolean().optional(),
  vintageEffect: z.boolean().optional(),
  bloomEffect: z.boolean().optional()
});
const SimpleBounceBallSchema = z.object({
  ballColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  bounceHeight: z.number().optional()
});
const SpinningStarSchema = z.object({
  starColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  rotationSpeed: z.number().optional(),
  starSize: z.number().optional(),
  glowIntensity: z.number().optional()
});
const WelcomeAnimationSchema = z.object({
  title: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  animationSpeed: z.number().optional()
});
const WelcomeDemoSchema = z.object({
  title: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  animationSpeed: z.number().optional()
});
const ZzzzSchema = z.object({
  textColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  animationSpeed: z.number().optional(),
  zCount: z.number().optional()
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
        id="BouncingBall"
        component={BouncingBall}
        durationInFrames={240}
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
        id="McpTestAnimation"
        component={McpTestAnimation}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MorphingShapes"
        component={MorphingShapes}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={MorphingShapesSchema}
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
        id="ParticleBurst"
        component={ParticleBurst}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={ParticleBurstSchema}
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
        id="PulseCircle"
        component={PulseCircle}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        schema={PulseCircleSchema}
      />
      <Composition
        id="PulsingOrb"
        component={PulsingOrb}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={PulsingOrbSchema}
      />
      <Composition
        id="PulsingSphere"
        component={PulsingSphere}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={PulsingSphereSchema}
      />
      <Composition
        id="QuickFlash"
        component={QuickFlash}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={QuickFlashSchema}
      />
      <Composition
        id="RefreshTest"
        component={RefreshTest}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RisingSun"
        component={RisingSun}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={RisingSunSchema}
      />
      <Composition
        id="RisingSunEnhanced"
        component={RisingSunEnhanced}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={RisingSunEnhancedSchema}
      />
      <Composition
        id="SecondTest"
        component={SecondTest}
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
        id="SimpleBounceBall"
        component={SimpleBounceBall}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        schema={SimpleBounceBallSchema}
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
        id="SpinningStar"
        component={SpinningStar}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={SpinningStarSchema}
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
        schema={WelcomeAnimationSchema}
      />
      <Composition
        id="WelcomeDemo"
        component={WelcomeDemo}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={WelcomeDemoSchema}
      />
      <Composition
        id="Zzzz"
        component={Zzzz}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={ZzzzSchema}
      />
    </>
  );
};
