# CLEAN-CUT-MCP - Claude Desktop Instructions

## 📋 PRIME BUILD DOCUMENTATION (v2.0.0 - TRUE AI SYSTEM)

**Build Date**: September 12, 2025  
**Status**: WORKING - TRUE AI Code Generation System  
**Ports**: 6970 (Remotion Studio), 6971 (MCP HTTP - Reserved)  
**Transport**: STDIO via Docker exec (Production-Ready)  

### 🎯 VALIDATED COMPONENTS:
- **Docker Container**: `clean-cut-mcp` - Cross-platform, working
- **MCP Server**: `clean-stdio-server.ts` - Compiled successfully in container
- **TRUE AI Tools**: `create_animation`, `update_composition`, `get_studio_url`, `get_export_directory`
- **Remotion Studio**: Accessible at http://localhost:6970
- **Video Export**: Persistent volume `/workspace/out` ↔ `./clean-cut-exports`
- **Claude Desktop Integration**: STDIO transport via docker exec command

### 🏗️ WORKING ARCHITECTURE:
```
Claude Desktop (Windows) → docker exec → clean-cut-mcp container → Remotion Studio (6970)
                             ↓
                        TRUE AI Tools Execute Claude's Generated React/Remotion Code
                             ↓
                        /workspace/out → ./clean-cut-exports (Persistent Videos)
```

### ✅ RESOLVED ISSUES:
- **Remotion Component Error**: "A value of `undefined` was passed to the `component` prop" - FIXED ✅
- **Root Cause**: Import/Export mismatch + filter logic bug in updateRootTsx function
- **Resolution**: Updated component export pattern + fixed filter logic for any component names
- **Status**: Fully operational - Component registration working correctly

### 🛠️ TROUBLESHOOTING GUIDE:

**Component Registration Errors**:
- **Symptom**: "A value of `undefined` was passed to the `component` prop"
- **Cause**: Component export/import mismatch or filter logic excluding component names
- **Solution**: Ensure components use named exports: `export { ComponentName };`

**MCP Server Not Responding**:
- **Test**: `curl -I http://localhost:6970` (should return 200 OK for Remotion Studio)
- **Container Check**: `docker ps | grep clean-cut-mcp` (should show "Up" status)
- **Logs**: `docker logs clean-cut-mcp` (check for startup errors)

**Claude Desktop Connection Issues**:
- **Config Path**: Verify docker exec command path in claude_desktop_config.json
- **Container Name**: Must be exactly "clean-cut-mcp" (unique, no conflicts)
- **STDIO Transport**: Use docker exec, not direct HTTP connection

## 🚨 CRITICAL: Proven Claude Desktop Configuration Safety Rules

**NEVER** break Claude Desktop configuration again. These rules are based on validated research:

# ALWAYS, AND I MEAN ALWAYSSSSSS CHECK EVERYTHING BEFORE SAYING IT IS WORKING!!!!!!
# We have to have ONE SCRIPT that installs everything flawlessly, E2E. Nothing else is acceptable!!!!!!
# ALWAYS VALIDATE WHAT YOU ARE NOT SURE ABOUT OR NO KNOW WITH ONLINE RESEARCH


### ✅ SAFE CONFIGURATION PRACTICES:
- **ALWAYS** use full Docker path: `"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe"`
- **ALWAYS** escape backslashes: `C:\\Users\\name` not `C:\Users\name`
- **ALWAYS** backup existing config before changes
- **NEVER** overwrite existing MCP servers - merge safely
- **ALWAYS** validate JSON syntax before writing
- **ALWAYS** use unique container name: `clean-cut-mcp`

### ❌ WAYS TO BREAK CLAUDE DESKTOP:
1. **Wrong Command Path**: Using `docker` instead of full path → "Cannot connect to MCP server"
2. **Wrong File Name**: Writing to `config.json` instead of `claude_desktop_config.json`
3. **JSON Corruption**: PowerShell `ConvertTo-Json` malformed output
4. **Log Pollution**: Using `console.log()` in MCP server → "Unexpected token" errors
5. **Container Conflicts**: Using existing container names → Docker daemon conflicts

## 🎯 PROJECT GOAL: "One-Script Magic"
User asks: "Create a bouncing ball animation" → Claude responds: "Animation ready at http://localhost:6970"
User exports video from Remotion Studio → Video automatically appears in `./clean-cut-exports` folder

## 🏗️ ARCHITECTURE: Cross-Platform Docker + MCP + Remotion
- **Docker Container**: Cross-platform design - works on Windows Docker Desktop OR WSL2 Docker
- **MCP Server**: HTTP transport in Docker container (NOT STDIO for Docker compatibility)
- **Container Name**: `clean-cut-mcp` (unique, no conflicts)
- **Ports**: 6970 (Remotion Studio), 6971 (MCP HTTP Server)
- **Tools**: `create_animation`, `list_animations`, `get_studio_url`, `get_export_directory`
- **Animations**: bouncing-ball, sliding-text, rotating-object, fade-in-out
- **Networking**: Container exposes localhost:6970-6971 to Windows for Claude Desktop connection
- **Video Export**: Docker volume mount `/workspace/out` → `./clean-cut-exports` (cross-platform)

## 🔧 LOGGING REQUIREMENTS:
- **NEVER** use `console.log()` in MCP server (pollutes JSON-RPC stdout)
- **ALWAYS** use `console.error()` for logs (stderr only)
- **RESULT**: Clean JSON-RPC communication with Claude Desktop

