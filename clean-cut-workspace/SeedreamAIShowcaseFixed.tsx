import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

const SeedreamAIShowcaseFixed: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Professional typography following guidelines - PROPER SIZES
  const FONT_STACKS = {
    primary: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  };
  
  const TYPOGRAPHY = {
    display: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '72px', // LARGE as per guidelines
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.02em'
    },
    h1: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '48px', // PROPER SIZE
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    },
    h2: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '36px', // PROPER SIZE
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '24px', // MINIMUM as per guidelines
      fontWeight: 600,
      lineHeight: 1.4
    },
    body: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '18px', // PROPER SIZE
      fontWeight: 400,
      lineHeight: 1.6
    },
    small: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '16px', // MINIMUM as per guidelines
      fontWeight: 500,
      lineHeight: 1.5
    },
    badge: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '18px', // 18px MINIMUM for badges
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
  
  // AI-generated image categories with sample data
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
  
  // Overlapping scene animations (following 15-frame overlap rule)
  const animations = {
    // Scene 1: Title introduction (0-90 frames)
    titleScene: {
      opacity: safeInterpolate(frame, [0, 20], [0, 1], Easing.out(Easing.cubic)) * 
                safeInterpolate(frame, [75, 90], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [0, 20], [40, 0], Easing.out(Easing.cubic)),
      exitY: safeInterpolate(frame, [75, 90], [0, -30], Easing.in(Easing.cubic)),
      scale: safeInterpolate(frame, [0, 20], [0.9, 1], Easing.out(Easing.cubic))
    },
    
    // Scene 2: Feature showcase (75-165 frames, 15-frame overlap)
    featuresScene: {
      opacity: safeInterpolate(frame, [75, 95], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [150, 165], [1, 0], Easing.in(Easing.cubic)),
      entryX: safeInterpolate(frame, [75, 95], [60, 0], Easing.out(Easing.cubic)),
      exitX: safeInterpolate(frame, [150, 165], [0, -60], Easing.in(Easing.cubic))
    },
    
    // Scene 3: Image gallery showcase (150-240 frames, 15-frame overlap)
    galleryScene: {
      opacity: safeInterpolate(frame, [150, 170], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [225, 240], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [150, 170], [50, 0], Easing.out(Easing.cubic)),
      exitScale: safeInterpolate(frame, [225, 240], [1, 0.8], Easing.in(Easing.cubic))
    },
    
    // Scene 4: Technical specs (225-300 frames, 15-frame overlap)
    specsScene: {
      opacity: safeInterpolate(frame, [225, 245], [0, 1], Easing.out(Easing.cubic)),
      entryScale: safeInterpolate(frame, [225, 245], [0.8, 1], Easing.out(Easing.cubic))
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
    width: '90%',
    maxWidth: '1200px', // LARGER container
    textAlign: 'center' as const,
    padding: '80px' // LARGER padding (minimum 40px, using 80px)
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
              ...TYPOGRAPHY.display, // 72px font size
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '32px'
            }}>
              Seedream 4.0
            </div>
            <div style={{
              ...TYPOGRAPHY.h2, // 36px font size
              color: '#e5e5e5',
              marginBottom: '24px'
            }}>
              Visual Generation Max
            </div>
            <div style={{
              ...TYPOGRAPHY.body, // 18px font size
              color: '#b3b3b3',
              marginBottom: '48px'
            }}>
              The secret to success: Custom RL model framework
            </div>
            <div style={{
              ...TYPOGRAPHY.badge, // 18px font size for badges
              display: 'inline-block',
              padding: '20px 32px', // LARGER padding
              background: 'rgba(167, 139, 250, 0.2)',
              border: '2px solid #a78bfa',
              borderRadius: '32px',
              color: '#a78bfa',
              minHeight: '44px' // MINIMUM touch target
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
            transform: `translateX(${animations.featuresScene.entryX + animations.featuresScene.exitX}px)`
          }}>
            <div style={{
              ...TYPOGRAPHY.h1, // 48px font size
              color: '#ffffff',
              marginBottom: '60px'
            }}>
              Key Advantages
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr', // EXPLICIT columns
              gap: '48px', // LARGER gaps
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {[
                { title: 'Native 2K Output', subtitle: '(up to 4K)', icon: '🎯' },
                { title: 'Improved Consistency', subtitle: 'Enhanced quality', icon: '⚡' },
                { title: 'Advanced RL Framework', subtitle: 'Custom training', icon: '🧠' },
                { title: 'Visual Generation Max', subtitle: 'Next-gen AI', icon: '✨' }
              ].map((feature, index) => {
                const staggerDelay = 85 + (index * 8);
                const featureOpacity = safeInterpolate(frame, [staggerDelay, staggerDelay + 15], [0, 1]);
                const featureY = safeInterpolate(frame, [staggerDelay, staggerDelay + 15], [20, 0]);
                
                return (
                  <div
                    key={feature.title}
                    style={{
                      padding: '48px', // LARGER padding
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '24px',
                      minHeight: '200px', // MUCH LARGER cards
                      opacity: featureOpacity,
                      transform: `translateY(${featureY}px)`,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '24px' }}>{feature.icon}</div>
                    <div style={{
                      ...TYPOGRAPHY.h3, // 24px font size
                      color: '#ffffff',
                      marginBottom: '16px'
                    }}>
                      {feature.title}
                    </div>
                    <div style={{
                      ...TYPOGRAPHY.body, // 18px font size
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
            transform: `translateY(${animations.galleryScene.entryY}px) scale(${animations.galleryScene.exitScale})`
          }}>
            <div style={{
              ...TYPOGRAPHY.h1, // 48px font size
              color: '#ffffff',
              marginBottom: '60px'
            }}>
              AI Generation Showcase
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)', // EXPLICIT columns
              gap: '32px', // LARGER gaps
              maxWidth: '1100px',
              margin: '0 auto'
            }}>
              {imageCategories.map((category, index) => {
                const staggerDelay = 160 + (index * 6);
                const cardOpacity = safeInterpolate(frame, [staggerDelay, staggerDelay + 12], [0, 1]);
                const cardScale = safeInterpolate(frame, [staggerDelay, staggerDelay + 12], [0.8, 1]);
                
                return (
                  <div
                    key={category.name}
                    style={{
                      padding: '32px', // LARGER padding
                      background: `linear-gradient(135deg, ${category.color}20, ${category.color}10)`,
                      border: `2px solid ${category.color}40`,
                      borderRadius: '16px',
                      minHeight: '180px', // MUCH LARGER cards
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: cardOpacity,
                      transform: `scale(${cardScale})`,
                      boxShadow: `0 8px 32px ${category.color}20`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Subtle shine effect */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: -100,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                      transform: `translateX(${safeInterpolate(frame, [staggerDelay + 15, staggerDelay + 35], [0, 200])}px)`
                    }} />
                    
                    <div style={{
                      width: '48px', // LARGER icons
                      height: '48px',
                      borderRadius: '50%',
                      background: category.color,
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '44px' // MINIMUM touch target
                    }}>
                      <span style={{ fontSize: '24px' }}>🎨</span>
                    </div>
                    <div style={{
                      ...TYPOGRAPHY.small, // 16px font size - MINIMUM
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
            transform: `scale(${animations.specsScene.entryScale})`
          }}>
            <div style={{
              ...TYPOGRAPHY.h1, // 48px font size
              color: '#4ECDC4',
              marginBottom: '48px'
            }}>
              Technical Excellence
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '24px', // LARGER gaps
              marginBottom: '60px'
            }}>
              {[
                'Native 2K Resolution',
                'Up to 4K Output',
                'Custom RL Framework',
                'RewardDance Technology',
                'Visual Generation Max',
                'Improved Consistency'
              ].map((spec, index) => {
                const badgeDelay = 235 + (index * 4);
                const badgeOpacity = safeInterpolate(frame, [badgeDelay, badgeDelay + 10], [0, 1]);
                const badgeX = safeInterpolate(frame, [badgeDelay, badgeDelay + 10], [-20, 0]);
                
                return (
                  <div
                    key={spec}
                    style={{
                      ...TYPOGRAPHY.badge, // 18px font size for badges
                      padding: '20px 32px', // LARGER padding
                      background: 'rgba(78, 205, 196, 0.2)',
                      border: '2px solid #4ECDC4',
                      borderRadius: '32px',
                      color: '#4ECDC4',
                      minHeight: '44px', // MINIMUM touch target
                      display: 'flex',
                      alignItems: 'center',
                      opacity: badgeOpacity,
                      transform: `translateX(${badgeX}px)`
                    }}
                  >
                    {spec}
                  </div>
                );
              })}
            </div>
            <div style={{
              ...TYPOGRAPHY.body, // 18px font size
              color: '#e5e5e5',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              Powered by ByteDance's advanced machine learning infrastructure
            </div>
          </div>
        </div>
      )}
      
      {/* Floating background particles */}
      {Array.from({ length: 12 }, (_, i) => {
        const particleDelay = i * 8;
        const particleOpacity = safeInterpolate(frame, [particleDelay, particleDelay + 40, particleDelay + 120, particleDelay + 160], [0, 0.6, 0.6, 0]);
        const particleY = safeInterpolate(frame, [particleDelay, particleDelay + 160], [110, -10]);
        const particleX = safeInterpolate(frame, [particleDelay, particleDelay + 160], [0, (i % 2 === 0 ? 15 : -15)]);
        
        return (
          <div
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              left: `${(i * 11 + 10) % 90 + 5}%`,
              top: `${particleY}%`,
              width: 4, // Slightly larger particles
              height: 4,
              borderRadius: '50%',
              background: '#4ECDC4',
              opacity: particleOpacity,
              transform: `translateX(${particleX}px)`,
              boxShadow: '0 0 8px #4ECDC4'
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export { SeedreamAIShowcaseFixed };