# Remotion Animation Guidelines for Claude

## Critical Export Pattern Rule

**ALWAYS generate Remotion components with this exact pattern:**

```typescript
export const ComponentName: React.FC = () => {
  // component code here
};
export default ComponentName;
```

**NEVER use this pattern (causes errors):**
```typescript
const ComponentName: React.FC = () => {
  // component code here
};
export default ComponentName; // ❌ Missing named export
```

## Required Imports
```typescript
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
```

## Required Structure
- Root element MUST be `<AbsoluteFill>`
- Use `useCurrentFrame()` for animations
- Use `interpolate()` for smooth transitions
- Style objects for CSS (no className)

## Animation Patterns

### Frame-based Animation
```typescript
const frame = useCurrentFrame();
const progress = interpolate(frame, [0, 30], [0, 1]);
```

### Looping Animation
```typescript
const frame = useCurrentFrame();
const loop = frame % 60; // 2 second loop at 30fps
const value = interpolate(loop, [0, 30, 60], [0, 100, 0]);
```

### Color Transitions
```typescript
const hue = interpolate(frame, [0, 90], [0, 360]);
const color = `hsl(${hue}, 70%, 50%)`;
```

## Common Animation Types

### Fade In/Out
```typescript
const opacity = interpolate(frame, [0, 30, 60, 90], [0, 1, 1, 0]);
```

### Scale Animation
```typescript
const scale = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
```

### Position Animation
```typescript
const x = interpolate(frame, [0, 60], [0, 100]);
const y = interpolate(frame, [0, 60], [0, 50]);
```

## Performance Guidelines
- Use `extrapolateLeft: 'clamp'` and `extrapolateRight: 'clamp'` to prevent values going out of bounds
- Prefer transform over changing layout properties
- Use `backgroundColor` instead of `background` for solid colors

## Typography Guidelines
- Use large font sizes (4rem+) for video content
- Always specify color explicitly
- Use web-safe fonts or specify fallbacks