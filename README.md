# Clean-Cut-MCP - One-Script Magic Video Animation

**Goal**: User asks "Create a bouncing ball animation" → Claude responds "Animation ready at http://localhost:6960"

Clean-Cut-MCP is a bulletproof Remotion video animation system for Claude Desktop that never breaks existing configurations and provides reliable "One-Script Magic" video generation.

## Features

- **[CRITICAL]** HTTP MCP transport (Docker compatible)
- **[CRITICAL]** Stderr-only logging (no JSON-RPC pollution)
- **[CRITICAL]** Emoji-free responses (no JSON parsing errors)
- **[SAFE]** Bulletproof Claude Desktop configuration (never overwrites existing servers)
- **[MAGIC]** 4 animation types: bouncing-ball, sliding-text, rotating-object, fade-in-out
- **[READY]** Docker containerized with multi-stage build

## Quick Start

### Prerequisites
- **Windows 10/11** with **WSL2 enabled** ⚠️
- **Docker Desktop** installed with WSL2 backend
- **PowerShell 5.1** or higher
- **Claude Desktop** installed

> **🚨 IMPORTANT**: WSL2 is **required** for Docker Desktop on Windows. Most fresh Windows installations need WSL2 setup first.

### WSL2 Quick Setup
```powershell
# Run as Administrator in PowerShell
wsl --install

# Restart computer when prompted, then install Docker Desktop
```

📖 **Complete Setup Guide**: See [WINDOWS-INSTALLATION-GUIDE.md](WINDOWS-INSTALLATION-GUIDE.md) for detailed instructions.

## 🚀 Installation Methods

### Method 1: Docker Hub Installation (Recommended)
**Zero build time - pre-built images from Docker Hub:**

```powershell
# Download installer
curl -o install-dockerhub.ps1 https://raw.githubusercontent.com/endlessblink/clean-cut-mcp/master/install-dockerhub.ps1

# Run installer (includes WSL2 detection)
.\install-dockerhub.ps1
```

**Benefits**:
- ⚡ **30 seconds** vs 5+ minutes (no build required)
- 🎯 **Zero dependencies** except Docker Desktop
- ✅ **VM-perfect** for testing environments
- 🔒 **Version-locked** consistency

### Method 2: Build from Source
**Traditional build approach:**

### Step 1: Build the Container

**IMPORTANT**: Build MUST be done on Windows native npm (not WSL2) for Claude Desktop compatibility.

#### **Option A: Automatic Build (Recommended)**
Run the installer which will offer to build automatically:

```powershell
cd "D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\clean-cut-mcp"
.\\install.ps1
# When prompted about missing image, type 'y' to build automatically
```

#### **Option B: Manual Build**
If you encounter Docker build errors (common on Windows):

```powershell
# 1. Clean build environment first (CRITICAL for Windows)
.\\cleanup.ps1

# 2. Build the Docker image
docker build -t clean-cut-mcp .
```

#### **Common Build Issues & Solutions**

**Issue**: `archive/tar: unknown file mode ?rwxr-xr-x`
```powershell
# SOLUTION: Clean node_modules with Windows-specific permissions
.\\cleanup.ps1 -Force
docker build -t clean-cut-mcp .
```

**Issue**: `npm ENOENT` or missing dependencies
```powershell
# SOLUTION: Ensure package.json files exist and network is available  
ls package.json
ls mcp-server/package.json
docker build -t clean-cut-mcp .
```

**Issue**: `no space left on device`
```powershell
# SOLUTION: Clean Docker system
docker system prune -f
docker build -t clean-cut-mcp .
```

### Step 2: Install and Configure

Run the bulletproof installer:

```powershell
# Test installation first (recommended)
.\\install.ps1 -TestMode

# Full installation
.\\install.ps1
```

The installer will:
- [SAFE] Backup your existing Claude Desktop configuration
- [SAFE] Merge Clean-Cut-MCP without overwriting existing MCP servers
- [SAFE] Test Docker container startup and health
- [SAFE] Rollback automatically if any step fails

