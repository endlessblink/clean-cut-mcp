# Docker Bind Mount Sync Issue

**Date**: October 4, 2025
**Issue**: New directories on Windows host don't appear in Docker container
**Impact**: Missing imports cause Remotion Studio errors

---

## The Problem

**Docker bind mounts only sync directories that exist at container start time.**

When we create new directories on the Windows host AFTER the container has started, they don't automatically appear in the container, even though the parent directory is bind-mounted.

### Example:
```
docker-compose.yml:
  volumes:
    - ./clean-cut-workspace:/workspace  # ✅ Bind mount configured

Host creates new directory:
  /mnt/d/.../clean-cut-workspace/src/components/  # ✅ Created on host

Container doesn't see it:
  docker exec clean-cut-mcp ls /workspace/src/components/
  # ❌ No such file or directory
```

---

## Why This Happens

**Docker bind mount behavior:**
1. Container starts → scans bind mount source
2. Creates directory structure snapshot
3. Syncs files bidirectionally
4. **New directories after start** → NOT automatically synced

**This is by design** - Docker doesn't continuously watch for new directories (performance reasons).

---

## Symptoms

**Remotion Studio errors:**
```
Cannot find module '../../utils/kinetic-text'
Cannot find module '../../components/NoOverlapScene'
```

**But files exist on host!**
```bash
ls /mnt/d/.../clean-cut-workspace/src/utils/kinetic-text.ts  # ✅ Exists
docker exec clean-cut-mcp ls /workspace/src/utils/  # ❌ No such file
```

---

## Current Workaround

**Manual docker cp:**
```bash
docker cp "/path/to/clean-cut-workspace/src/components" clean-cut-mcp:/workspace/src/
docker cp "/path/to/clean-cut-workspace/src/utils" clean-cut-mcp:/workspace/src/
```

**Applied to:**
- `/workspace/src/components/` (NoOverlapScene, EnforcedScene, MandatoryTransition)
- `/workspace/src/utils/` (kinetic-text, camera-controller, particle-system, etc)
- `/workspace/src/patterns/`
- `/workspace/src/validated-params/`

---

## Permanent Solutions

### Option 1: Container Restart (Simple)
```bash
docker-compose restart clean-cut-mcp
```
**Pros:** Picks up all new directories
**Cons:** Restarts Remotion Studio, brief downtime

### Option 2: Startup Script (Best)
Update `start.js` to ensure sync:
```javascript
// In start.js - before starting services
const hostDirs = [
  '/workspace/src/components',
  '/workspace/src/utils',
  '/workspace/src/patterns',
  '/workspace/src/validated-params'
];

hostDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating missing directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});
```

### Option 3: Prevent the Issue
Ensure all directories exist BEFORE first container start:
```bash
# In installer script:
mkdir -p clean-cut-workspace/src/{components,utils,patterns,validated-params,assets/animations}
docker-compose up -d  # Now all directories bind-mounted correctly
```

---

## How to Detect This Issue

**Check for directory mismatch:**
```bash
# Count host directories
ls /mnt/d/.../clean-cut-workspace/src/ | wc -l

# Count container directories
docker exec clean-cut-mcp ls /workspace/src/ | wc -l

# If different → sync issue!
```

**Check Remotion Studio errors:**
- "Cannot find module" → Missing directory/file in container
- Files exist on host → Bind mount not synced

---

## Status

✅ **Immediate fix applied:** All directories manually copied via docker cp
✅ **Remotion Studio:** Should now load without import errors
⏳ **Permanent fix:** Needs start.js update or installer improvement

---

## Affected Directories

**Successfully synced (manual docker cp):**
- ✅ /workspace/src/components/ (3 files)
- ✅ /workspace/src/utils/ (14 files)
- ✅ /workspace/src/patterns/
- ✅ /workspace/src/validated-params/

**Already synced (existed at start):**
- ✅ /workspace/src/assets/animations/ (17 files)
- ✅ /workspace/src/assets/audio/
- ✅ /workspace/out/ (exports)
