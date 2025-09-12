import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Sequence } from 'remotion';

const SeedreamAIShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Professional typography following guidelines
  const FONT_STACKS = {
    primary: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  };
  
  const TYPOGRAPHY = {
    display: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '56px',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.02em'
    },
    h1: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '42px',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    },
    h2: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '28px',
      fontWeight: 600,
      lineHeight: 1.3
    },
    body: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '18px',
      fontWeight: 400,
      lineHeight: 1.6
    },
    small: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.5
    },
    badge: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '14px',
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
    { name: 'Portraits', examples: ['Professional headshots', 'Character designs'], color: '#FF6B6B' },
    { name: 'Landscapes', examples: ['Nature scenes', 'Cityscapes'], color: '#4ECDC4' },
    { name: 'Architecture', examples: ['Buildings', 'Interiors'], color: '#45B7D1' },
    { name: 'Abstract Art', examples: ['Digital art', 'Patterns'], color: '#96CEB4' },
    { name: 'Products', examples: ['Commercial shots', '3D renders'], color: '#FFEAA7' },
    { name: 'Lifestyle', examples: ['Food & dining', 'Daily life'], color: '#DDA0DD' },
    { name: 'Technology', examples: ['Gadgets', 'Futuristic'], color: '#20B2AA' },
    { name: 'Fashion', examples: ['Clothing', 'Accessories'], color: '#F4A460' }
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
    maxWidth: '1000px',
    textAlign: 'center' as const,
    padding: '40px'
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
              ...TYPOGRAPHY.display,
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '24px'
            }}>
              Seedream 4.0
            </div>
            <div style={{
              ...TYPOGRAPHY.h2,
              color: '#e5e5e5',
              marginBottom: '16px'
            }}>
              Visual Generation Max
            </div>
            <div style={{
              ...TYPOGRAPHY.body,
              color: '#b3b3b3',
              marginBottom: '32px'
            }}>
              The secret to success: Custom RL model framework
            </div>
            <div style={{
              ...TYPOGRAPHY.badge,
              display: 'inline-block',
              padding: '12px 24px',
              background: 'rgba(167, 139, 250, 0.2)',
              border: '2px solid #a78bfa',
              borderRadius: '24px',
              color: '#a78bfa'
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
              ...TYPOGRAPHY.h1,
              color: '#ffffff',
              marginBottom: '40px'
            }}>
              Key Advantages
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
              maxWidth: '800px',
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
                      padding: '32px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      minHeight: '120px',
                      opacity: featureOpacity,
                      transform: `translateY(${featureY}px)`,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>{feature.icon}</div>
                    <div style={{
                      ...TYPOGRAPHY.h2,
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      {feature.title}
                    </div>
                    <div style={{
                      ...TYPOGRAPHY.body,
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
              ...TYPOGRAPHY.h1,
              color: '#ffffff',
              marginBottom: '40px'
            }}>
              AI Generation Showcase
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              maxWidth: '900px',
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
                      padding: '20px',
                      background: `linear-gradient(135deg, ${category.color}20, ${category.color}10)`,
                      border: `2px solid ${category.color}40`,
                      borderRadius: '12px',
                      minHeight: '140px',
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
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: category.color,
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '16px' }}>🎨</span>
                    </div>
                    <div style={{
                      ...TYPOGRAPHY.small,
                      color: '#ffffff',
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}>
                      {category.name}
                    </div>
                    {category.examples.map((example, exampleIndex) => (
                      <div key={example} style={{
                        ...TYPOGRAPHY.badge,
                        color: '#cccccc',
                        fontSize: '11px',
                        opacity: 0.8,
                        lineHeight: '1.2'
                      }}>
                        {example}
                      </div>
                    ))}
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
              ...TYPOGRAPHY.h1,
              color: '#4ECDC4',
              marginBottom: '32px'
            }}>
              Technical Excellence
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '40px'
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
                      ...TYPOGRAPHY.badge,
                      padding: '16px 24px',
                      background: 'rgba(78, 205, 196, 0.2)',
                      border: '2px solid #4ECDC4',
                      borderRadius: '24px',
                      color: '#4ECDC4',
                      minHeight: '44px',
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
              ...TYPOGRAPHY.body,
              color: '#e5e5e5',
              maxWidth: '600px',
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
              width: 3,
              height: 3,
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

export { SeedreamAIShowcase };