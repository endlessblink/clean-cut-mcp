# CLEAN-CUT-MCP - Claude Desktop Instructions

## 🚨 CRITICAL: Proven Claude Desktop Configuration Safety Rules

**NEVER** break Claude Desktop configuration again. These rules are based on validated research:

# ALWAYS, AND I MEAN ALWAYSSSSSS CHECK EVERYTHING BEFORE SAYING IT IS WORKING!!!!!!
# NEVER EVER BUILD THE CONTAINER / RUN THE SCRIPTS YOURSELF, GIVE THE USER CLEAR INSTRUCTIONS INSTEAD!!!!
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
User asks: "Create a bouncing ball animation" → Claude responds: "Animation ready at http://localhost:6960"

## 🏗️ ARCHITECTURE: Docker + MCP + Remotion
- **MCP Server**: STDIO transport in Docker container
- **Container Name**: `clean-cut-mcp` (unique, no conflicts)
- **Ports**: 6960 (Remotion Studio)  
- **Tools**: `create_animation`, `list_animations`, `get_studio_url`
- **Animations**: bouncing-ball, sliding-text, rotating-object, fade-in-out

## 🔧 LOGGING REQUIREMENTS:
- **NEVER** use `console.log()` in MCP server (pollutes JSON-RPC stdout)
- **ALWAYS** use `console.error()` for logs (stderr only)
- **RESULT**: Clean JSON-RPC communication with Claude Desktop

## 📁 PROJECT STRUCTURE:
```
clean-cut-mcp/
├── src/                    # MCP server source
├── Dockerfile              # Container definition
├── package.json            # Dependencies
├── install.ps1             # Bulletproof installer
└── CLAUDE.md               # This file
```

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

## 🚨 NEVER FORGET:
This project exists because the original `rough-cuts-mcp` had:
- Container name conflicts
- JSON-RPC pollution from logs
- Corrupted Claude Desktop configs
- Complex installation failures

**Clean-Cut-MCP must be bulletproof and never break anything.**


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
NEVER automatically run Docker builds. User wants to control when builds happen.
When Docker changes are made, STOP and let user run: `docker build -t rough-cuts-test .`