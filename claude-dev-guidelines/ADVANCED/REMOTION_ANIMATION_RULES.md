# 🎬 Remotion Development Guidelines for Claude
**Essential rules and patterns for creating bulletproof Remotion animations**

## ⚡ QUICK START - ALWAYS IMPLEMENT THESE

### **Professional Animation Checklist:**
- ✅ **Overlapping scenes** - No empty screen time (15-frame overlaps)
- ✅ **Movement + fades** - Never fade-only transitions
- ✅ **Quick timing** - 20-frame entries, 15-frame exits
- ✅ **Proper sizing** - 16px+ text, 18px+ badges, 20px+ buttons, 44px+ touch targets
- ✅ **Professional typography** - Use modern sans-serif fonts with proper hierarchy
- ✅ **Staggered elements** - 5-8 frame delays within scenes
- ✅ **Safe interpolation** - Always use bounds checking
- ✅ **Cubic easing** - out for entries, in for exits

### **Animation Timeline Formula:**
```typescript
// For 10-second animation (300 frames):
// Scene 1: 0-80 frames    (0-2.7s)
// Scene 2: 65-155 frames  (2.2-5.2s) - 15 frame overlap
// Scene 3: 140-230 frames (4.7-7.7s) - 15 frame overlap  
// Scene 4: 215-300 frames (7.2-10s)  - 15 frame overlap
```

### **Professional Typography System (MANDATORY):**

Create a separate `typography.ts` file with these definitions:

```typescript
// typography.ts - Import this in every component
export const FONT_STACKS = {
  // Primary recommended stack
  primary: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  
  // Alternative premium options (choose ONE per project)
  modern: '"Satoshi", "Inter", -apple-system, sans-serif',          // Clean, geometric
  tech: '"JetBrains Mono", "SF Mono", "Monaco", monospace',        // For code/tech content
  elegant: '"Poppins", "Nunito Sans", "Inter", sans-serif',        // Friendly, approachable
  minimal: '"Neue Haas Grotesk", "Helvetica Now", sans-serif',     // Swiss minimalism
  corporate: '"Circular", "Gotham", "Proxima Nova", sans-serif'    // Professional/corporate
};

// Typography hierarchy using font stack references
export const TYPOGRAPHY = {
  display: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '72px',
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em'
  },
  h1: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '48px',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em'
  },
  h2: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '36px',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '0em'
  },
  h3: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0em'
  },
  body: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0em'
  },
  small: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.01em'
  },
  badge: {
    fontFamily: FONT_STACKS.primary,
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const
  }
};

// Container with font optimization
export const FONT_CONTAINER_STYLES = {
  fontFamily: FONT_STACKS.primary,
  fontDisplay: 'swap' as const,
  WebkitFontSmoothing: 'antialiased' as const,
  MozOsxFontSmoothing: 'grayscale' as const,
  textRendering: 'optimizeLegibility' as const
};
```

### **Component Usage:**
```typescript
import { FONT_STACKS, TYPOGRAPHY, FONT_CONTAINER_STYLES } from './typography';

// Use in component styles
const containerStyles = {
  ...FONT_CONTAINER_STYLES,
  width: '100%',
  height: '100%',
  // other styles...
};

// Use typography hierarchy
<h1 style={{...TYPOGRAPHY.h1, color: '#ffffff'}}>Title</h1>
<p style={{...TYPOGRAPHY.body, color: '#cccccc'}}>Body text</p>
```

## 🚨 CRITICAL LAYOUT RULES - ALWAYS FOLLOW

