# Claude Code Session Drop-off: Clean-Cut-MCP Animation System

## 🎯 CURRENT SITUATION (Sept 24, 2025)

**CRITICAL STATUS**: System partially broken due to Root.tsx import/export mismatches after git restore

### Current State:
- ✅ **Remotion Studio**: Accessible at http://localhost:6970
- ❌ **Component Errors**: "undefined component prop" errors in browser console
- ✅ **Container**: Running on commit b8359c3 (Sept 23rd baseline)
- ❌ **Root.tsx**: Contains imports for missing animation files

### Immediate Problem:
Root.tsx imports animations that don't exist after git restore:
- `PulseCircle` - import exists, file missing
- `PulsingOrb` - import exists, file missing
- `Zzzz` - import exists, file missing

**Error**: "A value of `undefined` was passed to the `component` prop"

## 🛠️ WORKING DIRECTORY & FILES

**Location**: `/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/clean-cut-mcp`

**Container**: `clean-cut-mcp` running on port 6970
**Volume Mounts**:
- `clean-cut-workspace:/workspace`
- `clean-cut-exports:/workspace/out`

**Critical Files**:
- `clean-cut-workspace/src/Root.tsx` - HAS BROKEN IMPORTS (needs cleanup)
- `clean-cut-workspace/src/assets/animations/` - Contains actual animation files

## 🎯 CORE ISSUE TO SOLVE

**Primary Objective**: Fix automatic refresh delay for new animations
**Current Behavior**: Animations create successfully but don't appear in Studio immediately
**Acceptable Solution**: Reduce 5-10 second delay to under 1 second
**NON-NEGOTIABLE**: Must not break animation creation functionality

### What We Know Works:
- ✅ Animation creation via MCP server
- ✅ Auto-sync to Root.tsx
- ✅ Container restart fixes refresh (but not acceptable for external users)
- ✅ Sept 23rd baseline is stable when properly configured

### What Breaks The System:
- ❌ WATCHPACK_POLLING/WEBPACK_POLLING environment variables
- ❌ Complex webpack config files (remotion.config.ts)
- ❌ Wrong volume mount structure
- ❌ Multiple MCP processes accumulating

## 🚨 IMMEDIATE ACTIONS NEEDED

### 1. Fix Current Broken State:
```bash
# Clean Root.tsx to remove broken imports
# Only keep imports for animations that actually exist in assets/animations/
```

### 2. Verify Baseline Works:
```bash
# Test animation creation end-to-end
# Measure automatic refresh timing
# Confirm no component undefined errors
```

### 3. Research Refresh Solutions:
- Official webpack polling configuration (be very careful)
- File system event amplification
- MCP auto-refresh integration

## 📋 TECHNICAL INVESTIGATION FINDINGS

### Root Cause of Refresh Issue:
Docker volume mount file watching limitations - webpack doesn't detect Root.tsx changes immediately through volume mounts in WSL2/Docker environment.

### Process Management Issue:
Multiple MCP server processes accumulate over time, causing:
- Animation creation hanging
- Webpack HMR connection conflicts
- System degradation

**Solution Implemented**: Process cleanup in MCP server startup

### Volume Mount Structure:
- **Sept 23rd version**: Expects `/workspace` mount (works)
- **Current master**: Expects `/workspace/src` mount (different structure)

## 🎬 USER REQUIREMENTS

**User Statement**: "I won't stop!" - Automatic refresh MUST work like it did before
**User Priority**: Both working animation creation AND fast refresh
**User Constraint**: External users shouldn't need manual container restarts
**User Expectation**: Professional, seamless experience

## 📦 VERIFIED WORKING CONFIGURATION

**Git Commit**: b8359c3 (Sept 23rd)
**Docker Command**:
```bash
docker run -d --name clean-cut-mcp -p 6970:6970 -p 6971:6971 \
  -v "$(pwd)/clean-cut-exports:/workspace/out" \
  -v "$(pwd)/clean-cut-workspace:/workspace" \
  --restart unless-stopped clean-cut-mcp
```

**Critical Files Present**:
- start.js (container startup)
- mcp-server/dist/clean-stdio-server.js (MCP server)
- clean-cut-workspace/src/Root.tsx (needs cleanup)
- clean-cut-workspace/src/index.ts (entry point)

## 🔄 NEXT SESSION TASKS

### Priority 1: Fix Immediate Issues
1. Clean Root.tsx imports to match actual animation files
2. Verify all 15 baseline animations work in Studio
3. Test animation creation end-to-end

### Priority 2: Measure Baseline
1. Create test animation and time automatic refresh
2. Document exact refresh timing
3. Determine if delay is acceptable or needs improvement

### Priority 3: Conservative Improvements (ONLY if needed)
1. File system event amplification (touch multiple files)
2. Enhanced MCP auto-sync timing
3. Webpack polling (VERY carefully - research exact config)

## 🛡️ SAFETY RULES

**NEVER DO AGAIN**:
- Don't add complex webpack configs that break Studio startup
- Don't use non-standard environment variables (WATCHPACK_POLLING, etc.)
- Don't make multiple changes simultaneously
- Don't break working animation creation for refresh improvements

**ALWAYS DO**:
- Test each change individually
- Verify animation creation works after every modification
- Keep git restore points
- Preserve working functionality over perfect refresh timing

## 📋 VERIFICATION COMMANDS

```bash
# Check container status
docker ps | grep clean-cut-mcp

# Check Studio accessibility
curl -s http://localhost:6970 && echo "Studio accessible"

# Check animation files vs imports
ls clean-cut-workspace/src/assets/animations/
grep "import.*from.*animations" clean-cut-workspace/src/Root.tsx

# Test MCP connection
# Try creating a simple animation via Claude Desktop
```

## 🎬 SUCCESS CRITERIA

**Minimum Viable**: Animation creation works + refresh happens within 10 seconds
**Target Goal**: Animation creation works + refresh happens within 1-2 seconds
**Perfect State**: Animation creation works + immediate refresh (0 delay)

**CRITICAL**: Working animation creation is more valuable than perfect refresh timing. Never sacrifice core functionality for optimizations.

---

**Resume from this point**: Fix Root.tsx import mismatches, verify baseline works, then approach refresh timing improvements with extreme caution.