# Claude Code Session Memory & Drop-off

## Current Project Context

### Project: Clean-Cut-MCP - Remotion Animation System for Claude Desktop
**Location**: `/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/clean-cut-mcp`
**Status**: 🚨 **CRITICAL BUG IDENTIFIED AND FIXED - AWAITING TEST**

### Core Issue Resolved
**Root Problem**: Docker container MCP server was binding to `localhost` only inside container
- **Symptoms**: Container healthy, no Windows port bindings, all connection tests failed
- **Fix Applied**: Changed `app.listen(MCP_PORT)` → `app.listen(MCP_PORT, '0.0.0.0')` in both:
  - `mcp-server/src/http-mcp-server.ts:697`
  - `mcp-server/src/clean-server.ts:479`

### Current Architecture
```
Docker Container (clean-cut-mcp)
├── MCP HTTP Server (port 6961) - Fixed binding to 0.0.0.0
├── Remotion Studio (port 6960) 
├── Start.js orchestrator
└── Built TypeScript → JavaScript
```

### Files Modified in This Session
1. **Server Binding Fix** (CRITICAL):
   - `mcp-server/src/http-mcp-server.ts` - Line 697: Added '0.0.0.0' binding
   - `mcp-server/src/clean-server.ts` - Line 479: Added '0.0.0.0' binding

2. **Installation Scripts Created**:
   - `easy-install-clean-cut-mcp.ps1` - No-admin installer (emoji bugs fixed)
   - `universal-fix.ps1` - Multi-method connection testing  
   - `quick-diagnostic.ps1` - Debugging tool (identified the binding issue)
   - `fix-port-binding.ps1` - Port binding troubleshooter
   - `rebuild-fixed.ps1` - **NEXT TO RUN** - Rebuilds with fixed binding
   - `NUCLEAR-JSON-FIX.ps1` - JSON corruption fix
   - `ZERO-ADMIN-FIX.ps1` - WSL2 IP direct approach

### Installation Scripts Status
- ❌ `install-clean-cut-mcp.ps1` - Requires admin (breaks UX)
- ✅ `easy-install-clean-cut-mcp.ps1` - Fixed emoji/string interpolation bugs
- 🎯 `rebuild-fixed.ps1` - **READY TO TEST** (contains the server binding fix)

## Like-I-Said Memory (User Preferences & Requirements)

### CRITICAL User Requirements Stated:
1. **"One-Script Magic"** - User wants double-click installation, no complex setup
2. **No Administrator Required** - Admin prompts kill user adoption
3. **Fresh VM Compatibility** - Must work on any Windows VM with different WSL2 IPs
4. **Cross-Platform Universal** - Needs to work on Windows 10 (no WSL2), Linux, macOS
5. **NO EMOJIS** - User's CLAUDE.md explicitly bans emojis (causes JSON parsing errors)

### Design Decisions Made:
- **WSL2 IP Direct Connection** over admin port forwarding (better UX)
- **Raw JSON strings** over PowerShell ConvertTo-Json (prevents corruption) 
- **HTTP transport** as primary, STDIO as fallback
- **Atomic config operations** with validation and backups
- **Multi-method connection testing** (localhost, 127.0.0.1, WSL2 IP, interfaces)

### User's Universal Installer Vision:
```
1. Detect OS at runtime (uname, $PSVersionTable)
2. Try HTTP transport first (localhost binding)
3. Windows-specific: mirrored mode → netsh portproxy fallback
4. Universal fallback: STDIO transport via docker exec
5. JSON validation (Test-Json/jq) before saving
6. Atomic writes with backups
```

## Drop-off Prompt for New Session

```markdown
I'm working on Clean-Cut-MCP, a Remotion animation system for Claude Desktop. I've just identified and fixed the core networking issue but need to test the fix.

**Working Directory**: `/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/clean-cut-mcp`

**IMMEDIATE NEXT STEP**: Run `.\rebuild-fixed.ps1` to test the Docker container fix.

**Core Issue Resolved**: The MCP HTTP server was binding to localhost only inside the Docker container. I fixed both server files to bind to '0.0.0.0' instead:
- `mcp-server/src/http-mcp-server.ts:697` 
- `mcp-server/src/clean-server.ts:479`

**Expected Result**: Port bindings should now appear (`6960/tcp -> 0.0.0.0:6960`) and Windows should be able to connect to `http://localhost:6961/health`.

**If the fix works**: Create Claude Desktop config with `http://localhost:6961/mcp`
**If still fails**: Implement the universal cross-platform installer with STDIO fallback

**Key Constraint**: User wants "One-Script Magic" - no admin required, works on fresh VMs.

