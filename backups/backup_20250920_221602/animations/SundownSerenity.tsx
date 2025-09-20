import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';



  // Safe interpolation helper - prevents inputRange monotonic errors
  const safeInterpolate = (frame, inputRange, outputRange, options = {}) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, options);
  };
export const SundownSerenity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  
  // Animation progress (0 to 1)
  const progress = frame / durationInFrames;
  
  // Sun position and size
  const sunY = safeInterpolate(progress, [0, 1], [height * 0.3, height * 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const sunSize = safeInterpolate(progress, [0, 0.7, 1], [120, 140, 160], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  // Sky color transition
  const skyOpacity1 = safeInterpolate(progress, [0, 0.4, 0.8, 1], [1, 0.8, 0.3, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const skyOpacity2 = safeInterpolate(progress, [0, 0.3, 0.7, 1], [0, 0.5, 0.9, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const skyOpacity3 = safeInterpolate(progress, [0.6, 1], [0, 0.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  // Sun glow intensity
  const glowIntensity = safeInterpolate(progress, [0, 0.5, 1], [0.3, 0.8, 1.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  // Cloud movement
  const cloudOffset = safeInterpolate(frame, [0, durationInFrames], [0, width * 0.3]);
  
  // Stars appearance
  const starsOpacity = safeInterpolate(progress, [0.7, 1], [0, 0.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  // Silhouette elements
  const silhouetteOpacity = safeInterpolate(progress, [0.4, 1], [0.2, 0.9], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: '#87CEEB', // Base sky blue
        overflow: 'hidden',
      }}
    >
      {/* Sky gradients */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to bottom, #FFE4B5 0%, #FFA07A 50%, #FF6347 100%)',
          opacity: skyOpacity1,
        }}
      />
      
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to bottom, #FF4500 0%, #DC143C 40%, #8B0000 100%)',
          opacity: skyOpacity2,
        }}
      />
      
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to bottom, #2F1B14 0%, #0F0F23 70%, #000011 100%)',
          opacity: skyOpacity3,
        }}
      />
      
      {/* Stars */}
      <AbsoluteFill style={{ opacity: starsOpacity }}>
        {[...Array(30)].map((_, i) => {
          const x = (i * 37 + 123) % width;
          const y = (i * 73 + 456) % (height * 0.4);
          const twinkle = Math.sin(frame * 0.1 + i) * 0.5 + 0.5;
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 2,
                height: 2,
                background: '#FFFFFF',
                borderRadius: '50%',
                opacity: twinkle * 0.8 + 0.2,
                boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
              }}
            />
          );
        })}
      </AbsoluteFill>
      
      {/* Clouds */}
      <div
        style={{
          position: 'absolute',
          top: height * 0.2,
          left: -200 + cloudOffset * 0.5,
          width: 300,
          height: 80,
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '40px',
          filter: 'blur(2px)',
          opacity: safeInterpolate(progress, [0.3, 0.8], [0.8, 0.2]),
        }}
      />
      
      <div
        style={{
          position: 'absolute',
          top: height * 0.15,
          right: -150 - cloudOffset * 0.3,
          width: 200,
          height: 60,
          background: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '30px',
          filter: 'blur(1px)',
          opacity: safeInterpolate(progress, [0.2, 0.7], [0.9, 0.3]),
        }}
      />
      
      {/* Sun */}
      <div
        style={{
          position: 'absolute',
          left: width * 0.7,
          top: sunY - sunSize / 2,
          width: sunSize,
          height: sunSize,
          background: `radial-gradient(circle, #FFD700 0%, #FFA500 50%, #FF4500 100%)`,
          borderRadius: '50%',
          boxShadow: `0 0 ${50 * glowIntensity}px rgba(255, 165, 0, ${glowIntensity * 0.6}),
                      0 0 ${100 * glowIntensity}px rgba(255, 69, 0, ${glowIntensity * 0.3})`,
          filter: `blur(${safeInterpolate(progress, [0.8, 1], [0, 1])}px)`,
        }}
      />
      
      {/* Water reflection */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.3,
          background: 'linear-gradient(to bottom, rgba(0, 50, 100, 0.6) 0%, rgba(0, 20, 40, 0.9) 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Sun reflection */}
        <div
          style={{
            position: 'absolute',
            left: width * 0.7,
            top: height * 0.7 - sunY + height * 0.7,
            width: sunSize * 0.8,
            height: sunSize * 1.5,
            background: `linear-gradient(to bottom, 
              rgba(255, 215, 0, ${0.4 * (1 - progress * 0.5)}) 0%,
              rgba(255, 165, 0, ${0.3 * (1 - progress * 0.5)}) 30%,
              rgba(255, 69, 0, ${0.2 * (1 - progress * 0.5)}) 60%,
              transparent 100%)`,
            borderRadius: '50%',
            filter: 'blur(3px)',
            transform: 'scaleY(0.6)',
          }}
        />
        
        {/* Water ripples */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              top: i * 20 + Math.sin(frame * 0.05 + i) * 5,
              width: '100%',
              height: 1,
              background: `rgba(255, 255, 255, ${0.1 + Math.sin(frame * 0.03 + i) * 0.05})`,
              opacity: safeInterpolate(progress, [0.3, 1], [0.8, 0.3]),
            }}
          />
        ))}
      </div>
      
      {/* Mountain silhouettes */}
      <svg
        style={{
          position: 'absolute',
          bottom: height * 0.3,
          left: 0,
          width: '100%',
          height: height * 0.4,
          opacity: silhouetteOpacity,
        }}
        viewBox={`0 0 ${width} ${height * 0.4}`}
        preserveAspectRatio="none"
      >
        <path
          d={`M 0,${height * 0.2} 
              Q ${width * 0.2},${height * 0.1} ${width * 0.4},${height * 0.15}
              Q ${width * 0.6},${height * 0.2} ${width * 0.8},${height * 0.05}
              L ${width},${height * 0.1}
              L ${width},${height * 0.4}
              L 0,${height * 0.4} Z`}
          fill="rgba(0, 0, 0, 0.8)"
        />
        <path
          d={`M 0,${height * 0.25} 
              Q ${width * 0.15},${height * 0.15} ${width * 0.3},${height * 0.2}
              Q ${width * 0.5},${height * 0.1} ${width * 0.7},${height * 0.18}
              Q ${width * 0.85},${height * 0.25} ${width},${height * 0.15}
              L ${width},${height * 0.4}
              L 0,${height * 0.4} Z`}
          fill="rgba(0, 0, 0, 0.6)"
        />
      </svg>
      
      {/* Birds flying */}
      {[...Array(3)].map((_, i) => {
        const birdProgress = safeInterpolate(frame, [0, durationInFrames], [0, 1]);
        const birdX = safeInterpolate(birdProgress, [0, 1], [-50, width + 50]);
        const birdY = height * 0.3 + Math.sin(frame * 0.02 + i * 2) * 20;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: birdX + i * 100,
              top: birdY + i * 30,
              fontSize: 12,
              opacity: safeInterpolate(progress, [0.2, 0.8], [0.8, 0.3]),
            }}
          >
            🕊️
          </div>
        );
      })}
    </AbsoluteFill>
  );
};