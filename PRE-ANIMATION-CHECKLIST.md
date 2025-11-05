# ⚠️ PRE-ANIMATION CHECKLIST
## CLAUDE: READ THIS FIRST - EVERY TIME BEFORE ANIMATION WORK

**This file MUST be read before creating or modifying ANY animation.**

---

## 🎯 QUICK CHECK: What Phase Are We In?

### **Learning Phase** (Analyzing professional work)
✅ **Goal**: Extract patterns, analyze techniques, build knowledge
✅ **Output**: Research documents in `motion-design-research/`
✅ **DO**: Analyze, document, experiment
✅ **DON'T**: Use research patterns directly in production

### **Implementation Phase** (Creating production animations)
✅ **Goal**: Create animations following project standards
✅ **Output**: Working animations in `clean-cut-workspace/src/assets/animations/`
✅ **DO**: Follow guidelines, use typography.ts, read PROJECT_CONFIG.md
✅ **DON'T**: Skip guidelines, hardcode values, ignore standards

**Current Phase**: __________
*(User will tell you which phase)*

---

## 📋 IMPLEMENTATION PHASE CHECKLIST

### Before Creating ANY Animation, Complete These Steps:

#### ☐ Step 1: Read Project Standards (IN ORDER)
1. [ ] `claude-dev-guidelines/PROJECT_CONFIG.md`
2. [ ] `claude-dev-guidelines/SAFE_ANIMATION_CREATION_PROTOCOL.md`
3. [ ] `claude-dev-guidelines/ADVANCED/REMOTION_ANIMATION_RULES.md`
4. [ ] `claude-dev-guidelines/ADVANCED/MOTION_CHOREOGRAPHY_PATTERNS.md` (if using advanced patterns)

**DO NOT proceed until all required files are read.**

