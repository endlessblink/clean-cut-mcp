import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

export const QuickTestAnimation: React.FC = () => {
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

  // Professional typography
  const TYPOGRAPHY = {
    h1: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '48px',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    },
    body: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '18px',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0em'
    },
    badge: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const
    }
  };

  // Overlapping scenes - no empty screen time
  const animations = {
    // Scene 1: Title introduction (0-50 frames, exits at 40)
    scene1: {
      opacity: safeInterpolate(frame, [0, 20], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [40, 50], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [0, 20], [40, 0], Easing.out(Easing.cubic)),
      exitY: safeInterpolate(frame, [40, 50], [0, -30], Easing.in(Easing.cubic))
    },
    // Scene 2: Feature showcase (35-85 frames, overlaps with scene 1)
    scene2: {
      opacity: safeInterpolate(frame, [35, 50], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [75, 85], [1, 0], Easing.in(Easing.cubic)),
      entryScale: safeInterpolate(frame, [35, 50], [0.9, 1], Easing.out(Easing.cubic)),
      exitX: safeInterpolate(frame, [75, 85], [0, -60], Easing.in(Easing.cubic))
    },
    // Scene 3: Final badge (70-90 frames, overlaps with scene 2)
    scene3: {
      opacity: safeInterpolate(frame, [70, 85], [0, 1], Easing.out(Easing.cubic)),
      entryScale: safeInterpolate(frame, [70, 85], [0.8, 1], Easing.out(Easing.cubic))
    }
  };

  // Calculate visibility
  const sceneVisibility = {
    scene1: animations.scene1.opacity,
    scene2: animations.scene2.opacity,
    scene3: animations.scene3.opacity
  };

  // Features for scene 2
  const features = ['Fast', 'Modern', 'Professional'];

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
    >
      {/* Scene 1: Title Introduction */}
      {sceneVisibility.scene1 > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '800px',
            textAlign: 'center',
            opacity: sceneVisibility.scene1,
            transform: `translate(-50%, -50%) translateY(${animations.scene1.entryY + animations.scene1.exitY}px)`
          }}
        >
          <h1 style={{...TYPOGRAPHY.h1, color: '#ffffff', margin: '0 0 24px 0'}}>
            Animation Test
          </h1>
          <p style={{...TYPOGRAPHY.body, color: '#e0e7ff', margin: 0}}>
            Testing clean-cut-mcp tools
          </p>
        </div>
      )}

      {/* Scene 2: Feature Showcase with Staggered Elements */}
      {sceneVisibility.scene2 > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '600px',
            textAlign: 'center',
            opacity: sceneVisibility.scene2,
            transform: `translate(-50%, -50%) translateX(${animations.scene2.exitX}px) scale(${animations.scene2.entryScale})`
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '30px',
              padding: '40px'
            }}
          >
            {features.map((feature, index) => (
              <div
                key={feature}
                style={{
                  opacity: safeInterpolate(frame, [45 + index * 5, 55 + index * 5], [0, 1]),
                  transform: `translateY(${safeInterpolate(frame, [45 + index * 5, 55 + index * 5], [20, 0])}px)`,
                  padding: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{...TYPOGRAPHY.body, color: '#ffffff', fontWeight: 600}}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scene 3: Success Badge */}
      {sceneVisibility.scene3 > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: sceneVisibility.scene3,
            transform: `translate(-50%, -50%) scale(${animations.scene3.entryScale})`
          }}
        >
          <div
            style={{
              padding: '16px 32px',
              backgroundColor: '#10b981',
              borderRadius: '50px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
            }}
          >
            <span style={{...TYPOGRAPHY.badge, color: '#ffffff'}}>
              ✓ Test Complete
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};