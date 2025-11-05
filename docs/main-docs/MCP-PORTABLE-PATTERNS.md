# MCP-Portable Patterns
**Validated patterns from iterative showcase development - ready for MCP integration**

**Date**: October 1, 2025
**Status**: Ready for MCP porting
**Source**: 5 iterations of showcase animations (PatternBased → Validated → Fluent → Enhanced → NoOverlap)

---

## 🎯 PATTERNS READY FOR MCP

These patterns were discovered through iterative development and are ready to be integrated into the MCP server's animation generation.

### 1. **NoOverlapScene Component** ⭐ CRITICAL

**Problem it solves**: Overlapping content was persistent issue across all attempts.

**Pattern discovered**:
```typescript
// Component that makes overlapping IMPOSSIBLE through structure
<NoOverlapScene
  startFrame={0}
  endFrame={70}          // Hard boundary - won't render after this
  exitType="wipe-left"   // Only wipes/cuts, NO crossfades
  exitDuration={15}
>
  <YourContent />
</NoOverlapScene>
```

**Why it works**:
- `if (frame < start || frame >= end) return null;` - Hard boundaries
- Exit handled automatically (no manual opacity)
- Only movement-based exits (wipes) or instant (hard cuts)
- No opacity-based crossfades (they cause inherent overlaps)

**MCP Integration**:
```typescript
// MCP ALWAYS generates with NoOverlapScene wrapper
function generateScene(sceneConfig) {
  return `
    <NoOverlapScene
      startFrame={${sceneConfig.startFrame}}
      endFrame={${sceneConfig.endFrame}}
      exitType="${sceneConfig.exitType}"
    >
      ${generateSceneContent(sceneConfig)}
    </NoOverlapScene>
  `;
}
```

**File location**: `clean-cut-workspace/src/components/NoOverlapScene.tsx`

---

### 2. **Continuous Motion Formulas** ⭐ CRITICAL

**Problem it solves**: Static holds create "dull moments" - animation stops and becomes boring.

**Pattern discovered**:
```typescript
// EVERY shot must have 2-3 continuous motions

// 1. Continuous float (vertical breathing)
const float = Math.sin(frame * 0.05-0.1) * 5-10;  // px
transform: `translateY(${float}px)`

// 2. Continuous zoom (slow dolly)
const zoom = 1 + frame * 0.001-0.003;  // scale
transform: `scale(${zoom})`

// 3. Pulsing glow (breathing light)
const pulse = Math.sin(frame * 0.1-0.15) * 0.2-0.3 + 0.5;  // opacity
textShadow: `0 0 ${20-40}px rgba(R,G,B, ${pulse})`

// 4. Subtle rotation (optional, for emphasis)
const rotate = frame * 0.1-0.3;  // degrees
transform: `rotate(${rotate}deg)`
```

**Rule**: NEVER have static holds. Motion continues until shot exits.

