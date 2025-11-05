# 🎬 Advanced Motion Choreography Patterns
**Professional motion graphics techniques for engaging animations**

---

## Table of Contents

1. [Transition Types](#transition-types)
2. [Camera Movement Patterns](#camera-movement-patterns)
3. [Advanced Transitions](#advanced-transitions)
4. [Morphing & Shape Animations](#morphing--shape-animations)
5. [Mask-Based Transitions](#mask-based-transitions)
6. [When to Use What](#when-to-use-what)
7. [Common Mistakes](#common-mistakes)

---

## Transition Types

### 1. **Cut on Action**

**Definition**: Cutting from one scene to another while an action is occurring, creating seamless motion continuity.

**When to Use**:
- Scene changes with related motion
- Maintaining energy between cuts
- Creating visual rhythm

**Implementation**:
```typescript
// Scene A (ends with motion)
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Element moving right at end
  const x = interpolate(frame, [50, 70], [0, 1920], {
    extrapolateRight: 'clamp'
  });

  return (
    <div style={{ transform: `translateX(${x}px)` }}>
      Moving Element
    </div>
  );
};

// Scene B (starts with same motion direction)
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();

  // Continue motion from left
  const x = interpolate(frame, [0, 20], [-1920, 0], {
    extrapolateRight: 'clamp'
  });

  return (
    <div style={{ transform: `translateX(${x}px)` }}>
      Continuing Element
    </div>
  );
};

// Usage in composition
<Sequence from={0} durationInFrames={70}>
  <Scene1 />
</Sequence>
<Sequence from={70} durationInFrames={90}> {/* No gap - direct cut */}
  <Scene2 />
</Sequence>
```

**Key Parameters**:
- Motion direction must match across cut
- Speed should be consistent (same pixels/frame)
- No overlap - hard cut at exact frame

**Professional Quality Standards**:
- ✅ Motion vectors aligned (same direction + speed)
- ✅ Visual weight similar between elements
- ✅ Action feels continuous, not jarring
- ❌ Don't use if motion directions conflict

---

### 2. **Match Cut**

**Definition**: Cutting between two visually similar compositions, creating conceptual continuity.

**When to Use**:
- Connecting related ideas
- Creating visual metaphors
- Smooth conceptual transitions

**Implementation**:
```typescript
// Scene A: Circle shape at center
const CircleScene: React.FC = () => {
  const opacity = interpolate(frame, [40, 50], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity }}>
      <Circle
        size={200}
        center={{ x: 960, y: 540 }}
        color="#10b981"
      />
    </AbsoluteFill>
  );
};

// Scene B: Similar circle shape (same position/size)
const LogoScene: React.FC = () => {
  const opacity = interpolate(frame, [0, 10], [0, 1]);

  return (
    <AbsoluteFill style={{ opacity }}>
      <Logo
        size={200}
        center={{ x: 960, y: 540 }}
        color="#10b981"
      />
    </AbsoluteFill>
  );
};

// Overlapping sequences for crossfade
<Sequence from={0} durationInFrames={50}>
  <CircleScene />
</Sequence>
<Sequence from={45} durationInFrames={60}> {/* 5-frame overlap */}
  <LogoScene />
</Sequence>
```

**Key Parameters**:
- Matching positions (same x/y coordinates)
- Similar sizes (scale within 10%)
- 5-10 frame crossfade overlap
- Visual similarity (shape, color, or concept)

**Professional Quality Standards**:
- ✅ Exact positional alignment
- ✅ Smooth crossfade (5-15 frames)
- ✅ Conceptual connection clear
- ❌ Don't force unrelated elements

---

## Camera Movement Patterns

### 1. **Dolly (Push/Pull)**

**Definition**: Camera movement toward (push in) or away (pull out) from subject on Z-axis.

**When to Use**:
- Revealing details (push in)
- Showing context (pull out)
- Creating dramatic reveals

**Implementation**:
```typescript
const DollyPushIn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Push in: scale increases, simulates moving closer
  const scale = spring({
    frame,
    fps,
    from: 1,
    to: 2,
    config: { damping: 100, stiffness: 200 }
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center'
      }}>
        {/* Your content */}
        <ContentElement />
      </div>
    </AbsoluteFill>
  );
};

// Pull out (reverse)
const DollyPullOut: React.FC = () => {
  const scale = spring({
    frame,
    fps,
    from: 2,
    to: 1, // Reverse direction
    config: { damping: 100, stiffness: 200 }
  });

  return (
    <div style={{ transform: `scale(${scale})` }}>
      <ContentElement />
    </div>
  );
};
```

**Key Parameters**:
- **Duration**: 30-60 frames (1-2 seconds)
- **Scale range**: 1.0 → 1.5 to 2.0 (push in), reverse for pull out
- **Spring config**: damping 100-120, stiffness 150-200
- **Transform origin**: Usually center, but can be custom focal point

**Professional Quality Standards**:
- ✅ Smooth acceleration/deceleration (spring physics)
- ✅ Focal point remains stable
- ✅ Content remains readable throughout
- ❌ Don't scale beyond 3x (content degrades)

---

### 2. **Truck (Lateral Movement)**

**Definition**: Camera movement left or right on X-axis (horizontal tracking).

**When to Use**:
- Following moving subjects
- Revealing horizontal compositions
- Creating parallax effects

**Implementation**:
```typescript
const TruckRight: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Move scene left (camera appears to move right)
  const x = spring({
    frame,
    fps,
    from: 0,
    to: -1920, // Full screen width
    config: { damping: 100, stiffness: 200 }
  });

  return (
    <AbsoluteFill>
      <div style={{
        transform: `translateX(${x}px)`,
        width: '200%', // Content wider than viewport
        display: 'flex'
      }}>
        {/* Content spans beyond screen */}
        <Section1 width="100%" />
        <Section2 width="100%" />
      </div>
    </AbsoluteFill>
  );
};

// With parallax effect (multiple layers at different speeds)
const TruckWithParallax: React.FC = () => {
  const x = spring({ frame, fps, from: 0, to: -1920, config: { damping: 100, stiffness: 200 } });

  return (
    <AbsoluteFill>
      {/* Background layer - slower movement */}
      <div style={{ transform: `translateX(${x * 0.5}px)` }}>
        <BackgroundLayer />
      </div>

      {/* Midground layer - medium speed */}
      <div style={{ transform: `translateX(${x * 0.75}px)` }}>
        <MidgroundLayer />
      </div>

      {/* Foreground layer - full speed */}
      <div style={{ transform: `translateX(${x}px)` }}>
        <ForegroundLayer />
      </div>
    </AbsoluteFill>
  );
};
```

**Key Parameters**:
- **Duration**: 40-90 frames (1.5-3 seconds)
- **Distance**: Full screen width (1920px) or partial
- **Parallax multipliers**: 0.5x (background), 0.75x (mid), 1.0x (foreground)
- **Spring config**: damping 100, stiffness 200

**Professional Quality Standards**:
- ✅ Smooth motion with spring physics
- ✅ Content wider than viewport (no empty edges)
- ✅ Parallax adds depth
- ❌ Don't move so fast content becomes unreadable

---

### 3. **Pedestal (Vertical Movement)**

**Definition**: Camera movement up or down on Y-axis (vertical tracking).

**When to Use**:
- Revealing vertical compositions
- Following vertical action
- Creating height reveals

**Implementation**:
```typescript
const PedestalUp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Move scene down (camera appears to move up)
  const y = spring({
    frame,
    fps,
    from: 0,
    to: -1080, // Full screen height
    config: { damping: 100, stiffness: 200 }
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{
        transform: `translateY(${y}px)`,
        height: '200%' // Content taller than viewport
      }}>
        {/* Vertical content stack */}
        <TopSection height="50%" />
        <BottomSection height="50%" />
      </div>
    </AbsoluteFill>
  );
};
```

**Key Parameters**:
- **Duration**: 40-90 frames
- **Distance**: Full screen height (1080px) or partial
- **Spring config**: damping 100, stiffness 200

---

## Advanced Transitions

### 1. **Infinite Zoom**

**Definition**: Continuous zoom animation creating hypnotic, never-ending depth illusion.

**When to Use**:
- Creating mesmerizing loops
- Tunnel/portal effects
- Psychedelic/surreal transitions

**Implementation**:
```typescript
const InfiniteZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Calculate zoom that loops seamlessly
  const loop = frame % 60; // Loop every 60 frames (2 seconds at 30fps)
  const scale = interpolate(loop, [0, 60], [1, 2]); // Zoom from 1x to 2x

  // Multiple nested layers for infinite effect
  const layers = [0, 1, 2, 3, 4];

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {layers.map((layerIndex) => {
        // Each layer starts at different scale for continuous effect
        const layerScale = scale * Math.pow(2, layerIndex);
        const opacity = layerScale < 8 ? 1 : 0; // Fade out far layers

        return (
          <div
            key={layerIndex}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transform: `scale(${layerScale})`,
              transformOrigin: 'center center',
              opacity
            }}
          >
            {/* Content repeats at each scale */}
            <ZoomPattern />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Pattern component with center opening
const ZoomPattern: React.FC = () => (
  <div style={{
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '40px solid #10b981',
    boxSizing: 'border-box'
  }}>
    {/* Center opening for next layer */}
  </div>
);
```

**Key Parameters**:
- **Loop duration**: 60-90 frames for smooth loop
- **Scale factor**: 2x per loop (doubles each iteration)
- **Layer count**: 4-5 layers for continuous effect
- **Fade distance**: Fade out when scale > 8x

**Professional Quality Standards**:
- ✅ Seamless loop (end state = start state)
- ✅ Smooth scaling (spring or linear)
- ✅ Multiple layers for continuity
- ❌ Don't make loop too fast (disorienting)

---

### 2. **Clean Morph Animation**

**Definition**: Smooth transformation between two shapes or objects.

**When to Use**:
- Shape-to-shape transitions
- Icon transformations
- Conceptual connections

**Implementation**:
```typescript
// Using SVG path morphing
const MorphTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 150 }
  });

  // Interpolate between two SVG paths
  const startPath = "M 100,100 L 300,100 L 300,300 L 100,300 Z"; // Square
  const endPath = "M 200,50 L 350,200 L 200,350 L 50,200 Z"; // Diamond

  // Simple linear interpolation between paths
  // (In production, use proper SVG path morphing library)
  const morphedPath = interpolatePath(startPath, endPath, progress);

  return (
    <AbsoluteFill>
      <svg width="1920" height="1080">
        <path
          d={morphedPath}
          fill="#10b981"
          stroke="none"
        />
      </svg>
    </AbsoluteFill>
  );
};

// Helper function (simplified - use library in production)
function interpolatePath(start: string, end: string, progress: number): string {
  // Use d3-interpolate-path or similar library
  // This is a placeholder
  return progress < 0.5 ? start : end;
}
```

**Key Parameters**:
- **Duration**: 20-40 frames (0.7-1.3 seconds)
- **Spring config**: damping 80-100, stiffness 150-200
- **Path complexity**: Match vertex counts between shapes

**Professional Quality Standards**:
- ✅ Matching vertex counts (smooth interpolation)
- ✅ Topology preserved (no flips/inversions)
- ✅ Smooth continuous motion
- ❌ Don't morph vastly different shapes (looks glitchy)

---

### 3. **Organic Shape Transitions**

**Definition**: Natural, flowing transitions using bezier curves and soft shapes.

**When to Use**:
- Fluid brand transitions
- Organic/natural themes
- Soft, friendly aesthetics

**Implementation**:
```typescript
const OrganicTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Multiple sine waves create organic movement
  const progress = spring({ frame, fps, config: { damping: 60, stiffness: 120 } });

  // Generate organic blob shape using multiple sine waves
  const blobPath = generateBlobPath(progress);

  return (
    <AbsoluteFill style={{ background: '#0a0a0a' }}>
      <svg width="1920" height="1080" style={{ position: 'absolute' }}>
        <path
          d={blobPath}
          fill="#10b981"
          opacity={0.8}
          filter="blur(20px)" // Soft edges
        />
      </svg>
    </AbsoluteFill>
  );
};

function generateBlobPath(progress: number): string {
  const centerX = 960;
  const centerY = 540;
  const radius = 200 + progress * 100;
  const points = 8;

  let path = `M `;

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    // Add organic variation using sine waves
    const variation = Math.sin(angle * 3 + progress * 2) * 30;
    const r = radius + variation;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);

    if (i === 0) {
      path += `${x},${y} `;
    } else {
      // Use bezier curves for smoothness
      const prevAngle = ((i - 1) / points) * Math.PI * 2;
      const cpDistance = radius * 0.5;
      const cp1x = centerX + cpDistance * Math.cos(prevAngle + 0.5);
      const cp1y = centerY + cpDistance * Math.sin(prevAngle + 0.5);
      path += `Q ${cp1x},${cp1y} ${x},${y} `;
    }
  }

  path += 'Z';
  return path;
}
```

**Key Parameters**:
- **Variation amplitude**: 20-40px for subtle organic feel
- **Sine wave frequency**: 2-4x for natural undulation
- **Spring config**: Lower damping (60-80) for fluid motion
- **Blur amount**: 10-30px for soft edges

---

## Mask-Based Transitions

### 1. **Mask Reveal**

**Definition**: Using animated masks to reveal content progressively.

**When to Use**:
- Dramatic content reveals
- Shape-based transitions
- Creative wipes

**Implementation**:
```typescript
const MaskReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 200 }
  });

  // Animated mask size
  const maskSize = interpolate(progress, [0, 1], [0, 2000]);

  return (
    <AbsoluteFill>
      {/* Content to reveal */}
      <div style={{
        width: '100%',
        height: '100%',
        clipPath: `circle(${maskSize}px at center)`
      }}>
        <RevealedContent />
      </div>
    </AbsoluteFill>
  );
};

// Directional wipe mask
const DirectionalWipe: React.FC = () => {
  const progress = spring({ frame, fps, config: { damping: 100, stiffness: 200 } });
  const wipePosition = interpolate(progress, [0, 1], [0, 100]);

  return (
    <div style={{
      clipPath: `polygon(0 0, ${wipePosition}% 0, ${wipePosition}% 100%, 0 100%)`
    }}>
      <Content />
    </div>
  );
};
```

**Key Parameters**:
- **Mask shape**: circle, polygon, custom SVG
- **Reveal duration**: 20-40 frames
- **Spring config**: damping 100, stiffness 200

---

## Transition Fluency Principles

### What Makes Transitions Feel Smooth vs Jarring

**These are HARD RULES extracted from professional work - follow them EXACTLY.**

#### 1. **Motion Continuity**

**✅ DO (Feels Smooth):**
- Align motion vectors within 15° of same direction
- Match speeds within ±20% (if Scene A moves 50px/frame, Scene B should move 40-60px/frame)
- Preserve momentum through cuts (use same acceleration curve)
- Spring config should stay consistent (damping ±10, stiffness ±20)

**❌ DON'T (Feels Jarring):**
- Reverse direction suddenly (left → right with no motivation)
- Change speed >50% (creates visual "hiccup")
- Switch from spring physics to linear (feels mechanical)
- Mix easing curves randomly (cubic-out → bounce-in feels wrong)

**Objective Test:**
```typescript
// Check motion continuity between scenes
const scene1ExitVelocity = calculateVelocity(scene1, lastFrames);
const scene2EntryVelocity = calculateVelocity(scene2, firstFrames);
const velocityDifference = Math.abs(scene1ExitVelocity - scene2EntryVelocity);

// RULE: Difference must be < 20% for smooth feel
if (velocityDifference / scene1ExitVelocity > 0.2) {
  console.error('❌ JARRING TRANSITION: Speed mismatch too large');
}
```

#### 2. **Visual Harmony**

**✅ DO (Feels Pleasant):**
- Similar color saturation levels (±15% saturation)
- Matching visual weights (element sizes within 30% ratio)
- Consistent energy levels (both calm OR both energetic)
- Preserve focal point position (±100px max drift)

**❌ DON'T (Feels Unpleasant):**
- Jump from saturated (#10b981) to desaturated (#808080) suddenly
- Mix giant elements (200px) with tiny elements (20px) in same scene
- Jump from calm (slow, minimal motion) to chaotic (fast, lots of motion)
- Move focal point >30% of screen between scenes

**Objective Test:**
```typescript
// Check visual harmony
const scene1Saturation = getAverageSaturation(scene1);
const scene2Saturation = getAverageSaturation(scene2);
const saturationDiff = Math.abs(scene1Saturation - scene2Saturation);

// RULE: Saturation difference must be < 15% for pleasant feel
if (saturationDiff > 15) {
  console.error('❌ UNPLEASANT TRANSITION: Saturation jump too large');
}
```

#### 3. **Timing Feel**

**✅ DO (Feels Natural):**
- Use spring physics for ALL organic motion (damping 80-120, stiffness 150-250)
- Match timing to scene energy:
  - Calm scenes: 45-60 frame transitions
  - Moderate: 30-45 frames
  - Energetic: 20-30 frames
- Respect 16-frame rhythm (frames align to multiples of 16 for musical feel)
- Acceleration/deceleration curves should mirror (ease-out entry = ease-in exit)

**❌ DON'T (Feels Unnatural):**
- Use linear interpolation for organic elements (feels robotic)
- Make transitions <15 frames (too fast to perceive) or >90 frames (drags)
- Mix timing randomly (one scene 20 frames, next 80 frames - feels inconsistent)
- Use same easing for entry and exit (should be opposite: ease-out IN, ease-in OUT)

**Exact Values to Use:**
```typescript
// PROVEN TIMING VALUES - Don't deviate without reason

const TIMING_STANDARDS = {
  // Transition durations (EXACT values, not ranges)
  quickTransition: 20,      // Fast cuts, energetic scenes
  standardTransition: 30,   // Most common, safe default
  slowTransition: 45,       // Dramatic, important moments

  // Spring physics (EXACT configs from Remotion trailer)
  standardSpring: { damping: 100, stiffness: 200 },  // Most versatile
  softSpring: { damping: 120, stiffness: 150 },      // Slower, heavier feel
  snappySpring: { damping: 80, stiffness: 250 },     // Quick, responsive

  // Easing curves (use THESE, not custom)
  entryEasing: Easing.out(Easing.cubic),   // Decelerate into place
  exitEasing: Easing.in(Easing.cubic),     // Accelerate out

  // Rhythm alignment (align scene starts to these)
  rhythmBeats: [0, 16, 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240]
};
```

#### 4. **Compositional Flow**

**✅ DO (Creates Flow):**
- Maintain focal point within 200px between scenes (eye tracking continuity)
- Exit motion should lead into entry motion (down → up feels natural)
- Similar visual density (don't jump from minimal to cluttered)
- Preserve reading direction (left-to-right for Western audiences)

**❌ DON'T (Breaks Flow):**
- Jump focal point from far left to far right (>600px)
- Random motion directions (up exit, sideways entry - disconnected)
- Mix visual styles (minimal → busy → minimal - inconsistent)
- Reverse reading direction without motivation

**Objective Test:**
```typescript
// Check focal point continuity
const scene1FocalPoint = calculateFocalPoint(scene1);
const scene2FocalPoint = calculateFocalPoint(scene2);
const focalDrift = distance(scene1FocalPoint, scene2FocalPoint);

// RULE: Focal point should drift < 200px for smooth flow
if (focalDrift > 200) {
  console.error('❌ BREAKS FLOW: Focal point jump too large');
}
```

### Fluency Checklist (MUST PASS ALL)

**Before calling a transition "smooth":**
- [ ] Motion vectors aligned (< 15° difference)
- [ ] Speed change < 20%
- [ ] Saturation change < 15%
- [ ] Visual weight ratio within 30%
- [ ] Using spring physics (not linear)
- [ ] Timing matches scene energy
- [ ] Frames aligned to 16-frame rhythm
- [ ] Focal point drift < 200px
- [ ] Motion direction motivated (leads naturally)
- [ ] Visual density consistent

**If ANY checkbox fails**: Transition will likely feel jarring/unpleasant.

### Professional Quality Standards (Measurable)

| Metric | Poor | Acceptable | Professional |
|--------|------|------------|--------------|
| Motion vector alignment | >30° | 15-30° | <15° |
| Speed consistency | >50% change | 20-50% | <20% |
| Saturation continuity | >30% jump | 15-30% | <15% |
| Focal point drift | >400px | 200-400px | <200px |
| Transition duration | <15 or >90 frames | 15-20 or 60-90 | 20-60 frames |
| Spring damping | <60 or >150 | 60-80 or 120-150 | 80-120 |
| Visual weight ratio | >50% change | 30-50% | <30% |

**How to use**: Measure your transition against these values. If in "Poor" column, it WILL look bad.

---

## When to Use What

### Strict Decision Trees (No Judgment Required)

**Follow these decision trees EXACTLY to choose patterns:**

#### **Decision Tree 1: Scene Transition Type**

```
START: Need to transition from Scene A to Scene B

Q1: Is there motion in Scene A's exit?
├─ YES → Q2: Does Scene B's entry motion match direction?
│   ├─ YES → USE: Cut on Action
│   └─ NO → Q3: Are scenes conceptually related?
│       ├─ YES → USE: Match Cut (find visual similarity)
│       └─ NO → USE: Crossfade with Scale
└─ NO → Q3: Are elements visually similar (shape/color/position)?
    ├─ YES → USE: Match Cut
    └─ NO → Q4: What's the energy difference?
        ├─ LOW (similar energy) → USE: Simple Crossfade (15 frames)
        ├─ MEDIUM (moderate jump) → USE: Crossfade with Scale
        └─ HIGH (big energy shift) → USE: White Flash (5-10 frames only)
```

#### **Decision Tree 2: Camera Movement**

```
START: Need to show content that's larger than viewport

Q1: Is content wider or taller than screen?
├─ WIDER → USE: Truck (lateral movement)
│   └─ With layers at different depths? → ADD: Parallax (0.5x, 0.75x, 1.0x)
└─ TALLER → USE: Pedestal (vertical movement)

Q2: Need to reveal detail or context?
├─ REVEAL DETAIL → USE: Dolly Push In
│   └─ Scale range: 1.0 → 1.5 (EXACTLY, not more)
│   └─ Duration: 45 frames (EXACTLY)
│   └─ Spring: damping 100, stiffness 200 (EXACTLY)
└─ SHOW CONTEXT → USE: Dolly Pull Out
    └─ Scale range: 2.0 → 1.0 (reverse)
    └─ Duration: 45 frames
    └─ Spring: damping 100, stiffness 200

Q3: Need continuous looping effect?
└─ YES → USE: Infinite Zoom
    └─ Loop duration: 60 frames (EXACTLY)
    └─ Scale per loop: 2.0x (EXACTLY)
    └─ Layers: 4-5 (EXACTLY)
```

#### **Decision Tree 3: Content Transformation**

```
START: Need to transform between two elements

Q1: Are elements different shapes?
├─ YES → Q2: Do shapes have similar topology?
│   ├─ YES → USE: Clean Morph
│   │   └─ Duration: 30 frames
│   │   └─ Spring: damping 80, stiffness 150
│   └─ NO → Q3: Want organic/fluid feel?
│       ├─ YES → USE: Organic Shape Transition
│       │   └─ Blob variation: 30px
│       │   └─ Sine frequency: 3x
│       └─ NO → USE: Mask Transition (reveal next, hide previous)
└─ NO → USE: Crossfade (simple opacity)
    └─ Duration: 15-20 frames
```

#### **Decision Tree 4: Content Reveal**

```
START: Need to reveal content dramatically

Q1: What's the reveal shape?
├─ CIRCULAR → USE: Circular Mask Reveal
│   └─ Center: focal point of content
│   └─ Max radius: 2000px
│   └─ Duration: 30 frames
├─ RECTANGULAR → USE: Directional Wipe
│   └─ Direction: left-to-right (standard) or top-to-bottom
│   └─ Duration: 25 frames
└─ CUSTOM SHAPE → USE: Custom Mask Path
    └─ Follow shape of content being revealed
    └─ Duration: 30-40 frames
```

### Pattern Combination Rules

**NEVER combine these:**
- ❌ Dolly + Truck (competing camera movements)
- ❌ Multiple morphs simultaneously (visual chaos)
- ❌ Infinite zoom + other patterns (zoom is standalone effect)
- ❌ >2 advanced patterns in one scene (overwhelming)

**SAFE combinations:**
- ✅ Truck + Parallax (enhances depth)
- ✅ Match Cut + Simple Scale (adds polish)
- ✅ Crossfade + Slight Movement (prevents static feel)
- ✅ Mask Reveal + Spring Entry (combined effect)

### Decision Matrix (Reference)

### Scene-by-Scene Choreography Planning

**Example 30-second animation structure:**

```
Scene 1 (0-90 frames):
  - Dolly push in to logo
  - Spring physics entry

Scene 2 (75-165 frames): [15-frame overlap]
  - Match cut: Logo → Product icon
  - Crossfade transition

Scene 3 (150-240 frames): [15-frame overlap]
  - Truck right revealing features
  - Parallax effect

Scene 4 (225-315 frames): [15-frame overlap]
  - Mask reveal of final CTA
  - Circular wipe

Scene 5 (300-450 frames): [15-frame overlap]
  - Infinite zoom loop
  - Hold for end
```

---

## Common Mistakes

### ❌ **Overusing Advanced Patterns**
**Problem**: Every transition is complex, viewer becomes exhausted
**Solution**: Use 1-2 advanced patterns per 30-second animation, keep others simple

### ❌ **Mismatched Motion Vectors in Cut on Action**
**Problem**: Direction or speed doesn't match, looks jarring
**Solution**: Measure exact pixels/frame, ensure continuity

### ❌ **Too-Fast Camera Movements**
**Problem**: Viewer gets disoriented, content unreadable
**Solution**: Limit to 20-30px/frame max, use spring physics

### ❌ **Infinite Zoom Doesn't Loop**
**Problem**: Visible jump when animation restarts
**Solution**: Ensure end state visually matches start state exactly

### ❌ **Complex Morphs Between Incompatible Shapes**
**Problem**: Glitchy, unnatural transformation
**Solution**: Match vertex counts, use similar topologies

### ❌ **Mask Reveals Too Slow**
**Problem**: Viewer loses interest, pacing drags
**Solution**: Keep reveals to 20-40 frames (0.7-1.3 seconds)

---

## Implementation Checklist

**Before using advanced patterns:**
- [ ] Pattern serves the narrative (not decorative)
- [ ] Timing appropriate (not too fast/slow)
- [ ] Spring physics for natural motion
- [ ] Tested at full resolution
- [ ] Maintains readability throughout
- [ ] Doesn't conflict with other patterns
- [ ] Enhances rather than distracts from content

**Quality standards:**
- [ ] Smooth motion (60fps preview)
- [ ] No jitter or stuttering
- [ ] Proper overlap timing (15 frames for transitions)
- [ ] Content remains readable
- [ ] Professional polish (no glitches)

---

## Additional Resources

**Remotion Trailer Analysis**: `/docs/REMOTION-TRAILER-COMPLETE-DESIGN-GUIDE.md`
**Basic Timing Patterns**: `REMOTION_ANIMATION_RULES.md`
**Configuration Options**: `PROJECT_CONFIG.md`

**Last Updated**: October 1, 2025
**Version**: 1.0
