import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

// Configuration following guidelines pattern
const CONFIG = {
  // Colors following guidelines palette
  colors: {
    background: {
      start: "hsl(260, 45%, 12%)",
      end: "hsl(320, 45%, 20%)"
    },
    orbs: [
      "#a78bfa", // accent purple
      "#3b82f6", // blue
      "#10b981", // success green  
      "#f59e0b", // warning orange
      "#ef4444"  // error red
    ]
  },
  
  // Animation timing following guidelines
  timing: {
    entrySpeed: 20,
    staggerDelay: 8,
    scaleStart: 0.9,
    scaleEnd: 1.0,
    entryDistance: 40
  },
  
  // Orb configurations
  orbs: [
    { size: 120, colorIndex: 0, delay: 0 },
    { size: 80, colorIndex: 1, delay: 8 },
    { size: 100, colorIndex: 2, delay: 16 },
    { size: 90, colorIndex: 3, delay: 24 },
    { size: 70, colorIndex: 4, delay: 32 }
  ]
};

const FloatingOrbs: React.FC = () => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill 
      style={{ 
        background: `linear-gradient(135deg, ${CONFIG.colors.background.start}, ${CONFIG.colors.background.end})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {CONFIG.orbs.map((orb, index) => {
        const adjustedFrame = Math.max(0, frame - orb.delay);
        
        // Entry animation following guidelines timing
        const opacity = interpolate(
          adjustedFrame,
          [0, CONFIG.timing.entrySpeed],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic)
          }
        );
        
        // Scale animation following guidelines
        const scale = interpolate(
          adjustedFrame,
          [0, CONFIG.timing.entrySpeed],
          [CONFIG.timing.scaleStart, CONFIG.timing.scaleEnd],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(1.2))
          }
        );
        
        // Smooth floating motion
        const floatY = interpolate(
          adjustedFrame,
          [0, 90, 180],
          [0, -20, 0],
          {
            easing: Easing.inOut(Easing.sin)
          }
        );
        
        // Gentle horizontal drift
        const driftX = interpolate(
          adjustedFrame * 0.5,
          [0, 90, 180],
          [0, 15 * (index % 2 === 0 ? 1 : -1), 0],
          {
            easing: Easing.inOut(Easing.sin)
          }
        );
        
        // Position in circular formation
        const angle = (index / CONFIG.orbs.length) * 2 * Math.PI;
        const radius = 150;
        const baseX = Math.cos(angle) * radius;
        const baseY = Math.sin(angle) * radius;
        
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: orb.size,
              height: orb.size,
              marginLeft: -orb.size / 2,
              marginTop: -orb.size / 2,
              transform: `translate(${baseX + driftX}px, ${baseY + floatY}px) scale(${scale})`,
              opacity: opacity,
              borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%,
                ${CONFIG.colors.orbs[orb.colorIndex]}ff,
                ${CONFIG.colors.orbs[orb.colorIndex]}cc,
                ${CONFIG.colors.orbs[orb.colorIndex]}66,
                transparent)`,
              boxShadow: `
                0 0 ${orb.size * 0.5}px ${CONFIG.colors.orbs[orb.colorIndex]}44,
                inset 0 0 ${orb.size * 0.3}px ${CONFIG.colors.orbs[orb.colorIndex]}22
              `,
              filter: "blur(0.5px)"
            }}
          />
        );
      })}
      
      {/* Central glow effect */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 400,
          height: 400,
          marginLeft: -200,
          marginTop: -200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CONFIG.colors.orbs[0]}11, transparent 70%)`,
          opacity: interpolate(
            frame,
            [0, 60, 120, 180],
            [0, 0.3, 0.6, 0.3],
            { easing: Easing.inOut(Easing.sin) }
          ),
          pointerEvents: "none"
        }}
      />
    </AbsoluteFill>
  );
};

export { FloatingOrbs };
