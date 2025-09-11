# 🎬 REMOTION ANIMATION PATTERNS
**Essential code patterns and rules for professional animations**

## 🔧 DYNAMIC CONFIGURATION SYSTEM

### **Component Structure (MANDATORY):**
```typescript
import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { parseGuidelinesConfig, generateTypography, generateFontContainerStyles } from '../typography';

export const ComponentName: React.FC = () => {
  const frame = useCurrentFrame();
  
  // 1. Read config from guidelines
  const config = parseGuidelinesConfig(guidelinesContent);
  
  // 2. Apply dynamic values
  const TYPOGRAPHY = generateTypography(
    config.selectedFontStack,
    config.typographyScale,
    config.fontStacks,
    config.baseSizes
  );
  const ANIMATION_CONFIG = config.animationConfig;
  const COLORS = config.colors;
  const SPACING = config.spacing;
  
  // 3. Use in animations
  return (
    <div style={{...FONT_CONTAINER_STYLES, width: '100%', height: '100%'}}>
      <h1 style={{...TYPOGRAPHY.h1, color: COLORS.text.primary}}>
        Dynamic Title
      </h1>
    </div>
  );
};
```

### **Benefits of Dynamic System:**
- ✅ **Single Source of Truth**: All settings in PROJECT_CONFIG.md
- ✅ **No Hardcoded Values**: Everything references guidelines
- ✅ **Easy Updates**: Change one value, entire project updates
- ✅ **Version Control**: Settings tracked with guidelines
- ✅ **User-Friendly**: Non-technical users can modify visuals

## ⚡ MANDATORY ANIMATION RULES

### **Professional Animation Checklist:**
- ✅ **Overlapping scenes** - No empty screen time (15-frame overlaps)
- ✅ **Movement + fades** - Never fade-only transitions
- ✅ **Quick timing** - 20-frame entries, 15-frame exits
- ✅ **Safe interpolation** - Always use bounds checking
- ✅ **Cubic easing** - out for entries, in for exits
- ✅ **Staggered elements** - 5-8 frame delays within scenes

### **Timeline Formula (10-second animation):**
```typescript
// Scene overlaps - ALWAYS something visible:
// Scene 1: 0-80 frames    (0-2.7s)
// Scene 2: 65-155 frames  (2.2-5.2s) - 15 frame overlap
// Scene 3: 140-230 frames (4.7-7.7s) - 15 frame overlap  
// Scene 4: 215-300 frames (7.2-10s)  - 15 frame overlap
```

## 🔧 SAFE ANIMATION PATTERNS

### **Safe Interpolation (ALWAYS USE):**
```typescript
const safeInterpolate = (frame, inputRange, outputRange, easing) => {
  const [inputStart, inputEnd] = inputRange;
  const [outputStart, outputEnd] = outputRange;
  if (inputEnd === inputStart) return outputStart;
  if (frame <= inputStart) return outputStart;
  if (frame >= inputEnd) return outputEnd;
  return interpolate(frame, inputRange, outputRange, { easing });
};
```

### **Overlapping Scene Template:**
```typescript
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

// Calculate final visibility
const sceneVisibility = {
  scene1: animations.scene1.opacity,
  scene2: animations.scene2.opacity
};

// Render with visibility checks
{sceneVisibility.scene1 > 0.01 && <Scene1Content />}
{sceneVisibility.scene2 > 0.01 && <Scene2Content />}
```

### **Staggered Elements Pattern:**
```typescript
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

## 📏 LAYOUT SAFETY RULES

### **Minimum Sizes (CRITICAL):**
- **Text**: 16px minimum
- **Badges**: 18px minimum
- **Buttons**: 20px minimum  
- **Touch targets**: 44px minimum
- **Container padding**: 40px minimum

### **Safe Grid Pattern:**
```typescript
// ✅ CORRECT: Explicit columns
<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr', // EXPLICIT columns
  gridTemplateRows: '1fr 1fr',    // EXPLICIT rows
  gap: '25px',
  maxWidth: '600px'
}}>

// ❌ BANNED: Auto-fit patterns
gridTemplateColumns: 'repeat(auto-fit, minmax(...))'
```

### **Safe Centering:**
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

## 🚨 BANNED PATTERNS

**NEVER USE:**
- ❌ **Empty screen time** - Always overlap scenes
- ❌ **Fade-only transitions** - Always combine with movement
- ❌ **Slow timing** - Use 15-20 frame transitions max
- ❌ **Hard scene cuts** - Always use overlapping opacity
- ❌ **Auto-fit grids** - Use explicit columns only
- ❌ **Fixed height with text** - Use `minHeight`
- ❌ **Small text** - Under 16px font size
- ❌ **Multiple absolute positioned elements** in same scene

## 🎯 COMPONENT TEMPLATE

```typescript
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { parseGuidelinesConfig, generateTypography, generateFontContainerStyles } from './typography';

export const ComponentName: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Read configuration from PROJECT_CONFIG.md
  const config = parseGuidelinesConfig(guidelinesContent);
  const TYPOGRAPHY = generateTypography(
    config.selectedFontStack,
    config.typographyScale,
    config.fontStacks,
    config.baseSizes
  );
  const FONT_CONTAINER_STYLES = generateFontContainerStyles(
    config.selectedFontStack,
    config.fontStacks
  );
  
  // Safe interpolation
  const safeInterpolate = (frame, inputRange, outputRange, easing) => {
    const [inputStart, inputEnd] = inputRange;
    if (inputEnd === inputStart) return inputRange[0];
    if (frame <= inputStart) return outputRange[0];
    if (frame >= inputEnd) return outputRange[1];
    return interpolate(frame, inputRange, outputRange, { easing });
  };
  
  // Overlapping scenes
  const animations = {
    scene1: {
      opacity: safeInterpolate(frame, [0, 20], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [60, 75], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [0, 20], [config.animationConfig.entryDistance || 40, 0], Easing.out(Easing.cubic))
    }
  };
  
  return (
    <AbsoluteFill style={{...FONT_CONTAINER_STYLES, width: '100%', height: '100%'}}>
      {animations.scene1.opacity > 0.01 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '800px',
          textAlign: 'center',
          opacity: animations.scene1.opacity,
          transform: `translate(-50%, -50%) translateY(${animations.scene1.entryY}px)`
        }}>
          <h1 style={{...TYPOGRAPHY.h1, color: config.colors.text.primary}}>
            Title
          </h1>
          <p style={{...TYPOGRAPHY.body, color: config.colors.text.secondary}}>
            Content
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};
```

**This file contains the essential animation patterns - combine with PROJECT_CONFIG.md for complete system!**