## 📁 PROJECT STRUCTURE:
```
clean-cut-mcp/
├── src/                    # MCP server source
├── Dockerfile              # Container definition
├── docker-compose.yml      # Cross-platform Docker Compose setup
├── package.json            # Dependencies
├── install.ps1             # Bulletproof installer
├── clean-cut-exports/      # Video export directory (created automatically)
└── CLAUDE.md               # This file
```

## 🎬 VIDEO EXPORT SYSTEM: Cross-Platform External Access

### How It Works
Clean-Cut-MCP uses Docker volume mounting to provide seamless video export access across all platforms:

```
Container: /workspace/out ←→ Host: ./clean-cut-exports
```

### Export Workflow
1. **Create Animation**: Ask Claude to create an animation (bouncing ball, sliding text, etc.)
2. **Open Remotion Studio**: Navigate to http://localhost:6970
3. **Export Video**: Use Remotion Studio's export functionality
4. **Find Your Video**: Ask Claude to use `open_export_directory` tool for instant access
5. **Alternative**: Check the `clean-cut-exports` folder in your project directory manually
6. **Done!**: Video is immediately accessible on your host system

### Cross-Platform Compatibility

**Windows (PowerShell Installer)**:
```powershell
.\install.ps1
# Creates and mounts: .\clean-cut-exports
```

**macOS/Linux (Docker Compose)**:
```bash
docker-compose up -d
# Creates and mounts: ./clean-cut-exports
```

**Manual Docker Run**:
```bash
# Windows
docker run -d --name clean-cut-mcp -p 6970:6970 -p 6971:6971 -v "%cd%/clean-cut-exports:/workspace/out" clean-cut-mcp

# macOS/Linux
docker run -d --name clean-cut-mcp -p 6970:6970 -p 6971:6971 -v "$(pwd)/clean-cut-exports:/workspace/out" clean-cut-mcp
```

### MCP Tools Available
- `get_export_directory` - Shows detailed export directory information and navigation instructions
- `open_export_directory` - Opens export directory in native file manager (Explorer, Finder, etc.)
- `create_animation` - Creates animations ready for export
- `list_animations` - Lists all available animations  
- `get_studio_url` - Gets Remotion Studio URL

### Technical Implementation
- **Volume Mount**: `/workspace/out` (container) ↔ `./clean-cut-exports` (host)
- **Auto-Creation**: Export directory created automatically with proper permissions
- **Path Conversion**: Windows paths automatically converted for Docker compatibility
- **Write Testing**: Directory write permissions validated during setup

## 🛡️ INSTALLATION SAFETY:
The PowerShell installer MUST:
1. Validate Docker installation first
2. Create backup of existing Claude config
3. Safely merge with existing MCP servers (preserve desktop-commander, etc.)
4. Use proper Windows paths with escaped backslashes
5. Test container startup before config changes
6. Automatic rollback if any step fails

## 🔄 DEVELOPMENT WORKFLOW:
1. Build container: `docker build -t clean-cut-mcp .`
2. Test standalone: `docker run -it clean-cut-mcp`
3. Test MCP: Run installer with `-TestMode`
4. Validate: Create animation end-to-end
5. Deploy: Full installation

## 🌐 NETWORKING TROUBLESHOOTING:
**WSL2 to Windows Connection Issues:**
- Container runs in WSL2 Docker but Windows Claude Desktop needs to connect
- WSL2 should auto-forward localhost:6970-6971 to Windows, but sometimes fails
- **Test from Windows PowerShell**: `Invoke-RestMethod http://localhost:6971/health`
- **If connection fails**: Use WSL2 IP address (get with `hostname -I` in WSL2)
- **Windows Firewall**: May block WSL2 port forwarding
- **Alternative**: Run `netsh interface portproxy` commands to force port forwarding

## 🚨 NEVER FORGET:
This project exists because the original `rough-cuts-mcp` had:
- Container name conflicts
- JSON-RPC pollution from logs
- Corrupted Claude Desktop configs
- Complex installation failures

**Clean-Cut-MCP must be bulletproof and never break anything.**
**Docker containers are cross-platform by design - don't move them between platforms.**


# CRITICAL: NO EMOJIS IN CODE - JSON PARSING ERRORS
NEVER use emoji characters in MCP server code, tool responses, or log messages.
These cause "Unexpected token" JSON parsing errors in Claude Desktop.

## BANNED EMOJIS - DO NOT USE
- ❌ NO cross marks - use [ERROR] instead
- ✅ NO checkmarks - use [OK] instead  
- 🚀 NO rockets - use [LAUNCH] instead
- 💡 NO lightbulbs - use [TIP] or [SOLUTION] instead
- 🔥 NO fire - use text like "CRITICAL:" or "HOT:" instead
- 🎯 NO targets - use [TARGET] or remove
- 📊 NO charts - use [STATS] instead
- ⚠️ NO warning signs - use [WARNING] instead
- 🚨 NO sirens - use [ALERT] instead
- 📹 NO cameras - use [VIDEO] instead
- 🛠️ NO tools - use [FIX] or [TOOLS] instead
- 🔧 NO wrenches - use [REPAIR] or [CONFIG] instead
- 📁 NO folders - use "Directory:" instead
- 🎬 NO clappers - use [VIDEO] or remove
- ANY OTHER EMOJI - Replace with appropriate text marker

# CRITICAL: LET USER BUILD DOCKER THEMSELVES
When Docker changes are made, STOP and let user run: `docker build -t rough-cuts-test .`