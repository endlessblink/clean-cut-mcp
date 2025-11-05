# Perplexity Research Queries
**Systematic research to solve motion design problems**

**Date**: October 1, 2025
**Purpose**: Research specific motion design problems we're encountering
**Goal**: Find algorithmic/measurable solutions to aesthetic challenges

---

## 1. Transition Type Selection Logic

### Query 1A: Decision Rules for Transition Types
```
I'm building an AI system for motion graphics animation. I need systematic, rule-based logic for choosing between transition types (hard cut vs crossfade/dissolve vs wipe vs zoom).

Please provide:
1. Decision tree or flowchart for selecting transition types based on:
   - Content similarity between scenes
   - Energy level changes
   - Narrative purpose
   - Scene duration

2. Specific rules like:
   - "Use hard cut when X"
   - "Use wipe when Y"
   - "Never use crossfade when Z"

3. Professional standards from video editing (Premiere Pro, Final Cut Pro, DaVinci Resolve)

4. Measurable criteria (not subjective - e.g., "energy change > 50%" not "feels different")

Focus on rules that can be implemented algorithmically without human aesthetic judgment.
```

### Query 1B: Crossfade vs Wipe Timing Rules
```
What are the professional standards for overlap timing in video transitions?

Specifically:
1. Hard cut: 0 frames overlap (instant)
2. Wipe transitions: How many frames should old content exit while new content enters?
3. Crossfade/dissolve: Industry standard overlap duration?
4. When is overlap acceptable vs when must scenes be completely separated?

Please provide frame-based timing from professional motion graphics workflows (After Effects, Premiere Pro standards).

Include research on:
- Viewer perception of transition smoothness
- Frame durations that feel "too fast" vs "too slow"
- Overlap periods that cause confusion vs flow
```

---

## 2. Motion Blur Techniques

### Query 2A: Directional Motion Blur for Web Animation
```
How do professional motion graphics achieve realistic motion blur in web-based animation (CSS, SVG, Canvas, WebGL)?

CSS filter: blur() creates soft-focus effect, not true motion blur. I need:

1. Directional motion blur techniques that match movement direction
2. Speed-based blur amount calculations
3. SVG filter implementations for directional blur
4. Canvas-based motion blur algorithms
5. CSS alternatives that approximate directional blur

Please provide:
- Code examples for each technique
- Performance comparisons
- When to use which method
- Blur amount formulas based on velocity

Focus on practical implementations for React/TypeScript web animations.
```

### Query 2B: Motion Blur Perception Science
```
What does research say about motion blur perception in digital animation?

I need to understand:
1. At what velocity does human eye expect to see motion blur? (pixels per frame)
2. How much blur is "realistic" vs "too much"?
3. Directional blur vs radial blur vs no blur - viewer perception studies
4. Frame rate relationship (30fps vs 60fps blur expectations)

Please provide scientific research on:
- Psychophysics of motion blur perception
- Thresholds for perceived smoothness
- Studies on animation quality with/without motion blur
- Measurable quality metrics

Goal: Create algorithmic rules for when and how much blur to apply.
```

---

## 3. Visual Composition Rules (Algorithmic)

### Query 3A: Computational Aesthetics for Motion Graphics
```
I need measurable, algorithmic rules for visual composition in motion graphics (not subjective aesthetic judgment).

Please provide:
1. Golden ratio positioning formulas for 1920×1080 canvas
2. Rule of thirds grid calculations and scoring algorithms
3. Visual weight distribution measurements
4. Negative space percentage guidelines
5. Element spacing formulas (not "looks good" but "X% of screen width")

Specifically for:
- Text positioning (headlines vs body vs accents)
- Multi-element layouts (when showing code editor + file tree)
- Focal point calculations
- Balance scoring algorithms

Include research on computational aesthetics, automated layout systems, and measurable beauty metrics.
```

