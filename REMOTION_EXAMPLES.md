# Remotion Component Examples

## Required Export Pattern

**ALWAYS use this exact export pattern for Remotion components:**

```typescript
import React from 'react';
import { AbsoluteFill } from 'remotion';

export const ComponentName: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'blue' }}>
      <h1>Your animation content</h1>
    </AbsoluteFill>
  );
};

export default ComponentName;
```

## ❌ INCORRECT Pattern (causes undefined component errors):
```typescript
// DON'T DO THIS
const ComponentName: React.FC = () => {
  // component code
};
export default ComponentName;
```

## ✅ CORRECT Pattern (works in Remotion Studio):
```typescript
// ALWAYS DO THIS
export const ComponentName: React.FC = () => {
  // component code
};
export default ComponentName;
```

## Template Examples

### Basic Animation
```typescript
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const BasicAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  return (
    <AbsoluteFill style={{
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{
        color: 'white',
        fontSize: '4rem',
        opacity
      }}>
        Hello Remotion!
      </h1>
    </AbsoluteFill>
  );
};

export default BasicAnimation;
```

### Bouncing Animation
```typescript
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const BouncingElement: React.FC = () => {
  const frame = useCurrentFrame();
  const bounceY = interpolate(frame % 60, [0, 30, 60], [0, -100, 0]);

  return (
    <AbsoluteFill style={{
      backgroundColor: '#1e1e1e',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: 100,
        height: 100,
        backgroundColor: '#ff6b6b',
        borderRadius: '50%',
        transform: `translateY(${bounceY}px)`
      }} />
    </AbsoluteFill>
  );
};

export default BouncingElement;
```

## Key Requirements
1. **MUST use `export const ComponentName: React.FC`**
2. **MUST import from 'remotion'**
3. **MUST use AbsoluteFill as root container**
4. **MUST include both named and default exports**