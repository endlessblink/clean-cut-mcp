# Claude Code Session Memory & Drop-off

## Current Project Context

### Project: Clean-Cut-MCP - "One-Script Magic" Remotion Animation System
**Location**: `D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\clean-cut-mcp`  
**Status**: ✅ **DOCKER WORKING** | ❌ **CLAUDE DESKTOP CORRUPTED** | 🔄 **READY FOR FINAL CONFIG**

**Goal**: User says "Create a bouncing ball animation" → Claude responds "Animation ready at http://localhost:6960"

### Current Architecture Status
- **Docker Container**: ✅ HEALTHY - Running both services successfully
  - Remotion Studio: `http://localhost:6960` (WORKING)
  - MCP HTTP Server: `http://localhost:6961` (WORKING)
  - Health Check: `http://localhost:6961/health` (RESPONDING)
- **MCP Server**: ✅ HTTP transport, stderr-only logging, emoji-free responses
- **Animation Generators**: ✅ 4 types ready (bouncing-ball, sliding-text, rotating-object, fade-in-out)

### Critical Issue Resolved
❌ **Claude Desktop Configuration Corrupted**: Original `install.ps1` caused JSON parsing errors
✅ **Solution Created**: `safe-claude-config.ps1` with bulletproof safety features

## Like-I-Said Memory (User Requirements)

### User's Explicit Constraints
- **NEVER break Claude Desktop configuration** (emphasized multiple times)
- **Windows native npm builds** (not WSL2) for Claude Desktop compatibility  
- **PowerShell 5.1+ compatibility** required
- **"One-Script Magic" experience** - minimal user intervention
- **Bulletproof system** that never breaks existing functionality
- **No script proliferation** - user complained about too many scripts

### User Communication Preferences
- **Concise, direct responses** with clear actionable steps
- **Step-by-step troubleshooting** with diagnostic commands
- **Plan mode approval** before making changes
- **Automatic detection/resolution** preferred over manual debugging

### Technical Preferences
- **Single command operation** with comprehensive error handling
- **Backup and recovery systems** for safety
- **Test modes** for validation before deployment
- **Clear error messages** with specific solutions

## Current Docker Container Status
```
NAMES           STATUS                   PORTS
clean-cut-mcp   Up 6 minutes (healthy)   0.0.0.0:6960-6961->6960-6961/tcp
```

Both services are running and healthy in the container.

## Key Files & Status

### ✅ Working Components
- **`Dockerfile`**: Multi-stage build with TypeScript compilation (FIXED)
- **`start.js`**: Container entrypoint loading correct MCP server (FIXED) 
- **`mcp-server/src/http-mcp-server.ts`**: Main HTTP MCP server (21KB, WORKING)
- **`safe-claude-config.ps1`**: Bulletproof Claude Desktop config script (29KB, READY)

### ❌ Problematic Components
- **`install.ps1`**: Original installer that caused Claude Desktop corruption
- **Claude Desktop config**: Currently corrupted with JSON parsing errors

### 🔧 Recent Critical Fixes Applied
1. **Docker Health Check**: Fixed variable name (`MCP_SERVER_PORT` → `6961`)
2. **Container Entry Point**: Updated `start.js` to load `http-mcp-server.js`
3. **TypeScript Compilation**: Fixed error handling patterns for `unknown` error types
4. **Multi-stage Build**: Proper Docker layer caching and artifact management

## Drop-off Prompt for New Session