### Query 3B: Typography Positioning in Video
```
What are the professional standards for typography positioning in 1920×1080 video?

I need specific measurements:
1. Safe title area (pixels from edges)
2. Headline size formulas based on screen percentage
3. Minimum readable font sizes at 1920×1080
4. Line-height calculations for video (different from web)
5. Maximum text width for readability

Please provide:
- Broadcast safe area specifications
- Typography sizing standards from motion graphics industry
- Readability studies for video content
- Distance-from-edge rules for different element types

Focus on exact pixel/percentage values, not subjective guidelines.
```

---

## 4. Animation Timing Feel (Scientific)

### Query 4A: Easing Curves and Perception
```
What does scientific research say about easing curve perception in animation?

I need to understand:
1. Linear vs cubic vs elastic easing - perception studies
2. Ease-in vs ease-out vs ease-in-out - when each feels "natural"
3. Duration thresholds: too fast to perceive vs too slow and boring
4. Spring physics parameters (damping, stiffness) - how they affect "feel"

Please provide:
- Psychophysics research on animation timing perception
- Studies comparing easing curves and viewer preference
- Optimal duration ranges for different animation types
- Spring physics parameter effects on perceived smoothness

Goal: Create rules like "damping 100 feels smooth, damping 200 feels sluggish" based on research, not guessing.
```

### Query 4B: Scene Duration and Attention
```
What does research say about optimal scene duration in motion graphics?

I need:
1. Minimum scene duration for comprehension (reading text, understanding visuals)
2. Maximum scene duration before viewer loses interest
3. Energy level and pacing - how to structure 30-60 second animations
4. The "4-5 second rule" validation - is this research-backed?

Please provide:
- Cognitive psychology research on visual information processing
- Attention span studies for video content
- Reading speed for video text (words per second)
- Scene pacing research from film/video editing

Include measurable guidelines (seconds, frames) not subjective "feels right."
```

---

## 5. Progressive Disclosure Patterns

### Query 5A: Staggered Reveal Timing
```
What are the professional standards for staggered reveals in motion graphics?

When revealing multiple elements (list items, UI components, text blocks):
1. Optimal delay between items (frames or milliseconds)
2. How many items can reveal simultaneously without overwhelming?
3. Stagger timing based on element count (3 items vs 10 items)
4. Reading rhythm - how fast can viewers process sequential reveals?

Please provide:
- Industry standards from After Effects, motion design workflows
- Cognitive load research for sequential information
- Professional motion graphics examples with timing breakdowns
- Formulas: stagger delay = f(element count, individual duration)

Focus on frame-precise timing rules.
```

### Query 5B: Information Hierarchy in Motion
```
How do professional motion graphics choreograph information reveals?

I need systematic rules for:
1. Primary vs secondary vs tertiary element reveal order
2. When to show all elements simultaneously vs sequentially
3. Visual hierarchy during motion (what appears first/last)
4. Grouping strategies (when to stagger within groups vs between groups)

Please provide:
- Information architecture principles applied to motion
- Professional motion graphics workflow guidelines
- Examples from corporate explainer videos, product showcases
- Measurable rules (not "important things first" but "largest elements first" or "top-to-bottom order")
```

---

## 6. Energy Management Through Scenes

### Query 6A: Energy Progression in Motion Graphics
```
How do professional motion designers manage energy/pacing across a 30-60 second animation?

I need systematic approaches for:
1. Energy curve patterns (crescendo, decrescendo, wave, steady)
2. Scene-to-scene energy transitions (when to increase/decrease)
3. Measuring scene energy (motion speed + element count + color saturation?)
4. Opening vs middle vs closing scene energy levels

Please provide:
- Professional motion graphics pacing strategies
- Music video editing rhythm principles
- Commercial video pacing research
- Quantifiable energy metrics

Focus on patterns I can apply algorithmically (not "build to climax" but "increase speed by 20% per scene" or "add 2 more moving elements each scene").
```

