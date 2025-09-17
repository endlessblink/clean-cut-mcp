import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

const SeedreamProfessional: React.FC = () => {
  const frame = useCurrentFrame();
  
  // MUCH LARGER typography - following guidelines STRICTLY
  const FONT_STACKS = {
    primary: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  };
  
  const TYPOGRAPHY = {
    display: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '96px', // MUCH LARGER - was 72px
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.02em'
    },
    h1: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '64px', // MUCH LARGER - was 48px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    },
    h2: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '48px', // MUCH LARGER - was 36px
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '32px', // MUCH LARGER - was 24px
      fontWeight: 600,
      lineHeight: 1.4
    },
    body: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '24px', // MUCH LARGER - was 18px
      fontWeight: 400,
      lineHeight: 1.6
    },
    small: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '20px', // MUCH LARGER - was 16px
      fontWeight: 500,
      lineHeight: 1.5
    },
    badge: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '22px', // MUCH LARGER - was 18px
      fontWeight: 600,
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
  
  // Safe interpolation with bounds checking
  const safeInterpolate = (frame, inputRange, outputRange, easing) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, { easing });
  };
  
  // AI-generated image categories
  const imageCategories = [
    { name: 'Portraits', color: '#FF6B6B' },
    { name: 'Landscapes', color: '#4ECDC4' },
    { name: 'Architecture', color: '#45B7D1' },
    { name: 'Abstract Art', color: '#96CEB4' },
    { name: 'Products', color: '#FFEAA7' },
    { name: 'Lifestyle', color: '#DDA0DD' },
    { name: 'Technology', color: '#20B2AA' },
    { name: 'Fashion', color: '#F4A460' }
  ];
  
  // MUCH SMOOTHER overlapping scene animations with LONGER transitions
  const animations = {
    // Scene 1: Title introduction (0-120 frames) - LONGER duration
    titleScene: {
      opacity: safeInterpolate(frame, [0, 30], [0, 1], Easing.out(Easing.cubic)) * 
                safeInterpolate(frame, [90, 120], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [0, 30], [60, 0], Easing.out(Easing.cubic)),
      exitY: safeInterpolate(frame, [90, 120], [0, -40], Easing.in(Easing.cubic)),
      scale: safeInterpolate(frame, [0, 30], [0.85, 1], Easing.out(Easing.cubic))
    },
    
    // Scene 2: Feature showcase (105-195 frames) - LONGER overlap
    featuresScene: {
      opacity: safeInterpolate(frame, [105, 135], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [165, 195], [1, 0], Easing.in(Easing.cubic)),
      entryX: safeInterpolate(frame, [105, 135], [80, 0], Easing.out(Easing.cubic)),
      exitX: safeInterpolate(frame, [165, 195], [0, -80], Easing.in(Easing.cubic)),
      scale: safeInterpolate(frame, [105, 135], [0.9, 1], Easing.out(Easing.cubic))
    },
    
    // Scene 3: Image gallery showcase (180-270 frames) - LONGER overlap
    galleryScene: {
      opacity: safeInterpolate(frame, [180, 210], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [240, 270], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [180, 210], [70, 0], Easing.out(Easing.cubic)),
      exitScale: safeInterpolate(frame, [240, 270], [1, 0.7], Easing.in(Easing.cubic)),
      scale: safeInterpolate(frame, [180, 210], [0.8, 1], Easing.out(Easing.cubic))
    },
    
    // Scene 4: Technical specs (255-300 frames) - LONGER overlap
    specsScene: {
      opacity: safeInterpolate(frame, [255, 285], [0, 1], Easing.out(Easing.cubic)),
      entryScale: safeInterpolate(frame, [255, 285], [0.7, 1], Easing.out(Easing.cubic)),
      entryY: safeInterpolate(frame, [255, 285], [50, 0], Easing.out(Easing.cubic))
    }
  };
  
  // Calculate scene visibility
  const sceneVisibility = {
    title: animations.titleScene.opacity,
    features: animations.featuresScene.opacity,
    gallery: animations.galleryScene.opacity,
    specs: animations.specsScene.opacity
  };
  
  const containerStyles = {
    ...FONT_CONTAINER_STYLES,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    overflow: 'hidden'
  };
  
  const centeredContentStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '95%', // WIDER
    maxWidth: '1400px', // MUCH LARGER container
    textAlign: 'center' as const,
    padding: '60px' // GENEROUS padding
  };

  return (
    <AbsoluteFill style={containerStyles}>
      
      {/* Scene 1: Title Introduction */}
      {sceneVisibility.title > 0.01 && (
        <div style={centeredContentStyle}>
          <div style={{
            opacity: sceneVisibility.title,
            transform: `translateY(${animations.titleScene.entryY + animations.titleScene.exitY}px) scale(${animations.titleScene.scale})`
          }}>
            <div style={{
              ...TYPOGRAPHY.display, // 96px font size - HUGE
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '40px'
            }}>
              Seedream 4.0
            </div>
            <div style={{
              ...TYPOGRAPHY.h2, // 48px font size
              color: '#e5e5e5',
              marginBottom: '32px'
            }}>
              Visual Generation Max
            </div>
            <div style={{
              ...TYPOGRAPHY.body, // 24px font size - LARGE
              color: '#b3b3b3',
              marginBottom: '60px',
              maxWidth: '800px',
              margin: '0 auto 60px auto'
            }}>
              The secret to success: Custom RL model framework
            </div>
            <div style={{
              ...TYPOGRAPHY.badge, // 22px font size
              display: 'inline-block',
              padding: '24px 40px', // MUCH LARGER padding
              background: 'rgba(167, 139, 250, 0.2)',
              border: '3px solid #a78bfa',
              borderRadius: '40px',
              color: '#a78bfa',
              minHeight: '60px' // LARGER touch target
            }}>
              RewardDance Framework
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 2: Key Features */}
      {sceneVisibility.features > 0.01 && (
        <div style={centeredContentStyle}>
          <div style={{
            opacity: sceneVisibility.features,
            transform: `translateX(${animations.featuresScene.entryX + animations.featuresScene.exitX}px) scale(${animations.featuresScene.scale})`
          }}>
            <div style={{
              ...TYPOGRAPHY.h1, // 64px font size - HUGE
              color: '#ffffff',
              marginBottom: '80px'
            }}>
              Key Advantages
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr', // EXPLICIT columns
              gap: '60px', // MUCH LARGER gaps
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {[
                { title: 'Native 2K Output', subtitle: '(up to 4K)', icon: '🎯' },
                { title: 'Improved Consistency', subtitle: 'Enhanced quality', icon: '⚡' },
                { title: 'Advanced RL Framework', subtitle: 'Custom training', icon: '🧠' },
                { title: 'Visual Generation Max', subtitle: 'Next-gen AI', icon: '✨' }
              ].map((feature, index) => {
                // SMOOTHER stagger with LONGER delays
                const staggerDelay = 115 + (index * 12);
                const featureOpacity = safeInterpolate(frame, [staggerDelay, staggerDelay + 20], [0, 1], Easing.out(Easing.cubic));
                const featureY = safeInterpolate(frame, [staggerDelay, staggerDelay + 20], [30, 0], Easing.out(Easing.cubic));
                const featureScale = safeInterpolate(frame, [staggerDelay, staggerDelay + 20], [0.9, 1], Easing.out(Easing.cubic));
                
                return (
                  <div
                    key={feature.title}
                    style={{
                      padding: '60px', // MASSIVE padding
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '32px',
                      minHeight: '280px', // HUGE cards
                      opacity: featureOpacity,
                      transform: `translateY(${featureY}px) scale(${featureScale})`,
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontSize: '60px', marginBottom: '32px' }}>{feature.icon}</div>
                    <div style={{
                      ...TYPOGRAPHY.h3, // 32px font size - LARGE
                      color: '#ffffff',
                      marginBottom: '20px'
                    }}>
                      {feature.title}
                    </div>
                    <div style={{
                      ...TYPOGRAPHY.body, // 24px font size - LARGE
                      color: '#b3b3b3'
                    }}>
                      {feature.subtitle}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 3: Image Gallery Showcase */}
      {sceneVisibility.gallery > 0.01 && (
        <div style={centeredContentStyle}>
          <div style={{
            opacity: sceneVisibility.gallery,
            transform: `translateY(${animations.galleryScene.entryY}px) scale(${animations.galleryScene.scale * animations.galleryScene.exitScale})`
          }}>
            <div style={{
              ...TYPOGRAPHY.h1, // 64px font size - HUGE
              color: '#ffffff',
              marginBottom: '80px'
            }}>
              AI Generation Showcase
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)', // EXPLICIT columns
              gap: '40px', // LARGER gaps
              maxWidth: '1300px',
              margin: '0 auto'
            }}>
              {imageCategories.map((category, index) => {
                // MUCH SMOOTHER stagger
                const staggerDelay = 190 + (index * 8);
                const cardOpacity = safeInterpolate(frame, [staggerDelay, staggerDelay + 18], [0, 1], Easing.out(Easing.cubic));
                const cardScale = safeInterpolate(frame, [staggerDelay, staggerDelay + 18], [0.7, 1], Easing.out(Easing.cubic));
                const cardY = safeInterpolate(frame, [staggerDelay, staggerDelay + 18], [40, 0], Easing.out(Easing.cubic));
                
                return (
                  <div
                    key={category.name}
                    style={{
                      padding: '40px', // LARGER padding
                      background: `linear-gradient(135deg, ${category.color}25, ${category.color}15)`,
                      border: `3px solid ${category.color}50`,
                      borderRadius: '20px',
                      minHeight: '220px', // HUGE cards
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: cardOpacity,
                      transform: `scale(${cardScale}) translateY(${cardY}px)`,
                      boxShadow: `0 12px 40px ${category.color}25`,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Subtle shine effect */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: -100,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                      transform: `translateX(${safeInterpolate(frame, [staggerDelay + 20, staggerDelay + 50], [0, 250])}px)`
                    }} />
                    
                    <div style={{
                      width: '60px', // MUCH LARGER icons
                      height: '60px',
                      borderRadius: '50%',
                      background: category.color,
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '60px' // LARGE touch target
                    }}>
                      <span style={{ fontSize: '28px' }}>🎨</span>
                    </div>
                    <div style={{
                      ...TYPOGRAPHY.small, // 20px font size - MUCH LARGER
                      color: '#ffffff',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}>
                      {category.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 4: Technical Specifications */}
      {sceneVisibility.specs > 0.01 && (
        <div style={centeredContentStyle}>
          <div style={{
            opacity: sceneVisibility.specs,
            transform: `scale(${animations.specsScene.entryScale}) translateY(${animations.specsScene.entryY}px)`
          }}>
            <div style={{
              ...TYPOGRAPHY.h1, // 64px font size - HUGE
              color: '#4ECDC4',
              marginBottom: '60px'
            }}>
              Technical Excellence
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '32px', // LARGER gaps
              marginBottom: '80px',
              maxWidth: '1200px',
              margin: '0 auto 80px auto'
            }}>
              {[
                'Native 2K Resolution',
                'Up to 4K Output',
                'Custom RL Framework',
                'RewardDance Technology',
                'Visual Generation Max',
                'Improved Consistency'
              ].map((spec, index) => {
                // SMOOTHER badge animations
                const badgeDelay = 265 + (index * 6);
                const badgeOpacity = safeInterpolate(frame, [badgeDelay, badgeDelay + 15], [0, 1], Easing.out(Easing.cubic));
                const badgeX = safeInterpolate(frame, [badgeDelay, badgeDelay + 15], [-30, 0], Easing.out(Easing.cubic));
                const badgeScale = safeInterpolate(frame, [badgeDelay, badgeDelay + 15], [0.8, 1], Easing.out(Easing.cubic));
                
                return (
                  <div
                    key={spec}
                    style={{
                      ...TYPOGRAPHY.badge, // 22px font size
                      padding: '24px 36px', // MUCH LARGER padding
                      background: 'rgba(78, 205, 196, 0.25)',
                      border: '3px solid #4ECDC4',
                      borderRadius: '40px',
                      color: '#4ECDC4',
                      minHeight: '60px', // LARGE touch target
                      display: 'flex',
                      alignItems: 'center',
                      opacity: badgeOpacity,
                      transform: `translateX(${badgeX}px) scale(${badgeScale})`
                    }}
                  >
                    {spec}
                  </div>
                );
              })}
            </div>
            <div style={{
              ...TYPOGRAPHY.body, // 24px font size - LARGE
              color: '#e5e5e5',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              Powered by ByteDance's advanced machine learning infrastructure
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export { SeedreamProfessional };