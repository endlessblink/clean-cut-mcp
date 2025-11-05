import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

interface FloatingOrbsAnimationProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  orbCount?: number;
  animationSpeed?: number;
  title?: string;
}

export const FloatingOrbsAnimation: React.FC<FloatingOrbsAnimationProps> = ({
  primaryColor = '#6366f1',
  secondaryColor = '#8b5cf6',
  accentColor = '#06b6d4',
  backgroundColor = '#0f172a',
  orbCount = 5,
  animationSpeed = 1,
  title = 'Floating Dreams'
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  
  // Create orbs with different properties
  const orbs = Array.from({ length: orbCount }, (_, i) => {
    const baseDelay = (i * 30) / animationSpeed;
    const size = interpolate(
      (frame + baseDelay) % (fps * 4),
      [0, fps * 2, fps * 4],
      [40, 80, 40],
      {
        easing: Easing.bezier(0.42, 0, 0.58, 1)
      }
    );
    
    const x = interpolate(
      (frame + baseDelay) % (fps * 6),
      [0, fps * 3, fps * 6],
      [width * 0.1, width * 0.9, width * 0.1],
      {
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      }
    );
    
    const y = interpolate(
      (frame + baseDelay * 1.3) % (fps * 5),
      [0, fps * 2.5, fps * 5],
      [height * 0.8, height * 0.2, height * 0.8],
      {
        easing: Easing.bezier(0.42, 0, 0.58, 1)
      }
    );
    
    const opacity = interpolate(
      (frame + baseDelay) % (fps * 3),
      [0, fps * 1.5, fps * 3],
      [0.3, 1, 0.3],
      {
        easing: Easing.bezier(0, 0, 0.58, 1)
      }
    );
    
    const colors = [primaryColor, secondaryColor, accentColor];
    const color = colors[i % colors.length];
    
    return { size, x, y, opacity, color, id: i };
  });
  
  // Title animation
  const titleOpacity = interpolate(
    frame,
    [0, fps * 0.5, fps * 5, fps * 5.5],
    [0, 1, 1, 0],
    {
      easing: Easing.bezier(0.42, 0, 0.58, 1)
    }
  );
  
  const titleY = interpolate(
    frame,
    [0, fps * 0.8],
    [height * 0.6, height * 0.5],
    {
      easing: Easing.bezier(0, 0, 0.58, 1)
    }
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 70%, ${primaryColor}20 0%, transparent 50%), 
                       radial-gradient(circle at 70% 30%, ${accentColor}15 0%, transparent 50%)`,
        }}
      />
      
      {/* Floating orbs */}
      {orbs.map((orb) => (
        <div
          key={orb.id}
          style={{
            position: 'absolute',
            left: orb.x - orb.size / 2,
            top: orb.y - orb.size / 2,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}, ${orb.color}80)`,
            borderRadius: '50%',
            opacity: orb.opacity,
            filter: 'blur(1px)',
            boxShadow: `0 0 ${orb.size * 0.5}px ${orb.color}40`,
          }}
        />
      ))}
      
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: titleY,
          transform: 'translateX(-50%)',
          opacity: titleOpacity,
          color: 'white',
          fontSize: Math.min(width * 0.08, 48),
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {title}
      </div>
    </div>
  );
};