### Query 6B: Motion Speed and Viewer Engagement
```
What does research say about motion speed and viewer engagement?

I need to understand:
1. Optimal animation speed for different content types
2. When fast motion creates excitement vs confusion
3. When slow motion creates emphasis vs boredom
4. Speed variation patterns that maintain attention

Please provide:
- Neuroscience/psychology research on motion speed perception
- Video engagement studies correlating speed with retention
- Professional animation speed guidelines (pixels per frame)
- Threshold values for "too fast" and "too slow"

Include measurable guidelines for different animation purposes (logo reveal, text entry, scene transition).
```

---

## 7. Text Animation Best Practices

### Query 7A: Kinetic Typography Rules
```
What are the professional standards for text animation in motion graphics?

I need specific rules for:
1. Text entry speed (characters per second, words per second)
2. Maximum movement speed while maintaining readability
3. When to animate by character vs word vs line vs block
4. Typography weight changes during motion (900 to 700 - when is this appropriate?)

Please provide:
- Kinetic typography research and best practices
- Readability studies for moving text
- Professional motion graphics typography guidelines
- Frame-based timing for text reveals

Focus on measurable rules (characters/second, pixels/frame movement limits).
```

### Query 7B: Font Size for Video Readability
```
What are the minimum font sizes for video content at different resolutions?

Specifically for:
1. 1920×1080 (Full HD) minimum sizes for headlines, body, captions
2. Viewing distance considerations
3. Mobile vs desktop vs TV viewing
4. Motion vs static text (does movement require larger sizes?)

Please provide:
- Broadcast design standards (title safe areas, font minimums)
- Accessibility guidelines for video text (WCAG for video)
- Professional motion graphics sizing standards
- Research on legibility at different sizes and distances

I need exact pixel values, not ranges or subjective guidance.
```

---

## 8. Particle System Usage Guidelines

### Query 8A: Particle Effect Density and Performance
```
What are professional guidelines for particle effects in motion graphics?

I need rules for:
1. Optimal particle count (too few = sparse, too many = cluttered)
2. Particle size relative to screen size
3. Velocity ranges that feel natural vs chaotic
4. When particles should be subtle vs prominent

Please provide:
- Professional motion graphics particle usage patterns
- Performance benchmarks (particle count vs frame rate)
- Visual density measurements
- Examples from award-winning motion graphics

Focus on quantifiable guidelines (particle count, size ranges, velocity thresholds).
```

### Query 8B: Background Elements vs Focal Content
```
How do professional motion designers balance background motion with foreground content?

I need systematic rules for:
1. Background motion speed relative to foreground (50% speed? 25%?)
2. Background element opacity to avoid distraction
3. When background motion enhances vs detracts
4. Particle/effect prominence guidelines

Please provide:
- Parallax motion ratios from professional work
- Opacity/contrast rules for background elements
- Visual hierarchy research (foreground attention vs background context)
- Examples with specific parameter values

Goal: Create formulas for background motion speed and prominence.
```

---

## 9. Camera Movement Language

### Query 9A: Virtual Camera Movement Standards
```
What are professional standards for virtual camera movements in motion graphics?

For dolly (zoom), truck (lateral), pedestal (vertical):
1. Speed ranges (pixels per frame, scale change per frame)
2. When to use each type (dolly vs truck vs pedestal)
3. How fast is too fast (disorienting)?
4. How slow is too slow (boring)?
5. Combining camera movements (dolly + truck simultaneously - when is this appropriate?)

Please provide:
- Cinematography principles applied to motion graphics
- After Effects camera animation standards
- Professional motion graphics camera work examples
- Frame-based movement calculations

Include measurable values (scale 1.0 → 1.5 over X frames, move Y pixels per frame).
```

### Query 9B: Camera Movement and Viewer Comfort
```
What does research say about camera movement speed and viewer comfort/motion sickness?

I need scientific data on:
1. Maximum safe camera movement speeds (degrees per second, pixels per frame)
2. Smooth vs jarring camera motion thresholds
3. Virtual camera motion sickness triggers
4. Acceleration curves that feel comfortable

Please provide:
- VR/AR motion comfort research (applicable to 2D motion graphics)
- Film cinematography motion studies
- Viewer comfort thresholds
- Safe velocity and acceleration ranges

Goal: Create safety limits for camera movement speed.
```