#### ☐ Step 2: Verify Current State
- [ ] Check Remotion Studio is accessible (http://localhost:6970)
- [ ] Confirm all existing animations still work
- [ ] No console errors in current state
- [ ] Run `docker ps | grep clean-cut-mcp` to verify container is running

#### ☐ Step 3: Typography System
- [ ] Use font stack from PROJECT_CONFIG.md: `SELECTED_FONT_STACK: primary`
- [ ] Import from `typography.ts` if it exists
- [ ] Follow size requirements:
  - display: 72px (Large headlines)
  - h1: 48px (Main titles)
  - h2: 36px (Section headers)
  - h3: 24px (Subsection headers)
  - body: 18px (Regular text - MINIMUM)
  - small: 16px (Fine print)
  - badge: 14px (Labels)

#### ☐ Step 4: Animation Timing
- [ ] Use 15-frame overlaps between scenes
- [ ] Entry animations: 20 frames
- [ ] Exit animations: 15 frames
- [ ] Stagger delays: 5-8 frames between elements
- [ ] Use `safeInterpolate` helper for all animations
- [ ] Use `Easing.out(Easing.cubic)` for entries
- [ ] Use `Easing.in(Easing.cubic)` for exits

#### ☐ Step 5: Spacing Requirements
- [ ] Container padding: 80px minimum
- [ ] Section margins: 60px minimum between elements
- [ ] Grid gaps: 25px minimum
- [ ] Card padding: 40px minimum
- [ ] Text must be readable (18px+ body, 48px+ headlines)

#### ☐ Step 6: Configuration System
- [ ] Read colors from PROJECT_CONFIG.md (DO NOT hardcode)
- [ ] Read timing from PROJECT_CONFIG.md (ENTRY_SPEED, EXIT_SPEED, STAGGER_DELAY)
- [ ] Read spacing from PROJECT_CONFIG.md (xs, sm, md, lg, xl, xxl, xxxl)
- [ ] Follow SELECTED_FONT_STACK setting

#### ☐ Step 7: Advanced Motion Patterns (IF NEEDED)

**Only if using advanced choreography (dolly, truck, infinite zoom, morphs, etc.):**
- [ ] Reviewed `MOTION_CHOREOGRAPHY_PATTERNS.md` for technique
- [ ] Chosen appropriate pattern for animation needs (see decision matrix)
- [ ] Followed implementation code template exactly
- [ ] Verified timing parameters (duration, spring config)
- [ ] Tested pattern doesn't conflict with other elements
- [ ] Pattern serves narrative (not just decorative)

**Available advanced patterns:**
- Cut on action / match cuts
- Camera movements (dolly, truck, pedestal)
- Infinite zoom
- Clean morphs
- Organic shape transitions
- Mask-based transitions

**Decision guide**: See "When to Use What" section in MOTION_CHOREOGRAPHY_PATTERNS.md

#### ☐ Step 8: NoOverlapScene Component (MANDATORY)

**CRITICAL: Use NoOverlapScene for ALL shots to prevent overlapping**

- [ ] Import NoOverlapScene component
- [ ] Wrap EVERY shot with NoOverlapScene
- [ ] Specify exact startFrame and endFrame (hard boundaries)
- [ ] Choose exitType: 'wipe-left', 'wipe-right', 'wipe-up', 'wipe-down', or 'hard-cut'
- [ ] NO manual visibility checks or opacity management

**Required structure:**
```typescript
<NoOverlapScene
  startFrame={0}
  endFrame={70}
  exitType="wipe-left"  // or hard-cut, wipe-right, etc.
  exitDuration={15}
>
  <YourSceneContent />
</NoOverlapScene>
```

**Why mandatory**: This component makes overlapping IMPOSSIBLE through structure.

#### ☐ Step 9: Continuous Motion (MANDATORY)

**CRITICAL: NEVER have static holds - motion must continue throughout shot**

Every shot MUST include 2-3 of these:
- [ ] Continuous float: `Math.sin(frame * 0.05-0.1) * 5-10px`
- [ ] Continuous zoom: `1 + frame * 0.001-0.003`
- [ ] Pulsing glows: `Math.sin(frame * 0.1-0.15) * range + baseline`
- [ ] Progressive reveals: Elements appearing throughout shot
- [ ] Particles always moving

**Why mandatory**: Static holds create "dull moments" that kill energy.

#### ☐ Step 10: Unified Transform Structure (MANDATORY)

**CRITICAL: Particles/background MUST move WITH content**

- [ ] Apply transform to PARENT AbsoluteFill
- [ ] Particles inside parent (move automatically)
- [ ] Content inside parent (moves automatically)
- [ ] NO separate transforms for particles vs content

**Required structure:**
```typescript
<AbsoluteFill style={{ transform: combinedTransform }}>
  <Particles />   {/* Moves with transform */}
  <Content />     {/* Moves with transform */}
</AbsoluteFill>
```

**Why mandatory**: Separating transforms makes particles static (looks broken).

#### ☐ Step 11: Scale Isolation (MANDATORY - Prevents Cropping)

**CRITICAL: NEVER apply scale at multiple levels (causes compound cropping)**

- [ ] Scale ONLY at shot/parent level
- [ ] Elements can: translateX, translateY, rotate (NO scale)
- [ ] Children can: subtle translateY only (NO scale, NO rotate)
- [ ] Run `npm run validate:crop-safety` before finalizing

**Transform level rules:**
```
Shot level:    scale ✅, translateX ✅, translateY ✅, rotate ❌
Element level: scale ❌, translateX ✅, translateY ✅, rotate ✅
Child level:   scale ❌, translateX ❌, translateY ✅, rotate ❌
```

**Forbidden pattern:**
```typescript
// ❌ COMPOUND SCALING (causes crop):
<div style={{ transform: 'scale(1.2)' }}>          {/* Shot */}
  <div style={{ transform: 'scale(1.5)' }}>        {/* Element */}
    Content  {/* Total: 1.2 × 1.5 = 1.8x CROPPED! */}
  </div>
</div>
```

**Required pattern:**
```typescript
// ✅ SCALE ISOLATION (crop-safe):
<div style={{ transform: 'scale(1.2)' }}>          {/* Shot only */}
  <div style={{ transform: 'translateY(5px)' }}>   {/* Element - NO scale */}
    Content  {/* Total: 1.2x SAFE */}
  </div>
</div>
```

**Why mandatory**: Parent scale × child scale = compound cropping beyond viewport.

#### ☐ Step 12: Safe Creation Protocol
- [ ] Create animation file ONLY first (don't modify Root.tsx yet)
- [ ] Use exact export pattern: `export const ComponentName: React.FC = () => {`
- [ ] Test component file syntax
- [ ] ONLY THEN add to Root.tsx

---

## ❌ NEVER DO THESE

### During Implementation:
- ❌ Use patterns from `motion-design-research/` directly (research only, not production)
- ❌ Use patterns from `docs/REMOTION-TRAILER-COMPLETE-DESIGN-GUIDE.md` without checking guidelines
- ❌ Skip reading PROJECT_CONFIG.md
- ❌ Hardcode colors, fonts, timing, spacing
- ❌ Use full-screen white flash transitions between EVERY scene
- ❌ Create text smaller than 18px for body content
- ❌ Skip typography.ts system
- ❌ Modify multiple files at once
- ❌ Modify Root.tsx before testing animation file

### Document Usage:
- ❌ Treat research documents as implementation requirements
- ❌ Follow analysis documents instead of guidelines
- ❌ Use `docs/` folder patterns without validating against guidelines

---

## ✅ CORRECT DOCUMENT HIERARCHY

**When documents conflict, follow this priority:**

1. **HIGHEST**: `claude-dev-guidelines/` - Project standards
   - PROJECT_CONFIG.md
   - SAFE_ANIMATION_CREATION_PROTOCOL.md
   - ADVANCED/REMOTION_ANIMATION_RULES.md

2. **Configuration**: PROJECT_CONFIG.md values
   - Colors, fonts, timing, spacing
   - NEVER hardcode what config provides

3. **Reference**: Research documents (for inspiration only)
   - docs/REMOTION-TRAILER-COMPLETE-DESIGN-GUIDE.md
   - docs/MY-ANIMATION-PROBLEMS.md
   - motion-design-research/extracted-patterns/

**Rule: Project guidelines ALWAYS override research materials.**

---

## 🚨 RED FLAGS: Stop If You're Doing This

**Stop immediately and re-read this checklist if:**
- You're hardcoding hex colors instead of reading PROJECT_CONFIG.md
- You're not using typography.ts font stacks
- You're using patterns from motion-design-research/ directly
- You're creating animations without reading guidelines first
- You're using white flash transitions between every scene
- You're creating text smaller than 18px for body content
- You're not using safeInterpolate for animations
- You're not implementing 15-frame overlaps between scenes

---

## 📊 PROFESSIONAL ANIMATION TEMPLATE

**Use this template for all animations:**

```typescript
import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, Easing } from 'remotion';
// Import typography system
import { FONT_STACKS, TYPOGRAPHY, FONT_CONTAINER_STYLES } from './typography';

// Safe interpolation helper (prevents crashes)
const safeInterpolate = (
  frame: number,
  inputRange: [number, number],
  outputRange: [number, number],
  easing?: any
) => {
  const [inputStart, inputEnd] = inputRange;
  const [outputStart, outputEnd] = outputRange;
  if (inputEnd === inputStart) return outputStart;
  if (frame <= inputStart) return outputStart;
  if (frame >= inputEnd) return outputEnd;
  return interpolate(frame, inputRange, outputRange, { easing });
};

export const YourAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timing with 15-frame overlaps
  const scene1 = {
    opacity: safeInterpolate(frame, [0, 20], [0, 1], Easing.out(Easing.cubic)) *
             safeInterpolate(frame, [60, 75], [1, 0], Easing.in(Easing.cubic)),
    y: safeInterpolate(frame, [0, 20], [40, 0], Easing.out(Easing.cubic))
  };

  const scene2 = {
    opacity: safeInterpolate(frame, [65, 85], [0, 1], Easing.out(Easing.cubic)) *
             safeInterpolate(frame, [140, 155], [1, 0], Easing.in(Easing.cubic)),
    y: safeInterpolate(frame, [65, 85], [40, 0], Easing.out(Easing.cubic))
  };

  return (
    <AbsoluteFill style={{
      ...FONT_CONTAINER_STYLES,
      backgroundColor: '#0a0a0a', // Read from PROJECT_CONFIG.md
      padding: '80px' // Minimum 80px container padding
    }}>
      {/* Scene 1 (frames 0-75) */}
      {scene1.opacity > 0.01 && (
        <div style={{
          opacity: scene1.opacity,
          transform: `translateY(${scene1.y}px)`
        }}>
          <h1 style={{
            ...TYPOGRAPHY.h1, // 48px minimum
            color: '#ffffff'
          }}>
            Your Title
          </h1>
        </div>
      )}

      {/* Scene 2 (frames 65-155) - Note 15-frame overlap */}
      {scene2.opacity > 0.01 && (
        <div style={{
          opacity: scene2.opacity,
          transform: `translateY(${scene2.y}px)`
        }}>
          <p style={{
            ...TYPOGRAPHY.body, // 18px minimum
            color: '#e5e5e5'
          }}>
            Your body text
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};
```

---

## 🎓 LEARNING PHASE CHECKLIST

### When Analyzing Professional Work:

#### ☐ Step 1: Clarify Purpose
- [ ] This is for LEARNING, not immediate implementation
- [ ] Output goes to `motion-design-research/`
- [ ] Will NOT be used in production directly

#### ☐ Step 2: Analysis Process
- [ ] Analyze professional animations (Remotion trailer, Vimeo, etc.)
- [ ] Extract patterns to `motion-design-research/extracted-patterns/*.json`
- [ ] Document findings in `docs/`
- [ ] Test understanding in `motion-design-research/experiments/`

#### ☐ Step 3: Pattern Documentation
- [ ] Save patterns with context (source, rating, use case)
- [ ] Document WHY patterns work (not just WHAT they are)
- [ ] Note when patterns conflict with project guidelines

#### ☐ Step 4: Future Integration
- [ ] Patterns need review before production use
- [ ] Must be validated against project standards
- [ ] May need modification to fit project conventions
- [ ] Will be ported to guidelines BEFORE production use

---

## 🔄 THE CORRECT WORKFLOW

### Learning → Standardization → Implementation

```
PHASE 1: LEARNING (What we're doing now)
↓
Analyze professional animations
↓
Extract patterns to motion-design-research/
↓
Document findings

PHASE 2: STANDARDIZATION (Happens next)
↓
Review learned patterns
↓
Validate against project requirements
↓
Update claude-dev-guidelines/ with approved patterns
↓
Update PROJECT_CONFIG.md with new options

PHASE 3: IMPLEMENTATION (After guidelines updated)
↓
Read updated guidelines
↓
Create animations following NEW standards
↓
Use approved patterns from guidelines (not research directly)
```

**NEVER**: Skip Phase 2 and jump from Learning to Implementation

---

## 📝 CHECKLIST CONFIRMATION

**Before proceeding with animation work, confirm:**

- [ ] I have read this entire checklist
- [ ] I know which phase I'm in (Learning or Implementation)
- [ ] I have read all required project standards (if Implementation)
- [ ] I understand guidelines override research documents
- [ ] I will not use research patterns directly in production
- [ ] I will not hardcode values from PROJECT_CONFIG.md
- [ ] I will use typography.ts system
- [ ] I will follow spacing requirements (80px padding, 60px margins)
- [ ] I will use safeInterpolate and 15-frame overlaps
- [ ] I will create animation file first, then add to Root.tsx

**If any checkbox is unchecked, DO NOT proceed.**

---

## 🚑 EMERGENCY RECOVERY

**If anything breaks:**

```bash
# Quick restore to last working state
./restore-backup.sh [TIMESTAMP]

# Or git restore
git reset --hard 9679310
docker restart clean-cut-mcp
```

---

## ✅ SUCCESS CRITERIA

**Animation is complete when:**
- ✅ Appears in Remotion Studio at http://localhost:6970
- ✅ All existing animations still work
- ✅ Direct URL access works: `http://localhost:6970/YourAnimationName`
- ✅ No console errors
- ✅ Follows all guidelines requirements
- ✅ Uses typography.ts system
- ✅ Reads from PROJECT_CONFIG.md
- ✅ Text is readable (18px+ body, 48px+ headlines)
- ✅ Uses 15-frame overlaps and safeInterpolate

---

**REMINDER: This checklist exists because guidelines were repeatedly ignored. Following it prevents wasted work and ensures quality.**

**Last Updated**: October 1, 2025
**Version**: 1.0