### **Scene Management (MANDATORY)**
```typescript
// ✅ CORRECT: Overlapping scenes with no empty screen time
const animations = {
  scene1: {
    opacity: safeInterpolate(frame, [0, 20], [0, 1]) * safeInterpolate(frame, [60, 75], [1, 0]),
    entryY: safeInterpolate(frame, [0, 20], [20, 0]),
    exitY: safeInterpolate(frame, [60, 75], [0, -20])
  },
  scene2: {
    opacity: safeInterpolate(frame, [65, 85], [0, 1]) * safeInterpolate(frame, [140, 155], [1, 0]),
    entryY: safeInterpolate(frame, [65, 85], [30, 0]),
    exitX: safeInterpolate(frame, [140, 155], [0, -60])
  }
};

// Always use calculated visibility
{sceneVisibility.scene1 > 0.01 && <Scene1Content />}
{sceneVisibility.scene2 > 0.01 && <Scene2Content />}
```

### **Professional Animation Timing (MANDATORY)**
- **15-frame overlaps** between scene transitions
- **20-frame entry animations** (quick and snappy)
- **15-frame exit animations** (faster than entry)
- **5-8 frame staggers** for elements within scenes
- **NO GAPS**: Always have content visible on screen

### **Safe Animation Template (USE THIS)**
```typescript
const safeInterpolate = (frame, inputRange, outputRange, easing) => {
  const [inputStart, inputEnd] = inputRange;
  const [outputStart, outputEnd] = outputRange;
  if (inputEnd === inputStart) return outputStart;
  if (frame <= inputStart) return outputStart;
  if (frame >= inputEnd) return outputEnd;
  return interpolate(frame, inputRange, outputRange, { easing });
};

// Scene timing with overlaps (adjust frame numbers for your duration)
const animations = {
  scene1: {
    opacity: safeInterpolate(frame, [0, 20], [0, 1], Easing.out(Easing.cubic)) * 
             safeInterpolate(frame, [60, 75], [1, 0], Easing.in(Easing.cubic)),
    entryY: safeInterpolate(frame, [0, 20], [20, 0], Easing.out(Easing.cubic)),
    exitY: safeInterpolate(frame, [60, 75], [0, -20], Easing.in(Easing.cubic))
  },
  scene2: {
    opacity: safeInterpolate(frame, [65, 85], [0, 1], Easing.out(Easing.cubic)) * 
             safeInterpolate(frame, [140, 155], [1, 0], Easing.in(Easing.cubic)),
    entryY: safeInterpolate(frame, [65, 85], [30, 0], Easing.out(Easing.cubic)),
    exitX: safeInterpolate(frame, [140, 155], [0, -60], Easing.in(Easing.cubic))
  }
};

// Individual element staggers within scenes
{items.map((item, index) => (
  <div
    key={item.id}
    style={{
      opacity: safeInterpolate(frame, [sceneStart + index * 5, sceneStart + 15 + index * 5], [0, 1]),
      transform: `translateY(${safeInterpolate(frame, [sceneStart + index * 5, sceneStart + 15 + index * 5], [15, 0])}px)`
    }}
  >
    {item.content}
  </div>
))}
```

### **Spacing Requirements**
- **Container padding**: 80px minimum
- **Section margins**: 60px minimum between elements
- **Grid gaps**: 25px minimum
- **Card padding**: 40px minimum
- **Text containers**: Use `minHeight` never `height`

### **Minimum Size Requirements (CRITICAL)**
- **Text elements**: 16px font size minimum (never smaller than 14px)
- **Badges/Pills**: 18px font size minimum, 16px padding minimum
- **Buttons**: 20px font size minimum, 16px padding minimum
- **Headlines**: 24px font size minimum
- **Touch targets**: 44px minimum height and width
- **Visual elements**: Must be clearly visible at 1920x1080 resolution

### **Modern Transition Requirements (CRITICAL)**
- **NO EMPTY SCREEN TIME**: Always have content visible - overlap scenes during transitions
- **STRATEGIC FADES + MOVEMENT**: Never fade-only - always combine with slides/scales/transforms
- **OVERLAPPING HANDOFFS**: Start next scene 15 frames before previous scene exits
- **QUICK TIMING**: 20-frame entries, 15-frame exits, 5-8 frame staggers
- **PURPOSEFUL MOTION**: Each transition serves narrative flow (up=intro, left=next, right=back)
- **TIGHT LOOPS**: No lingering animations - keep it snappy and engaging
- **CUBIC EASING**: Use Easing.out(Easing.cubic) for entries, Easing.in(Easing.cubic) for exits

