# Investigation: Why Animations Were Deleted

**Date**: October 4, 2025
**Issue**: All previous animations disappeared when RFDETRSegmentation was created

---

## Root Cause

**The Bug Chain:**
1. `create_animation` writes new file to `/workspace/src/assets/animations/` (container only)
2. Immediately calls `auto_sync` (line 1195)
3. `auto_sync` → `scanAnimations()` → `glob('*.tsx')` to find ALL animations
4. **Problem**: Animations only exist in container (not synced to Windows host)
5. If animations were lost (container restart/no sync), scan only finds NEW file
6. `generateRootTsx()` regenerates Root.tsx with ONLY scanned files
7. **Result**: All previous animations removed from Root.tsx

---

## Evidence

**Code Flow (clean-stdio-server.ts):**
```typescript
Line 1176: fs.writeFile(componentPath, safeCode)  // Write to container
Line 1195: this.handleAutoSync({ force: false })  // Scan + regenerate Root.tsx
```

**Auto-Sync Logic (root-sync.ts):**
```typescript
Line 31: glob('*.tsx', { cwd: animationsDir })    // Find ALL .tsx files
Line 167: generateRootTsx(animations)             // Regenerate from scratch
Line 178: fs.writeFileSync(targetPath, newContent) // Overwrite Root.tsx
```

**Missing Docker CP Export:**
- Assets have Docker CP (line 2706-2710)
- **Animations do NOT have Docker CP**
- Animations lost on container restart or not available for scanning

---

## Why It Happened This Time

**Likely scenario:**
1. Container was restarted at some point
2. Animations in `/workspace/src/assets/animations/` were lost
3. User created RFDETRSegmentation
4. auto_sync scanned directory → only found RFDETRSegmentation.tsx
5. Root.tsx regenerated with only 1 animation
6. All previous animations disappeared

**Confirmed:**
- We had to restore animations from git (commit 8c40a4f)
- Only RFDETRSegmentation.tsx remained in container
- Root.tsx had duplicate imports (sign of regeneration issue)

---

## The Fix

**Solution 1: Add Docker CP Export for Animations (BEFORE auto_sync)**
```typescript
// After writing animation file, sync to host BEFORE auto_sync
const hostPath = path.join('D:/MY PROJECTS/...', validComponentName + '.tsx');
const containerPath = `/workspace/src/assets/animations/${validComponentName}.tsx`;
execSync(`docker cp clean-cut-mcp:${containerPath} "${hostPath}"`);

// NOW run auto_sync - it will find all files
await this.handleAutoSync({ force: false });
```

**Solution 2: Make auto_sync Additive (Not Regenerative)**
- Instead of regenerating entire Root.tsx from scratch
- Append new animation to existing Root.tsx
- Only regenerate on explicit `rebuild_compositions` command

**Solution 3: Use Docker Volumes (Persistent Storage)**
- Mount `/workspace/src/assets/animations/` as Docker volume
- Changes persist across container restarts
- No Docker CP needed

---

## Recommendation

**Implement Solution 1 (Quick Fix):**
- Add Docker CP export after animation file write
- Export entire `/workspace/src/assets/animations/` directory to host
- Ensures all files available before auto_sync scans

**Then Solution 2 (Long Term):**
- Change auto_sync to be additive
- Prevents accidental deletion even if scan fails
- More resilient to directory issues

---

## Status

✅ Animations restored from git
✅ Root cause identified
✅ Improved validation (catches multi-scene animations)
⏳ Docker CP export fix pending
