import React from 'react';
import {Composition} from 'remotion';
import {Comp} from './Composition';

// AUTO-GENERATED IMPORTS - Updated by MCP tools
import {FloatingOrbs} from './FloatingOrbs';
import {GitHubProfileShowcase} from './GitHubProfileShowcase';
import {ProductShowcase} from './ProductShowcase';
import {SeedreamGracefulTransitions} from './SeedreamGracefulTransitions';
import {SocialMediaFeed} from './SocialMediaFeed';
import {TweetAnimation} from './TweetAnimation';

// Component Registry - Automatically maintained
const COMPONENT_REGISTRY = [
  {
    name: 'FloatingOrbs',
    component: FloatingOrbs,
    duration: 300,
    description: 'Floating orb particle effects'
  },
  {
    name: 'GitHubProfileShowcase',
    component: GitHubProfileShowcase,
    duration: 450,
    description: 'GitHub profile showcase animation'
  },
  {
    name: 'ProductShowcase',
    component: ProductShowcase,
    duration: 450,
    description: 'Product presentation animation'
  },
  {
    name: 'SeedreamGracefulTransitions',
    component: SeedreamGracefulTransitions,
    duration: 900,
    description: 'Professional transition effects'
  },
  {
    name: 'SocialMediaFeed',
    component: SocialMediaFeed,
    duration: 600,
    description: 'Social media feed animation'
  },
  {
    name: 'TweetAnimation',
    component: TweetAnimation,
    duration: 300,
    description: 'Twitter-style text animation'
  }
];

export const RemotionRoot: React.FC = () => {
  // Log registered components for debugging
  console.error(`[AUTO-REGISTRY] Registered ${COMPONENT_REGISTRY.length} animations:`,
    COMPONENT_REGISTRY.map(c => c.name).join(', '));

  return (
    <>
      {/* Main composition */}
      <Composition
        id="Main"
        component={Comp}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Auto-registered components */}
      {COMPONENT_REGISTRY.map((comp) => (
        <Composition
          key={comp.name}
          id={comp.name}
          component={comp.component}
          durationInFrames={comp.duration}
          fps={30}
          width={1920}
          height={1080}
        />
      ))}
    </>
  );
};