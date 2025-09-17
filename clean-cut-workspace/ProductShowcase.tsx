import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

// Professional typography system
const FONT_STACKS = {
  primary: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
};

const TYPOGRAPHY = {
  display: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '64px',
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em'
  },
  h1: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '48px',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em'
  },
  h2: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '32px',
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
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const
  }
};

const FONT_CONTAINER_STYLES = {
  fontFamily: FONT_STACKS.primary,
  fontDisplay: 'swap' as const,
  WebkitFontSmoothing: 'antialiased' as const,
  MozOsxFontSmoothing: 'grayscale' as const,
  textRendering: 'optimizeLegibility' as const
};

export const ProductShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const totalFrames = 12 * fps; // 12 seconds

  // Safe interpolation with bounds checking
  const safeInterpolate = (frame: number, inputRange: [number, number], outputRange: [number, number], easing?: any) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, { easing });
  };

  // Product data
  const features = [
    { icon: '🚀', title: 'Lightning Fast', desc: 'Optimized for peak performance' },
    { icon: '🔒', title: 'Secure', desc: 'Enterprise-grade security' },
    { icon: '📱', title: 'Mobile Ready', desc: 'Works on any device' },
    { icon: '⚡', title: 'Real-time', desc: 'Instant updates and sync' }
  ];

  const benefits = ['Increase productivity by 300%', 'Reduce costs significantly', 'Scale effortlessly', 'Love your workflow'];

  // Background gradient animation
  const bgHue1 = safeInterpolate(frame, [0, totalFrames], [240, 280], Easing.inOut(Easing.ease));
  const bgHue2 = safeInterpolate(frame, [0, totalFrames], [200, 320], Easing.inOut(Easing.ease));

  // Overlapping scene animations with 15-frame overlaps
  const animations = {
    // Scene 1: Hero intro (0-100 frames)
    hero: {
      opacity: safeInterpolate(frame, [0, 25], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [85, 100], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [0, 25], [50, 0], Easing.out(Easing.cubic)),
      exitY: safeInterpolate(frame, [85, 100], [0, -30], Easing.in(Easing.cubic)),
      scale: safeInterpolate(frame, [0, 25], [0.9, 1], Easing.out(Easing.cubic))
    },
    // Scene 2: Features grid (85-200 frames) - overlaps with scene 1
    features: {
      opacity: safeInterpolate(frame, [85, 110], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [185, 200], [1, 0], Easing.in(Easing.cubic)),
      entryX: safeInterpolate(frame, [85, 110], [60, 0], Easing.out(Easing.cubic)),
      exitX: safeInterpolate(frame, [185, 200], [0, -80], Easing.in(Easing.cubic))
    },
    // Scene 3: Benefits list (185-285 frames) - overlaps with scene 2
    benefits: {
      opacity: safeInterpolate(frame, [185, 210], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [270, 285], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [185, 210], [40, 0], Easing.out(Easing.cubic)),
      exitScale: safeInterpolate(frame, [270, 285], [1, 1.1], Easing.in(Easing.cubic))
    },
    // Scene 4: CTA finale (270-360 frames) - overlaps with scene 3
    cta: {
      opacity: safeInterpolate(frame, [270, 295], [0, 1], Easing.out(Easing.cubic)),
      entryScale: safeInterpolate(frame, [270, 295], [0.8, 1], Easing.out(Easing.cubic)),
      pulse: Math.sin((frame - 270) * 0.3) * 0.05 + 1
    }
  };

  // Calculate scene visibility
  const sceneVisibility = {
    hero: animations.hero.opacity,
    features: animations.features.opacity,
    benefits: animations.benefits.opacity,
    cta: animations.cta.opacity
  };

  // Container styles
  const containerStyles = {
    ...FONT_CONTAINER_STYLES,
    width: '100%',
    height: '100%',
    background: `linear-gradient(135deg, hsl(${bgHue1}, 45%, 12%) 0%, hsl(${bgHue2}, 45%, 20%) 100%)`,
    overflow: 'hidden'
  };

  const contentStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '1200px',
    textAlign: 'center' as const,
    padding: '40px'
  };

  return (
    <AbsoluteFill style={containerStyles}>
      {/* Background particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            left: `${Math.sin(i) * 40 + 50}%`,
            top: `${Math.cos(i) * 30 + 50}%`,
            transform: `translateY(${safeInterpolate(frame, [0, totalFrames], [0, -100 - i * 5])}px)`,
            opacity: safeInterpolate(frame, [i * 10, i * 10 + 60], [0, 1]) * 
                     safeInterpolate(frame, [totalFrames - 60, totalFrames], [1, 0])
          }}
        />
      ))}

      {/* Scene 1: Hero Section */}
      {sceneVisibility.hero > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.hero,
            transform: `translateY(${animations.hero.entryY + animations.hero.exitY}px) scale(${animations.hero.scale})`
          }}>
            <div style={{
              ...TYPOGRAPHY.badge,
              color: '#a78bfa',
              backgroundColor: 'rgba(167, 139, 250, 0.1)',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              borderRadius: '24px',
              padding: '12px 24px',
              display: 'inline-block',
              marginBottom: '32px',
              opacity: safeInterpolate(frame, [15, 40], [0, 1])
            }}>
              New Product Launch
            </div>
            
            <h1 style={{
              ...TYPOGRAPHY.display,
              color: '#ffffff',
              margin: '0 0 24px 0',
              opacity: safeInterpolate(frame, [20, 45], [0, 1]),
              transform: `translateY(${safeInterpolate(frame, [20, 45], [20, 0])}px)`
            }}>
              Revolutionary
              <br />
              <span style={{ color: '#a78bfa' }}>Innovation</span>
            </h1>
            
            <p style={{
              ...TYPOGRAPHY.body,
              color: '#e5e5e5',
              maxWidth: '600px',
              margin: '0 auto',
              opacity: safeInterpolate(frame, [25, 50], [0, 1]),
              transform: `translateY(${safeInterpolate(frame, [25, 50], [15, 0])}px)`
            }}>
              Experience the future of productivity with our cutting-edge platform
              designed to transform how you work and collaborate.
            </p>
          </div>
        </div>
      )}

      {/* Scene 2: Features Grid */}
      {sceneVisibility.features > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.features,
            transform: `translateX(${animations.features.entryX + animations.features.exitX}px)`
          }}>
            <h2 style={{
              ...TYPOGRAPHY.h1,
              color: '#ffffff',
              marginBottom: '48px',
              opacity: safeInterpolate(frame, [95, 120], [0, 1]),
              transform: `translateY(${safeInterpolate(frame, [95, 120], [30, 0])}px)`
            }}>
              Powerful Features
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '32px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '32px',
                    textAlign: 'left',
                    minHeight: '160px',
                    opacity: safeInterpolate(frame, [105 + index * 8, 125 + index * 8], [0, 1]),
                    transform: `translateY(${safeInterpolate(frame, [105 + index * 8, 125 + index * 8], [25, 0])}px) scale(${safeInterpolate(frame, [105 + index * 8, 125 + index * 8], [0.95, 1])})`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    fontSize: '32px',
                    marginBottom: '16px'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{
                    ...TYPOGRAPHY.h2,
                    color: '#ffffff',
                    margin: '0 0 12px 0'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    ...TYPOGRAPHY.body,
                    color: '#cccccc',
                    margin: 0,
                    fontSize: '16px'
                  }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scene 3: Benefits List */}
      {sceneVisibility.benefits > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.benefits,
            transform: `translateY(${animations.benefits.entryY}px) scale(${animations.benefits.exitScale})`
          }}>
            <h2 style={{
              ...TYPOGRAPHY.h1,
              color: '#ffffff',
              marginBottom: '48px',
              opacity: safeInterpolate(frame, [195, 220], [0, 1])
            }}>
              Why Choose Us?
            </h2>
            
            <div style={{
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {benefits.map((benefit, index) => (
                <div
                  key={benefit}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '20px 0',
                    borderBottom: index < benefits.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    opacity: safeInterpolate(frame, [205 + index * 10, 230 + index * 10], [0, 1]),
                    transform: `translateX(${safeInterpolate(frame, [205 + index * 10, 230 + index * 10], [-30, 0])}px)`
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '20px',
                    fontSize: '14px',
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <p style={{
                    ...TYPOGRAPHY.body,
                    color: '#e5e5e5',
                    margin: 0,
                    textAlign: 'left'
                  }}>
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scene 4: Call to Action */}
      {sceneVisibility.cta > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.cta,
            transform: `scale(${animations.cta.entryScale * animations.cta.pulse})`
          }}>
            <h2 style={{
              ...TYPOGRAPHY.h1,
              color: '#ffffff',
              marginBottom: '32px',
              opacity: safeInterpolate(frame, [280, 305], [0, 1])
            }}>
              Ready to Transform?
            </h2>
            
            <div style={{
              display: 'flex',
              gap: '24px',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginTop: '40px'
            }}>
              <button style={{
                ...TYPOGRAPHY.body,
                backgroundColor: '#a78bfa',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '18px 36px',
                fontWeight: 600,
                fontSize: '18px',
                minHeight: '56px',
                cursor: 'pointer',
                opacity: safeInterpolate(frame, [285, 310], [0, 1]),
                transform: `translateY(${safeInterpolate(frame, [285, 310], [20, 0])}px) scale(${safeInterpolate(frame, [320, 360], [1, 1.05], Easing.inOut(Easing.ease))})`
              }}>
                Start Free Trial
              </button>
              
              <button style={{
                ...TYPOGRAPHY.body,
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                padding: '16px 34px',
                fontWeight: 500,
                fontSize: '18px',
                minHeight: '56px',
                cursor: 'pointer',
                opacity: safeInterpolate(frame, [290, 315], [0, 1]),
                transform: `translateY(${safeInterpolate(frame, [290, 315], [20, 0])}px)`
              }}>
                Watch Demo
              </button>
            </div>
            
            <p style={{
              ...TYPOGRAPHY.body,
              color: '#b3b3b3',
              marginTop: '24px',
              fontSize: '16px',
              opacity: safeInterpolate(frame, [295, 320], [0, 1])
            }}>
              No credit card required • 14-day free trial
            </p>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};