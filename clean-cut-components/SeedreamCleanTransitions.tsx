import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

const SeedreamCleanTransitions: React.FC = () => {
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
      lineHeight: 1.3
    },
    h3: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '32px',
      fontWeight: 600,
      lineHeight: 1.4
    },
    body: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '24px',
      fontWeight: 400,
      lineHeight: 1.6
    },
    small: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '20px',
      fontWeight: 500,
      lineHeight: 1.5
    },
    badge: {
      fontFamily: FONT_STACKS.primary,
      fontSize: '22px',
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
  
  // Safe interpolation
  const safeInterpolate = (frame, inputRange, outputRange, easing) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, { easing });
  };
  
  // Image categories
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
  
  // CLEAN SEQUENTIAL TRANSITIONS - NO OVERLAPS
  const SCENE_DURATION = 75; // Each scene lasts 75 frames (2.5 seconds)
  const TRANSITION_DURATION = 15; // Quick transitions between scenes
  
  // Scene timing - COMPLETELY SEQUENTIAL
  const sceneTimings = {
    // Scene 1: 0-75 frames
    title: { start: 0, end: 75 },
    // Transition: 75-90 frames  
    // Scene 2: 90-165 frames
    features: { start: 90, end: 165 },
    // Transition: 165-180 frames
    // Scene 3: 180-255 frames  
    gallery: { start: 180, end: 255 },
    // Transition: 255-270 frames
    // Scene 4: 270-300 frames
    specs: { start: 270, end: 300 }
  };
  
  // Calculate which scene is currently active
  const getCurrentScene = () => {
    if (frame >= sceneTimings.title.start && frame < sceneTimings.title.end) return 'title';
    if (frame >= sceneTimings.features.start && frame < sceneTimings.features.end) return 'features';
    if (frame >= sceneTimings.gallery.start && frame < sceneTimings.gallery.end) return 'gallery';
    if (frame >= sceneTimings.specs.start && frame <= sceneTimings.specs.end) return 'specs';
    return 'transition'; // Between scenes
  };
  
  const currentScene = getCurrentScene();
  
  // Scene animations - ONLY for entry/exit within each scene
  const animations = {
    titleScene: {
      opacity: currentScene === 'title' ? 
        safeInterpolate(frame, [0, 20], [0, 1], Easing.out(Easing.cubic)) : 0,
      entryY: safeInterpolate(frame, [0, 20], [50, 0], Easing.out(Easing.cubic))
    },
    
    featuresScene: {
      opacity: currentScene === 'features' ? 
        safeInterpolate(frame, [90, 110], [0, 1], Easing.out(Easing.cubic)) : 0,
      entryX: safeInterpolate(frame, [90, 110], [60, 0], Easing.out(Easing.cubic))
    },
    
    galleryScene: {
      opacity: currentScene === 'gallery' ? 
        safeInterpolate(frame, [180, 200], [0, 1], Easing.out(Easing.cubic)) : 0,
      entryY: safeInterpolate(frame, [180, 200], [50, 0], Easing.out(Easing.cubic))
    },
    
    specsScene: {
      opacity: currentScene === 'specs' ? 
        safeInterpolate(frame, [270, 290], [0, 1], Easing.out(Easing.cubic)) : 0,
      entryScale: safeInterpolate(frame, [270, 290], [0.8, 1], Easing.out(Easing.cubic))
    }
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
    width: '95%',
    maxWidth: '1400px',
    textAlign: 'center' as const,
    padding: '60px'
  };

  return (
    <AbsoluteFill style={containerStyles}>
      
      {/* Scene 1: Title Introduction - ONLY VISIBLE DURING ITS TIME */}
      {currentScene === 'title' && (
        <div style={centeredContentStyle}>
          <div style={{
            opacity: animations.titleScene.opacity,
            transform: `translateY(${animations.titleScene.entryY}px)`
          }}>
            <div style={{
              ...TYPOGRAPHY.display,
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '40px'
            }}>
              Seedream 4.0
            </div>
            <div style={{
              ...TYPOGRAPHY.h2,
              color: '#e5e5e5',
              marginBottom: '32px'
            }}>
              Visual Generation Max
            </div>
            <div style={{
              ...TYPOGRAPHY.body,
              color: '#b3b3b3',
              marginBottom: '60px',
              maxWidth: '800px',
              margin: '0 auto 60px auto'
            }}>
              The secret to success: Custom RL model framework
            </div>
            <div style={{
              ...TYPOGRAPHY.badge,
              display: 'inline-block',
              padding: '24px 40px',
              background: 'rgba(167, 139, 250, 0.2)',
              border: '3px solid #a78bfa',
              borderRadius: '40px',
              color: '#a78bfa',
              minHeight: '60px'
            }}>
              RewardDance Framework
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 2: Key Features - ONLY VISIBLE DURING ITS TIME */}
      {currentScene === 'features' && (
        <div style={centeredContentStyle}>
          <div style={{
            opacity: animations.featuresScene.opacity,
            transform: `translateX(${animations.featuresScene.entryX}px)`
          }}>
            <div style={{
              ...TYPOGRAPHY.h1,
              color: '#ffffff',
              marginBottom: '80px'
            }}>
              Key Advantages
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '60px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {[
                { title: 'Native 2K Output', subtitle: '(up to 4K)', icon: '🎯' },
                { title: 'Improved Consistency', subtitle: 'Enhanced quality', icon: '⚡' },
                { title: 'Advanced RL Framework', subtitle: 'Custom training', icon: '🧠' },
                { title: 'Visual Generation Max', subtitle: 'Next-gen AI', icon: '✨' }
              ].map((feature, index) => {
                const staggerDelay = 100 + (index * 10);
                const featureOpacity = safeInterpolate(frame, [staggerDelay, staggerDelay + 15], [0, 1], Easing.out(Easing.cubic));
                const featureY = safeInterpolate(frame, [staggerDelay, staggerDelay + 15], [30, 0], Easing.out(Easing.cubic));
                
                return (
                  <div
                    key={feature.title}
                    style={{
                      padding: '60px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '32px',
                      minHeight: '280px',
                      opacity: featureOpacity,
                      transform: `translateY(${featureY}px)`,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div style={{ fontSize: '60px', marginBottom: '32px' }}>{feature.icon}</div>
                    <div style={{
                      ...TYPOGRAPHY.h3,
                      color: '#ffffff',
                      marginBottom: '20px'
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
      
      {/* Scene 3: Image Gallery - ONLY VISIBLE DURING ITS TIME */}
      {currentScene === 'gallery' && (
        <div style={centeredContentStyle}>
          <div style={{
            opacity: animations.galleryScene.opacity,
            transform: `translateY(${animations.galleryScene.entryY}px)`
          }}>
            <div style={{
              ...TYPOGRAPHY.h1,
              color: '#ffffff',
              marginBottom: '80px'
            }}>
              AI Generation Showcase
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '40px',
              maxWidth: '1300px',
              margin: '0 auto'
            }}>
              {imageCategories.map((category, index) => {
                const staggerDelay = 190 + (index * 6);
                const cardOpacity = safeInterpolate(frame, [staggerDelay, staggerDelay + 12], [0, 1], Easing.out(Easing.cubic));
                const cardY = safeInterpolate(frame, [staggerDelay, staggerDelay + 12], [30, 0], Easing.out(Easing.cubic));
                
                return (
                  <div
                    key={category.name}
                    style={{
                      padding: '40px',
                      background: `linear-gradient(135deg, ${category.color}25, ${category.color}15)`,
                      border: `3px solid ${category.color}50`,
                      borderRadius: '20px',
                      minHeight: '220px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: cardOpacity,
                      transform: `translateY(${cardY}px)`,
                      boxShadow: `0 12px 40px ${category.color}25`
                    }}
                  >
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: category.color,
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '60px'
                    }}>
                      <span style={{ fontSize: '28px' }}>🎨</span>
                    </div>
                    <div style={{
                      ...TYPOGRAPHY.small,
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
      
      {/* Scene 4: Technical Specs - ONLY VISIBLE DURING ITS TIME */}
      {currentScene === 'specs' && (
        <div style={centeredContentStyle}>
          <div style={{
            opacity: animations.specsScene.opacity,
            transform: `scale(${animations.specsScene.entryScale})`
          }}>
            <div style={{
              ...TYPOGRAPHY.h1,
              color: '#4ECDC4',
              marginBottom: '60px'
            }}>
              Technical Excellence
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '32px',
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
                const badgeDelay = 280 + (index * 4);
                const badgeOpacity = safeInterpolate(frame, [badgeDelay, badgeDelay + 8], [0, 1], Easing.out(Easing.cubic));
                const badgeX = safeInterpolate(frame, [badgeDelay, badgeDelay + 8], [-20, 0], Easing.out(Easing.cubic));
                
                return (
                  <div
                    key={spec}
                    style={{
                      ...TYPOGRAPHY.badge,
                      padding: '24px 36px',
                      background: 'rgba(78, 205, 196, 0.25)',
                      border: '3px solid #4ECDC4',
                      borderRadius: '40px',
                      color: '#4ECDC4',
                      minHeight: '60px',
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

export { SeedreamCleanTransitions };