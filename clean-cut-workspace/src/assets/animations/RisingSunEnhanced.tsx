import React from 'react';
import { useCurrentFrame, interpolate, Easing, AbsoluteFill } from 'remotion';

interface RisingSunEnhancedProps {
  // Sun properties
  sunColor?: string;
  sunSize?: number;
  sunGlowIntensity?: number;
  sunStartY?: number;
  sunEndY?: number;
  sunGlowColor?: string;
  
  // Sky properties
  skyGradientStart?: string;
  skyGradientEnd?: string;
  skyGradientMidpoint?: string;
  useThreeColorGradient?: boolean;
  
  // Cloud properties
  cloudColor?: string;
  cloudOpacity?: number;
  cloudSpeed?: number;
  showClouds?: boolean;
  cloudCount?: number;
  cloudSize?: number;
  
  // Sun rays properties
  showSunRays?: boolean;
  rayCount?: number;
  rayLength?: number;
  rayColor?: string;
  rayOpacity?: number;
  rayRotationSpeed?: number;
  rayWidth?: number;
  
  // Text properties
  title?: string;
  titleColor?: string;
  titleSize?: number;
  titleDelay?: number;
  titleFadeSpeed?: number;
  subtitle?: string;
  subtitleColor?: string;
  subtitleSize?: number;
  subtitleDelay?: number;
  titleShadow?: boolean;
  
  // Animation timing
  animationSpeed?: number;
  sunRiseDelay?: number;
  sunRiseDuration?: number;
  glowDelay?: number;
  glowDuration?: number;
  
  // Background effects
  showGradientShift?: boolean;
  backgroundParticles?: boolean;
  particleColor?: string;
  particleCount?: number;
  particleSize?: number;
  particleSpeed?: number;
  
  // Motion effects
  sunBounce?: boolean;
  cloudFloat?: boolean;
  titlePulse?: boolean;
  rayPulse?: boolean;
  
  // Advanced styling
  sunBorderColor?: string;
  sunBorderWidth?: number;
  cloudShadow?: boolean;
  vintageEffect?: boolean;
  bloomEffect?: boolean;
}