### Step 3: Test the Magic

1. **Restart Claude Desktop** (required to load new configuration)
2. **Ask Claude**: "Create a bouncing ball animation"
3. **Expect**: "Animation ready at http://localhost:6960"

## Architecture

```
User → Claude Desktop → Clean-Cut-MCP (HTTP) → Docker Container → Remotion Studio
```

- **MCP Server**: HTTP transport at `http://localhost:6961/mcp`
- **Remotion Studio**: Visual editor at `http://localhost:6960`
- **Health Check**: Status endpoint at `http://localhost:6961/health`

## Animation Types

| Type | Description | Use Case |
|------|-------------|----------|
| `bouncing-ball` | Physics-based bouncing ball with horizontal movement | Demonstrations, loading screens |
| `sliding-text` | Text that slides in from left, pauses, slides out right | Titles, announcements |
| `rotating-object` | Rotating and scaling geometric shape with text | Logos, branding |
| `fade-in-out` | Text that fades in, stays visible, then fades out | Subtle presentations |

## MCP Tools

### create_animation
```typescript
{
  type: 'bouncing-ball' | 'sliding-text' | 'rotating-object' | 'fade-in-out',
  title?: string,           // Text to display
  duration?: number,        // Duration in seconds (default: 3)
  fps?: number,            // Frames per second (default: 30)
  width?: number,          // Video width (default: 1920)
  height?: number,         // Video height (default: 1080)
  backgroundColor?: string  // Background color (default: '#000000')
}
```

### list_animations
Lists all rendered video files in the exports directory.

### get_studio_url
Returns the URL for Remotion Studio visual editor.

## Safety Features

### Claude Desktop Configuration Safety
- **NEVER** overwrites existing MCP servers
- **ALWAYS** creates timestamped backups
- **ALWAYS** validates JSON before saving
- **ALWAYS** uses full Docker paths with escaped backslashes
- **ALWAYS** rolls back on failure

### MCP Server Safety
- **STDERR ONLY** logging (no stdout pollution that breaks JSON-RPC)
- **EMOJI-FREE** tool responses (no "Unexpected token" JSON parsing errors)
- **HTTP TRANSPORT** (Docker compatible, not STDIO)
- **GRACEFUL ERRORS** with proper error handling and cleanup

### Docker Safety
- **HEALTH CHECKS** built-in for container orchestration
- **PROPER PORTS** exposed (6960 for Studio, 6961 for MCP)
- **VOLUME MOUNTS** for persistent exports and data
- **MULTI-STAGE BUILD** optimized for production

## Directory Structure

```
clean-cut-mcp/
├── mcp-server/
│   ├── src/
│   │   └── http-mcp-server.ts      # Main HTTP MCP server
│   ├── dist/                       # Compiled JavaScript
│   └── package.json
├── src/                            # Remotion components (generated)
├── exports/                        # Rendered videos
├── Dockerfile                      # Multi-stage container build
├── install.ps1                     # Bulletproof installer
├── package.json                    # Root Remotion configuration
└── README.md                       # This file
```

## Troubleshooting

### **Docker Build Issues (Most Common)**

**Problem**: "Docker build successful but image not found"
```powershell
# SOLUTION: False positive build detection fixed
# The installer now verifies images actually exist after build
# If build appears successful but image is missing:
.\\cleanup.ps1 -Force
docker build -t clean-cut-mcp . --no-cache
docker images clean-cut-mcp  # Verify image exists
```

**Problem**: `archive/tar: unknown file mode ?rwxr-xr-x`
```powershell
# SOLUTION: Windows file permission conflict  
.\\cleanup.ps1 -Force
docker build -t clean-cut-mcp .
# Installer will auto-retry with cleanup
```

**Problem**: Build hangs or fails with npm errors
```powershell
# SOLUTION: Clean environment and retry with verification
.\\cleanup.ps1 -Force  
docker build -t clean-cut-mcp . --no-cache
docker images clean-cut-mcp  # Must show image exists
```