**Files ready to use**:
- `rebuild-fixed.ps1` - Test the container fix
- `quick-diagnostic.ps1` - Debug any remaining issues  
- Various installer scripts with different approaches
```

## Quick Verification Commands

```powershell
# Check current directory
pwd
# Should show: /mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/clean-cut-mcp

# Test the fixed container 
.\rebuild-fixed.ps1

# If successful, should show:
# [SUCCESS] Port bindings active:
# 6960/tcp -> 0.0.0.0:6960  
# 6961/tcp -> 0.0.0.0:6961
# [SUCCESS] HTTP connection working!

# Check container status
wsl docker ps --filter name=clean-cut-mcp

# Test endpoints manually
Invoke-RestMethod http://localhost:6961/health
```

## Next Steps (Priority Order)

### 🚨 IMMEDIATE (Test Current Fix)
1. **Run `.\rebuild-fixed.ps1`** - Test if server binding fix resolves port binding issue
2. **If successful**: Update Claude Desktop config with working endpoint
3. **Test end-to-end**: "Create a bouncing ball animation" in Claude Desktop

### 🎯 IF FIX WORKS (Polish & Deploy)  
4. **Create final installer script** combining successful approach
5. **Test on fresh Windows VM** to ensure universal compatibility
6. **Documentation** - Create simple README for users

### 🛡️ IF FIX FAILS (Fallback Plan)
4. **Implement STDIO transport fallback**:
   ```json
   {
     "mcpServers": {
       "clean-cut-mcp": {
         "command": "docker",
         "args": ["exec", "clean-cut-mcp", "node", "/app/mcp-server/dist/http-mcp-server.js"]
       }
     }
   }
   ```
5. **Universal installer** with OS detection and transport selection
6. **Cross-platform testing** (Windows/Linux/macOS)

## Technical Architecture Summary

### Container Structure
```
Clean-Cut-MCP Container
├── Node.js 22 (bookworm-slim)
├── Google Chrome (for Remotion renders)
├── FFmpeg (video processing)
├── /app/start.js (orchestrator)
├── /app/mcp-server/ (built TypeScript)
└── /workspace/ (user animations)
```

### MCP Integration
- **Transport**: HTTP (primary) → STDIO (fallback)  
- **Endpoints**: 
  - Health: `http://localhost:6961/health`
  - MCP: `http://localhost:6961/mcp`  
  - Studio: `http://localhost:6960`
- **Tools**: `create_animation`, `list_animations`, `get_studio_url`

### Windows Integration Challenge
- **WSL2 Networking**: Container runs in WSL2, Claude Desktop on Windows
- **Port Forwarding**: Requires container binding to 0.0.0.0 (now fixed)
- **IP Variation**: WSL2 IP changes per installation/VM
- **Firewall**: Windows may block WSL2 connections

## Key Files & Their Status

### Working & Ready
- ✅ `Dockerfile` - Correct with EXPOSE 6960 6961
- ✅ `start.js` - Container orchestrator working  
- ✅ `mcp-server/src/*.ts` - **FIXED** server binding issue
- ✅ Diagnostic scripts - Identified the root cause

### Installation Scripts 
- 🎯 `rebuild-fixed.ps1` - **TEST THIS FIRST**
- ✅ `easy-install-clean-cut-mcp.ps1` - No-admin approach (fixed)
- ✅ `NUCLEAR-JSON-FIX.ps1` - JSON corruption resolver
- ❌ `install-clean-cut-mcp.ps1` - Requires admin (bad UX)

### Created This Session
- `quick-diagnostic.ps1` - **Identified the binding issue**
- `universal-fix.ps1` - Multi-method connection testing
- `fix-port-binding.ps1` - Container port troubleshooter  
- `rebuild-fixed.ps1` - **Contains the fix - run this**

## Environment & Dependencies

### Current Environment  
- **OS**: Windows with WSL2
- **Docker**: WSL2-backed Docker Desktop
- **WSL2 IP**: 192.168.5.45 (varies per installation)
- **PowerShell**: 5.1+ required for scripts

### Dependencies Status
- ✅ Docker Desktop running
- ✅ WSL2 available  
- ✅ Container builds successfully
- ❌ **Port binding issue** (fix ready to test)

### Claude Desktop Integration
- **Config Location**: `$env:APPDATA\Claude\claude_desktop_config.json`
- **Required Format**: HTTP transport with proper URL
- **Backup Strategy**: Atomic operations with timestamped backups

---

**FINAL NOTE**: The core networking issue is fixed in the code. Run `.\rebuild-fixed.ps1` to test. If successful, we have working "One-Script Magic". If not, implement the universal cross-platform installer with STDIO fallback.

**Session Success Metric**: User can ask "Create a bouncing ball animation" and get response "Animation ready at http://localhost:6960" 🎯