**MCP Integration**:
```typescript
// MCP adds continuous motion to ALL content
function applyContinu ousMotion(element, frame) {
  const float = `Math.sin(${frame} * 0.07) * 8`;
  const zoom = `1 + ${frame} * 0.002`;

  return `
    <div style={{
      transform: \`translateY(\${${float}}px) scale(\${${zoom}})\`
    }}>
      ${element}
    </div>
  `;
}
```

---

### 3. **Unified Transform Structure** ⭐ HIGH PRIORITY

**Problem it solves**: Particles/background elements were static while content moved.

**Pattern discovered**:
```typescript
// Apply transform to PARENT - all children move together
<AbsoluteFill style={{ transform: combinedTransform }}>
  <Particles />   {/* Moves WITH transform */}
  <Background />  {/* Moves WITH transform */}
  <Content />     {/* Moves WITH transform */}
</AbsoluteFill>

// NOT like this (particles don't move):
<>
  <div style={{ transform: X }}><Content /></div>
  <Particles />  {/* Static - doesn't move */}
</>
```

**Rule**: Transformations on parent = all children move together.

**MCP Integration**:
```typescript
// MCP structures shots with unified transforms
function generateShot(content, particles, transform) {
  return `
    <AbsoluteFill style={{ transform: "${transform}" }}>
      <ParticleLayer>${particles}</ParticleLayer>
      <ContentLayer>${content}</ContentLayer>
    </AbsoluteFill>
  `;
}
```

---

### 4. **Conditional Motion Blur** ⭐ MEDIUM PRIORITY

**Problem it solves**: Blur on static content looks like soft focus (wrong). Need blur only during fast movement.

**Pattern discovered**:
```typescript
// Calculate velocity
const velocity = Math.abs(translateY);  // or translateX, or scale change

// Blur ONLY during fast movement AND entry/exit
const isMovingFast = velocity > 50 && frame < entryDuration;
const blurAmount = isMovingFast ? 3-5 : 0;

filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none'
```

**Rules**:
- Blur during entry: YES (velocity > 50px)
- Blur during hold: NO (static = sharp)
- Blur during exit: YES (velocity > 50px)
- Blur amount: 3-5px (subtle, not strong)

**MCP Integration**:
```typescript
function calculateMotionBlur(velocity, phase) {
  const threshold = 50;
  const isEntry = phase === 'entry';
  const isExit = phase === 'exit';
  const isFast = velocity > threshold;

  return (isEntry || isExit) && isFast ? 4 : 0;
}
```

---

### 5. **Off-Screen Entry Pattern** ⭐ HIGH PRIORITY

**Problem it solves**: Elements appearing in-place feels static. Need to come from somewhere.

**Pattern discovered**:
```typescript
// Start 200px+ off-screen
const startY = 200;  // or -200 for top, ±1920 for sides

// Animate to 0
const y = Math.max(0, startY - frame * rate);

transform: `translateY(${y}px)`
```

**Variations**:
- Bottom entry: `startY = 200, rate = 15-20`
- Top entry: `startY = -200, rate = 15-20`
- Left entry: `startX = -1920, rate = 128` (for wipes)
- Right entry: `startX = 1920, rate = 128`

**MCP Integration**:
```typescript
function generateEntry(direction, duration) {
  const distances = {
    'bottom': 200,
    'top': -200,
    'left': -1920,
    'right': 1920
  };

  const distance = distances[direction];
  const rate = Math.abs(distance / duration);

  return `Math.max(0, ${distance} - frame * ${rate})`;
}
```

---

### 6. **Validated Parameter Sets** ⭐ CRITICAL

**Problem it solves**: AI making aesthetic decisions leads to poor quality.

**Pattern discovered**:
```json
{
  "fixed_parameters": {
    "spring_damping": 100,  // EXACT - don't change
    "headline_weight": 900,  // EXACT - don't change
    "entry_duration": 20     // EXACT - don't change
  },
  "flexible_parameters": {
    "colors": {...},  // SAFE to customize
    "content": {...}  // SAFE to change
  },
  "adaptation_rules": {
    "if headline.length > 15": "reduce size by 15%"
  }
}
```

**Rule**: Use complete validated configurations from professional sources. Separate what MUST stay fixed from what CAN be customized.

**MCP Integration**:
```typescript
function generateFromParameterSet(userRequest) {
  const paramSet = findMatchingSet(userRequest.context);

  return generateAnimation({
    // Use fixed parameters exactly
    springConfig: paramSet.fixed_parameters.animation,
    typography: paramSet.fixed_parameters.typography,

    // Allow flexible customization
    colors: userRequest.colors || paramSet.flexible_parameters.colors,
    content: userRequest.content,

    // Apply adaptation rules
    adjustments: applyAdaptationRules(userRequest, paramSet.adaptation_rules)
  });
}
```

**File locations**:
- `motion-design-research/validated-parameter-sets/remotion-trailer-hero.json`
- `motion-design-research/validated-parameter-sets/complete-sequences.json`

---

## 📋 MCP INTEGRATION CHECKLIST

When porting these patterns to MCP:

### Phase 1: Component Templates
- [ ] Add NoOverlapScene.tsx to MCP generation templates
- [ ] Add EnforcedScene.tsx for transition management
- [ ] Add MandatoryTransition.tsx for movement enforcement

### Phase 2: Formula Integration
- [ ] Add continuous motion formulas to all generated content
- [ ] Add conditional motion blur to transitions
- [ ] Add off-screen entry to all elements

### Phase 3: Parameter Sets
- [ ] Load validated parameter sets into MCP
- [ ] Implement parameter set selection logic
- [ ] Add adaptation rule engine

### Phase 4: Guidelines Updates
- [ ] Update PRE-ANIMATION-CHECKLIST.md to require NoOverlapScene
- [ ] Add "NEVER STATIC HOLDS" as critical rule
- [ ] Add "UNIFIED TRANSFORMS" pattern requirement

---

## 🚨 CRITICAL RULES FOR MCP

**These MUST be enforced in MCP generation:**

### Rule 1: NO OVERLAPPING CONTENT
```typescript
// ❌ NEVER allow this:
<Sequence from={0}><Content1 /></Sequence>
<Sequence from={50}><Content2 /></Sequence>  // Could overlap!

// ✅ ALWAYS generate this:
<NoOverlapScene startFrame={0} endFrame={70} exitType="wipe-left">
  <Content1 />
</NoOverlapScene>
<NoOverlapScene startFrame={55} endFrame={120} exitType="hard-cut">
  <Content2 />
</NoOverlapScene>
```

### Rule 2: NEVER STATIC HOLDS
```typescript
// ❌ NEVER generate this:
<div style={{ fontSize: '72px' }}>Static Text</div>

// ✅ ALWAYS add continuous motion:
<div style={{
  fontSize: '72px',
  transform: `translateY(\${Math.sin(frame * 0.07) * 8}px) scale(\${1 + frame * 0.002})`
}}>
  Animated Text
</div>
```

### Rule 3: UNIFIED TRANSFORMS
```typescript
// ❌ NEVER separate transforms:
<Particles style={{ position: 'absolute' }} />
<Content style={{ transform: X }} />

// ✅ ALWAYS use parent transform:
<AbsoluteFill style={{ transform: X }}>
  <Particles />
  <Content />
</AbsoluteFill>
```

### Rule 4: MOTION BLUR ONLY DURING MOVEMENT
```typescript
// ❌ NEVER constant blur:
filter: 'blur(5px)'

// ✅ CONDITIONAL based on velocity:
const blur = (velocity > 50 && isTransitioning) ? 4 : 0;
filter: blur > 0 ? `blur(${blur}px)` : 'none'
```

### Rule 5: OFF-SCREEN ENTRY
```typescript
// ❌ NEVER appear in-place:
<div style={{ opacity: fadeIn }}>Content</div>

// ✅ ALWAYS start off-screen:
<div style={{
  transform: `translateY(\${Math.max(0, 200 - frame * 15)}px)`,
  opacity: Math.min(1, frame / 15)
}}>
  Content
</div>
```

---

## 📊 VALIDATION METRICS

**Before MCP integration, verify these metrics in generated animations:**

| Metric | Target | How to Measure |
|--------|--------|----------------|
| No overlapping frames | 0 | Check every frame for >1 visible element |
| Continuous motion | 100% | Every shot has 2+ continuous transforms |
| Off-screen entries | 100% | All elements start at 200px+ offset |
| Motion blur usage | Conditional | Only during movement (velocity > 50) |
| Hard boundaries | 100% | All scenes use NoOverlapScene |

---

## 🔄 ITERATION SUMMARY

**What we learned from each version:**

1. **PatternBasedShowcase**: Individual patterns don't work - need complete configurations
2. **ValidatedShowcase**: Parameter sets work but still made aesthetic mistakes
3. **FluentShowcase**: Wipes/transitions work but created overlaps
4. **EnhancedFluentShowcase**: Particles + UI mockups good, overlaps persist
5. **NoOverlapShowcase**: Hard boundaries solve overlaps, continuous motion prevents dullness

**Key insight**: Structure and formulas prevent mistakes better than guidelines and judgment.

---

## 📁 FILES TO PORT TO MCP

**Components** (copy to MCP templates):
- `clean-cut-workspace/src/components/NoOverlapScene.tsx`
- `clean-cut-workspace/src/components/EnforcedScene.tsx`
- `clean-cut-workspace/src/components/MandatoryTransition.tsx`

**Utilities** (integrate into MCP):
- `clean-cut-workspace/src/utils/no-overlap-helper.ts`

**Parameter Sets** (load into MCP):
- `motion-design-research/validated-parameter-sets/remotion-trailer-hero.json`
- `motion-design-research/validated-parameter-sets/complete-sequences.json`

**Formulas** (integrate into generation logic):
- Continuous float: `Math.sin(frame * 0.07) * 8`
- Continuous zoom: `1 + frame * 0.002`
- Pulsing glow: `Math.sin(frame * 0.12) * 0.3 + 0.5`
- Off-screen entry: `Math.max(0, 200 - frame * 15)`
- Motion blur: `velocity > 50 && isTransitioning ? 4 : 0`

---

## 🚀 NEXT STEPS

### Immediate (Port to MCP):
1. Add NoOverlapScene component to MCP generation
2. Integrate continuous motion formulas
3. Load validated parameter sets
4. Update MCP to use unified transform structure
5. Add conditional motion blur

### Ongoing (Continue iterating showcase):
1. Fix remaining overlaps
2. Improve motion blur technique (directional)
3. Refine transition type selection
4. Port new discoveries incrementally

---

**These patterns represent ~20 hours of iterative development distilled into portable, enforceable rules for the MCP.**