**Problem**: Build reports success but container won't run
```powershell
# SOLUTION: Verify image integrity
docker images clean-cut-mcp                    # Check image exists
docker inspect clean-cut-mcp                   # Check image metadata  
docker create --name test-clean-cut clean-cut-mcp  # Test image can create containers
docker rm test-clean-cut                       # Cleanup test
```

### **Installation Issues**

**Problem**: "PowerShell parameter AsHashtable not found"
**Solution**: ✅ **FIXED** - Installer now works on PowerShell 5.1+

**Problem**: "Docker image not found" 
**Solution**: ✅ **FIXED** - Installer offers automatic build with proper verification

**Problem**: "Build successful but image missing"
**Solution**: ✅ **FIXED** - Installer now verifies images actually exist after build

### **Runtime Issues**

### "Cannot connect to MCP server"
**Cause**: JSON-RPC stdout pollution or emoji JSON parsing errors
**Solution**: ✅ **FIXED** - Clean-Cut-MCP uses stderr-only logging and emoji-free responses

### "Docker container won't start"
**Check**:
```powershell
docker logs clean-cut-mcp
docker ps -a | findstr clean-cut-mcp

# Restart container
docker stop clean-cut-mcp
docker rm clean-cut-mcp
docker run -d --name clean-cut-mcp -p 6961:6961 -p 6960:6960 --restart unless-stopped clean-cut-mcp
```

### "Claude Desktop not loading configuration"
**Check**:
1. Configuration file location: `%APPDATA%\\Claude\\claude_desktop_config.json`
2. JSON syntax validation
3. Restart Claude Desktop after configuration changes

### "Health check fails"
**Test endpoints**:
```powershell
# Health check
curl http://localhost:6961/health

# Status
curl http://localhost:6961/status

# MCP tools list
curl -X POST http://localhost:6961/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### **Emergency Recovery**

If anything goes wrong, restore your Claude Desktop configuration:
```powershell
# Find your backup (installer creates timestamped backups)
ls "$env:APPDATA\\Claude\\claude_desktop_config.json.clean-cut-backup-*"

# Restore the backup
copy "$env:APPDATA\\Claude\\claude_desktop_config.json.clean-cut-backup-YYYYMMDD-HHMMSS" "$env:APPDATA\\Claude\\claude_desktop_config.json"
```

## Development

### Build MCP Server
```powershell
cd mcp-server
npm install
npm run build
```

### Test Locally (without Docker)
```powershell
cd mcp-server
npm run start
```

### Build Docker Image
```powershell
docker build -t clean-cut-mcp .
```

### Run Container Manually
```powershell
docker run -d --name clean-cut-mcp -p 6961:6961 -p 6960:6960 clean-cut-mcp
```

## Configuration Files

### Claude Desktop Config (Auto-Generated)
```json
{
  "mcpServers": {
    "clean-cut-mcp": {
      "url": "http://localhost:6961/mcp",
      "description": "Clean-Cut-MCP - One-Script Magic video animation server",
      "capabilities": ["tools"]
    }
  }
}
```

### Docker Environment Variables
- `NODE_ENV=production`
- `DOCKER_CONTAINER=true` 
- `MCP_SERVER_PORT=6961`
- `REMOTION_STUDIO_PORT=6960`

## Why Clean-Cut-MCP?

This project exists because the original `rough-cuts-mcp` had:
- Container name conflicts
- JSON-RPC pollution from logs  
- Corrupted Claude Desktop configs
- Complex installation failures
- Emoji characters breaking JSON parsing

**Clean-Cut-MCP must be bulletproof and never break anything.**

## Success Criteria

- [SUCCESS] User asks "Create a bouncing ball animation"
- [SUCCESS] Claude responds "Animation ready at http://localhost:6960" 
- [SUCCESS] No Claude Desktop connection errors
- [SUCCESS] No JSON parsing errors
- [SUCCESS] Existing MCP servers remain untouched
- [SUCCESS] Automatic rollback on any failure

## License

MIT License - Build amazing video animations with Claude Desktop!