### **Grid Layout Safety**
```typescript
// ✅ SAFE GRID - Explicit columns and rows
<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr', // EXPLICIT columns
  gridTemplateRows: '1fr 1fr',    // EXPLICIT rows
  gap: '25px',
  maxWidth: '600px'
}}>
```

### **Banned Patterns - NEVER USE**
- ❌ `gridTemplateColumns: 'repeat(auto-fit, minmax(...))'`
- ❌ Multiple `position: 'absolute'` elements in same scene
- ❌ Fixed `height` with text content - use `minHeight`
- ❌ Text smaller than 16px (badges/pills smaller than 18px, buttons smaller than 20px)
- ❌ Elements smaller than 44px touch targets
- ❌ **FADE-ONLY TRANSITIONS** - Always combine fades with movement
- ❌ **EMPTY SCREEN TIME** - Always overlap scenes during transitions
- ❌ **SLOW TIMING** - Use 15-20 frame transitions, not 30+ frames
- ❌ **HARD SCENE CUTS** - Always use overlapping opacity transitions
- ❌ **SINGLE SCENE VISIBILITY** - Multiple scenes should overlap during handoffs

## 🎯 Safe Animation Patterns

### **Pattern 1: Single Scene Template**
```typescript
const SafeAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const currentScene = frame < 60 ? 'main' : 'outro';
  
  return (
    <AbsoluteFill style={containerStyles}>
      {currentScene === 'main' && (
        <div style={centeredContentStyle}>
          <MainContent />
        </div>
      )}
      {currentScene === 'outro' && (
        <div style={centeredContentStyle}>
          <OutroContent />
        </div>
      )}
    </AbsoluteFill>
  );
};
```

### **Pattern 2: Bulletproof Grid**
```typescript
// Always use explicit grid definitions
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)', // Explicit count
  gap: '30px',
  padding: '40px',
  maxWidth: '900px'
}}>
  {items.map((item, index) => (
    <GridItem key={item.id} {...item} />
  ))}
</div>
```

### **Pattern 3: Safe Centering**
```typescript
const centeredContentStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '800px',
  textAlign: 'center' as const
};
```

### **Pattern 4: Strategic Fade + Movement**
```typescript
// ✅ GOOD: Fade combined with purposeful movement
const animations = {
  entry: {
    opacity: safeInterpolate(frame, [0, 30], [0, 1], Easing.out(Easing.cubic)),
    y: safeInterpolate(frame, [0, 30], [40, 0], Easing.out(Easing.cubic)),
    scale: safeInterpolate(frame, [0, 30], [0.9, 1], Easing.out(Easing.cubic))
  },
  exit: {
    opacity: safeInterpolate(frame, [60, 75], [1, 0], Easing.in(Easing.cubic)),
    x: safeInterpolate(frame, [60, 75], [0, -100], Easing.in(Easing.cubic))
  }
};

// Apply combined transform + opacity
<div style={{
  opacity: animations.entry.opacity * animations.exit.opacity,
  transform: `translateY(${animations.entry.y}px) translateX(${animations.exit.x}px) scale(${animations.entry.scale})`
}}>
```

### **Pattern 5: Staggered Element Fades**
```typescript
// Individual elements within scenes can use strategic fades
{items.map((item, index) => (
  <div
    key={item.id}
    style={{
      opacity: safeInterpolate(frame, [startFrame + index * 8, endFrame + index * 8], [0, 1]),
      transform: `translateY(${safeInterpolate(frame, [startFrame + index * 8, endFrame + index * 8], [20, 0])}px)`
    }}
  >
    {item.content}
  </div>
))}
```

## 🔧 Component Structure Template