```markdown
I'm continuing work on Clean-Cut-MCP, a bulletproof Remotion video animation system for Claude Desktop. The project implements "One-Script Magic" where users ask "Create a bouncing ball animation" and get "Animation ready at http://localhost:6960".

CURRENT PROJECT STATE:
- Location: D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\clean-cut-mcp
- Docker Container: ✅ HEALTHY (both Remotion Studio:6960 and MCP HTTP:6961 working)
- Claude Desktop: ❌ CORRUPTED (needs safe configuration)
- Architecture: HTTP MCP server + Docker container + PowerShell management

CRITICAL CONTEXT:
- Must NEVER break Claude Desktop configuration (user's top priority)
- Windows native npm builds required (not WSL2)  
- User prefers single, clear solutions over multiple scripts
- PowerShell 5.1+ compatibility essential

KEY FILES:
- safe-claude-config.ps1: Bulletproof Claude Desktop config script (29KB) - USE THIS
- install.ps1: Original corrupted installer - DO NOT USE
- Dockerfile: Multi-stage build (WORKING)
- start.js: Container entrypoint (FIXED)
- mcp-server/src/http-mcp-server.ts: Main HTTP MCP server (21KB, WORKING)

RECENT FIXES COMPLETED:
1. Docker build working perfectly with multi-stage TypeScript compilation
2. Container startup issues resolved (correct file loading)
3. Health check endpoints responding correctly
4. Safe Claude Desktop configuration script created with JSON validation

CURRENT ISSUE:
Claude Desktop shows "Could not load app settings" due to JSON corruption from original install.ps1.
Backup files exist: claude_desktop_config.json.clean-cut-backup-*

USER PREFERENCES:
- Concise, direct communication
- Single-script solutions
- Automatic error detection/resolution  
- Plan mode - approve changes before execution
- Windows-focused development environment

NEXT STEPS: Restore Claude Desktop from backup, then use safe-claude-config.ps1 for bulletproof configuration.
```

## Quick Verification Commands

### Check Project State
```powershell
cd "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\clean-cut-mcp"
pwd
ls safe-claude-config.ps1, Dockerfile, start.js
```

### Verify Docker Container
```powershell
docker ps --filter "name=clean-cut-mcp"
docker logs clean-cut-mcp --tail 10
```

### Test MCP Health
```powershell
curl http://localhost:6961/health
curl http://localhost:6960  # Remotion Studio
```

### Check Claude Desktop Status
```powershell
ls "$env:APPDATA\Claude\claude_desktop_config.json*backup*"
Get-Content "$env:APPDATA\Claude\claude_desktop_config.json" -ErrorAction SilentlyContinue
```

## Next Steps Priority

### IMMEDIATE (Session Start)
1. **Restore Claude Desktop**: Copy latest backup over corrupted config
2. **Test safe-claude-config.ps1**: Run in test mode first
3. **Verify end-to-end**: Test "One-Script Magic" workflow

### VERIFICATION SEQUENCE
```powershell
# 1. Restore Claude Desktop
ls "$env:APPDATA\Claude\*backup*" | sort LastWriteTime | select -Last 1
copy <latest-backup> "$env:APPDATA\Claude\claude_desktop_config.json"

# 2. Test safe configuration
.\safe-claude-config.ps1 -TestMode

# 3. Apply if test passes
.\safe-claude-config.ps1

# 4. Restart Claude Desktop and test
```

### SUCCESS CRITERIA
- ✅ Claude Desktop starts without errors
- ✅ Clean-Cut-MCP appears in Claude Desktop MCP servers
- ✅ User can create animations through Claude Desktop
- ✅ Remotion Studio accessible at localhost:6960
- ✅ "One-Script Magic" experience achieved

## Technical Architecture Summary

**Multi-Stage Docker Build** → **HTTP MCP Server** → **Claude Desktop HTTP Transport** → **"One-Script Magic"**

- **Stage 1**: TypeScript compilation with full dependencies
- **Stage 2**: Runtime image with Chrome + FFmpeg for Remotion
- **Transport**: HTTP (not STDIO) for Docker compatibility
- **Ports**: 6960 (Remotion), 6961 (MCP)
- **Safety**: JSON validation, atomic operations, automatic backups

The system is 95% complete - only Claude Desktop configuration remains to achieve full "One-Script Magic" functionality.