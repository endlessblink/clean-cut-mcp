import { Composition } from 'remotion';
import { Comp } from './Composition';
import { z } from 'zod';
import { BouncingBallTest } from './assets/animations/BouncingBallTest';
import { EndlessBlinkExtended } from './assets/animations/EndlessBlinkExtended';
import { FloatingOrbs } from './assets/animations/FloatingOrbs';
import { FloatingOrbsAnimation } from './assets/animations/FloatingOrbsAnimation';
import { FloatingParticles } from './assets/animations/FloatingParticles';
import { GitHubProfileShowcaseEnhanced } from './assets/animations/GitHubProfileShowcaseEnhanced';
import { PacmanGameImproved } from './assets/animations/PacmanGameImproved';
import { RisingSunEnhanced } from './assets/animations/RisingSunEnhanced';
import { SeedreamGracefulTransitions } from './assets/animations/SeedreamGracefulTransitions';
import { SimpleCircle } from './assets/animations/SimpleCircle';
import { SocialMediaFeed } from './assets/animations/SocialMediaFeed';
import { StarBurstTest } from './assets/animations/StarBurstTest';

const BouncingBallTestSchema = z.object({
  ballColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  ballSize: z.number().optional(),
  bounceHeight: z.number().optional()
});
const EndlessBlinkExtendedSchema = z.object({
  username: z.string().optional(),
  displayName: z.string().optional(),
  bio: z.string().optional(),
  profileDescription: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  textColor: z.string().optional(),
  animationSpeed: z.number().optional(),
  sceneTransitionSpeed: z.number().optional(),
  showTechStack: z.boolean().optional(),
  showDetailedStats: z.boolean().optional(),
  showCommunityImpact: z.boolean().optional(),
  yearsActive: z.string().optional(),
  location: z.string().optional(),
  specialization: z.string().optional()
});
const FloatingOrbsSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  orbCount: z.number().optional(),
  animationSpeed: z.number().optional()
});
const FloatingOrbsAnimationSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  orbCount: z.number().optional(),
  animationSpeed: z.number().optional(),
  title: z.string().optional()
});
const FloatingParticlesSchema = z.object({
  particleCount: z.number().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  animationSpeed: z.number().optional(),
  pulseIntensity: z.number().optional()
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
const SimpleCircleSchema = z.object({
  circleColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  animationSpeed: z.number().optional(),
  maxSize: z.number().optional()
});
const StarBurstTestSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  starCount: z.number().optional(),
  spinSpeed: z.number().optional(),
  pulseIntensity: z.number().optional()
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
        id="BouncingBallTest"
        component={BouncingBallTest}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={BouncingBallTestSchema}
      />
      <Composition
        id="EndlessBlinkExtended"
        component={EndlessBlinkExtended}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={EndlessBlinkExtendedSchema}
      />
      <Composition
        id="FloatingOrbs"
        component={FloatingOrbs}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={FloatingOrbsSchema}
      />
      <Composition
        id="FloatingOrbsAnimation"
        component={FloatingOrbsAnimation}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={FloatingOrbsAnimationSchema}
      />
      <Composition
        id="FloatingParticles"
        component={FloatingParticles}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={FloatingParticlesSchema}
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
        schema={RisingSunEnhancedSchema}
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
        id="SimpleCircle"
        component={SimpleCircle}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={SimpleCircleSchema}
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
        id="StarBurstTest"
        component={StarBurstTest}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={StarBurstTestSchema}
      />
    </>
  );
};