```typescript
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { FONT_STACKS, TYPOGRAPHY, FONT_CONTAINER_STYLES } from './typography';

const ComponentName: React.FC = () => {
  const frame = useCurrentFrame();
  
  // MANDATORY: Safe interpolation with bounds checking
  const safeInterpolate = (frame, inputRange, outputRange, easing) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputRange;
    return interpolate(frame, inputRange, outputRange, { easing });
  };
  
  // MANDATORY: Overlapping scenes with movement + fades
  const animations = {
    scene1: {
      opacity: safeInterpolate(frame, [0, 20], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [60, 75], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [0, 20], [20, 0], Easing.out(Easing.cubic)),
      exitY: safeInterpolate(frame, [60, 75], [0, -20], Easing.in(Easing.cubic))
    },
    scene2: {
      opacity: safeInterpolate(frame, [65, 85], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [140, 155], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [65, 85], [30, 0], Easing.out(Easing.cubic)),
      exitX: safeInterpolate(frame, [140, 155], [0, -60], Easing.in(Easing.cubic))
    },
    scene3: {
      opacity: safeInterpolate(frame, [140, 160], [0, 1], Easing.out(Easing.cubic)),
      entryScale: safeInterpolate(frame, [140, 160], [0.8, 1], Easing.out(Easing.cubic))
    }
  };
  
  // Calculate final visibility
  const sceneVisibility = {
    scene1: animations.scene1.opacity,
    scene2: animations.scene2.opacity,
    scene3: animations.scene3.opacity
  };
  
  // MANDATORY: Safe container styles with professional typography
  const containerStyles = {
    ...FONT_CONTAINER_STYLES,
    width: '100%',
    height: '100%',
    backgroundColor: '#0d1117', // Or your background color
    overflow: 'hidden'
  };
  
  // MANDATORY: Centered content style
  const contentStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '1000px',
    textAlign: 'center' as const,
    padding: '40px' // Minimum 40px padding
  };
  
  return (
    <AbsoluteFill style={containerStyles}>
      {/* MANDATORY: Multiple overlapping scenes */}
      {sceneVisibility.scene1 > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.scene1,
            transform: `translateY(${animations.scene1.entryY + animations.scene1.exitY}px)`
          }}>
            {/* Scene 1 content with professional typography */}
            <h1 style={{...TYPOGRAPHY.h1, color: '#ffffff', margin: '0 0 24px 0'}}>
              Title
            </h1>
            <p style={{...TYPOGRAPHY.body, color: '#cccccc', margin: 0}}>
              Description
            </p>
          </div>
        </div>
      )}
      
      {sceneVisibility.scene2 > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.scene2,
            transform: `translateY(${animations.scene2.entryY}px) translateX(${animations.scene2.exitX}px)`
          }}>
            {/* Scene 2 content with staggered elements */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr', // Explicit grid
              gap: '30px'
            }}>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    opacity: safeInterpolate(frame, [75 + index * 5, 90 + index * 5], [0, 1]),
                    transform: `translateY(${safeInterpolate(frame, [75 + index * 5, 90 + index * 5], [15, 0])}px)`,
                    padding: '24px', // Minimum 20px padding
                    fontSize: '16px', // Minimum 16px font
                    minHeight: '120px' // Use minHeight, never height
                  }}
                >
                  {item.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {sceneVisibility.scene3 > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.scene3,
            transform: `scale(${animations.scene3.entryScale})`
          }}>
            {/* Final scene content */}
            {badges.map((badge, index) => (
              <div
                key={badge}
                style={{
                  display: 'inline-block',
                  margin: '8px',
                  padding: '16px 24px', // Minimum 16px padding
                  fontSize: '18px', // Minimum 18px for badges
                  fontWeight: 600,
                  borderRadius: '24px',
                  minHeight: '44px', // Minimum touch target
                  opacity: safeInterpolate(frame, [150 + index * 6, 165 + index * 6], [0, 1]),
                  transform: `translateX(${safeInterpolate(frame, [150 + index * 6, 165 + index * 6], [-20, 0])}px)`
                }}
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default ComponentName;
```

---

**Always reference these guidelines when creating Remotion animations!**