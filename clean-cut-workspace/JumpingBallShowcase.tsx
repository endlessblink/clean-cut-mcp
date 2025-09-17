import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

export const JumpingBallShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  
  // Professional font stack
  const FONT_CONTAINER_STYLES = {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    fontDisplay: 'swap' as const,
    WebkitFontSmoothing: 'antialiased' as const,
    MozOsxFontSmoothing: 'grayscale' as const,
    textRendering: 'optimizeLegibility' as const
  };

  const TYPOGRAPHY = {
    h1: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, sans-serif',
      fontSize: '48px',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    },
    body: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, sans-serif',
      fontSize: '20px',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0em'
    }
  };
  
  // Safe interpolation with bounds checking
  const safeInterpolate = (frame: number, inputRange: [number, number], outputRange: [number, number], easing?: any) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, { easing });
  };
  
  // Overlapping scenes with no empty screen time
  const animations = {
    intro: {
      opacity: safeInterpolate(frame, [0, 20], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [50, 65], [1, 0], Easing.in(Easing.cubic)),
      titleY: safeInterpolate(frame, [0, 20], [30, 0], Easing.out(Easing.cubic)),
      titleScale: safeInterpolate(frame, [0, 20], [0.9, 1], Easing.out(Easing.cubic))
    },
    ballScene: {
      opacity: safeInterpolate(frame, [50, 70], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [180, 195], [1, 0], Easing.in(Easing.cubic))
    },
    outro: {
      opacity: safeInterpolate(frame, [180, 200], [0, 1], Easing.out(Easing.cubic)),
      scale: safeInterpolate(frame, [180, 200], [0.8, 1], Easing.out(Easing.cubic))
    }
  };
  
  // Ball physics - realistic bouncing with decay
  const ballStartFrame = 70;
  const ballDuration = 110;
  const relativeFrame = Math.max(0, frame - ballStartFrame);
  
  // Multiple bounce cycles with decreasing amplitude
  const bounceSpeed = 0.4; // Controls bounce frequency
  const gravity = 0.8; // Controls fall speed
  const damping = 0.85; // Energy loss per bounce
  
  let ballY = 0;
  let ballScale = 1;
  
  if (relativeFrame <= ballDuration) {
    // Create multiple bounces with decreasing height
    const bounceCount = 4;
    const cycleDuration = ballDuration / bounceCount;
    
    for (let i = 0; i < bounceCount; i++) {
      const cycleStart = i * cycleDuration;
      const cycleEnd = (i + 1) * cycleDuration;
      
      if (relativeFrame >= cycleStart && relativeFrame <= cycleEnd) {
        const cycleFrame = relativeFrame - cycleStart;
        const cycleProgress = cycleFrame / cycleDuration;
        
        // Height decreases with each bounce
        const maxHeight = 200 * Math.pow(damping, i);
        
        // Parabolic motion with spring physics
        const parabola = 4 * cycleProgress * (1 - cycleProgress);
        ballY = -maxHeight * parabola;
        
        // Squash and stretch effect
        const impactThreshold = 0.9;
        if (cycleProgress > impactThreshold) {
          const impactIntensity = (cycleProgress - impactThreshold) / (1 - impactThreshold);
          ballScale = 1 + impactIntensity * 0.3; // Horizontal stretch on impact
        } else {
          ballScale = 1 - Math.abs(0.5 - cycleProgress) * 0.15; // Vertical stretch during flight
        }
        break;
      }
    }
  }
  
  // Ball color animation
  const ballHue = safeInterpolate(relativeFrame, [0, ballDuration], [220, 300]);
  
  // Calculate scene visibility
  const sceneVisibility = {
    intro: animations.intro.opacity,
    ballScene: animations.ballScene.opacity,
    outro: animations.outro.opacity
  };
  
  const containerStyles = {
    ...FONT_CONTAINER_STYLES,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    overflow: 'hidden'
  };
  
  const centeredContentStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '800px',
    textAlign: 'center' as const
  };
  
  return (
    <AbsoluteFill style={containerStyles}>
      {/* Intro Scene */}
      {sceneVisibility.intro > 0.01 && (
        <div style={centeredContentStyle}>
          <div style={{
            opacity: sceneVisibility.intro,
            transform: `translateY(${animations.intro.titleY}px) scale(${animations.intro.titleScale})`
          }}>
            <h1 style={{...TYPOGRAPHY.h1, color: '#ffffff', margin: '0 0 24px 0'}}>
              Jumping Ball
            </h1>
            <p style={{...TYPOGRAPHY.body, color: '#cbd5e1', margin: 0}}>
              Watch the physics in action
            </p>
          </div>
        </div>
      )}
      
      {/* Ball Animation Scene */}
      {sceneVisibility.ballScene > 0.01 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          opacity: sceneVisibility.ballScene
        }}>
          {/* Ground line */}
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '10%',
            right: '10%',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px'
          }} />
          
          {/* Bouncing Ball */}
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: `${20 - ballY}%`,
            transform: `translateX(-50%) scaleX(${ballScale}) scaleY(${2 - ballScale})`,
            width: '80px',
            height: '80px',
            background: `radial-gradient(circle at 30% 30%, hsl(${ballHue}, 70%, 60%), hsl(${ballHue}, 60%, 40%))`,
            borderRadius: '50%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.1s ease-out'
          }} />
          
          {/* Shadow */}
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: '20%',
            transform: `translateX(-50%) scaleX(${1 + Math.abs(ballY) / 100})`,
            width: '60px',
            height: '20px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '50%',
            opacity: safeInterpolate(Math.abs(ballY), [0, 200], [0.8, 0.2])
          }} />
          
          {/* Bounce counter */}
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            ...TYPOGRAPHY.body,
            color: '#e2e8f0',
            opacity: 0.8
          }}>
            Bounce #{Math.floor(relativeFrame / (ballDuration / 4)) + 1}
          </div>
        </div>
      )}
      
      {/* Outro Scene */}
      {sceneVisibility.outro > 0.01 && (
        <div style={centeredContentStyle}>
          <div style={{
            opacity: sceneVisibility.outro,
            transform: `scale(${animations.outro.scale})`
          }}>
            <h1 style={{...TYPOGRAPHY.h1, color: '#ffffff', margin: '0 0 24px 0'}}>
              Physics Complete!
            </h1>
            <div style={{
              display: 'inline-flex',
              gap: '16px',
              marginTop: '24px'
            }}>
              {['Gravity', 'Momentum', 'Energy Loss'].map((concept, index) => (
                <div
                  key={concept}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    borderRadius: '24px',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#a78bfa',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: safeInterpolate(frame, [200 + index * 8, 215 + index * 8], [0, 1]),
                    transform: `translateY(${safeInterpolate(frame, [200 + index * 8, 215 + index * 8], [20, 0])}px)`
                  }}
                >
                  {concept}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};