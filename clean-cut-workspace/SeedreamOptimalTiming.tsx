import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

const SeedreamOptimalTiming: React.FC = () => {
  const frame = useCurrentFrame();

  // LARGE typography following guidelines
  const FONT_STACKS = {
    primary: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  };

  const TYPOGRAPHY = {
    display: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '96px',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.02em'
    },
    h1: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '64px',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    },
    h2: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '48px',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '0em'
    },
    body: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '32px',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0em'
    }
  };

  // Professional color palette
  const COLORS = {
    brand: '#1E40AF',
    accent: '#3B82F6',
    text: '#1F2937',
    surface: '#F8FAFC',
    gradient1: '#6366F1',
    gradient2: '#8B5CF6'
  };

  // OPTIMAL TIMING - Balanced animation sequence
  const animations = {
    scene1: {
      opacity: interpolate(frame, [0, 20], [0, 1], { easing: Easing.out(Easing.cubic) }) *
               interpolate(frame, [80, 100], [1, 0], { easing: Easing.in(Easing.cubic) }),
      entryY: interpolate(frame, [0, 20], [40, 0], { easing: Easing.out(Easing.back(1.5)) })
    },
    scene2: {
      opacity: interpolate(frame, [60, 80], [0, 1], { easing: Easing.out(Easing.cubic) }) *
               interpolate(frame, [140, 160], [1, 0], { easing: Easing.in(Easing.cubic) }),
      entryY: interpolate(frame, [60, 80], [40, 0], { easing: Easing.out(Easing.back(1.5)) })
    },
    scene3: {
      opacity: interpolate(frame, [120, 140], [0, 1], { easing: Easing.out(Easing.cubic) }) *
               interpolate(frame, [200, 220], [1, 0], { easing: Easing.in(Easing.cubic) }),
      entryY: interpolate(frame, [120, 140], [40, 0], { easing: Easing.out(Easing.back(1.5)) })
    },
    scene4: {
      opacity: interpolate(frame, [180, 200], [0, 1], { easing: Easing.out(Easing.cubic) }) *
               interpolate(frame, [260, 280], [1, 0], { easing: Easing.in(Easing.cubic) }),
      entryY: interpolate(frame, [180, 200], [40, 0], { easing: Easing.out(Easing.back(1.5)) })
    },
    scene5: {
      opacity: interpolate(frame, [240, 260], [0, 1], { easing: Easing.out(Easing.cubic) }),
      entryY: interpolate(frame, [240, 260], [40, 0], { easing: Easing.out(Easing.back(1.5)) })
    }
  };

  // Background animation
  const bgOpacity = interpolate(frame, [0, 30, 270, 300], [0, 1, 1, 0]);
  const gradientRotation = interpolate(frame, [0, 300], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientRotation}deg, ${COLORS.gradient1}, ${COLORS.gradient2})`,
        opacity: bgOpacity,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px'
      }}
    >
      {/* Scene 1: Brand Introduction */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${animations.scene1.entryY}px)`,
          opacity: animations.scene1.opacity,
          textAlign: 'center',
          color: 'white'
        }}
      >
        <div style={TYPOGRAPHY.display}>Seedream AI</div>
        <div style={{...TYPOGRAPHY.h2, marginTop: '24px', opacity: 0.9}}>
          Professional Video Generation
        </div>
      </div>

      {/* Scene 2: Key Feature */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${animations.scene2.entryY}px)`,
          opacity: animations.scene2.opacity,
          textAlign: 'center',
          color: 'white'
        }}
      >
        <div style={TYPOGRAPHY.h1}>Create Stunning Videos</div>
        <div style={{...TYPOGRAPHY.body, marginTop: '32px', opacity: 0.8}}>
          Transform your ideas into professional animations
        </div>
      </div>

      {/* Scene 3: Benefits */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${animations.scene3.entryY}px)`,
          opacity: animations.scene3.opacity,
          textAlign: 'center',
          color: 'white'
        }}
      >
        <div style={TYPOGRAPHY.h1}>Lightning Fast</div>
        <div style={{...TYPOGRAPHY.body, marginTop: '32px', opacity: 0.8}}>
          Generate videos in seconds, not hours
        </div>
      </div>

      {/* Scene 4: Quality */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${animations.scene4.entryY}px)`,
          opacity: animations.scene4.opacity,
          textAlign: 'center',
          color: 'white'
        }}
      >
        <div style={TYPOGRAPHY.h1}>Premium Quality</div>
        <div style={{...TYPOGRAPHY.body, marginTop: '32px', opacity: 0.8}}>
          4K resolution with smooth animations
        </div>
      </div>

      {/* Scene 5: Call to Action */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${animations.scene5.entryY}px)`,
          opacity: animations.scene5.opacity,
          textAlign: 'center',
          color: 'white'
        }}
      >
        <div style={TYPOGRAPHY.display}>Try Seedream Today</div>
        <div style={{
          ...TYPOGRAPHY.h2,
          marginTop: '32px',
          padding: '16px 32px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }}>
          seedream.ai
        </div>
      </div>
    </AbsoluteFill>
  );
};

export { SeedreamOptimalTiming };