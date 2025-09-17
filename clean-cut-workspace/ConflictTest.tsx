import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const ConflictTest: React.FC = () => {
  const frame = useCurrentFrame();
  
  // This creates a component name conflict
  const ConflictTest = frame; // BAD: Same name as component
  
  return (
    <AbsoluteFill>
      {[1, 2, 3].map((item, index) => {
        const adjustedFrame = Math.max(0, frame - index * 10);
        const opacity = interpolate(adjustedFrame, [0, 30], [0, 1]);
        const scale = interpolate(adjustedFrame, [0, 30], [0.8, 1.2]);
        
        return (
          <div key={index} style={{
            width: 50,
            height: 50,
            backgroundColor: "red",
            opacity: opacity,
            transform: `scale(${scale})`,
            position: "absolute",
            left: index * 60
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
