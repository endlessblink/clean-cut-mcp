# 🎬 Claude Quick Reference for Remotion Development
**Essential patterns and rules for new chat sessions**

## ⚡ COPY THIS INTO NEW CHATS

### **Animation Requirements (MANDATORY):**
```
- ✅ **OVERLAPPING SCENES** - No empty screen time (15-frame overlaps)
- ✅ **MOVEMENT + FADES** - Never fade-only transitions  
- ✅ **QUICK TIMING** - 20-frame entries, 15-frame exits, 5-8 frame staggers
- ✅ **PROPER SIZING** - 16px+ text, 18px+ badges, 20px+ buttons, 44px+ touch targets
- ✅ **PROFESSIONAL FONTS** - Use Inter/SF Pro Display sans-serif stack
- ✅ **SAFE INTERPOLATION** - Always use bounds checking
- ✅ **CUBIC EASING** - out for entries, in for exits
```

### **Professional Typography Stack:**
```typescript
// Create typography.ts file and import in components:
import { FONT_STACKS, TYPOGRAPHY, FONT_CONTAINER_STYLES } from './typography';

// Font stacks (choose one per project)
FONT_STACKS.primary   // Inter, SF Pro Display, system fallbacks
FONT_STACKS.modern    // Satoshi, Inter, system fallbacks  
FONT_STACKS.elegant   // Poppins, Nunito Sans, Inter
FONT_STACKS.minimal   // Neue Haas Grotesk, Helvetica Now
FONT_STACKS.corporate // Circular, Gotham, Proxima Nova

// Typography hierarchy usage
<h1 style={{...TYPOGRAPHY.h1, color: '#fff'}}>Heading</h1>
<p style={{...TYPOGRAPHY.body, color: '#ccc'}}>Body text</p>

// Container with font optimization
const containerStyles = {...FONT_CONTAINER_STYLES, width: '100%', height: '100%'};
```

### **Timeline Formula (10-second animation):**
```typescript
// Scene overlaps - ALWAYS something visible:
// Scene 1: 0-80 frames    (0-2.7s)
// Scene 2: 65-155 frames  (2.2-5.2s) - 15 frame overlap
// Scene 3: 140-230 frames (4.7-7.7s) - 15 frame overlap  
// Scene 4: 215-300 frames (7.2-10s)  - 15 frame overlap
```

### **Safe Animation Pattern:**
```typescript
const safeInterpolate = (frame, inputRange, outputRange, easing) => {
  const [inputStart, inputEnd] = inputRange;
  const [outputStart, outputEnd] = outputRange;
  if (inputEnd === inputStart) return outputStart;
  if (frame <= inputStart) return outputStart;
  if (frame >= inputEnd) return outputEnd;
  return interpolate(frame, inputRange, outputRange, { easing });
};

const animations = {
  scene1: {
    opacity: safeInterpolate(frame, [0, 20], [0, 1], Easing.out(Easing.cubic)) * 
             safeInterpolate(frame, [60, 75], [1, 0], Easing.in(Easing.cubic)),
    entryY: safeInterpolate(frame, [0, 20], [20, 0], Easing.out(Easing.cubic)),
    exitY: safeInterpolate(frame, [60, 75], [0, -20], Easing.in(Easing.cubic))
  }
};

{sceneVisibility.scene1 > 0.01 && <Scene1Content />}
```

### **Staggered Elements Within Scenes:**
```typescript
{items.map((item, index) => (
  <div
    key={item.id}
    style={{
      opacity: safeInterpolate(frame, [sceneStart + index * 5, sceneStart + 15 + index * 5], [0, 1]),
      transform: `translateY(${safeInterpolate(frame, [sceneStart + index * 5, sceneStart + 15 + index * 5], [15, 0])}px)`,
      fontSize: '16px', // Minimum sizes
      padding: '20px',
      minHeight: '44px'
    }}
  >
    {item.content}
  </div>
))}
```

### **Banned Patterns (NEVER USE):**
```
❌ EMPTY SCREEN TIME - Always overlap scenes
❌ FADE-ONLY TRANSITIONS - Always combine with movement
❌ SLOW TIMING - Use 15-20 frame transitions max
❌ SMALL TEXT - 16px+ text, 18px+ badges, 20px+ buttons
❌ HARD CUTS - Always use overlapping opacity transitions
❌ AUTO-FIT GRIDS - Use explicit columns only
```

---

## 🎯 Quick MCP Commands

```typescript
// Get guidelines
rough-cuts-mcp:get_remotion_patterns("layout-rules")
rough-cuts-mcp:get_remotion_patterns("quick-reference")

// Create component  
rough-cuts-mcp:create_remotion_component(name, code, duration)

// Launch studio
rough-cuts-mcp:launch_remotion_studio()

// List components
rough-cuts-mcp:list_components()
```

---

## 📍 Project Info
- **Location:** `D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\rough-cuts-mcp`
- **Studio:** http://localhost:3000
- **Guidelines:** Use `get_remotion_patterns()` to access all rules

## 🏆 Professional Results Guaranteed
Following these patterns ensures:
- ✅ **No text overlap** during transitions
- ✅ **No empty screen time** - always engaging
- ✅ **Proper sizing** - clearly readable elements
- ✅ **Smooth motion** - professional cinematic feel
- ✅ **Fast performance** - transform-only animations

**ALWAYS implement these patterns from the start - don't wait for issues!**