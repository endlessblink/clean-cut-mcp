# Remotion Trailer - Complete Design Guide
## Professional Animation Patterns & Techniques Reference

**Total Frames Analyzed:** 2,934 frames (97.8 seconds @ 30fps)
**Analysis Date:** September 30, 2025
**Source:** Remotion Official Trailer Frame-by-Frame Analysis (29 Batches)

---

## Table of Contents

1. [Transition Techniques](#transition-techniques)
2. [Visual Design Patterns](#visual-design-patterns)
3. [Color Palettes](#color-palettes)
4. [Typography Principles](#typography-principles)
5. [Motion Choreography](#motion-choreography)
6. [Timing Patterns](#timing-patterns)
7. [Code Implementation Patterns](#code-implementation-patterns)

---

## Transition Techniques

### 1. **Hard Cut**
- **Used In:** Frames 662 (logo to code), 860 (Video.tsx to MyVideo.tsx), 1332 (phone to code scene)
- **Duration:** Instant (1 frame)
- **Purpose:** Clear delineation between distinct content sections
- **Best For:** Major topic changes, educational content segmentation

```typescript
// Implementation
{showScene1 && <Scene1 />}
{showScene2 && <Scene2 />}
```

### 2. **Fade Transitions**
- **Opacity Fade In/Out**
  - Used throughout for text and UI elements
  - Duration: 5-17 frames (0.17-0.57s)
  - Curve: Linear or slight ease-in-out

- **Synchronized Multi-Element Fade**
  - Text + Logo fade together (frames 421-437)
  - Duration: 16 frames
  - All elements share timing for cohesion

```typescript
const opacity = interpolate(
  frame,
  [startFrame, endFrame],
  [0, 1],
  { extrapolateRight: 'clamp' }
);
```

### 3. **White Flash Transition**
- **Used In:** Frames 437-448, 1090-1094, 1519-1522
- **Duration:** 5-15 frames (0.17-0.5s)
- **Purpose:** Palette cleanser, cognitive reset between sections
- **Implementation:** Pure white (#FFFFFF) solid frame

```typescript
<Sequence from={437} durationInFrames={11}>
  <AbsoluteFill style={{ backgroundColor: 'white' }} />
</Sequence>
```

### 4. **Horizontal Slide/Wipe**
- **Used In:** Frames 495-510 (question → "Introducing")
- **Duration:** 15 frames (0.5s)
- **Pattern:** Bidirectional (old content exits left, new enters right)
- **Speed:** 128px/frame (1920px in 15 frames)

```typescript
const slideProgress = interpolate(frame, [0, 15], [0, 1]);
const oldX = interpolate(slideProgress, [0, 1], [0, -1920]);
const newX = interpolate(slideProgress, [0, 1], [1920, 0]);
```

### 5. **Crossfade with Scale**
- **Used In:** Frames 1641-1655 (terminal to server-side rendering)
- **Duration:** 14 frames (0.47s)
- **Characteristics:**
  - Outgoing: scale down + fade out
  - Incoming: fade in from right
  - No overlap of major elements

```typescript
const outScale = interpolate(progress, [0, 1], [1, 0.85]);
const outOpacity = interpolate(progress, [0, 1], [1, 0]);
const inOpacity = interpolate(progress, [0, 1], [0, 1]);
```

### 6. **App/Window Transitions**
- **Parallel Slide Transition** (frames 295-305)
  - VS Code slides LEFT while scaling down
  - GitHub slides in from RIGHT
  - Creates depth through parallax effect

```typescript
const fromX = interpolate(progress, [0, 1], [0, -1920]);
const fromScale = interpolate(progress, [0, 1], [1, 0.9]);
const toX = interpolate(progress, [0, 1], [1920, 0]);
```

---

## Visual Design Patterns

### 1. **Centered vs. Asymmetric Layouts**

#### Centered Compositions (Most Common)
- **Used For:** Title cards, key messages, logo reveals
- **Examples:**
  - "How to write a video in React?" (frames 448-481)
  - Logo reveals (frames 540-581)
  - Technology showcase (frames 1095-1155)
- **Spacing:** Generous whitespace (40-60px padding minimum)

#### Asymmetric Layouts
- **Split-Screen Code Editor** (frames 1342-1581)
  - 50/50 vertical split
  - Code (left) + Preview (right)
  - Gradient backgrounds for visual interest

- **Card-Based Layouts** (frames 2682-2934)
  - Left card: Primary CTA
  - Right cards: Secondary/tertiary CTAs
  - Color-coded sections

```css
/* Split-screen pattern */
display: grid;
grid-template-columns: 1fr 1fr;
gap: 0;
```

### 2. **Exploded View/Stack Animations**
- **Used In:** Frames 1220-1232 (device stack)
- **Pattern:** 7 iPhone devices in vertical arrangement
- **Spacing:** Even gaps with 3D perspective
- **Colors:** Gradient from top (purple) to bottom (gray)
- **Purpose:** Showcase content variety

```typescript
devices.map((device, i) => ({
  translateY: i * 120,
  translateZ: i * 20,
  opacity: 0.9 - (i * 0.1),
  scale: 1 - (i * 0.05)
}))
```

### 3. **Radial/Burst Compositions**
- **Used In:** Frames 1250-1272 (sticker burst)
- **Pattern:** Central device with 30+ elements radiating outward
- **Purpose:** Energy, abundance, variety
- **Layout:** Circular arrangement around focal point

```typescript
const angle = (index / total) * Math.PI * 2;
const x = centerX + radius * Math.cos(angle);
const y = centerY + radius * Math.sin(angle);
```

### 4. **Grid Layouts**
- **Technology Stack Display** (frames 1095-1155)
- **Two-column grid:** 6 items left, 5 items right
- **Vertical spacing:** 40-50px between items
- **Alignment:** Left column left-aligned, right column left-aligned

```css
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 40px;
justify-items: start;
```

### 5. **Progressive Disclosure**
- **Staggered Reveals:** Elements appear one-by-one
- **Delay Pattern:** 1-5 frame offset between items
- **Use Cases:** Technology lists, feature highlights
- **Purpose:** Maintain attention, prevent overwhelm

---

## Color Palettes

### Brand Core Colors

#### Remotion Blue
- **Primary:** `#42A5F5` (cyan blue)
- **Secondary:** `#5AB8F6` (brighter cyan)
- **Accent:** `#64B5F6` (light cyan)
- **Gradient:** `#6B9FF5` → `#5DD9E8` (blue to cyan)

#### React Integration
- **React Blue:** `#61DAFB` (official React cyan)
- **Used for orbital animations** (frames 382-437)

### Scene-Specific Palettes

#### Code Editor Scenes
```css
/* VS Code Dark Theme */
background: #1E1E1E
sidebar: #252526
keywords: #C586C0 (purple/magenta)
functions: #4078C0 (blue)
jsx-tags: #F87171 (coral red)
strings: #CE9178 (orange)
comments: #6A9955 (green)
line-numbers: #858585 (gray)
status-bar: #007ACC (blue)
```

#### Technology Showcase (Frames 1095-1155)
```css
/* Left Column */
HTML: #FF6B35 (coral red)
CSS: #00A8E8 (cyan blue)
JS: #FFD23F (yellow)
SVG: #06A77D (teal green)
Canvas: #9D84B7 (purple)
WebGL: #8B4049 (dark red)

/* Right Column */
Three.JS: #000000 (black)
styled-components: #E8A2E0 (pink)
Tailwind: #06B6D4 (cyan)
Bootstrap: #563D7C (navy purple)
jQuery: #0769AD (blue)
```

#### Gradient Backgrounds
- **Pink-Blue Diagonal:** `#FF0080` (pink) → `#0080FF` (blue)
- **Used In:** Code/browser split-screen scenes
- **Angle:** Diagonal (bottom-left to top-right)

### Typography Colors

#### High-Contrast Standards
- **Headlines:** Pure black `#000000`
- **Body Text:** Near-black `#333333`
- **Background:** Pure white `#FFFFFF`
- **Contrast Ratio:** Minimum 7:1 (WCAG AAA)

#### Accent Text
- **Primary CTA:** Cyan `#00BCD4`
- **Secondary Links:** Gradient (pink → purple)
- **Tertiary Links:** Orange `#FF8C00`

---

## Typography Principles

### Font Families

#### UI/Marketing Text
```css
font-family: -apple-system, BlinkMacOSFont, 'Segoe UI', Roboto, Oxygen,
             Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
```
- **Weight Range:** 400 (regular) to 900 (black/ultra-bold)
- **Used For:** Headlines, body text, labels

#### Code Display
```css
font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
```
- **Weight:** 400 (regular only)
- **Line Height:** 1.5-1.8
- **Size:** 14-18px for readability

### Type Scale

#### Headlines
- **Question Cards:** 120-140px (frames 448-481)
- **Feature Titles:** 80-100px (frames 1095-1155)
- **Section Headers:** 48-60px (frames 1656-1681)
- **Weight:** 800-900 (heavy/black)
- **Line Height:** 1.1-1.2 (tight for impact)

#### Body Text
- **Standard:** 16-18px
- **Small:** 12-14px
- **Weight:** 400-500 (regular/medium)
- **Line Height:** 1.5-1.6

#### Code Text
- **Editor Size:** 14-16px
- **Display Size:** 18-24px (when code is hero element)
- **Line Height:** 1.5

### Text Animation Patterns

#### Character-by-Character Typing
- **Speed:** 2-4 frames per character
- **Used In:** Code typing animations (frames 722-781, 882-981)
- **Variations:** Slight timing randomness for natural feel

```typescript
const chars = text.split('');
const visibleChars = Math.floor(interpolate(
  frame, [startFrame, endFrame], [0, chars.length]
));
return chars.slice(0, visibleChars).join('');
```

#### Word-by-Word Reveal
- **Duration:** 5-8 frames per word
- **Pattern:** Left-to-right reading order
- **Used For:** Titles, headlines

#### Fade-In Text
- **Duration:** 10-15 frames (0.33-0.5s)
- **Curve:** Ease-out for welcoming entrance
- **Common:** Used for all static text introductions

---

## Motion Choreography

### 1. **Logo Animations**

#### Scale-Based Growth
- **Pattern:** 0.2 → 1.0 scale over 20 frames
- **Easing:** Spring with damping 80, stiffness 100
- **Combined With:** Opacity fade (0 → 1 over 10 frames)

```typescript
const logoScale = spring({
  frame: frame - logoStart,
  fps: 30,
  config: { damping: 80, stiffness: 100, mass: 1 }
});
```

#### Nested Layer Animation
- **Remotion Logo** (frames 540-565)
  - Three concentric triangular shapes
  - Each layer scales independently
  - Stagger: 2 frame delay between layers
  - Creates ripple/echo effect

#### Orbital Rotation (React Logo)
- **Frames:** 382-437
- **Speed:** 6 degrees per frame (360° in 60 frames)
- **Rings:** 4 orbital rings with different speeds
  - Ring 1: 1.0x speed
  - Ring 2: 1.15x speed
  - Ring 3: 0.9x speed
  - Ring 4: 1.05x speed

```typescript
const rotation = (frame * 6) % 360;
rings.map((ring, i) => ({
  transform: `rotate3d(${ring.axis}, ${rotation * ring.speed}deg)`
}))
```

### 2. **Phone/Device Animations**

#### 3D Rotation
- **Speed:** 3-5 degrees per frame
- **Axis:** Y-axis (vertical rotation)
- **Duration:** Continuous (no reset)
- **Purpose:** Product showcase, dynamic energy

#### Floating Animation
- **Pattern:** Sine wave vertical movement
- **Amplitude:** 5-10px
- **Period:** 60-90 frames (2-3 seconds)

```typescript
const float = Math.sin(frame * 0.05) * 8;
const y = baseY + float;
```

### 3. **Text Animations**

#### Slide Up Entry
- **Distance:** 100px → 0
- **Duration:** 10-15 frames
- **Easing:** Spring (damping 100, stiffness 200, mass 0.5)
- **Combined With:** Scale 0.95 → 1.0

```typescript
const slideUp = spring({
  frame: frame - start,
  fps: 30,
  config: { damping: 100, stiffness: 200, mass: 0.5 }
});
const y = interpolate(slideUp, [0, 1], [100, 0]);
const scale = interpolate(slideUp, [0, 1], [0.95, 1]);
```

#### Staggered Text Reveal
- **Pattern:** Each line/word with offset start time
- **Delay:** 5-8 frames between items
- **Effect:** Creates reading rhythm

```typescript
texts.map((text, i) => {
  const delay = i * 5;
  const opacity = spring({
    frame: frame - (startFrame + delay),
    config: { damping: 200 }
  });
  return <div style={{ opacity }}>{text}</div>;
})
```

### 4. **Progress Indicators**

#### Progress Bar Animation
- **Pattern:** Width 0% → 100%
- **Duration:** Matches actual process (e.g., 20 frames = 20 steps)
- **Visual:** ASCII or graphical bar

```typescript
const progress = interpolate(
  frame, [start, end], [0, 100],
  { extrapolateRight: 'clamp' }
);
<div style={{ width: `${progress}%` }} />
```

#### Frame Counter
- **Pattern:** Real-time `useCurrentFrame()` display
- **Update:** Every frame
- **Used In:** Educational/demo contexts (frames 882-1081)

### 5. **Decorative Line Animations**

#### Draw-On Effect (Frames 2682-2781)
- **Method:** SVG path drawing or width animation
- **Speed:** 0.5-1 second per line segment
- **Overlap:** Lines animate with 0.3-0.5s offset
- **Purpose:** Frame content, guide attention

```typescript
const pathLength = getTotalLength(path);
const progress = spring({ frame, fps: 30 });
const dashOffset = interpolate(
  progress, [0, 1], [pathLength, 0]
);
<path
  strokeDasharray={pathLength}
  strokeDashoffset={dashOffset}
/>
```

#### Corner Curves
- **Pattern:** Rounded corner path reveals
- **Timing:** Activates after straight lines complete
- **Radius:** Consistent with card border-radius (8-12px)

---

## Timing Patterns

### Scene Duration Guidelines

#### Static Holds
- **Minimum:** 13 frames (0.43s) - Quick message
- **Standard:** 25-50 frames (0.83-1.67s) - Reading time
- **Extended:** 70+ frames (2.3s+) - Complex information
- **Examples:**
  - Code display: 13 frames
  - Technology list: 46 frames
  - Final CTA: 43+ frames

#### Transitions
- **Fast Cut:** 1 frame (instant)
- **Quick Fade:** 5 frames (0.17s)
- **Standard Transition:** 10-15 frames (0.33-0.5s)
- **Smooth Transition:** 14-20 frames (0.47-0.67s)

#### Animations
- **Logo Reveal:** 15-20 frames (0.5-0.67s)
- **Text Entry:** 10-15 frames (0.33-0.5s)
- **Code Typing:** 2-4 frames per character
- **Progress Indicators:** Match actual process duration

### The 4-5 Second Rule
**Each major idea gets ~4-5 seconds total screen time:**
- Motion/Reveal: 2s
- Pause/Clean Slate: 0.3s
- New Content: 1-2s
- **Total:** ~3.3-5s per concept

### Pacing Rhythm Patterns

#### Fast-Pause-Hold
1. **Fast:** Continuous motion (logo rotation, typing)
2. **Pause:** White flash or brief transition
3. **Hold:** Static display for comprehension

#### Stagger Timing Formula
```
Item 1: Start at frame 0
Item 2: Start at frame 0 + delay (2-5 frames)
Item 3: Start at frame 0 + (delay * 2)
...
```
**Creates:** Natural, non-overwhelming reveal

---

## Code Implementation Patterns

### 1. **Component Structure**

#### Basic Scene Template
```typescript
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';

export const SceneName: React.FC = () => {
  const frame = useCurrentFrame();

  // Animation values
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  return (
    <AbsoluteFill style={{
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      opacity
    }}>
      {/* Content */}
    </AbsoluteFill>
  );
};
```

#### Multi-Sequence Composition
```typescript
<Composition
  id="Trailer"
  component={TrailerComposition}
  durationInFrames={2934}
  fps={30}
  width={1920}
  height={1080}
/>

export const TrailerComposition: React.FC = () => {
  return (
    <>
      <Sequence from={0} durationInFrames={100}>
        <IntroScene />
      </Sequence>
      <Sequence from={100} durationInFrames={150}>
        <FeatureShowcase />
      </Sequence>
      <Sequence from={250} durationInFrames={200}>
        <CodeDemo />
      </Sequence>
      {/* ... */}
    </>
  );
};
```

### 2. **Animation Utilities**

#### Spring Configuration Presets
```typescript
const springConfigs = {
  smooth: { damping: 200, stiffness: 100 },
  snappy: { damping: 100, stiffness: 200 },
  bouncy: { damping: 80, stiffness: 100, mass: 1.5 },
  gentle: { damping: 200, stiffness: 50 }
};

// Usage
const scale = spring({
  frame,
  fps: 30,
  config: springConfigs.smooth
});
```

#### Interpolation Helpers
```typescript
// Fade in
const fadeIn = (frame: number, start: number, duration: number) => {
  return interpolate(
    frame,
    [start, start + duration],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
};

// Stagger helper
const staggerDelay = (index: number, baseDelay: number = 5) => {
  return index * baseDelay;
};
```

### 3. **Typography Components**

#### Typed Text Effect
```typescript
const TypedText: React.FC<{ text: string; startFrame: number }> = ({
  text,
  startFrame
}) => {
  const frame = useCurrentFrame();
  const charsVisible = Math.floor(
    interpolate(
      frame,
      [startFrame, startFrame + text.length * 3],
      [0, text.length],
      { extrapolateRight: 'clamp' }
    )
  );

  return <span>{text.slice(0, charsVisible)}</span>;
};
```

#### Gradient Text
```typescript
const GradientText: React.FC<{ children: string }> = ({ children }) => {
  return (
    <span style={{
      background: 'linear-gradient(90deg, #e91e63, #9c27b0)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    }}>
      {children}
    </span>
  );
};
```

### 4. **Layout Patterns**

#### Split-Screen Layout
```typescript
const SplitScreen: React.FC<{ left: ReactNode; right: ReactNode }> = ({
  left, right
}) => {
  return (
    <AbsoluteFill style={{ flexDirection: 'row' }}>
      <div style={{ flex: 1, padding: 40 }}>
        {left}
      </div>
      <div style={{ flex: 1, padding: 40 }}>
        {right}
      </div>
    </AbsoluteFill>
  );
};
```

#### Centered Card
```typescript
const CenteredCard: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5F5F5'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: '60px 80px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '80%'
      }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
```

### 5. **Transition Components**

#### Fade Transition
```typescript
const FadeTransition: React.FC<{
  from: ReactNode;
  to: ReactNode;
  transitionStart: number;
  transitionDuration: number;
}> = ({ from, to, transitionStart, transitionDuration }) => {
  const frame = useCurrentFrame();

  const fromOpacity = interpolate(
    frame,
    [transitionStart, transitionStart + transitionDuration],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const toOpacity = interpolate(
    frame,
    [transitionStart, transitionStart + transitionDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <>
      <div style={{ opacity: fromOpacity }}>{from}</div>
      <div style={{ opacity: toOpacity }}>{to}</div>
    </>
  );
};
```

#### White Flash
```typescript
const WhiteFlash: React.FC<{ startFrame: number; duration: number }> = ({
  startFrame, duration
}) => {
  const frame = useCurrentFrame();
  const isActive = frame >= startFrame && frame < startFrame + duration;

  return isActive ? (
    <AbsoluteFill style={{ backgroundColor: 'white', zIndex: 999 }} />
  ) : null;
};
```

---

## Professional Best Practices

### 1. **Performance Optimization**
- Use `will-change: transform` for animated elements
- Limit simultaneous 3D transforms to 4-6 maximum
- Cache static values when possible
- Use CSS transforms over `top`/`left` positioning

### 2. **Readability Standards**
- Hold static text minimum 1 second (30 frames)
- Use maximum contrast (7:1 ratio) for important text
- Large font sizes for video: 48px minimum for headlines
- Line height 1.5-1.8 for body text

### 3. **Accessibility Considerations**
- No flashing content (avoid strobing)
- Smooth transitions (no jarring motion)
- High contrast ratios (WCAG AA minimum)
- Predictable animation direction
- Consider `prefers-reduced-motion` alternatives

### 4. **Composition Guidelines**
- **Rule of Thirds:** Position key elements at intersection points
- **Negative Space:** Minimum 40-60px padding around content
- **Visual Hierarchy:** Use size, color, and position to guide attention
- **Consistency:** Maintain spacing, colors, and timing throughout

### 5. **Scene Structure**
```
Intro (2-3s) → Build (10-15s) → Peak (5-8s) → Transition (0.5-1s) → Next Scene
```
- **Intro:** Establish context
- **Build:** Progressive complexity
- **Peak:** Hero moment or key message
- **Transition:** Clean break to next topic

---

## Quick Reference: Common Patterns

### Logo Reveal
```typescript
<Sequence from={0} durationInFrames={30}>
  <LogoReveal scale={[0.2, 1.0]} fadeIn duration={20} />
</Sequence>
```

### Text Card
```typescript
<Sequence from={30} durationInFrames={60}>
  <CenteredCard>
    <Headline fadeIn delay={5}>Your Message</Headline>
    <Subtext fadeIn delay={15}>Supporting detail</Subtext>
  </CenteredCard>
</Sequence>
```

### Code Display
```typescript
<Sequence from={90} durationInFrames={100}>
  <CodeEditor
    file="example.tsx"
    code={codeString}
    typingSpeed={3} // frames per character
    highlightLines={[5, 10, 15]}
  />
</Sequence>
```

### Technology Showcase
```typescript
<Sequence from={190} durationInFrames={80}>
  <TechGrid
    items={technologies}
    staggerDelay={5}
    holdDuration={50}
  />
</Sequence>
```

### CTA Screen
```typescript
<Sequence from={2800} durationInFrames={135}>
  <CTAScreen
    primaryAction="yarn create video"
    documentation="remotion.dev"
    repository="github.com/..."
    fadeOut={9} // frames
  />
</Sequence>
```

---

## Conclusion

This guide captures the professional animation techniques used in the official Remotion trailer. Key principles:

1. **Simplicity:** Clean, focused animations without excessive complexity
2. **Timing:** Strategic pauses allow comprehension
3. **Consistency:** Maintain visual language throughout
4. **Purpose:** Every motion serves the narrative
5. **Polish:** Smooth transitions and professional finishing

**Total Duration:** 97.8 seconds
**Total Frames:** 2,934 frames
**Frame Rate:** 30 fps
**Resolution:** 1920x1080 (Full HD)

**Use this guide to:**
- Create professional marketing videos
- Design tutorial content
- Build product showcases
- Develop educational animations
- Implement Remotion best practices

---

*Analysis Complete: September 30, 2025*
*Source: Frame-by-frame analysis of Remotion official trailer*