export const RisingSunEnhanced: React.FC<RisingSunEnhancedProps> = ({
  // Sun defaults
  sunColor = '#FFD700',
  sunSize = 120,
  sunGlowIntensity = 60,
  sunStartY = 600,
  sunEndY = 200,
  sunGlowColor = '',
  
  // Sky defaults
  skyGradientStart = '#87CEEB',
  skyGradientEnd = '#FFA500',
  skyGradientMidpoint = '#FFB6C1',
  useThreeColorGradient = false,
  
  // Cloud defaults
  cloudColor = '#FFFFFF',
  cloudOpacity = 0.8,
  cloudSpeed = 1,
  showClouds = true,
  cloudCount = 2,
  cloudSize = 1,
  
  // Sun rays defaults
  showSunRays = true,
  rayCount = 8,
  rayLength = 80,
  rayColor = '',
  rayOpacity = 0.7,
  rayRotationSpeed = 1,
  rayWidth = 4,
  
  // Text defaults
  title = 'Good Morning!',
  titleColor = '#FFFFFF',
  titleSize = 48,
  titleDelay = 3,
  titleFadeSpeed = 1.5,
  subtitle = '',
  subtitleColor = '#F0F0F0',
  subtitleSize = 24,
  subtitleDelay = 4,
  titleShadow = true,
  
  // Animation timing defaults
  animationSpeed = 1,
  sunRiseDelay = 0,
  sunRiseDuration = 3,
  glowDelay = 0,
  glowDuration = 4,
  
  // Background effects defaults
  showGradientShift = true,
  backgroundParticles = false,
  particleColor = '#FFFFFF',
  particleCount = 20,
  particleSize = 2,
  particleSpeed = 1,
  
  // Motion effects defaults
  sunBounce = false,
  cloudFloat = true,
  titlePulse = false,
  rayPulse = false,
  
  // Advanced styling defaults
  sunBorderColor = '',
  sunBorderWidth = 0,
  cloudShadow = false,
  vintageEffect = false,
  bloomEffect = false
}) => {
  const frame = useCurrentFrame();
  const fps = 30;
  
  // Adjust timing based on animation speed
  const adjustedFrame = frame * animationSpeed;
  
  // Dynamic sun glow color
  const effectiveSunGlowColor = sunGlowColor || sunColor;
  const effectiveRayColor = rayColor || sunColor;
  
  // Sun rising animation with optional bounce
  let sunY = interpolate(
    adjustedFrame,
    [sunRiseDelay * fps, (sunRiseDelay + sunRiseDuration) * fps],
    [sunStartY, sunEndY],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: sunBounce ? Easing.bezier(0.68, -0.55, 0.265, 1.55) : Easing.bezier(0, 0, 0.58, 1)
    }
  );
  
  // Sun glow intensity with pulsing effect
  let glowOpacity = interpolate(
    adjustedFrame,
    [glowDelay * fps, (glowDelay + glowDuration) * fps],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );
  
  if (rayPulse) {
    const pulseEffect = 0.2 * Math.sin(adjustedFrame * 0.1) + 0.8;
    glowOpacity *= pulseEffect;
  }
  
  // Background gradient with optional shifting
  let backgroundGradient;
  if (useThreeColorGradient) {
    backgroundGradient = `linear-gradient(180deg, ${skyGradientStart} 0%, ${skyGradientMidpoint} 50%, ${skyGradientEnd} 100%)`;
  } else {
    backgroundGradient = `linear-gradient(180deg, ${skyGradientStart} 0%, ${skyGradientEnd} 100%)`;
  }
  
  if (showGradientShift) {
    const gradientShift = interpolate(
      adjustedFrame,
      [0, fps * 6],
      [0, 20],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    backgroundGradient = backgroundGradient.replace('180deg', `${180 + gradientShift}deg`);
  }
  
  // Cloud animations with floating effect
  const cloudBaseSpeed = cloudSpeed * (fps * 6);
  const cloud1X = interpolate(adjustedFrame, [0, cloudBaseSpeed], [-200, 1200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cloud2X = interpolate(adjustedFrame, [fps * 1, cloudBaseSpeed + fps], [-150, 1200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const cloudFloatOffset = cloudFloat ? 10 * Math.sin(adjustedFrame * 0.05) : 0;
  
  // Title animations with pulsing effect
  const titleOpacity = interpolate(
    adjustedFrame,
    [titleDelay * fps, (titleDelay + titleFadeSpeed) * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  let titleScale = interpolate(
    adjustedFrame,
    [titleDelay * fps, (titleDelay + 1) * fps],
    [0.8, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    }
  );
  
  if (titlePulse) {
    titleScale *= 1 + 0.1 * Math.sin(adjustedFrame * 0.1);
  }
  
  // Subtitle animation
  const subtitleOpacity = interpolate(
    adjustedFrame,
    [subtitleDelay * fps, (subtitleDelay + titleFadeSpeed) * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  // Ray rotation with speed control
  const rayRotation = (adjustedFrame * rayRotationSpeed) % 360;

  return (
    <AbsoluteFill
      style={{
        background: backgroundGradient,
        overflow: 'hidden',
        filter: vintageEffect ? 'sepia(0.3) contrast(1.2)' : bloomEffect ? 'brightness(1.1) saturate(1.2)' : 'none'
      }}
    >
      {/* Background particles */}
      {backgroundParticles && [...Array(particleCount)].map((_, i) => {
        const particleX = (i * 100) % 1000;
        const particleDelay = i * 0.1;
        const particleY = interpolate(
          adjustedFrame,
          [particleDelay * fps, (particleDelay + 10) * fps],
          [800, -100],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: particleX,
              top: particleY,
              width: particleSize,
              height: particleSize,
              borderRadius: '50%',
              backgroundColor: particleColor,
              opacity: 0.6
            }}
          />
        );
      })}
      
      {/* Sun with enhanced styling */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: sunY,
          transform: 'translateX(-50%)',
          width: sunSize,
          height: sunSize,
          borderRadius: '50%',
          backgroundColor: sunColor,
          boxShadow: `0 0 ${sunGlowIntensity * glowOpacity}px ${effectiveSunGlowColor}`,
          opacity: glowOpacity,
          border: sunBorderWidth > 0 ? `${sunBorderWidth}px solid ${sunBorderColor}` : 'none'
        }}
      />
      
      {/* Enhanced sun rays */}
      {showSunRays && [...Array(rayCount)].map((_, i) => {
        const angle = (i * (360 / rayCount) + rayRotation) * (Math.PI / 180);
        const rayX = Math.cos(angle) * rayLength;
        const rayY = Math.sin(angle) * rayLength;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: sunY + sunSize / 2,
              width: rayWidth,
              height: 40,
              backgroundColor: effectiveRayColor,
              transform: `translate(-50%, -50%) translate(${rayX}px, ${rayY}px) rotate(${i * (360 / rayCount) + rayRotation}deg)`,
              opacity: glowOpacity * rayOpacity,
              borderRadius: `${rayWidth / 2}px`
            }}
          />
        );
      })}
      
      {/* Enhanced clouds */}
      {showClouds && [...Array(cloudCount)].map((_, cloudIndex) => {
        const cloudXBase = cloudIndex % 2 === 0 ? cloud1X : cloud2X;
        const cloudYBase = cloudIndex % 2 === 0 ? 100 : 150;
        const cloudYOffset = cloudIndex * 50;
        
        return (
          <div key={cloudIndex}>
            <div
              style={{
                position: 'absolute',
                left: cloudXBase + cloudIndex * 100,
                top: cloudYBase + cloudYOffset + cloudFloatOffset,
                width: 120 * cloudSize,
                height: 60 * cloudSize,
                backgroundColor: cloudColor,
                borderRadius: `${30 * cloudSize}px`,
                opacity: cloudOpacity,
                boxShadow: cloudShadow ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: cloudXBase + 40 + cloudIndex * 100,
                top: cloudYBase - 20 + cloudYOffset + cloudFloatOffset,
                width: 80 * cloudSize,
                height: 40 * cloudSize,
                backgroundColor: cloudColor,
                borderRadius: `${20 * cloudSize}px`,
                opacity: cloudOpacity,
                boxShadow: cloudShadow ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
              }}
            />
          </div>
        );
      })}
      
      {/* Enhanced title */}
      <div
        style={{
          position: 'absolute',
          top: '70%',
          left: '50%',
          transform: `translateX(-50%) scale(${titleScale})`,
          opacity: titleOpacity,
          textAlign: 'center'
        }}
      >
        <h1
          style={{
            fontSize: titleSize,
            fontWeight: 'bold',
            color: titleColor,
            textShadow: titleShadow ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
            margin: 0,
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {title}
        </h1>
        
        {/* Subtitle */}
        {subtitle && (
          <h2
            style={{
              fontSize: subtitleSize,
              fontWeight: 'normal',
              color: subtitleColor,
              textShadow: titleShadow ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none',
              margin: '10px 0 0 0',
              fontFamily: 'Arial, sans-serif',
              opacity: subtitleOpacity
            }}
          >
            {subtitle}
          </h2>
        )}
      </div>
    </AbsoluteFill>
  );
};