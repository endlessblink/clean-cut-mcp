import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

// Professional typography system
const FONT_STACKS = {
  primary: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
};

const TYPOGRAPHY = {
  h1: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '48px',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em'
  },
  h2: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '36px',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '0em'
  },
  body: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0em'
  },
  badge: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: '0.05em'
  }
};

const FONT_CONTAINER_STYLES = {
  fontFamily: FONT_STACKS.primary,
  fontDisplay: 'swap' as const,
  WebkitFontSmoothing: 'antialiased' as const,
  MozOsxFontSmoothing: 'grayscale' as const,
  textRendering: 'optimizeLegibility' as const
};

export const FloatingOrbs: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Safe interpolation with bounds checking
  const safeInterpolate = (frame: number, inputRange: [number, number], outputRange: [number, number], easing?: any) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, { easing });
  };
  
  // Overlapping scenes with movement + fades (8 seconds = 240 frames)
  const animations = {
    scene1: {
      opacity: safeInterpolate(frame, [0, 20], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [60, 75], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [0, 20], [40, 0], Easing.out(Easing.cubic)),
      exitY: safeInterpolate(frame, [60, 75], [0, -20], Easing.in(Easing.cubic)),
      scale: safeInterpolate(frame, [0, 20], [0.9, 1], Easing.out(Easing.cubic))
    },
    scene2: {
      opacity: safeInterpolate(frame, [65, 85], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [140, 155], [1, 0], Easing.in(Easing.cubic)),
      entryX: safeInterpolate(frame, [65, 85], [60, 0], Easing.out(Easing.cubic)),
      exitX: safeInterpolate(frame, [140, 155], [0, -60], Easing.in(Easing.cubic)),
      rotation: safeInterpolate(frame, [65, 155], [0, 360], Easing.linear)
    },
    scene3: {
      opacity: safeInterpolate(frame, [150, 170], [0, 1], Easing.out(Easing.cubic)),
      entryScale: safeInterpolate(frame, [150, 170], [0.8, 1], Easing.out(Easing.cubic)),
      pulse: Math.sin((frame - 150) * 0.2) * 0.1 + 1
    }
  };
  
  // Calculate scene visibility
  const sceneVisibility = {
    scene1: animations.scene1.opacity,
    scene2: animations.scene2.opacity,
    scene3: animations.scene3.opacity
  };
  
  // Background gradient animation
  const backgroundStyle = {
    background: `linear-gradient(135deg, 
      hsl(${safeInterpolate(frame, [0, 240], [260, 320])}, 45%, 12%) 0%, 
      hsl(${safeInterpolate(frame, [0, 240], [280, 340])}, 45%, 20%) 100%)`
  };
  
  // Container styles
  const containerStyles = {
    ...FONT_CONTAINER_STYLES,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    ...backgroundStyle
  };
  
  const contentStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '800px',
    textAlign: 'center' as const,
    padding: '40px'
  };
  
  // Floating orbs data
  const orbs = [
    { id: 1, size: 80, color: '#a78bfa', delay: 0 },
    { id: 2, size: 60, color: '#06b6d4', delay: 5 },
    { id: 3, size: 100, color: '#10b981', delay: 10 },
    { id: 4, size: 40, color: '#f59e0b', delay: 15 }
  ];
  
  const badges = ['Test Animation', 'Floating Orbs', 'Smooth Transitions', 'Professional'];
  
  return (
    <AbsoluteFill style={containerStyles}>
      {/* Floating orbs background */}
      {orbs.map((orb) => (
        <div
          key={orb.id}
          style={{
            position: 'absolute',
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color}40, ${orb.color}10)`,
            top: `${20 + Math.sin((frame + orb.delay) * 0.02) * 30}%`,
            left: `${10 + orb.id * 20 + Math.cos((frame + orb.delay) * 0.015) * 15}%`,
            opacity: safeInterpolate(frame, [orb.delay, orb.delay + 30], [0, 0.8]),
            transform: `scale(${safeInterpolate(frame, [orb.delay, orb.delay + 30], [0.5, 1])})`,
            filter: 'blur(1px)'
          }}
        />
      ))}
      
      {/* Scene 1: Title introduction */}
      {sceneVisibility.scene1 > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.scene1,
            transform: `translateY(${animations.scene1.entryY + animations.scene1.exitY}px) scale(${animations.scene1.scale})`
          }}>
            <h1 style={{...TYPOGRAPHY.h1, color: '#ffffff', margin: '0 0 24px 0'}}>
              Test Animation
            </h1>
            <p style={{...TYPOGRAPHY.body, color: '#e5e5e5', margin: 0}}>
              Professional Remotion showcase with overlapping scenes
            </p>
          </div>
        </div>
      )}
      
      {/* Scene 2: Floating elements demo */}
      {sceneVisibility.scene2 > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.scene2,
            transform: `translateX(${animations.scene2.entryX + animations.scene2.exitX}px) rotate(${animations.scene2.rotation}deg)`
          }}>
            <h2 style={{...TYPOGRAPHY.h2, color: '#a78bfa', margin: '0 0 32px 0'}}>
              Floating Elements
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '30px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {['Smooth', 'Transitions', 'Professional', 'Quality'].map((item, index) => (
                <div
                  key={item}
                  style={{
                    opacity: safeInterpolate(frame, [85 + index * 8, 100 + index * 8], [0, 1]),
                    transform: `translateY(${safeInterpolate(frame, [85 + index * 8, 100 + index * 8], [20, 0])}px)`,
                    padding: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{...TYPOGRAPHY.body, color: '#ffffff', fontWeight: 500}}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 3: Badge collection finale */}
      {sceneVisibility.scene3 > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.scene3,
            transform: `scale(${animations.scene3.entryScale * animations.scene3.pulse})`
          }}>
            <h2 style={{...TYPOGRAPHY.h2, color: '#10b981', margin: '0 0 40px 0'}}>
              Animation Complete
            </h2>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '16px'
            }}>
              {badges.map((badge, index) => (
                <div
                  key={badge}
                  style={{
                    display: 'inline-block',
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: 600,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    borderRadius: '24px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: safeInterpolate(frame, [170 + index * 6, 185 + index * 6], [0, 1]),
                    transform: `translateX(${safeInterpolate(frame, [170 + index * 6, 185 + index * 6], [-30, 0])}px)`,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};