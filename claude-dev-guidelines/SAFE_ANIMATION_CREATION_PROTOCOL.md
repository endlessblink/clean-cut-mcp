# 🛡️ Safe Animation Creation Protocol

## CRITICAL RULES for Claude Desktop

### ✅ ALWAYS DO BEFORE CREATING NEW ANIMATIONS:

1. **Create Backup**:
   ```bash
   ./backup-before-changes.sh
   ```

2. **Verify Current State**:
   - Check Remotion Studio shows all 12 compositions
   - Test that existing animations still work
   - Confirm no console errors

### ✅ SAFE ANIMATION CREATION STEPS:

1. **Create Animation File ONLY**:
   - Create new `.tsx` file in `clean-cut-workspace/assets/animations/`
   - Use EXACT export pattern: `export const ComponentName: React.FC = () => {`
   - Never modify Root.tsx until animation is tested

2. **Test Animation Separately**:
   - Test the component file syntax
   - Verify it follows modern React.FC pattern

3. **Add to Root.tsx LAST**:
   - Only after animation is confirmed working
   - Add import: `import { NewComponent } from './assets/animations/NewComponent';`
   - Add composition entry following exact pattern of existing ones

### ❌ NEVER DO THESE (CORRUPTION RISKS):

- ❌ Never modify multiple files at once
- ❌ Never change existing working animations
- ❌ Never modify remotion.config.ts
- ❌ Never change index.ts
- ❌ Never use old export patterns like `export { ComponentName };`
- ❌ Never modify container configuration
- ❌ Never delete existing animations without explicit request

### 🚨 EMERGENCY RECOVERY:

If anything breaks:
```bash
# Quick restore to last working state
./restore-backup.sh [TIMESTAMP]

# Or git restore
git reset --hard 9679310
docker restart clean-cut-mcp
```

### 📋 SAFE EXPORT PATTERN TEMPLATE:

```typescript
import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from 'remotion';

interface ComponentNameProps {
  title?: string;
  color?: string;
  animationSpeed?: number;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  title = "Default Title",
  color = "#3B82F6",
  animationSpeed = 1
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Animation logic here

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Component JSX */}
    </AbsoluteFill>
  );
};
```

### 🎯 SUCCESS CRITERIA:

- ✅ New animation appears in Remotion Studio left panel
- ✅ All existing 12 compositions still visible
- ✅ Direct URL access works: `http://localhost:6970/NewAnimationName`
- ✅ No console errors
- ✅ Studio loads without "Composition not found" errors