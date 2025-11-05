import { Composition } from 'remotion';
import { Comp } from './Composition';
import { z } from 'zod';
import { AllGasNoBrakesAnimation } from './assets/animations/AllGasNoBrakesAnimation';
import { AnytypeCrashDemo } from './assets/animations/AnytypeCrashDemo';
import { CameraShowcase } from './assets/animations/CameraShowcase';
import { ChatBubbleAnimation } from './assets/animations/ChatBubbleAnimation';
import { EndlessBlinkShowcase } from './assets/animations/EndlessBlinkShowcase';
import { EnhancedFluentShowcase } from './assets/animations/EnhancedFluentShowcase';
import { FloatingOrbs } from './assets/animations/FloatingOrbs';
import { FlowTaskGradient } from './assets/animations/FlowTaskGradient';
import { FlowTaskMinimalist } from './assets/animations/FlowTaskMinimalist';
import { FlowingParticles } from './assets/animations/FlowingParticles';
import { GitHubProfileShowcaseEnhanced } from './assets/animations/GitHubProfileShowcaseEnhanced';
import { KineticText } from './assets/animations/KineticText';
import { MarioDashcamStop } from './assets/animations/MarioDashcamStop';
import { NoOverlapShowcase } from './assets/animations/NoOverlapShowcase';
import { PacmanGameImproved } from './assets/animations/PacmanGameImproved';
import { ParticleEffects } from './assets/animations/ParticleEffects';
import { SaaSProductShowcase } from './assets/animations/SaaSProductShowcase';
import { SocialMediaFeed } from './assets/animations/SocialMediaFeed';
import { WolfOfAIStreet } from './assets/animations/WolfOfAIStreet';

const AllGasNoBrakesAnimationSchema = z.object({
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  mainText: z.string().optional(),
  subText: z.string().optional(),
  author: z.string().optional()
});
const AnytypeCrashDemoSchema = z.object({
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  errorColor: z.string().optional(),
  successColor: z.string().optional()
});
const CameraShowcaseSchema = z.object({
  title: z.string().optional(),
  backgroundColor: z.string().optional(),
  accentColor: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional()
});
const ChatBubbleAnimationSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  message1: z.string().optional(),
  message2: z.string().optional(),
  message3: z.string().optional()
});
const FloatingOrbsSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  orbCount: z.number().optional(),
  animationSpeed: z.number().optional()
});
const FlowingParticlesSchema = z.object({
  particleCount: z.number().optional(),
  colorPalette: z.string().optional(),
  speed: z.number().optional(),
  flowStrength: z.number().optional()
});
const KineticTextSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  backgroundColor: z.string().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional()
});
const MarioDashcamStopSchema = z.object({
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  badgeText: z.string().optional(),
  locationText: z.string().optional()
});
const ParticleEffectsSchema = z.object({
  title: z.string().optional(),
  backgroundColor: z.string().optional(),
  showLabels: z.boolean().optional()
});
const WolfOfAIStreetSchema = z.object({
  accentColor: z.string().optional(),
  titleText: z.string().optional(),
  statsColor: z.string().optional()
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
        id="AllGasNoBrakesAnimation"
        component={AllGasNoBrakesAnimation}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={AllGasNoBrakesAnimationSchema}
      />
      <Composition
        id="AnytypeCrashDemo"
        component={AnytypeCrashDemo}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={AnytypeCrashDemoSchema}
      />
      <Composition
        id="CameraShowcase"
        component={CameraShowcase}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        schema={CameraShowcaseSchema}
      />
      <Composition
        id="ChatBubbleAnimation"
        component={ChatBubbleAnimation}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={ChatBubbleAnimationSchema}
      />
      <Composition
        id="EndlessBlinkShowcase"
        component={EndlessBlinkShowcase}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="EnhancedFluentShowcase"
        component={EnhancedFluentShowcase}
        durationInFrames={450}
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
        schema={FloatingOrbsSchema}
      />
      <Composition
        id="FlowTaskGradient"
        component={FlowTaskGradient}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FlowTaskMinimalist"
        component={FlowTaskMinimalist}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FlowingParticles"
        component={FlowingParticles}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={FlowingParticlesSchema}
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
        id="KineticText"
        component={KineticText}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={KineticTextSchema}
      />
      <Composition
        id="MarioDashcamStop"
        component={MarioDashcamStop}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={MarioDashcamStopSchema}
      />
      <Composition
        id="NoOverlapShowcase"
        component={NoOverlapShowcase}
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
        id="ParticleEffects"
        component={ParticleEffects}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={ParticleEffectsSchema}
      />
      <Composition
        id="SaaSProductShowcase"
        component={SaaSProductShowcase}
        durationInFrames={450}
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
        id="WolfOfAIStreet"
        component={WolfOfAIStreet}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={WolfOfAIStreetSchema}
      />
    </>
  );
};