---

## 10. Color Transition Science

### Query 10A: Color Harmony in Motion
```
How do colors transition smoothly in professional motion graphics?

I need rules for:
1. Color change speed (hue shift per frame)
2. Saturation/brightness transition guidelines
3. When color changes feel smooth vs jarring
4. Palette transition strategies (fade through neutral? Direct shift?)

Please provide:
- Color perception research (JND - Just Noticeable Difference)
- Professional motion graphics color transition examples
- HSL vs RGB transition paths
- Perceptual color space considerations (LAB color space?)

Include measurable thresholds (e.g., "hue shift > 60° feels jarring").
```

### Query 10B: Accent Color Usage in Animation
```
What are professional guidelines for accent color usage in motion graphics?

I need systematic rules for:
1. How many accent colors in a 30-second animation?
2. When to introduce new accent colors vs maintain consistency
3. Accent color prominence (percentage of screen, saturation levels)
4. Transition between different accent colors

Please provide:
- Professional brand motion guidelines
- Color psychology in motion design
- Examples from corporate motion graphics
- Measurable rules (X% screen coverage, Y saturation value)

Focus on rules that can be applied programmatically.
```

---

## Research Execution Plan

### Phase 1: Critical Issues (DO FIRST)
1. **Transition Type Selection** - Query 1A, 1B
2. **Motion Blur Techniques** - Query 2A, 2B
3. **Composition Rules** - Query 3A, 3B

### Phase 2: Refinement (DO SECOND)
4. **Animation Timing** - Query 4A, 4B
5. **Progressive Disclosure** - Query 5A, 5B
6. **Energy Management** - Query 6A, 6B

### Phase 3: Polish (DO THIRD)
7. **Text Animation** - Query 7A, 7B
8. **Particle Guidelines** - Query 8A, 8B
9. **Camera Movement** - Query 9A, 9B
10. **Color Transitions** - Query 10A, 10B

---

## How to Use Results

### 1. Extract Measurable Rules
Look for:
- ✅ Exact numbers (15 frames, 50 pixels/frame, 60° hue shift)
- ✅ Thresholds (velocity > X, duration < Y)
- ✅ Formulas (stagger = count * 0.5, blur = velocity / 10)
- ❌ Avoid subjective advice ("make it feel smooth")

### 2. Create Decision Trees
Convert findings to:
```
IF scene_energy_change > 50% THEN use hard-cut
ELSE IF content_similar AND duration_long THEN use crossfade
ELSE use wipe
```

### 3. Add to Guidelines
Document findings in:
- `claude-dev-guidelines/ADVANCED/MOTION_CHOREOGRAPHY_PATTERNS.md`
- `MCP-PORTABLE-PATTERNS.md`
- `motion-design-research/validated-parameter-sets/`

### 4. Implement in Code
Create utilities:
- `transition-selector.ts` (implements decision tree from Query 1)
- `directional-blur.ts` (implements findings from Query 2)
- `composition-calculator.ts` (implements findings from Query 3)

---

## Success Criteria

Research is successful when we can:
- [ ] Choose transition type algorithmically (no aesthetic judgment)
- [ ] Calculate blur amount from velocity automatically
- [ ] Position elements using mathematical composition rules
- [ ] Determine scene duration from content type + word count
- [ ] Apply easing curves based on animation context
- [ ] Set camera movement speeds within safe ranges
- [ ] Transition colors using perceptual color spaces
- [ ] Calculate particle density from screen size
- [ ] Stagger reveals using formula not guessing
- [ ] Measure energy levels objectively

---

**These queries are designed to find SYSTEMATIC, MEASURABLE solutions to motion design problems - not subjective aesthetic advice.**
